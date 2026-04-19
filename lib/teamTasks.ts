"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { getMonday, getWeekKey } from "@/lib/weeklyTasks";

export type TeamTask = {
  id: string;
  label: string;
  owner: string;
  week_key: string;
  done: boolean;
};

export function useTeamTasks(weekOffset: number) {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [ready, setReady] = useState(false);

  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  const weekKey = getWeekKey(monday);

  const reload = useCallback(async (wk: string) => {
    const { data } = await supabase
      .from("team_tasks")
      .select("*")
      .eq("week_key", wk)
      .order("created_at");
    setTasks((data as TeamTask[]) ?? []);
    setReady(true);
  }, []);

  useEffect(() => {
    reload(weekKey);

    const channel = supabase
      .channel(`team_tasks_${weekKey}_${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "team_tasks", filter: `week_key=eq.${weekKey}` },
        () => reload(weekKey))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [weekKey, reload]);

  const addTask = async (label: string, owner: string) => {
    const task: TeamTask = {
      id: `t-${Date.now()}`,
      label,
      owner,
      week_key: weekKey,
      done: false,
    };
    setTasks((prev) => [...prev, task]);
    await supabase.from("team_tasks").insert(task);
  };

  const removeTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("team_tasks").delete().eq("id", id);
  };

  const toggleDone = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextDone = !task.done;
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, done: nextDone } : t));
    await supabase.from("team_tasks").update({ done: nextDone }).eq("id", id);
  };

  const byOwner = (owner: string) => tasks.filter((t) => t.owner === owner);
  const done: Record<string, boolean> = Object.fromEntries(tasks.map((t) => [t.id, t.done]));

  return { tasks, done, addTask, removeTask, toggleDone, byOwner, ready };
}
