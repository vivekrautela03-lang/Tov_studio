import { Resend } from "resend";

// Initialize Resend with API Key from environment variables (with fallback for build-time safety)
const resend = new Resend(process.env.RESEND_API_KEY || "re_G9G8FKBA_8mPcKHuG384NP2C2jctUmXb1");

// Logo image URL from the public GitHub repository
const LOGO_URL = "https://raw.githubusercontent.com/vivekrautela03-lang/Tov_studio/main/public/logo.png";

// Reusable email wrapper styling matching The Oldverse Productions branding
const getEmailWrapper = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Oldverse Productions</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #000000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #ffffff;
          -webkit-font-smoothing: antialiased;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #000000;
        }
        .header {
          text-align: center;
          padding-bottom: 30px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .logo {
          height: 56px;
          width: auto;
          display: inline-block;
        }
        .tagline {
          font-size: 11px;
          color: #38bdf8;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-top: 10px;
          font-weight: 600;
        }
        .content {
          padding: 40px 0;
          font-size: 15px;
          line-height: 1.6;
          color: #d1d5db;
        }
        .content h1 {
          color: #ffffff;
          font-size: 24px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 20px;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          background-color: #ffffff;
          color: #000000 !important;
          text-decoration: none;
          font-weight: 600;
          font-size: 14px;
          padding: 16px 32px;
          border-radius: 8px;
          transition: transform 0.2s;
        }
        .footer {
          text-align: center;
          padding-top: 30px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 11px;
          color: #4b5563;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="The Oldverse Productions Logo" class="logo" />
          <div class="tagline">Create. Collaborate. Bring Stories to Life.</div>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          © 2025 The Oldverse Productions. All rights reserved.
        </div>
      </div>
    </body>
  </html>
`;

/**
 * Sends a welcome transactional email to a newly registered user using Resend.
 */
export async function sendWelcomeEmail(email: string, fullName: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not defined. Skipping welcome email sending.");
    return { success: false, error: "Missing API Key" };
  }

  const html = getEmailWrapper(`
    <h1>Welcome to the Studio, ${fullName}!</h1>
    <p>Your creative filmmaker account has been successfully initialized at The Oldverse Productions.</p>
    <p>You can now manage scripts, schedule shoots, plan storyboards, orchestrate cast and crew, and leverage AI Support to accelerate your creative productions.</p>
    <div class="button-container">
      <a href="https://tov.studio" class="button">Access Production Console</a>
    </div>
    <p>If you have any questions or require support, please contact our crew at support@tov.studio.</p>
  `);

  try {
    const data = await resend.emails.send({
      from: "The Oldverse Productions <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to The Oldverse Productions",
      html: html,
    });
    console.log("Welcome email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return { success: false, error };
  }
}

/**
 * Sends transactional email template markup (for reference or manual dashboard configurations).
 */
export const getSupabaseEmailTemplate = (type: "verification" | "reset" | "magic-link" | "change-email") => {
  let content = "";
  
  switch (type) {
    case "verification":
      content = `
        <h1>Confirm Your Registration</h1>
        <p>Thank you for signing up with The Oldverse Productions. Please click the button below to confirm your account and activate your production workspace:</p>
        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">Verify Account</a>
        </div>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">{{ .ConfirmationURL }}</p>
      `;
      break;
    case "reset":
      content = `
        <h1>Reset Your Password Key</h1>
        <p>We received a request to reset your account key for The Oldverse Productions. Click the button below to configure your new password:</p>
        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">Reset Password Key</a>
        </div>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">{{ .ConfirmationURL }}</p>
      `;
      break;
    case "magic-link":
      content = `
        <h1>Access Your Studio Session</h1>
        <p>Click the button below to securely sign into your production console at The Oldverse Productions:</p>
        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">Sign In Securely</a>
        </div>
        <p>This link is valid for a single session launch.</p>
        <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">{{ .ConfirmationURL }}</p>
      `;
      break;
    case "change-email":
      content = `
        <h1>Confirm Email Address Change</h1>
        <p>Click the button below to verify your new email address for The Oldverse Productions:</p>
        <div class="button-container">
          <a href="{{ .ConfirmationURL }}" class="button">Confirm New Email</a>
        </div>
        <p>If you did not initiate this change, please contact security@tov.studio immediately.</p>
        <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">{{ .ConfirmationURL }}</p>
      `;
      break;
  }

  return getEmailWrapper(content);
};

/**
 * Sends account verification email via Resend SDK.
 */
export async function sendResendVerificationEmail(email: string, link: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not defined. Skipping verification email.");
    return { success: false, error: "Missing API Key" };
  }

  const html = getEmailWrapper(`
    <h1>Confirm Your Registration</h1>
    <p>Thank you for signing up with The Oldverse Productions. Please click the button below to confirm your account and activate your production workspace:</p>
    <div class="button-container">
      <a href="${link}" class="button">Verify Account</a>
    </div>
    <p>If the button doesn't work, copy and paste this link in your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">${link}</p>
  `);

  try {
    const data = await resend.emails.send({
      from: "The Oldverse Productions <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Account - The Oldverse Productions",
      html: html,
    });
    console.log("Verification email sent via Resend:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send verification email via Resend:", error);
    return { success: false, error };
  }
}

/**
 * Sends password reset email via Resend SDK.
 */
export async function sendResendPasswordResetEmail(email: string, link: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not defined. Skipping password reset email.");
    return { success: false, error: "Missing API Key" };
  }

  const html = getEmailWrapper(`
    <h1>Reset Your Password Key</h1>
    <p>We received a request to reset your account key for The Oldverse Productions. Click the button below to configure your new password:</p>
    <div class="button-container">
      <a href="${link}" class="button">Reset Password Key</a>
    </div>
    <p>If you did not request this, you can safely ignore this email.</p>
    <p>If the button doesn't work, copy and paste this link in your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">${link}</p>
  `);

  try {
    const data = await resend.emails.send({
      from: "The Oldverse Productions <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - The Oldverse Productions",
      html: html,
    });
    console.log("Password reset email sent via Resend:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send password reset email via Resend:", error);
    return { success: false, error };
  }
}

/**
 * Sends change email confirmation email via Resend SDK.
 */
export async function sendResendChangeEmailConfirmation(email: string, link: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not defined. Skipping change email confirmation.");
    return { success: false, error: "Missing API Key" };
  }

  const html = getEmailWrapper(`
    <h1>Confirm Email Address Change</h1>
    <p>Click the button below to verify your new email address for The Oldverse Productions:</p>
    <div class="button-container">
      <a href="${link}" class="button">Confirm New Email</a>
    </div>
    <p>If you did not initiate this change, please contact security@tov.studio immediately.</p>
    <p>If the button doesn't work, copy and paste this link in your browser:</p>
    <p style="font-size: 12px; word-break: break-all; color: #38bdf8;">${link}</p>
  `);

  try {
    const data = await resend.emails.send({
      from: "The Oldverse Productions <onboarding@resend.dev>",
      to: [email],
      subject: "Confirm Email Change - The Oldverse Productions",
      html: html,
    });
    console.log("Change email confirmation sent via Resend:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send change email confirmation via Resend:", error);
    return { success: false, error };
  }
}
