

# Create admin@edroots.com Admin Account

## Summary
Add `admin@edroots.com` with password `Admin@12345` and admin role to the create-admin edge function, then invoke it.

## Changes

### `supabase/functions/create-admin/index.ts`
- Add `{ email: "admin@edroots.com", password: "Admin@12345", role: "admin" }` to the users array (line 13)

### After deploy
- Invoke the edge function to create the account

### Memory
- Update `mem://reference/test-accounts` with the new credential

## Files
- **Modify**: `supabase/functions/create-admin/index.ts`
- **Update**: `.lovable/memory/reference/test-accounts.md`

