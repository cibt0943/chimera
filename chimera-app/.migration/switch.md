# switch

2026-08-21, golden pair via CLI, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/switch.tsx`: replaced the Radix primitive with `@base-ui/react/switch` and the official `base-nova` wrapper shape.
- `app/components/memo/memo-settings-form.tsx`: retained the stable Switch import after validating both memo settings controls with the Base UI wrapper.
- `grep -n "radix-ui\|@radix-ui" app/components/ui/switch.tsx` is clean.

## Left alone

- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None. The existing single-argument `onCheckedChange` handlers remain compatible with Base UI's additional event-details argument.

## Verify by hand

- Open memo settings and toggle "show archived". Confirm the memo list updates after the request completes.
- Toggle auto-save, reload the page, and confirm the persisted setting is restored.
- Tab to both switches and toggle them with Space to confirm keyboard interaction and focus styling.
