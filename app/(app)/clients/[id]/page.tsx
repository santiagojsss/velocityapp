"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { getClient, getMetrics, getTasks } from "@/lib/data";
import TaskList from "@/components/TaskList";
import GeneralTab from "@/components/GeneralTab";
import MetricsTab from "@/components/MetricsTab";

const deliveryConfig: Record<string, { label: string; color: string; bg: string }> = {
  active:         { label: "Activo",        color: "#22c55e", bg: "#22c55e20" },
  inactive:       { label: "Inactivo",      color: "#8b90a7", bg: "#8b90a720" },
  not_delivering: { label: "No entregando", color: "#ef4444", bg: "#ef444420" },
};

const actionColor = (a: string) => {
  if (a.startsWith("GANADOR") || a.startsWith("MANTENER")) return "#22c55e";
  if (a.startsWith("PAUSAR"))  return "#ef4444";
  if (a.startsWith("INTERESANTE") || a.startsWith("SEGUNDO")) return "#818cf8";
  return "#eab308";
};

const tabs = ["General", "Tareas", "Métricas", "Guiones", "Notas"];

export default function ClientPage() {
  const { id } = useParams<{ id: string }>();
  const client = getClient(id);
  const metrics = getMetrics(id);
  const tasks = getTasks(id);
  const openTasks = tasks.filter((t) => t.status !== "completada");
  const [activeTab, setActiveTab] = useState("General");

  if (!client) return <div className="p-8" style={{ color: "#8b90a7" }}>Cliente no encontrado.</div>;

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-5" style={{ color: "#8b90a7" }}>
        <a href="/" style={{ color: "#818cf8", textDecoration: "none" }}>Dashboard</a>
        <span>/</span>
        <span style={{ color: "#e8eaf0" }}>{client.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#e8eaf0" }}>{client.name}</h1>
          <p className="text-sm mt-1" style={{ color: "#8b90a7" }}>{client.industry}</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {client.contact && <span style={{ color: "#818cf8" }}>👤 {client.contact}</span>}
          {client.instagram && <span style={{ color: "#8b90a7" }}>{client.instagram}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b" style={{ borderColor: "#2e3349" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-medium transition-colors"
            style={{
              color: activeTab === tab ? "#818cf8" : "#8b90a7",
              borderBottom: activeTab === tab ? "2px solid #818cf8" : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            {tab}
            {tab === "Tareas" && openTasks.length > 0 && (
              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#6366f130", color: "#818cf8" }}>
                {openTasks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── GENERAL ── */}
      {activeTab === "General" && <GeneralTab clientId={id} />}

      {/* ── TAREAS ── */}
      {activeTab === "Tareas" && (
        <div>
          <p className="text-sm mb-4" style={{ color: "#8b90a7" }}>
            {openTasks.length} tareas abiertas · ordenadas por prioridad y fecha
          </p>
          <TaskList tasks={tasks} />
        </div>
      )}

      {/* ── MÉTRICAS ── */}
      {activeTab === "Métricas" && <MetricsTab metrics={metrics} clientId={id} defaultRenewalDay={client.renewal_day} />}

      {/* ── GUIONES ── */}
      {activeTab === "Guiones" && (
        <div className="flex flex-col gap-4">
          {client.pains.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
              <div className="text-sm font-semibold mb-3" style={{ color: "#818cf8" }}>Dolores del público</div>
              <ul className="flex flex-col gap-1">
                {client.pains.map((p, i) => <li key={i} className="text-sm" style={{ color: "#8b90a7" }}>• {p}</li>)}
              </ul>
            </div>
          )}
          {client.differentials.length > 0 && (
            <div className="rounded-xl p-5" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
              <div className="text-sm font-semibold mb-3" style={{ color: "#22c55e" }}>Diferenciales</div>
              <ul className="flex flex-col gap-1">
                {client.differentials.map((d, i) => <li key={i} className="text-sm" style={{ color: "#8b90a7" }}>✓ {d}</li>)}
              </ul>
            </div>
          )}
          {client.cta_format && (
            <div className="rounded-xl p-5" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
              <div className="text-sm font-semibold mb-2" style={{ color: "#f97316" }}>Formato CTA</div>
              <p className="text-sm" style={{ color: "#8b90a7" }}>{client.cta_format}</p>
            </div>
          )}
          {!client.pains.length && !client.differentials.length && (
            <div className="rounded-xl p-8 text-center" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
              <div className="text-4xl mb-3">📝</div>
              <div className="font-semibold" style={{ color: "#e8eaf0" }}>Sin guiones cargados aún</div>
            </div>
          )}
        </div>
      )}

      {/* ── NOTAS ── */}
      {activeTab === "Notas" && (
        <div className="rounded-xl p-6" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
          <div className="text-sm font-semibold mb-3" style={{ color: "#818cf8" }}>Notas internas</div>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#8b90a7" }}>
            {client.notes || "Sin notas."}
          </p>
          <div className="mt-4 text-xs" style={{ color: "#2e3349" }}>Última actualización: {client.last_updated}</div>
        </div>
      )}
    </div>
  );
}
