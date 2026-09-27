## 1. Tokens de Cores OKLCH e Suite de Keyframes CSS

- [x] 1.1 Atualizar `src/styles.css` com as variáveis OKLCH exatas (`oklch(90.5% 0.182 98.111)`, `oklch(63.7% 0.237 25.331)`, `oklch(97% 0.001 106.424)`, etc.) para temas claro e escuro.
- [x] 1.2 Inserir os 10 `@keyframes del-*` (`del-in`, `del-card`, `del-pop`, `del-stamp`, `del-drop`, `del-heart`, `del-bump`, `del-sheet`, `del-fade`, `del-spin`) e classes utilitárias no `src/styles.css`.
- [x] 1.3 Atualizar `ActionButton` e botões globais para aplicar as transições táteis (`translate(-2px, -2px)` com sombra expandindo de 4px para 6px no hover, e colapso no active).

## 2. Redesenho de BookCover e BookCard

- [x] 2.1 Refatorar `BookCover` em `src/components/store/book-cover.tsx` para ter proporção 3/4 flush, padrão halftone radial pontilhado, etiqueta branca de título, autor em pílula preta e carimbo `PROMO!` inclinado.
- [x] 2.2 Refatorar `BookCard` em `src/components/store/book-card.tsx` removendo textos redundantes abaixo da capa e adicionando sombra vermelha de 8px no hover (`box-shadow: 8px 8px 0 oklch(63.7% 0.237 25.331)`).
- [x] 2.3 Implementar transição de estado no botão "Adicionar ao carrinho" (fica verde `oklch(79.2% 0.209 151.711)` com `"✓ No carrinho"` e animação `del-pop`) e botão de favoritos (fica vermelho com coração branco e `del-heart`).

## 3. Gestão de Endereços Múltiplos e Automação ViaCEP

- [x] 3.1 Estender o modelo de dados de usuário e store em `src/lib/store.ts` para suportar `addresses: Address[]`, `prefAddr` e ações para adicionar, remover e definir endereço preferido.
- [x] 3.2 Implementar utilitário `src/lib/viacep.ts` para consulta de CEP na API do ViaCEP com preenchimento automático de logradouro, cidade e UF.
- [x] 3.3 Adicionar componente de gestão de endereços na página de conta (`src/routes/account.tsx`) com lista de endereços salvos, badge de preferido e formulário expansível com busca de CEP.

## 4. Checkout Interativo e Simulação Pix

- [x] 4.1 Implementar seletor tátil de endereço de entrega no checkout (`src/routes/checkout/index.tsx`) com suporte a endereços salvos e novo endereço com opção de salvar na conta.
- [x] 4.2 Implementar componente visual de cartão de crédito interativo com detecção de bandeira (Visa, Mastercard, Amex, Elo), máscara de formatação e simulação de recusa (10%).
- [x] 4.3 Implementar tela de espera e simulação do Pix com matriz 25x25 de QR Code, timer de 60s, barra de progresso colorida e botão de protótipo "Simular leitura no celular" com carimbo `PAGO!`.

## 5. Estilização dos Botões no Auth e Verificação

- [x] 5.1 Atualizar botões de submissão do formulário de autenticação (`/account` e `/register`) com fundo escuro e sombra vermelha de alto contraste (`box-shadow: 4px 4px 0 oklch(63.7% 0.237 25.331)`).
- [x] 5.2 Executar testes, lint e validação de build para garantir que todas as telas compilam e funcionam perfeitamente sem regressões.
