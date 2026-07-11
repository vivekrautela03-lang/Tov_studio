import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/utils/supabaseAdmin";
import { sendContactEmails } from "@/utils/resend";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message, website } = body;

    // 1. Honeypot Spam Protection (If bot fills hidden 'website' field)
    if (website) {
      console.warn("Honeypot triggered! Bot submission detected.");
      // Return a fake successful response to fool the bot
      return NextResponse.json(
        { success: true, message: "Your message has been sent successfully." },
        { status: 200 }
      );
    }

    // 2. Server-Side Input Validation
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full Name is required." }, { status: 400 });
    }
    if (!email || !email.trim()) {
      return NextResponse.json({ error: "Email Address is required." }, { status: 400 });
    }
    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: "Subject is required." }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    // 3. Sanitization to prevent basic XSS (Cross-Site Scripting)
    const sanitize = (text: string) => {
      if (!text) return "";
      return text
        .trim()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
    };

    const cleanName = sanitize(name).slice(0, 100);
    const cleanEmail = sanitize(email).slice(0, 100);
    const cleanPhone = sanitize(phone || "").slice(0, 30);
    const cleanSubject = sanitize(subject).slice(0, 200);
    const cleanMessage = sanitize(message).slice(0, 5000);

    // 4. Rate Limiting & Duplicate Prevention (1 message per 60 seconds per email)
    const timeLimitAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentSubmissions, error: rateLimitError } = await supabaseAdmin
      .from("contact_messages")
      .select("id")
      .eq("email", cleanEmail)
      .gt("created_at", timeLimitAgo);

    if (rateLimitError) {
      console.error("Rate limit check query failed:", rateLimitError);
    } else if (recentSubmissions && recentSubmissions.length > 0) {
      return NextResponse.json(
        { error: "You have already sent a message recently. Please wait 60 seconds." },
        { status: 429 }
      );
    }

    // 5. Database Insertion (using supabaseAdmin to bypass direct public RLS writes)
    const { data: insertedMsg, error: insertError } = await supabaseAdmin
      .from("contact_messages")
      .insert({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone || null,
        subject: cleanSubject,
        message: cleanMessage,
        status: "Unread"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json({ error: "Failed to save message. Please try again." }, { status: 500 });
    }

    // 6. Resend Email Dispatch
    const emailResult = await sendContactEmails({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || undefined,
      subject: cleanSubject,
      message: cleanMessage,
      date: new Date(insertedMsg.created_at)
    });

    if (!emailResult.success) {
      console.error("Resend email dispatch warnings:", emailResult.error);
      // We still return success: true because the message was successfully saved to the database.
    }

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully." },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Internal contact route error:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
