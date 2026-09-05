# aspect-ratio

2026-08-24, migrated from Radix UI to a native element at the stable public path.

## Changed

- `app/components/ui/aspect-ratio.tsx`: replaced the Radix primitive with a native `div` using CSS `aspect-ratio`.
- Preserved the `ratio` prop, children, native div props, and forwarded ref.
- No local consumers currently use the wrapper directly.

## Left alone

- Components without a direct Base UI equivalent remain on Radix until their behavior and API can be migrated safely.

## Behavior changes

- None identified. Modern browsers support the CSS `aspect-ratio` property used by the replacement.

## Verify by hand

- Render ratios such as `16 / 9` and `1` and confirm the element maintains the expected dimensions as its width changes.
