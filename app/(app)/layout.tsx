import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import UserMenu from "@/components/UserMenu";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <header
          className="flex items-center justify-between px-8 py-4 flex-shrink-0"
          style={{ borderBottom: "1px solid #2e3349", background: "#0f1117" }}
        >
          <SearchBar />
          <div className="flex items-center gap-3 ml-6">
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
