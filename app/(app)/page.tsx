import { auth } from "@/auth";
import { getClients } from "@/lib/data";
import DashboardClient from "@/components/DashboardClient";
import TeoDashboard from "@/components/TeoDashboard";
import PMDashboard from "@/components/PMDashboard";

export default async function Dashboard() {
  const session = await auth();
  const clients = getClients();
  const role = (session?.user as any)?.role ?? "editor";

  if (role === "pm") {
    return <PMDashboard clients={clients} />;
  }

  if (role === "editor") {
    return <TeoDashboard clients={clients} />;
  }

  return <DashboardClient clients={clients} />;
}
