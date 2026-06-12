"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signIn, type LoginState } from "@/app/login/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-2 w-full rounded-xl bg-gold-500 py-3 font-display text-sm font-700 uppercase tracking-widest text-pitch-950 transition hover:bg-gold-400 disabled:opacity-60"
    >
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction] = useActionState<LoginState, FormData>(signIn, {
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <label className="block">
        <span className="mb-1 block text-xs font-600 uppercase tracking-widest text-white/60">
          Email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
          placeholder="you@example.com"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-600 uppercase tracking-widest text-white/60">
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20"
          placeholder="••••••••"
        />
      </label>

      {state.error && (
        <p className="rounded-lg border border-flame-500/40 bg-flame-600/15 px-3 py-2 text-sm text-flame-100">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
