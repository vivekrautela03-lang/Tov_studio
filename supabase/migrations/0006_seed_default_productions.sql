-- 0006_seed_default_productions.sql
-- Seed the three default film production campaigns in public.productions

insert into public.productions (id, title, status, budget) values
  ('d3b07384-d113-4ec6-a558-7e289bf449f1', 'The Midnight Code', 'Production', 2500000),
  ('44b6c33c-35cd-43ff-90a6-c956b7cdb10d', 'Echoes of Silence', 'Post-Production', 1800000),
  ('5c84a861-26be-45a2-9ad6-2ea8fb60a5ad', 'Veloce', 'Pre-Production', 4200000)
on conflict (id) do nothing;
