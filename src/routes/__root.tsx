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

import appCss from "../styles.css?url";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": "https://dopamine-bookstore.vercel.app/#website",
      "@type": "WebSite",
      description:
        "Livraria fictícia e projeto de demonstração. Simulação de catálogo e compras com zero reais cobrados.",
      inLanguage: ["pt-BR", "en"],
      name: "Depois Eu Leio (Dopamine Bookstore)",
      url: "https://dopamine-bookstore.vercel.app/",
    },
    {
      "@id": "https://dopamine-bookstore.vercel.app/#bookstore",
      "@type": "BookStore",
      currenciesAccepted: "BRL",
      description:
        "Loja de demonstração e portfólio. Não é um marketplace real; todos os pedidos e pagamentos são estritamente fictícios.",
      name: "Depois Eu Leio",
      paymentAccepted: "Simulated zero-cost checkout",
      priceRange: "R$ 0,00",
      url: "https://dopamine-bookstore.vercel.app/",
    },
    {
      "@id": "https://dopamine-bookstore.vercel.app/#faq",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Não. O Depois Eu Leio (Dopamine Bookstore) é um projeto de portfólio de engenharia de software e uma simulação satírica. Nenhuma compra é real, nenhum produto físico é enviado e nenhum valor financeiro é debitado.",
          },
          name: "O Depois Eu Leio é um marketplace ou loja real?",
        },
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Dopamine Bookstore (Depois Eu Leio) is an educational portfolio project and simulated marketplace. All purchases and checkouts are fictional; zero currency is charged and no physical books are shipped.",
          },
          name: "Is Dopamine Bookstore a real marketplace?",
        },
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Não. Os métodos de pagamento são fictícios (Pix de mentirinha e Cartão imaginário). Nenhum dado bancário é solicitado e o checkout custa exatamente R$ 0,00.",
          },
          name: "Os pagamentos com Cartão ou Pix cobram dinheiro de verdade?",
        },
        {
          "@type": "Question",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Os dados e capas dos livros são obtidos em tempo real da API pública da Open Library (Internet Archive), com cache local de 1 hora.",
          },
          name: "De onde vêm os livros exibidos no catálogo?",
        },
      ],
    },
  ],
};

export const Route = createRootRoute({
  component: StoreLayout,
  head: () => ({
    links: [
      { href: "/favicon.svg", rel: "icon", type: "image/svg+xml" },
      { href: "https://dopamine-bookstore.vercel.app/", rel: "canonical" },
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
        content:
          "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
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
        content: "https://dopamine-bookstore.vercel.app/",
        property: "og:url",
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
    scripts: [
      {
        children: JSON.stringify(structuredData),
        type: "application/ld+json",
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
  const [queryClient] = useState(() => new QueryClient());
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
