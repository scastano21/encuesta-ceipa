-- Migración: agregar P4 (colegio/barrio) y P5 (estrato)
-- Ejecutar en SQL Editor de Supabase si la tabla ya existe

ALTER TABLE encuestas_ceipa ADD COLUMN IF NOT EXISTS colegio text;
ALTER TABLE encuestas_ceipa ADD COLUMN IF NOT EXISTS barrio_sector text;
ALTER TABLE encuestas_ceipa ADD COLUMN IF NOT EXISTS estrato text;
