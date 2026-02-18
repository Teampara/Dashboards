create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_email text,
  child_name text,
  story_json jsonb,
  visual_dna text,
  seed bigint,
  payment_id text,
  is_paid boolean default false,
  pdf_url text,
  created_at timestamptz default now()
);
