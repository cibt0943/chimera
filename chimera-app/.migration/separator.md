# separator

2026-08-21, golden pair via CLI, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/separator.tsx`: replaced the Radix root with the callable `@base-ui/react/separator` primitive.
- Removed the Radix-only `decorative` prop. No consumer passed this prop explicitly.
- Existing consumers in UI wrappers, editor toolbars, navigation, account settings, and todo filters continue to use the same `orientation` and `className` API.
- `grep -n "radix-ui\|@radix-ui" app/components/ui/separator.tsx` is clean.

## Left alone

- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- Base UI has no `decorative` prop. The former default `decorative={true}` hid separators from assistive technology; Base UI separators are accessible to screen readers. This is intentionally not suppressed because no local consumer established a different accessibility contract.

## Verify by hand

- Open the account, todo, and memo views and confirm horizontal and vertical dividers retain their expected layout.
- Navigate the editor toolbar with a screen reader and confirm separators do not obscure nearby control names.
