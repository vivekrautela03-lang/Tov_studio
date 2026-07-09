import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabaseAdmin";
import { sendResendVerificationEmail } from "@/utils/resend";

export async function POST(req: NextRequest) {
  try {
    const origin = req.headers.get("origin") || req.nextUrl.origin;
    const body = await req.json();
    const { email, password, fullName, phone, role } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (email, password, fullName)" },
        { status: 400 }
      );
    }

    // 1. Create the user in auth.users using Admin SDK (bypasses automatic GoTrue SMTP emails)
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password: password.trim(),
      email_confirm: false, // User is unconfirmed
      user_metadata: {
        full_name: fullName.trim(),
        phone: (phone || "").trim(),
        role: role || "Crew"
      }
    });

    if (createError) {
      console.error("Supabase Admin createUser error:", createError);
      return NextResponse.json(
        { success: false, error: createError.message },
        { status: 400 }
      );
    }

    const user = userData.user;
    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, error: "User object was not created successfully." },
        { status: 500 }
      );
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email: user.email,
      password: password.trim(),
      options: {
        redirectTo: `${origin}/auth-callback`
      }
    });

    if (linkError) {
      console.error("Supabase Admin generateLink signup error:", linkError);
      // Clean up the user if we failed to generate the link to allow retries
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { success: false, error: "Failed to generate confirmation link: " + linkError.message },
        { status: 500 }
      );
    }

    const verificationLink = linkData.properties.action_link;

    // 3. Send the custom verification email via Resend
    const emailResult = await sendResendVerificationEmail(user.email, verificationLink);
    if (!emailResult.success) {
      console.error("Resend verification email failed to dispatch:", emailResult.error);
      // Clean up the user to allow retries if email failed to send
      await supabaseAdmin.auth.admin.deleteUser(user.id);
      return NextResponse.json(
        { success: false, error: "Verification email failed to deliver: " + (emailResult.error as any)?.message },
        { status: 500 }
      );
    }

    console.log(`[AUTH SUCCESS] User ${user.email} created. Verification email sent via Resend.`);
    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error("Signup API Route Exception:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
