# ConsumoSmart — Especificação Funcional

> Este documento descreve **o que o sistema faz e para quem**, em linguagem simples, sem termos técnicos. Para a lista de telas, status de desenvolvimento e decisões de arquitetura, ver [SCREENS_PLAN.md](./SCREENS_PLAN.md). Os números entre parênteses (ex. "tela 6") remetem às telas listadas lá.

## Visão geral

O ConsumoSmart é usado por quatro grupos de pessoas diferentes, cada um em sua própria área do sistema. Ninguém vê ou acessa a área de outro grupo:

| Área | Quem usa | Em uma frase |
|---|---|---|
| 1. Gestão do Sistema | Você (dono do ConsumoSmart) | Cadastra novos estabelecimentos clientes do ConsumoSmart |
| 2. Gestão do Restaurante | Dono/gerente do estabelecimento | Configura e administra o próprio negócio |
| 3. Operação Diária | Garçom, caixa, cozinha, bar | Usa o sistema durante o expediente para atender clientes |
| 4. Cliente | Cliente sentado à mesa | Vê o cardápio, pede, acompanha e fecha a conta |

Um mesmo estabelecimento sempre envolve as áreas 2, 3 e 4. A área 1 só existe uma vez — é a "porta de entrada" pela qual um estabelecimento passa a existir na plataforma.

---

## Área 1 — Gestão do Sistema

**Para quem:** exclusivamente você, como responsável pelo ConsumoSmart. Nenhum estabelecimento enxerga ou acessa esta área — com uma única exceção, explicada abaixo.

**Para que serve:** administrar a plataforma como um todo — quais estabelecimentos existem nela, quanto cada um paga e se está com acesso liberado ou não. **Você não é a única porta de entrada de um estabelecimento novo**: um restaurante pode chegar até o sistema de duas formas diferentes, que terminam no mesmo lugar.

O ConsumoSmart tem um **site público**, cuja primeira tela é uma Landing Page: mostra o que o sistema faz e apresenta os 3 planos (ver seção abaixo). É a partir dela que um visitante vira lead ou cliente — seja falando com você, seja se cadastrando sozinho.

**As duas formas de um estabelecimento entrar na plataforma:**
1. **Você cadastra** — você mesmo cria o estabelecimento e a conta da pessoa responsável por ele, normalmente quando é você quem está prospectando/trazendo aquele cliente.
2. **O estabelecimento se cadastra sozinho** — existe uma página pública, no próprio site do ConsumoSmart, onde o dono ou gerente de um restaurante se cadastra por conta própria: preenche os dados do negócio, cria sua conta e escolhe o que vai contratar — sem precisar falar com você em nenhum momento.

Nos dois casos, o resultado é o mesmo: uma conta de Gestor do Estabelecimento com acesso à Área 2 (Gestão do Restaurante).

**O que mais dá para fazer aqui (só você):**
- Ver a lista de todos os estabelecimentos que já usam o ConsumoSmart — os que você cadastrou e os que se cadastraram sozinhos — com uma indicação rápida de quais estão ativos, em teste ou parados.
- Abrir um estabelecimento específico para ver seus dados, o que ele contratou e seu histórico.
- **Alterar o status de um estabelecimento manualmente** — ativar, suspender ou cancelar o acesso dele, por fora de qualquer cobrança automática (por exemplo: liberar um teste mais longo, ou suspender por falta de pagamento).
- **Definir o preço e o conteúdo de cada um dos 3 planos** vendidos pelo ConsumoSmart (ver "Os 3 Planos do ConsumoSmart" abaixo).
- No futuro, provavelmente mais controles administrativos da plataforma serão adicionados aqui.

**O que não é feito aqui:** o dia a dia do restaurante. Uma vez que o responsável tem sua conta, cardápio, mesas, equipe, configuração de marca — tudo isso é feito por ele mesmo na Área 2, não por você.

### Os 3 Planos do ConsumoSmart

O ConsumoSmart é vendido em 3 planos fixos, mostrados lado a lado na Landing Page, pensados para que a maioria dos estabelecimentos escolha naturalmente o plano do meio.

| | **Starter** | **Essencial** ⭐ mais popular | **Pro / Gestão Total** |
|---|---|---|---|
| Preço sugerido | R$ 99–119/mês | R$ 169–189/mês | R$ 289–349/mês |
| Para quem | O bar pequeno que só quer abandonar papel e caneta | Quem quer automatizar o atendimento e a cozinha, ganhar velocidade | Quem não quer perder um centavo com desperdício e precisa de controle financeiro rigoroso |
| O que inclui | PDV no caixa/balcão, abertura e fechamento de conta, e Cardápio Digital por QR Code **só para visualização** (o cliente lê o cardápio no celular, mas ainda chama o garçom para pedir) | Tudo do Starter **+** Autoatendimento (o cliente faz check-in, pede e acompanha tudo pelo próprio celular) **+** telas de produção na Cozinha e no Bar **+** Reserva de Mesa **+** emissão de Nota Fiscal (com um limite de notas por mês) | Tudo do Essencial **+** nota fiscal **ilimitada** **+** Controle de Estoque Avançado **+** Ficha Técnica de cada prato (baixa do estoque automática a cada venda) **+** DRE (relatório de resultado do negócio) **+** Contas a Pagar/Receber **+** Fornecedores **+** "Comissões" (controle de falta/hora extra, adiantamento, rateio de taxa de serviço e folha de pagamento da equipe) |

