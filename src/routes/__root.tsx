import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from "@tanstack/react-router";
import { useState } from "react";
import { ActionButton } from "@/components/store/action-button";
import { StoreLayout } from "@/components/store/layout";
import { t } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import archivoFontUrl from "@fontsource/archivo-black/files/archivo-black-latin-400-normal.woff2?url";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  component: StoreLayout,
  head: () => ({
    links: [
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      {
        as: "font",
        crossOrigin: "anonymous",
        fetchPriority: "high",
        href: archivoFontUrl,
        rel: "preload",
        type: "font/woff2",
      },
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
        title: "Depois Eu Leio — Livraria Imaginária (Fake Bookstore & Demo)",
      },
      {
        content:
          "Depois Eu Leio (Dopamine Bookstore) é uma livraria fictícia e projeto de demonstração. Simule compras com zero reais cobrados e navegue pelo catálogo da Open Library.",
        name: "description",
      },
      {
        content: "noindex, follow",
        name: "robots",
      },
      {
        content: "Depois Eu Leio (Dopamine Bookstore)",
        property: "og:site_name",
      },
      {
        content: "website",
        property: "og:type",
      },
      {
        content: "Depois Eu Leio — Livraria Imaginária (Fake Bookstore & Demo)",
        property: "og:title",
      },
      {
        content:
          "Uma livraria fictícia e divertida onde você pode simular compras com zero reais cobrados. Projeto de demonstração com integração Open Library.",
        property: "og:description",
      },
      {
        content: "https://dopamine-bookstore.vercel.app/favicon.svg",
        property: "og:image",
      },
      {
        content: "summary_large_image",
        name: "twitter:card",
      },
      {
        content: "Depois Eu Leio — Livraria Imaginária (Fake Bookstore & Demo)",
        name: "twitter:title",
      },
      {
        content:
          "Livraria simulada de demonstração. Zero reais cobrados, zero cobrança real, livros da Open Library.",
        name: "twitter:description",
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
    <div className="mx-auto w-full max-w-5xl px-5 pt-16">
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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 60 * 1000,
          },
        },
      })
  );
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  );
}
