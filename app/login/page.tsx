"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Usuario o contraseña incorrectos.");
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f1117" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">⚡</div>
          <div className="text-xl font-bold tracking-wider" style={{ color: "#818cf8" }}>VELOCITY</div>
          <div className="text-sm mt-1" style={{ color: "#8b90a7" }}>Panel Interno</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349", background: "#1a1d27" }}>
            <div className="px-4 pt-4 pb-2">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8b90a7" }}>
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                required
                className="w-full bg-transparent outline-none text-sm mt-1"
                style={{ color: "#e8eaf0" }}
                placeholder="tu usuario"
              />
            </div>
            <div style={{ borderTop: "1px solid #2e3349" }} className="px-4 pt-4 pb-4">
              <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8b90a7" }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-transparent outline-none text-sm mt-1"
                style={{ color: "#e8eaf0" }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-center px-4 py-2 rounded-lg" style={{ color: "#ef4444", background: "#ef444410", border: "1px solid #ef444430" }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity"
            style={{ background: "#6366f1", color: "#fff", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}
