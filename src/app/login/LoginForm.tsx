"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";
import { createClient } from "@/lib/supabase/client";
import { PasswordField } from "@/components/auth/PasswordField";

const initialState: AuthState = { error: null };

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.53 5.53 0 0 1-2.4 3.63v3.02h3.87c2.27-2.09 3.58-5.17 3.58-8.83Z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.96-1.07 7.94-2.9l-3.87-3.02c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.28v3.11A12 12 0 0 0 12 24Z"
        fill="#34A853"
      />
      <path
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l4-3.11Z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.77c1.76 0 3.34.61 4.58 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.61l4 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginForm() {
  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [signInState, signInAction, signInPending] = useActionState(signIn, initialState);
  const [signUpState, signUpAction, signUpPending] = useActionState(signUp, initialState);

  const state = mode === "entrar" ? signInState : signUpState;
  const action = mode === "entrar" ? signInAction : signUpAction;
  const pending = mode === "entrar" ? signInPending : signUpPending;

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 shadow-xl shadow-primary/5 sm:p-8">
      <div className="flex rounded-xl border border-outline-variant bg-surface-container-high p-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => setMode("entrar")}
          className={`flex-1 rounded-lg py-2 transition-colors ${
            mode === "entrar" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("criar")}
          className={`flex-1 rounded-lg py-2 transition-colors ${
            mode === "criar" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Criar conta
        </button>
      </div>

      <form action={action} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          E-mail
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-secondary"
          />
        </label>
        <PasswordField
          label="Senha"
          name="password"
          minLength={6}
          autoComplete={mode === "entrar" ? "current-password" : "new-password"}
        />

        {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary transition-transform hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100"
        >
          {pending ? "Aguarde…" : mode === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
        <span className="h-px flex-1 bg-outline-variant" />
        ou
        <span className="h-px flex-1 bg-outline-variant" />
      </div>

      <button
        type="button"
        onClick={handleGoogle}
        className="flex items-center justify-center gap-3 rounded-xl border border-[#dadce0] bg-white px-4 py-3 text-sm font-bold text-[#3c4043] shadow-sm transition-colors hover:bg-[#f8f9fa]"
      >
        <GoogleIcon />
        Entrar com Google
      </button>

      <p className="text-center text-xs text-on-surface-variant">
        {mode === "entrar" ? (
          <>
            Não tem uma conta?{" "}
            <button
              type="button"
              onClick={() => setMode("criar")}
              className="font-bold text-primary hover:underline"
            >
              Cadastre-se gratuitamente
            </button>
          </>
        ) : (
          <>
            Já tem uma conta?{" "}
            <button
              type="button"
              onClick={() => setMode("entrar")}
              className="font-bold text-primary hover:underline"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </div>
  );
}
