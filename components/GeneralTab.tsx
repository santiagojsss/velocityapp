"use client";
import { useState } from "react";
import { useClientAccount, ClientAccount } from "@/lib/useClientStore";
import { PRODUCTION_OPTIONS } from "@/lib/constants";
import { useRole } from "@/lib/useRole";

type Props = { clientId: string };

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <span style={{ fontSize: 11, color: "#8b90a7", fontWeight: 600, letterSpacing: "0.05em" }}>{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: "#222638", border: "1px solid #2e3349", borderRadius: 8,
          color: value ? "#e8eaf0" : "#8b90a740", padding: "7px 10px", fontSize: 13,
          width: "100%", outline: "none",
        }}
      />
    </div>
  );
}

export default function GeneralTab({ clientId }: Props) {
  const { data, save, ready } = useClientAccount(clientId);
  const { role } = useRole();
  const [newImprovement, setNewImprovement] = useState("");
  const [saved, setSaved] = useState(false);

  if (!ready) return <div className="p-4 text-sm" style={{ color: "#8b90a7" }}>Cargando...</div>;

  const field = (key: keyof ClientAccount, value: string | string[]) => {
    save({ [key]: value });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const isAdmin = role === "admin";
  const currentStage = PRODUCTION_OPTIONS.find((o) => o.value === data.production_status);

  return (
    <div className="flex flex-col gap-4">

      {/* Estado de producción */}
      <div className="rounded-xl p-5" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {currentStage ? (
              <>
                <span className="text-base">{currentStage.icon}</span>
                <span className="font-semibold text-sm" style={{ color: currentStage.color }}>{currentStage.label}</span>
              </>
            ) : (
              <span className="text-sm" style={{ color: "#8b90a740" }}>Sin etapa asignada</span>
            )}
          </div>
          {saved && <span className="text-xs px-2 py-1 rounded-full" style={{ color: "#22c55e", background: "#22c55e18" }}>✓ Guardado</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {PRODUCTION_OPTIONS.map((opt) => {
            const active = data.production_status === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => field("production_status", opt.value)}
                style={{
                  fontSize: 12, padding: "5px 12px", borderRadius: 20,
                  background: active ? opt.bg : "transparent",
                  color: active ? opt.color : "#8b90a7",
                  border: `1px solid ${active ? opt.color + "50" : "#2e3349"}`,
                  cursor: "pointer", fontWeight: active ? 600 : 400,
                }}
              >{opt.icon} {opt.label}</button>
            );
          })}
        </div>
      </div>

      {/* Fechas en una sola fila */}
      <div className="rounded-xl p-5 flex gap-4" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
        <DateField label="GRABACIÓN" value={data.recording_date} onChange={(v) => field("recording_date", v)} />
        {isAdmin && (
          <>
            <DateField label="RENOVACIÓN" value={data.renewal_date} onChange={(v) => field("renewal_date", v)} />
            <DateField label="ÚLT. CONTACTO" value={data.last_contact_date} onChange={(v) => field("last_contact_date", v)} />
            <DateField label="PRÓX. CONTACTO" value={data.next_contact_date} onChange={(v) => field("next_contact_date", v)} />
          </>
        )}
      </div>

      {/* Mejoras del mes */}
      <div className="rounded-xl p-5" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
        <div className="text-xs font-semibold mb-3" style={{ color: "#8b90a7", letterSpacing: "0.05em" }}>MEJORAS DEL MES</div>
        <div className="flex flex-col gap-1.5 mb-3">
          {data.monthly_improvements.length === 0 && (
            <p className="text-sm" style={{ color: "#2e3349" }}>Sin mejoras cargadas aún</p>
          )}
          {data.monthly_improvements.map((imp, i) => (
            <div key={i} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg" style={{ background: "#222638" }}>
              <span className="text-sm" style={{ color: "#e8eaf0" }}>📌 {imp}</span>
              <button
                onClick={() => field("monthly_improvements", data.monthly_improvements.filter((_, idx) => idx !== i))}
                style={{ color: "#8b90a750", background: "none", border: "none", cursor: "pointer", fontSize: 13 }}
              >✕</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newImprovement}
            onChange={(e) => setNewImprovement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newImprovement.trim()) {
                field("monthly_improvements", [...data.monthly_improvements, newImprovement.trim()]);
                setNewImprovement("");
              }
            }}
            placeholder="Agregar mejora… (Enter)"
            style={{ background: "#222638", border: "1px solid #2e3349", borderRadius: 8, color: "#e8eaf0", padding: "7px 12px", fontSize: 13, flex: 1, outline: "none" }}
          />
          <button
            onClick={() => {
              if (!newImprovement.trim()) return;
              field("monthly_improvements", [...data.monthly_improvements, newImprovement.trim()]);
              setNewImprovement("");
            }}
            style={{ background: "#6366f1", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13, cursor: "pointer" }}
          >+ Agregar</button>
        </div>
      </div>

      {/* Notas de seguimiento — solo admin */}
      {isAdmin && (
        <div className="rounded-xl p-5" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
          <div className="text-xs font-semibold mb-3" style={{ color: "#8b90a7", letterSpacing: "0.05em" }}>NOTAS DE SEGUIMIENTO</div>
          <textarea
            value={data.account_notes}
            onChange={(e) => field("account_notes", e.target.value)}
            rows={4}
            placeholder="Llamadas, compromisos, observaciones del cliente…"
            style={{ background: "#222638", border: "1px solid #2e3349", borderRadius: 8, color: "#e8eaf0", padding: "8px 12px", fontSize: 13, width: "100%", outline: "none", resize: "vertical" }}
          />
        </div>
      )}

    </div>
  );
}
