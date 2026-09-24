create table "public"."network_diagrams" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "account_id" uuid not null,
    "title" text not null default ''::text,
    -- Yjsドキュメント全体を Y.encodeStateAsUpdate() でエンコードし、
    -- base64文字列として保存する(PostgRESTのbytea扱いを避けるため)。
    -- これは共同編集の復元(WebSocket接続時)にのみ使う。
    "yjs_state" text not null default ''::text,
    -- 一覧表示や検索など、WebSocket接続なしに中身を参照したい場合のための
    -- 素のスナップショット。yjs_state更新のたびに同期して書き込まれる。
    "nodes" jsonb not null default '[]'::jsonb,
    "edges" jsonb not null default '[]'::jsonb
);


CREATE UNIQUE INDEX network_diagrams_pkey ON public.network_diagrams USING btree (id);

alter table "public"."network_diagrams" add constraint "network_diagrams_pkey" PRIMARY KEY using index "network_diagrams_pkey";

alter table "public"."network_diagrams" add constraint "network_diagrams_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE not valid;

alter table "public"."network_diagrams" validate constraint "network_diagrams_account_id_fkey";

grant delete on table "public"."network_diagrams" to "anon";

grant insert on table "public"."network_diagrams" to "anon";

grant references on table "public"."network_diagrams" to "anon";

grant select on table "public"."network_diagrams" to "anon";

grant trigger on table "public"."network_diagrams" to "anon";

grant truncate on table "public"."network_diagrams" to "anon";

grant update on table "public"."network_diagrams" to "anon";

grant delete on table "public"."network_diagrams" to "authenticated";

grant insert on table "public"."network_diagrams" to "authenticated";

grant references on table "public"."network_diagrams" to "authenticated";

grant select on table "public"."network_diagrams" to "authenticated";

grant trigger on table "public"."network_diagrams" to "authenticated";

grant truncate on table "public"."network_diagrams" to "authenticated";

grant update on table "public"."network_diagrams" to "authenticated";

grant delete on table "public"."network_diagrams" to "service_role";

grant insert on table "public"."network_diagrams" to "service_role";

grant references on table "public"."network_diagrams" to "service_role";

grant select on table "public"."network_diagrams" to "service_role";

grant trigger on table "public"."network_diagrams" to "service_role";

grant truncate on table "public"."network_diagrams" to "service_role";

grant update on table "public"."network_diagrams" to "service_role";

-- RLSを有効化。collabサーバーはSecret Key(service_role)経由でアクセスするため、
-- RLSは常にバイパスされる。ブラウザ/Remix側から一覧取得などを行う場合は、
-- 既存の他テーブルと同様に per-user Supabase client (authenticated) を使う想定。
alter table "public"."network_diagrams" enable row level security;

create policy "network_diagrams_user_policy" on "public"."network_diagrams"
  for all
  to authenticated
  using (auth.uid() = account_id)
  with check (auth.uid() = account_id);
