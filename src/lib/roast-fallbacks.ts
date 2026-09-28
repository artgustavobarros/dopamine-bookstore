import type { Locale } from "./catalog";

export interface RoastPayload {
  roast: string;
  tag: string;
}

export interface RoastContext {
  authorCount?: number;
  bookTitle?: string;
  cartCount?: number;
  categorySwitches?: number;
  event:
    | "cart_milestone_count"
    | "cart_milestone_pages"
    | "checkout_opened"
    | "order_completed"
    | "diagnosis"
    | "wishlist_milestone_pages"
    | "category_switch_milestone"
    | "search_milestone";
  favoriteAuthor?: string | null;
  favoriteGenre?: string | null;
  filterPreviousValue?: string | null;
  filterType?: "query" | "genre" | "price" | "author" | "length" | null;
  filterValue?: string | null;
  genreFrom?: string | null;
  genreTo?: string | null;
  hours?: number | string;
  locale: Locale;
  orderCount?: number;
  paymentMethod?: string;
  pretendSpend?: number;
  query?: string;
  russianCount?: number;
  searchCount?: number;
  totalPages?: number;
  wishlistCount?: number;
}

function getCartCountFallback(ctx: RoastContext, isEn: boolean): RoastPayload {
  if ((ctx.cartCount ?? 0) >= 6) {
    return {
      roast: isEn
        ? "Six books in your cart. Are you building a home library or desperately avoiding choosing one book to actually read?"
        : "Seis livros no carrinho. Você está montando uma biblioteca comunitária ou só evitando escolher um para ler de verdade?",
      tag: isEn ? "[IDENTITY CRISIS]" : "[CRISE EXISTENCIAL]",
    };
  }
  return {
    roast: isEn
      ? "Three books added. That’s at least three distinct excuses you’re preparing for why you haven’t started any of them."
      : "Três livros no carrinho. São pelo menos três desculpas inéditas que você está preparando para não começar nenhum.",
    tag: isEn ? "[ALERT!]" : "[ALERTA!]",
  };
}

function getCartPagesFallback(ctx: RoastContext, isEn: boolean): RoastPayload {
  const pages = ctx.totalPages ?? 1000;
  if (pages > 2000) {
    return {
      roast: isEn
        ? `Your cart just passed ${pages.toLocaleString("en-US")} pages. That's not a reading list, that's a medium-term sentence.`
        : `Seu carrinho ultrapassou ${pages.toLocaleString("pt-BR")} páginas. Isso não é uma lista de leitura, é uma pena de reclusão em regime semiaberto.`,
      tag: isEn ? "[MEDIUM TERM SENTENCE]" : "[PENA DE RECLUSÃO]",
    };
  }
  return {
    roast: isEn
      ? "Over 1,000 pages accumulated. Perfect weight to keep your coffee table from wobbling."
      : "Mais de 1.000 páginas acumuladas. Peso perfeito para calçar o pé daquela mesa de centro bamba.",
    tag: isEn ? "[DECORATION ONLY]" : "[OBJETO DECORATIVO]",
  };
}

function getWishlistPagesFallback(
  ctx: RoastContext,
  isEn: boolean
): RoastPayload {
  const pages = ctx.totalPages ?? 1000;
  if (pages >= 2000) {
    return {
      roast: isEn
        ? `Over ${pages.toLocaleString("en-US")} pages saved in your wishlist. That's not a wishlist anymore, that's an archaeological site of unread dreams.`
        : `Mais de ${pages.toLocaleString("pt-BR")} páginas na lista de desejos. Isso não é uma lista de desejos, é um sítio arqueológico de promessas não cumpridas.`,
      tag: isEn ? "[WISHLIST GRAVEYARD]" : "[CEMITÉRIO DE DESEJOS]",
    };
  }
  return {
    roast: isEn
      ? "Over 1,000 pages saved for later. We both know 'later' is where books go to collect digital dust."
      : "Mais de 1.000 páginas salvas para depois. Sabemos muito bem que 'depois' é o lugar onde os livros pegam poeira digital.",
    tag: isEn ? "[PURE ILLUSION]" : "[ILUSÃO PURA]",
  };
}

