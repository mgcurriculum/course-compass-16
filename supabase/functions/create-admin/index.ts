import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Create admin user
  const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.createUser({
    email: "admin@sacdms.com",
    password: "Admin@12345",
    email_confirm: true,
  });

  if (adminError && !adminError.message.includes("already")) {
    return new Response(JSON.stringify({ error: adminError.message }), { status: 400 });
  }

  const adminId = adminUser?.user?.id;
  if (adminId) {
    await supabaseAdmin.from("user_roles").upsert({ user_id: adminId, role: "admin" });
  }

  // Create counselor user
  const { data: counselorUser, error: counselorError } = await supabaseAdmin.auth.admin.createUser({
    email: "counselor@sacdms.com",
    password: "Counselor@123",
    email_confirm: true,
  });

  if (counselorError && !counselorError.message.includes("already")) {
    return new Response(JSON.stringify({ error: counselorError.message }), { status: 400 });
  }

  const counselorId = counselorUser?.user?.id;
  if (counselorId) {
    await supabaseAdmin.from("user_roles").upsert({ user_id: counselorId, role: "counselor" });
  }

  // Create jaseel admin user
  const { data: jaseelUser, error: jaseelError } = await supabaseAdmin.auth.admin.createUser({
    email: "jaseel2022@gmail.com",
    password: "Admin@12345",
    email_confirm: true,
  });

  if (jaseelError && !jaseelError.message.includes("already")) {
    return new Response(JSON.stringify({ error: jaseelError.message }), { status: 400 });
  }

  const jaseelId = jaseelUser?.user?.id;
  if (jaseelId) {
    await supabaseAdmin.from("user_roles").upsert({ user_id: jaseelId, role: "admin" });
  }

  return new Response(
    JSON.stringify({ success: true, admin: adminId, counselor: counselorId, jaseelAdmin: jaseelId }),
    { headers: { "Content-Type": "application/json" } }
  );
});
