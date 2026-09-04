"use client";

import { useCallback, useMemo, useState } from "react";
import { ControlHeader } from "@/components/ControlHeader";
import { ProgressBar } from "@/components/ProgressBar";
import { SeccionActivaciones } from "@/components/SeccionActivaciones";
import { SeccionAwareness } from "@/components/SeccionAwareness";
import { SeccionCierre } from "@/components/SeccionCierre";
import { SeccionPerfil } from "@/components/SeccionPerfil";
import { SyncBanner } from "@/components/SyncBanner";
import { guardarEncuestaLocal } from "@/lib/db";
import { exportarRespaldoExcel } from "@/lib/export";
import {
  createEmptyForm,
  type EncuestaFormData,
  type EncuestaLocal,
} from "@/lib/types";
import { useSyncStatus } from "@/lib/useSyncStatus";

const TOTAL_STEPS = 4;

function validateStep(
  step: number,
  data: EncuestaFormData
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.encuestador.trim()) {
    errors.encuestador = "Indique el nombre del encuestador.";
  }
  if (!data.punto_aplicacion.trim()) {
    errors.punto_aplicacion = "Indique el punto de aplicación.";
  }
  if (!data.fecha_encuesta) {
    errors.fecha_encuesta = "Seleccione la fecha.";
  }

  if (step === 0) {
    if (!data.edad_rango) {
      errors.edad_rango = "Seleccione un rango de edad.";
    }
    if (!data.no_aplica) {
      if (!data.genero) errors.genero = "Seleccione el género.";
      if (!data.residencia) errors.residencia = "Seleccione la residencia.";
      if (data.residencia === "Otro" && !data.residencia_otro.trim()) {
        errors.residencia_otro = "Especifique la opción Otro.";
      }
      if (!data.estrato) errors.estrato = "Seleccione el estrato.";
    }
  }

  if (step === 1 && !data.no_aplica) {
    if (!data.menciones_espontaneas[0].trim()) {
      errors.menciones_espontaneas = "La mención 1 es obligatoria.";
    }
    if (data.conoce_ceipa === null) {
      errors.conoce_ceipa = "Indique si ha escuchado hablar de CEIPA.";
    }
    if (data.conoce_ceipa === true) {
      if (data.donde_escucho.length === 0) {
        errors.donde_escucho = "Seleccione al menos una opción.";
      }
      if (
        data.donde_escucho.includes("Otro") &&
        !data.donde_escucho_otro.trim()
      ) {
        errors.donde_escucho_otro = "Especifique la opción Otro.";
      }
    }
  }

  if (step === 2 && !data.no_aplica) {
    if (!data.participo_activacion) {
      errors.participo_activacion = "Seleccione una opción.";
    }
    if (data.participo_activacion === "Sí" && !data.genero_interes) {
      errors.genero_interes = "Indique el nivel de interés.";
    }
  }

  return errors;
}

function buildLocalRecord(data: EncuestaFormData): EncuestaLocal {
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  if (data.no_aplica) {
    return {
      id,
      creado_en: new Date().toISOString(),
      encuestador: data.encuestador.trim(),
      punto_aplicacion: data.punto_aplicacion.trim(),
      fecha_encuesta: data.fecha_encuesta,
      edad_rango: data.edad_rango,
      genero: null,
      residencia: null,
      residencia_otro: null,
      colegio: null,
      barrio_sector: null,
      estrato: null,
      menciones_espontaneas: null,
      conoce_ceipa: null,
      donde_escucho: null,
      donde_escucho_otro: null,
      definicion_una_palabra: null,
      participo_activacion: null,
      genero_interes: null,
      comentario_final: null,
      no_aplica: true,
      sincronizado: false,
    };
  }

  const menciones = data.menciones_espontaneas
    .map((m) => m.trim())
    .filter(Boolean);

  return {
    id,
    creado_en: new Date().toISOString(),
    encuestador: data.encuestador.trim(),
    punto_aplicacion: data.punto_aplicacion.trim(),
    fecha_encuesta: data.fecha_encuesta,
    edad_rango: data.edad_rango || null,
    genero: data.genero || null,
    residencia: data.residencia || null,
    residencia_otro:
      data.residencia === "Otro" ? data.residencia_otro.trim() || null : null,
    colegio: data.colegio.trim() || null,
    barrio_sector: data.barrio_sector.trim() || null,
    estrato: data.estrato || null,
    menciones_espontaneas: menciones.length ? menciones : null,
    conoce_ceipa: data.conoce_ceipa,
    donde_escucho:
      data.conoce_ceipa === true ? data.donde_escucho : null,
    donde_escucho_otro:
      data.conoce_ceipa === true && data.donde_escucho.includes("Otro")
        ? data.donde_escucho_otro.trim() || null
        : null,
    definicion_una_palabra:
      data.conoce_ceipa === true
        ? data.definicion_una_palabra.trim() || null
        : null,
    participo_activacion: data.participo_activacion || null,
    genero_interes:
      data.participo_activacion === "Sí"
        ? data.genero_interes || null
        : null,
    comentario_final: data.comentario_final.trim() || null,
    no_aplica: false,
    sincronizado: false,
  };
}

