import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ActionButton } from "@/components/store/action-button";
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

const registerFormSchema = z
  .object({
    confirmPassword: z.string().min(4),
    email: z.string().email(),
    name: z.string().trim().min(1),
    password: z.string().min(4),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords_mismatch",
    path: ["confirmPassword"],
  });

type RegisterFields = z.infer<typeof registerFormSchema>;

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (search): { returnTo?: string } => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
});

function RegisterPage() {
  const route = useRouteEntrance<HTMLDivElement>();
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const hydrated = useStore((state) => state.hydrated);
  const setProfile = useStore((state) => state.setProfile);
  const registerUser = useStore((state) => state.registerUser);
  const text = t(locale);
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();

  const form = useForm<RegisterFields>({
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
    },
    resolver: zodResolver(registerFormSchema),
  });

  const nameInvalid = Boolean(form.formState.errors.name);
  const emailInvalid = Boolean(form.formState.errors.email);
  const passwordInvalid = Boolean(form.formState.errors.password);
  const confirmPasswordInvalid = Boolean(form.formState.errors.confirmPassword);

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
      dependencies: [
        nameInvalid,
        emailInvalid,
        passwordInvalid,
        confirmPasswordInvalid,
      ],
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

  function onSubmit(values: RegisterFields) {
    const result = registerUser({
      email: values.email,
      name: values.name,
      password: values.password,
    });

    if (!result.success) {
      if (result.error === "email_taken") {
        form.setError("email", {
          message: text.emailTaken,
          type: "manual",
        });
      }
      return;
    }

    toast.success(text.registerSuccess);
    continueToDestination();
  }

  return (
    <div className="mx-auto max-w-7xl px-5 pt-12 sm:px-6" ref={route}>
      <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.registerTitle}
      </h1>
      <p className="mb-8 max-w-[55ch] text-lg">{text.registerLead}</p>
      {hydrated ? (
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {profile ? (
            <div
              className="w-full border-[3px] border-line bg-green p-6 text-[#141210] shadow-[6px_6px_0_var(--line)]"
              data-motion-panel
            >
              <p className="font-data text-xs uppercase">{text.signedAs}</p>
              <p className="mt-3 font-display text-3xl">{profile.name}</p>
              <p className="mt-1">{profile.email}</p>
              <p className="mt-5 font-semibold text-sm">{text.localNote}</p>
              <div className="mt-7 flex flex-wrap gap-4">
                {Boolean(returnTo) && (
                  <ActionButton onClick={continueToDestination}>
                    {text.signIn}
                  </ActionButton>
                )}
                <ActionButton onClick={() => setProfile(null)} tone="surface">
                  {text.signOut}
                </ActionButton>
              </div>
            </div>
          ) : (
            <form
              className="flex w-full flex-col gap-5 border-[3px] border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]"
              data-motion-panel
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <label
                className="flex flex-col gap-2 font-semibold"
                htmlFor="register-name"
              >
                <span>{text.name}</span>
                <Input
                  autoComplete="name"
                  id="register-name"
                  {...form.register("name")}
                  className="h-12 rounded-none border-2 border-line bg-paper px-3"
                />
                {Boolean(form.formState.errors.name) && (
                  <span
                    className="text-[#a91f22] text-sm dark:text-[#ff8680]"
                    data-motion-alert
                    role="alert"
                  >
                    {text.nameError}
                  </span>
                )}
              </label>

              <label
                className="flex flex-col gap-2 font-semibold"
                htmlFor="register-email"
              >
                <span>{text.email}</span>
                <Input
                  autoComplete="email"
                  id="register-email"
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
                htmlFor="register-password"
              >
                <span>{text.password}</span>
                <Input
                  autoComplete="new-password"
                  id="register-password"
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
                    {text.passwordError}
                  </span>
                )}
              </label>

              <label
                className="flex flex-col gap-2 font-semibold"
                htmlFor="register-confirm-password"
              >
                <span>{text.confirmPassword}</span>
                <Input
                  autoComplete="new-password"
                  id="register-confirm-password"
                  type="password"
                  {...form.register("confirmPassword")}
                  className="h-12 rounded-none border-2 border-line bg-paper px-3"
                />
                {Boolean(form.formState.errors.confirmPassword) && (
                  <span
                    className="text-[#a91f22] text-sm dark:text-[#ff8680]"
                    data-motion-alert
                    role="alert"
                  >
                    {text.confirmPasswordError}
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
                {text.registerButton}
              </ActionButton>

              <div className="mt-2 border-line border-t-2 pt-4 font-semibold text-sm">
                <span>{text.hasAccount} </span>
                <Link
                  className="font-bold underline transition-colors hover:text-yellow"
                  search={{ returnTo }}
                  to="/account"
                >
                  {text.goToLogin}
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
