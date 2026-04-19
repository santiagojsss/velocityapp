"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { searchAll } from "@/lib/data";

const industryIcon: Record<string, string> = {
  "cuesta-azul": "👔", "warasa": "📱", "matias-manzano": "🦷",
  "iphone-monte": "📲", "celltech": "🔧", "cadena-cell": "🛠️",
  "nqn-importados": "🏪", "velocity": "⚡",
};

const priorityColor: Record<string, string> = {
  alta: "#ef4444", media: "#eab308", baja: "#22c55e",
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const results = searchAll(query);
  const hasResults = results.clients.length > 0 || results.tasks.length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "#222638", border: "1px solid #2e3349" }}>
        <svg width="14" height="14" fill="none" stroke="#8b90a7" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar clientes, tareas, guiones..."
          className="bg-transparent text-sm outline-none w-full"
          style={{ color: "#e8eaf0" }}
        />
        {query && (
          <button onClick={() => { setQuery(""); setOpen(false); }} style={{ color: "#8b90a7", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>×</button>
        )}
      </div>

      {open && query && (
        <div className="absolute top-full mt-2 w-full rounded-xl overflow-hidden z-50 shadow-2xl" style={{ background: "#1a1d27", border: "1px solid #2e3349", minWidth: 360 }}>
          {!hasResults && (
            <div className="px-4 py-6 text-center text-sm" style={{ color: "#8b90a7" }}>Sin resultados para "{query}"</div>
          )}

          {results.clients.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#8b90a7", background: "#222638" }}>Clientes</div>
              {results.clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { router.push(`/clients/${c.id}`); setOpen(false); setQuery(""); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <span>{industryIcon[c.id] ?? "•"}</span>
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#e8eaf0" }}>{c.name}</div>
                    <div className="text-xs" style={{ color: "#8b90a7" }}>{c.industry}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {results.tasks.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "#8b90a7", background: "#222638" }}>Tareas</div>
              {results.tasks.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { router.push(`/clients/${t.client_id}`); setOpen(false); setQuery(""); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: priorityColor[t.priority] }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#e8eaf0" }}>{t.title}</div>
                    <div className="text-xs" style={{ color: "#8b90a7" }}>{t.client_id} · vence {t.due_date}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
