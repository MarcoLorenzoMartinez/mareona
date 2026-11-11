-- Telemetry and Traffic Infrastructure (Cookieless, GDPR-compliant)
-- Records aggregated anonymous page visits without IP addresses or persistent tracking cookies.

CREATE TABLE IF NOT EXISTS public.site_visits (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  pathname text NOT NULL,
  device_type text NOT NULL,
  is_pwa boolean DEFAULT false NOT NULL,
  session_id text,
  duration_seconds integer DEFAULT 0 NOT NULL,
  country text DEFAULT 'ES' NOT NULL,
  province text DEFAULT 'Asturias' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- B-Tree indexes for fast aggregation queries in the admin dashboard
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_pathname ON public.site_visits (pathname);
CREATE INDEX IF NOT EXISTS idx_site_visits_province ON public.site_visits (province);
CREATE INDEX IF NOT EXISTS idx_site_visits_country ON public.site_visits (country);
CREATE INDEX IF NOT EXISTS idx_site_visits_device ON public.site_visits (device_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- 1. Anonymous and authenticated clients can insert telemetry pings
CREATE POLICY "site_visits_insert_policy"
  ON public.site_visits
  FOR INSERT
  WITH CHECK (true);

-- 2. Strictly staff with 'admin' role can read aggregated visits
CREATE POLICY "site_visits_admin_select_policy"
  ON public.site_visits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
