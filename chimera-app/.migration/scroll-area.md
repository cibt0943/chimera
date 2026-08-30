# scroll-area

2026-08-21, golden pair via CLI, migrated from Radix UI to Base UI at the stable public path.

## Changed

- `app/components/ui/scroll-area.tsx`: replaced the Radix primitive with `@base-ui/react/scroll-area` and renamed `ScrollAreaScrollbar` / `ScrollAreaThumb` to Base UI's `Scrollbar` / `Thumb` parts.
- `app/components/memo/memo-list.tsx`: continues to use the stable `ScrollArea` import with only a `className`, which is compatible with the Base UI wrapper.
- `grep -n "radix-ui\|@radix-ui" app/components/ui/scroll-area.tsx` is clean.

## Left alone

- `cmdk`, `vaul`, `sonner`, `input-otp`, `react-day-picker`, and `recharts`: intentionally untouched because they are not Radix migrations.

## Behavior changes

- None identified. The consumer does not use Radix-only ScrollArea props such as `type`.

## Verify by hand

- Open the memo list and scroll with a mouse wheel and trackpad.
- Drag the vertical scrollbar thumb and confirm it remains visible and tracks the list content.
- Resize the desktop pane and confirm the list retains its internal scrolling behavior.
