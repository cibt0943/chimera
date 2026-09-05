# progress

2026-08-24, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/progress.tsx`: replaced the Radix progress primitive with `@base-ui/react/progress`.
- Preserved the existing optional `value` behavior by passing `null` to Base UI when it is omitted.
- No local consumers currently use the wrapper directly.

## Left alone

- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None identified. Base UI renders the same progress root and indicator structure used by this wrapper.

## Verify by hand

- Render a determinate progress bar and confirm the indicator reflects its value.
- Render an omitted-value progress bar and confirm it remains indeterminate.
