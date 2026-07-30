import Link from "next/link";

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

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <header className="flex items-center justify-between border-b-[3px] border-primary bg-surface-container-low px-5 py-4 sm:px-8">
        <span className="font-display text-lg font-extrabold tracking-tight">
          Consumo<span className="text-primary">Smart</span>
        </span>
        <nav className="flex items-center gap-3">
          <Link
            href="#planos"
            className="hidden text-sm font-semibold text-on-surface-variant hover:text-on-surface sm:inline"
          >
            Planos
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-outline-variant bg-surface-container-high px-4 py-2 text-sm font-bold hover:border-secondary"
          >
            Entrar
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            O sistema completo pra rodar seu bar ou restaurante,
            <span className="text-primary"> do balcão ao fechamento</span>
          </h1>
          <p className="max-w-2xl text-lg text-on-surface-variant">
            PDV, comandas, cozinha em tempo real e app do cliente na mesa — tudo
            num só lugar, do barzinho de esquina à rede com várias unidades.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              href="mailto:contato@consumosmart.app?subject=Quero%20conhecer%20o%20ConsumoSmart"
              className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-lg shadow-primary/30"
            >
              Falar com a gente
            </a>
            <Link
              href="/login"
              className="rounded-xl border border-outline-variant bg-surface-container-high px-6 py-3 text-sm font-bold hover:border-secondary"
            >
              Já é cliente? Entrar
            </Link>
          </div>
        </section>

        <section id="planos" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <h2 className="mb-2 text-center font-display text-2xl font-bold sm:text-3xl">
            Planos
          </h2>
          <p className="mb-10 text-center text-on-surface-variant">
            Escolha o tamanho certo pro seu negócio hoje — dá pra evoluir de plano quando crescer.
          </p>

          <div className="grid gap-6 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.code}
                className={`relative flex flex-col gap-4 rounded-2xl border-2 bg-surface-container-low p-6 ${
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
                  className={`mt-2 rounded-xl px-4 py-3 text-center text-sm font-bold ${
                    plan.highlight
                      ? "bg-primary text-on-primary"
                      : "border border-outline-variant text-on-surface hover:border-secondary"
                  }`}
                >
                  Quero contratar
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant bg-surface-container-low px-5 py-6 text-center text-xs text-on-surface-variant sm:px-8">
        © {new Date().getFullYear()} ConsumoSmart
      </footer>
    </div>
  );
}
