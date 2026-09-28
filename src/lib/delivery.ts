import type { Locale } from "./catalog";
import type { Order } from "./store";

export interface StageDefinition {
  desc: { pt: string; en: string };
  icon: string;
  label: { pt: string; en: string };
  roast: { pt: string; en: string };
  sfx: { pt: string; en: string };
  w: number;
}

export const DELIVERY_STAGES: readonly StageDefinition[] = [
  {
    desc: {
      en: "We got your order and your promise to read.",
      pt: "Recebemos o pedido e sua promessa de ler.",
    },
    icon: "✓",
    label: {
      en: "Order confirmed",
      pt: "Pedido confirmado",
    },
    roast: {
      en: "Order logged. Your promise to read too, for legal purposes.",
      pt: "Pedido registrado. A promessa de leitura também, para fins jurídicos.",
    },
    sfx: { en: "NOTED!", pt: "ANOTADO!" },
    w: 0.5,
  },
  {
    desc: {
      en: "Someone is dusting off the spines.",
      pt: "Alguém está tirando o pó das lombadas.",
    },
    icon: "▤",
    label: {
      en: "Picking from the shelf",
      pt: "Separando na estante",
    },
    roast: {
      en: "They’re taking your books off the shelf. Ironically, the opposite of what you’ll do.",
      pt: "Estão tirando seus livros da estante. Ironicamente, o contrário do que você fará.",
    },
    sfx: { en: "ACHOO!", pt: "ATCHIM!" },
    w: 1,
  },
  {
    desc: {
      en: "Bubble wrap popped only a little.",
      pt: "Plástico-bolha estourado só um pouquinho.",
    },
    icon: "▣",
    label: {
      en: "Packed",
      pt: "Embalado",
    },
    roast: {
      en: "Packed with more care than you’ll ever give them.",
      pt: "Embalado com mais cuidado do que você terá com eles.",
    },
    sfx: { en: "POP!", pt: "PLOC!" },
    w: 1,
  },
  {
    desc: {
      en: "Left the warehouse, headed for your pile.",
      pt: "Deixou o galpão rumo à sua pilha.",
    },
    icon: "⌂",
    label: {
      en: "Left the distribution center",
      pt: "Saiu do centro de distribuição",
    },
    roast: {
      en: "Left the warehouse. The warehouse, at least, read the invoice.",
      pt: "Saiu do galpão. O galpão, pelo menos, leu a nota fiscal.",
    },
    sfx: { en: "VROOM!", pt: "VRUUM!" },
    w: 1.5,
  },
  {
    desc: {
      en: "Traveling faster than you read.",
      pt: "Viajando mais rápido do que você lê.",
    },
    icon: "→",
    label: {
      en: "In transit",
      pt: "Em trânsito",
    },
    roast: {
      en: "In transit. It’s covered more miles than you’ll cover pages.",
      pt: "Em trânsito. Já percorreu mais quilômetros do que você vai percorrer de páginas.",
    },
    sfx: { en: "WHOOSH!", pt: "FIUUU!" },
    w: 2,
  },
  {
    desc: {
      en: "The courier is on your street. Hide the previous pile.",
      pt: "O entregador está na sua rua. Esconda a pilha anterior.",
    },
    icon: "⚑",
    label: {
      en: "Out for delivery",
      pt: "Saiu para entrega",
    },
    roast: {
      en: "Out for delivery. Make room on the nightstand. Again.",
      pt: "Saiu para entrega. Abra espaço na mesa de cabeceira. De novo.",
    },
    sfx: { en: "BEEP-BEEP!", pt: "BI-BI!" },
    w: 1.5,
  },
  {
    desc: {
      en: "Package at your door. Awaiting your confirmation to join the unread pile.",
      pt: "Pacote na sua porta. Aguardando sua confirmação para entrar na pilha.",
    },
    icon: "📦",
    label: {
      en: "Awaiting confirmation",
      pt: "Aguardando confirmação",
    },
    roast: {
      en: "Delivered. Now confess you've received them before pretending you'll read them.",
      pt: "Entregue. Agora confesse que recebeu antes de fingir que vai ler.",
    },
    sfx: { en: "DING-DONG!", pt: "DING-DONG!" },
    w: 0,
  },
  {
    desc: {
      en: "Officially delivered & confirmed. No more excuses for not opening them.",
      pt: "Oficialmente entregue e confirmado. Acabaram as desculpas para não abrir os livros.",
    },
    icon: "★",
    label: {
      en: "Receipt confirmed",
      pt: "Recebimento confirmado",
    },
    roast: {
      en: "Receipt confirmed. No more excuses for not opening them.",
      pt: "Recebimento confirmado. Acabaram as desculpas para não abrir os livros.",
    },
    sfx: { en: "CONFIRMED!", pt: "CONFIRMADO!" },
    w: 0,
  },
];

