-- Enable Row Level Security (RLS) on all tables
-- RLS prevents unauthorized direct access via Supabase's REST API.
-- All server-side access uses the service_role key, which bypasses RLS by design.

alter table "public"."accounts" enable row level security;

alter table "public"."memos" enable row level security;

alter table "public"."tasks" enable row level security;

alter table "public"."memo_settings" enable row level security;

alter table "public"."events" enable row level security;

alter table "public"."todos" enable row level security;

alter table "public"."todo_bars" enable row level security;
