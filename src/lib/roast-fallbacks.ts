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
  genreFrom?: string | null;
  genreTo?: string | null;
  locale: Locale;
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
  return {
    roast: isEn
      ? `Browsing through ${ctx.categorySwitches ?? 4} different genres without choosing one. Pick a lane or admit you just like clicking buttons.`
      : `Pulando entre ${ctx.categorySwitches ?? 4} categorias sem escolher nada. Escolha um rumo ou admita que você só gosta de clicar em botões.`,
    tag: isEn ? "[GENRE TOURIST]" : "[TURISTA LITERÁRIO]",
  };
}

function getSearchFallback(ctx: RoastContext, isEn: boolean): RoastPayload {
  const count = ctx.searchCount ?? 3;
  return {
    roast: isEn
      ? `Over ${count} searches and still no book chosen. Are you looking for literature or an excuse not to commit?`
      : `Mais de ${count} buscas seguidas e nenhum livro escolhido. Você está procurando literatura ou uma desculpa para não se comprometer?`,
    tag: isEn ? "[SEARCH PARALYSIS]" : "[BUSCA INFINITA]",
  };
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

  if (pages === 0) {
    return {
      roast: isEn
        ? "Zero fictional purchases so far. Either an admirable display of ascetic self-discipline, or you're too intimidated to commit even to pretend books."
        : "Nenhuma compra de mentira até agora. Ou você é um monge com autocontrole inabalável, ou tem medo de se comprometer até com livros imaginários.",
      tag: isEn ? "[EMOTIONAL WITHDRAWAL]" : "[TRAVA EMOCIONAL]",
    };
  }

  return {
    roast: isEn
      ? `Clinical prognosis: You hoarded ${pages.toLocaleString("en-US")} fictional pages and pretend-spent R$ ${spend.toFixed(2)}, heavily leaning into ${genre}. You don't want knowledge, you want intellectual anesthesia and an aesthetically pleasing bookshelf to intimidate guests.`
      : `Prognóstico clínico: Você acumulou ${pages.toLocaleString("pt-BR")} páginas fictícias e 'gastou' R$ ${spend.toFixed(2)}, com forte obsessão por ${genre}. Seu diagnóstico não é amor pela literatura: é anestesia intelectual e vontade de impressionar visitas com uma estante intimidadora.`,
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
