"use client";
import { useState, useEffect } from "react";
import { Task } from "@/lib/data";

const priorityConfig = {
  alta:  { label: "Alta",  color: "#ef4444", bg: "#ef444418" },
  media: { label: "Media", color: "#eab308", bg: "#eab30818" },
  baja:  { label: "Baja",  color: "#22c55e", bg: "#22c55e18" },
};

const statusConfig = {
  "pendiente":    { label: "Pendiente",    color: "#8b90a7", bg: "#8b90a718" },
  "en-progreso":  { label: "En progreso",  color: "#818cf8", bg: "#818cf818" },
  "completada":   { label: "Completada",   color: "#22c55e", bg: "#22c55e18" },
};

type Props = { tasks: Task[]; showClient?: boolean };

export default function TaskList({ tasks, showClient = false }: Props) {
  const [statuses, setStatuses] = useState<Record<string, Task["status"]>>({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("task-statuses") ?? "{}");
      setStatuses(saved);
    } catch {}
  }, []);

  const setTaskStatus = (id: string, status: Task["status"]) => {
    const next = { ...statuses, [id]: status };
    setStatuses(next);
    localStorage.setItem("task-statuses", JSON.stringify(next));
  };

  const sorted = [...tasks].sort((a, b) => {
    const pOrder = { alta: 0, media: 1, baja: 2 };
    if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
    return a.due_date.localeCompare(b.due_date);
  });

  if (!sorted.length) return (
    <div className="rounded-xl p-8 text-center" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
      <div className="text-3xl mb-2">✅</div>
      <div className="text-sm" style={{ color: "#8b90a7" }}>Sin tareas pendientes</div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((task) => {
        const currentStatus = statuses[task.id] ?? task.status;
        const pcfg = priorityConfig[task.priority];
        const scfg = statusConfig[currentStatus];
        const isCompleted = currentStatus === "completada";

        return (
          <div
            key={task.id}
            className="rounded-xl p-4 flex items-start gap-4"
            style={{
              background: "#1a1d27",
              border: "1px solid #2e3349",
              opacity: isCompleted ? 0.5 : 1,
            }}
          >
            {/* Checkbox */}
            <button
              onClick={() => setTaskStatus(task.id, isCompleted ? "pendiente" : "completada")}
              className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all"
              style={{
                borderColor: isCompleted ? "#22c55e" : "#2e3349",
                background: isCompleted ? "#22c55e" : "transparent",
                cursor: "pointer",
              }}
            >
              {isCompleted && <span style={{ color: "#0f1117", fontSize: 11 }}>✓</span>}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium" style={{ color: isCompleted ? "#8b90a7" : "#e8eaf0", textDecoration: isCompleted ? "line-through" : "none" }}>
                  {task.title}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ color: pcfg.color, background: pcfg.bg }}>
                    {pcfg.label}
                  </span>
                </div>
              </div>

              <p className="text-xs mt-1 leading-relaxed" style={{ color: "#8b90a7" }}>{task.description}</p>

              <div className="flex items-center gap-4 mt-2">
                <span className="text-xs" style={{ color: "#8b90a7" }}>📅 {task.due_date}</span>
                <span className="text-xs" style={{ color: "#8b90a7" }}>👤 {task.assignee}</span>
                {showClient && (
                  <span className="text-xs" style={{ color: "#818cf8" }}>{task.client_id}</span>
                )}
                {/* Status toggle */}
                <button
                  onClick={() => {
                    const cycle: Task["status"][] = ["pendiente", "en-progreso", "completada"];
                    const idx = cycle.indexOf(currentStatus);
                    setTaskStatus(task.id, cycle[(idx + 1) % cycle.length]);
                  }}
                  className="text-xs px-2 py-0.5 rounded-full transition-colors ml-auto"
                  style={{ color: scfg.color, background: scfg.bg, border: "none", cursor: "pointer" }}
                >
                  {scfg.label}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
