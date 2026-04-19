import { ProductionStatus, PRODUCTION_CONFIG } from "@/lib/constants";

const config = PRODUCTION_CONFIG;

export default function ProductionBadge({ status }: { status: ProductionStatus | string }) {
  const c = config[status] ?? config[""];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: c.color, background: c.bg }}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
}