function getCategorySwitchFallback(
  ctx: RoastContext,
  isEn: boolean
): RoastPayload {
  const target = ctx.genreTo || ctx.filterValue;
  if (target && target !== "all") {
    return {
      roast: isEn
        ? `Hopping over to genre "${target}"? Switching genres won't cure your chronic literary indecision.`
        : `Pulando para o gênero "${target}"? Trocar de gênero a cada instante não vai curar sua indecisão crônica.`,
      tag: isEn ? "[GENRE TOURIST]" : "[TURISTA LITERÁRIO]",
    };
  }
  return {
    roast: isEn
      ? `Browsing through ${ctx.categorySwitches ?? ctx.searchCount ?? 3} different genres without choosing one. Pick a lane or admit you just like clicking buttons.`
      : `Pulando entre ${ctx.categorySwitches ?? ctx.searchCount ?? 3} categorias sem escolher nada. Escolha um rumo ou admita que você só gosta de clicar em botões.`,
    tag: isEn ? "[GENRE TOURIST]" : "[TURISTA LITERÁRIO]",
  };
}

function getPriceFallback(
  priceVal: string | null | undefined,
  isEn: boolean
): RoastPayload {
  return {
    roast: isEn
      ? `Filtering by price band "${priceVal}"? Trying to pinch pennies on books that will spend decades unread on your shelf.`
      : `Filtrando pela faixa de preço "${priceVal}"? Economizar centavos em livros que passarão anos intocados na sua estante não vai equilibrar seu orçamento.`,
    tag: isEn ? "[BARGAIN HUNTER]" : "[PECHINCHA INÚTIL]",
  };
}

function getAuthorFallback(
  authorVal: string | null | undefined,
  isEn: boolean
): RoastPayload {
  return {
    roast: isEn
      ? `Filtering specifically for "${authorVal}"? Bold move pretending you'll conquer their bibliography instead of using it as living room decoration.`
      : `Filtrando pelo autor "${authorVal}"? Bela tentativa de fingir que vai devorar a bibliografia inteira em vez de usar os livros como enfeite de estante.`,
    tag: isEn ? "[NAME DROPPER]" : "[SÍNDROME DE INTELECTUAL]",
  };
}

function getLengthFallback(
  lengthVal: string | null | undefined,
  isEn: boolean
): RoastPayload {
  return {
    roast: isEn
      ? `Filtering books by length "${lengthVal}"? Picking thinner books won't help when you don't even open the front cover.`
      : `Filtrando livros por tamanho "${lengthVal}"? Escolher livros finos não vai adiantar se você não abre nem a primeira página.`,
    tag: isEn ? "[PAGE ILLUSION]" : "[ILUSÃO DE PÁGINAS]",
  };
}

function getQueryFallback(
  queryVal: string | null | undefined,
  count: number,
  isEn: boolean
): RoastPayload {
  if (queryVal) {
    return {
      roast: isEn
        ? `Another search for "${queryVal}"? Typing book queries in the catalog won't burn calories or count as reading.`
        : `Mais uma busca por "${queryVal}"? Digitar nomes de livros no catálogo não queima calorias nem conta como leitura.`,
      tag: isEn ? "[SEARCH PARALYSIS]" : "[BUSCA INFINITA]",
    };
  }
  return {
    roast: isEn
      ? `Over ${count} searches and still no book chosen. Are you looking for literature or an excuse not to commit?`
      : `Mais de ${count} buscas seguidas e nenhum livro escolhido. Você está procurando literatura ou uma desculpa para não se comprometer?`,
    tag: isEn ? "[SEARCH PARALYSIS]" : "[BUSCA INFINITA]",
  };
}

function getSearchFallback(ctx: RoastContext, isEn: boolean): RoastPayload {
  if (ctx.filterType === "price") {
    return getPriceFallback(ctx.filterValue, isEn);
  }
  if (ctx.filterType === "author") {
    return getAuthorFallback(ctx.filterValue, isEn);
  }
  if (ctx.filterType === "length") {
    return getLengthFallback(ctx.filterValue, isEn);
  }
  if (ctx.filterType === "genre") {
    return getCategorySwitchFallback(ctx, isEn);
  }

  const queryVal =
    ctx.query || (ctx.filterType === "query" ? ctx.filterValue : null);
  return getQueryFallback(queryVal, ctx.searchCount ?? 3, isEn);
}

function getOrderCompletedFallback(
  ctx: RoastContext,
  isEn: boolean
): RoastPayload {
  if (ctx.paymentMethod === "pix") {
    return {
      roast: isEn
        ? "Pretend Pix generated and settled into the void. The Central Bank didn't even flinch."
        : "Pix fictício disparado para lugar nenhum. O Banco Central nem piscou e seu saldo segue intocado.",
      tag: isEn ? "[PIX INTO VOID]" : "[PIX NO VÁCUO]",
    };
  }
  return {
    roast: isEn
      ? "Fictional purchase confirmed in 12 interest-free installments that will mercifully never appear on your card statement."
      : "Compra fictícia confirmada em 12x sem juros que felizmente nunca aparecerão na sua fatura do cartão.",
    tag: isEn ? "[KA-CHING!]" : "[PLIM!]",
  };
}

