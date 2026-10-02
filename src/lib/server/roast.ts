import { createHash } from "node:crypto";
import { GoogleGenAI, Type } from "@google/genai";
import { createServerFn } from "@tanstack/react-start";
import { env } from "@/env";
import {
  getFallbackRoast,
  type RoastContext as LegacyRoastContext,
  type RoastPayload,
} from "../roast-fallbacks";
import { roastInputSchema, type UnifiedRoastInput } from "../roast-input";
import {
  type EvaluatedRoast,
  ROASTS,
  type RoastEvent,
  selectRoastFromCatalog,
} from "../roasts";
import { allowAiRequest } from "./ai-limit";
import { requestAiOrFallback } from "./ai-gate";
import { BoundedTtlCache } from "./bounded-cache";

const JSON_PREFIX_REGEX = /^```json\s*/i;
const JSON_SUFFIX_REGEX = /```$/i;
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 500;
const serverRoastCache = new BoundedTtlCache<EvaluatedRoast>(
  MAX_CACHE_ENTRIES,
  CACHE_TTL_MS
);
const inFlightRoasts = new Map<
  string,
  Promise<EvaluatedRoast | RoastPayload>
>();

function getSystemPrompt(isDiagnosis: boolean, locale: "pt" | "en") {
  const isEn = locale === "en";

  if (isDiagnosis) {
    if (isEn) {
      return (
        "You are the chief psychiatric roastmaster at the satirical bookstore 'Depois Eu Leio' (Dopamine Bookstore).\n" +
        "YOUR ROLE: Perform an elaborate, hilarious, dark, stand-up comedy psychological evaluation (clinical psychiatric report) of the user's book-hoarding neuroses (tsundoku, pretend spending, collecting heavy unread trophies).\n\n" +
        "MANDATORY REPORT STRUCTURE (separate sections with '\\n\\n'):\n" +
        "1. CLINICAL PRESENTATION: Cite their quantitative stats (books count, pages, fictional spend, hours) with biting commentary.\n" +
        "2. PSYCHO-BEHAVIORAL ANALYSIS: Ruthlessly expose their delusion of intellectual superiority through unread book hoarding and dopamine shopping.\n" +
        "3. MOCK PRESCRIPTION: A cynical medical prescription prescribing absurd behavioral therapy.\n\n" +
        "RULES:\n" +
        "- Length: 2 to 3 substantial, witty paragraphs (between 150 and 250 words total, up to 2,000 characters). Absolutely NOT a one-liner.\n" +
        "- Tone: Cynical literary psychiatrist meets stand-up roastmaster.\n" +
        "- ZERO EMOJIS.\n" +
        '- Respond STRICTLY with valid JSON: {"sfx": "CLINICAL REPORT", "msg": "paragraph 1\\n\\nparagraph 2\\n\\nparagraph 3"}. Do NOT include markdown code blocks.'
      );
    }
    return (
      "Você é o médico-chefe de psiquiatria literária e mestre de cerimônias da livraria satírica 'Depois Eu Leio'.\n" +
      "SEU PAPEL: Redigir um laudo psiquiátrico clínico hilário, aprofundado, sarcástico e ácido sobre os hábitos de acumulação compulsiva de livros do usuário (tsundoku, compras por dopamina, gastar dinheiro fictício, comprar calhamaços que nunca serão lidos só para impressionar visitas).\n\n" +
      "ESTRUTURA OBRIGATÓRIA DO LAUDO (separe as seções com '\\n\\n'):\n" +
      "1. QUADRO CLÍNICO: Cite os números reais fornecidos (quantidade de livros, total de páginas, horas estimadas de leitura, valor gasto, gênero e autor favorito) comentando a gravidade do caso com ironia afiada.\n" +
      "2. ANÁLISE COMPORTAMENTAL: Exponha impiedosamente a farsa psicológica do leitor (a ilusão de aprender por osmose tendo o livro na estante, o vício no clique de compra, o fetiche por lombadas bonitas).\n" +
      "3. PRESCRIÇÃO MÉDICA: Uma receita/prescrição psiquiátrica satírica e absurda (ex: confisco de marcadores de página, proibição de passar perto de sebos, tratamento de choque de ler uma página inteira sem pegar no celular).\n\n" +
      "REGRAS:\n" +
      "- Tamanho: 2 a 3 parágrafos densos e hilários (entre 150 e 250 palavras no total, NÃO faça apenas uma frase ou uma linha curta).\n" +
      "- Tom: Psiquiatra cínico e impiedoso em um roast de comédia stand-up.\n" +
      "- ZERO EMOJIS.\n" +
      '- Responda ESTRITAMENTE com JSON: {"sfx": "LAUDO CLÍNICO", "msg": "parágrafo 1\\n\\nparágrafo 2\\n\\nparágrafo 3"}. Sem crases de markdown.'
    );
  }

  if (isEn) {
    return (
      "You are the satirical comic roast engine for the bookstore 'Depois Eu Leio' (Dopamine Bookstore).\n" +
      "YOUR GOAL: Deliver a short, dry, witty, ironic comic toast reaction to the user's shopping actions.\n" +
      "TONE RULES:\n" +
      "1. MOCK THE HABIT (buying books and not reading, tsundoku, hoard delusion, dopamine clicks), NEVER the person (no insulting appearance, intelligence, or income).\n" +
      "2. CITE REAL QUANTITATIVE NUMBERS (exact pages, price, author, quantity) whenever provided.\n" +
      "3. DRY, AFFIRMATIVE IRONY. No hyperbole, no excessive exclamation marks, no ALL-CAPS in the sentence.\n" +
      "4. Address the user directly as 'you'.\n" +
      "5. ABSOLUTELY ZERO EMOJIS.\n" +
      "6. LENGTH LIMIT: Maximum 140 characters for 'msg'.\n" +
      "7. ONOMATOPOEIA ('sfx'): 1-2 words in ALL-CAPS ending in '!', '?!', or '.' (max 14 characters, e.g. 'KABOOM!', 'WHOA.', 'ALERT!').\n" +
      'Respond STRICTLY with JSON: {"sfx": "SFX_HERE", "msg": "concise joke under 140 characters here"}. No markdown formatting.'
    );
  }

  return (
    "Você é o motor de manifestações satíricas e toasts de roast da livraria 'Depois Eu Leio'.\n" +
    "SEU OBJETIVO: Reagir à ação do usuário com uma frase curta, irônica e engraçada baseada em dados reais.\n" +
    "REGRAS DE TOM:\n" +
    "1. ZOMBE DO HÁBITO (comprar e nunca ler, tsundoku, vício em dopamina de carrinho, desculpas para adiar), NUNCA da pessoa (nada de inteligência, aparência ou renda).\n" +
    "2. USE O NÚMERO REAL SEMPRE QUE HOUVER ({pages}, {total}, {author}, {n}). Se a frase servir para outro evento sem mudar nada, está genérica demais.\n" +
    "3. IRONIA SECA, frase afirmativa, sem excesso de exclamação, sem CAIXA-ALTA na frase.\n" +
    "4. Fale com 'você'.\n" +
    "5. ABSOLUTAMENTE ZERO EMOJIS.\n" +
    "6. LIMITE DE TAMANHO: Máximo de 140 caracteres para a mensagem ('msg').\n" +
    "7. ONOMATOPEIA ('sfx'): 1 a 2 palavras em CAIXA-ALTA terminando em '!', '?!', '.' ou '…' (máx. 14 caracteres, ex: 'CABRUM!', 'OPA.', 'ALERTA!').\n" +
    'Responda ESTRITAMENTE com um JSON: {"sfx": "ONOMATOPEIA", "msg": "sua piada com menos de 140 caracteres"}. Sem markdown nem texto extra.'
  );
}

