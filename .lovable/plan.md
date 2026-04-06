

# Replace WhatsApp Direct Link with Copy-to-Clipboard

## Summary
Replace the `shareViaWhatsApp` function (which opens `wa.me`) with a `copyForWhatsApp` function that copies the formatted message to the clipboard. Show a toast confirmation so the counselor can then paste it into any WhatsApp chat.

## Changes

### `src/lib/share-utils.ts`
- Replace `shareViaWhatsApp` with `copyForWhatsApp` that uses `navigator.clipboard.writeText()` and returns a promise
- Keep the `buildShareMessage` formatting (with `*bold*` markers) as-is since it's WhatsApp-friendly

### `src/pages/Students.tsx`
- Import `copyForWhatsApp` instead of `shareViaWhatsApp`
- On click: copy to clipboard, show toast "Copied to clipboard — paste in WhatsApp"
- Change button icon to `Copy` (from lucide) instead of `MessageCircle`

### `src/pages/Shortlisted.tsx`
- Same update: swap to `copyForWhatsApp`, show toast on success

### Files modified
- `src/lib/share-utils.ts`
- `src/pages/Students.tsx`
- `src/pages/Shortlisted.tsx`

