import { OpenRouter } from "@openrouter/sdk";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "@/env";
import {
  ROASTS,
  type RoastEvent,
  selectRoastFromCatalog,
  type EvaluatedRoast,
} from "../roasts";
import {
  getFallbackRoast,
  type RoastContext as LegacyRoastContext,
  type RoastPayload,
} from "../roast-fallbacks";

const JSON_PREFIX_REGEX = /^```json\s*/i;
const JSON_SUFFIX_REGEX = /```$/i;
const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

// Cache map for server-side / runtime caching by event + rule
const serverRoastCache = new Map<string, { sfx: string; msg: string }>();

const roastInputSchema = z.object({
  author: z.string().optional(),
  authorCount: z.number().optional(),
  book: z
    .object({
      author: z.string(),
      genre: z.string(),
      id: z.string(),
      old: z.boolean().optional(),
      pages: z.number(),
      price: z.number().optional(),
      ru: z.boolean().optional(),
      title: z.string(),
    })
    .optional(),
  bookTitle: z.string().optional(),
  burstCount: z.number().optional(),
  cardBrand: z.string().optional(),
  cardLast4: z.string().optional(),
  cart: z
    .array(
      z.object({
        author: z.string(),
        genre: z.string(),
        id: z.string(),
        old: z.boolean().optional(),
        pages: z.number(),
        price: z.number().optional(),
        ru: z.boolean().optional(),
        title: z.string(),
      })
    )
    .optional(),
  cartCount: z.number().optional(),
  categorySwitches: z.number().optional(),
  deliveryCode: z.string().optional(),
  deliveryStage: z.string().optional(),
  eta: z.string().optional(),
  event: z.enum([
    "book-added",
    "book-readded",
    "cart-opened",
    "checkout-started",
    "login-required",
    "login",
    "wish-added",
    "review-posted",
    "pix-copied",
    "pix-expired",
    "card-declined",
    "purchase-completed",
    "delivery-stage",
    "delivered",
    "delivery-receipt-confirmed",
    "idle",
    "cart-removed",
    "cart_milestone_count",
    "cart_milestone_pages",
    "checkout_opened",
    "order_completed",
    "diagnosis",
    "wishlist_milestone_pages",
    "category_switch_milestone",
    "search_milestone",
  ]),
  favoriteAuthor: z.string().nullable().optional(),
  favoriteGenre: z.string().nullable().optional(),
  filterPreviousValue: z.string().nullable().optional(),
  filterType: z
    .enum(["query", "genre", "price", "author", "length"])
    .nullable()
    .optional(),
  filterValue: z.string().nullable().optional(),
  genreFrom: z.string().nullable().optional(),
  genreTo: z.string().nullable().optional(),
  hours: z.union([z.number(), z.string()]).optional(),
  inCart: z.boolean().optional(),
  level: z.enum(["educado", "normal", "impiedoso"]).optional(),
  locale: z.enum(["pt", "en"]).default("pt"),
  n: z.number().optional(),
  name: z.string().optional(),
  orderNumber: z.string().optional(),
  orders: z.array(z.any()).optional(),
  owned: z.any().optional(),
  pages: z.number().optional(),
  pay: z.string().optional(),
  paymentMethod: z.string().optional(),
  pretendSpend: z.number().optional(),
  prevPages: z.number().optional(),
  promo: z.number().optional(),
  query: z.string().optional(),
  ru: z.number().optional(),
  russianCount: z.number().optional(),
  savedPages: z.number().optional(),
  searchCount: z.number().optional(),
  small: z.boolean().optional(),
  title: z.string().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
  wish: z.number().optional(),
  wishlistCount: z.number().optional(),
});

export type UnifiedRoastInput = z.infer<typeof roastInputSchema>;

