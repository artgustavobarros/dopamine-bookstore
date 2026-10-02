import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Heart, Menu, Moon, ShoppingBag, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ActionButton } from "@/components/store/action-button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/sonner";
import { t } from "@/lib/i18n";
import { gsap, useGSAP, withMotion } from "@/lib/motion";
import { useStore } from "@/lib/store";

const destinations = [
  { key: "shop", to: "/" },
  { key: "wishlist", to: "/wishlist" },
  { key: "orders", to: "/orders" },
  { key: "stats", to: "/stats" },
] as const;

export function StoreLayout() {
  const cartCount = useRef<HTMLSpanElement>(null);
  const lastCartCount = useRef<number | null>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const locale = useStore((state) => state.locale);
  const theme = useStore((state) => state.theme);
  const setLocale = useStore((state) => state.setLocale);
  const setTheme = useStore((state) => state.setTheme);
  const cartIds = useStore((state) => state.cartIds);
  const wishlistIds = useStore((state) => state.wishlistIds);
  const profile = useStore((state) => state.profile);
  const users = useStore((state) => state.users);
  const hydrated = useStore((state) => state.hydrated);
  const isAuthenticated = Boolean(
    profile && users[profile.email.toLowerCase()]
  );
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [open, setOpen] = useState(false);
  const text = t(locale);

  useGSAP(
    () => {
      if (!hydrated) {
        return;
      }
      const previous = lastCartCount.current;
      lastCartCount.current = cartIds.length;
      if (previous === null || previous === cartIds.length) {
        return;
      }
      return withMotion(() => {
        if (cartCount.current?.isConnected) {
          gsap
            .timeline()
            .to(cartCount.current, { duration: 0.16, scale: 1.45 })
            .to(cartCount.current, {
              clearProps: "transform",
              duration: 0.24,
              ease: "back.out(1.5)",
              scale: 1,
            });
        }
      });
    },
    {
      dependencies: [hydrated, cartIds.length],
      revertOnUpdate: true,
      scope: cartCount,
    }
  );

  useEffect(() => {
    let timer: number;
    const resetTimer = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        import("@/lib/roast-trigger").then(({ dispatchIdle }) =>
          dispatchIdle({
            locale,
            onBrowse: () => {
              window.scrollTo({ behavior: "smooth", top: 400 });
            },
          })
        );
      }, 90_000); // 90 seconds of inactivity
    };

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
    ];
    for (const eventName of activityEvents) {
      window.addEventListener(eventName, resetTimer, { passive: true });
    }
    resetTimer();

    return () => {
      window.clearTimeout(timer);
      for (const eventName of activityEvents) {
        window.removeEventListener(eventName, resetTimer);
      }
    };
  }, [locale]);

  useGSAP(
    () => {
      if (!open) {
        return;
      }
      return withMotion(() => {
        if (menuPanel.current?.isConnected) {
          gsap.fromTo(
            menuPanel.current,
            { xPercent: 100 },
            {
              clearProps: "transform",
              duration: 0.35,
              ease: "power3.out",
              xPercent: 0,
            }
          );
        }
      });
    },
    { dependencies: [open], revertOnUpdate: true, scope: menuPanel }
  );

  useEffect(() => {
    try {
      useStore.persist.rehydrate();
    } catch {
      // Ignore storage error
    }
    useStore.setState({ hydrated: true });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.lang = locale === "pt" ? "pt-BR" : "en";
  }, [theme, locale]);

  const navLinks = destinations.map(({ to, key }) => (
    <Link
      className={`border-[3px] border-line px-3 py-2 font-bold text-sm transition-transform hover:-translate-y-0.5 hover:bg-yellow hover:text-[#141210] ${pathname === to || (to === "/" && pathname.startsWith("/books/")) ? "bg-yellow text-[#141210] shadow-[3px_3px_0_var(--line)]" : "bg-surface"}`}
      key={to}
      to={to}
    >
      {text[key]}
      {key === "wishlist" && hydrated && wishlistIds.length > 0
        ? ` · ${wishlistIds.length}`
        : ""}
    </Link>
  ));

  return (
    <div
      className="flex min-h-dvh min-h-screen flex-col bg-paper text-ink"
      data-hydrated={hydrated}
    >
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 bg-[#141210] px-4 py-2 font-data text-[10px] text-white uppercase tracking-wide sm:text-xs">
        <span>{text.bar1}</span>
        <span className="text-yellow">✦</span>
        <span>{text.bar2}</span>
        <span className="hidden text-yellow sm:inline">✦</span>
        <span className="hidden sm:inline">{text.bar3}</span>
      </div>
      <header className="sticky top-0 z-40 border-line border-b-[3px] bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            className="shrink-0 -rotate-2 border-[3px] border-line bg-yellow px-3 py-1 font-display text-[#141210] text-base leading-none shadow-[4px_4px_0_var(--line)] sm:text-xl"
            to="/"
          >
            DEPOIS EU LEIO
          </Link>
          <nav
            aria-label="Main navigation"
            className="ml-auto hidden items-center gap-2 lg:flex"
          >
            {navLinks}
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <div className="hidden items-center gap-2 lg:flex">
              <button
                aria-label={text.language}
                className="border-2 border-line bg-surface px-2 py-1 font-bold font-data text-xs hover:bg-yellow hover:text-[#141210]"
                onClick={() => setLocale(locale === "pt" ? "en" : "pt")}
                type="button"
              >
                {locale.toUpperCase()}
              </button>
              <button
                aria-label={text.theme}
                className="flex size-8 items-center justify-center border-2 border-line bg-surface hover:bg-yellow hover:text-[#141210]"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                type="button"
              >
                {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
              </button>
            </div>
            <Link
              aria-label={`${text.cart}${hydrated ? `: ${cartIds.length}` : ""}`}
              className="flex h-9 items-center gap-1 border-[3px] border-line bg-ink px-2 font-bold text-paper text-xs hover:bg-yellow hover:text-[#141210]"
              to="/cart"
            >
              <ShoppingBag size={17} />
              <span className="inline-block" ref={cartCount}>
                {hydrated ? cartIds.length : "–"}
              </span>
            </Link>
            <Link
              className="hidden border-[3px] border-line bg-surface px-3 py-1.5 font-bold text-sm hover:bg-yellow hover:text-[#141210] md:inline-flex"
              to="/account"
            >
              {hydrated && isAuthenticated && profile
                ? profile.name.split(" ")[0]
                : text.account}
            </Link>
            {hydrated && !isAuthenticated ? (
              <Link
                className="hidden border-[3px] border-line bg-yellow px-3 py-1.5 font-bold text-[#141210] text-sm shadow-[3px_3px_0_var(--line)] hover:bg-surface md:inline-flex"
                to="/register"
              >
                {text.register}
              </Link>
            ) : null}
            <Sheet onOpenChange={setOpen} open={open}>
              <SheetTrigger asChild>
                <button
                  aria-label={text.menu}
                  className="flex size-9 items-center justify-center border-[3px] border-line bg-yellow text-[#141210] lg:hidden"
                  type="button"
                >
                  <Menu size={19} />
                </button>
              </SheetTrigger>
              <SheetContent
                className="w-[min(22rem,88vw)] gap-0 border-line border-l-[3px] bg-paper p-0"
                ref={menuPanel}
                showCloseButton={false}
              >
                <SheetHeader className="flex-row items-center justify-between border-line border-b-[3px] bg-yellow p-5 text-[#141210]">
                  <SheetTitle className="font-display text-2xl">
                    {text.menu}
                  </SheetTitle>
                  <SheetClose asChild>
                    <button aria-label={text.close} type="button">
                      <X />
                    </button>
                  </SheetClose>
                </SheetHeader>
                <nav
                  aria-label="Mobile navigation"
                  className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-5"
                >
                  {destinations.map(({ to, key }) => (
                    <SheetClose asChild key={to}>
                      <Link
                        className="border-[3px] border-line bg-surface px-4 py-3 font-bold shadow-[4px_4px_0_var(--line)]"
                        onClick={() => setOpen(false)}
                        to={to}
                      >
                        {text[key]}
                      </Link>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link
                      className="flex items-center gap-2 border-[3px] border-line bg-surface px-4 py-3 font-bold shadow-[4px_4px_0_var(--line)]"
                      onClick={() => setOpen(false)}
                      to="/cart"
                    >
                      <ShoppingBag size={18} />
                      {text.cart} · {hydrated ? cartIds.length : "–"}
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      className="border-[3px] border-line bg-surface px-4 py-3 font-bold shadow-[4px_4px_0_var(--line)]"
                      onClick={() => setOpen(false)}
                      to="/account"
                    >
                      {hydrated && isAuthenticated && profile
                        ? profile.name
                        : text.account}
                    </Link>
                  </SheetClose>
                  {hydrated && !isAuthenticated ? (
                    <SheetClose asChild>
                      <Link
                        className="border-[3px] border-line bg-surface px-4 py-3 font-bold shadow-[4px_4px_0_var(--line)]"
                        onClick={() => setOpen(false)}
                        to="/register"
                      >
                        {text.register}
                      </Link>
                    </SheetClose>
                  ) : null}
                </nav>
                <SheetFooter className="mt-auto flex-row items-center gap-3 border-line border-t-[3px] bg-paper p-5">
                  <button
                    aria-label={text.language}
                    className="flex min-h-11 flex-1 items-center justify-center border-2 border-line bg-surface px-4 font-bold font-data text-sm hover:bg-yellow hover:text-[#141210]"
                    onClick={() => setLocale(locale === "pt" ? "en" : "pt")}
                    type="button"
                  >
                    {locale.toUpperCase()}
                  </button>
                  <button
                    aria-label={text.theme}
                    className="flex size-11 items-center justify-center border-2 border-line bg-surface hover:bg-yellow hover:text-[#141210]"
                    onClick={() =>
                      setTheme(theme === "light" ? "dark" : "light")
                    }
                    type="button"
                  >
                    {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                  </button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1" id="main-content">
        <Outlet />
      </main>
      <footer className="mt-20 border-line border-t-[3px] bg-yellow text-[#141210]">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-5 py-10 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-3xl">DEPOIS EU LEIO.</p>
            <p className="mt-2 max-w-md font-semibold text-sm">
              {text.fictional}
            </p>
          </div>
          <div className="flex gap-4 font-data text-xs">
            <Link
              className="inline-flex items-center gap-1 underline"
              to="/wishlist"
            >
              <Heart size={14} />
              {text.wishlist}
            </Link>
            <Link className="underline" to="/orders">
              {text.orders}
            </Link>
          </div>
        </div>
      </footer>
      <Toaster closeButton position="bottom-right" richColors theme={theme} />
    </div>
  );
}

export function EmptyState({
  title,
  action,
  description,
  onAction,
}: {
  title: string;
  action?: string;
  description?: string;
  onAction?: () => void;
}) {
  return (
    <div
      aria-live="polite"
      className="border-[3px] border-line border-dashed bg-surface p-8 text-center sm:p-12"
    >
      <p className="font-display text-2xl sm:text-3xl">{title}</p>
      {description ? (
        <p className="mx-auto mt-3 max-w-md">{description}</p>
      ) : null}
      {onAction ? (
        <ActionButton className="mt-6" onClick={onAction}>
          {action ?? "Tentar novamente"}
        </ActionButton>
      ) : (
        <ActionButton asChild className="mt-6">
          <Link to="/">{action ?? "Voltar à loja"}</Link>
        </ActionButton>
      )}
    </div>
  );
}