function getFewShotExamples(event: string, locale: "pt" | "en"): string {
  const isEn = locale === "en";
  const matchedEventDef = (ROASTS as any)[event];
  if (!(matchedEventDef && matchedEventDef.rules?.length)) {
    return isEn
      ? "Examples:\n- sfx: 'WHOA.', msg: '1,024 pages. That’s not a book, it’s an address.'\n- sfx: 'CLICK!', msg: 'Added to cart. Dopamine released; book reading deferred.'\n- sfx: 'SURE.', msg: 'Buying another productivity book will surely fix your life.'"
      : "Exemplos:\n- sfx: 'CABRUM!', msg: '1.024 páginas. Isso não é um livro, é um endereço.'\n- sfx: 'PLIM!', msg: 'Colocado no carrinho. Dopamina liberada; leitura adiada.'\n- sfx: 'CLARO.', msg: 'Comprar outro livro de produtividade certamente resolverá sua vida.'";
  }

  const examples: string[] = [];
  for (const rule of matchedEventDef.rules) {
    for (const v of rule.variants) {
      const s = isEn ? v.sfx.en : v.sfx.pt;
      const m = isEn ? v.msg.en : v.msg.pt;
      examples.push(`- sfx: "${s}", msg: "${m}"`);
      if (examples.length >= 3) {
        break;
      }
    }
    if (examples.length >= 3) {
      break;
    }
  }

  return `Examples from catalogue:\n${examples.join("\n")}`;
}

