"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getClients } from "@/lib/data";
import { useAllAccounts } from "@/lib/useClientStore";
import { PRODUCTION_CONFIG } from "@/lib/constants";

const clients = getClients();

const industryIcon: Record<string, string> = {
  "cuesta-azul": "👔",
  "warasa": "📱",
  "matias-manzano": "🦷",
  "iphone-monte": "📲",
  "celltech": "🔧",
  "cadena-cell": "🛠️",
  "nqn-importados": "🏪",
  "velocity": "⚡",
};

export default function Sidebar() {
  const pathname = usePathname();
  const { accounts, ready } = useAllAccounts(clients.map((c) => c.id));
  const isClientPage = pathname.startsWith("/clients/");
  const [clientsOpen, setClientsOpen] = useState(isClientPage);

  return (
    <aside
      style={{ background: "#1a1d27", borderRight: "1px solid #2e3349", width: 220, minHeight: "100vh" }}
      className="flex flex-col flex-shrink-0"
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: "#2e3349" }}>
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <div>
            <div className="font-bold text-sm tracking-wider" style={{ color: "#818cf8" }}>VELOCITY</div>
            <div className="text-xs" style={{ color: "#8b90a7" }}>Panel Interno</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
          style={{
            background: pathname === "/" ? "#6366f120" : "transparent",
            color: pathname === "/" ? "#818cf8" : "#8b90a7",
          }}
        >
          <span>📊</span> Dashboard
        </Link>

        <button
          onClick={() => setClientsOpen((v) => !v)}
          className="flex items-center justify-between px-3 py-2 rounded-lg w-full mt-4"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#8b90a7" }}>Clientes</span>
          <span style={{ color: "#8b90a7", fontSize: 13, transform: clientsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</span>
        </button>

        {clientsOpen && clients.map((c) => {
          const active = pathname === `/clients/${c.id}`;
          const status = ready ? (accounts[c.id]?.production_status ?? "") : "";
          const cfg = PRODUCTION_CONFIG[status] ?? PRODUCTION_CONFIG[""];

          return (
            <Link
              key={c.id}
              href={`/clients/${c.id}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{
                background: active ? "#6366f120" : "transparent",
                color: active ? "#818cf8" : "#e8eaf0",
              }}
            >
              <span>{industryIcon[c.id] ?? "•"}</span>
              <span className="truncate flex-1">{c.name}</span>
              {ready && status && (
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: cfg.color }}
                  title={cfg.label}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto px-5 py-4 text-xs" style={{ color: "#8b90a7", borderTop: "1px solid #2e3349" }}>
        Velocity Performance © 2026
      </div>
    </aside>
  );
}
