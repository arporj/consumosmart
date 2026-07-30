# ConsumoSmart — Plano de Telas

> Design system: [DESIGN.md](./DESIGN.md) ("Balcão Quente")
> Exploração de layout (histórico): [Artifact — 3 Direções de Layout](https://claude.ai/code/artifact/1937a790-3ec2-4462-bd9d-bb7c68379f7f)
> Desenvolvimento real em código (Next.js + Supabase) a partir de 2026-07-29 — ver [[project_scope_decision]]. Não usamos mais Stitch/MCP para gerar telas.

Status: `[ ]` não iniciada · `[~]` em progresso · `[x]` implementada em código

## Decisões tomadas

- [x] **Dispositivos** — sistema roda em celular, tablet e desktop (sem exigir desktop físico, pensando em bares menores). Todas as telas devem ser anatômicas para toque.
- [x] **Direção visual** — **Balcão Quente** escolhida entre 3 propostas (Aurora Glass, Balcão Quente, Terminal Neon). Escuro, quente (paprika/marigold/teal), abas grossas, quadro de cardápio, comanda em formato de ticket de papel. Protótipo: [Artifact — 3 Direções de Layout](https://claude.ai/code/artifact/1937a790-3ec2-4462-bd9d-bb7c68379f7f).
- [x] **Mapa de Mesas** — mesas aceitam nome customizado (ex. "André"), além de número; botão "+" cria mesa nova inline.
- [x] **Data/hora** — sempre visíveis no cabeçalho (relógio ao vivo), em todas as telas do PDV.
- [x] **Lançamento de Pedido** — botão "+" vira imediatamente um par "–/+" com a quantidade, sem precisar abrir outra tela.
- [x] **Fechamento de Conta** — opção "Valor customizado" na divisão, com campo de valor livre (cortesia, desconto, valor fechado).
- [x] **Logo do estabelecimento (white-label)** — slot fixo no cabeçalho em todas as telas do sistema; obrigatório no mínimo no App do Cliente. Afeta especialmente a tela 22 (Configuração White-Label) e o shell/header compartilhado por todas as telas.
- [ ] **Logo na nota de fechamento** — a mesma logo white-label (tela 22) também deve aparecer no documento impresso/PDF gerado no Fechamento de Conta (tela 6), não só no header em tela. Adicionado em 2026-07-29.
- [ ] **Cancelamento de item pelo cliente** — o cliente pode cancelar um item do próprio pedido (principalmente os da cozinha) enquanto a cozinha ainda não marcou o item como "em preparo" no KDS (tela 12). Depois desse marco, o cancelamento deixa de ser self-service e exige o garçom/atendente (ação na Comanda da Mesa, tela 3). Regra depende de um status por item (ex. `pending` → `preparing` → ...) no `order_items`. Adicionado em 2026-07-29.

## Decisões em aberto

- [ ] **Ordem de geração** — Fase 0 (Demo) completa primeiro, Fase 1 (retaguarda) na sequência. Confirmar.

## Módulo 1 — Projeto & Design System

- [x] Schema inicial (`supabase/migrations/0001_init.sql`): organizations, restaurants, tables, product_categories, products, orders, order_items, order_payments, order_events.
- [x] Scaffold Next.js (App Router) + TypeScript + Tailwind v4, tokens do Balcão Quente em `src/app/globals.css`.

## Módulo 2 — POS / Atendimento

### Fase 0 (Demo)
- [ ] 1. Login Único Multi-Papéis
- [x] 2. Mapa de Mesas Anatômico — `src/app/(pos)/mesas/page.tsx` (áreas, mesas nomeadas ou numeradas, "+ Nova mesa"/"+ Nova área" inline, status livre/ocupada/aguardando/reservada, tempo decorrido ao vivo). Reserva em si (nome/telefone/horário do cliente) segue pendente na tela 27 — hoje é só uma nota de texto na mesa.
- [x] 3. Comanda da Mesa & Ações — `src/app/(pos)/mesas/[tableId]/ComandaMesaClient.tsx` (pessoas, desconto, "Transferir mesa" e "Juntar comanda" implementados; "Solicitar fechamento" deixa a mesa "aguardando conta"; fechamento/pagamento reaproveita a tela 6). **Pendência:** vínculo do garçom que abriu/lançou o pedido depende do Login Único (tela 1), ainda não implementado.
- [x] 4. Cardápio Touch PDV (Lançamento de Pedidos) — `src/app/(pos)/cardapio` (gestão) e `src/app/(pos)/balcao` (lançamento). **Pendência identificada em 2026-07-29:** ainda falta vincular nome/número do garçom em cada lançamento de pedido na mesa.
- [x] 5. Venda Balcão (Takeaway / Direct Order) — `src/app/(pos)/balcao/page.tsx`
- [x] 6. Fechamento de Conta & Split de Pagamento — `src/app/(pos)/fechamento/page.tsx` (divisão por pessoa com valor no botão, customizado progressivo, serviço opcional). **Pendência identificada em 2026-07-29:** nota de fechamento (impressa/PDF) precisa incluir a logo white-label (tela 22); taxa de serviço cobrada aqui precisa alimentar o rateio de equipe (tela 32).
- [ ] 7. Painel de Chamadas (Garçom & Conta)

### Fase 1 (Retaguarda)
- [ ] 8. Abertura de Caixa (fundo de troco)
- [ ] 9. Sangria / Suplementação
- [ ] 10. Fechamento Cego de Turno & Conciliação

## Módulo 3 — KDS (Kitchen Display System)

### Fase 0
- [ ] 11. KDS por Setor (Cozinha, Bar, Sobremesas)
- [ ] 12. Detalhe do Item KDS — ação "Iniciar preparo" muda o item para `preparing`; esse é o marco que trava o cancelamento self-service do cliente (ver regra em "Decisões tomadas" e tela 15)

## Módulo 4 — App do Cliente (Mobile First)

### Fase 0
- [ ] 13. Check-in via QR Code
- [ ] 14. Cardápio do Cliente Interativo
- [ ] 15. Revisão do Pedido — cliente pode cancelar item individual enquanto o status ainda for `pending` (item não marcado "em preparo" na tela 12); botão de cancelar some/desabilita assim que a cozinha inicia o preparo
- [ ] 16. Acompanhamento do Pedido (timeline) — reflete o status por item (`pending`/`preparing`/...) que também governa se o cancelamento (tela 15) ainda está disponível
- [ ] 17. Chamar Garçom
- [ ] 18. Pedir Conta / Split entre amigos
- [ ] 19. Variações White-Label (Padrão vs. Tema Custom do Restaurante)

## Módulo 5 — Admin & Backoffice

### Fase 0
- [ ] 20. Cadastro de Produtos & Cardápio
- [ ] 21. Cadastro & Layout de Mesas
- [ ] 22. Configuração White-Label do Restaurante

### Fase 1 (Avançado)
- [ ] 23. Dashboard de Vendas / Relatórios
- [ ] 24. Estoque & Ficha Técnica (**escopo ampliado em 2026-07-29:** estoque segregado por setor — cozinha, bar, salão, limpeza — cada um com seu próprio saldo e movimentação)
- [ ] 25. Contas a Pagar / Receber
- [ ] 26. Emissão de NFC-e (Fiscal)
- [ ] 27. Reserva de Mesa — vincula ao status "reserved" do Mapa de Mesas (tela 2); horário, nome/telefone do cliente, nº de pessoas
- [ ] 28. Fornecedores & Cotação de Insumos — cadastro de fornecedores por insumo (mesmo item, múltiplos fornecedores), preço de compra por fornecedor/data, preço de venda e margem/lucro do produto final; comparação entre fornecedores

## Módulo 6 — RH & Folha de Pagamento

> Adicionado em 2026-07-29 a partir de necessidade explícita: folha de pagamento, adiantamento, taxa de serviço (rateio), falta, hora extra.

### Fase 1 (Avançado)
- [ ] 29. Cadastro de Funcionários & Papéis (garçom, cozinha, caixa, etc. — reaproveita papéis do Login Único, tela 1)
- [ ] 30. Ponto: Falta & Hora Extra
- [ ] 31. Adiantamento de Salário (vale)
- [ ] 32. Rateio de Taxa de Serviço entre Equipe — consome a taxa de serviço cobrada no Fechamento de Conta (tela 6)
- [ ] 33. Folha de Pagamento (fechamento mensal, consolida 29-32)

---

## Progresso

| Fase | Telas | Feitas |
|---|---|---|
| Fase 0 (Demo) | 20 | 5/20 |
| Fase 1 (Retaguarda + RH) | 13 | 0/13 |
| **Total** | **33** | **5/33** |

Próxima fatia sugerida: tela 1 (Login Único Multi-Papéis) — resolve as pendências de "vínculo do garçom" nas telas 3 e 4 — ou Módulo 3 (KDS), que fecha o ciclo atendimento↔cozinha usando os `order_items` que já existem no schema.

Itens adicionados em 2026-07-29 (gap analysis a pedido do usuário): telas 27-33 (Reserva de Mesa, Fornecedores & Cotação, e Módulo 6 — RH/Folha de Pagamento), além de pendências anotadas nas telas 2, 3, 4, 6 e 24 (vínculo de garçom, transferência entre mesas, logo na nota, estoque por setor).
