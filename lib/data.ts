import clientsData from "@/data/clients.json";
import metricsData from "@/data/metrics.json";
import tasksData from "@/data/tasks.json";

export type Client = {
  id: string;
  name: string;
  industry: string;
  instagram: string | null;
  contact: string | null;
  status: string;
  target: string;
  tone: string;
  pains: string[];
  differentials: string[];
  cta_format: string | null;
  notes: string;
  last_updated: string;
  renewal_day?: number | null;
};

export type Ad = {
  ad_number: number;
  guion: string;
  spend: number;
  results: number | null;
  result_type: string;
  cpr: number | null;
  ctr: number | null;
  cpm: number | null;
  frequency: number | null;
  impressions: number | null;
  video_25_count?: number | null;
  video_95_count?: number | null;
  video_25_pct?: number | null;
  video_95_pct?: number | null;
  drop_off_pct?: number | null;
  delivery: string;
  action: string;
};

export type AdSet = {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: string;
  ads: Ad[];
};

export type ClientMetrics = {
  ad_sets: AdSet[];
  pending: string[];
};

export type Task = {
  id: string;
  client_id: string;
  title: string;
  description: string;
  priority: "alta" | "media" | "baja";
  due_date: string;
  status: "pendiente" | "en-progreso" | "completada";
  assignee: string;
};

export function getClients(): Client[] {
  return clientsData as Client[];
}

export function getClient(id: string): Client | undefined {
  return (clientsData as Client[]).find((c) => c.id === id);
}

export function getMetrics(clientId: string): ClientMetrics | null {
  const data = metricsData as Record<string, ClientMetrics>;
  return data[clientId] ?? null;
}

export function getTasks(clientId?: string): Task[] {
  const tasks = tasksData as Task[];
  if (!clientId) return tasks;
  return tasks.filter((t) => t.client_id === clientId);
}

export function getClientStatus(clientId: string): "sin-datos" | "pendiente" | "activo" | "alerta" {
  const metrics = getMetrics(clientId);
  if (!metrics) return "sin-datos";
  const allAds = metrics.ad_sets.flatMap((s) => s.ads);
  const hasAlert = allAds.some(
    (a) => a.delivery === "not_delivering" || (a.frequency ?? 0) > 3
  );
  if (hasAlert) return "alerta";
  if (metrics.pending.length > 0) return "pendiente";
  return "activo";
}

export function getTotalSpend(clientId: string): number {
  const metrics = getMetrics(clientId);
  if (!metrics) return 0;
  return metrics.ad_sets
    .flatMap((s) => s.ads)
    .reduce((sum, a) => sum + (a.spend ?? 0), 0);
}

export function getBestCTR(clientId: string): number | null {
  const metrics = getMetrics(clientId);
  if (!metrics) return null;
  const ctrs = metrics.ad_sets
    .flatMap((s) => s.ads)
    .map((a) => a.ctr)
    .filter((v): v is number => v !== null && v !== undefined);
  if (!ctrs.length) return null;
  return Math.max(...ctrs);
}

export function searchAll(query: string): { clients: Client[]; tasks: Task[] } {
  if (!query.trim()) return { clients: [], tasks: [] };
  const q = query.toLowerCase();
  const clients = (clientsData as Client[]).filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.industry.toLowerCase().includes(q) ||
      c.notes.toLowerCase().includes(q) ||
      c.pains.some((p) => p.toLowerCase().includes(q)) ||
      c.differentials.some((d) => d.toLowerCase().includes(q))
  );
  const tasks = (tasksData as Task[]).filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
  );
  return { clients, tasks };
}
