"use client";
import { useSession } from "next-auth/react";

export type Role = "admin" | "editor";

export function useRole(): { role: Role; name: string; loading: boolean } {
  const { data: session, status } = useSession();
  return {
    role: ((session?.user as any)?.role ?? "editor") as Role,
    name: session?.user?.name ?? "",
    loading: status === "loading",
  };
}
