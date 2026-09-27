import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActionButton } from "@/components/store/action-button";
import { formatAddressLine } from "@/components/store/address-manager";
import { EmptyState } from "@/components/store/layout";
import { Input } from "@/components/ui/input";
import { formatPrice, readingHours } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useInsertedPanelMotion, useRouteEntrance } from "@/lib/motion";
import {
  dispatchCardDeclined,
  dispatchCheckoutStarted,
  dispatchPixCopied,
  dispatchPixExpired,
  dispatchPurchaseCompleted,
} from "@/lib/roast-trigger";
import {
  type Address,
  getCartBooks,
  getCartTotals,
  useStore,
} from "@/lib/store";
import { formatCep, lookupCep } from "@/lib/viacep";

export const Route = createFileRoute("/checkout/")({ component: CheckoutPage });

const REGEX_VISA = /^4/;
const REGEX_MASTERCARD = /^5/;
const REGEX_AMEX = /^3/;
const REGEX_ELO = /^6/;
const REGEX_CARD_EXP = /^(0[1-9]|1[0-2])\/\d{2}$/;
const REGEX_DIGITS = /\D/g;
const REGEX_CARD_GROUP = /(\d{4})(?=\d)/g;

function detectBrand(num: string) {
  const clean = num.replace(REGEX_DIGITS, "");
  if (REGEX_VISA.test(clean)) {
    return "VISA";
  }
  if (REGEX_MASTERCARD.test(clean)) {
    return "MASTERCARD";
  }
  if (REGEX_AMEX.test(clean)) {
    return "AMEX";
  }
  if (REGEX_ELO.test(clean)) {
    return "ELO";
  }
  return "CARD";
}

function isFinderPattern(r: number, c: number): boolean {
  const fr = (r < 7 && c < 7) || (r < 7 && c > 17) || (r > 17 && c < 7);
  if (!fr) {
    return false;
  }
  const rr = r > 17 ? r - 18 : r;
  const cc = c > 17 ? c - 18 : c;
  return (
    rr === 0 ||
    rr === 6 ||
    cc === 0 ||
    cc === 6 ||
    (rr >= 2 && rr <= 4 && cc >= 2 && cc <= 4)
  );
}

function isSeparator(r: number, c: number): boolean {
  return (
    (r === 7 || c === 7 || r === 17 || c === 17) &&
    (r < 8 || r > 16) &&
    (c < 8 || c > 16)
  );
}

interface QrCell {
  color: string;
  id: string;
}

function generateQrMatrix(totalCents: number): QrCell[] {
  const cells: QrCell[] = [];
  for (let r = 0; r < 25; r += 1) {
    for (let c = 0; c < 25; c += 1) {
      let on = false;
      if (isFinderPattern(r, c)) {
        on = true;
      } else if (!isSeparator(r, c)) {
        const seed =
          Math.sin(r * 12.9898 + c * 78.233 + totalCents) * 43_758.5453;
        on = ((seed % 1) + 1) % 1 > 0.5;
      }
      cells.push({
        color: on ? "oklch(14.7% 0.004 49.25)" : "#ffffff",
        id: `qr-${r}-${c}`,
      });
    }
  }
  return cells;
}

interface AddressSectionProps {
  loadingCep: boolean;
  newCep: string;
  newCity: string;
  newComp: string;
  newLabel: string;
  newNumber: string;
  newStreet: string;
  newUf: string;
  onCepChange: (val: string) => void;
  onCityChange: (val: string) => void;
  onCompChange: (val: string) => void;
  onLabelChange: (val: string) => void;
  onNumberChange: (val: string) => void;
  onSaveToggle: (val: boolean) => void;
  onSelectAddr: (id: string) => void;
  onStreetChange: (val: string) => void;
  onUfChange: (val: string) => void;
  prefAddrId?: string | null;
  saveAddrToAccount: boolean;
  savedAddresses: Address[];
  selectedAddrId: string;
  text: ReturnType<typeof t>;
}