function buildDiagnosisPrompt(data: UnifiedRoastInput): string {
  const isEn = data.locale === "en";
  const bookCount = data.cartCount || data.orderCount || 0;
  const totalPages = data.totalPages || data.pages || 0;
  const hours =
    data.hours || (totalPages > 0 ? Math.round(totalPages / 40) : 0);
  const pretendSpend = data.pretendSpend || data.total || 0;
  const favoriteGenre = data.favoriteGenre || (isEn ? "General" : "Geral");
  const favoriteAuthor =
    data.author || data.favoriteAuthor || (isEn ? "Varied" : "Variados");

  const contextData = {
    bookCount,
    estimatedReadingHours: hours,
    favoriteAuthor,
    favoriteGenre,
    pretendSpend,
    totalPages,
  };

  return isEn
    ? `Patient Literary Record: ${JSON.stringify(contextData)}\n\n` +
        "Write a hilarious, detailed, 2-3 paragraph clinical psychiatric diagnosis (around 150-250 words total, separated by '\\n\\n') structured as:\n" +
        "1. Clinical Presentation: Cite their exact stats (pages, book count, fictional money spent, reading hours) with biting dry humor.\n" +
        "2. Behavioral Analysis: Roast their compulsive tsundoku hoarding and the delusion of owning books to look smart.\n" +
        "3. Mock Prescription: A ridiculous, cynical medical prescription.\n\n" +
        "Do NOT write a short single line or punchline. Write a full, well-developed clinical report."
    : `Registro Clínico do Paciente: ${JSON.stringify(contextData)}\n\n` +
        "Escreva um laudo psiquiátrico clínico hilário, detalhado e completo em 2 a 3 parágrafos densos (cerca de 150 a 250 palavras no total, separados por '\\n\\n') estruturado em:\n" +
        "1. Quadro Clínico: Cite as estatísticas reais do paciente (total de páginas, número de livros, dinheiro fictício gasto, horas estimadas de leitura) com ironia ácida.\n" +
        "2. Análise Comportamental: Desmonte a neurose de acumulação (tsundoku), o vício em dopamina de compras e a fantasia de absorver livros por osmose na estante.\n" +
        "3. Prescrição Médica: Uma prescrição médica/psiquiátrica satírica e absurda recomendando um tratamento de choque.\n\n" +
        "NÃO escreva apenas uma linha curta ou frase de efeito. Escreva um laudo completo e substancial.";
}

