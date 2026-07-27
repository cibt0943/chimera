.PHONY: local stop reset bash

local:

	supabase start
	docker compose up -d

stop:

	docker compose down
	supabase stop

reset:

	supabase db reset

bash:

	docker compose exec app bash