export const DEFAULT_BASE_SECONDS = 16;

export function getStageStarts(base = DEFAULT_BASE_SECONDS): number[] {
  const starts: number[] = [];
  let acc = 0;
  for (let i = 0; i < DELIVERY_STAGES.length; i += 1) {
    starts[i] = acc;
    acc += DELIVERY_STAGES[i].w * base;
  }
  return starts;
}

export function formatMmSs(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${String(rem).padStart(2, "0")}`;
}

export interface DeliveryTimelineStep {
  current: boolean;
  desc: string;
  icon: string;
  index: number;
  isDone: boolean;
  label: string;
  notLast: boolean;
  pctCss: string;
  scheduledTime: string;
  timeRemainingFormatted: string;
  whenBadge: string;
}

export interface DeliveryState {
  arrived: boolean;
  confirmed: boolean;
  currentStage: StageDefinition;
  delivered: boolean;
  elapsed: number;
  etaClock: string;
  etaFormatted: string;
  inStage: number;
  pct: number;
  pctCss: string;
  skipDeltaSeconds: number;
  stageDur: number;
  stageIndex: number;
  stageLeftSeconds: number;
  stagePct: number;
  stagePctCss: string;
  steps: DeliveryTimelineStep[];
  totalDuration: number;
  totalLeftSeconds: number;
}

export function calculateDeliveryState(
  order: Order,
  locale: Locale,
  nowMs = Date.now(),
  baseSeconds = DEFAULT_BASE_SECONDS
): DeliveryState {
  const createdAtMs = Date.parse(order.createdAt) || nowMs;
  const skew = order.skew ?? 0;
  const elapsed = (nowMs - createdAtMs) / 1000 + skew;

  const starts = getStageStarts(baseSeconds);
  const totalDuration = starts[6]; // 120s transit duration to reach stage 7
  const isConfirmed = Boolean(order.receiptConfirmed);

  let stageIndex = 0;
  for (let i = 0; i <= 6; i += 1) {
    if (elapsed >= starts[i]) {
      stageIndex = i;
    }
  }

  // Once receipt is confirmed, advance to terminal stage 8 (index 7)
  if (isConfirmed) {
    stageIndex = 7;
  }

  const arrived = elapsed >= totalDuration;
  const delivered = isConfirmed;
  const currentStage = DELIVERY_STAGES[stageIndex];
  const stageDur = currentStage.w * baseSeconds;
  const inStage = Math.max(0, elapsed - starts[stageIndex]);

  // Total journey has 8 stages.
  // Transit stages scale from 0% up to 88% (step 7: awaiting confirmation).
  // Once confirmed, progress is 100% (step 8: receipt confirmed).
  let pct = 0;
  if (delivered) {
    pct = 100;
  } else if (arrived) {
    pct = 88;
  } else {
    pct = Math.min(87, Math.round((elapsed / totalDuration) * 88));
  }
  const pctCss = `${pct}%`;

  const totalLeftSeconds = Math.max(0, Math.ceil(totalDuration - elapsed));
  const stageLeftSeconds = arrived
    ? 0
    : Math.max(0, Math.ceil(stageDur - inStage));
  const stagePct =
    arrived || stageDur === 0
      ? 100
      : Math.min(100, Math.max(0, (inStage / stageDur) * 100));
  const stagePctCss = `${stagePct.toFixed(1)}%`;

  const orderOriginMs = createdAtMs - skew * 1000;
  const formatClock = (secOffset: number) =>
    new Date(orderOriginMs + secOffset * 1000).toLocaleTimeString(
      locale === "pt" ? "pt-BR" : "en-US",
      { hour: "2-digit", minute: "2-digit" }
    );

  const etaClock = formatClock(totalDuration);
  const etaFormatted = arrived ? etaClock : formatMmSs(totalLeftSeconds);

  // Can only skip forward during automated transit stages (0 to 5)
  const skipDeltaSeconds =
    stageIndex < 6 ? Math.max(0.1, starts[stageIndex + 1] - elapsed + 0.05) : 0;

  const steps: DeliveryTimelineStep[] = DELIVERY_STAGES.map((st, i) => {
    const isDone = isConfirmed ? true : i < stageIndex;
    const isCurrent = isConfirmed ? false : i === stageIndex;
    const stepScheduled = formatClock(starts[i]);

    let whenBadge = "";
    if (isDone) {
      if (i === 7 && order.confirmedReceiptAt) {
        const confirmedTime = new Date(
          order.confirmedReceiptAt
        ).toLocaleTimeString(locale === "pt" ? "pt-BR" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        whenBadge = `✓ ${confirmedTime}`;
      } else {
        whenBadge = `✓ ${stepScheduled}`;
      }
    } else if (isCurrent) {
      whenBadge = locale === "pt" ? "● AGORA" : "● NOW";
    } else {
      whenBadge = `${locale === "pt" ? "prev." : "est."} ${stepScheduled}`;
    }

    const currentLeft = isCurrent ? stageLeftSeconds : 0;
    const currentPct = isCurrent ? stagePctCss : isDone ? "100%" : "0%";

    return {
      current: isCurrent,
      desc: st.desc[locale],
      icon: isDone || isCurrent ? st.icon : String(i + 1),
      index: i,
      isDone,
      label: st.label[locale],
      notLast: i < DELIVERY_STAGES.length - 1,
      pctCss: currentPct,
      scheduledTime: stepScheduled,
      timeRemainingFormatted: formatMmSs(currentLeft),
      whenBadge,
    };
  });

  return {
    arrived,
    confirmed: isConfirmed,
    currentStage,
    delivered,
    elapsed,
    etaClock,
    etaFormatted,
    inStage,
    pct,
    pctCss,
    skipDeltaSeconds,
    stageDur,
    stageIndex,
    stageLeftSeconds,
    stagePct: Math.round(stagePct),
    stagePctCss,
    steps,
    totalDuration,
    totalLeftSeconds,
  };
}

export function getStageColorClasses(
  stageIndex: number,
  confirmed = false
): {
  badgeBg: string;
  badgeFg: string;
  heroBg: string;
} {
  if (stageIndex >= 7 || confirmed) {
    // Stage 8: Recebimento confirmado (Green)
    return {
      badgeBg: "bg-green",
      badgeFg: "text-ink",
      heroBg: "bg-green",
    };
  }
  if (stageIndex === 6) {
    // Stage 7: Aguardando confirmação (Yellow)
    return {
      badgeBg: "bg-yellow",
      badgeFg: "text-ink",
      heroBg: "bg-yellow",
    };
  }
  if (stageIndex === 5) {
    // Stage 6: Saiu para entrega (Red)
    return {
      badgeBg: "bg-red",
      badgeFg: "text-white",
      heroBg: "bg-yellow",
    };
  }
  if (stageIndex >= 3) {
    // Stages 4-5: Saiu do CD / Em trânsito (Blue)
    return {
      badgeBg: "bg-blue",
      badgeFg: "text-ink",
      heroBg: "bg-yellow",
    };
  }
  // Stages 1-3: Confirmado / Separando / Embalado (Yellow)
  return {
    badgeBg: "bg-yellow",
    badgeFg: "text-ink",
    heroBg: "bg-yellow",
  };
}
