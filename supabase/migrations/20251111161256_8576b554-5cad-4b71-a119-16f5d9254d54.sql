-- Modify students table columns to support decimal scores
ALTER TABLE public.students 
  ALTER COLUMN english_language TYPE NUMERIC USING english_language::NUMERIC,
  ALTER COLUMN mathematics TYPE NUMERIC USING mathematics::NUMERIC,
  ALTER COLUMN natural_science TYPE NUMERIC USING natural_science::NUMERIC,
  ALTER COLUMN history TYPE NUMERIC USING history::NUMERIC,
  ALTER COLUMN computing TYPE NUMERIC USING computing::NUMERIC,
  ALTER COLUMN rme TYPE NUMERIC USING rme::NUMERIC,
  ALTER COLUMN creative_arts TYPE NUMERIC USING creative_arts::NUMERIC,
  ALTER COLUMN owop TYPE NUMERIC USING owop::NUMERIC,
  ALTER COLUMN ghanaian_language TYPE NUMERIC USING ghanaian_language::NUMERIC,
  ALTER COLUMN french TYPE NUMERIC USING french::NUMERIC,
  ALTER COLUMN total_raw_score TYPE NUMERIC USING total_raw_score::NUMERIC;