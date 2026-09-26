import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "@/env";
import {
  getFallbackRoast,
  type RoastContext,
  type RoastPayload,
} from "../roast-fallbacks";

const JSON_PREFIX_REGEX = /^```json\s*/i;
const JSON_SUFFIX_REGEX = /```$/i;

const roastInputSchema = z.object({
  authorCount: z.number().optional(),
  bookTitle: z.string().optional(),
  cartCount: z.number().optional(),
  event: z.enum([
    "cart_milestone_count",
    "cart_milestone_pages",
    "checkout_opened",
    "order_completed",
    "diagnosis",
  ]),
  favoriteAuthor: z.string().nullable().optional(),
  favoriteGenre: z.string().nullable().optional(),
  locale: z.enum(["pt", "en"]).default("pt"),
  paymentMethod: z.string().optional(),
  pretendSpend: z.number().optional(),
  russianCount: z.number().optional(),
  totalPages: z.number().optional(),
});

function getSystemPrompt(isDiagnosis: boolean, locale: "pt" | "en") {
  const isEn = locale === "en";

  if (isDiagnosis) {
    if (isEn) {
      return (
        "You are the head roastmaster and cynical psychiatrist at 'Depois Eu Leio' (Dopamine Bookstore). " +
        "Perform a hilarious, dark, stand-up comedy roast evaluation (psychological diagnosis) of the user's book hoarding habits (tsundoku, pretend spending, buying 1,000-page trophies to impress house guests). " +
        "Be sharp, sarcastic, witty, and end with a cynical mock prescription. Exactly 1 dense paragraph (3 to 4 sentences). " +
        'Respond STRICTLY with valid JSON formatted as: {"tag": "[CLINICAL REPORT]", "roast": "your roast here"}. ' +
        "Do NOT include markdown backticks or any other text."
      );
    }
    return (
      "Você é o mestre de cerimônias e psiquiatra cínico da livraria satírica 'Depois Eu Leio'. " +
      "Faça uma 'fritada' (roast de comédia stand-up) hilária e ácida sobre as neuroses de acumulação do usuário (tsundoku, gastar rios de dinheiro fictício, comprar calhamaços de 1.000 páginas só para parecer culto para as visitas). " +
      "Seja afiado, sarcástico, inteligente e finalize com uma prescrição irônica. Exatamente 1 parágrafo denso (3 a 4 frases). " +
      'Responda ESTRITAMENTE com um JSON válido no formato: {"tag": "[LAUDO CLÍNICO]", "roast": "seu texto ácido aqui"}. ' +
      "NÃO use crases de markdown nem texto fora do JSON."
    );
  }

  if (isEn) {
    return (
      "You are a stand-up comedy roast master at 'Depois Eu Leio' (Dopamine Bookstore). " +
      "Deliver a quick, punchy, acidic roast joke targeting the user's book hoarding delusions (buying books they will never finish, dopamine rushes from cart clicks, pretending to be an intellectual). " +
      "Maximum 2 snappy sentences. " +
      'Respond STRICTLY with valid JSON in this format: {"tag": "[SOUND EFFECT]", "roast": "your punchline here"}. ' +
      "The tag MUST be in uppercase inside brackets, like [ALERT!], [IDENTITY CRISIS], [DECORATION ONLY], [LAST CHANCE]. " +
      "Do NOT include markdown backticks."
    );
  }

  return (
    "Você é o mestre de cerimônias de um show de comédia e fritada (roast) literária na livraria 'Depois Eu Leio'. " +
    "Faça uma piada ácida, afiada, irônica e hilária de no máximo 2 frases zombando do hábito do usuário de acumular livros que nunca vai ler (tsundoku, vício em dopamina de carrinho, fingir que lê calhamaço). " +
    'Responda ESTRITAMENTE com um JSON válido no formato: {"tag": "[EFEITO DE SOM]", "roast": "sua piada ácida aqui"}. ' +
    "A tag DEVE ser em caixa alta entre colchetes, estilo vinheta de roast (ex: [ALERTA!], [TERAPIA JÁ], [OBJETO DECORATIVO], [HERANÇA NÃO LIDA], [CRISE EXISTENCIAL]). " +
    "NÃO use crases de markdown nem texto fora do JSON."
  );
}

