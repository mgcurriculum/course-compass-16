

# Create Admin Account: jaseel2022@gmail.com

## What we'll do
Update the `create-admin` edge function to also create an admin user with `jaseel2022@gmail.com` / `Admin@12345`, then invoke it.

## Technical details

### 1. Update `supabase/functions/create-admin/index.ts`
Add a third user creation block for `jaseel2022@gmail.com` with password `Admin@12345`, email auto-confirmed, and assign the `admin` role in `user_roles`.

### 2. Deploy and invoke the function
Call the edge function to create the account so you can log in immediately.

