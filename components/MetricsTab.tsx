"use client";
import { useState, useMemo } from "react";
import { ClientMetrics, Ad, AdSet } from "@/lib/data";
import { useClientAccount } from "@/lib/useClientStore";

// ── Helpers ────────────────────────────────────────────────────────────────

function actionColor(a: string) {
  if (a.startsWith("GANADOR") || a.startsWith("MANTENER")) return "#22c55e";
  if (a.startsWith("PAUSAR"))  return "#ef4444";
  if (a.startsWith("INTERESANTE") || a.startsWith("SEGUNDO")) return "#818cf8";
  return "#eab308";
}

function isActive(ad: Ad): boolean {
  return ad.delivery === "active";
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function resultLabel(resultType: string): string {
  if (resultType === "messages" || resultType === "message") return "mensajes";
  if (resultType === "link_click") return "clics";
  if (resultType === "lead") return "leads";
  return "resultados";
}

// Dado un renewal_date y un ad_set period_start, determina a qué ciclo pertenece.
// Retorna la clave del ciclo: "2026-04-15" (fecha de inicio del ciclo)
function getCycleKey(periodStart: string, renewalDay: number): string {
  const d = new Date(periodStart + "T12:00:00");
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  // Si el día del mes es >= renewalDay, el ciclo empieza este mes en renewalDay
  // Si es < renewalDay, el ciclo empieza el mes anterior en renewalDay
  if (day >= renewalDay) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(renewalDay).padStart(2, "0")}`;
  } else {
    const prevDate = new Date(year, month - 1, renewalDay);
    return prevDate.toISOString().slice(0, 10);
  }
}

function cycleLabel(cycleStart: string): string {
  const start = new Date(cycleStart + "T12:00:00");
  const end   = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(end.getDate() - 1);
  const fmt = (d: Date) => d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
  return `${fmt(start)} – ${fmt(end)}`;
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
}

// ── Ad card (expandible) ──────────────────────────────────────────────────

function AdCard({ ad }: { ad: Ad }) {
  const [open, setOpen] = useState(false);
  const acColor = actionColor(ad.action);
  const isGood  = ad.action.startsWith("GANADOR") || ad.action.startsWith("MANTENER");
  const isBad   = ad.action.startsWith("PAUSAR");

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${isGood ? "#22c55e30" : isBad ? "#ef444430" : "#2e3349"}`, background: "#1a1d27" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/[0.02]"
        style={{ background: "transparent", border: "none", cursor: "pointer" }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-bold flex-shrink-0" style={{ color: "#818cf8", minWidth: 28 }}>#{ad.ad_number}</span>
          <span className="text-sm truncate" style={{ color: "#e8eaf0" }}>{ad.guion}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span className="text-xs" style={{ color: "#8b90a7" }}>
            ${ad.spend.toFixed(0)} · {ad.ctr ? `${ad.ctr.toFixed(1)}% CTR` : "—"}
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ color: acColor, background: acColor + "18" }}>
            {ad.action.split(" ")[0]}
          </span>
          <span style={{ color: "#8b90a7", fontSize: 13, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</span>
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid #2e334960" }}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: "Gasto",           value: `$${ad.spend.toFixed(2)}`,               hi: undefined },
              { label: "Resultados",      value: `${ad.results?.toLocaleString("es-AR") ?? "—"}`, hi: undefined },
              { label: "Costo/resultado", value: ad.cpr ? `$${ad.cpr.toFixed(3)}` : "—", hi: ad.cpr ? (ad.cpr < 0.5 ? "good" : ad.cpr > 1.5 ? "bad" : undefined) : undefined },
              { label: "CTR",             value: ad.ctr ? `${ad.ctr.toFixed(2)}%` : "—", hi: ad.ctr ? (ad.ctr > 2.5 ? "good" : ad.ctr < 1 ? "bad" : undefined) : undefined },
              { label: "CPM",             value: ad.cpm ? `$${ad.cpm.toFixed(2)}` : "—", hi: undefined },
              { label: "Frecuencia",      value: ad.frequency ? ad.frequency.toFixed(2) : "—", hi: ad.frequency ? (ad.frequency > 3 ? "bad" : undefined) : undefined },
              { label: "Retención 25%",   value: ad.video_25_pct ? `${ad.video_25_pct.toFixed(1)}%` : "—", hi: ad.video_25_pct ? (ad.video_25_pct < 20 ? "warn" : "good") : undefined },
              { label: "Drop-off",        value: ad.drop_off_pct ? `${ad.drop_off_pct.toFixed(1)}%` : "—", hi: ad.drop_off_pct ? (ad.drop_off_pct > 70 ? "bad" : undefined) : undefined },
              { label: "Impresiones",     value: ad.impressions ? ad.impressions.toLocaleString("es-AR") : "—", hi: undefined },
            ].map((s) => {
              const color = s.hi === "good" ? "#22c55e" : s.hi === "bad" ? "#ef4444" : s.hi === "warn" ? "#eab308" : "#e8eaf0";
              const bg    = s.hi === "good" ? "#22c55e12" : s.hi === "bad" ? "#ef444412" : s.hi === "warn" ? "#eab30812" : "#222638";
              return (
                <div key={s.label} className="rounded-lg px-3 py-2" style={{ background: bg }}>
                  <div className="text-xs mb-0.5" style={{ color: "#8b90a7" }}>{s.label}</div>
                  <div className="text-sm font-semibold" style={{ color }}>{s.value}</div>
                </div>
              );
            })}
          </div>
          <div className="rounded-lg px-3 py-2" style={{ background: acColor + "10", border: `1px solid ${acColor}30` }}>
            <div className="text-xs mb-0.5" style={{ color: "#8b90a7" }}>Recomendación</div>
            <div className="text-sm font-medium" style={{ color: acColor }}>{ad.action}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Ad set section (expandible) ───────────────────────────────────────────

