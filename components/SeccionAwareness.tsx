"use client";

import type { DondeEscuchoOpcion, EncuestaFormData } from "@/lib/types";
import { DONDE_ESCUCHO_OPCIONES } from "@/lib/types";
import { CheckboxGroup } from "./CheckboxGroup";
import { RadioGroup } from "./RadioGroup";

type Props = {
  data: EncuestaFormData;
  onChange: (patch: Partial<EncuestaFormData>) => void;
  errors: Record<string, string>;
};

export function SeccionAwareness({ data, onChange, errors }: Props) {
  const conoceSi = data.conoce_ceipa === true;

  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ceipa-600">
          Sección II
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Conocimiento de marca (awareness)
        </h2>
      </header>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-slate-800">
          P6. Sin pensarlo mucho, ¿qué instituciones de educación superior
          conoce, ya sea en Medellín o en general?
          <span className="text-red-600"> *</span>
        </legend>
        <p className="text-xs text-slate-500">
          Hasta 3 menciones en orden. Solo la primera es obligatoria.
        </p>
        {([0, 1, 2] as const).map((i) => (
          <label key={i} className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              Mención {i + 1}
              {i === 0 && <span className="text-red-600"> *</span>}
            </span>
            <input
              type="text"
              value={data.menciones_espontaneas[i]}
              onChange={(e) => {
                const next = [...data.menciones_espontaneas] as [
                  string,
                  string,
                  string,
                ];
                next[i] = e.target.value;
                onChange({ menciones_espontaneas: next });
              }}
              className="field-input"
              placeholder={`Institución ${i + 1}`}
            />
          </label>
        ))}
        {errors.menciones_espontaneas && (
          <p className="text-xs text-red-600">{errors.menciones_espontaneas}</p>
        )}
      </fieldset>

      <RadioGroup
        name="conoce_ceipa"
        label="P7. ¿Ha escuchado hablar de CEIPA?"
        options={["Sí", "No"]}
        value={
          data.conoce_ceipa === true
            ? "Sí"
            : data.conoce_ceipa === false
              ? "No"
              : ""
        }
        onChange={(v) =>
          onChange({
            conoce_ceipa: v === "Sí",
            ...(v === "No"
              ? {
                  donde_escucho: [],
                  donde_escucho_otro: "",
                  definicion_una_palabra: "",
                }
              : {}),
          })
        }
        error={errors.conoce_ceipa}
        required
      />

      {conoceSi && (
        <>
          <CheckboxGroup
            label="P8. ¿Dónde ha escuchado hablar de CEIPA o visto algo relacionado con esta institución?"
            options={DONDE_ESCUCHO_OPCIONES}
            values={data.donde_escucho}
            onChange={(values) =>
              onChange({
                donde_escucho: values as DondeEscuchoOpcion[],
                donde_escucho_otro: values.includes("Otro")
                  ? data.donde_escucho_otro
                  : "",
              })
            }
            error={errors.donde_escucho || errors.donde_escucho_otro}
            required
            showOtherField
            otherValue={data.donde_escucho_otro}
            onOtherChange={(v) => onChange({ donde_escucho_otro: v })}
          />

          <label className="block text-sm">
            <span className="mb-1 block font-medium text-slate-700">
              P9. Para usted, en una sola palabra, ¿qué es CEIPA?
            </span>
            <input
              type="text"
              value={data.definicion_una_palabra}
              onChange={(e) =>
                onChange({ definicion_una_palabra: e.target.value })
              }
              className="field-input"
              placeholder="Una sola palabra..."
              maxLength={80}
            />
          </label>
        </>
      )}
    </section>
  );
}
