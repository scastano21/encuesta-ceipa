export type EdadRango =
  | "16-24 años"
  | "25-39 años"
  | "40-50 años"
  | "Menor de 16 / mayor de 50"
  | "";

export type Genero = "Femenino" | "Masculino" | "Prefiero no decir" | "";

export type Residencia =
  | "Vive en Medellín"
  | "Vive en otro municipio, está de visita"
  | "Vive en otro municipio, pero trabaja o estudia en Medellín"
  | "Otro"
  | "";

export type DondeEscuchoOpcion =
  | "Corredor Juvenil"
  | "CAM (Centro administrativo municipal)"
  | "Dependencias de la alcaldía"
  | "Casa de la cultura"
  | "Ciclovía"
  | "Indesa Sur"
  | "En un colegio / institución educativa"
  | "Redes sociales"
  | "Voz a voz (familiares, amigos, conocidos)"
  | "Publicidad (valla, prensa, radio, otro)"
  | "Estudió allí o conoce a alguien que estudió allí"
  | "No recuerda dónde"
  | "Otro";

export type ParticipoActivacion = "Sí" | "No" | "No recuerda" | "";

export type GeneroInteres =
  | "Sí, bastante interés"
  | "Un poco de interés"
  | "No generó interés"
  | "";

export type Estrato =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "No sabe / No aplica"
  | "";

export interface EncuestaFormData {
  encuestador: string;
  punto_aplicacion: string;
  fecha_encuesta: string;
  edad_rango: EdadRango;
  genero: Genero;
  residencia: Residencia;
  residencia_otro: string;
  colegio: string;
  barrio_sector: string;
  estrato: Estrato;
  menciones_espontaneas: [string, string, string];
  conoce_ceipa: boolean | null;
  donde_escucho: DondeEscuchoOpcion[];
  donde_escucho_otro: string;
  definicion_una_palabra: string;
  participo_activacion: ParticipoActivacion;
  genero_interes: GeneroInteres;
  comentario_final: string;
  no_aplica: boolean;
}

export interface EncuestaLocal {
  id: string;
  creado_en: string;
  encuestador: string | null;
  punto_aplicacion: string | null;
  fecha_encuesta: string | null;
  edad_rango: string | null;
  genero: string | null;
  residencia: string | null;
  residencia_otro: string | null;
  colegio: string | null;
  barrio_sector: string | null;
  estrato: string | null;
  menciones_espontaneas: string[] | null;
  conoce_ceipa: boolean | null;
  donde_escucho: string[] | null;
  donde_escucho_otro: string | null;
  definicion_una_palabra: string | null;
  participo_activacion: string | null;
  genero_interes: string | null;
  comentario_final: string | null;
  no_aplica: boolean;
  sincronizado: boolean;
}

export type EncuestaSupabaseInsert = Omit<EncuestaLocal, "sincronizado"> & {
  sincronizado?: boolean;
};

export const EDAD_OPCIONES: EdadRango[] = [
  "16-24 años",
  "25-39 años",
  "40-50 años",
  "Menor de 16 / mayor de 50",
];

export const GENERO_OPCIONES: Genero[] = [
  "Femenino",
  "Masculino",
  "Prefiero no decir",
];

export const RESIDENCIA_OPCIONES: Residencia[] = [
  "Vive en Medellín",
  "Vive en otro municipio, está de visita",
  "Vive en otro municipio, pero trabaja o estudia en Medellín",
  "Otro",
];

export const DONDE_ESCUCHO_OPCIONES: DondeEscuchoOpcion[] = [
  "Corredor Juvenil",
  "CAM (Centro administrativo municipal)",
  "Dependencias de la alcaldía",
  "Casa de la cultura",
  "Ciclovía",
  "Indesa Sur",
  "En un colegio / institución educativa",
  "Redes sociales",
  "Voz a voz (familiares, amigos, conocidos)",
  "Publicidad (valla, prensa, radio, otro)",
  "Estudió allí o conoce a alguien que estudió allí",
  "No recuerda dónde",
  "Otro",
];

export const PARTICIPO_OPCIONES: ParticipoActivacion[] = [
  "Sí",
  "No",
  "No recuerda",
];

export const INTERES_OPCIONES: GeneroInteres[] = [
  "Sí, bastante interés",
  "Un poco de interés",
  "No generó interés",
];

export const ESTRATO_OPCIONES: Estrato[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "No sabe / No aplica",
];

export function createEmptyForm(): EncuestaFormData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    encuestador: "",
    punto_aplicacion: "",
    fecha_encuesta: today,
    edad_rango: "",
    genero: "",
    residencia: "",
    residencia_otro: "",
    colegio: "",
    barrio_sector: "",
    estrato: "",
    menciones_espontaneas: ["", "", ""],
    conoce_ceipa: null,
    donde_escucho: [],
    donde_escucho_otro: "",
    definicion_una_palabra: "",
    participo_activacion: "",
    genero_interes: "",
    comentario_final: "",
    no_aplica: false,
  };
}
