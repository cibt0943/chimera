-- Add Row Level Security policies for per-user data access.
-- These policies restrict authenticated users to only their own data,
-- using auth.uid() which returns the `sub` claim from the JWT.
-- The server sets sub = accounts.id (UUID) when creating per-user Supabase clients.

-- accounts: users can only access their own account row
create policy "accounts_user_policy" on "public"."accounts"
  for all
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- memos: users can only access memos belonging to their account
create policy "memos_user_policy" on "public"."memos"
  for all
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

-- tasks: users can only access tasks belonging to their account
create policy "tasks_user_policy" on "public"."tasks"
  for all
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

-- memo_settings: users can only access memo settings belonging to their account
create policy "memo_settings_user_policy" on "public"."memo_settings"
  for all
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

-- events: users can only access events belonging to their account
create policy "events_user_policy" on "public"."events"
  for all
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

-- todos: users can only access todos belonging to their account
create policy "todos_user_policy" on "public"."todos"
  for all
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);

-- todo_bars: users can only access todo_bars belonging to their account
create policy "todo_bars_user_policy" on "public"."todo_bars"
  for all
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);
