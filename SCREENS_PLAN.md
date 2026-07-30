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
- [x] **Modelo de cadastro de estabelecimento** — o admin do sistema (você) cadastra o estabelecimento e a pessoa responsável inicial por ele (tela 0.3, Módulo 0). A partir daí, essa pessoa responsável consegue, de forma autônoma, cadastrar o resto da equipe do estabelecimento (garçom, caixa, cozinha, etc. — tela 29) direto pela Área de Gestão do Restaurante, sem precisar falar com o admin do sistema de novo. Decidido em 2026-07-30 — ver [[As 4 Áreas do Sistema]] abaixo.
- [x] **Cadastro de estabelecimento tem dois caminhos** — (1) o admin cria diretamente (tela 0.3), ou (2) o próprio estabelecimento se cadastra sozinho pelo site, sem qualquer contato com o admin (tela 0.4, autoatendimento). Os dois caminhos terminam no mesmo lugar: uma conta de Gestor do Estabelecimento com acesso à Área de Gestão do Restaurante. Decidido em 2026-07-30.
- [x] **Poderes do admin do sistema na Área 1** — além de cadastrar estabelecimentos, o admin pode: definir o preço de cada módulo cobrável (tela 0.5) e alterar manualmente o status de um estabelecimento — ativo, suspenso, cancelado — independente do que a cobrança automática diria (tela 0.6). Mais poderes serão adicionados aqui conforme surgirem. Decidido em 2026-07-30.
- [x] **Modelo de cobrança — Estrutura de 3 Planos** — resolve a decisão em aberto anterior sobre módulos fechados vs. ilimitados: o ConsumoSmart vende 3 planos fixos e nomeados (não módulos avulsos à la carte), pensados para levar a maioria dos clientes ao plano do meio:
  - **Starter** (R$ 99–119/mês) — porta de entrada para quem só quer abandonar papel e caneta: PDV no caixa/balcão (telas 2, 3, 4, 5), abertura/fechamento de conta (tela 6), e Cardápio Digital via QR **apenas para visualização** (variante enxuta da tela 14, sem carrinho/pedido — o cliente lê o cardápio no celular mas ainda chama o garçom para pedir).
  - **Essencial** ("mais popular", R$ 169–189/mês) — tudo do Starter **+** Autoatendimento completo (cliente faz check-in, pede e acompanha pelo próprio celular — telas 13, 14, 15, 16, 17, 18) **+** KDS por setor (telas 11, 12).
  - **Pro / Gestão Total** (R$ 289–349/mês, plano-âncora) — tudo do Essencial **+** Estoque Avançado, Ficha Técnica com baixa automática por venda (tela 24) e DRE (Demonstrativo de Resultado — amplia a tela 23).
  Decidido em 2026-07-30. Detalhamento completo em [FUNCTIONAL_SPEC.md](./FUNCTIONAL_SPEC.md#os-3-planos-do-consumosmart).
- [x] **Sistema precisa nascer pronto para o "liga/desliga" por plano** — cada funcionalidade paga (autoatendimento, KDS, estoque avançado, ficha técnica, DRE) precisa poder ser ativada ou desativada por estabelecimento conforme o plano contratado, sem exigir uma reescrita — é o que a tela 0.5 configura e a tela 0.6 reflete no status de cada estabelecimento. Decidido em 2026-07-30.
- [x] **Landing Page pública** — o site do ConsumoSmart tem uma página inicial (tela 0.0) que apresenta o produto e os 3 planos acima, com um botão que leva ao cadastro por autoatendimento (tela 0.4). Decidido em 2026-07-30.
- [x] **Onde entram os módulos que ficaram fora dos 3 planos** — resolve a decisão em aberto anterior:
  - **Reserva de Mesa** (tela 27) → **Essencial** (e Pro). É ferramenta de aumento de faturamento/fluxo de salão, ajuda a puxar a venda do plano intermediário.
  - **Emissão de NFC-e / Fiscal** (tela 26) → **Essencial e Pro**, não no Starter (público-alvo do Starter é majoritariamente MEI, que geralmente não emite nota ao consumidor final). Dentro disso, **limite mensal de notas emitidas no Essencial, ilimitado no Pro** — a única funcionalidade com um limite de uso dentro do plano, o resto é liga/desliga por funcionalidade.
  - **Contas a Pagar/Receber** (tela 25) → **Pro**. É o coração do financeiro, anda junto com quem já controla estoque.
  - **Fornecedores & Cotação** (tela 28) → **Pro**. Alimenta o Contas a Pagar e a Ficha Técnica do Estoque — não faz sentido isolado num plano mais barato.
  - **"Comissões"** (nome comercial do antigo Módulo 6 — RH & Folha de Pagamento) → **Pro**. Rastrear desempenho financeiro individual da equipe é dor de gestor maduro, que já paga o plano mais caro. **Exceção dentro do próprio módulo:** a tela 29 (Cadastro de Funcionários & Papéis) continua liberada em **todos os planos**, porque é pré-requisito técnico do Login Único (tela 1) — qualquer estabelecimento, mesmo Starter, precisa cadastrar seus garçons/caixas para eles conseguirem logar e operar o PDV. Só as telas 30-33 (Ponto/Falta, Adiantamento, Rateio de Taxa de Serviço, Folha de Pagamento) ficam exclusivas do Pro.
  Decidido em 2026-07-30. Ver tabela atualizada em [FUNCTIONAL_SPEC.md](./FUNCTIONAL_SPEC.md#os-3-planos-do-consumosmart).

## Decisões em aberto

- [ ] **Ordem de geração** — Fase 0 (Demo) completa primeiro, Fase 1 (retaguarda) na sequência. Confirmar.

## As 4 Áreas do Sistema

O ConsumoSmart tem 4 áreas de acesso, cada uma com público e propósito diferentes. Todo módulo abaixo pertence a uma delas:

1. **Área de Gestão do Sistema** (Módulo 0) — uso exclusivo do admin do ConsumoSmart (você). Cadastra estabelecimentos novos na plataforma (ou recebe os que se cadastraram sozinhos), define o preço e o conteúdo dos 3 planos (Starter/Essencial/Pro) e pode alterar o status de qualquer estabelecimento manualmente. **Não é a única porta de entrada:** o site público tem uma Landing Page (tela 0.0) e um estabelecimento pode se cadastrar sozinho por ali, sem passar por você (tela 0.4).
2. **Área de Gestão do Restaurante** (Módulos 5 e 6) — uso do(s) responsável(is) por um estabelecimento (dono/gerente). Cadastra cardápio, mesas, equipe, configura a marca própria (white-label), acompanha relatórios e — na Fase 1 — folha de pagamento.
3. **Área de Operação Diária** (Módulos 2 e 3) — uso da equipe do estabelecimento durante o expediente: garçom, caixa, cozinha, bar. Mapa de mesas, lançamento de pedido, fechamento de conta, KDS.
4. **Área do Cliente** (Módulo 4) — uso do cliente final do restaurante, via QR Code na mesa.

Ver especificação funcional detalhada (sem termos técnicos): [FUNCTIONAL_SPEC.md](./FUNCTIONAL_SPEC.md).

## Módulo 0 — Gestão do Sistema (ConsumoSmart Admin)

> Telas 0.1, 0.2, 0.3, 0.5 e 0.6 são restritas ao admin do sistema (você) — não visíveis nem acessíveis a nenhum estabelecimento. As telas 0.0 e 0.4 são a exceção: são públicas, no site institucional, voltadas para visitantes e estabelecimentos. Numeração `0.x` porque foi adicionada depois das telas 1-33 já numeradas — não reordena nada existente.

### Fase 0
- [ ] 0.0 Landing Page (Site Público) — página inicial do site do ConsumoSmart: proposta de valor e vitrine dos 3 planos (Starter, Essencial, Pro — ver decisão "Estrutura de 3 Planos"), com o plano Essencial destacado como "mais popular". Botão principal leva ao cadastro por autoatendimento (tela 0.4); enquanto essa não existir, pode levar a um contato manual (WhatsApp/formulário) que cai no seu colo para você cadastrar pela tela 0.3.
- [ ] 0.1 Login do Admin do Sistema — acesso separado das contas de qualquer estabelecimento; só você (e futuros membros da sua equipe, se houver) usa.
- [ ] 0.2 Painel de Estabelecimentos — lista de todos os restaurantes/redes cadastrados na plataforma, com status (ativo, em teste, suspenso), plano contratado e busca.
- [ ] 0.3 Cadastro de Estabelecimento & Responsável (pelo admin) — cria o restaurante (nome, identificador, logo inicial), escolhe o plano contratado e cria a conta da pessoa responsável (Gestor do Estabelecimento), que passa a ter acesso próprio à Área de Gestão do Restaurante (Módulos 5 e 6) para operar o resto sozinha, incluindo cadastrar sua própria equipe (tela 29). Usado quando é você quem está trazendo o cliente para a plataforma.
- [ ] 0.6 Detalhe & Status do Estabelecimento — abre um estabelecimento específico (cadastrado por você ou por autoatendimento) para ver seus dados, plano contratado e histórico; permite alterar o status manualmente (ativar, suspender, cancelar) e trocar o plano na mão, independente do que a cobrança automática diria — por exemplo, para liberar um teste estendido, fazer um upgrade pontual num mês de evento, ou suspender por inadimplência.

### Fase 1 (Avançado)
- [ ] 0.4 Cadastro Público de Estabelecimento (Autoatendimento) — página aberta no site do ConsumoSmart, geralmente acessada a partir da Landing Page (tela 0.0), onde o próprio dono/gerente de um estabelecimento se cadastra sozinho, sem falar com o admin: preenche os dados do negócio, escolhe um dos 3 planos e cria sua própria conta de responsável. Resultado idêntico ao da tela 0.3, só que sem intervenção manual sua.
- [ ] 0.5 Gestão de Planos & Preços — cadastro dos 3 planos vendidos (Starter, Essencial, Pro): nome, preço e quais funcionalidades cada um libera (autoatendimento, KDS, reserva de mesa, fiscal, estoque avançado/ficha técnica, DRE, financeiro, fornecedores, "Comissões"). É essa tela que liga/desliga cada funcionalidade paga por estabelecimento, de acordo com o plano contratado — inclusive o caso especial da tela 26 (NFC-e), que tem um limite mensal de notas no Essencial e é ilimitada no Pro.

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
- [ ] 23. Dashboard de Vendas / Relatórios (**escopo ampliado em 2026-07-30:** inclui DRE — Demonstrativo de Resultado — exclusivo do plano Pro, ver decisão "Estrutura de 3 Planos")
- [ ] 24. Estoque & Ficha Técnica (**escopo ampliado em 2026-07-29:** estoque segregado por setor — cozinha, bar, salão, limpeza — cada um com seu próprio saldo e movimentação)
- [ ] 25. Contas a Pagar / Receber — **plano Pro**
- [ ] 26. Emissão de NFC-e (Fiscal) — **planos Essencial (com limite mensal de notas) e Pro (ilimitado)**; não incluso no Starter
- [ ] 27. Reserva de Mesa — vincula ao status "reserved" do Mapa de Mesas (tela 2); horário, nome/telefone do cliente, nº de pessoas — **planos Essencial e Pro**
- [ ] 28. Fornecedores & Cotação de Insumos — cadastro de fornecedores por insumo (mesmo item, múltiplos fornecedores), preço de compra por fornecedor/data, preço de venda e margem/lucro do produto final; comparação entre fornecedores — **plano Pro**

## Módulo 6 — RH & Folha de Pagamento (vendido como "Comissões")

> Adicionado em 2026-07-29 a partir de necessidade explícita: folha de pagamento, adiantamento, taxa de serviço (rateio), falta, hora extra. Nome comercial "Comissões" definido em 2026-07-30 — **plano Pro**, com uma exceção (tela 29, ver abaixo).

### Fase 1 (Avançado)
- [ ] 29. Cadastro de Funcionários & Papéis (garçom, cozinha, caixa, etc. — reaproveita papéis do Login Único, tela 1) — feito de forma autônoma pelo Gestor do Estabelecimento (a conta dele é criada pelo admin do sistema na tela 0.3; a equipe dele, não). **Liberado em todos os planos** (Starter, Essencial, Pro) — é pré-requisito técnico do Login Único, não faz parte do pacote "Comissões" vendido só no Pro.
- [ ] 30. Ponto: Falta & Hora Extra
- [ ] 31. Adiantamento de Salário (vale)
- [ ] 32. Rateio de Taxa de Serviço entre Equipe — consome a taxa de serviço cobrada no Fechamento de Conta (tela 6)
- [ ] 33. Folha de Pagamento (fechamento mensal, consolida 29-32)

---

## Progresso

| Fase | Telas | Feitas |
|---|---|---|
| Fase 0 (Demo) | 25 | 5/25 |
| Fase 1 (Retaguarda + RH) | 15 | 0/15 |
| **Total** | **40** | **5/40** |

Próxima fatia sugerida: tela 1 (Login Único Multi-Papéis) — resolve as pendências de "vínculo do garçom" nas telas 3 e 4 — ou Módulo 3 (KDS), que fecha o ciclo atendimento↔cozinha usando os `order_items` que já existem no schema. Telas 0.0, 0.1, 0.2, 0.3 e 0.6 também são pré-requisito real: sem elas não existe forma de mostrar o produto, cadastrar um estabelecimento e seu responsável, nem dar suporte a ele, fora do banco de dados direto. Telas 0.4 (autoatendimento) e 0.5 (planos e preços) ficam na Fase 1 mas já têm o modelo de cobrança definido (3 planos — ver "Decisões tomadas"), então podem furar a fila se fizer sentido comercialmente.

Itens adicionados em 2026-07-29 (gap analysis a pedido do usuário): telas 27-33 (Reserva de Mesa, Fornecedores & Cotação, e Módulo 6 — RH/Folha de Pagamento), além de pendências anotadas nas telas 2, 3, 4, 6 e 24 (vínculo de garçom, transferência entre mesas, logo na nota, estoque por setor).

Itens adicionados em 2026-07-30, 2ª rodada (autoatendimento e cobrança por módulos, a pedido do usuário): tela 0.4 (Cadastro Público de Estabelecimento), tela 0.5 (Gestão de Módulos & Preços), tela 0.6 (Detalhe & Status do Estabelecimento), e nova decisão em aberto sobre modelo de cobrança (módulos fechados por quantidade de itens com excedente pago vs. módulos ilimitados).

Itens adicionados em 2026-07-30 (a pedido do usuário, para deixar explícitas as 4 áreas de acesso do sistema): seção "As 4 Áreas do Sistema", Módulo 0 — Gestão do Sistema (telas 0.1-0.3), e esclarecimento de que o cadastro de equipe (tela 29) é autônomo do Gestor do Estabelecimento, não do admin do sistema. Especificação funcional sem termos técnicos em [FUNCTIONAL_SPEC.md](./FUNCTIONAL_SPEC.md).

Itens adicionados em 2026-07-30, 3ª rodada (Landing Page e Estrutura de 3 Planos, a pedido do usuário): tela 0.0 (Landing Page), decisão "Modelo de cobrança — Estrutura de 3 Planos" (Starter/Essencial/Pro, resolve a decisão em aberto anterior), tela 0.5 renomeada para Gestão de Planos & Preços, DRE incluído no escopo da tela 23 (exclusivo do plano Pro), e nova decisão em aberto sobre onde encaixar os módulos que os 3 planos não cobriram (Contas a Pagar/Receber, NFC-e, Reserva de Mesa, Fornecedores, RH/Folha).

Itens adicionados em 2026-07-30, 4ª rodada (a pedido do usuário, resolve a decisão em aberto da rodada anterior): Reserva de Mesa (tela 27) → Essencial; NFC-e (tela 26) → Essencial (com limite mensal) e Pro (ilimitado), fora do Starter; Contas a Pagar/Receber (tela 25) e Fornecedores (tela 28) → Pro; Módulo 6 renomeado comercialmente para "Comissões", exclusivo do Pro — **com uma ressalva editorial deste assistente, não pedida explicitamente pelo usuário**: a tela 29 (Cadastro de Funcionários) continua liberada em todos os planos, porque telas 3 e 4 (Comanda da Mesa e Lançamento de Pedidos) já dependem dela via Login Único (tela 1) para qualquer estabelecimento operar — colocá-la só no Pro travaria o Starter e o Essencial. Vale confirmar com o usuário se essa ressalva faz sentido.
