"use client";
import { useState } from "react";
import Link from "next/link";
import { Client } from "@/lib/data";
import { useAllAccounts, useClientAccount, ProductionChecklist } from "@/lib/useClientStore";
import { PRODUCTION_CONFIG } from "@/lib/constants";
import { useWeeklyTasks, getWeekLabel } from "@/lib/weeklyTasks";

const industryIcon: Record<string, string> = {
  "cuesta-azul": "👔", "warasa": "📱", "matias-manzano": "🦷",
  "iphone-monte": "📲", "celltech": "🔧", "cadena-cell": "🛠️",
  "nqn-importados": "🏪", "velocity": "⚡",
};

const CHECKLIST_STEPS = [
  { key: "guiones",             label: "Guiones preparados",    icon: "📝", type: "check" as const, editable: false },
  { key: "grabacion_fecha",     label: "Fecha de grabación",    icon: "📅", type: "date"  as const, editable: false },
  { key: "grabacion_realizada", label: "Grabación realizada",   icon: "🎥", type: "check" as const, editable: false },
  { key: "edicion",             label: "Edición terminada",     icon: "✂️", type: "check" as const, editable: true  },
  { key: "lanzamiento",         label: "Campañas lanzadas",     icon: "🚀", type: "check" as const, editable: true  },
  { key: "seguimiento",         label: "Seguimiento realizado", icon: "✅", type: "check" as const, editable: false },
];

const PIPELINE_STAGES = [
  "guiones-en-proceso", "guiones-listos", "grabacion-programada",
  "en-edicion", "listo-para-lanzar", "publicados",
] as const;

const TEO_TASKS = [
  { id: "tt1", label: "Terminar edición videos de Velocity" },
  { id: "tt2", label: "Terminar edición videos NQN Importados" },
  { id: "tt3", label: "Editar y lanzar Jireh" },
];

