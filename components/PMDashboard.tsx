"use client";
import { useState } from "react";
import Link from "next/link";
import { Client } from "@/lib/data";
import { useAllAccounts, useClientAccount, ProductionChecklist } from "@/lib/useClientStore";
import { PRODUCTION_CONFIG } from "@/lib/constants";
import { useWeeklyTasks, getWeekLabel } from "@/lib/weeklyTasks";
import { useTeamTasks } from "@/lib/teamTasks";

const MEMBERS = [
  { id: "nahuel",  name: "Nahuel",   icon: "📞", color: "#f59e0b" },
  { id: "teo",     name: "Tadeo",    icon: "✂️", color: "#818cf8" },
  { id: "luciano", name: "Luciano",  icon: "🤝", color: "#34d399" },
  { id: "santi",   name: "Santiago", icon: "🎬", color: "#f472b6" },
];

const industryIcon: Record<string, string> = {
  "cuesta-azul": "👔", "warasa": "📱", "matias-manzano": "🦷",
  "iphone-monte": "📲", "celltech": "🔧", "cadena-cell": "🛠️",
  "nqn-importados": "🏪", "velocity": "⚡",
};

const PIPELINE_STAGES = [
  "guiones-en-proceso", "guiones-listos", "grabacion-programada",
  "en-edicion", "listo-para-lanzar", "publicados",
] as const;

const CHECKLIST_STEPS = [
  { key: "guiones",             label: "Guiones preparados",    icon: "📝", type: "check" as const },
  { key: "grabacion_fecha",     label: "Fecha de grabación",    icon: "📅", type: "date"  as const },
  { key: "grabacion_realizada", label: "Grabación realizada",   icon: "🎥", type: "check" as const },
  { key: "edicion",             label: "Edición terminada",     icon: "✂️", type: "check" as const },
  { key: "lanzamiento",         label: "Campañas lanzadas",     icon: "🚀", type: "check" as const },
  { key: "seguimiento",         label: "Seguimiento realizado", icon: "✅", type: "check" as const },
];

// ── Tarjeta de miembro ─────────────────────────────────────────────────────