function AdSetSection({ adSet, isActiveView }: { adSet: AdSet; isActiveView: boolean }) {
  const [open, setOpen] = useState(false);
  // En vista activa: solo ads activos. En comparativo: todos.
  const displayAds = isActiveView ? adSet.ads.filter(isActive) : adSet.ads;
  if (displayAds.length === 0) return null;

  const totalSpend   = displayAds.reduce((s, a) => s + a.spend, 0);
  const totalResults = displayAds.reduce((s, a) => s + (a.results ?? 0), 0);
  const avgCPR       = totalResults > 0 ? totalSpend / totalResults : null;
  const rType        = displayAds[0]?.result_type ?? "";
  const winners      = displayAds.filter((a) => a.action.startsWith("GANADOR")).length;
  const topause      = displayAds.filter((a) => a.action.startsWith("PAUSAR")).length;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2e3349" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/[0.02]"
        style={{ background: "#222638", border: "none", cursor: "pointer" }}
      >
        <div>
          <div className="font-semibold text-sm" style={{ color: "#e8eaf0" }}>{adSet.name}</div>
          <div className="text-xs mt-0.5" style={{ color: "#8b90a7" }}>
            {formatDate(adSet.period_start)} → {formatDate(adSet.period_end)} · {displayAds.length} anuncio{displayAds.length !== 1 ? "s" : ""}{isActiveView ? " activo" + (displayAds.length !== 1 ? "s" : "") : ""}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold" style={{ color: "#e8eaf0" }}>${totalSpend.toFixed(0)}</div>
            {avgCPR !== null && (
              <div className="text-xs" style={{ color: "#8b90a7" }}>
                ${avgCPR.toFixed(3)}/{resultLabel(rType)}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-0.5">
            {winners > 0 && <span className="text-xs" style={{ color: "#22c55e" }}>✓ {winners} ganador{winners > 1 ? "es" : ""}</span>}
            {topause > 0 && <span className="text-xs" style={{ color: "#ef4444" }}>✕ {topause} a pausar</span>}
          </div>
          <span style={{ color: "#8b90a7", fontSize: 14, transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>›</span>
        </div>
      </button>

      {open && (
        <div className="flex flex-col gap-2 p-4" style={{ borderTop: "1px solid #2e3349" }}>
          {displayAds
            .sort((a, b) => {
              const score = (ad: Ad) => ad.action.startsWith("GANADOR") ? 3 : ad.action.startsWith("MANTENER") ? 2 : ad.action.startsWith("INTERESANTE") ? 1 : 0;
              return score(b) - score(a);
            })
            .map((ad, i) => <AdCard key={i} ad={ad} />)}
        </div>
      )}
    </div>
  );
}

// ── MetricsTab principal ──────────────────────────────────────────────────

type Props = { metrics: ClientMetrics | null; clientId: string; defaultRenewalDay?: number | null };

export default function MetricsTab({ metrics, clientId, defaultRenewalDay }: Props) {
  const { data: account, ready } = useClientAccount(clientId);
  // "active" = todos los activos ahora | key de período = comparativo histórico
  const [selectedPeriod, setSelectedPeriod] = useState<string>("active");

  const renewalDate = account.renewal_date;
  const renewalDay  = renewalDate
    ? new Date(renewalDate + "T12:00:00").getDate()
    : (defaultRenewalDay ?? null);
  const useCycles   = !!renewalDay && ready;

  // Períodos históricos para comparar
  const periods = useMemo(() => {
    if (!metrics) return [];
    if (useCycles && renewalDay) {
      const keys = new Set(metrics.ad_sets.map((s) => getCycleKey(s.period_start, renewalDay)));
      return Array.from(keys).sort().reverse();
    }
    const keys = new Set(metrics.ad_sets.map((s) => monthKey(s.period_start)));
    return Array.from(keys).sort().reverse();
  }, [metrics, useCycles, renewalDay]);

  const getPeriodLabel = (key: string) => useCycles ? cycleLabel(key) : monthLabel(key);

  if (!metrics) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
        <div className="text-4xl mb-3">📭</div>
        <div className="font-semibold" style={{ color: "#e8eaf0" }}>Sin datos publicitarios</div>
        <div className="text-sm mt-2" style={{ color: "#8b90a7" }}>
          Cargá el export de Meta Ads a nivel anuncio para ver métricas.
        </div>
      </div>
    );
  }

  const isActiveView = selectedPeriod === "active";

  // Detectar si el período seleccionado es el actual (para filtrar solo activos en él)
  const today = new Date();
  const currentCycleKey = renewalDay
    ? getCycleKey(today.toISOString().slice(0, 10), renewalDay)
    : null;
  const currentMonthKey = monthKey(today.toISOString().slice(0, 10));
  const isCurrentPeriod = useCycles
    ? selectedPeriod === currentCycleKey
    : selectedPeriod === currentMonthKey;

  // Vista "Activos ahora": todos los ads activos de todos los conjuntos
  // Mes actual: solo ads activos. Mes pasado: todos los ads del período.
  const visibleAdSets = isActiveView
    ? metrics.ad_sets.filter((s) => s.ads.some(isActive))
    : useCycles && renewalDay
      ? metrics.ad_sets.filter((s) => getCycleKey(s.period_start, renewalDay) === selectedPeriod)
      : metrics.ad_sets.filter((s) => monthKey(s.period_start) === selectedPeriod);

  const periodIsCurrentOrActive = isActiveView || isCurrentPeriod;

  // KPIs: mes actual/activos → solo activos. Mes pasado → todos.
  const kpiAds = periodIsCurrentOrActive
    ? visibleAdSets.flatMap((s) => s.ads).filter(isActive)
    : visibleAdSets.flatMap((s) => s.ads);

  const totalSpend   = kpiAds.reduce((s, a) => s + a.spend, 0);
  const totalResults = kpiAds.reduce((s, a) => s + (a.results ?? 0), 0);
  const avgCPR       = totalResults > 0 ? totalSpend / totalResults : null;
  const rType        = kpiAds[0]?.result_type ?? "";
  const lastDate     = visibleAdSets.length
    ? visibleAdSets.map((s) => s.period_end).sort().reverse()[0]
    : null;

  return (
    <div className="flex flex-col gap-5">

      {/* Alertas */}
      {metrics.pending.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: "#eab30810", border: "1px solid #eab30830" }}>
          <div className="text-sm font-semibold mb-1" style={{ color: "#eab308" }}>⚠️ Información pendiente</div>
          {metrics.pending.map((p, i) => (
            <div key={i} className="text-sm" style={{ color: "#8b90a7" }}>· {p}</div>
          ))}
        </div>
      )}

      {/* Selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold uppercase tracking-widest flex-shrink-0" style={{ color: "#8b90a7" }}>Ver</span>
        <div className="flex gap-2 flex-wrap">
          {/* Activos ahora — siempre primero */}
          <button
            onClick={() => setSelectedPeriod("active")}
            className="text-xs px-3 py-1.5 rounded-full transition-all"
            style={{
              background: isActiveView ? "#22c55e20" : "#222638",
              color: isActiveView ? "#22c55e" : "#8b90a7",
              border: `1px solid ${isActiveView ? "#22c55e60" : "#2e3349"}`,
              cursor: "pointer", fontWeight: isActiveView ? 600 : 400,
            }}
          >🟢 Activos ahora</button>

          {/* Separador visual */}
          <span style={{ color: "#2e3349", alignSelf: "center" }}>|</span>
          <span className="text-xs" style={{ color: "#8b90a740", alignSelf: "center" }}>Comparar:</span>

          {/* Meses históricos */}
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedPeriod(p)}
              className="text-xs px-3 py-1.5 rounded-full transition-all capitalize"
              style={{
                background: selectedPeriod === p ? "#6366f120" : "#222638",
                color: selectedPeriod === p ? "#818cf8" : "#8b90a7",
                border: `1px solid ${selectedPeriod === p ? "#6366f160" : "#2e3349"}`,
                cursor: "pointer", fontWeight: selectedPeriod === p ? 600 : 400,
              }}
            >{getPeriodLabel(p)}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl p-4" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
          <div className="text-xs mb-1" style={{ color: "#8b90a7" }}>Gasto total</div>
          <div className="text-2xl font-bold" style={{ color: "#e8eaf0" }}>${totalSpend.toFixed(0)}</div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
          <div className="text-xs mb-1" style={{ color: "#8b90a7" }}>
            {resultLabel(rType).charAt(0).toUpperCase() + resultLabel(rType).slice(1)} totales
          </div>
          <div className="text-2xl font-bold" style={{ color: "#e8eaf0" }}>
            {totalResults > 0 ? totalResults.toLocaleString("es-AR") : "—"}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
          <div className="text-xs mb-1" style={{ color: "#8b90a7" }}>Costo por {resultLabel(rType)}</div>
          <div className="text-2xl font-bold" style={{ color: avgCPR && avgCPR < 1 ? "#22c55e" : "#e8eaf0" }}>
            {avgCPR ? `$${avgCPR.toFixed(3)}` : "—"}
          </div>
        </div>

        <div className="rounded-xl p-4" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
          <div className="text-xs mb-1" style={{ color: "#8b90a7" }}>Datos hasta</div>
          <div className="text-xl font-bold" style={{ color: "#e8eaf0" }}>
            {lastDate ? formatDate(lastDate) : "—"}
          </div>
        </div>
      </div>

      {/* Conjuntos de anuncios */}
      {visibleAdSets.length === 0 ? (
        <div className="rounded-xl p-6 text-center" style={{ background: "#1a1d27", border: "1px solid #2e3349" }}>
          <div className="text-sm" style={{ color: "#8b90a740" }}>Sin datos para este período</div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleAdSets.map((adSet) => (
            <AdSetSection key={adSet.id} adSet={adSet} isActiveView={periodIsCurrentOrActive} />
          ))}
        </div>
      )}

    </div>
  );
}