function getSystemPrompt(isDiagnosis: boolean, locale: "pt" | "en") {
  const isEn = locale === "en";

  if (isDiagnosis) {
    if (isEn) {
      return (
        "You are the head roastmaster and cynical psychiatrist at 'Depois Eu Leio' (Dopamine Bookstore). " +
        "Perform a hilarious, dark, stand-up comedy roast evaluation (psychological diagnosis) of the user's book hoarding habits (tsundoku, pretend spending, buying 1,000-page trophies to impress house guests). " +
        "Be sharp, sarcastic, witty, and end with a cynical mock prescription. Exactly 1 dense paragraph (3 to 4 sentences). " +
        'Respond STRICTLY with valid JSON formatted as: {"sfx": "CLINICAL REPORT", "msg": "your roast here"}. ' +
        "Do NOT include markdown backticks or any other text."
      );
    }
    return (
      "Você é o mestre de cerimônias e psiquiatra cínico da livraria satírica 'Depois Eu Leio'. " +
      "Faça uma 'fritada' (roast de comédia stand-up) hilária e ácida sobre as neuroses de acumulação do usuário (tsundoku, gastar rios de dinheiro fictício, comprar calhamaços de 1.000 páginas só para parecer culto para as visitas). " +
      "Seja afiado, sarcástico, inteligente e finalize com uma prescrição irônica. Exatamente 1 parágrafo denso (3 a 4 frases). " +
      'Responda ESTRITAMENTE com um JSON válido no formato: {"sfx": "LAUDO CLÍNICO", "msg": "seu texto ácido aqui"}. ' +
      "NÃO use crases de markdown nem texto fora do JSON."
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
  if (!matchedEventDef || !matchedEventDef.rules?.length) {
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
      if (examples.length >= 3) break;
    }
    if (examples.length >= 3) break;
  }

  return `Examples from catalogue:\n${examples.join("\n")}`;
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

function resolveFallback(data: UnifiedRoastInput): EvaluatedRoast | RoastPayload {
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

async function queryOpenRouter(
  data: UnifiedRoastInput,
  isDiagnosis: boolean
): Promise<EvaluatedRoast | RoastPayload> {
  const apiKey = env.OPENROUTER_API_KEY?.trim();
  const model = env.OPENROUTER_MODEL;
  const isEn = data.locale === "en";

  // Check cache first
  const cacheKey = `${data.event}:${data.bookTitle || data.book?.id || "general"}:${data.locale}`;
  if (!isDiagnosis && serverRoastCache.has(cacheKey)) {
    const cached = serverRoastCache.get(cacheKey)!;
    return {
      event: data.event as RoastEvent,
      msg: cached.msg,
      priority: 2,
      ruleId: "cached-ai",
      sfx: cached.sfx,
      variantIndex: 0,
    };
  }

  if (!apiKey) {
    return resolveFallback(data);
  }

  const siteUrl = env.OPENROUTER_SITE_URL;
  const siteName = env.OPENROUTER_SITE_NAME;

  try {
    const client = new OpenRouter({
      apiKey,
      appTitle: siteName,
      httpReferer: siteUrl,
      timeoutMs: 1500, // Enforced 1.5s timeout as per spec
    });

    const result = await client.chat.send({
      chatRequest: {
        maxTokens: isDiagnosis ? 200 : 90,
        messages: [
          {
            content: getSystemPrompt(isDiagnosis, data.locale),
            role: "system",
          },
          {
            content: buildUserPrompt(data),
            role: "user",
          },
        ],
        model,
        temperature: 0.8,
      },
    });

    const choice = "choices" in result ? result.choices?.[0] : undefined;
    const rawContent =
      typeof choice?.message?.content === "string"
        ? choice.message.content.trim()
        : "";

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

    const sfx = (parsed.sfx || parsed.tag || (isEn ? "WHOA." : "OPA!"))
      .replace(/^\[|\]$/g, "")
      .trim()
      .toUpperCase()
      .slice(0, 14);

    const msg = (parsed.msg || parsed.roast || "").trim();

    // Validate response:
    // 1. Must have content
    // 2. Must be <= 140 chars
    // 3. Must not contain emojis
    if (
      msg &&
      msg.length <= 140 &&
      !EMOJI_REGEX.test(msg) &&
      !EMOJI_REGEX.test(sfx)
    ) {
      // Store in cache
      if (!isDiagnosis) {
        serverRoastCache.set(cacheKey, { msg, sfx });
      }

      return {
        event: data.event as RoastEvent,
        msg,
        priority: 2,
        ruleId: "openrouter-ai",
        sfx,
        variantIndex: 0,
      };
    }

    // Validation failed: fall back to catalog
    return resolveFallback(data);
  } catch {
    // Timeout, network error, or rate limit: immediate deterministic fallback
    return resolveFallback(data);
  }
}

export const generateRoastFn = createServerFn({ method: "POST" })
  .validator((data: UnifiedRoastInput) => roastInputSchema.parse(data))
  .handler(async ({ data }) => queryOpenRouter(data, false));

export const generateDiagnosisFn = createServerFn({ method: "POST" })
  .validator((data: UnifiedRoastInput) => roastInputSchema.parse(data))
  .handler(async ({ data }) => queryOpenRouter(data, true));
