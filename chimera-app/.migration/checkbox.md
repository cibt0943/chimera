# checkbox

2026-08-21, golden pair via CLI, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/checkbox.tsx`: replaced the Radix primitive with `@base-ui/react/checkbox` and preserved the existing Lucide check icon.
- `app/components/lib/conform/checkbox.tsx`: narrowed `handleCheckedChange` from `boolean | "indeterminate"` to Base UI's boolean checked value.
- Existing consumers in the todo filter and event form already provide boolean checked values and retain their public API.
- `grep -n "radix-ui\|@radix-ui" app/components/ui/checkbox.tsx` is clean.

## Left alone

- Checkbox-group behavior and indeterminate state are not used by current consumers.
- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None identified. Base UI represents indeterminate as a separate `indeterminate` prop; no local consumer used Radix's string checked state.

## Verify by hand

- Toggle todo filter options and confirm filtering updates immediately.
- Edit an event's all-day checkbox and confirm the date-time fields update as before.
- Submit a Conform form with checked and unchecked values to confirm hidden input serialization.