**Por que essa estrutura funciona:** o Starter existe para trazer para dentro do ecossistema quem acha sistema "caro demais" (o público típico do Starter costuma ser MEI, que muitas vezes nem emite nota ao consumidor final — por isso a nota fiscal só aparece a partir do Essencial). O Essencial mostra que a diferença de preço para o Starter é pequena perto do ganho de ter o cliente pedindo sozinho — vira a escolha óbvia, reforçada por reserva de mesa (atrai cliente) e nota fiscal. O Pro serve de "âncora": ele reúne tudo que só interessa a uma gestão financeira madura (contas a pagar, fornecedores, comissões da equipe) — ao ver esse pacote, o dono do bar sente que o Essencial já está com ótimo custo-benefício.

> Cadastrar funcionários (garçom, caixa, cozinha) **não é um recurso pago** — está liberado em todos os planos, inclusive o Starter, porque sem isso nem a equipe consegue entrar no sistema para atender. Só o controle mais avançado sobre a equipe (falta, hora extra, adiantamento, comissão, folha de pagamento) é que fica reservado ao plano Pro.

---

## Área 2 — Gestão do Restaurante

**Para quem:** o dono ou gerente do estabelecimento (a pessoa cuja conta foi criada na Área 1). Pode, no futuro, incluir mais de uma pessoa com esse nível de acesso no mesmo estabelecimento.

**Para que serve:** é o "escritório" do restaurante dentro do sistema — onde se configura tudo que a equipe vai usar todo dia e se acompanha como o negócio está indo.

**O que dá para fazer aqui:**
- **Cardápio:** cadastrar categorias e produtos, com nome, descrição, preço e para qual setor de produção cada item vai (cozinha, bar, sobremesas).
- **Mesas e ambientes:** organizar o salão em áreas (ex. "Salão", "Varanda") e cadastrar as mesas de cada uma, com nome ou número.
- **Marca própria (white-label):** subir a logo do estabelecimento e, se quiser, personalizar as cores para que o sistema (inclusive o app que o cliente usa na mesa) pareça "do restaurante", não do ConsumoSmart.
- **Equipe:** cadastrar as pessoas que trabalham no estabelecimento — garçom, caixa, cozinha, bar, etc. — e o papel de cada uma. Isso é feito diretamente aqui, pelo próprio responsável, sem precisar pedir para o admin do sistema. Uma mesma pessoa pode estar cadastrada em mais de um estabelecimento seu (ex. uma rede com 2 unidades) usando o mesmo login. *(liberado em todos os planos)*
- **Quem está logado agora:** painel em tempo real mostrando quem da equipe está com acesso aberto no sistema neste momento, e desde que horário. Não existe restrição de horário para logar — qualquer pessoa da equipe pode entrar quando precisar — então este painel é a forma de o dono/gerente ter visibilidade sobre acessos incomuns sem travar ninguém no meio do expediente. *(liberado em todos os planos)*
- **Relatórios:** acompanhar vendas, faturamento e desempenho do estabelecimento; o plano Pro soma a isso o DRE.
- **Reservas:** registrar reserva de mesa com nome, telefone, horário e número de pessoas. *(planos Essencial e Pro)*
- **Nota fiscal:** emissão do documento fiscal exigido por lei para cada venda. *(planos Essencial — com limite de notas por mês — e Pro, ilimitado; não incluso no Starter)*
- **Estoque:** controlar o que entra e sai de insumos, separado por setor (cozinha, bar, salão, limpeza), com receita/composição de cada produto (ficha técnica com baixa automática a cada venda). *(plano Pro)*
- **Financeiro:** contas a pagar e a receber do estabelecimento. *(plano Pro)*
- **Fornecedores:** cadastrar de quem se compra cada insumo, comparar preços entre fornecedores diferentes e acompanhar a margem de lucro de cada produto do cardápio. *(plano Pro)*
- **Comissões (equipe):** controlar falta e hora extra, adiantamento de salário, dividir a taxa de serviço entre a equipe e fechar a folha de pagamento no fim do mês. *(plano Pro — mas o cadastro básico de quem é quem na equipe, acima, vale para todo mundo)*

---

## Área 3 — Operação Diária

**Para quem:** quem trabalha no salão, caixa, cozinha ou bar durante o expediente — garçom, atendente de balcão, cozinheiro, barman.

**Para que serve:** é o sistema em uso, minuto a minuto, enquanto o restaurante está funcionando e atendendo clientes.

