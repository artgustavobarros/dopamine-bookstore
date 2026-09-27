import type { Locale } from "./catalog";

export type IntensityLevel = "educado" | "normal" | "impiedoso";
export type Priority = 1 | 2 | 3;

export type RoastEvent =
  | "book-added"
  | "book-readded"
  | "cart-opened"
  | "checkout-started"
  | "login-required"
  | "login"
  | "wish-added"
  | "review-posted"
  | "pix-copied"
  | "pix-expired"
  | "card-declined"
  | "purchase-completed"
  | "delivery-stage"
  | "delivered"
  | "delivery-receipt-confirmed"
  | "idle"
  | "cart-removed";

export interface LocalizedString {
  en: string;
  pt: string;
}

export interface ToastActionDef {
  actionType: "cart" | "undo" | "retry" | "checkout" | "catalog" | string;
  label: LocalizedString;
}

export interface RoastVariant {
  action?: ToastActionDef | null;
  msg: LocalizedString;
  sfx: LocalizedString;
  w: number;
}

export interface RoastRule {
  action?: ToastActionDef | null;
  id: string;
  levels: IntensityLevel[];
  variants: RoastVariant[];
  when: (ctx: RoastContext) => boolean;
}

export interface RoastEventDef {
  priority: Priority;
  rules: RoastRule[];
}

export interface RoastContext {
  author?: string;
  book?: {
    author: string;
    genre: string;
    id: string;
    old?: boolean;
    pages: number;
    price?: number;
    ru?: boolean;
    title: string;
  };
  burstCount?: number;
  cardBrand?: string;
  cardLast4?: string;
  cart?: Array<{
    author: string;
    genre: string;
    id: string;
    old?: boolean;
    pages: number;
    price?: number;
    ru?: boolean;
    title: string;
  }>;
  deliveryCode?: string;
  deliveryStage?: string;
  eta?: string;
  hours?: number | string;
  inCart?: boolean;
  locale?: Locale;
  n?: number;
  name?: string;
  orderNumber?: string;
  orders?: Array<{
    books: string[];
    createdAt?: string;
    id?: string;
    totalPrice?: number;
  }>;
  owned?: Set<string> | string[] | boolean;
  pages?: number;
  pay?: string;
  prevPages?: number;
  promo?: number;
  ru?: number;
  savedPages?: number;
  small?: boolean;
  title?: string;
  total?: number;
  totalPages?: number;
  wish?: number;
  [key: string]: any;
}

export interface EvaluatedRoast {
  action?: {
    actionType: string;
    label: string;
  } | null;
  event: RoastEvent;
  isBurst?: boolean;
  msg: string;
  priority: Priority;
  ruleId: string;
  sfx: string;
  variantIndex: number;
}

export interface RoastSessionState {
  actions: number;
  aiCache: Record<
    string,
    {
      action?: { actionType: string; label: string } | null;
      msg: string;
      sfx: string;
    }
  >;
  lastRuleByEvent: Record<string, string>;
  lastShownAt: Record<string, number>;
  lastStingIndex?: number;
  recentVariants: Record<string, number[]>;
  shownCount: Record<string, number>;
}

export const STINGS: LocalizedString[] = [
  { pt: "Estou anotando.", en: "I’m taking notes." },
  { pt: "Isso vai para o seu perfil.", en: "This goes on your profile." },
  { pt: "Nada pessoal.", en: "Nothing personal." },
  {
    pt: "Seu eu futuro foi notificado.",
    en: "Your future self has been notified.",
  },
  { pt: "Sua estante chora.", en: "Your bookshelf weeps." },
  { pt: "A dopamina durou 4 segundos.", en: "The dopamine lasted 4 seconds." },
  { pt: "A terapia seria mais barata.", en: "Therapy would be cheaper." },
  {
    pt: "Mais um para a pilha da vergonha.",
    en: "Another one for the pile of shame.",
  },
  {
    pt: "Você sabe que não vai ler, né?",
    en: "You know you won't read it, right?",
  },
  {
    pt: "O marcador de página já desistiu.",
    en: "The bookmark has already surrendered.",
  },
];

export function formatNumberByLocale(n: number, locale: Locale): string {
  if (locale === "en") {
    return n.toLocaleString("en-US");
  }
  return n.toLocaleString("pt-BR");
}

export function formatCurrencyByLocale(val: number, locale: Locale): string {
  if (locale === "en") {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    }).format(val / 5);
  }
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(val);
}

export function interpolateText(
  template: string,
  ctx: RoastContext,
  locale: Locale
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    switch (key) {
      case "pages": {
        const p =
          ctx.pages ?? ctx.book?.pages ?? ctx.totalPages ?? ctx.savedPages ?? 0;
        return formatNumberByLocale(p, locale);
      }
      case "total": {
        const val = ctx.total ?? 0;
        return formatCurrencyByLocale(val, locale);
      }
      case "hours": {
        const h = ctx.hours ?? Math.ceil((ctx.book?.pages ?? 100) / 40);
        return `~${h}h`;
      }
      case "title":
        return ctx.title ?? ctx.book?.title ?? "Livro";
      case "author":
        return ctx.author ?? ctx.book?.author ?? "Autor";
      case "n":
        return String(
          ctx.n ?? ctx.burstCount ?? ctx.cart?.length ?? ctx.wish ?? 1
        );
      case "name":
        return ctx.name ?? "Leitor";
      case "code":
        return ctx.deliveryCode ?? "DEL-84920";
      case "eta":
        return ctx.eta ?? (locale === "en" ? "3 business days" : "3 dias úteis");
      case "brand":
        return ctx.cardBrand ?? "Cartão";
      case "last4":
        return ctx.cardLast4 ?? "4242";
      case "stage":
        return ctx.deliveryStage ?? "Em rota";
      default:
        return ctx[key] !== undefined ? String(ctx[key]) : "";
    }
  });
}