export default function HomePage() {
  const [form, setForm] = useState<EncuestaFormData>(createEmptyForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    online,
    total,
    pendientes,
    syncing,
    lastMessage,
    setLastMessage,
    syncNow,
    refreshCounts,
  } = useSyncStatus();

  const patch = useCallback((partial: Partial<EncuestaFormData>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  };

  const noAplica = form.no_aplica;

  const canGoNext = useMemo(() => {
    if (noAplica && step === 0) return false;
    return step < TOTAL_STEPS - 1;
  }, [noAplica, step]);

  const handleNext = () => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    if (canGoNext) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSave = async () => {
    const controlErrs = validateStep(0, form);
    const stepErrs = noAplica
      ? controlErrs
      : {
          ...validateStep(0, form),
          ...validateStep(1, form),
          ...validateStep(2, form),
        };

    // For full save, also ensure control header is valid when no_aplica
    if (!noAplica) {
      const finalErrs = {
        ...stepErrs,
        ...validateStep(3, form),
      };
      setErrors(finalErrs);
      if (Object.keys(finalErrs).length > 0) {
        if (finalErrs.edad_rango || finalErrs.genero || finalErrs.residencia || finalErrs.residencia_otro || finalErrs.estrato) {
          setStep(0);
        } else if (
          finalErrs.menciones_espontaneas ||
          finalErrs.conoce_ceipa ||
          finalErrs.donde_escucho ||
          finalErrs.donde_escucho_otro
        ) {
          setStep(1);
        } else if (finalErrs.participo_activacion || finalErrs.genero_interes) {
          setStep(2);
        }
        showToast("Revise los campos obligatorios antes de guardar.");
        return;
      }
    } else {
      setErrors(controlErrs);
      if (Object.keys(controlErrs).length > 0 || !form.edad_rango) {
        showToast("Complete los datos de control y la edad antes de guardar.");
        return;
      }
    }

    setSaving(true);
    try {
      const record = buildLocalRecord(form);
      await guardarEncuestaLocal(record);
      await refreshCounts();
      showToast(
        noAplica
          ? "Registro (no aplica) guardado localmente."
          : "Encuesta guardada localmente."
      );

      if (navigator.onLine) {
        const result = await syncNow();
        if (result?.ok && result.synced > 0) {
          setLastMessage(result.message);
        }
      }

      const encuestador = form.encuestador;
      const punto = form.punto_aplicacion;
      setForm({
        ...createEmptyForm(),
        encuestador,
        punto_aplicacion: punto,
      });
      setStep(0);
      setErrors({});
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al guardar";
      showToast(`No se pudo guardar: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await exportarRespaldoExcel();
      showToast("Respaldo Excel descargado.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al exportar";
      showToast(msg);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-ceipa-50/40">
      <SyncBanner
        online={online}
        total={total}
        pendientes={pendientes}
        syncing={syncing}
        lastMessage={lastMessage}
        onSync={() => void syncNow()}
        onExport={() => void handleExport()}
      />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-28 sm:py-8">
        <header className="mb-6 space-y-2">
          <p className="text-sm font-semibold tracking-wide text-ceipa-700">
            CEIPA
          </p>
          <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
            Encuesta de Recordación de Marca (Awareness)
          </h1>
          <p className="text-sm text-slate-600">
            Funciona sin internet. Las respuestas se guardan en este dispositivo
            y se sincronizan con la nube automáticamente al recuperar conexión.
          </p>
        </header>

        <div className="mb-5">
          <ProgressBar
            current={noAplica ? 0 : step}
            total={TOTAL_STEPS}
            noAplica={noAplica}
          />
        </div>

        <div className="mb-5">
          <ControlHeader data={form} onChange={patch} errors={errors} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          {(step === 0 || noAplica) && (
            <SeccionPerfil
              data={form}
              onChange={patch}
              errors={errors}
              noAplica={noAplica}
            />
          )}
          {step === 1 && !noAplica && (
            <SeccionAwareness data={form} onChange={patch} errors={errors} />
          )}
          {step === 2 && !noAplica && (
            <SeccionActivaciones
              data={form}
              onChange={patch}
              errors={errors}
            />
          )}
          {step === 3 && !noAplica && (
            <SeccionCierre data={form} onChange={patch} />
          )}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0 || noAplica}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          <div className="flex flex-wrap gap-2">
            {noAplica ? (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar (no aplica)"}
              </button>
            ) : step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-ceipa-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceipa-700"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="rounded-xl bg-ceipa-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ceipa-700 disabled:opacity-60"
              >
                {saving ? "Guardando…" : "Guardar encuesta"}
              </button>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-50 max-w-sm -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
