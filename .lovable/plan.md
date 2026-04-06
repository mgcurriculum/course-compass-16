

# Fix: jaseel2022@gmail.com Login

## Problem
The `jaseel2022@gmail.com` account was created via Supabase's `/invite` endpoint (visible in auth logs), not via `admin.createUser` with a password. This means:
1. No password was set for the account
2. The edge function's error handling skipped the role assignment since the user "already" existed
3. Result: user exists but can't log in and has no admin role

## Solution
Update the `create-admin` edge function to handle existing users properly:

### Changes to `supabase/functions/create-admin/index.ts`
- For all three users, when `createUser` fails with "already registered":
  - Use `admin.listUsers()` or query `auth.users` to find the existing user by email
  - Use `admin.updateUserById()` to set/reset the password
  - Upsert the role into `user_roles` using the found user ID
- This ensures existing users get their password set and role assigned

### Technical detail
Replace the current pattern:
```typescript
if (adminError && !adminError.message.includes("already")) { ... }
const adminId = adminUser?.user?.id;
if (adminId) { /* upsert role */ }
```
With a pattern that falls back to looking up the user when they already exist, then updates their password and assigns the role regardless.