function buildUserPrompt(data: UnifiedRoastInput): string {
  const isEn = data.locale === "en";
  const event = data.event;
  const examples = getFewShotExamples(event, data.locale);

  const contextData = {
    actionCount: data.searchCount || data.burstCount || 1,
    author: data.book?.author || data.author || data.favoriteAuthor,
    bookTitle: data.book?.title || data.bookTitle || data.title,
    cardBrand: data.cardBrand,
    cardLast4: data.cardLast4,
    deliveryStage: data.deliveryStage,
    event,
    intensityLevel: data.level || "normal",
    pages: data.book?.pages || data.pages || data.totalPages,
    payMethod: data.paymentMethod || data.pay,
    totalPrice: data.total || data.pretendSpend,
  };

  return isEn
    ? `Action Context: ${JSON.stringify(contextData)}\n\n${examples}\n\nGenerate one custom roast in matching tone under 140 chars.`
    : `Contexto da Ação: ${JSON.stringify(contextData)}\n\n${examples}\n\nCrie uma manifestação curta em tom irônico com menos de 140 caracteres.`;
}

function resolveFallback(
  data: UnifiedRoastInput
): EvaluatedRoast | RoastPayload {
  const mappedEvent = data.event as RoastEvent;
  if ((ROASTS as any)[mappedEvent]) {
    const catalogRoast = selectRoastFromCatalog(
      mappedEvent,
      data as any,
      data.level || "normal",
      data.locale || "pt"
    );
    if (catalogRoast) {
      return catalogRoast;
    }
  }

  // Fallback to legacy structure
  return getFallbackRoast(data as unknown as LegacyRoastContext);
}

async function queryGoogleGemini(
  data: UnifiedRoastInput,
  isDiagnosis: boolean
): Promise<EvaluatedRoast | RoastPayload> {
  const apiKey = env.GEMINI_API_KEY?.trim();
  const configuredModel = env.GEMINI_MODEL;
  const isEn = data.locale === "en";

  if (!apiKey) {
    console.warn(
      "[Gemini] No GEMINI_API_KEY found in environment. Using catalog fallback."
    );
    return resolveFallback(data);
  }

  const client = new GoogleGenAI({ apiKey });
  const timeoutMs = isDiagnosis ? 10_000 : 2500;
  const fallbackModel =
    configuredModel === "gemini-flash-lite-latest"
      ? "gemini-3.5-flash-lite"
      : "gemini-flash-lite-latest";
  const candidateModels = [configuredModel, fallbackModel];

  for (const model of candidateModels) {
    try {
      console.log(
        `[Gemini] Requesting ${isDiagnosis ? "diagnosis" : "roast"} for event "${data.event}" with model "${model}" (timeout: ${timeoutMs}ms)...`
      );

      const userPrompt = isDiagnosis
        ? buildDiagnosisPrompt(data)
        : buildUserPrompt(data);

      const response = await client.models.generateContent({
        config: {
          abortSignal: AbortSignal.timeout(timeoutMs),
          maxOutputTokens: isDiagnosis ? 1000 : 150,
          responseMimeType: "application/json",
          responseSchema: {
            properties: {
              msg: {
                description: isDiagnosis
                  ? "Comprehensive 2-3 paragraph clinical psychiatric diagnosis report with mock prescription"
                  : "Satirical comic punchline or psychiatric evaluation text",
                type: Type.STRING,
              },
              sfx: {
                description: isDiagnosis
                  ? "Uppercase clinical report tag (e.g. LAUDO CLÍNICO, CLINICAL REPORT)"
                  : "Short uppercase onomatopoeia or reaction tag ending in !, ?!, or . (max 14 chars)",
                type: Type.STRING,
              },
            },
            required: ["sfx", "msg"],
            type: Type.OBJECT,
          },
          systemInstruction: getSystemPrompt(isDiagnosis, data.locale),
          temperature: 0.8,
        },
        contents: userPrompt,
        model,
      });

      const rawContent = response.text?.trim() || "";

      const cleaned = rawContent
        .replace(JSON_PREFIX_REGEX, "")
        .replace(JSON_SUFFIX_REGEX, "")
        .trim();

      const parsed = JSON.parse(cleaned) as {
        msg?: string;
        roast?: string;
        sfx?: string;
        tag?: string;
      };

      const defaultSfx = isDiagnosis
        ? isEn
          ? "CLINICAL REPORT"
          : "LAUDO CLÍNICO"
        : isEn
          ? "WHOA."
          : "OPA!";

      const sfx = (parsed.sfx || parsed.tag || defaultSfx)
        .replace(/^\[|\]$/g, "")
        .trim()
        .toUpperCase()
        .slice(0, isDiagnosis ? 24 : 14);

      const msg = (parsed.msg || parsed.roast || "").trim();

      // Validate response:
      // 1. Must have content
      // 2. Length: max 140 chars for toasts, max 2500 chars for multi-paragraph diagnosis report
      // 3. Must not contain emojis
      const maxLength = isDiagnosis ? 2500 : 140;
      if (
        msg &&
        msg.length <= maxLength &&
        !EMOJI_REGEX.test(msg) &&
        !EMOJI_REGEX.test(sfx)
      ) {
        console.log(
          `[Gemini] Generated ${isDiagnosis ? "diagnosis" : "roast"}.`
        );

        return {
          event: data.event as RoastEvent,
          msg,
          priority: 2,
          ruleId: "gemini-ai",
          sfx,
          variantIndex: 0,
        };
      }

      console.warn(
        `[Gemini] AI output from "${model}" failed validation (length: ${msg.length}/${maxLength}, emojis: ${EMOJI_REGEX.test(msg) || EMOJI_REGEX.test(sfx)}).`
      );
    } catch {
      console.warn(`[Gemini] API call with model "${model}" failed.`);
    }
  }

  console.warn("[Gemini] All model attempts failed. Falling back to catalog.");
  return resolveFallback(data);
}

