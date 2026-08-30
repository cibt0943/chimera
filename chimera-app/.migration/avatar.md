# avatar

2026-08-24, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/avatar.tsx`: replaced the Radix avatar primitive with `@base-ui/react/avatar`.
- Preserved the current `size` prop and the existing image/fallback/group styling hooks.
- Verified the local consumer in the sidebar account menu still renders the same Avatar markup structure.

## Left alone

- Non-Base UI components and unrelated libraries remain untouched.

## Behavior changes

- None identified. Base UI's avatar root, image, and fallback match the expected composition model.

## Verify by hand

- Open the sidebar account menu and confirm avatar images load and fallback initials appear when the image is unavailable.
- Resize the sidebar and confirm avatar sizing remains consistent.