**O que dá para fazer aqui:**
- **Entrar no sistema** informando quem é (cada pessoa tem seu próprio acesso, para que todo pedido fique registrado com o nome de quem atendeu). Quem trabalha em mais de um estabelecimento que usa o ConsumoSmart usa o mesmo login em todos — se tiver vínculo ativo em mais de um, escolhe em qual quer entrar naquele momento. Não existe bloqueio por "horário de trabalho esperado": qualquer pessoa com vínculo ativo pode entrar a qualquer hora (troca de turno de última hora é normal nesse tipo de negócio) — o que existe é visibilidade para o dono/gerente, não trava (ver Área 2).
- **Ver o salão de relance:** um mapa das mesas mostrando quais estão livres, ocupadas, esperando a conta ou reservadas, e há quanto tempo cada uma está naquele estado.
- **Abrir e lançar pedidos** em uma mesa: adicionar itens do cardápio, ajustar quantidade, anotar observações, dividir a conta entre pessoas, transferir uma mesa para outra ou juntar comandas.
- **Vender no balcão**, para quem não vai sentar (viagem/retirada), sem precisar abrir uma mesa.
- **Fechar a conta**: dividir o valor entre as pessoas (por igual, por item ou com valor livre — por exemplo, para dar um desconto ou cortesia), escolher a forma de pagamento e imprimir/gerar o comprovante com a marca do restaurante.
- **Ver e responder chamados do cliente:** quando alguém aperta "chamar garçom" ou "pedir a conta" pelo próprio celular (Área 4), aparece um aviso aqui.
- **Cozinha e bar (produção):** uma tela por setor mostrando os pedidos que chegaram, para organizar o preparo por ordem de chegada; cada item pode ser marcado como "iniciado o preparo" — esse é o momento em que o cliente deixa de poder cancelar aquele item sozinho pelo celular dele.
- **Abertura e fechamento de caixa:** registrar o dinheiro inicial do turno (fundo de troco), retiradas de dinheiro durante o dia (sangria) e a conferência no fechamento do turno.

---

## Área 4 — Área do Cliente

**Para quem:** o cliente sentado à mesa (ou, futuramente, esperando o pedido de balcão), usando o próprio celular.

**Para que serve:** dar ao cliente autonomia para ver o cardápio, pedir e acompanhar o pedido sem precisar chamar o garçom para tudo — e permitir que o mesmo aplicativo funcione em qualquer restaurante que use o ConsumoSmart, não só em um.

**O que dá para fazer aqui:**
- **Entrar na mesa** apontando a câmera do celular para um código (QR Code) que fica na própria mesa — isso identifica automaticamente o restaurante e a mesa, sem precisar digitar nada.
- **Ver o cardápio** daquele restaurante, com fotos, descrição e preço de cada item.
- **Montar e revisar o pedido** antes de confirmar; enquanto um item ainda não entrou em preparo na cozinha, o próprio cliente pode cancelá-lo sozinho — depois disso, só o garçom consegue.
- **Acompanhar o andamento** de cada item pedido (recebido → em preparo → pronto → entregue), em tempo real.
- **Chamar o garçom** com um toque, sem precisar aceno ou grito.
- **Pedir a conta**, ver a sugestão de divisão entre as pessoas da mesa e, quando o garçom confirmar o pagamento, ver o fechamento.
- **Ver a marca do restaurante:** se o estabelecimento tiver personalizado sua identidade visual (Área 2), o app do cliente muda de cara para parecer "daquele restaurante" — senão, usa a aparência padrão do ConsumoSmart, só indicando em qual restaurante o cliente está.

---

## Como as áreas se conectam

```
              Landing Page (site público)
           mostra os 3 planos: Starter/Essencial/Pro
                             │
        ┌────────────────────┴───────────────────┐
        ▼                                         ▼
Área 1 (você)                          Autoatendimento (site público)
   cadastra o estabelecimento              o próprio estabelecimento
   + responsável                           se cadastra sozinho
        │                                        │
        └───────────────────┬────────────────────┘
                             ▼
Área 2 (dono/gerente do restaurante)
   cadastra cardápio, mesas, marca própria e a EQUIPE
        │
        ▼
Área 3 (equipe no expediente)               Área 4 (cliente na mesa)
   atende, lança pedido, fecha conta  <───►   pede, acompanha, chama, fecha
        (mesmo pedido, visto dos dois lados)
```

Um exemplo de ponta a ponta: você cadastra o restaurante "Bar do Zé" e cria a conta do gerente (Área 1) → o gerente cadastra o cardápio, as mesas e contrata/cadastra dois garçons (Área 2) → um garçom faz login e abre a mesa 5 (Área 3) → o cliente sentado na mesa 5 escaneia o QR, vê o cardápio e pede uma cerveja (Área 4) → o pedido aparece no bar para preparo (Área 3) → o cliente acompanha o status até "entregue" (Área 4) → no fim, o cliente pede a conta e o garçom fecha o pagamento (Áreas 3 e 4 se encontrando de novo).