function getDiagnosisFallback(ctx: RoastContext, isEn: boolean): RoastPayload {
  const pages = ctx.totalPages ?? 0;
  const spend = ctx.pretendSpend ?? 0;
  const genre = ctx.favoriteGenre ?? (isEn ? "General" : "Geral");
  const books = ctx.cartCount ?? ctx.orderCount ?? 0;

  if (pages === 0) {
    return {
      roast: isEn
        ? "Clinical Presentation: The subject has committed to zero fictional purchases so far.\n\nBehavioral Analysis: This suggests either an extreme display of ascetic self-discipline or, more likely, an acute fear of commitment even to purely imaginary literature.\n\nPrescription: Add at least three 800-page Russian classics to the cart immediately and close the tab to experience true modern dopamine."
        : "Quadro Clínico: O sujeito realizou exatamente zero compras fictícias até o momento.\n\nAnálise Comportamental: Isso reflete ou um caso raro de autocontrole inabalável ou, mais provavelmente, uma trava emocional paralisante de quem tem medo de se comprometer até com livros imaginários.\n\nPrescrição Médica: Adicionar imediatamente três calhamaços russos de 800 páginas à sacola e fechar a aba do navegador para sentir a verdadeira dopamina moderna.",
      tag: isEn ? "[CLINICAL REPORT]" : "[LAUDO PSIQUIÁTRICO]",
    };
  }

  return {
    roast: isEn
      ? `Clinical Presentation: Patient exhibits chronic stage-4 Tsundoku, having accumulated ${books > 0 ? `${books} books and ` : ""}${pages.toLocaleString("en-US")} fictional pages with a pretend expenditure of R$ ${spend.toFixed(2)}, heavily gravitating towards ${genre}.\n\nBehavioral Analysis: The subject does not seek literary knowledge; they seek intellectual anesthesia and high-gravity paper trophies to intimidate guests into believing they are a Renaissance scholar who reads instead of endlessly scrolling social media.\n\nPrescription: Mandatory confiscation of all bookmarks. Daily treatment: stare silently at the unread pile for 20 minutes without checking phone notifications or buying specialty coffee.`
      : `Quadro Clínico: Paciente apresenta quadro agudo de Tsundoku grau 4, tendo acumulado ${books > 0 ? `${books} obras e ` : ""}${pages.toLocaleString("pt-BR")} páginas fictícias, com 'investimento' de R$ ${spend.toFixed(2)} e obsessão desmedida por ${genre}.\n\nAnálise Comportamental: Não se trata de amor genuíno pela literatura, mas sim de uma busca desesperada por anestesia intelectual e troféus de papel para impressionar visitas na sala de estar, nutrindo a fantasia de sabedoria adquirida por osmose física.\n\nPrescrição Médica: Confisco cautelar de todos os marcadores de página. Tratamento de choque: 20 minutos diários contemplando em silêncio a pilha de livros fechados, sem direito a cafezinho gourmet nem postagens estéticas no Instagram.`,
    tag: isEn ? "[CLINICAL REPORT]" : "[LAUDO PSIQUIÁTRICO]",
  };
}

export function getFallbackRoast(ctx: RoastContext): RoastPayload {
  const isEn = ctx.locale === "en";

  switch (ctx.event) {
    case "cart_milestone_count":
      return getCartCountFallback(ctx, isEn);
    case "cart_milestone_pages":
      return getCartPagesPages(ctx, isEn);
    case "wishlist_milestone_pages":
      return getWishlistPagesFallback(ctx, isEn);
    case "category_switch_milestone":
      return getCategorySwitchFallback(ctx, isEn);
    case "search_milestone":
      return getSearchFallback(ctx, isEn);
    case "checkout_opened":
      return {
        roast: isEn
          ? "Entering checkout: your final chance to pretend financial and emotional maturity before clicking confirm."
          : "Entrando no checkout: sua última chance de simular maturidade emocional e financeira antes de confirmar.",
        tag: isEn ? "[LAST WARNING]" : "[ÚLTIMO AVISO]",
      };
    case "order_completed":
      return getOrderCompletedFallback(ctx, isEn);
    default:
      return getDiagnosisFallback(ctx, isEn);
  }
}

function getCartPagesPages(ctx: RoastContext, isEn: boolean): RoastPayload {
  return getCartPagesFallback(ctx, isEn);
}