function getCachedRoast(key: string): EvaluatedRoast | null {
  const cached = serverRoastCache.get(key);
  return cached ? { ...cached, ruleId: "cached-ai" } : null;
}

function rememberRoast(key: string, value: EvaluatedRoast) {
  serverRoastCache.set(key, value);
}

async function handleAiRequest(
  data: UnifiedRoastInput,
  isDiagnosis: boolean
): Promise<EvaluatedRoast | RoastPayload> {
  if (!env.GEMINI_API_KEY?.trim()) {
    return resolveFallback(data);
  }
  return await requestAiOrFallback(
    () => allowAiRequest(isDiagnosis ? "diagnosis" : "roast"),
    async () => {
      if (isDiagnosis) {
        return queryGoogleGemini(data, true);
      }
      const key = createHash("sha256")
        .update(JSON.stringify(data))
        .digest("hex");
      const cached = getCachedRoast(key);
      if (cached) {
        return cached;
      }
      const pending = inFlightRoasts.get(key);
      if (pending) {
        return pending;
      }
      const request = queryGoogleGemini(data, false)
        .then((result) => {
          if ("ruleId" in result && result.ruleId === "gemini-ai") {
            rememberRoast(key, result);
          }
          return result;
        })
        .finally(() => {
          inFlightRoasts.delete(key);
        });
      inFlightRoasts.set(key, request);
      return await request;
    },
    () => resolveFallback(data)
  );
}

export const generateRoastFn = createServerFn({ method: "POST" })
  .validator((data: UnifiedRoastInput) => roastInputSchema.parse(data))
  .handler(async ({ data }) => handleAiRequest(data, false));

export const generateDiagnosisFn = createServerFn({ method: "POST" })
  .validator((data: UnifiedRoastInput) => roastInputSchema.parse(data))
  .handler(async ({ data }) => handleAiRequest(data, true));
