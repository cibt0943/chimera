# direction

2026-08-24, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/direction.tsx`: replaced the Radix direction provider and hook with `@base-ui/react/direction-provider`.
- Preserved the existing `direction` prop and `dir` compatibility prop, with `direction` taking precedence.
- No local consumers currently use the wrapper directly.

## Left alone

- Components without a direct Base UI equivalent remain on Radix until their behavior and API can be migrated safely.

## Behavior changes

- None identified. The provider continues to support `ltr` and `rtl` text directions.

## Verify by hand

- Render a Base UI component inside the provider with `direction="rtl"` and confirm its layout and keyboard behavior use RTL direction.
