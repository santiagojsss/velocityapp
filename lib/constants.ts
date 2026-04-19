export type ProductionStatus =
  | "" | "guiones-en-proceso" | "guiones-listos"
  | "esperando-grabacion" | "grabacion-programada"
  | "en-edicion" | "listo-para-lanzar" | "publicados";

export const PRODUCTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  "":                     { label: "Sin estado",              color: "#8b90a7", bg: "#8b90a718", icon: "○"  },
  "guiones-en-proceso":   { label: "Guiones en proceso",      color: "#3b82f6", bg: "#3b82f618", icon: "📝" },
  "guiones-listos":       { label: "Guiones listos",          color: "#8b5cf6", bg: "#8b5cf618", icon: "✅" },
  "esperando-grabacion":  { label: "Esperando grabar",        color: "#eab308", bg: "#eab30818", icon: "🎥" },
  "grabacion-programada": { label: "Grabación programada",    color: "#f97316", bg: "#f9731618", icon: "📅" },
  "en-edicion":           { label: "En edición",              color: "#ec4899", bg: "#ec489918", icon: "✂️" },
  "listo-para-lanzar":    { label: "Listo para lanzar",       color: "#22d3ee", bg: "#22d3ee18", icon: "🚀" },
  "publicados":           { label: "Publicados",              color: "#22c55e", bg: "#22c55e18", icon: "🟢" },
};

export const PRODUCTION_OPTIONS = Object.entries(PRODUCTION_CONFIG).map(([value, c]) => ({ value, ...c }));
