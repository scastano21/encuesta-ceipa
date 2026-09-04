import {
  listarPendientes,
  marcarSincronizadas,
  contarEncuestas,
} from "./db";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import type { EncuestaLocal } from "./types";

export type SyncResult = {
  ok: boolean;
  synced: number;
  pending: number;
  total: number;
  message: string;
};

function toSupabasePayload(encuesta: EncuestaLocal) {
  return {
    id: encuesta.id,
    creado_en: encuesta.creado_en,
    encuestador: encuesta.encuestador,
    punto_aplicacion: encuesta.punto_aplicacion,
    fecha_encuesta: encuesta.fecha_encuesta,
    edad_rango: encuesta.edad_rango,
    genero: encuesta.genero,
    residencia: encuesta.residencia,
    residencia_otro: encuesta.residencia_otro,
    colegio: encuesta.colegio,
    barrio_sector: encuesta.barrio_sector,
    estrato: encuesta.estrato,
    menciones_espontaneas: encuesta.menciones_espontaneas,
    conoce_ceipa: encuesta.conoce_ceipa,
    donde_escucho: encuesta.donde_escucho,
    donde_escucho_otro: encuesta.donde_escucho_otro,
    definicion_una_palabra: encuesta.definicion_una_palabra,
    participo_activacion: encuesta.participo_activacion,
    genero_interes: encuesta.genero_interes,
    comentario_final: encuesta.comentario_final,
    no_aplica: encuesta.no_aplica,
    sincronizado: true,
  };
}

function isDuplicateError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("duplicate") ||
    m.includes("unique") ||
    m.includes("already exists")
  );
}

export async function sincronizarPendientes(): Promise<SyncResult> {
  const counts = await contarEncuestas();

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      ok: false,
      synced: 0,
      pending: counts.pendientes,
      total: counts.total,
      message: "Sin conexión. Las encuestas quedan guardadas localmente.",
    };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      synced: 0,
      pending: counts.pendientes,
      total: counts.total,
      message:
        "Faltan las variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      ok: false,
      synced: 0,
      pending: counts.pendientes,
      total: counts.total,
      message: "No se pudo inicializar el cliente de Supabase.",
    };
  }

  const pendientes = await listarPendientes();
  if (pendientes.length === 0) {
    return {
      ok: true,
      synced: 0,
      pending: 0,
      total: counts.total,
      message: "No hay encuestas pendientes por sincronizar.",
    };
  }

  const syncedIds: string[] = [];
  let lastError: string | null = null;

  try {
    // INSERT (no upsert): el upsert exige SELECT/UPDATE y rompe con RLS de solo-insert.
    for (const encuesta of pendientes) {
      const { error } = await supabase
        .from("encuestas_ceipa")
        .insert(toSupabasePayload(encuesta));

      if (!error || isDuplicateError(error.message)) {
        syncedIds.push(encuesta.id);
        continue;
      }

      lastError = error.message;
      break;
    }

    if (syncedIds.length > 0) {
      await marcarSincronizadas(syncedIds);
    }

    const after = await contarEncuestas();

    if (syncedIds.length === pendientes.length) {
      return {
        ok: true,
        synced: syncedIds.length,
        pending: after.pendientes,
        total: after.total,
        message: `Se sincronizaron ${syncedIds.length} encuesta(s) con Supabase.`,
      };
    }

    if (syncedIds.length > 0 && lastError) {
      return {
        ok: false,
        synced: syncedIds.length,
        pending: after.pendientes,
        total: after.total,
        message: `Se sincronizaron ${syncedIds.length}, pero quedaron pendientes: ${lastError}`,
      };
    }

    return {
      ok: false,
      synced: 0,
      pending: after.pendientes,
      total: after.total,
      message: `Error al sincronizar: ${lastError ?? "desconocido"}`,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error de red desconocido";
    return {
      ok: false,
      synced: syncedIds.length,
      pending: counts.pendientes,
      total: counts.total,
      message: `Falló la sincronización (datos locales intactos): ${msg}`,
    };
  }
}