function MemberCard({
  member,
  tasks,
  done,
  onToggle,
  onAdd,
  onRemove,
}: {
  member: typeof MEMBERS[0];
  tasks: { id: string; label: string }[];
  done: Record<string, boolean>;
  onToggle: (id: string) => void;
  onAdd: (label: string) => void;
  onRemove: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [input, setInput] = useState("");

  const pending   = tasks.filter((t) => !done[t.id]);
  const completed = tasks.filter((t) =>  done[t.id]);

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput("");
    setAdding(false);
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${member.color}30` }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ background: `${member.color}10`, borderBottom: "1px solid #2e334950" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 16 }}>{member.icon}</span>
          <span className="font-semibold text-sm" style={{ color: member.color }}>{member.name}</span>
          {pending.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: `${member.color}20`, color: member.color }}>
              {pending.length}
            </span>
          )}
        </div>
        <button
          onClick={() => { setAdding(true); setInput(""); }}
          className="w-6 h-6 rounded-full flex items-center justify-center text-sm transition-all"
          style={{ background: `${member.color}20`, color: member.color, border: "none", cursor: "pointer" }}
          title="Agregar tarea"
        >+</button>
      </div>

      {/* Input inline */}
      {adding && (
        <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderBottom: "1px solid #2e334940", background: "#1a1d27" }}>
          <input
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); if (e.key === "Escape") setAdding(false); }}
            placeholder="Nueva tarea..."
            className="flex-1 text-xs bg-transparent outline-none"
            style={{ color: "#e8eaf0", border: "none" }}
          />
          <button onClick={handleAdd} style={{ color: member.color, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>OK</button>
          <button onClick={() => setAdding(false)} style={{ color: "#8b90a7", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>✕</button>
        </div>
      )}

      {/* Tareas pendientes */}
      {pending.length === 0 && !adding ? (
        <div className="px-4 py-3 text-xs" style={{ color: "#8b90a740" }}>Sin tareas</div>
      ) : (
        pending.map((task, i) => (
          <div
            key={task.id}
            className="flex items-center gap-2 px-4 py-2.5 group hover:bg-white/[0.02]"
            style={{ borderTop: i > 0 || adding ? "1px solid #2e334930" : "none" }}
          >
            <button
              onClick={() => onToggle(task.id)}
              className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0"
              style={{ borderColor: member.color + "60", background: "transparent", cursor: "pointer" }}
            />
            <span className="text-xs flex-1" style={{ color: "#e8eaf0" }}>{task.label}</span>
            <button
              onClick={() => onRemove(task.id)}
              className="opacity-0 group-hover:opacity-100 text-xs"
              style={{ color: "#8b90a750", background: "none", border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
            >✕</button>
          </div>
        ))
      )}

      {/* Tareas completadas */}
      {completed.length > 0 && (
        <div style={{ borderTop: "1px solid #2e334930" }}>
          {completed.map((task) => (
            <div key={task.id} className="flex items-center gap-2 px-4 py-2" style={{ opacity: 0.5 }}>
              <span style={{ color: "#22c55e", fontSize: 10, flexShrink: 0 }}>✓</span>
              <span className="text-xs flex-1 truncate" style={{ color: "#8b90a7", textDecoration: "line-through" }}>{task.label}</span>
              <button onClick={() => onToggle(task.id)} style={{ color: "#8b90a740", background: "none", border: "none", cursor: "pointer", fontSize: 10 }}>↩</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Cliente expandible ─────────────────────────────────────────────────────

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
                      onClick={() => saveChecklist({ [step.key]: !isDone } as Partial<ProductionChecklist>)}
                      className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: isDone ? "#22c55e" : "#2e3349", background: isDone ? "#22c55e" : "transparent", cursor: "pointer" }}
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
            Ver perfil completo →
          </Link>
        </div>
      )}
    </div>
  );
}

// ── Dashboard PM ───────────────────────────────────────────────────────────

type Props = { clients: Client[] };

export default function PMDashboard({ clients }: Props) {
  const { accounts, ready: clientsReady } = useAllAccounts(clients.map((c) => c.id));
  const { weekOffset, setWeekOffset, monday, isCurrentWeek } = useWeeklyTasks("velocity-pm-nav");
  const { tasks, done, addTask, removeTask, toggleDone, byOwner, ready: tasksReady } = useTeamTasks(weekOffset);

  const [clientsOpen, setClientsOpen] = useState(false);

  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const pendingClients = clientsReady
    ? [...clients]
        .filter((c) => accounts[c.id]?.production_status !== "publicados")
        .sort((a, b) => {
          const si = (c: Client) => PIPELINE_STAGES.indexOf(accounts[c.id]?.production_status as any);
          return si(b) - si(a);
        })
    : [];

  const doneClients = clientsReady
    ? clients.filter((c) => accounts[c.id]?.production_status === "publicados")
    : [];

  const totalPending = tasks.filter((t) => !done[t.id]).length;
  const totalDone    = tasks.filter((t) =>  done[t.id]).length;

  const WeekNav = () => (
    <div className="flex items-center gap-2">
      <button onClick={() => setWeekOffset((v) => v - 1)} className="px-2 py-1 rounded-lg text-xs" style={{ background: "transparent", border: "1px solid #2e3349", color: "#8b90a7", cursor: "pointer" }}>← Anterior</button>
      {!isCurrentWeek && (
        <button onClick={() => setWeekOffset(0)} className="px-2 py-1 rounded-lg text-xs" style={{ background: "#6366f120", border: "1px solid #6366f140", color: "#818cf8", cursor: "pointer" }}>Hoy</button>
      )}
      <button onClick={() => setWeekOffset((v) => v + 1)} className="px-2 py-1 rounded-lg text-xs" style={{ background: "transparent", border: "1px solid #2e3349", color: "#8b90a7", cursor: "pointer" }}>Siguiente →</button>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold capitalize" style={{ color: "#e8eaf0" }}>{today}</h1>
        <p className="text-sm mt-1" style={{ color: "#8b90a7" }}>Velocity Performance · Project Manager</p>
      </div>

      {/* Dos columnas */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

        {/* ── COLUMNA IZQUIERDA ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Equipo esta semana */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
            <div className="px-5 pt-5 pb-4" style={{ background: "#222638", borderBottom: "1px solid #2e3349" }}>
              <div className="flex items-start justify-between mb-1">
                <div className="text-xl font-bold" style={{ color: "#e8eaf0" }}>{getWeekLabel(monday)}</div>
                <WeekNav />
              </div>
              <div className="text-xs" style={{ color: "#8b90a7" }}>
                {isCurrentWeek ? "Semana actual" : "Semana"} · {totalPending} pendiente{totalPending !== 1 ? "s" : ""} · {totalDone} completada{totalDone !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Grid 2x2 de miembros */}
            <div className="p-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {tasksReady && MEMBERS.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  tasks={byOwner(m.id)}
                  done={done}
                  onToggle={toggleDone}
                  onAdd={(label) => addTask(label, m.id)}
                  onRemove={removeTask}
                />
              ))}
            </div>
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
              pendingClients.length === 0
                ? <div className="px-5 py-6 text-sm text-center" style={{ color: "#8b90a740" }}>Todos publicados 🎉</div>
                : pendingClients.map((c, i) => <ClientRow key={c.id} client={c} borderTop={i > 0} />)
            )}
          </div>

        </div>

        {/* ── COLUMNA DERECHA ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Resumen del equipo */}
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
            <div className="px-5 py-4" style={{ background: "#222638", borderBottom: "1px solid #2e3349" }}>
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8b90a7" }}>Resumen equipo</div>
            </div>
            {MEMBERS.map((m, i) => {
              const mt = byOwner(m.id);
              const mp = mt.filter((t) => !done[t.id]).length;
              const mc = mt.filter((t) =>  done[t.id]).length;
              return (
                <div key={m.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i > 0 ? "1px solid #2e334940" : "none" }}>
                  <span style={{ fontSize: 14 }}>{m.icon}</span>
                  <span className="text-sm flex-1" style={{ color: "#e8eaf0" }}>{m.name}</span>
                  <div className="flex items-center gap-2 text-xs">
                    {mp > 0 && <span style={{ color: m.color }}>{mp} pend.</span>}
                    {mc > 0 && <span style={{ color: "#22c55e" }}>{mc} ✓</span>}
                    {mt.length === 0 && <span style={{ color: "#8b90a730" }}>—</span>}
                  </div>
                </div>
              );
            })}
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
            {doneClients.length === 0
              ? <div className="px-5 py-6 text-sm text-center" style={{ color: "#8b90a740" }}>Ninguno aún</div>
              : doneClients.map((c, i) => <ClientRow key={c.id} client={c} borderTop={i > 0} />)
            }
          </div>

        </div>
      </div>
    </div>
  );
}
