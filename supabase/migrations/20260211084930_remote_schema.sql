drop extension if exists "pg_net";

drop extension if exists "pgjwt";

create or replace view "public"."view_todos" as  SELECT t.id AS todo_id,
    t.created_at,
    t.updated_at,
    t.account_id,
    t.type,
    t."position",
    COALESCE(ts.title, b.title) AS title,
    ts.status,
    ts.memo,
    ts.due_date,
    ts.due_date_all_day,
    b.bg_color,
    b.text_color
   FROM ((public.todos t
     LEFT JOIN public.tasks ts ON ((ts.todo_id = t.id)))
     LEFT JOIN public.todo_bars b ON ((b.todo_id = t.id)));



