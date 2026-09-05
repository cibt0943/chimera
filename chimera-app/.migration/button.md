# button

2026-08-21, golden pair via CLI, Base UI wrapper added and the first direct consumer migrated.

## Changed

- `app/components/ui/button-base.tsx`: added the `base-nova` Button wrapper from the shadcn registry. It uses `@base-ui/react/button` and its `render` prop instead of Radix `Slot` and `asChild`.
- Switched direct Button imports to `button-base` in `account/account-delete-button.tsx`, `account/account-general-form.tsx`, `account/account-password-tab.tsx`, `event/event-delete-button.tsx`, `event/event-form.tsx`, `memo/memo-*.tsx`, `todo/*.tsx`, `lib/date-time-picker/index.tsx`, and `routes/auth/login.tsx`.
- `grep -n "radix-ui\|@radix-ui" app/components/ui/button-base.tsx` is clean. The original `button.tsx` remains on Radix until every consumer has moved.

## Left alone

- `app/components/ui/button.tsx`: retained for consumers that have not yet migrated.
- The remaining Button consumers are Radix UI wrappers. Consumers using `asChild` must be converted to Base UI's `render` prop as part of each wrapper's own migration.
- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None for the migrated consumer. It renders a native button and does not use `asChild`.

## Verify by hand

- Open account settings and activate the delete button.
- Confirm the deletion dialog opens, keyboard focus moves into it, and the button is disabled while a deletion is pending if that state is triggered.
