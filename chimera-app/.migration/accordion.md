# accordion

2026-08-24, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/accordion.tsx`: replaced the Radix accordion primitive with `@base-ui/react/accordion`.
- Swapped the Radix `Content` part for Base UI `Panel` while preserving the existing wrapper markup and styling hooks.
- Kept the current trigger/header composition and icon state classes, which depend on the `group-aria-expanded` pattern.

## Left alone

- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None identified. The public wrapper still exposes the same `Accordion`, `AccordionItem`, `AccordionTrigger`, and `AccordionContent` API.

## Verify by hand

- Expand and collapse the accordion sections and confirm the content height animates and the chevrons swap correctly.
- Tab through the triggers and confirm keyboard interaction is preserved.
