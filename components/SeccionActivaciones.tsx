"use client";

import type { EncuestaFormData } from "@/lib/types";
import { INTERES_OPCIONES, PARTICIPO_OPCIONES } from "@/lib/types";
import { RadioGroup } from "./RadioGroup";

type Props = {
  data: EncuestaFormData;
  onChange: (patch: Partial<EncuestaFormData>) => void;
  errors: Record<string, string>;
};

export function SeccionActivaciones({ data, onChange, errors }: Props) {
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ceipa-600">
          Sección III
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Efecto de las activaciones
        </h2>
      </header>

      <RadioGroup
        name="participo_activacion"
        label="P10. ¿Ha visto o participado directamente en alguna actividad, stand o evento de CEIPA?"
        options={PARTICIPO_OPCIONES}
        value={data.participo_activacion}
        onChange={(v) =>
          onChange({
            participo_activacion: v as EncuestaFormData["participo_activacion"],
            genero_interes:
              v === "Sí" ? data.genero_interes : "",
          })
        }
        error={errors.participo_activacion}
        required
      />

      {data.participo_activacion === "Sí" && (
        <RadioGroup
          name="genero_interes"
          label="P11. ¿Esa actividad le generó interés en conocer más sobre los programas de CEIPA?"
          options={INTERES_OPCIONES}
          value={data.genero_interes}
          onChange={(v) =>
            onChange({
              genero_interes: v as EncuestaFormData["genero_interes"],
            })
          }
          error={errors.genero_interes}
          required
        />
      )}
    </section>
  );
}