function AddressSection({
  loadingCep,
  newCep,
  newCity,
  newComp,
  newLabel,
  newNumber,
  newStreet,
  newUf,
  onCepChange,
  onCityChange,
  onCompChange,
  onLabelChange,
  onNumberChange,
  onSaveToggle,
  onSelectAddr,
  onStreetChange,
  onUfChange,
  prefAddrId,
  saveAddrToAccount,
  savedAddresses,
  selectedAddrId,
  text,
}: AddressSectionProps) {
  return (
    <div className="flex flex-col gap-4 border-[3px] border-line bg-card p-6 shadow-[6px_6px_0_var(--line)]">
      <h2 className="font-display text-2xl text-ink">{text.addresses}</h2>

      {savedAddresses.length > 0 ? (
        <div className="flex flex-col gap-3">
          {savedAddresses.map((a) => {
            const isSelected = selectedAddrId === a.id;
            return (
              <button
                className={`flex cursor-pointer items-center gap-3 border-2 border-line p-3 text-left transition-[box-shadow,transform] ${
                  isSelected
                    ? "bg-yellow shadow-[4px_4px_0_var(--line)]"
                    : "bg-card hover:bg-paper"
                }`}
                key={a.id}
                onClick={() => onSelectAddr(a.id)}
                type="button"
              >
                <span
                  className={`h-4 w-4 rounded-full border-2 border-line ${
                    isSelected ? "bg-ink" : "bg-card"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink text-sm">
                      {a.label}
                    </span>
                    {a.id === prefAddrId ? (
                      <span className="border border-line bg-paper px-1 font-data text-[10px] text-ink">
                        {text.preferred}
                      </span>
                    ) : null}
                  </div>
                  <span className="block truncate text-ink/80 text-xs">
                    {formatAddressLine(a)}
                  </span>
                </div>
              </button>
            );
          })}

          <button
            className={`flex cursor-pointer items-center gap-3 border-2 border-line p-3 text-left transition-[box-shadow,transform] ${
              selectedAddrId === "new"
                ? "bg-yellow shadow-[4px_4px_0_var(--line)]"
                : "bg-card hover:bg-paper"
            }`}
            onClick={() => onSelectAddr("new")}
            type="button"
          >
            <span
              className={`h-4 w-4 rounded-full border-2 border-line ${
                selectedAddrId === "new" ? "bg-ink" : "bg-card"
              }`}
            />
            <span className="font-bold text-ink text-sm">
              ＋ {text.newAddr}
            </span>
          </button>
        </div>
      ) : null}

      {selectedAddrId === "new" || savedAddresses.length === 0 ? (
        <div className="flex animate-del-in flex-col gap-3 border-2 border-line bg-paper p-4">
          <label
            className="flex flex-col gap-1 font-bold text-ink text-sm"
            htmlFor="co-new-label"
          >
            <span>{text.addrLabel}</span>
            <Input
              className="rounded-none border-2 border-line bg-card px-3 text-ink"
              id="co-new-label"
              onChange={(e) => onLabelChange(e.target.value)}
              placeholder={text.addrLabelPh}
              value={newLabel}
            />
          </label>

          <div className="flex flex-wrap gap-3">
            <label
              className="flex min-w-[130px] flex-1 flex-col gap-1 font-bold text-ink text-sm"
              htmlFor="co-new-cep"
            >
              <span className="flex items-center justify-between">
                {text.addrCep}
                {loadingCep ? <span className="text-xs">...</span> : null}
              </span>
              <Input
                className="rounded-none border-2 border-line bg-card px-3 text-ink"
                id="co-new-cep"
                maxLength={9}
                onChange={(e) => onCepChange(e.target.value)}
                placeholder="00000-000"
                value={newCep}
              />
            </label>

            <label
              className="flex min-w-[200px] flex-[3] flex-col gap-1 font-bold text-ink text-sm"
              htmlFor="co-new-street"
            >
              <span>{text.addrStreet}</span>
              <Input
                className="rounded-none border-2 border-line bg-card px-3 text-ink"
                id="co-new-street"
                onChange={(e) => onStreetChange(e.target.value)}
                placeholder={text.addrStreetPh}
                value={newStreet}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-3">
            <label
              className="flex min-w-[80px] flex-1 flex-col gap-1 font-bold text-ink text-sm"
              htmlFor="co-new-number"
            >
              <span>{text.addrNumber}</span>
              <Input
                className="rounded-none border-2 border-line bg-card px-3 text-ink"
                id="co-new-number"
                onChange={(e) => onNumberChange(e.target.value)}
                placeholder="123"
                value={newNumber}
              />
            </label>

            <label
              className="flex min-w-[140px] flex-[2] flex-col gap-1 font-bold text-ink text-sm"
              htmlFor="co-new-comp"
            >
              <span>{text.addrComp}</span>
              <Input
                className="rounded-none border-2 border-line bg-card px-3 text-ink"
                id="co-new-comp"
                onChange={(e) => onCompChange(e.target.value)}
                placeholder={text.addrCompPh}
                value={newComp}
              />
            </label>

            <label
              className="flex min-w-[140px] flex-[2] flex-col gap-1 font-bold text-ink text-sm"
              htmlFor="co-new-city"
            >
              <span>{text.addrCity}</span>
              <Input
                className="rounded-none border-2 border-line bg-card px-3 text-ink"
                id="co-new-city"
                onChange={(e) => onCityChange(e.target.value)}
                placeholder="São Paulo"
                value={newCity}
              />
            </label>

            <label
              className="flex w-16 flex-col gap-1 font-bold text-ink text-sm"
              htmlFor="co-new-uf"
            >
              <span>{text.addrUf}</span>
              <Input
                className="rounded-none border-2 border-line bg-card px-2 text-center text-ink uppercase"
                id="co-new-uf"
                maxLength={2}
                onChange={(e) => onUfChange(e.target.value)}
                placeholder="SP"
                value={newUf}
              />
            </label>
          </div>

          <label
            className="mt-2 flex cursor-pointer items-center gap-2 font-semibold text-ink text-sm"
            htmlFor="co-save-addr"
          >
            <input
              checked={saveAddrToAccount}
              className="h-4 w-4 accent-yellow"
              id="co-save-addr"
              onChange={(e) => onSaveToggle(e.target.checked)}
              type="checkbox"
            />
            <span>{text.saveToAccount}</span>
          </label>
        </div>
      ) : null}
    </div>
  );
}

interface CreditCardFormProps {
  cardBrand: string;
  cardCvv: string;
  cardExp: string;
  cardName: string;
  cardNum: string;
  maskedCardNum: string;
  onCardCvvChange: (val: string) => void;
  onCardExpChange: (val: string) => void;
  onCardNameChange: (val: string) => void;
  onCardNumberChange: (val: string) => void;
  onSaveCardToggle: (val: boolean) => void;
  saveCardToAccount: boolean;
  text: ReturnType<typeof t>;
}

function CreditCardForm({
  cardBrand,
  cardCvv,
  cardExp,
  cardName,
  cardNum,
  maskedCardNum,
  onCardCvvChange,
  onCardExpChange,
  onCardNameChange,
  onCardNumberChange,
  onSaveCardToggle,
  saveCardToAccount,
  text,
}: CreditCardFormProps) {
  return (
    <div className="mt-2 flex animate-del-in flex-col gap-5 border-2 border-line bg-paper p-5">
      <div className="flex aspect-[1.586] w-full max-w-[320px] flex-col justify-between self-center border-[3px] border-line bg-yellow p-5 text-ink shadow-[6px_6px_0_var(--line)]">
        <div className="flex items-center justify-between">
          <span className="font-accent text-2xl tracking-wide">
            {cardBrand}
          </span>
          <span className="h-6 w-9 rounded-sm border-2 border-line bg-[#ffd84a]" />
        </div>
        <span className="font-bold font-data text-lg tracking-wider sm:text-xl">
          {maskedCardNum}
        </span>
        <div className="flex justify-between font-data text-[11px] uppercase">
          <span className="max-w-[180px] truncate">
            {cardName || text.cardNamePh}
          </span>
          <span>{cardExp || "MM/AA"}</span>
        </div>
      </div>

      <label
        className="flex flex-col gap-1 font-bold text-ink text-sm"
        htmlFor="co-card-num"
      >
        <span>{text.cardNum}</span>
        <Input
          autoComplete="cc-number"
          className="rounded-none border-2 border-line bg-card px-3 font-data text-ink"
          id="co-card-num"
          maxLength={19}
          onChange={(e) => onCardNumberChange(e.target.value)}
          placeholder="0000 0000 0000 0000"
          value={cardNum}
        />
      </label>

      <label
        className="flex flex-col gap-1 font-bold text-ink text-sm"
        htmlFor="co-card-name"
      >
        <span>{text.cardName}</span>
        <Input
          autoComplete="cc-name"
          className="rounded-none border-2 border-line bg-card px-3 text-ink uppercase"
          id="co-card-name"
          onChange={(e) => onCardNameChange(e.target.value.toUpperCase())}
          placeholder={text.cardNamePh}
          value={cardName}
        />
      </label>

      <div className="flex gap-4">
        <label
          className="flex flex-1 flex-col gap-1 font-bold text-ink text-sm"
          htmlFor="co-card-exp"
        >
          <span>{text.cardExp}</span>
          <Input
            autoComplete="cc-exp"
            className="rounded-none border-2 border-line bg-card px-3 font-data text-ink"
            id="co-card-exp"
            maxLength={5}
            onChange={(e) => onCardExpChange(e.target.value)}
            placeholder="MM/AA"
            value={cardExp}
          />
        </label>

        <label
          className="flex w-28 flex-col gap-1 font-bold text-ink text-sm"
          htmlFor="co-card-cvv"
        >
          <span>CVV</span>
          <Input
            autoComplete="cc-csc"
            className="rounded-none border-2 border-line bg-card px-3 font-data text-ink"
            id="co-card-cvv"
            maxLength={4}
            onChange={(e) => onCardCvvChange(e.target.value)}
            placeholder="123"
            type="password"
            value={cardCvv}
          />
        </label>
      </div>

      <label
        className="flex cursor-pointer items-center gap-2 font-semibold text-ink text-sm"
        htmlFor="co-save-card"
      >
        <input
          checked={saveCardToAccount}
          className="h-4 w-4 accent-yellow"
          id="co-save-card"
          onChange={(e) => onSaveCardToggle(e.target.checked)}
          type="checkbox"
        />
        <span>{text.saveToAccount}</span>
      </label>
      <p className="font-data text-ink/70 text-xs">{text.cardSaveNote}</p>
    </div>
  );
}

interface OrderSummarySidebarProps {
  formError: string | null;
  locale: "pt" | "en";
  onSubmit: () => void;
  selectedCount: number;
  text: ReturnType<typeof t>;
  totals: ReturnType<typeof getCartTotals>;
}

function OrderSummarySidebar({
  formError,
  locale,
  onSubmit,
  selectedCount,
  text,
  totals,
}: OrderSummarySidebarProps) {
  return (
    <div className="flex flex-col gap-6 self-start border-[3px] border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]">
      <div className="border-[3px] border-line bg-yellow p-4 text-ink">
        <strong className="font-display text-xl">{text.checkoutLead}</strong>
        <p className="mt-1 font-semibold text-xs">{text.payNote}</p>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="font-display text-xl">{text.summary}</h3>
        <div className="flex justify-between border-line border-b-2 pb-2 font-data text-ink/70 text-xs">
          <span>
            {selectedCount} {text.orderItems}
          </span>
          <span>
            ~{readingHours(totals.pages)}h {text.reading}
          </span>
        </div>
        <div className="flex justify-between font-display text-2xl text-ink">
          <span>{text.totalReal}</span>
          <span>R$ 0,00</span>
        </div>
        <div className="flex justify-between font-data text-ink/70 text-xs">
          <span>{text.pretendSpend}</span>
          <span>{formatPrice(totals.subtotal, locale)}</span>
        </div>
      </div>

      {formError ? (
        <div className="animate-del-pop border-2 border-line bg-red p-3 font-bold text-sm text-white">
          {formError}
        </div>
      ) : null}

      <ActionButton
        className="w-full py-3 text-base"
        onClick={onSubmit}
        tone="yellow"
      >
        {text.confirm}
      </ActionButton>
    </div>
  );
}

interface PixWaitingScreenProps {
  locale: "pt" | "en";
  onBackToForm: () => void;
  onCopyPix: () => void;
  onRetryPix: () => void;
  onSimulateScan: () => void;
  pixCopied: boolean;
  pixPayload: string;
  pixStatus: "waiting" | "paid" | "expired";
  pixTimeLeft: number;
  qrCells: QrCell[];
  selectedCount: number;
  text: ReturnType<typeof t>;
  totals: ReturnType<typeof getCartTotals>;
}

function PixWaitingScreen({
  locale,
  onBackToForm,
  onCopyPix,
  onRetryPix,
  onSimulateScan,
  pixCopied,
  pixPayload,
  pixStatus,
  pixTimeLeft,
  qrCells,
  selectedCount,
  text,
  totals,
}: PixWaitingScreenProps) {
  return (
    <div
      className="grid animate-del-in gap-8 lg:grid-cols-[1fr_360px]"
      data-motion-panel
    >
      <div className="flex flex-col gap-6 border-[3px] border-line bg-card p-6 shadow-[6px_6px_0_var(--line)]">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-line border-b-2 pb-4">
          <span className="font-data text-ink/70 text-xs uppercase">
            {text.pixAmount}
          </span>
          <strong className="font-display text-3xl text-ink">
            {formatPrice(totals.subtotal, locale)}
          </strong>
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="relative h-[232px] w-[232px] flex-shrink-0 border-[3px] border-line bg-white p-3 shadow-[6px_6px_0_var(--line)]">
            <div className="grid h-full w-full grid-cols-25">
              {qrCells.map((cell) => (
                <span key={cell.id} style={{ backgroundColor: cell.color }} />
              ))}
            </div>

            {pixStatus === "paid" ? (
              <div className="absolute inset-0 grid place-items-center bg-paper/90">
                <span className="rotate-[-6deg] animate-del-stamp border-[3px] border-line bg-green px-3 py-1 font-accent text-3xl text-ink shadow-[4px_4px_0_var(--line)]">
                  PAGO!
                </span>
              </div>
            ) : null}

            {pixStatus === "expired" ? (
              <div className="absolute inset-0 grid place-items-center bg-paper/90">
                <span className="rotate-[-8deg] animate-del-stamp border-[3px] border-line bg-red px-3 py-1 font-accent text-2xl text-white shadow-[4px_4px_0_var(--line)]">
                  EXPIRADO
                </span>
              </div>
            ) : null}
          </div>

          <div className="flex flex-1 flex-col gap-3">
            <ol className="flex list-decimal flex-col gap-2 pl-5 font-semibold text-ink text-sm">
              <li>Abra o app do banco no celular</li>
              <li>Escolha Pix › Pagar com QR Code</li>
              <li>Aponte a câmera para o código</li>
            </ol>
            <p className="font-data text-ink/70 text-xs">{text.pixNote}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between font-bold font-data text-sm">
            <span>
              {pixStatus === "paid"
                ? text.pixPaidL
                : pixStatus === "expired"
                  ? text.pixExpired
                  : text.pixWaiting}
            </span>
            <span>
              {pixStatus === "paid"
                ? "✓"
                : `0:${String(pixTimeLeft).padStart(2, "0")}`}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden border-2 border-line bg-paper">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{
                backgroundColor:
                  pixStatus === "paid"
                    ? "oklch(79.2% 0.209 151.711)"
                    : pixStatus === "expired" || pixTimeLeft <= 15
                      ? "oklch(63.7% 0.237 25.331)"
                      : "oklch(90.5% 0.182 98.111)",
                width: `${(pixTimeLeft / 60) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Input
            className="flex-1 rounded-none border-2 border-line bg-paper font-data text-xs"
            readOnly
            value={pixPayload}
          />
          <ActionButton onClick={onCopyPix} tone="surface">
            {pixCopied ? text.copied : text.copy}
          </ActionButton>
        </div>

        <div className="flex flex-col gap-3 border-2 border-line border-dashed bg-paper p-4">
          <span className="font-bold text-ink text-sm">{text.protoNote}</span>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              disabled={pixStatus !== "waiting"}
              onClick={onSimulateScan}
              tone="yellow"
            >
              {text.simulate}
            </ActionButton>
            {pixStatus === "expired" ? (
              <ActionButton onClick={onRetryPix} tone="surface">
                {text.pixRetry}
              </ActionButton>
            ) : null}
            <ActionButton onClick={onBackToForm} tone="surface">
              {text.pixChange}
            </ActionButton>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-[3px] border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]">
        <h2 className="font-display text-2xl">{text.summary}</h2>
        <div className="flex justify-between border-line border-b-2 pb-2 font-data text-xs">
          <span>
            {selectedCount} {text.orderItems}
          </span>
          <span>
            ~{readingHours(totals.pages)}h {text.reading}
          </span>
        </div>
        <div className="flex justify-between font-display text-2xl">
          <span>{text.totalReal}</span>
          <span>R$ 0,00</span>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const users = useStore((state) => state.users);
  const cartIds = useStore((state) => state.cartIds);
  const bookCache = useStore((state) => state.bookCache);
  const hydrated = useStore((state) => state.hydrated);
  const completeOrder = useStore((state) => state.completeOrder);
  const addAddress = useStore((state) => state.addAddress);
  const addCard = useStore((state) => state.addCard);
  const text = t(locale);
  const selected = getCartBooks(cartIds, bookCache);
  const totals = getCartTotals(cartIds, bookCache);
  const navigate = useNavigate();
  const checkoutRoastFired = useRef(false);

  const isAuthenticated = Boolean(
    profile && users[profile.email.toLowerCase()]
  );

  const [view, setView] = useState<"form" | "pixwait">("form");

  const savedAddresses = profile?.addresses || [];
  const defaultAddressId =
    profile?.prefAddr || (savedAddresses[0] ? savedAddresses[0].id : "new");
  const [selectedAddrId, setSelectedAddrId] =
    useState<string>(defaultAddressId);
  const [saveAddrToAccount, setSaveAddrToAccount] = useState(true);

  const [newLabel, setNewLabel] = useState("");
  const [newCep, setNewCep] = useState("");
  const [newStreet, setNewStreet] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [newComp, setNewComp] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newUf, setNewUf] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  const [payMethod, setPayMethod] = useState<string>("none");

  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [saveCardToAccount, setSaveCardToAccount] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [pixTimeLeft, setPixTimeLeft] = useState(60);
  const [pixStatus, setPixStatus] = useState<"waiting" | "paid" | "expired">(
    "waiting"
  );
  const [pixCopied, setPixCopied] = useState(false);

  const cardBrand = useMemo(() => detectBrand(cardNum), [cardNum]);
  const maskedCardNum = useMemo(() => {
    const padded = cardNum + "•••• •••• •••• ••••".slice(cardNum.length);
    return padded.slice(0, 19);
  }, [cardNum]);

  const qrCells = useMemo(() => {
    const totalCents = Math.round(totals.subtotal * 100);
    return generateQrMatrix(totalCents);
  }, [totals.subtotal]);

  const pixPayload = useMemo(
    () =>
      `00020126580014BR.GOV.BCB.PIX0136depois-eu-leio@lugar-nenhum.com5204000053039865406${totals.subtotal.toFixed(2)}5802BR5914DEPOIS EU LEIO6009SAO PAULO6304A1B2`,
    [totals.subtotal]
  );

  useEffect(() => {
    if (view !== "pixwait" || pixStatus !== "waiting") {
      return;
    }
    const interval = setInterval(() => {
      setPixTimeLeft((prev) => {
        if (prev <= 1) {
          setPixStatus("expired");
          clearInterval(interval);
          setFormError(
            locale === "pt"
              ? "O código Pix expirou. Gere um novo código para continuar."
              : "Pix code expired. Generate a new code to continue."
          );
          dispatchPixExpired(locale, () => {
            setPixTimeLeft(60);
            setPixStatus("waiting");
            setFormError(null);
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [view, pixStatus, locale]);

  useEffect(() => {
    if (
      hydrated &&
      isAuthenticated &&
      selected.length > 0 &&
      !checkoutRoastFired.current
    ) {
      checkoutRoastFired.current = true;
      dispatchCheckoutStarted({
        cartBooks: selected,
        locale,
        total: totals.subtotal,
      });
    }
  }, [hydrated, isAuthenticated, selected, totals.subtotal, locale]);

  useInsertedPanelMotion(route, [
    hydrated,
    isAuthenticated,
    selected.length,
    view,
  ]);

  async function handleCepLookup(val: string) {
    const formatted = formatCep(val);
    setNewCep(formatted);
    const clean = formatted.replace(REGEX_DIGITS, "");
    if (clean.length === 8) {
      setLoadingCep(true);
      const data = await lookupCep(clean);
      setLoadingCep(false);
      if (data) {
        if (data.logradouro) {
          setNewStreet(data.logradouro);
        }
        if (data.localidade) {
          setNewCity(data.localidade);
        }
        if (data.uf) {
          setNewUf(data.uf);
        }
      }
    }
  }

  function resolveAddress(): Address | null | undefined {
    if (selectedAddrId !== "new") {
      const match = savedAddresses.find((a) => a.id === selectedAddrId);
      if (match) {
        return match;
      }
    }
    const cleanCep = newCep.replace(REGEX_DIGITS, "");
    const hasAnyField =
      cleanCep.length > 0 ||
      Boolean(newStreet.trim()) ||
      Boolean(newNumber.trim()) ||
      Boolean(newCity.trim()) ||
      Boolean(newUf.trim());

    if (!hasAnyField) {
      return undefined;
    }

    if (
      cleanCep.length !== 8 ||
      !newStreet.trim() ||
      !newNumber.trim() ||
      !newCity.trim() ||
      !newUf.trim()
    ) {
      return null;
    }
    const newAddr: Address = {
      cep: newCep,
      city: newCity.trim(),
      comp: newComp.trim() || undefined,
      id: crypto.randomUUID(),
      label:
        newLabel.trim() ||
        (savedAddresses.length === 0
          ? "Casa"
          : `Endereço ${savedAddresses.length + 1}`),
      number: newNumber.trim(),
      street: newStreet.trim(),
      uf: newUf.trim().toUpperCase(),
    };
    if (saveAddrToAccount) {
      addAddress(newAddr);
    }
    return newAddr;
  }

  function handleCardNumberChange(val: string) {
    const digits = val.replace(REGEX_DIGITS, "").slice(0, 16);
    const formatted = digits.replace(REGEX_CARD_GROUP, "$1 ");
    setCardNum(formatted);
    setFormError(null);
  }

  function handleCardExpChange(val: string) {
    const digits = val.replace(REGEX_DIGITS, "").slice(0, 4);
    const formatted =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setCardExp(formatted);
    setFormError(null);
  }

  function handleFinalize(methodName: string, addr?: Address) {
    const orderId = completeOrder(methodName, addr);
    if (orderId) {
      dispatchPurchaseCompleted({
        locale,
        ordersCount: useStore.getState().orders.length,
        pages: totals.pages,
        total: totals.subtotal,
      });
      navigate({
        params: { orderId },
        to: "/checkout/complete/$orderId",
      });
    }
  }

  function handleCardSubmit(addr?: Address) {
    const digits = cardNum.replace(REGEX_DIGITS, "");
    if (
      digits.length !== 16 ||
      cardName.trim().length < 2 ||
      !REGEX_CARD_EXP.test(cardExp) ||
      cardCvv.replace(REGEX_DIGITS, "").length < 3
    ) {
      setFormError(text.errCardForm);
      return;
    }

    if (saveCardToAccount) {
      addCard({
        brand: cardBrand,
        exp: cardExp,
        last4: digits.slice(-4),
        name: cardName.trim().toUpperCase(),
      });
    }

    if (Math.random() < 0.1) {
      setFormError(
        locale === "pt"
          ? "Cartão recusado pela operadora. Verifique os dados ou tente outro cartão."
          : "Card declined by operator. Please check details or try another card."
      );
      dispatchCardDeclined({
        cardBrand,
        cardLast4: digits.slice(-4),
        locale,
        onRetry: () => handleCardSubmit(addr),
      });
      return;
    }

    handleFinalize("card", addr);
  }

  function handleSubmitOrder() {
    setFormError(null);
    const addr = resolveAddress();
    if (addr === null) {
      setFormError(text.errAddr);
      return;
    }

    if (payMethod === "card") {
      handleCardSubmit(addr);
      return;
    }

    if (payMethod === "pix") {
      setView("pixwait");
      setPixTimeLeft(60);
      setPixStatus("waiting");
      setPixCopied(false);
      return;
    }

    handleFinalize("none", addr);
  }

  function handleSimulatePhoneScan() {
    setPixStatus("paid");
    setTimeout(() => {
      const addr = resolveAddress() || undefined;
      handleFinalize("pix", addr);
    }, 800);
  }

  function handleCopyPix() {
    try {
      navigator.clipboard.writeText(pixPayload);
    } catch {
      // ignore
    }
    setPixCopied(true);
    dispatchPixCopied(locale);
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      </div>
    );
  }

  if (selected.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
        <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
          {text.checkoutTitle}
        </h1>
        <EmptyState action={text.backCatalog} title={text.cartEmpty} />
      </div>
    );
  }

  if (!(isAuthenticated && profile)) {
    return (
      <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
        <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
          {text.checkoutTitle}
        </h1>
        <div className="border-[3px] border-line bg-card p-6 shadow-[6px_6px_0_var(--line)]">
          <h2 className="font-display text-2xl">{text.account}</h2>
          <p className="mt-2 text-lg">{text.checkoutAuthPrompt}</p>
          <div className="mt-6 flex flex-col gap-4">
            <Link
              className="btn-tactile block w-full border-[3px] border-line bg-yellow px-6 py-3.5 text-center font-bold text-ink shadow-[4px_4px_0_var(--line)]"
              search={{ returnTo: "/checkout" }}
              to="/register"
            >
              {text.checkoutRegisterAction}
            </Link>
            <Link
              className="btn-auth-submit block w-full border-[3px] border-line bg-ink px-6 py-3.5 text-center font-bold text-paper shadow-[4px_4px_0_oklch(63.7%_0.237_25.331)]"
              search={{ returnTo: "/checkout" }}
              to="/account"
            >
              {text.goToLogin}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (view === "pixwait") {
    return (
      <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
        <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
          {text.pixTitle}
        </h1>
        <PixWaitingScreen
          locale={locale}
          onBackToForm={() => setView("form")}
          onCopyPix={handleCopyPix}
          onRetryPix={() => {
            setPixTimeLeft(60);
            setPixStatus("waiting");
          }}
          onSimulateScan={handleSimulatePhoneScan}
          pixCopied={pixCopied}
          pixPayload={pixPayload}
          pixStatus={pixStatus}
          pixTimeLeft={pixTimeLeft}
          qrCells={qrCells}
          selectedCount={selected.length}
          text={text}
          totals={totals}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
      <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.checkoutTitle}
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]" data-motion-panel>
        <div className="flex flex-col gap-8">
          <AddressSection
            loadingCep={loadingCep}
            newCep={newCep}
            newCity={newCity}
            newComp={newComp}
            newLabel={newLabel}
            newNumber={newNumber}
            newStreet={newStreet}
            newUf={newUf}
            onCepChange={handleCepLookup}
            onCityChange={setNewCity}
            onCompChange={setNewComp}
            onLabelChange={setNewLabel}
            onNumberChange={setNewNumber}
            onSaveToggle={setSaveAddrToAccount}
            onSelectAddr={setSelectedAddrId}
            onStreetChange={setNewStreet}
            onUfChange={(v) => setNewUf(v.toUpperCase())}
            prefAddrId={profile.prefAddr}
            saveAddrToAccount={saveAddrToAccount}
            savedAddresses={savedAddresses}
            selectedAddrId={selectedAddrId}
            text={text}
          />

          <div className="flex flex-col gap-4 border-[3px] border-line bg-card p-6 shadow-[6px_6px_0_var(--line)]">
            <div>
              <h2 className="font-display text-2xl text-ink">
                {text.payMethods}
              </h2>
              <p className="mt-1 font-data text-ink/70 text-xs">
                {text.signedAs} {profile.name} · {profile.email}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <label
                className={`flex cursor-pointer items-start gap-4 border-2 border-line p-4 text-left transition-[box-shadow,transform] ${
                  payMethod === "pix"
                    ? "bg-yellow shadow-[4px_4px_0_var(--line)]"
                    : "bg-card hover:bg-paper"
                }`}
                htmlFor="method-pix"
              >
                <input
                  checked={payMethod === "pix"}
                  className="mt-1 h-4 w-4 accent-ink"
                  id="method-pix"
                  name="payment-method"
                  onChange={() => {
                    setPayMethod("pix");
                    setFormError(null);
                  }}
                  type="radio"
                  value="pix"
                />
                <div>
                  <div className="font-bold text-base text-ink">
                    {text.payPix}
                  </div>
                  <div className="text-ink/80 text-xs">{text.pixSub}</div>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-4 border-2 border-line p-4 text-left transition-[box-shadow,transform] ${
                  payMethod === "card"
                    ? "bg-yellow shadow-[4px_4px_0_var(--line)]"
                    : "bg-card hover:bg-paper"
                }`}
                htmlFor="method-card"
              >
                <input
                  checked={payMethod === "card"}
                  className="mt-1 h-4 w-4 accent-ink"
                  id="method-card"
                  name="payment-method"
                  onChange={() => {
                    setPayMethod("card");
                    setFormError(null);
                  }}
                  type="radio"
                  value="card"
                />
                <div>
                  <div className="font-bold text-base text-ink">
                    {text.payCard}
                  </div>
                  <div className="text-ink/80 text-xs">{text.cardSub}</div>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-4 border-2 border-line p-4 text-left transition-[box-shadow,transform] ${
                  payMethod === "none"
                    ? "bg-yellow shadow-[4px_4px_0_var(--line)]"
                    : "bg-card hover:bg-paper"
                }`}
                htmlFor="method-none"
              >
                <input
                  checked={payMethod === "none"}
                  className="mt-1 h-4 w-4 accent-ink"
                  id="method-none"
                  name="payment-method"
                  onChange={() => {
                    setPayMethod("none");
                    setFormError(null);
                  }}
                  type="radio"
                  value="none"
                />
                <div>
                  <div className="font-bold text-base text-ink">
                    {text.payNone}
                  </div>
                  <div className="text-ink/80 text-xs">{text.noneSub}</div>
                </div>
              </label>
            </div>

            {payMethod === "card" ? (
              <CreditCardForm
                cardBrand={cardBrand}
                cardCvv={cardCvv}
                cardExp={cardExp}
                cardName={cardName}
                cardNum={cardNum}
                maskedCardNum={maskedCardNum}
                onCardCvvChange={(v) => {
                  setCardCvv(v.replace(REGEX_DIGITS, ""));
                  setFormError(null);
                }}
                onCardExpChange={handleCardExpChange}
                onCardNameChange={(v) => {
                  setCardName(v);
                  setFormError(null);
                }}
                onCardNumberChange={handleCardNumberChange}
                onSaveCardToggle={setSaveCardToAccount}
                saveCardToAccount={saveCardToAccount}
                text={text}
              />
            ) : null}
          </div>
        </div>

        <OrderSummarySidebar
          formError={formError}
          locale={locale}
          onSubmit={handleSubmitOrder}
          selectedCount={selected.length}
          text={text}
          totals={totals}
        />
      </div>
    </div>
  );
}
