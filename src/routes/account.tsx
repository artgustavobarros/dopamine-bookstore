import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ActionButton } from "@/components/store/action-button";
import { AddressManager } from "@/components/store/address-manager";
import { HeroFeaturedStage } from "@/components/store/hero-featured-stage";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import {
  gsap,
  useGSAP,
  useInsertedPanelMotion,
  useRouteEntrance,
  withMotion,
} from "@/lib/motion";
import { catalogQuery } from "@/lib/open-library";
import { useStore } from "@/lib/store";

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().optional(),
});
type LoginFields = z.infer<typeof loginFormSchema>;

export const Route = createFileRoute("/account")({
  component: AccountPage,
  validateSearch: (search): { returnTo?: string } => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
});

function AccountPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const hydrated = useStore((state) => state.hydrated);
  const setProfile = useStore((state) => state.setProfile);
  const signInUser = useStore((state) => state.signInUser);
  const text = t(locale);
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();
  const form = useForm<LoginFields>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(loginFormSchema),
  });
  const emailInvalid = Boolean(form.formState.errors.email);
  const passwordInvalid = Boolean(form.formState.errors.password);

  const query = useQuery({
    ...catalogQuery(locale, ""),
    enabled: hydrated,
  });
  const bookCache = useStore((state) => state.bookCache);
  const books = query.data ?? Object.values(bookCache);
  const featured = books.slice(0, 3);
  const isHeroLoading =
    (!hydrated || query.isLoading || query.isPending) && featured.length === 0;

  useInsertedPanelMotion(route, [hydrated, Boolean(profile)]);
  useGSAP(
    () =>
      withMotion(() => {
        const alerts = route.current?.querySelectorAll("[data-motion-alert]");
        if (alerts?.length) {
          gsap.fromTo(
            alerts,
            { autoAlpha: 0, scale: 0.6 },
            {
              autoAlpha: 1,
              clearProps: "opacity,visibility,transform",
              duration: 0.35,
              ease: "back.out(1.8)",
              scale: 1,
            }
          );
        }
      }),
    {
      dependencies: [emailInvalid, passwordInvalid],
      revertOnUpdate: true,
      scope: route,
    }
  );

  function continueToDestination() {
    if (returnTo === "/checkout") {
      navigate({ to: "/checkout" });
    } else if (returnTo?.startsWith("/books/")) {
      const bookId = returnTo.slice("/books/".length);
      navigate({ params: { bookId }, to: "/books/$bookId" });
    } else {
      navigate({ to: "/" });
    }
  }

  function onSubmit(values: LoginFields) {
    const result = signInUser({
      email: values.email,
      password: values.password,
    });

    if (!result.success) {
      if (result.error === "invalid_password") {
        form.setError("password", {
          message: text.invalidPassword,
          type: "manual",
        });
        return;
      }
      if (result.error === "not_found") {
        form.setError("email", {
          message: text.userNotFound,
          type: "manual",
        });
        return;
      }
    }

    continueToDestination();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
      <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.accountTitle}
      </h1>
      <p className="mb-8 max-w-[55ch] text-lg">{text.accountLead}</p>
      {hydrated ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {profile ? (
            <div className="flex flex-col gap-6" data-motion-panel>
              <div className="w-full border-[3px] border-line bg-card p-6 text-ink shadow-[6px_6px_0_var(--line)]">
                <p className="font-data text-xs uppercase">{text.signedAs}</p>
                <p className="mt-3 font-display text-3xl">{profile.name}</p>
                <p className="mt-1 font-medium text-ink/80">{profile.email}</p>
                <p className="mt-4 font-semibold text-sm">{text.localNote}</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  {Boolean(returnTo) && (
                    <ActionButton onClick={continueToDestination} tone="yellow">
                      {returnTo === "/checkout" ? text.checkout : text.signIn}
                    </ActionButton>
                  )}
                  <ActionButton onClick={() => setProfile(null)} tone="surface">
                    {text.signOut}
                  </ActionButton>
                </div>
              </div>

              <AddressManager />
            </div>
          ) : (
            <form
              className="flex w-full flex-col gap-5 border-[3px] border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]"
              data-motion-panel
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <label
                className="flex flex-col gap-2 font-semibold"
                htmlFor="profile-email"
              >
                <span>{text.email}</span>
                <Input
                  autoComplete="email"
                  id="profile-email"
                  type="email"
                  {...form.register("email")}
                  className="h-12 rounded-none border-2 border-line bg-paper px-3"
                />
                {Boolean(form.formState.errors.email) && (
                  <span
                    className="text-[#a91f22] text-sm dark:text-[#ff8680]"
                    data-motion-alert
                    role="alert"
                  >
                    {form.formState.errors.email?.message || text.emailError}
                  </span>
                )}
              </label>
              <label
                className="flex flex-col gap-2 font-semibold"
                htmlFor="profile-password"
              >
                <span>{text.password}</span>
                <Input
                  autoComplete="current-password"
                  id="profile-password"
                  type="password"
                  {...form.register("password")}
                  className="h-12 rounded-none border-2 border-line bg-paper px-3"
                />
                {Boolean(form.formState.errors.password) && (
                  <span
                    className="text-[#a91f22] text-sm dark:text-[#ff8680]"
                    data-motion-alert
                    role="alert"
                  >
                    {form.formState.errors.password?.message ||
                      text.passwordError}
                  </span>
                )}
              </label>
              <p className="font-data text-xs">{text.localNote}</p>
              <ActionButton
                className="self-start"
                shadowTone="red"
                tone="ink"
                type="submit"
              >
                {text.signIn}
              </ActionButton>
              <div className="mt-2 border-line border-t-2 pt-4 font-semibold text-sm">
                <span>{text.noAccount} </span>
                <Link
                  className="font-bold underline transition-colors hover:text-yellow"
                  search={{ returnTo }}
                  to="/register"
                >
                  {text.goToRegister}
                </Link>
              </div>
            </form>
          )}
          <div className="w-full">
            <HeroFeaturedStage
              featured={featured}
              isHeroLoading={isHeroLoading}
              locale={locale}
              text={text}
            />
          </div>
        </div>
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
