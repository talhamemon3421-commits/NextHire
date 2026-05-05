import React, { useMemo, useState, type FormEvent } from "react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { login } from "@/features/auth/api/authApi";

type Props = {
  onSuccess?: () => void;
};

export function LoginForm({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6 && !isLoading;
  }, [email, password, isLoading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await login({ email, password, role: "employer" });
      const token = res.data?.accessToken;
      if (token) localStorage.setItem("accessToken", token);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Email address"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />
      <Input
        label="Password"
        placeholder="••••••••"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      {error ? (
        <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={!canSubmit} className="w-full">
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>

      <div className="flex items-center justify-between text-xs text-white/45">
        <span>Employer access only</span>
        <button
          type="button"
          className="text-sky-300/90 hover:text-sky-200 transition"
          onClick={() => setError("Password reset not wired yet.")}
        >
          Forgot password?
        </button>
      </div>
    </form>
  );
}

