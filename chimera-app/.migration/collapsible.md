# collapsible

2026-08-24, migrated from Radix UI to Base UI at the safe wrapper boundary.

## Changed

- `app/components/ui/collapsible.tsx`: replaced the Radix `Collapsible` wrapper with `@base-ui/react/collapsible`.
- `Trigger` stays as the trigger element and `Panel` replaces the old `CollapsibleContent` layer while preserving the same `data-slot` attribute naming.
- The public wrapper API still exports `Collapsible`, `CollapsibleTrigger`, and `CollapsibleContent` to keep consumer code stable.

## Left alone

- The rest of the Radix-heavy wrappers remain unchanged until they are selected as the next safe migration target.

## Behavior changes

- None identified. The same open/close semantics and styling hooks are preserved.

## Verify by hand

- Expand and collapse the panel and confirm the animation and `aria-expanded` state still update correctly.
- Ensure keyboard focus behavior remains consistent when using the trigger button.
