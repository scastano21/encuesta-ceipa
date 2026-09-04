"use client";

import type { EncuestaFormData } from "@/lib/types";
import {
  EDAD_OPCIONES,
  ESTRATO_OPCIONES,
  GENERO_OPCIONES,
  RESIDENCIA_OPCIONES,
} from "@/lib/types";
import { RadioGroup } from "./RadioGroup";

type Props = {
  data: EncuestaFormData;
  onChange: (patch: Partial<EncuestaFormData>) => void;
  errors: Record<string, string>;
  noAplica: boolean;
};

export function SeccionPerfil({ data, onChange, errors, noAplica }: Props) {
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ceipa-600">
          Sección I
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Perfil del encuestado
        </h2>
      </header>

      <RadioGroup
        name="edad_rango"
        label="P1. ¿Me regala su edad?"
        options={EDAD_OPCIONES}
        value={data.edad_rango}
        onChange={(v) =>
          onChange({
            edad_rango: v as EncuestaFormData["edad_rango"],
            no_aplica: v === "Menor de 16 / mayor de 50",
          })
        }
        error={errors.edad_rango}
        required
      />

      {noAplica && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p className="font-semibold">Encuesta no aplica</p>
          <p className="mt-1">
            Agradecer y cerrar. Puede guardar el registro; el resto del
            formulario se oculta.
          </p>
        </div>
      )}

      {!noAplica && (
        <>
          <RadioGroup
            name="genero"
            label="P2. Género"
            options={GENERO_OPCIONES}
            value={data.genero}
            onChange={(v) =>
              onChange({ genero: v as EncuestaFormData["genero"] })
            }
            error={errors.genero}
            required
          />

          <RadioGroup
            name="residencia"
            label="P3. ¿Usted reside en Medellín o está de paso?"
            options={RESIDENCIA_OPCIONES}
            value={data.residencia}
            onChange={(v) =>
              onChange({
                residencia: v as EncuestaFormData["residencia"],
                residencia_otro:
                  v === "Otro" ? data.residencia_otro : "",
              })
            }
            error={errors.residencia}
            required
          />

          {data.residencia === "Otro" && (
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Especifique (Otro) <span className="text-red-600">*</span>
              </span>
              <input
                type="text"
                value={data.residencia_otro}
                onChange={(e) =>
                  onChange({ residencia_otro: e.target.value })
                }
                className="field-input"
                placeholder="Indique su situación..."
              />
              {errors.residencia_otro && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.residencia_otro}
                </p>
              )}
            </label>
          )}

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-slate-800">
              P4. ¿En qué colegio estudia y en qué barrio/sector está ubicado?
              <span className="ml-1 font-normal text-slate-400">
                (si aplica)
              </span>
            </legend>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Colegio
              </span>
              <input
                type="text"
                value={data.colegio}
                onChange={(e) => onChange({ colegio: e.target.value })}
                className="field-input"
                placeholder="Nombre del colegio"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Barrio/sector
              </span>
              <input
                type="text"
                value={data.barrio_sector}
                onChange={(e) => onChange({ barrio_sector: e.target.value })}
                className="field-input"
                placeholder="Barrio o sector"
              />
            </label>
          </fieldset>

          <RadioGroup
            name="estrato"
            label="P5. ¿Cuál es su estrato socioeconómico?"
            options={ESTRATO_OPCIONES}
            value={data.estrato}
            onChange={(v) =>
              onChange({ estrato: v as EncuestaFormData["estrato"] })
            }
            error={errors.estrato}
            required
          />
        </>
      )}
    </section>
  );
}
