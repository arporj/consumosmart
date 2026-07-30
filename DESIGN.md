---
name: ConsumoSmart Balcão Quente
colors:
  surface: '#241a14'
  surface-dim: '#1c140f'
  surface-bright: '#3a2a1f'
  surface-container-lowest: '#180f0b'
  surface-container-low: '#2e2119'
  surface-container: '#332417'
  surface-container-high: '#3a2a1f'
  surface-container-highest: '#46331f'
  on-surface: '#f6ede2'
  on-surface-variant: '#c7b29c'
  inverse-surface: '#f6ede2'
  inverse-on-surface: '#241a14'
  outline: '#5c4530'
  outline-variant: '#4a382c'
  surface-tint: '#e6572b'
  primary: '#e6572b'
  on-primary: '#2a1810'
  primary-container: '#4a2013'
  on-primary-container: '#ffb59a'
  secondary: '#f0a93b'
  on-secondary: '#2a1810'
  secondary-container: '#4a3419'
  on-secondary-container: '#ffd699'
  tertiary: '#4fa3a8'
  on-tertiary: '#12201f'
  tertiary-container: '#1f3a3c'
  on-tertiary-container: '#a8dbe0'
  error: '#ff5252'
  on-error: '#450000'
  background: '#241a14'
  on-background: '#f6ede2'
status:
  free: '#8fbf6f'
  occupied: '#e6572b'
  waiting: '#f0a93b'
  reserved: '#4fa3a8'
typography:
  display-lg:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Manrope
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1.0rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 32px
  margin-mobile: 16px
---

## Brand & Style
ConsumoSmart é um sistema de PDV, atendimento, KDS e app do cliente para comércio/restaurante — do barzinho de esquina a uma rede grande. O estilo visual é **Balcão Quente**: escuro, quente e tátil, como hardware de PDV de verdade.

- **Superfícies:** Espresso escuro (`#241A14`) com camadas (`surface-container-*`) que sobem em tom conforme a elevação — sem glassmorphism, sem translucidez.
- **Acento primário:** Paprika (`#E6572B`) para ações primárias, abas ativas e CTAs.
- **Acento secundário:** Marigold (`#F0A93B`) para destaques financeiros, valores e o relógio do cabeçalho.
- **Acento terciário:** Teal (`#4FA3A8`) para seleção de meio de pagamento e estados neutros de confirmação.
- **Status de mesa (cores semânticas, não confundir com as de marca):** Livre (`#8FBF6F`), Ocupada (`#E6572B`), Aguardando Conta (`#F0A93B`), Reservada (`#4FA3A8`).
- **Motivo do ticket:** telas de comanda/fechamento usam o metáfora de papel de ticket (`#FBEFDD` sobre fundo escuro, texto `#2A1810`, borda perfurada no topo) — reforça o hábito de "imprimir pedido" que a equipe de bar já conhece.
- **Toque tátil:** botões e abas grandes (mín. 44px, preferencialmente 48-56px de altura), bordas grossas (2-3px) em elementos de confirmação, cantos com raio moderado (`md`/`lg`), nunca cantos totalmente quadrados nem excessivamente arredondados.

## Typography
- **Headlines & títulos:** `Manrope` (geométrica, peso alto, amigável sem perder seriedade).
- **Corpo & interface:** `Inter` (máxima legibilidade em densidade alta — listas de produtos, comandas).
- **Métricas & valores:** `JetBrains Mono` (preços, totais, cronômetros de KDS, tudo que precisa alinhar em coluna).

## Elementos fixos (cross-cutting, valem para todas as telas do sistema)
- **Logo do estabelecimento:** slot fixo no cabeçalho (branding white-label), obrigatório no App do Cliente e presente no restante do sistema.
- **Data/hora:** relógio real sempre visível no cabeçalho, atualizado ao vivo — nunca estático.
- **Mesas:** aceitam nome customizado além de número (ex. "André"), criadas inline a partir do mapa de mesas.

## Elevation & Depth
Sem glassmorphism. Elevação é comunicada por degraus de superfície (`surface-container-low` → `-high` → `-highest`) e por bordas de 1-2px em `outline-variant`, não por blur.
