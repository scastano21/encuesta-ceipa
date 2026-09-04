"use client";

import type { EncuestaFormData } from "@/lib/types";

type Props = {
  data: EncuestaFormData;
  onChange: (patch: Partial<EncuestaFormData>) => void;
};

export function SeccionCierre({ data, onChange }: Props) {
  return (
    <section className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wider text-ceipa-600">
          Sección IV
        </p>
        <h2 className="text-lg font-semibold text-slate-900">Cierre</h2>
      </header>

      <label className="block text-sm">
        <span className="mb-1 block font-medium text-slate-700">
          P12. ¿Hay algo que le gustaría que CEIPA supiera o mejorara?
          <span className="ml-1 font-normal text-slate-400">(opcional)</span>
        </span>
        <textarea
          value={data.comentario_final}
          onChange={(e) => onChange({ comentario_final: e.target.value })}
          className="field-input min-h-[120px] resize-y"
          placeholder="Comentarios, sugerencias o observaciones..."
          rows={4}
        />
      </label>
    </section>
  );
}
