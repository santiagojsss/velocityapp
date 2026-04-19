"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { ProductionStatus } from "@/lib/constants";

export type { ProductionStatus };

export type ProductionChecklist = {
  guiones: boolean;
  grabacion_fecha: string;
  grabacion_realizada: boolean;
  edicion: boolean;
  lanzamiento: boolean;
  seguimiento: boolean;
};

export type ClientAccount = {
  renewal_date: string;
  production_status: ProductionStatus;
  recording_date: string;
  last_contact_date: string;
  next_contact_date: string;
  account_notes: string;
  production_checklist: ProductionChecklist;
};

export function deriveStatus(cl: ProductionChecklist): ProductionStatus {
  if (cl.lanzamiento) return "publicados";
  if (cl.edicion) return "listo-para-lanzar";
  if (cl.grabacion_realizada) return "en-edicion";
  if (cl.grabacion_fecha) return "grabacion-programada";
  if (cl.guiones) return "guiones-listos";
  return "guiones-en-proceso";
}

const defaultChecklist: ProductionChecklist = {
  guiones: false,
  grabacion_fecha: "",
  grabacion_realizada: false,
  edicion: false,
  lanzamiento: false,
  seguimiento: false,
};

const defaults: ClientAccount = {
  renewal_date: "",
  production_status: "",
  recording_date: "",
  last_contact_date: "",
  next_contact_date: "",
  account_notes: "",
  production_checklist: defaultChecklist,
};

function rowToAccount(row: Record<string, unknown>): ClientAccount {
  const checklist: ProductionChecklist = {
    guiones:             !!(row.guiones),
    grabacion_fecha:     (row.grabacion_fecha as string) ?? "",
    grabacion_realizada: !!(row.grabacion_realizada),
    edicion:             !!(row.edicion),
    lanzamiento:         !!(row.lanzamiento),
    seguimiento:         !!(row.seguimiento),
  };
  return {
    renewal_date:     (row.renewal_date as string)     ?? "",
    production_status:(row.production_status as ProductionStatus) ?? "guiones-en-proceso",
    recording_date:   (row.recording_date as string)   ?? "",
    last_contact_date:(row.last_contact_date as string) ?? "",
    next_contact_date:(row.next_contact_date as string) ?? "",
    account_notes:    (row.account_notes as string)    ?? "",
    production_checklist: checklist,
  };
}

function accountToRow(clientId: string, account: ClientAccount) {
  return {
    client_id:           clientId,
    production_status:   account.production_status,
    renewal_date:        account.renewal_date,
    recording_date:      account.recording_date,
    last_contact_date:   account.last_contact_date,
    next_contact_date:   account.next_contact_date,
    account_notes:       account.account_notes,
    guiones:             account.production_checklist.guiones,
    grabacion_fecha:     account.production_checklist.grabacion_fecha,
    grabacion_realizada: account.production_checklist.grabacion_realizada,
    edicion:             account.production_checklist.edicion,
    lanzamiento:         account.production_checklist.lanzamiento,
    seguimiento:         account.production_checklist.seguimiento,
    updated_at:          new Date().toISOString(),
  };
}

export function useClientAccount(clientId: string) {
  const [data, setData] = useState<ClientAccount>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase
      .from("client_accounts")
      .select("*")
      .eq("client_id", clientId)
      .single()
      .then(({ data: row }) => {
        if (row) setData(rowToAccount(row));
        setReady(true);
      });

    const channel = supabase
      .channel(`client_account_${clientId}_${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "client_accounts", filter: `client_id=eq.${clientId}` },
        (payload) => {
          if (payload.new) setData(rowToAccount(payload.new as Record<string, unknown>));
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [clientId]);

  const save = useCallback(async (updates: Partial<ClientAccount>) => {
    setData((prev) => {
      const next = { ...prev, ...updates };
      supabase.from("client_accounts").upsert(accountToRow(clientId, next))
        .then(({ error }) => { if (error) console.error("[save]", error); });
      return next;
    });
  }, [clientId]);

  const saveChecklist = useCallback(async (updates: Partial<ProductionChecklist>) => {
    setData((prev) => {
      const nextChecklist = { ...prev.production_checklist, ...updates };
      const nextStatus = deriveStatus(nextChecklist);
      const next = { ...prev, production_checklist: nextChecklist, production_status: nextStatus };
      supabase.from("client_accounts").upsert(accountToRow(clientId, next))
        .then(({ error }) => { if (error) console.error("[saveChecklist]", error); });
      return next;
    });
  }, [clientId]);

  return { data, save, saveChecklist, ready };
}

export function useAllAccounts(clientIds: string[]) {
  const [accounts, setAccounts] = useState<Record<string, ClientAccount>>({});
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const { data: rows } = await supabase
      .from("client_accounts")
      .select("*")
      .in("client_id", clientIds);

    const result: Record<string, ClientAccount> = {};
    clientIds.forEach((id) => {
      const row = rows?.find((r: Record<string, unknown>) => r.client_id === id);
      result[id] = row ? rowToAccount(row) : { ...defaults };
    });
    setAccounts(result);
    setReady(true);
  }, []); // eslint-disable-line

  useEffect(() => {
    reload();

    const channel = supabase
      .channel(`all_client_accounts_${Date.now()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "client_accounts" },
        () => reload())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [reload]);

  return { accounts, ready };
}