function getCartMilestoneMessage(data: RoastContext, isEn: boolean): string {
  if (data.event === "cart_milestone_count") {
    return isEn
      ? `The user just added their ${data.cartCount}th book to the cart. Total pages so far: ${data.totalPages}. Book just added: "${data.bookTitle || "Classic"}".`
      : `O usuário acabou de colocar o ${data.cartCount}º livro no carrinho. Total de páginas acumuladas: ${data.totalPages}. Livro adicionado agora: "${data.bookTitle || "Clássico"}".`;
  }
  return isEn
    ? `The user's cart just exceeded ${data.totalPages} total pages across ${data.cartCount} books. Russian authors count: ${data.russianCount || 0}.`
    : `O carrinho do usuário acabou de estourar ${data.totalPages} páginas no total em ${data.cartCount} livros. Autores russos no carrinho: ${data.russianCount || 0}.`;
}

function getOrderLifecycleMessage(data: RoastContext, isEn: boolean): string {
  if (data.event === "checkout_opened") {
    return isEn
      ? `The user is entering the simulated checkout with ${data.cartCount} books (${data.totalPages} pages). They are about to pretend to spend money.`
      : `O usuário abriu a tela de checkout simulado com ${data.cartCount} livros (${data.totalPages} páginas). Prestes a simular pagamento de mentira.`;
  }
  return isEn
    ? `The user completed a fictional purchase using ${data.paymentMethod || "fictional card"} for a pretend total of R$ ${data.pretendSpend?.toFixed(2) || "0.00"} and ${data.totalPages} unread pages.`
    : `O usuário confirmou o pedido fictício via ${data.paymentMethod || "cartão de mentirinha"} somando R$ ${data.pretendSpend?.toFixed(2) || "0.00"} e ${data.totalPages} páginas que ficarão na estante.`;
}

function buildUserMessage(data: RoastContext): string {
  const isEn = data.locale === "en";

  switch (data.event) {
    case "cart_milestone_count":
    case "cart_milestone_pages":
      return getCartMilestoneMessage(data, isEn);
    case "checkout_opened":
    case "order_completed":
      return getOrderLifecycleMessage(data, isEn);
    default:
      return isEn
        ? `Overall stats: ${data.cartCount || 0} books hoarded, ${data.totalPages || 0} pages accumulated, R$ ${data.pretendSpend?.toFixed(2) || "0.00"} fake spent. Favorite genre: "${data.favoriteGenre || "Literature"}", favorite author: "${data.favoriteAuthor || "Unknown"}".`
        : `Histórico geral de compras: ${data.cartCount || 0} livros acumulados, ${data.totalPages || 0} páginas, R$ ${data.pretendSpend?.toFixed(2) || "0.00"} não gastos de verdade. Gênero preferido: "${data.favoriteGenre || "Literatura"}", autor favorito: "${data.favoriteAuthor || "Desconhecido"}".`;
  }
}

async function queryOpenRouter(
  data: RoastContext,
  isDiagnosis: boolean
): Promise<RoastPayload> {
  const apiKey = env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return getFallbackRoast(data);
  }

  const model = env.OPENROUTER_MODEL;
  const siteUrl = env.OPENROUTER_SITE_URL;
  const siteName = env.OPENROUTER_SITE_NAME;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        body: JSON.stringify({
          max_tokens: isDiagnosis ? 220 : 120,
          messages: [
            {
              content: getSystemPrompt(isDiagnosis, data.locale),
              role: "system",
            },
            {
              content: buildUserMessage(data),
              role: "user",
            },
          ],
          model,
          temperature: 0.85,
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": siteName,
        },
        method: "POST",
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return getFallbackRoast(data);
    }

    const json = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const rawContent = json.choices?.[0]?.message?.content?.trim() || "";

    const cleaned = rawContent
      .replace(JSON_PREFIX_REGEX, "")
      .replace(JSON_SUFFIX_REGEX, "")
      .trim();

    const parsed = JSON.parse(cleaned) as { roast?: string; tag?: string };

    if (parsed.roast && parsed.tag) {
      return {
        roast: parsed.roast.trim(),
        tag: parsed.tag.trim().toUpperCase(),
      };
    }

    if (parsed.roast) {
      return {
        roast: parsed.roast.trim(),
        tag: isDiagnosis ? "[LAUDO CLÍNICO]" : "[ALERTA!]",
      };
    }

    return getFallbackRoast(data);
  } catch {
    clearTimeout(timeoutId);
    return getFallbackRoast(data);
  }
}

export const generateRoastFn = createServerFn({ method: "POST" })
  .validator((data: RoastContext) => roastInputSchema.parse(data))
  .handler(async ({ data }) => queryOpenRouter(data, false));

export const generateDiagnosisFn = createServerFn({ method: "POST" })
  .validator((data: RoastContext) => roastInputSchema.parse(data))
  .handler(async ({ data }) => queryOpenRouter(data, true));