function ClientRow({ client, borderTop }: { client: Client; borderTop: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const { data, saveChecklist, ready } = useClientAccount(client.id);
  const status = data.production_status || "guiones-en-proceso";
  const cfg = PRODUCTION_CONFIG[status] ?? PRODUCTION_CONFIG[""];
  const stageIdx = PIPELINE_STAGES.indexOf(status as any);

  return (
    <div style={{ borderTop: borderTop ? "1px solid #2e3349" : "none" }}>
      <div className="flex items-center justify-between px-5 py-3">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-3 flex-1 text-left"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <span>{industryIcon[client.id] ?? "•"}</span>
          <div>
            <div className="text-sm font-medium" style={{ color: "#e8eaf0" }}>{client.name}</div>
            <div className="text-xs mt-0.5" style={{ color: cfg.color }}>{cfg.icon} {cfg.label}</div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {PIPELINE_STAGES.map((_, si) => (
              <div key={si} className="rounded-full" style={{ width: 5, height: 5, background: si <= stageIdx && stageIdx >= 0 ? cfg.color : "#2e3349" }} />
            ))}
          </div>
          <button onClick={() => setExpanded((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8b90a7", fontSize: 14, transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</button>
        </div>
      </div>

      {expanded && ready && (
        <div className="px-5 pb-4">
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
            {CHECKLIST_STEPS.map((step, si) => {
              const isDone = !!(data.production_checklist as any)[step.key];
              return (
                <div key={step.key} className="flex items-center gap-3 px-4 py-2.5" style={{ borderTop: si > 0 ? "1px solid #2e334950" : "none", background: isDone ? "#22c55e06" : "transparent" }}>
                  {step.type === "check" ? (
                    <button
                      onClick={() => step.editable && saveChecklist({ [step.key]: !isDone } as Partial<ProductionChecklist>)}
                      className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: isDone ? "#22c55e" : "#2e3349", background: isDone ? "#22c55e" : "transparent", cursor: step.editable ? "pointer" : "default", opacity: step.editable ? 1 : 0.5 }}
                    >
                      {isDone && <span style={{ color: "#0f1117", fontSize: 8 }}>✓</span>}
                    </button>
                  ) : (
                    <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
                      <span style={{ fontSize: 9, opacity: 0.4 }}>{isDone ? "✓" : "○"}</span>
                    </div>
                  )}
                  <span style={{ fontSize: 10 }}>{step.icon}</span>
                  <span className="text-xs flex-1" style={{ color: isDone ? "#8b90a7" : "#e8eaf0", textDecoration: isDone && step.type === "check" ? "line-through" : "none" }}>
                    {step.label}
                    {step.type === "date" && data.production_checklist.grabacion_fecha && (
                      <span className="ml-2" style={{ color: "#818cf8" }}>{data.production_checklist.grabacion_fecha}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <Link href={`/clients/${client.id}`} className="block text-xs text-right mt-2" style={{ color: "#6366f1", textDecoration: "none" }}>
            Ver perfil →
          </Link>
        </div>
      )}
    </div>
  );
}

type Props = { clients: Client[] };

export default function TeoDashboard({ clients }: Props) {
  const { accounts, ready } = useAllAccounts(clients.map((c) => c.id));
  const { done, toggle, weekOffset, setWeekOffset, monday, isCurrentWeek } = useWeeklyTasks("velocity-teo-tasks-v2");

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const [clientsOpen, setClientsOpen] = useState(false);

  const pendingTasks   = TEO_TASKS.filter((t) => !done[t.id]);
  const completedTasks = TEO_TASKS.filter((t) =>  done[t.id]);

  const pendingClients = ready
    ? [...clients]
        .filter((c) => accounts[c.id]?.production_status !== "publicados")
        .sort((a, b) => {
          const si = (c: Client) => PIPELINE_STAGES.indexOf(accounts[c.id]?.production_status as any);
          return si(b) - si(a);
        })
    : [];

  const doneClients = ready
    ? clients.filter((c) => accounts[c.id]?.production_status === "publicados")
    : [];

  const WeekNav = () => (
    <div className="flex items-center gap-2">
      <button onClick={() => setWeekOffset((v) => v - 1)} className="px-2 py-1 rounded-lg text-xs" style={{ background: "transparent", border: "1px solid #2e3349", color: "#8b90a7", cursor: "pointer" }}>← Anterior</button>
      {!isCurrentWeek && <button onClick={() => setWeekOffset(0)} className="px-2 py-1 rounded-lg text-xs" style={{ background: "#6366f120", border: "1px solid #6366f140", color: "#818cf8", cursor: "pointer" }}>Hoy</button>}
      <button onClick={() => setWeekOffset((v) => v + 1)} className="px-2 py-1 rounded-lg text-xs" style={{ background: "transparent", border: "1px solid #2e3349", color: "#8b90a7", cursor: "pointer" }}>Siguiente →</button>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold capitalize" style={{ color: "#e8eaf0" }}>{today}</h1>
        <p className="text-sm mt-1" style={{ color: "#8b90a7" }}>Velocity Performance · Vista de edición</p>
      </div>

      {/* DOS COLUMNAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

        {/* ── IZQUIERDA: pendientes ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Tareas pendientes */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
            <div className="px-5 pt-5 pb-4" style={{ background: "#222638", borderBottom: pendingTasks.length > 0 ? "1px solid #2e3349" : "none" }}>
              <div className="flex items-start justify-between mb-1">
                <div className="text-xl font-bold" style={{ color: "#e8eaf0" }}>{getWeekLabel(monday)}</div>
                <WeekNav />
              </div>
              <div className="text-xs" style={{ color: "#8b90a7" }}>
                {isCurrentWeek ? "Semana actual" : "Semana anterior"} · {pendingTasks.length} pendiente{pendingTasks.length !== 1 ? "s" : ""} · {completedTasks.length} completada{completedTasks.length !== 1 ? "s" : ""}
              </div>
            </div>
            {pendingTasks.length === 0 ? (
              <div className="px-5 py-6 text-sm text-center" style={{ color: "#8b90a740" }}>Sin tareas pendientes 🎉</div>
            ) : (
              <div className="flex flex-col">
                {pendingTasks.map((task, i) => (
                  <div key={task.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02]" style={{ borderTop: i > 0 ? "1px solid #2e334940" : "none" }}>
                    <button onClick={() => toggle(task.id)} className="w-4 h-4 rounded-full border-2 flex-shrink-0" style={{ borderColor: "#2e3349", background: "transparent", cursor: "pointer" }} />
                    <span className="text-sm" style={{ color: "#e8eaf0" }}>{task.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Clientes pendientes */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
            <button
              onClick={() => setClientsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-5 text-left"
              style={{ background: "#1a1d27", border: "none", cursor: "pointer", borderBottom: clientsOpen && pendingClients.length > 0 ? "1px solid #2e3349" : "none" }}
            >
              <div>
                <div className="font-semibold mb-1" style={{ fontSize: 13, color: "#8b90a7", letterSpacing: "0.06em", textTransform: "uppercase" }}>Clientes pendientes</div>
                <div className="flex items-baseline gap-1" style={{ lineHeight: 1 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: "#818cf8", lineHeight: 1 }}>{pendingClients.length}</span>
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#8b90a7" }}>/ {clients.length}</span>
                </div>
              </div>
              <span style={{ color: "#8b90a7", fontSize: 20, transform: clientsOpen ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</span>
            </button>
            {clientsOpen && (
              pendingClients.length === 0 ? (
                <div className="px-5 py-6 text-sm text-center" style={{ color: "#8b90a740" }}>Todos publicados 🎉</div>
              ) : (
                pendingClients.map((c, i) => <ClientRow key={c.id} client={c} borderTop={i > 0} />)
              )
            )}
          </div>

        </div>

        {/* ── DERECHA: terminados ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Tareas completadas */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: "#22c55e08", borderBottom: completedTasks.length > 0 ? "1px solid #22c55e20" : "none" }}>
              <span className="text-lg">✅</span>
              <div>
                <div className="font-semibold text-sm" style={{ color: "#22c55e" }}>Completadas</div>
                <div className="text-xs mt-0.5" style={{ color: "#22c55e60" }}>{completedTasks.length} tarea{completedTasks.length !== 1 ? "s" : ""}</div>
              </div>
            </div>
            {completedTasks.length === 0 ? (
              <div className="px-5 py-6 text-sm text-center" style={{ color: "#8b90a740" }}>Ninguna aún</div>
            ) : (
              <div className="flex flex-col">
                {completedTasks.map((task, i) => (
                  <div key={task.id} className="flex items-center justify-between px-5 py-3" style={{ borderTop: i > 0 ? "1px solid #2e334930" : "none" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span style={{ color: "#22c55e", fontSize: 11, flexShrink: 0 }}>✓</span>
                      <span className="text-xs truncate" style={{ color: "#8b90a7", textDecoration: "line-through" }}>{task.label}</span>
                    </div>
                    <button onClick={() => toggle(task.id)} className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2" style={{ color: "#8b90a7", background: "transparent", border: "1px solid #2e3349", cursor: "pointer" }}>deshacer</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seguimiento mensual */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ background: "#22c55e08", borderBottom: doneClients.length > 0 ? "1px solid #22c55e20" : "none" }}>
              <div>
                <div className="font-semibold mb-1" style={{ fontSize: 13, color: "#22c55e80", letterSpacing: "0.06em", textTransform: "uppercase" }}>Seguimiento mensual</div>
                <div className="flex items-baseline gap-1" style={{ lineHeight: 1 }}>
                  <span style={{ fontSize: 52, fontWeight: 800, color: "#22c55e", lineHeight: 1 }}>{doneClients.length}</span>
                  <span style={{ fontSize: 28, fontWeight: 600, color: "#22c55e50" }}>/ {clients.length}</span>
                </div>
              </div>
            </div>
            {doneClients.length === 0 ? (
              <div className="px-5 py-6 text-sm text-center" style={{ color: "#8b90a740" }}>Ninguno aún</div>
            ) : (
              doneClients.map((c, i) => <ClientRow key={c.id} client={c} borderTop={i > 0} />)
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
