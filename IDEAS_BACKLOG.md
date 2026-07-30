# ConsumoSmart — Ideias avaliadas, não implementadas

> Diferente de [SCREENS_PLAN.md](./SCREENS_PLAN.md), este documento não é uma lista de telas a construir — é um registro de ideias que já foram discutidas e **conscientemente adiadas ou descartadas**, com o motivo. Serve pra não perder o raciocínio e pra não reabrir a mesma discussão do zero mais tarde. Quando uma ideia daqui avança para virar tela de verdade, ela sai daqui e entra no SCREENS_PLAN/FUNCTIONAL_SPEC.

## Notificação via WhatsApp para o gestor a cada login da equipe

**Status:** adiada — não descartada, mas não é a próxima coisa a construir.

**A ideia:** quando um funcionário faz login no sistema (Login Único, tela 1), o dono/gerente do estabelecimento recebe uma notificação — cogitou-se via push de PWA, e depois via WhatsApp.

**Por que não entrou como tela agora:**
- A versão "push via PWA" foi descartada primeiro: notificação push web é pouco confiável no público-alvo do produto, principalmente em iPhone (Safari só entrega push se o usuário instalar o site na tela de início como PWA — passo que a maioria dos donos de bar não vai dar). Construir a feature em cima de um canal que boa parte dos usuários nunca vai receber é investir em algo que não entrega o valor prometido.
- A alternativa mais barata e já decidida — registrar todo login (`staff_id` + `restaurant_id` + horário) e mostrar isso num painel "Quem está logado agora" em tempo real (tela 34, ver SCREENS_PLAN.md) — resolve a necessidade real (visibilidade do gestor) sem exigir nenhuma infraestrutura de notificação. Essa é a versão que entrou no plano.
- WhatsApp resolveria o problema de confiabilidade do push (é o canal que esse público já usa todo dia), mas tem custo próprio: integração paga com um provedor (Twilio, Meta Business API ou similar), número de telefone verificado, aprovação de template de mensagem pela Meta, e manutenção de mais uma dependência externa. Não é "só mandar uma notificação" — é uma integração de verdade.
- Risco de ruído: se a equipe é grande ou o expediente tem muita entrada/saída de gente (troca de turno, cobertura), notificar a cada login pode virar o tipo de alerta que o dono aprende a ignorar/silenciar rápido, perdendo o valor justamente quando importaria.

**Quando reconsiderar:** se, depois do painel de presença (tela 34) estar em uso real, o feedback de donos/gerentes for "eu preciso ser avisado na hora, não só poder checar quando abro o app" — aí faz sentido avaliar WhatsApp como canal (não push de PWA). Nesse momento, vale desenhar como uma notificação configurável (ex. só fora do horário comercial, ou só pra papéis específicos) em vez de "todo login sempre notifica", pra não recriar o problema de ruído.

## Bloquear login fora do horário de escala do funcionário

**Status:** descartada como bloqueio rígido — parte da ideia virou outra coisa (ver abaixo).

**A ideia original:** um funcionário só poderia logar no sistema durante o horário em que estivesse escalado para trabalhar naquele estabelecimento; fora disso, o login seria bloqueado, a não ser que o gerente/dono liberasse uma exceção manual (ex. alguém que recebe entregas em horário alternativo).

**Por que foi descartada:**
- Exigiria construir um módulo de escala de trabalho (cadastro de turnos por funcionário, por dia da semana) que não existe em nenhuma tela do plano — seria bloquear login em cima de uma feature que ainda nem foi desenhada.
- Em bar/restaurante pequeno, troca de turno de última hora é rotina (colega cobre colega, gerente chama alguém de última hora num dia cheio). Um bloqueio rígido por horário cria fricção real — gente impedida de trabalhar no pior momento possível — sem um ganho de segurança proporcional.
- O limite de acesso que realmente importa (só quem tem vínculo ativo naquele estabelecimento consegue logar nele) já é garantido pela regra de multi-estabelecimento (ver SCREENS_PLAN.md, "Decisões tomadas"), sem depender de horário.

**O que ficou:** a parte boa da ideia — visibilidade para o gestor — virou o painel de presença em tempo real (tela 34), sem bloquear ninguém. Se um dia existir um módulo de escala de verdade, faria sentido reavaliar um modo *opcional* (não padrão) de alerta ou restrição por horário, por estabelecimento — não um bloqueio global desde o dia 1.

## Login com Apple (Sign in with Apple) na tela `/login`

**Status:** adiada — não descartada, só fora do primeiro corte do login unificado (2026-07-30).

**A ideia:** além de e-mail/senha e Google, oferecer "Entrar com Apple" na mesma tela de login única (Cliente/Staff/SupraAdmin), útil principalmente pra clientes em iPhone.

**Por que não entrou agora:** o usuário pediu explicitamente pra excluir Apple deste primeiro corte — Google já cobre a maior parte dos casos de uso e é bem mais simples de configurar (só um OAuth Client ID no Google Cloud Console + habilitar o provider no Supabase). Apple exige conta paga no Apple Developer Program, criação de um Services ID, uma chave privada (.p8) e a geração de um client secret assinado (JWT) que expira e precisa ser renovado periodicamente — processo mais longo e com manutenção contínua, sem alguém pedindo por ele ainda.

**Quando reconsiderar:** quando o login por e-mail/senha + Google já estiver rodando de verdade e houver sinal real de que usuários em iPhone preferem/exigem Apple (ou a política da própria Apple passar a exigir Sign in with Apple como alternativa a outros logins sociais em apps na App Store, caso o app do cliente vire nativo). O código do `/login` já foi estruturado pra só adicionar um botão a mais quando chegar a hora (mesmo padrão do botão Google em `src/app/login/LoginForm.tsx`).
