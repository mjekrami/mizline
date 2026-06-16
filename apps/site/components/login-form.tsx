"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { canAccessAdmin } from "@mizline/shared";
import { loginStaff } from "@/lib/auth-session";

interface LoginFormProps {
  staffPath: string;
  nextPath: string;
}

export function LoginForm({ staffPath, nextPath }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginStaff({ email, password });
      const destination =
        nextPath.includes("/admin") && !canAccessAdmin(result.user.role)
          ? `/${staffPath}/kitchen`
          : nextPath;
      router.push(destination);
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center p-6">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Staff login</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access the kitchen display or admin dashboard.
          </p>
        </div>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="font-medium">Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2"
          />
        </label>

        {error ? (
          <p className="rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
