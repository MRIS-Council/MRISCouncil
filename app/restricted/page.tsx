"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RestrictedLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const result = await login(user, pass);

    if (!result.ok || !result.department) {
      setError(result.error ?? "Wrong username or password.");
      setSubmitting(false);
      return;
    }

    router.push(`/restricted/${result.department}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="card p-7 text-center">
        <h3 className="font-black uppercase text-blue-900 dark:text-blue-100 text-lg">Restricted Area</h3>
        <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mt-1 mb-6">Enter your department's credentials.</p>
        <form onSubmit={submit} className="space-y-3 text-left">
          <input
            placeholder="Username"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            disabled={submitting}
            className="w-full px-3.5 py-3 rounded-xl border-[1.5px] border-blue-100 dark:border-blue-900 bg-transparent text-blue-900 dark:text-blue-100 placeholder:text-blue-900/40 dark:placeholder:text-blue-100/40 disabled:opacity-50"
          />
          <input
            placeholder="Password"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            disabled={submitting}
            className="w-full px-3.5 py-3 rounded-xl border-[1.5px] border-blue-100 dark:border-blue-900 bg-transparent text-blue-900 dark:text-blue-100 placeholder:text-blue-900/40 dark:placeholder:text-blue-100/40 disabled:opacity-50"
          />
          {error && <p className="text-xs text-bad">{error}</p>}
          <button
            disabled={submitting}
            className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-800 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Logging in...
              </>
            ) : (
              "Log in"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}