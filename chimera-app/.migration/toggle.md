# toggle

2026-08-21, golden pair via CLI, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/toggle.tsx`: replaced the Radix root with the callable `@base-ui/react/toggle` primitive and its official `base-nova` prop type.
- Existing consumers in the Lexical editor toolbars and date-time picker retain `pressed`, `defaultPressed`, and single-argument `onPressedChange` handlers.
- `app/components/ui/toggle-group.tsx`: continues to consume only `toggleVariants`; its Radix primitive migration remains separate.
- `grep -n "radix-ui\|@radix-ui" app/components/ui/toggle.tsx` is clean.

## Left alone

- `app/components/ui/toggle-group.tsx`: intentionally remains on Radix UI until its distinct single/multiple-value model is migrated.
- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None identified. Base UI supplies event details as a second `onPressedChange` argument; the existing handlers intentionally use only the pressed boolean.

## Verify by hand

- In the memo editor, toggle bold, italic, code, quote, and list formatting using both click and keyboard focus.
- Open the floating text toolbar and confirm active formatting reflects the selected text.
- In the date-time picker, switch between all-day and timed events and confirm the associated fields update.
