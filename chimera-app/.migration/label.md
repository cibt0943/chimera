# label

2026-08-21, golden pair via CLI, migrated from Radix UI to a native label element at the stable public path.

## Changed

- `app/components/ui/label.tsx`: replaced the Radix Label primitive with a native `<label>` using the official `base-nova` wrapper shape.
- `app/components/ui/form.tsx`: changed `FormLabel` props from the Radix Label type to `React.ComponentProps<"label">` and replaced the FormControl Slot with a local composition helper.
- Existing consumers in Field, Form, and memo settings retain their `htmlFor` behavior.
- `grep -n "radix-ui\|@radix-ui" app/components/ui/label.tsx` is clean.

## Left alone

- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None identified. Native `<label>` preserves the same associated-control behavior used by current consumers.

## Verify by hand

- Click labels in memo settings, event forms, and React Hook Form fields to confirm their controls receive focus or toggle.
- Navigate labels and associated controls with a keyboard and screen reader to confirm names remain available.
