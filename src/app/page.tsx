import Link from "next/link";
import { Logo } from "@/components/Logo";

const PLANS = [
  {
    code: "starter",
    name: "Starter",
    price: "R$ 99–119",
    tagline: "O bar pequeno que só quer abandonar papel e caneta",
    features: [
      "PDV no caixa/balcão",
      "Abertura e fechamento de conta",
      "Cardápio digital por QR Code (só visualização)",
    ],
    highlight: false,
  },
  {
    code: "essencial",
    name: "Essencial",
    price: "R$ 169–189",
    tagline: "Automatize o atendimento e a cozinha, ganhe velocidade",
    features: [
      "Tudo do Starter",
      "Autoatendimento: cliente pede e acompanha pelo celular",
      "Telas de produção (Cozinha e Bar)",
      "Reserva de mesa",
      "Nota fiscal (com limite mensal)",
    ],
    highlight: true,
  },
  {
    code: "pro",
    name: "Pro / Gestão Total",
    price: "R$ 289–349",
    tagline: "Controle financeiro rigoroso, sem perder um centavo",
    features: [
      "Tudo do Essencial",
      "Nota fiscal ilimitada",
      "Estoque avançado + ficha técnica",
      "DRE, contas a pagar/receber e fornecedores",
      "Comissões da equipe (ponto, adiantamento, folha)",
    ],
    highlight: false,
  },
] as const;

const BENEFITS = [
  { label: "Tempo real", tone: "text-primary" },
  { label: "Sem papel", tone: "text-tertiary" },
  { label: "Multi-unidade", tone: "text-secondary" },
  { label: "Seus dados, sua nuvem", tone: "text-on-surface" },
] as const;

const TABLE_MOCKUP = [
  "free",
  "occupied",
  "occupied",
  "waiting",
  "free",
  "reserved",
  "occupied",
  "free",
] as const;

const TABLE_COLOR: Record<(typeof TABLE_MOCKUP)[number], string> = {
  free: "bg-status-free/80",
  occupied: "bg-status-occupied/80",
  waiting: "bg-status-waiting/80",
  reserved: "bg-status-reserved/80",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="sticky top-0 z-50 border-b border-outline-variant/60 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-8 sm:flex">
            <Link
              href="#recursos"
              className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
            >
              Recursos
            </Link>
            <Link
              href="#planos"
              className="text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface"
            >
              Planos
            </Link>
          </nav>
          <Link
            href="/login"
            className="rounded-xl border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-bold transition-colors hover:border-secondary"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute top-40 -right-24 h-80 w-80 rounded-full bg-secondary/10 blur-3xl"
          />

          <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 md:py-28">
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
              O sistema completo pra rodar seu bar ou restaurante,
              <span className="text-primary"> do balcão ao fechamento</span>
            </h1>
            <p className="max-w-2xl text-lg text-on-surface-variant md:text-xl">
              PDV, comandas, cozinha em tempo real e app do cliente na mesa — tudo
              num só lugar, do barzinho de esquina à rede com várias unidades.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:contato@consumosmart.app?subject=Quero%20conhecer%20o%20ConsumoSmart"
                className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/30 transition-transform hover:brightness-110 active:scale-95"
              >
                Falar com a gente
              </a>
              <Link
                href="/login"
                className="rounded-xl border border-outline-variant bg-surface-container-high px-6 py-3 text-sm font-bold transition-colors hover:border-secondary"
              >
                Já é cliente? Entrar
              </Link>
            </div>

            <div className="mt-8 w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container-low/80 p-3 shadow-2xl shadow-primary/10 backdrop-blur">
              <div className="flex items-center gap-2 border-b border-outline-variant/60 px-2 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-status-occupied" />
                <span className="h-2.5 w-2.5 rounded-full bg-status-waiting" />
                <span className="h-2.5 w-2.5 rounded-full bg-status-free" />
                <span className="ml-2 text-xs font-semibold text-on-surface-variant">
                  Mapa de mesas
                </span>
                <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-status-free">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-free" />
                  Ao vivo
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 p-3">
                {TABLE_MOCKUP.map((status, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg ${TABLE_COLOR[status]}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between rounded-xl bg-surface-container-high px-4 py-3 text-left">
                <div>
                  <p className="text-xs text-on-surface-variant">Comanda · Mesa 12</p>
                  <p className="font-mono text-lg font-bold">R$ 187,40</p>
                </div>
                <span className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-on-primary">
                  Fechar conta
                </span>
              </div>
            </div>
          </div>
        </section>

        <section
          id="recursos"
          className="border-y border-outline-variant/40 bg-surface-container-lowest/60"
        >
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-5 py-12 sm:px-8 md:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <div key={benefit.label} className="flex flex-col items-center gap-2 text-center">
                <span className={`font-display text-lg font-bold ${benefit.tone}`}>●</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
                  {benefit.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
          <h2 className="mb-2 text-center font-display text-2xl font-bold sm:text-3xl">
            Planos que acompanham seu crescimento
          </h2>
          <p className="mb-10 text-center text-on-surface-variant">
            Escolha o tamanho certo pro seu negócio hoje — dá pra evoluir de plano quando crescer.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.code}
                className={`relative flex flex-col gap-4 rounded-2xl border-2 bg-surface-container-low p-6 transition-transform hover:-translate-y-1 ${
                  plan.highlight ? "border-secondary" : "border-outline-variant"
                }`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-on-secondary">
                    Mais popular
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl font-bold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-on-surface-variant">{plan.tagline}</p>
                </div>
                <p className="font-mono text-3xl font-bold">
                  {plan.price}
                  <span className="text-base font-sans font-normal text-on-surface-variant">
                    /mês
                  </span>
                </p>
                <ul className="flex flex-1 flex-col gap-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span className="text-secondary">✓</span>
                      <span className="text-on-surface-variant">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:contato@consumosmart.app?subject=Quero%20contratar%20o%20plano"
                  className={`mt-2 rounded-xl px-4 py-3 text-center text-sm font-bold transition-transform hover:brightness-110 active:scale-95 ${
                    plan.highlight
                      ? "bg-primary text-on-primary shadow-lg shadow-primary/30"
                      : "border border-outline-variant text-on-surface hover:border-secondary"
                  }`}
                >
                  Quero contratar
                </a>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-outline-variant bg-surface-container-high p-10 text-center sm:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-primary/10 blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-6">
              <h2 className="font-display text-3xl font-extrabold sm:text-4xl">
                Pronto para digitalizar seu restaurante?
              </h2>
              <p className="max-w-xl text-on-surface-variant">
                Fale com a gente e veja como o ConsumoSmart se encaixa no seu balcão, na sua
                cozinha e nas mesas do seu salão.
              </p>
              <a
                href="mailto:contato@consumosmart.app?subject=Quero%20conhecer%20o%20ConsumoSmart"
                className="rounded-xl bg-primary px-8 py-4 text-lg font-bold text-on-primary shadow-xl shadow-primary/30 transition-transform hover:brightness-110 active:scale-95"
              >
                Falar com a gente
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-surface-container-low px-5 py-6 text-center text-xs text-on-surface-variant sm:px-8">
        © {new Date().getFullYear()} ConsumoSmart
      </footer>
    </div>
  );
}
