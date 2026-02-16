create table "public"."todo_bars" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "account_id" uuid not null,
    "todo_id" uuid not null,
    "title" text not null,
    "bg_color" text not null default ''::text,
    "text_color" text not null default ''::text
);


create table "public"."todos" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp without time zone not null default now(),
    "account_id" uuid not null,
    "type" integer not null default 1,
    "position" bigint not null default '1'::bigint
);

-- todo_idカラムをtasksテーブルに追加（まだnull許可）
alter table public.tasks add column todo_id uuid;
-- end --

-- tasks to todos --
insert into public.todos (id, account_id, type, position, created_at, updated_at)
select gen_random_uuid(), account_id, 1, position, created_at, updated_at
from public.tasks;
-- end --

-- set todo_id for tasks --
update public.tasks
set todo_id = t.id
from public.todos t
where public.tasks.account_id = t.account_id
 and public.tasks.position = t.position
 and public.tasks.todo_id is null;
-- end --

-- tasksテーブルに追加したtodo_idカラムをNOT NULLに変更
alter table public.tasks alter column todo_id set not null;
-- end --

-- tasksテーブルのpositionカラムを削除
alter table "public"."tasks" drop column "position";
-- end --

CREATE UNIQUE INDEX tasks_todo_id_key ON public.tasks USING btree (todo_id);

CREATE UNIQUE INDEX todo_bars_pkey ON public.todo_bars USING btree (id);

CREATE UNIQUE INDEX todo_bars_todo_id_key ON public.todo_bars USING btree (todo_id);

CREATE UNIQUE INDEX todos_pkey ON public.todos USING btree (id);

alter table "public"."todo_bars" add constraint "todo_bars_pkey" PRIMARY KEY using index "todo_bars_pkey";

alter table "public"."todos" add constraint "todos_pkey" PRIMARY KEY using index "todos_pkey";

alter table "public"."tasks" add constraint "tasks_todo_id_fkey" FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_todo_id_fkey";

alter table "public"."tasks" add constraint "tasks_todo_id_key" UNIQUE using index "tasks_todo_id_key";

alter table "public"."todo_bars" add constraint "todo_bars_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."todo_bars" validate constraint "todo_bars_account_id_fkey";

alter table "public"."todo_bars" add constraint "todo_bars_todo_id_fkey" FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE not valid;

alter table "public"."todo_bars" validate constraint "todo_bars_todo_id_fkey";

alter table "public"."todo_bars" add constraint "todo_bars_todo_id_key" UNIQUE using index "todo_bars_todo_id_key";

alter table "public"."todos" add constraint "todos_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."todos" validate constraint "todos_account_id_fkey";

grant delete on table "public"."todo_bars" to "anon";

grant insert on table "public"."todo_bars" to "anon";

grant references on table "public"."todo_bars" to "anon";

grant select on table "public"."todo_bars" to "anon";

grant trigger on table "public"."todo_bars" to "anon";

grant truncate on table "public"."todo_bars" to "anon";

grant update on table "public"."todo_bars" to "anon";

grant delete on table "public"."todo_bars" to "authenticated";

grant insert on table "public"."todo_bars" to "authenticated";

grant references on table "public"."todo_bars" to "authenticated";

grant select on table "public"."todo_bars" to "authenticated";

grant trigger on table "public"."todo_bars" to "authenticated";

grant truncate on table "public"."todo_bars" to "authenticated";

grant update on table "public"."todo_bars" to "authenticated";

grant delete on table "public"."todo_bars" to "service_role";

grant insert on table "public"."todo_bars" to "service_role";

grant references on table "public"."todo_bars" to "service_role";

grant select on table "public"."todo_bars" to "service_role";

grant trigger on table "public"."todo_bars" to "service_role";

grant truncate on table "public"."todo_bars" to "service_role";

grant update on table "public"."todo_bars" to "service_role";

grant delete on table "public"."todos" to "anon";

grant insert on table "public"."todos" to "anon";

grant references on table "public"."todos" to "anon";

grant select on table "public"."todos" to "anon";

grant trigger on table "public"."todos" to "anon";

grant truncate on table "public"."todos" to "anon";

grant update on table "public"."todos" to "anon";

grant delete on table "public"."todos" to "authenticated";

grant insert on table "public"."todos" to "authenticated";

grant references on table "public"."todos" to "authenticated";

grant select on table "public"."todos" to "authenticated";

grant trigger on table "public"."todos" to "authenticated";

grant truncate on table "public"."todos" to "authenticated";

grant update on table "public"."todos" to "authenticated";

grant delete on table "public"."todos" to "service_role";

grant insert on table "public"."todos" to "service_role";

grant references on table "public"."todos" to "service_role";

grant select on table "public"."todos" to "service_role";

grant trigger on table "public"."todos" to "service_role";

grant truncate on table "public"."todos" to "service_role";

grant update on table "public"."todos" to "service_role";


