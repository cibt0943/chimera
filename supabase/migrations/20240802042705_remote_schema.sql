create table "public"."events" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "account_id" uuid not null,
    "title" text not null default ''::text,
    "start_datetime" timestamp with time zone not null,
    "end_datetime" timestamp with time zone,
    "all_day" boolean not null default false,
    "memo" text not null default ''::text,
    "location" text not null default ''::text
);


alter table "public"."memos" add column "related_date_all_day" boolean not null default false;

alter table "public"."tasks" add column "due_date_all_day" boolean not null default false;

CREATE UNIQUE INDEX events_pkey ON public.events USING btree (id);

alter table "public"."events" add constraint "events_pkey" PRIMARY KEY using index "events_pkey";

alter table "public"."events" add constraint "events_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."events" validate constraint "events_account_id_fkey";

alter table "public"."memo_settings" add constraint "memo_settings_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."memo_settings" validate constraint "memo_settings_account_id_fkey";

alter table "public"."memos" add constraint "memos_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."memos" validate constraint "memos_account_id_fkey";

alter table "public"."tasks" add constraint "tasks_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_account_id_fkey";

grant delete on table "public"."events" to "anon";

grant insert on table "public"."events" to "anon";

grant references on table "public"."events" to "anon";

grant select on table "public"."events" to "anon";

grant trigger on table "public"."events" to "anon";

grant truncate on table "public"."events" to "anon";

grant update on table "public"."events" to "anon";

grant delete on table "public"."events" to "authenticated";

grant insert on table "public"."events" to "authenticated";

grant references on table "public"."events" to "authenticated";

grant select on table "public"."events" to "authenticated";

grant trigger on table "public"."events" to "authenticated";

grant truncate on table "public"."events" to "authenticated";

grant update on table "public"."events" to "authenticated";

grant delete on table "public"."events" to "service_role";

grant insert on table "public"."events" to "service_role";

grant references on table "public"."events" to "service_role";

grant select on table "public"."events" to "service_role";

grant trigger on table "public"."events" to "service_role";

grant truncate on table "public"."events" to "service_role";

grant update on table "public"."events" to "service_role";


