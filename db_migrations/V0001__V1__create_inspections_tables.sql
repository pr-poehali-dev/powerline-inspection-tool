CREATE TABLE t_p82993556_powerline_inspection.templates (
  id SERIAL PRIMARY KEY,
  line_name TEXT NOT NULL,
  voltage TEXT NOT NULL,
  poles JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p82993556_powerline_inspection.inspections (
  id SERIAL PRIMARY KEY,
  pole_id TEXT NOT NULL,
  pole_name TEXT NOT NULL,
  line_name TEXT NOT NULL,
  template_id INTEGER,
  datetime TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  tilt_angle TEXT NOT NULL DEFAULT '0.0',
  photo TEXT,
  defects JSONB NOT NULL DEFAULT '[]',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
