"use client";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function UserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const name = session?.user?.name ?? "—";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-80"
        style={{ background: "#6366f130", color: "#818cf8", border: "none", cursor: "pointer" }}
        title={name}
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 rounded-xl overflow-hidden shadow-lg z-50"
          style={{ background: "#1a1d27", border: "1px solid #2e3349", minWidth: 160 }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid #2e3349" }}>
            <div className="text-sm font-semibold" style={{ color: "#e8eaf0" }}>{name}</div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/[0.04]"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: "#ef4444" }}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
