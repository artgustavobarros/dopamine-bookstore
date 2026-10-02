export const siteUrl = "https://dopamine-bookstore.vercel.app";

export const homeStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@id": `${siteUrl}/#website`,
      "@type": "WebSite",
      description:
        "Livraria fictícia e projeto de demonstração. Simulação de catálogo e compras com zero reais cobrados.",
      inLanguage: ["pt-BR", "en"],
      name: "Depois Eu Leio (Dopamine Bookstore)",
      url: `${siteUrl}/`,
    },
    {
      "@id": `${siteUrl}/#bookstore`,
      "@type": "BookStore",
      currenciesAccepted: "BRL",
      description:
        "Loja de demonstração e portfólio. Pedidos e pagamentos são fictícios.",
      name: "Depois Eu Leio",
      paymentAccepted: "Simulated zero-cost checkout",
      priceRange: "R$ 0,00",
      url: `${siteUrl}/`,
    },
  ],
};
