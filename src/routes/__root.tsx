import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import { ActionButton } from "@/components/store/action-button";
import { StoreLayout } from "@/components/store/layout";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  component: StoreLayout,
  head: () => ({
    links: [
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      {
        href: appCss,
        rel: "stylesheet",
      },
    ],
    meta: [
      {
        charSet: "utf-8",
      },
      {
        content: "width=device-width, initial-scale=1",
        name: "viewport",
      },
      {
        title: "Depois Eu Leio — livraria imaginária",
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  const locale = useStore((state) => state.locale);
  const text = t(locale);
  return (
    <div className="mx-auto max-w-5xl px-5 pt-16">
      <div className="border-[3px] border-line bg-surface p-10 text-center shadow-[6px_6px_0_var(--line)]">
        <h1 className="font-display text-4xl">{text.notFound}</h1>
        <ActionButton asChild className="mt-6">
          <Link to="/">{text.goHome}</Link>
        </ActionButton>
      </div>
    </div>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
