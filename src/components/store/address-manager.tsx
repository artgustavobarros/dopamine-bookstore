import { useState } from "react";
import { ActionButton } from "@/components/store/action-button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { type Address, useStore } from "@/lib/store";
import { formatCep, lookupCep } from "@/lib/viacep";

export function formatAddressLine(a: Address): string {
  const parts = [
    a.street + (a.number ? `, ${a.number}` : ""),
    a.comp,
    a.city + (a.uf ? ` – ${a.uf}` : ""),
    a.cep,
  ];
  return parts.filter(Boolean).join(" · ");
}

export function AddressManager() {
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const addAddress = useStore((state) => state.addAddress);
  const removeAddress = useStore((state) => state.removeAddress);
  const setPreferredAddress = useStore((state) => state.setPreferredAddress);
  const text = t(locale);

  const [isOpen, setIsOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [comp, setComp] = useState("");
  const [city, setCity] = useState("");
  const [uf, setUf] = useState("");
  const [error, setError] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  const addresses = profile?.addresses || [];
  const prefAddr = profile?.prefAddr;

  async function handleCepChange(value: string) {
    const formatted = formatCep(value);
    setCep(formatted);
    const clean = formatted.replace(/\D/g, "");
    if (clean.length === 8) {
      setLoadingCep(true);
      const data = await lookupCep(clean);
      setLoadingCep(false);
      if (data) {
        if (data.logradouro) {
          setStreet(data.logradouro);
        }
        if (data.localidade) {
          setCity(data.localidade);
        }
        if (data.uf) {
          setUf(data.uf);
        }
      }
    }
  }

  function handleSave() {
    const cleanCep = cep.replace(/\D/g, "");
    if (
      cleanCep.length !== 8 ||
      !street.trim() ||
      !number.trim() ||
      !city.trim() ||
      !uf.trim()
    ) {
      setError(true);
      return;
    }

    const defaultLabel =
      label.trim() ||
      (locale === "en"
        ? addresses.length === 0
          ? "Home"
          : `Address ${addresses.length + 1}`
        : addresses.length === 0
          ? "Casa"
          : `Endereço ${addresses.length + 1}`);

    addAddress({
      cep,
      city: city.trim(),
      comp: comp.trim() || undefined,
      label: defaultLabel,
      number: number.trim(),
      street: street.trim(),
      uf: uf.trim().toUpperCase(),
    });

    // Reset form
    setLabel("");
    setCep("");
    setStreet("");
    setNumber("");
    setComp("");
    setCity("");
    setUf("");
    setError(false);
    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 border-[3px] border-line bg-card p-6 shadow-[6px_6px_0_var(--line)]">
      <h2 className="font-display text-2xl text-ink">{text.addresses}</h2>

      {addresses.length === 0 ? (
        <p className="text-ink/70 text-sm">{text.noAddr}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {addresses.map((a) => {
            const isPreferred = a.id === prefAddr;
            return (
              <div
                className={`flex flex-col justify-between gap-3 border-2 border-line p-4 sm:flex-row sm:items-center ${
                  isPreferred
                    ? "bg-paper shadow-[4px_4px_0_var(--line)]"
                    : "bg-card"
                }`}
                key={a.id}
              >
                <div className="flex min-w-0 flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-ink">
                      {a.label}
                    </span>
                    {isPreferred && (
                      <span className="border border-line bg-yellow px-1.5 py-0.5 font-bold font-data text-[10px] text-ink">
                        {text.preferred}
                      </span>
                    )}
                  </div>
                  <span className="truncate text-ink/80 text-sm">
                    {formatAddressLine(a)}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {!isPreferred && (
                    <button
                      className="cursor-pointer border-2 border-line bg-card px-2.5 py-1 font-bold text-ink text-xs shadow-[2px_2px_0_var(--line)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                      onClick={() => setPreferredAddress(a.id)}
                      type="button"
                    >
                      {text.makePref}
                    </button>
                  )}
                  <button
                    className="cursor-pointer border-2 border-line bg-card px-2.5 py-1 font-semibold text-red text-xs shadow-[2px_2px_0_var(--line)] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                    onClick={() => removeAddress(a.id)}
                    type="button"
                  >
                    {text.remove}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isOpen ? (
        <div className="flex animate-del-in flex-col gap-4 border-2 border-line bg-paper p-4">
          <div className="flex flex-col gap-3">
            <label
              className="flex flex-col gap-1 font-bold text-ink text-sm"
              htmlFor="mgr-addr-label"
            >
              <span>{text.addrLabel}</span>
              <Input
                className="rounded-none border-2 border-line bg-card px-3 text-ink"
                id="mgr-addr-label"
                onChange={(e) => setLabel(e.target.value)}
                placeholder={text.addrLabelPh}
                value={label}
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <label
                className="flex min-w-[130px] flex-1 flex-col gap-1 font-bold text-ink text-sm"
                htmlFor="mgr-addr-cep"
              >
                <span className="flex items-center justify-between">
                  {text.addrCep}
                  {loadingCep ? (
                    <span className="font-normal text-ink/60 text-xs">...</span>
                  ) : null}
                </span>
                <Input
                  className="rounded-none border-2 border-line bg-card px-3 text-ink"
                  id="mgr-addr-cep"
                  maxLength={9}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  value={cep}
                />
              </label>

              <label
                className="flex min-w-[200px] flex-[3] flex-col gap-1 font-bold text-ink text-sm"
                htmlFor="mgr-addr-street"
              >
                <span>{text.addrStreet}</span>
                <Input
                  className="rounded-none border-2 border-line bg-card px-3 text-ink"
                  id="mgr-addr-street"
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder={text.addrStreetPh}
                  value={street}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <label
                className="flex min-w-[90px] flex-1 flex-col gap-1 font-bold text-ink text-sm"
                htmlFor="mgr-addr-number"
              >
                <span>{text.addrNumber}</span>
                <Input
                  className="rounded-none border-2 border-line bg-card px-3 text-ink"
                  id="mgr-addr-number"
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  value={number}
                />
              </label>

              <label
                className="flex min-w-[160px] flex-[2] flex-col gap-1 font-bold text-ink text-sm"
                htmlFor="mgr-addr-comp"
              >
                <span>{text.addrComp}</span>
                <Input
                  className="rounded-none border-2 border-line bg-card px-3 text-ink"
                  id="mgr-addr-comp"
                  onChange={(e) => setComp(e.target.value)}
                  placeholder={text.addrCompPh}
                  value={comp}
                />
              </label>

              <label
                className="flex min-w-[160px] flex-[2] flex-col gap-1 font-bold text-ink text-sm"
                htmlFor="mgr-addr-city"
              >
                <span>{text.addrCity}</span>
                <Input
                  className="rounded-none border-2 border-line bg-card px-3 text-ink"
                  id="mgr-addr-city"
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                  value={city}
                />
              </label>

              <label
                className="flex w-16 flex-col gap-1 font-bold text-ink text-sm"
                htmlFor="mgr-addr-uf"
              >
                <span>{text.addrUf}</span>
                <Input
                  className="rounded-none border-2 border-line bg-card px-2 text-center text-ink uppercase"
                  id="mgr-addr-uf"
                  maxLength={2}
                  onChange={(e) => setUf(e.target.value.toUpperCase())}
                  placeholder="SP"
                  value={uf}
                />
              </label>
            </div>

            {error ? (
              <div className="animate-del-pop border-2 border-line bg-red p-2 font-bold text-sm text-white">
                {text.errAddr}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <ActionButton onClick={handleSave} tone="yellow">
              {text.saveAddrBtn}
            </ActionButton>
            <ActionButton
              onClick={() => {
                setIsOpen(false);
                setError(false);
              }}
              tone="surface"
            >
              {text.cancel}
            </ActionButton>
          </div>
        </div>
      ) : (
        <ActionButton
          className="self-start"
          onClick={() => {
            setIsOpen(true);
            setError(false);
          }}
          tone="surface"
        >
          {text.addAddr}
        </ActionButton>
      )}
    </div>
  );
}