// -------------------------------------------------------------
// CATALOG DEFINITION (16 EVENTS, RULE SPECIFICITY, >=3 VARIANTS)
// -------------------------------------------------------------
export const ROASTS: Record<RoastEvent, RoastEventDef> = {
  "book-added": {
    priority: 2,
    rules: [
      {
        action: null,
        id: "huge-book",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "{pages} pages. That’s not a book, it’s an address.",
              pt: "{pages} páginas. Isso não é um livro, é um endereço.",
            },
            sfx: { en: "KABOOM!", pt: "CABRUM!" },
            w: 2,
          },
          {
            msg: {
              en: "{pages} pages. You can use it as a step stool meanwhile.",
              pt: "{pages} páginas. Dá para usar de degrau enquanto não lê.",
            },
            sfx: { en: "WHOA.", pt: "OPA." },
            w: 1,
          },
          {
            msg: {
              en: "{title}: {hours} of reading. Did you set that time aside? No.",
              pt: "{title}: {hours} de leitura. Você reservou esse tempo? Não.",
            },
            sfx: { en: "REALLY?!", pt: "SÉRIO?!" },
            w: 1,
          },
        ],
        when: (c) => (c.book?.pages ?? 0) >= 1000,
      },
      {
        action: null,
        id: "russians-4",
        levels: ["normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "{n} Russians in the cart. Someone please notify your family.",
              pt: "{n} russos no carrinho. Alguém avise sua família com urgência.",
            },
            sfx: { en: "ALERT!", pt: "ALERTA!" },
            w: 2,
          },
          {
            msg: {
              en: "Four Russian epics. The winter in your soul starts right now.",
              pt: "Quatro calhamaços russos. O inverno na sua alma começa hoje.",
            },
            sfx: { en: "COLD!", pt: "FRIO!" },
            w: 1,
          },
          {
            msg: {
              en: "A Russian literary marathon. Your despair has been scheduled.",
              pt: "Maratona russa no carrinho. Seu desespero foi agendado.",
            },
            sfx: { en: "SIBERIA!", pt: "SIBÉRIA!" },
            w: 1,
          },
        ],
        when: (c) => (c.ru ?? 0) >= 4,
      },
      {
        action: null,
        id: "russians-3",
        levels: ["normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Three Russian books. Understood, it’s just a dramatic phase.",
              pt: "Três russos na sacola. Entendido, é apenas uma fase dramática.",
            },
            sfx: { en: "HMM.", pt: "HMM." },
            w: 2,
          },
          {
            msg: {
              en: "Turgenev, Tolstoy, Dostoevsky. The existential dread triple pack.",
              pt: "Tríplice coroa do desespero existencial no seu carrinho.",
            },
            sfx: { en: "DRAMA!", pt: "DRAMA!" },
            w: 1,
          },
          {
            msg: {
              en: "Third Russian author. Are you auditioning for 19th century sorrow?",
              pt: "Terceiro autor russo. Você está ensaiando para sofrer em 1880?",
            },
            sfx: { en: "WINTER!", pt: "INVERNO!" },
            w: 1,
          },
        ],
        when: (c) => (c.ru ?? 0) === 3,
      },
      {
        action: null,
        id: "dostoevsky-repeat",
        levels: ["normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Dostoevsky again. Are you genuinely okay?",
              pt: "Dostoiévski novamente. Está tudo bem com você?",
            },
            sfx: { en: "REALLY?", pt: "SÉRIO?" },
            w: 2,
          },
          {
            msg: {
              en: "Doubling down on Dostoevsky. Guilt and redemption on repeat.",
              pt: "Mais um Dostoiévski. Culpa e redenção em dose dupla na estante.",
            },
            sfx: { en: "GUILT!", pt: "CULPA!" },
            w: 1,
          },
          {
            msg: {
              en: "Another Russian guilt trip added. St. Petersburg will wait.",
              pt: "Outro Dostoiévski. São Petersburgo vai continuar esperando.",
            },
            sfx: { en: "HEAVY.", pt: "PESADO." },
            w: 1,
          },
        ],
        when: (c) =>
          Boolean(c.book?.author?.toLowerCase().includes("dostoi")) &&
          (c.cart?.filter((b) => b.author.toLowerCase().includes("dostoi"))
            .length ?? 0) >= 2,
      },
      {
        action: null,
        id: "productivity-hoard",
        levels: ["normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Buying another productivity book will surely fix your habits.",
              pt: "Comprar outro livro de produtividade certamente resolverá sua vida.",
            },
            sfx: { en: "SURE.", pt: "CLARO." },
            w: 2,
          },
          {
            msg: {
              en: "Reading about doing things instead of actually doing them.",
              pt: "Ler sobre fazer coisas em vez de realmente fazê-las. Clássico.",
            },
            sfx: { en: "HABIT!", pt: "FOCO!" },
            w: 1,
          },
          {
            msg: {
              en: "Added to cart: 300 pages explaining how to stop wasting time.",
              pt: "Mais 300 páginas ensinando você a não perder tempo na internet.",
            },
            sfx: { en: "IRONIC.", pt: "IRÔNICO." },
            w: 1,
          },
        ],
        when: (c) =>
          c.book?.genre === "Produtividade" &&
          (c.cart?.filter((b) => b.genre === "Produtividade").length ?? 0) >= 2,
      },
      {
        action: null,
        id: "cart-over-2k-pages",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Over {pages} pages in your cart. That's a medium-term sentence.",
              pt: "Mais de {pages} páginas no carrinho. Isso é quase uma pena judicial.",
            },
            sfx: { en: "GOOD LUCK.", pt: "BOA SORTE." },
            w: 2,
          },
          {
            msg: {
              en: "{pages} accumulated pages. Solid anchor for your coffee table.",
              pt: "{pages} páginas acumuladas. Peso perfeito para calçar mesa bamba.",
            },
            sfx: { en: "HEAVY!", pt: "PESO!" },
            w: 1,
          },
          {
            msg: {
              en: "Crossed 2,000 pages. Your unread pile now has its own gravity.",
              pt: "Passou de 2.000 páginas. Sua pilha já tem gravidade própria.",
            },
            sfx: { en: "GRAVITY!", pt: "ÓRBITA!" },
            w: 1,
          },
        ],
        when: (c) => (c.totalPages ?? 0) > 2000,
      },
      {
        action: {
          actionType: "cart",
          label: { en: "View cart", pt: "Ver carrinho" },
        },
        id: "generic",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "{title} added. {hours} of reading you will defer.",
              pt: "{title} adicionado. {hours} de leitura que você vai adiar.",
            },
            sfx: { en: "NOTED.", pt: "ANOTADO." },
            w: 2,
          },
          {
            msg: {
              en: "{pages} pages added to your ambitious literary queue.",
              pt: "{pages} páginas somadas à sua ambiciosa fila literária.",
            },
            sfx: { en: "SAVED.", pt: "SALVO." },
            w: 1,
          },
          {
            msg: {
              en: "Added to cart. Dopamine released; book reading deferred.",
              pt: "Colocado no carrinho. Dopamina liberada; leitura adiada.",
            },
            sfx: { en: "CLICK!", pt: "PLIM!" },
            w: 1,
          },
          {
            msg: {
              en: "{title} joins your digital collection of unread promises.",
              pt: "{title} junta-se à sua coleção de boas intenções não lidas.",
            },
            sfx: { en: "ADDED.", pt: "MAIS UM." },
            w: 1,
          },
          {
            msg: {
              en: "Your cart now holds {n} books and zero guaranteed hours.",
              pt: "Seu carrinho agora tem {n} livros e zero horas garantidas.",
            },
            sfx: { en: "CART!", pt: "CESTA!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "book-readded": {
    priority: 1,
    rules: [
      {
        action: null,
        id: "owned-readded",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "You already bought this book. Now you own it emotionally twice.",
              pt: "Você já comprou esse livro. Agora possui emocionalmente duas vezes.",
            },
            sfx: { en: "AGAIN?!", pt: "DE NOVO?!" },
            w: 2,
          },
          {
            msg: {
              en: "Already on your shelf unread, now back in the digital cart.",
              pt: "Já está na sua estante intocado e agora volta para o carrinho.",
            },
            sfx: { en: "REPETITION.", pt: "DÉJÀ VU!" },
            w: 1,
          },
          {
            msg: {
              en: "Buying the exact same book twice won’t make you read it faster.",
              pt: "Comprar o mesmo livro de novo não vai fazer você ler mais rápido.",
            },
            sfx: { en: "HOLD ON!", pt: "ALTO LÁ!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "cart-opened": {
    priority: 3,
    rules: [
      {
        action: {
          actionType: "checkout",
          label: { en: "Checkout", pt: "Ir pro caixa" },
        },
        id: "cart-review",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Reviewing {n} books and {pages} pages of pure ambition.",
              pt: "Olhando {n} livros e {pages} páginas de pura ambição não lida.",
            },
            sfx: { en: "LET’S SEE...", pt: "VAMOS VER..." },
            w: 2,
          },
          {
            msg: {
              en: "Total of {total} in pretend spending. Ready to confront reality?",
              pt: "Total de {total} em gastos simulados. Pronto para encarar a conta?",
            },
            sfx: { en: "TOTAL!", pt: "TOTAL!" },
            w: 1,
          },
          {
            msg: {
              en: "The cart is open. Taking a long look at your future excuses.",
              pt: "Carrinho aberto. Olhando bem para suas futuras desculpas.",
            },
            sfx: { en: "AMBITION.", pt: "CORAGEM." },
            w: 1,
          },
          {
            msg: {
              en: "{pages} unread pages staring back at you in judgment.",
              pt: "{pages} páginas intocadas olhando de volta com julgamento.",
            },
            sfx: { en: "GAZE.", pt: "OLHARES." },
            w: 1,
          },
          {
            msg: {
              en: "{n} books waiting for someone with actual free weekends.",
              pt: "{n} livros aguardando alguém com finais de semana livres.",
            },
            sfx: { en: "WEEKEND?", pt: "FÉRIAS?" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "checkout-started": {
    priority: 2,
    rules: [
      {
        action: null,
        id: "checkout-start",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Final chance to pretend financial and emotional maturity.",
              pt: "Última chance de fingir maturidade emocional e financeira.",
            },
            sfx: { en: "SURE?", pt: "CERTEZA?" },
            w: 2,
          },
          {
            msg: {
              en: "Entering checkout with {pages} pages. Your credit card is sighing.",
              pt: "Entrando no caixa com {pages} páginas. Seu cartão suspirou.",
            },
            sfx: { en: "CHECKOUT!", pt: "NO CAIXA!" },
            w: 1,
          },
          {
            msg: {
              en: "{total} on simulated books. The thrill of pretending to pay.",
              pt: "{total} em livros simulados. O prazer de fingir que está pagando.",
            },
            sfx: { en: "FINAL STEP.", pt: "FINAL." },
            w: 1,
          },
          {
            msg: {
              en: "Heading to payment. Will this actually turn into reading hours?",
              pt: "Indo ao pagamento. Isso vai virar hora de leitura ou só enfeite?",
            },
            sfx: { en: "MOMENT.", pt: "MOMENTO." },
            w: 1,
          },
          {
            msg: {
              en: "Commitment issues tested at the simulated cash register.",
              pt: "Seu medo de compromisso colocado à prova no caixa virtual.",
            },
            sfx: { en: "DEEP BREATH.", pt: "RESPIRA." },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "login-required": {
    priority: 1,
    rules: [
      {
        action: null,
        id: "login-gate",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Paying zero dollars still requires an account. Identity please.",
              pt: "Pagar nada ainda exige uma conta. Identifique-se primeiro.",
            },
            sfx: { en: "HOLD IT!", pt: "ALTO LÁ!" },
            w: 2,
          },
          {
            msg: {
              en: "We need someone’s name on this manifest of unread literature.",
              pt: "Precisamos de um nome no manifesto desses livros não lidos.",
            },
            sfx: { en: "WHO GOES?", pt: "QUEM É?" },
            w: 1,
          },
          {
            msg: {
              en: "Can’t hoard pretend books anonymously. Log in to claim credit.",
              pt: "Não dá para acumular livros no anonimato. Faça login.",
            },
            sfx: { en: "LOGIN!", pt: "CONECTE-SE!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  login: {
    priority: 2,
    rules: [
      {
        action: null,
        id: "logged-in",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Connected, {name}. Now you can hoard books officially.",
              pt: "Conectado, {name}. Agora você pode acumular oficialmente.",
            },
            sfx: { en: "WELCOME.", pt: "BEM-VINDO." },
            w: 2,
          },
          {
            msg: {
              en: "Welcome back, {name}. Your unread counter was waiting.",
              pt: "Bem-vindo de volta, {name}. Suas metas não cumpridas esperavam.",
            },
            sfx: { en: "HELLO.", pt: "OLÁ." },
            w: 1,
          },
          {
            msg: {
              en: "{name} logged in. Ready for another round of literary dopamine?",
              pt: "{name} conectado. Pronto para outra dose de dopamina editorial?",
            },
            sfx: { en: "READY.", pt: "PRONTO." },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "wish-added": {
    priority: 3,
    rules: [
      {
        action: null,
        id: "wish-incart",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Already in your cart and now in your wishlist. Double safety net.",
              pt: "Já está no carrinho e agora na lista de desejos. Medo de perder?",
            },
            sfx: { en: "HUH?", pt: "HEIN?" },
            w: 2,
          },
          {
            msg: {
              en: "In the cart to buy, in wishlist to ignore. Perfect harmony.",
              pt: "No carrinho para fingir que compra, na lista para esquecer.",
            },
            sfx: { en: "PARADOX.", pt: "PARADOXO." },
            w: 1,
          },
          {
            msg: {
              en: "Saving the same book in both places won’t read it for you.",
              pt: "Salvar nos dois lugares não vai abrir o livro por telepatia.",
            },
            sfx: { en: "REALLY?", pt: "SÉRIO?" },
            w: 1,
          },
        ],
        when: (c) => Boolean(c.inCart),
      },
      {
        action: null,
        id: "wish-graveyard",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "{n} wishes saved. Wishing is remarkably cheaper than reading.",
              pt: "{n} desejos salvos. Desejar continua mais barato do que ler.",
            },
            sfx: { en: "EASY.", pt: "CALMA." },
            w: 2,
          },
          {
            msg: {
              en: "Your wishlist is an archaeological site of unfulfilled intentions.",
              pt: "Sua lista de desejos é um sítio arqueológico de promessas.",
            },
            sfx: { en: "GRAVEYARD.", pt: "CEMITÉRIO." },
            w: 1,
          },
          {
            msg: {
              en: "Adding to wishlist: digital preservation of abandoned dreams.",
              pt: "Adicionado aos desejos: preservação digital de planos adiados.",
            },
            sfx: { en: "PRESERVED.", pt: "GUARDADO." },
            w: 1,
          },
        ],
        when: (c) => (c.wish ?? 0) >= 5,
      },
      {
        action: null,
        id: "generic",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Saved for later. We all know where 'later' ends up.",
              pt: "Guardado para depois. Todos sabemos onde o 'depois' vai parar.",
            },
            sfx: { en: "SAVED.", pt: "GUARDADO." },
            w: 2,
          },
          {
            msg: {
              en: "One more saved item to look at when you want to feel cultured.",
              pt: "Mais um livro salvo para você olhar e fingir intelectualidade.",
            },
            sfx: { en: "WISHED.", pt: "DESEJADO." },
            w: 1,
          },
          {
            msg: {
              en: "Added to wishlist. Safe from being accidentally read.",
              pt: "Na lista de desejos. A salvo do perigo de ser lido por engano.",
            },
            sfx: { en: "SAFE.", pt: "SEGURO." },
            w: 1,
          },
          {
            msg: {
              en: "Wish recorded. Your imaginary library expands quietly.",
              pt: "Desejo anotado. Sua biblioteca imaginária cresce em silêncio.",
            },
            sfx: { en: "WISHLIST.", pt: "DESEJO." },
            w: 1,
          },
          {
            msg: {
              en: "A neat little bookmark in the digital graveyard of books.",
              pt: "Um simpático marcador no cemitério digital de boas intenções.",
            },
            sfx: { en: "LATER.", pt: "DEPOIS." },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "review-posted": {
    priority: 2,
    rules: [
      {
        action: null,
        id: "review-unbought",
        levels: ["normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "A review from someone who never bought the book. Pure courage.",
              pt: "Uma resenha de quem nunca comprou o livro. Pura coragem crítica.",
            },
            sfx: { en: "CRITIC!", pt: "CRÍTICO!" },
            w: 2,
          },
          {
            msg: {
              en: "Reviewing unpurchased literature. The peak of opinionated internet.",
              pt: "Opinar sobre livro não comprado: o ápice da internet contemporânea.",
            },
            sfx: { en: "BOLD!", pt: "AUDAZ!" },
            w: 1,
          },
          {
            msg: {
              en: "Five stars based on cover typography alone. We respect the hustle.",
              pt: "Cinco estrelas avaliando só a fonte da capa. Respeitamos a ousadia.",
            },
            sfx: { en: "EXPERT!", pt: "PERITO!" },
            w: 1,
          },
        ],
        when: (c) => !c.owned,
      },
      {
        action: null,
        id: "generic",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Review posted before the spine even cracked. Well done.",
              pt: "Resenha publicada antes de abrir a orelha do livro. Parabéns.",
            },
            sfx: { en: "POSTED.", pt: "PUBLICADO." },
            w: 2,
          },
          {
            msg: {
              en: "Your literary verdict has been etched into our hall of opinions.",
              pt: "Seu veredito literário foi gravado no mural das opiniões sinceras.",
            },
            sfx: { en: "STAMPED.", pt: "CARIMBADO." },
            w: 1,
          },
          {
            msg: {
              en: "Review submitted. Other unread book hoarders appreciate your service.",
              pt: "Comentário enviado. Outros acumuladores de livros agradecem.",
            },
            sfx: { en: "APPLAUSE!", pt: "PALMAS!" },
            w: 1,
          },
          {
            msg: {
              en: "A review based on first impressions and solid aesthetic judgment.",
              pt: "Uma resenha guiada pela beleza da capa e intuição pura.",
            },
            sfx: { en: "INSIGHT.", pt: "VISÃO." },
            w: 1,
          },
          {
            msg: {
              en: "Your review is live. Next step: actually finishing chapter one.",
              pt: "Resenha no ar. Próximo passo: terminar o capítulo um.",
            },
            sfx: { en: "NOTED.", pt: "REGISTRADO." },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "pix-copied": {
    priority: 3,
    rules: [
      {
        action: null,
        id: "pix-copy",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Code copied. Paste into nowhere and pretend you settled the bill.",
              pt: "Código copiado. Cole em lugar nenhum e finja que pagou a conta.",
            },
            sfx: { en: "COPIED.", pt: "COPIADO." },
            w: 2,
          },
          {
            msg: {
              en: "Pix clipboard loaded. Central Bank doesn't even know we exist.",
              pt: "Pix na área de transferência. O Banco Central nem piscou.",
            },
            sfx: { en: "CLIPBOARD!", pt: "NA ÁREA!" },
            w: 1,
          },
          {
            msg: {
              en: "Pix key in hand. The fiction of commerce continues smoothly.",
              pt: "Chave Pix copiada. A simulação financeira corre a todo vapor.",
            },
            sfx: { en: "FAST!", pt: "RÁPIDO!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "pix-expired": {
    priority: 1,
    rules: [
      {
        action: {
          actionType: "retry",
          label: { en: "Try again", pt: "Tentar de novo" },
        },
        id: "pix-expired-rule",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Pix timer expired. Your unread books escaped back to the warehouse.",
              pt: "O Pix expirou. Seus livros não lidos fugiram de volta ao estoque.",
            },
            sfx: { en: "TIMEOUT!", pt: "EXPIROU!" },
            w: 2,
          },
          {
            msg: {
              en: "60 seconds elapsed. Procrastinating even simulated payments?",
              pt: "60 segundos se passaram. Procrastinando até pagamento de mentira?",
            },
            sfx: { en: "TOO SLOW!", pt: "LENTO!" },
            w: 1,
          },
          {
            msg: {
              en: "Pix QR expired. Even fictional money requires minimal speed.",
              pt: "QR Code venceu. Até dinheiro fictício exige um mínimo de agilidade.",
            },
            sfx: { en: "EXPIRED.", pt: "ACABOU." },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "card-declined": {
    priority: 1,
    rules: [
      {
        action: {
          actionType: "retry",
          label: { en: "Try again", pt: "Tentar de novo" },
        },
        id: "declined-rules",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Card ending {last4} declined. Even fake banks have standards.",
              pt: "Cartão final {last4} recusado. Até banco imaginário tem limites.",
            },
            sfx: { en: "DECLINED!", pt: "RECUSADO!" },
            w: 2,
          },
          {
            msg: {
              en: "Your imaginary limit ran out. Call your fictional banker.",
              pt: "Seu limite fictício estourou. Reclame com seu gerente de mentira.",
            },
            sfx: { en: "NO CREDIT!", pt: "SEM LIMITE!" },
            w: 1,
          },
          {
            msg: {
              en: "{brand} refused this transaction. Your bookshelf breathed in relief.",
              pt: "Bandeira {brand} rejeitou a compra. Sua estante respirou aliviada.",
            },
            sfx: { en: "BLOCKED!", pt: "TRAVOU!" },
            w: 1,
          },
          {
            msg: {
              en: "Transaction declined. Even the simulated server smelled tsundoku.",
              pt: "Transação recusada. Até o algoritmo sentiu cheiro de tsundoku.",
            },
            sfx: { en: "DENIED!", pt: "NEGADO!" },
            w: 1,
          },
          {
            msg: {
              en: "Payment failed. Fictional interest rates must have spooked them.",
              pt: "Pagamento não passou. Os juros fictícios assustaram a operadora.",
            },
            sfx: { en: "BOOM!", pt: "CABRUM!" },
            w: 1,
          },
          {
            msg: {
              en: "Card rejected. A polite digital intervention for your hoarding.",
              pt: "Cartão recusado. Uma intervenção digital contra sua compulsão.",
            },
            sfx: { en: "REJECTED!", pt: "REJEITADO!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "purchase-completed": {
    priority: 1,
    rules: [
      {
        action: null,
        id: "first-order",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "First order confirmed. The ceremony of not reading has officially begun.",
              pt: "Primeiro pedido confirmado. O ritual de não ler começou oficialmente.",
            },
            sfx: { en: "KA-CHING!", pt: "KA-CHING!" },
            w: 2,
          },
          {
            msg: {
              en: "Order placed. Zero dollars spent, thousands of unread pages gained.",
              pt: "Pedido feito. Zero reais gastos, milhares de páginas ganhas.",
            },
            sfx: { en: "PLIM!", pt: "PLIM!" },
            w: 1,
          },
          {
            msg: {
              en: "Fictional checkout complete. Your bookshelf prepares for glory.",
              pt: "Checkout concluído. Sua estante se prepara para brilhar.",
            },
            sfx: { en: "ORDERED!", pt: "CONFIRMADO!" },
            w: 1,
          },
        ],
        when: (c) => (c.orders?.length ?? 1) === 1,
      },
      {
        action: null,
        id: "repeat-buyer",
        levels: ["normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Order #{n}. You are developing a very clear pattern of book hoarding.",
              pt: "Pedido #{n}. Você está consolidando um padrão claro de acumulação.",
            },
            sfx: { en: "REPEAT!", pt: "DE NOVO!" },
            w: 2,
          },
          {
            msg: {
              en: "Another batch of {pages} unread pages heading to your living room.",
              pt: "Outro lote de {pages} páginas não lidas a caminho da sua sala.",
            },
            sfx: { en: "MORE BOOKS!", pt: "MAIS LIVROS!" },
            w: 1,
          },
          {
            msg: {
              en: "Confirmed again. The courier knows your address by memory.",
              pt: "Confirmado de novo. A transportadora já gravou seu endereço.",
            },
            sfx: { en: "HABIT!", pt: "HÁBITO!" },
            w: 1,
          },
        ],
        when: (c) => (c.orders?.length ?? 0) >= 2,
      },
      {
        action: null,
        id: "generic",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "{pages} pages secured. Zero commitments made to start today.",
              pt: "{pages} páginas garantidas. Zero compromisso de começar hoje.",
            },
            sfx: { en: "DONE!", pt: "PAGO!" },
            w: 2,
          },
          {
            msg: {
              en: "Receipt printed into the void. Your bookshelf looks impressive.",
              pt: "Comprovante enviado ao vácuo. Sua estante vai ficar linda.",
            },
            sfx: { en: "SUCCESS!", pt: "SUCESSO!" },
            w: 1,
          },
          {
            msg: {
              en: "Payment accepted. Fictionally delivered, eternally postponed.",
              pt: "Pagamento aceito. Ficticiamente entregue, eternamente adiado.",
            },
            sfx: { en: "SETTLED.", pt: "QUITADO." },
            w: 1,
          },
          {
            msg: {
              en: "Order locked in. A milestone in pretend consumer satisfaction.",
              pt: "Pedido fechado. Um marco na satisfação do consumidor imaginário.",
            },
            sfx: { en: "CHING!", pt: "PLIN!" },
            w: 1,
          },
          {
            msg: {
              en: "Transaction settled. {total} saved from actual real-world bank bills.",
              pt: "Compra fechada. {total} poupados da fatura do mundo real.",
            },
            sfx: { en: "KA-CHING!", pt: "KA-CHING!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "delivery-stage": {
    priority: 2,
    rules: [
      {
        action: null,
        id: "stage-change",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Stage updated: {stage}. Code {code} moving through the vortex.",
              pt: "Etapa atualizada: {stage}. Código {code} viajando pelo vórtice.",
            },
            sfx: { en: "TRACKING!", pt: "RASTREIO!" },
            w: 2,
          },
          {
            msg: {
              en: "Package status changed to {stage}. Estimated arrival: {eta}.",
              pt: "Status mudou para {stage}. Previsão de chegada: {eta}.",
            },
            sfx: { en: "TRANSIT.", pt: "A CAMINHO." },
            w: 1,
          },
          {
            msg: {
              en: "Your books are in {stage}. They don't know they won't be read.",
              pt: "Seus livros estão em {stage}. Eles nem sabem que não serão lidos.",
            },
            sfx: { en: "ON ROAD.", pt: "NA ROTA." },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  delivered: {
    priority: 1,
    rules: [
      {
        action: null,
        id: "delivered-rule",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Delivered! {pages} pages arrived safely to decorate your home.",
              pt: "Entregue! {pages} páginas chegaram para decorar a sua estante.",
            },
            sfx: { en: "KNOCK KNOCK!", pt: "TOC TOC!" },
            w: 2,
          },
          {
            msg: {
              en: "Delivery confirmed. You can now place them spine-out and relax.",
              pt: "Entrega confirmada. Já pode colocar na prateleira com a lombada visível.",
            },
            sfx: { en: "ARRIVED!", pt: "CHEGOU!" },
            w: 1,
          },
          {
            msg: {
              en: "Your parcel has arrived. Smell that fresh, unread paper scent.",
              pt: "Pacote na porta. Sinta o cheiro do papel fresco que nunca será lido.",
            },
            sfx: { en: "DELIVERED!", pt: "ENTREGUE!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "delivery-receipt-confirmed": {
    priority: 1,
    rules: [
      {
        action: null,
        id: "delivery-receipt-confirmed-rule",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Receipt confirmed! Officially in your hands. Now the excuses officially begin.",
              pt: "Recebimento confirmado! Oficialmente em mãos. Agora acabaram as desculpas.",
            },
            sfx: { en: "OFFICIAL!", pt: "CONFERIDO!" },
            w: 2,
          },
          {
            msg: {
              en: "Package signed for. May your bedside table hold the weight of these ambitions.",
              pt: "Pacote recebido. Que a sua mesinha de cabeceira suporte o peso dessas ambições.",
            },
            sfx: { en: "SIGNED!", pt: "ASSINADO!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  idle: {
    priority: 3,
    rules: [
      {
        action: {
          actionType: "catalog",
          label: { en: "Browse books", pt: "Ver livros" },
        },
        id: "idle-catalog",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "90 seconds of inactivity. Are you contemplating {title} or napping?",
              pt: "90 segundos sem tocar na tela. Admirando {title} ou cochilando?",
            },
            sfx: { en: "WAKE UP!", pt: "ACORDA!" },
            w: 2,
          },
          {
            msg: {
              en: "Still here? The books won't read themselves while you stare.",
              pt: "Ainda aí? Os livros não vão se ler sozinhos enquanto você encara.",
            },
            sfx: { en: "HELLO?", pt: "ALÔ?" },
            w: 1,
          },
          {
            msg: {
              en: "Procrastination detected. Staring at book covers burns zero calories.",
              pt: "Procrastinação detectada. Olhar para a capa não queima calorias.",
            },
            sfx: { en: "IDLE!", pt: "PARADO!" },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },

  "cart-removed": {
    priority: 3,
    rules: [
      {
        action: {
          actionType: "undo",
          label: { en: "Undo", pt: "Desfazer" },
        },
        id: "cart-empty",
        levels: ["normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Cart is completely empty. A rare moment of total lucidity.",
              pt: "Carrinho vazio. Um momento raro e efêmero de lucidez financeira.",
            },
            sfx: { en: "MIRACLE!", pt: "MILAGRE!" },
            w: 2,
          },
          {
            msg: {
              en: "Clean slate. You avoided {pages} pages of pending guilt.",
              pt: "Limpeza total. Você evitou {pages} páginas de culpa acumulada.",
            },
            sfx: { en: "CLEAN.", pt: "LIMPO." },
            w: 1,
          },
          {
            msg: {
              en: "All books discarded. Your bookshelf gives a quiet sigh of relief.",
              pt: "Tudo removido. A estante suspirou de alívio por hoje.",
            },
            sfx: { en: "RELIEF!", pt: "ALÍVIO!" },
            w: 1,
          },
        ],
        when: (c) => (c.cart?.length ?? 0) === 0,
      },
      {
        action: {
          actionType: "undo",
          label: { en: "Undo", pt: "Desfazer" },
        },
        id: "generic",
        levels: ["educado", "normal", "impiedoso"],
        variants: [
          {
            msg: {
              en: "Removed. The lingering guilt, however, remains untouched.",
              pt: "Removido. A culpa residual, no entanto, segue intacta.",
            },
            sfx: { en: "TSK.", pt: "TSC." },
            w: 2,
          },
          {
            msg: {
              en: "One less book. Still {pages} pages left in your pending pile.",
              pt: "Um a menos. Ainda restam {pages} páginas na sua pilha pendente.",
            },
            sfx: { en: "ONE DOWN.", pt: "MENOS UM." },
            w: 1,
          },
          {
            msg: {
              en: "{title} returned to the shelf. A sensible tactical retreat.",
              pt: "{title} devolvido à estante. Um recuo tático compreensível.",
            },
            sfx: { en: "RETREAT.", pt: "RECUO." },
            w: 1,
          },
          {
            msg: {
              en: "Book dismissed. Postponing your reading has never been easier.",
              pt: "Livro dispensado. Adiar a leitura nunca foi tão prático.",
            },
            sfx: { en: "BYE!", pt: "TCHAU!" },
            w: 1,
          },
          {
            msg: {
              en: "Saved {pages} pages of reading effort. Your couch thanks you.",
              pt: "Economizou {pages} páginas de esforço. Seu sofá agradece.",
            },
            sfx: { en: "SAVED.", pt: "POUPADO." },
            w: 1,
          },
        ],
        when: () => true,
      },
    ],
  },
};

// -------------------------------------------------------------
// SESSION STATE AND DISPATCH LOGIC (ANTI-REPETITION & CADENCE)
// -------------------------------------------------------------
const SESSION_KEY = "del_roast_state";

let inMemoryState: RoastSessionState = {
  actions: 0,
  aiCache: {},
  lastRuleByEvent: {},
  lastShownAt: {},
  recentVariants: {},
  shownCount: {},
};

export function getRoastSessionState(): RoastSessionState {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return inMemoryState;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return inMemoryState;
    const parsed = JSON.parse(raw);
    return {
      actions: parsed.actions ?? 0,
      aiCache: parsed.aiCache ?? {},
      lastRuleByEvent: parsed.lastRuleByEvent ?? {},
      lastShownAt: parsed.lastShownAt ?? {},
      lastStingIndex: parsed.lastStingIndex,
      recentVariants: parsed.recentVariants ?? {},
      shownCount: parsed.shownCount ?? {},
    };
  } catch {
    return inMemoryState;
  }
}

export function saveRoastSessionState(state: RoastSessionState): void {
  inMemoryState = state;
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    } catch {
      // Storage quota or privacy mode ignored
    }
  }
}

export function clearRoastSessionState(): void {
  inMemoryState = {
    actions: 0,
    aiCache: {},
    lastRuleByEvent: {},
    lastShownAt: {},
    recentVariants: {},
    shownCount: {},
  };
  if (typeof window !== "undefined" && window.sessionStorage) {
    try {
      window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
      // Ignore
    }
  }
}

export function shouldThrottleEvent(
  event: RoastEvent,
  priority: Priority,
  state: RoastSessionState,
  now = Date.now()
): boolean {
  if (priority === 1) return false;
  const lastTime = state.lastShownAt[event] ?? 0;
  const elapsed = now - lastTime;
  if (priority === 2 && elapsed < 4000) return true;
  if (priority === 3 && elapsed < 10000) return true;
  return false;
}

export function selectRoastFromCatalog(
  event: RoastEvent,
  ctx: RoastContext,
  level: IntensityLevel = "normal",
  locale: Locale = "pt"
): EvaluatedRoast | null {
  const eventDef = ROASTS[event];
  if (!eventDef) return null;

  const state = getRoastSessionState();
  const now = Date.now();

  // Cooldown check for P2 (4s) and P3 (10s)
  if (shouldThrottleEvent(event, eventDef.priority, state, now)) {
    return null;
  }

  // 1. Filter rules matching context condition & allowed in intensity level
  const matchingRules = eventDef.rules.filter(
    (r) => r.levels.includes(level) && r.when(ctx)
  );
  if (!matchingRules.length) return null;

  // 2. Select first matching rule, skipping last used rule for this event if alternatives exist
  const lastRuleId = state.lastRuleByEvent[event];
  let selectedRule = matchingRules[0];
  if (
    matchingRules.length > 1 &&
    matchingRules[0].id === lastRuleId &&
    matchingRules[1]
  ) {
    selectedRule = matchingRules[1];
  }

  // 3. Choose a variant with weight, excluding the last 2 shown for this rule
  const ruleId = selectedRule.id;
  const recentForThisRule = state.recentVariants[ruleId] ?? [];
  const availableVariantsWithIndices = selectedRule.variants
    .map((v, idx) => ({ idx, v }))
    .filter(({ idx }) => {
      if (
        selectedRule.variants.length > 2 &&
        recentForThisRule.includes(idx)
      ) {
        return false;
      }
      const variantKey = `${event}:${ruleId}:${idx}`;
      const shownSoFar = state.shownCount[variantKey] ?? 0;
      return shownSoFar < 2; // Each variant max 2 times per session
    });

  const pool = availableVariantsWithIndices.length
    ? availableVariantsWithIndices
    : selectedRule.variants.map((v, idx) => ({ idx, v }));

  const totalWeight = pool.reduce((sum, item) => sum + item.v.w, 0);
  let randomVal = Math.random() * totalWeight;
  let chosen = pool[0];
  for (const item of pool) {
    if (randomVal < item.v.w) {
      chosen = item;
      break;
    }
    randomVal -= item.v.w;
  }

  // 4. Interpolate text
  let rawMsg = chosen.v.msg[locale] || chosen.v.msg.pt;
  let rawSfx = chosen.v.sfx[locale] || chosen.v.sfx.pt;

  let msg = interpolateText(rawMsg, ctx, locale);
  let sfx = rawSfx.toUpperCase().trim();

  // 5. If ruthless level and actions > 3, append sting without repeating previous
  const nextActions = state.actions + 1;
  if (level === "impiedoso" && nextActions > 3 && STINGS.length > 0) {
    const lastSting = state.lastStingIndex ?? -1;
    let stingIdx = Math.floor(Math.random() * STINGS.length);
    if (stingIdx === lastSting && STINGS.length > 1) {
      stingIdx = (stingIdx + 1) % STINGS.length;
    }
    const stingObj = STINGS[stingIdx];
    const stingText = stingObj[locale] || stingObj.pt;
    if (msg.length + stingText.length + 1 <= 140) {
      msg = `${msg} ${stingText}`;
    }
    state.lastStingIndex = stingIdx;
  }

  // Ensure maximum 140 characters as defined in spec
  if (msg.length > 140) {
    msg = msg.slice(0, 137) + "...";
  }

  // 6. Update session state
  const variantKey = `${event}:${ruleId}:${chosen.idx}`;
  const updatedRecent = [
    chosen.idx,
    ...recentForThisRule.filter((i) => i !== chosen.idx),
  ].slice(0, 2);

  state.actions = nextActions;
  state.lastRuleByEvent[event] = ruleId;
  state.recentVariants[ruleId] = updatedRecent;
  state.shownCount[variantKey] = (state.shownCount[variantKey] ?? 0) + 1;
  state.lastShownAt[event] = now;
  saveRoastSessionState(state);

  const action = chosen.v.action || selectedRule.action || null;
  const resolvedAction = action
    ? {
        actionType: action.actionType,
        label: action.label[locale] || action.label.pt,
      }
    : null;

  return {
    action: resolvedAction,
    event,
    msg,
    priority: eventDef.priority,
    ruleId,
    sfx,
    variantIndex: chosen.idx,
  };
}
