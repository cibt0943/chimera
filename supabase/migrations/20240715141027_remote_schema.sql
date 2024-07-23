create table "public"."memo_settings" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "account_id" uuid not null,
    "list_filter" jsonb not null default '{"statuses": [0]}'::jsonb,
    "list_display" jsonb not null default '{"content": false}'::jsonb,
    "auto_save" boolean not null default true
);


CREATE UNIQUE INDEX account_memo_settings_account_id_key ON public.memo_settings USING btree (account_id);

CREATE UNIQUE INDEX account_memo_settings_pkey ON public.memo_settings USING btree (id);

alter table "public"."memo_settings" add constraint "account_memo_settings_pkey" PRIMARY KEY using index "account_memo_settings_pkey";

alter table "public"."memo_settings" add constraint "account_memo_settings_account_id_key" UNIQUE using index "account_memo_settings_account_id_key";

grant delete on table "public"."memo_settings" to "anon";

grant insert on table "public"."memo_settings" to "anon";

grant references on table "public"."memo_settings" to "anon";

grant select on table "public"."memo_settings" to "anon";

grant trigger on table "public"."memo_settings" to "anon";

grant truncate on table "public"."memo_settings" to "anon";

grant update on table "public"."memo_settings" to "anon";

grant delete on table "public"."memo_settings" to "authenticated";

grant insert on table "public"."memo_settings" to "authenticated";

grant references on table "public"."memo_settings" to "authenticated";

grant select on table "public"."memo_settings" to "authenticated";

grant trigger on table "public"."memo_settings" to "authenticated";

grant truncate on table "public"."memo_settings" to "authenticated";

grant update on table "public"."memo_settings" to "authenticated";

grant delete on table "public"."memo_settings" to "service_role";

grant insert on table "public"."memo_settings" to "service_role";

grant references on table "public"."memo_settings" to "service_role";

grant select on table "public"."memo_settings" to "service_role";

grant trigger on table "public"."memo_settings" to "service_role";

grant truncate on table "public"."memo_settings" to "service_role";

grant update on table "public"."memo_settings" to "service_role";


