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
  categorySwitches: z.number().optional(),
  event: z.enum([
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
  locale: z.enum(["pt", "en"]).default("pt"),
  paymentMethod: z.string().optional(),
  pretendSpend: z.number().optional(),
  query: z.string().optional(),
  russianCount: z.number().optional(),
  searchCount: z.number().optional(),
  totalPages: z.number().optional(),
  wishlistCount: z.number().optional(),
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
      "Deliver a quick, punchy, acidic roast joke targeting the user's book hoarding delusions (buying books they will never finish, dopamine rushes from cart clicks, endless wishlist graveyards, perpetual search paralysis, jumping across genres without choosing anything, pretending to be an intellectual). " +
      "Maximum 2 snappy sentences. " +
      'Respond STRICTLY with valid JSON in this format: {"tag": "[SOUND EFFECT]", "roast": "your punchline here"}. ' +
      "The tag MUST be in uppercase inside brackets, like [ALERT!], [IDENTITY CRISIS], [DECORATION ONLY], [LAST CHANCE], [WISHLIST GRAVEYARD], [GENRE TOURIST], [SEARCH PARALYSIS], [BARGAIN HUNTER], [NAME DROPPER], [PAGE ILLUSION]. " +
      "Do NOT include markdown backticks."
    );
  }

  return (
    "Você é o mestre de cerimônias de um show de comédia e fritada (roast) literária na livraria 'Depois Eu Leio'. " +
    "Faça uma piada ácida, afiada, irônica e hilária de no máximo 2 frases zombando do hábito do usuário de acumular livros que nunca vai ler (tsundoku, vício em dopamina de carrinho, cemitério de listas de desejos, trocar de gênero sem decidir nada, buscas infinitas sem comprar, fingir que lê calhamaço). " +
    'Responda ESTRITAMENTE com um JSON válido no formato: {"tag": "[EFEITO DE SOM]", "roast": "sua piada ácida aqui"}. ' +
    "A tag DEVE ser em caixa alta entre colchetes, estilo vinheta de roast (ex: [ALERTA!], [TERAPIA JÁ], [OBJETO DECORATIVO], [HERANÇA NÃO LIDA], [CRISE EXISTENCIAL], [CEMITÉRIO DE DESEJOS], [TURISTA LITERÁRIO], [BUSCA INFINITA], [PECHINCHA INÚTIL], [SÍNDROME DE INTELECTUAL], [ILUSÃO DE PÁGINAS]). " +
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

function getFilterRoastMessage(
  data: RoastContext,
  isEn: boolean
): string | null {
  if (data.filterType === "price") {
    return isEn
      ? `The user just filtered the catalog by price: "${data.filterValue}" on their ${data.searchCount || 3}th search/filter adjustment. Roast their cheapskate rationalization and trying to bargain-hunt books they will never actually read.`
      : `O usuário acabou de filtrar o catálogo por preço: "${data.filterValue}" na sua ${data.searchCount || 3}ª busca/filtro. Zombe da mania de pechinchar e economizar trocados em livros que nunca vai abrir na vida.`;
  }
  if (data.filterType === "author") {
    return isEn
      ? `The user just filtered the catalog by author: "${data.filterValue}" on their ${data.searchCount || 3}th search/filter adjustment. Roast their pretentious name-dropping and delusion that buying this specific author will make them an intellectual.`
      : `O usuário acabou de filtrar o catálogo pelo autor: "${data.filterValue}" na sua ${data.searchCount || 3}ª busca/filtro. Zombe do exibicionismo intelectual e da ilusão de que filtrar esse autor específico vai torná-lo culto.`;
  }
  if (data.filterType === "length") {
    return isEn
      ? `The user just filtered the catalog by book length/size: "${data.filterValue}" on their ${data.searchCount || 3}th search/filter adjustment. Roast their delusion that choosing books of this page count will actually make them finish a book.`
      : `O usuário acabou de filtrar o catálogo pelo tamanho/número de páginas: "${data.filterValue}" na sua ${data.searchCount || 3}ª busca/filtro. Zombe da ilusão de achar que escolher livros por tamanho vai fazer com que ele finalmente termine uma leitura.`;
  }
  return null;
}

function getCategoryRoastMessage(data: RoastContext, isEn: boolean): string {
  const to = data.genreTo || data.filterValue || "another category";
  const from =
    data.genreFrom || data.filterPreviousValue || "previous category";
  const count = data.categorySwitches || data.searchCount || 3;
  return isEn
    ? `The user just changed category/genre ${count} times without picking a book. Currently switching to "${to}" from "${from}". Extreme literary indecision and commitment issues.`
    : `O usuário acabou de trocar de categoria/gênero ${count} vezes sem escolher nenhum livro. Agora mudando para "${to}" saindo de "${from}". Indecisão crônica e turismo literário sem foco.`;
}

function getBrowsingMilestoneMessage(
  data: RoastContext,
  isEn: boolean
): string {
  if (data.event === "wishlist_milestone_pages") {
    return isEn
      ? `The user's wishlist just exceeded ${data.totalPages} total saved pages across ${data.wishlistCount || data.cartCount || 0} books. They are stockpiling books into their wishlist graveyard to pretend they will buy and read them later.`
      : `A lista de desejos do usuário acabou de ultrapassar ${data.totalPages} páginas no total em ${data.wishlistCount || data.cartCount || 0} livros salvos. Um cemitério de boas intenções e calhamaços salvos para um 'depois' que nunca chega.`;
  }
  if (
    data.event === "category_switch_milestone" ||
    data.filterType === "genre"
  ) {
    return getCategoryRoastMessage(data, isEn);
  }
  const filterMsg = getFilterRoastMessage(data, isEn);
  if (filterMsg) {
    return filterMsg;
  }
  return isEn
    ? `The user just ran their ${data.searchCount}th search query ("${data.query || data.filterValue || "unknown"}"). Endless searching, zero reading. Severe search paralysis and procrastination.`
    : `O usuário acabou de fazer sua ${data.searchCount}ª pesquisa no catálogo ("${data.query || data.filterValue || "desconhecido"}"). Busca infinita, leitura zero. Paralisia de escolha e procrastinação pura.`;
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
    case "wishlist_milestone_pages":
    case "category_switch_milestone":
    case "search_milestone":
      return getBrowsingMilestoneMessage(data, isEn);
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
