import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ActionButton } from "@/components/store/action-button";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const profileFormSchema = z.object({
  email: z.email(),
  name: z.string().trim().min(1),
});
type ProfileFields = z.infer<typeof profileFormSchema>;

export const Route = createFileRoute("/account")({
  component: AccountPage,
  validateSearch: (search): { returnTo?: string } => ({
    returnTo: typeof search.returnTo === "string" ? search.returnTo : undefined,
  }),
});

function AccountPage() {
  const locale = useStore((state) => state.locale);
  const profile = useStore((state) => state.profile);
  const hydrated = useStore((state) => state.hydrated);
  const setProfile = useStore((state) => state.setProfile);
  const text = t(locale);
  const { returnTo } = Route.useSearch();
  const navigate = useNavigate();
  const form = useForm<ProfileFields>({
    defaultValues: { email: "", name: "" },
    resolver: zodResolver(profileFormSchema),
  });

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

  return (
    <div className="mx-auto max-w-5xl px-5 pt-12 sm:px-6">
      <h1 className="mb-6 border-line border-b-[3px] pb-3 font-display text-4xl sm:text-5xl">
        {text.accountTitle}
      </h1>
      <p className="mb-8 max-w-[55ch] text-lg">{text.accountLead}</p>
      {hydrated ? (
        profile ? (
          <div className="max-w-xl border-[3px] border-line bg-green p-6 text-[#141210] shadow-[6px_6px_0_var(--line)]">
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
            className="flex max-w-xl flex-col gap-5 border-[3px] border-line bg-surface p-6 shadow-[6px_6px_0_var(--line)]"
            onSubmit={form.handleSubmit((values) => {
              setProfile(values);
              continueToDestination();
            })}
          >
            <label
              className="flex flex-col gap-2 font-semibold"
              htmlFor="profile-name"
            >
              <span>{text.name}</span>
              <Input
                autoComplete="name"
                id="profile-name"
                {...form.register("name")}
                className="h-12 rounded-none border-2 border-line bg-paper px-3"
              />
              {Boolean(form.formState.errors.name) && (
                <span
                  className="text-[#a91f22] text-sm dark:text-[#ff8680]"
                  role="alert"
                >
                  {text.nameError}
                </span>
              )}
            </label>
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
                  role="alert"
                >
                  {text.emailError}
                </span>
              )}
            </label>
            <p className="font-data text-xs">{text.localNote}</p>
            <ActionButton className="self-start" type="submit">
              {text.signIn}
            </ActionButton>
          </form>
        )
      ) : (
        <div aria-busy="true" className="h-56 animate-pulse bg-surface" />
      )}
    </div>
  );
}
