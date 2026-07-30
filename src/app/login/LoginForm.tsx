"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";
import { createClient } from "@/lib/supabase/client";

const initialState: AuthState = { error: null };

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
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-outline-variant bg-surface-container-low p-6 sm:p-8">
      <div className="flex rounded-xl border border-outline-variant bg-surface-container-high p-1 text-sm font-bold">
        <button
          type="button"
          onClick={() => setMode("entrar")}
          className={`flex-1 rounded-lg py-2 ${
            mode === "entrar" ? "bg-primary text-on-primary" : "text-on-surface-variant"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setMode("criar")}
          className={`flex-1 rounded-lg py-2 ${
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
        <label className="flex flex-col gap-1 text-sm">
          Senha
          <input
            type="password"
            name="password"
            required
            minLength={6}
            autoComplete={mode === "entrar" ? "current-password" : "new-password"}
            className="rounded-xl border border-outline-variant bg-surface-container-highest px-4 py-3 text-on-surface outline-none focus:border-secondary"
          />
        </label>

        {state.error && <p className="text-sm font-semibold text-error">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-on-primary disabled:opacity-60"
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
        className="rounded-xl border border-outline-variant bg-surface-container-high px-4 py-3 text-sm font-bold hover:border-secondary"
      >
        Entrar com Google
      </button>
    </div>
  );
}
