import * as XLSX from "xlsx";
import { listarEncuestas } from "./db";

export async function exportarRespaldoExcel(): Promise<void> {
  const encuestas = await listarEncuestas();

  const rows = encuestas.map((e) => ({
    id: e.id,
    creado_en: e.creado_en,
    encuestador: e.encuestador ?? "",
    punto_aplicacion: e.punto_aplicacion ?? "",
    fecha_encuesta: e.fecha_encuesta ?? "",
    edad_rango: e.edad_rango ?? "",
    genero: e.genero ?? "",
    residencia: e.residencia ?? "",
    residencia_otro: e.residencia_otro ?? "",
    colegio: e.colegio ?? "",
    barrio_sector: e.barrio_sector ?? "",
    estrato: e.estrato ?? "",
    mencion_1: e.menciones_espontaneas?.[0] ?? "",
    mencion_2: e.menciones_espontaneas?.[1] ?? "",
    mencion_3: e.menciones_espontaneas?.[2] ?? "",
    conoce_ceipa:
      e.conoce_ceipa === null || e.conoce_ceipa === undefined
        ? ""
        : e.conoce_ceipa
          ? "Sí"
          : "No",
    donde_escucho: (e.donde_escucho ?? []).join("; "),
    donde_escucho_otro: e.donde_escucho_otro ?? "",
    definicion_una_palabra: e.definicion_una_palabra ?? "",
    participo_activacion: e.participo_activacion ?? "",
    genero_interes: e.genero_interes ?? "",
    comentario_final: e.comentario_final ?? "",
    no_aplica: e.no_aplica ? "Sí" : "No",
    sincronizado: e.sincronizado ? "Sí" : "No",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Encuestas");

  const fecha = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `respaldo-encuestas-ceipa-${fecha}.xlsx`);
}
