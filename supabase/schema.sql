-- Encuesta de Recordación de Marca (Awareness) — CEIPA
-- Ejecutar en el SQL Editor de Supabase

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS encuestas_ceipa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creado_en timestamptz NOT NULL DEFAULT now(),
  encuestador text,
  punto_aplicacion text,
  fecha_encuesta date,
  edad_rango text,
  genero text,
  residencia text,
  residencia_otro text,
  colegio text,
  barrio_sector text,
  estrato text,
  menciones_espontaneas jsonb,
  conoce_ceipa boolean,
  donde_escucho jsonb,
  donde_escucho_otro text,
  definicion_una_palabra text,
  participo_activacion text,
  genero_interes text,
  comentario_final text,
  no_aplica boolean NOT NULL DEFAULT false,
  sincronizado boolean NOT NULL DEFAULT true
);

-- Si la tabla ya existía sin estas columnas, agrégalas:
ALTER TABLE encuestas_ceipa ADD COLUMN IF NOT EXISTS colegio text;
ALTER TABLE encuestas_ceipa ADD COLUMN IF NOT EXISTS barrio_sector text;
ALTER TABLE encuestas_ceipa ADD COLUMN IF NOT EXISTS estrato text;

COMMENT ON TABLE encuestas_ceipa IS 'Respuestas de la encuesta de awareness CEIPA sincronizadas desde la PWA';
COMMENT ON COLUMN encuestas_ceipa.menciones_espontaneas IS 'Array con hasta 3 menciones espontáneas (P6)';
COMMENT ON COLUMN encuestas_ceipa.donde_escucho IS 'Array de canales donde escuchó de CEIPA (P8)';
COMMENT ON COLUMN encuestas_ceipa.colegio IS 'Colegio donde estudia (P4, si aplica)';
COMMENT ON COLUMN encuestas_ceipa.barrio_sector IS 'Barrio/sector del colegio (P4, si aplica)';
COMMENT ON COLUMN encuestas_ceipa.estrato IS 'Estrato socioeconómico (P5)';
COMMENT ON COLUMN encuestas_ceipa.sincronizado IS 'Siempre true en Supabase; el flag real vive en IndexedDB local';

ALTER TABLE encuestas_ceipa ENABLE ROW LEVEL SECURITY;

-- Recrear política de INSERT (idempotente)
DROP POLICY IF EXISTS "Permitir insert público" ON encuestas_ceipa;

CREATE POLICY "Permitir insert público"
  ON encuestas_ceipa
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Bloquear SELECT / UPDATE / DELETE públicos
-- (sin políticas para estas operaciones, RLS deniega por defecto)
-- La app usa INSERT (no upsert) precisamente por esta restricción.
