"use client";
import { useState, useEffect } from "react";

export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getWeekKey(monday: Date): string {
  return monday.toISOString().slice(0, 10);
}

export function getWeekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("es-AR", { day: "numeric", month: "long" });
  return `${fmt(monday)} — ${fmt(sunday)}`;
}

export function useWeeklyTasks(storageKey: string) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [allData, setAllData] = useState<Record<string, Record<string, boolean>>>({});
  const [ready, setReady] = useState(false);

  const monday = getMonday(new Date());
  monday.setDate(monday.getDate() + weekOffset * 7);
  const weekKey = getWeekKey(monday);
  const isCurrentWeek = weekOffset === 0;

  useEffect(() => {
    try {
      setAllData(JSON.parse(localStorage.getItem(storageKey) ?? "{}"));
    } catch {}
    setReady(true);
  }, [storageKey]);

  const done: Record<string, boolean> = allData[weekKey] ?? {};

  const toggle = (taskId: string) => {
    setAllData((prev) => {
      const week = { ...(prev[weekKey] ?? {}), [taskId]: !prev[weekKey]?.[taskId] };
      const next = { ...prev, [weekKey]: week };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };

  return { done, toggle, weekKey, weekOffset, setWeekOffset, monday, isCurrentWeek, ready };
}
