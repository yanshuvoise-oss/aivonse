import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Validate token with regular anon client
    const supabaseUserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // Use admin client to bypass RLS and perform full deletion
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Delete all storage files associated with the user
    // List all files in the user's folder
    const { data: files, error: listError } = await supabaseAdmin.storage
      .from("media")
      .list(userId, {
        limit: 1000,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${userId}/${file.name}`);
      const { error: removeError } = await supabaseAdmin.storage
        .from("media")
        .remove(filePaths);
        
      if (removeError) {
        console.error("Error removing storage files:", removeError);
      }
    }

    // 2. Delete database records. 
    // We explicitly delete them to ensure everything is wiped out, 
    // even if cascading deletes are not fully configured in Postgres.
    await supabaseAdmin.from("analytics").delete().eq("profile_id", userId);
    await supabaseAdmin.from("links").delete().eq("profile_id", userId);
    await supabaseAdmin.from("subscriptions").delete().eq("profile_id", userId);
    await supabaseAdmin.from("profiles").delete().eq("id", userId);

    // 3. Delete the actual authentication user record
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError);
      return NextResponse.json({ error: "Failed to delete auth user record" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Account completely deleted" });
  } catch (err: any) {
    console.error("Delete Account Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
