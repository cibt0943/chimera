# alert-dialog

2026-08-24, migrated from Radix UI to Base UI with a compatibility wrapper for legacy `asChild` usage.

## Changed

- `app/components/ui/alert-dialog.tsx`: replaced the Radix alert-dialog wrapper with `@base-ui/react/alert-dialog`.
- `Backdrop` replaced the old `Overlay`, `Popup` replaced the old `Content`, and `Close` is used for both action and cancel buttons.
- Added a compatibility layer so existing `AlertDialogTrigger asChild` usage continues to work while keeping the public API stable.

## Left alone

- Non-dialog wrappers remain unchanged until they are selected for the next migration batch.

## Behavior changes

- None identified beyond the necessary `asChild` compatibility shim required by the Base UI API contract.

## Verify by hand

- Open and close the alert dialog and confirm that Cancel/Action buttons still trigger the expected callbacks.
- Confirm the trigger element still opens the dialog when passed as a child component.
