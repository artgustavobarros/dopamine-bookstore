import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ActionButton } from "@/components/store/action-button";
import { EmptyState } from "@/components/store/layout";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatNumber, formatPrice, readingHours } from "@/lib/catalog";
import { t } from "@/lib/i18n";
import { useInsertedPanelMotion, useRouteEntrance } from "@/lib/motion";
import { getCartBooks, getCartTotals, useStore } from "@/lib/store";

export const Route = createFileRoute("/checkout/")({ component: CheckoutPage });

const checkoutSchema = z.object({ method: z.enum(["pix", "card", "none"]) });
type CheckoutFields = z.infer<typeof checkoutSchema>;

function CheckoutPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const cartIds = useStore((state) => state.cartIds);
  const hydrated = useStore((state) => state.hydrated);
  const completeOrder = useStore((state) => state.completeOrder);
  const text = t(locale);
  const selected = getCartBooks(cartIds);
  const totals = getCartTotals(cartIds);
  const navigate = useNavigate();
  const form = useForm<CheckoutFields>({
    defaultValues: { method: "none" },
    resolver: zodResolver(checkoutSchema),
  });
  useInsertedPanelMotion(route, [hydrated, Boolean(profile), selected.length]);
  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
      <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.checkoutTitle}
      </h1>
      {hydrated ? (
        selected.length === 0 ? (
          <EmptyState action={text.backCatalog} title={text.cartEmpty} />
        ) : profile ? (
          <div
            className="grid gap-8 lg:grid-cols-[1fr_350px]"
            data-motion-panel
          >
            <form
              className="border-[3px] border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]"
              onSubmit={form.handleSubmit(({ method }) => {
                const orderId = completeOrder(method);
                if (orderId) {
                  toast.success(text.orderToast);
                  navigate({
                    params: { orderId },
                    to: "/checkout/complete/$orderId",
                  });
                }
              })}
            >
              <div className="border-[#141210] border-[3px] bg-yellow p-5 text-[#141210]">
                <strong className="font-display text-xl">
                  {text.checkoutLead}
                </strong>
                <p className="mt-2 font-semibold text-sm">{text.payNote}</p>
              </div>
              <h2 className="mt-8 font-display text-2xl">{text.payment}</h2>
              <Controller
                control={form.control}
                name="method"
                render={({ field }) => (
                  <RadioGroup
                    className="mt-4 gap-3"
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    {(
                      [
                        ["pix", text.payPix],
                        ["card", text.payCard],
                        ["none", text.payNone],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        className="flex min-h-16 cursor-pointer items-center gap-4 border-[3px] border-line bg-paper px-5 font-bold hover:bg-yellow hover:text-[#141210]"
                        htmlFor={`method-${value}`}
                        key={value}
                      >
                        <RadioGroupItem
                          className="border-2 border-line"
                          id={`method-${value}`}
                          value={value}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                )}
              />
              <p className="mt-6 font-data text-xs">
                {text.signedAs} {profile.name} · {profile.email}
              </p>
              <ActionButton className="mt-8 w-full text-base" type="submit">
                {text.confirm}
              </ActionButton>
            </form>
            <aside className="h-fit border-[3px] border-line bg-pink p-6 text-[#141210] shadow-[6px_6px_0_var(--line)]">
              <h2 className="border-[#141210] border-b-[3px] pb-3 font-display text-2xl">
                {text.summary}
              </h2>
              <ul className="mt-4 space-y-3">
                {selected.map((book) => (
                  <li
                    className="flex justify-between gap-4 border-[#141210]/30 border-b pb-3 text-sm"
                    key={book.id}
                  >
                    <span>{book.title[locale]}</span>
                    <strong className="whitespace-nowrap">
                      {formatPrice(book.price, locale)}
                    </strong>
                  </li>
                ))}
              </ul>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt>{text.pages}</dt>
                  <dd>{formatNumber(totals.pages, locale)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{text.hours}</dt>
                  <dd>~{readingHours(totals.pages)}h</dd>
                </div>
                <div className="flex justify-between border-[#141210] border-t-[3px] pt-3 font-bold">
                  <dt>{text.subtotal}</dt>
                  <dd>{formatPrice(totals.subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between font-display text-xl">
                  <dt>{text.totalReal}</dt>
                  <dd>{formatPrice(0, locale)}</dd>
                </div>
              </dl>
            </aside>
          </div>
        ) : (
          <div
            className="border-[3px] border-line bg-yellow p-8 text-[#141210] shadow-[6px_6px_0_var(--line)]"
            data-motion-panel
          >
            <p className="font-display text-2xl">{text.checkoutLead}</p>
            <p className="mt-3">{text.accountLead}</p>
            <ActionButton asChild className="mt-6" tone="surface">
              <Link search={{ returnTo: "/checkout" }} to="/account">
                {text.signIn}
              </Link>
            </ActionButton>
          </div>
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
