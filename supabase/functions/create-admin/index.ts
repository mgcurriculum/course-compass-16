import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const users = [
    { email: "admin@sacdms.com", password: "Admin@12345", role: "admin" },
    { email: "counselor@sacdms.com", password: "Counselor@123", role: "counselor" },
    { email: "jaseel2022@gmail.com", password: "Admin@12345", role: "admin" },
  ];

  const results: Record<string, string | null> = {};

  for (const u of users) {
    let userId: string | null = null;

    // Try to create user
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
    });

    if (data?.user) {
      userId = data.user.id;
    } else if (error) {
      // User already exists — find and update password
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existing = listData?.users?.find((x: any) => x.email === u.email);
      if (existing) {
        userId = existing.id;
      } else {
        results[u.email] = `error: could not find existing user - ${error.message}`;
        continue;
      }
    }

    if (userId) {
      // Always update password and confirm email
      const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: u.password,
        email_confirm: true,
      });
      if (updateErr) {
        results[u.email] = `update error: ${updateErr.message}`;
      }
    }

    if (userId) {
      await supabaseAdmin.from("user_roles").upsert(
        { user_id: userId, role: u.role },
        { onConflict: "user_id,role" }
      );
    }
    results[u.email] = userId;
  }

  return new Response(JSON.stringify({ success: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
