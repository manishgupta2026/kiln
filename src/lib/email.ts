/**
 * Transactional email service for onboarding, call scheduling, and password recovery
 */

export interface EmailOptions {
  to: string;
  name: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "Kiln Studio <team@kiln.design>";

  if (apiKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Resend email error:", errorData);
        return { success: false, error: errorData.message || "Failed to send email" };
      }

      return { success: true };
    } catch (err: any) {
      console.error("Failed to dispatch email via Resend:", err.message);
      return { success: false, error: err.message };
    }
  }

  // Development & Testing Fallback: Log email details cleanly to console
  console.log("=================================================");
  console.log(`[EMAIL DISPATCH]`);
  console.log(`To: ${options.name} <${options.to}>`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Body:`);
  console.log(options.text);
  console.log("=================================================");

  return { success: true };
}

export async function sendCallScheduledEmail(
  to: string,
  name: string,
  scheduledDate: string,
  meetingUrl?: string | null,
  notes?: string | null
) {
  const subject = `Discovery Call Confirmed — Kiln Studio`;

  const formattedDate = new Date(scheduledDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; color: #17150F;">
      <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin-bottom: 16px;">Discovery Call Scheduled</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #4A463B; margin-bottom: 24px;">
        Hi ${name},<br/><br/>
        We've reviewed your brief and scheduled a 1-on-1 discovery call to discuss your project scope, technical requirements, and timeline.
      </p>
      <div style="background: #FFFFFF; border: 1px solid #E8E4DC; border-radius: 12px; padding: 20px; margin: 24px 0;">
        <div style="font-size: 12px; font-family: monospace; text-transform: uppercase; color: #75801F; margin-bottom: 6px;">Date & Time</div>
        <div style="font-size: 16px; font-weight: 600; color: #17150F; margin-bottom: 14px;">${formattedDate}</div>
        ${
          meetingUrl
            ? `<div style="font-size: 12px; font-family: monospace; text-transform: uppercase; color: #75801F; margin-bottom: 6px;">Meeting Link</div>
               <a href="${meetingUrl}" style="color: #17150F; font-size: 14px; text-decoration: underline; word-break: break-all;">${meetingUrl}</a>`
            : `<div style="font-size: 13.5px; color: #726C5C;">Our engineering team will dial your phone number at the scheduled time.</div>`
        }
        ${
          notes
            ? `<div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #E8E4DC; font-size: 13.5px; color: #726C5C;">
                 <strong>Agenda:</strong> ${notes}
               </div>`
            : ""
        }
      </div>
      <p style="font-size: 13.5px; color: #8F8978; line-height: 1.5;">
        Looking forward to speaking with you.<br/>
        Kiln Engineering Team
      </p>
    </div>
  `;

  const text = `Hi ${name},\n\nWe've scheduled your discovery call for:\n${formattedDate}\n\nMeeting link/details: ${meetingUrl || "We will call your phone number directly."}\n\n${notes ? `Agenda: ${notes}\n\n` : ""}Looking forward to speaking with you.\nKiln Studio`;

  return sendEmail({ to, name, subject, html, text });
}

export async function sendOnboardingEmail(
  to: string,
  name: string,
  inviteUrl: string,
  role: "CLIENT" | "DEVELOPER"
) {
  const roleName = role === "DEVELOPER" ? "developer workspace" : "project portal";
  const subject = `Your Kiln ${roleName} is ready`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; color: #17150F;">
      <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin-bottom: 16px;">Welcome to Kiln.</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #4A463B; margin-bottom: 24px;">
        Hi ${name},<br/><br/>
        Your project has been converted into an active build. You can now access real-time status updates, submit tickets, and chat directly with your assigned development team without scheduling a call.
      </p>
      <div style="margin: 32px 0;">
        <a href="${inviteUrl}" style="background: #17150F; color: #FAF8F5; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 500; display: inline-block;">
          Set up your password &rarr;
        </a>
      </div>
      <p style="font-size: 13px; color: #8F8978; line-height: 1.5;">
        This single-use invite link is valid for 48 hours.<br/>
        If the button doesn't work, copy and paste this URL into your browser:<br/>
        <a href="${inviteUrl}" style="color: #75801F;">${inviteUrl}</a>
      </p>
    </div>
  `;

  const text = `Hi ${name},\n\nYour Kiln ${roleName} is ready. Access real-time status updates, submit tickets, and chat with your assigned team directly.\n\nSet up your password here:\n${inviteUrl}\n\nThis single-use link is valid for 48 hours.`;

  return sendEmail({ to, name, subject, html, text });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const subject = "Reset your Kiln password";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; color: #17150F;">
      <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin-bottom: 16px;">Reset your password.</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #4A463B; margin-bottom: 24px;">
        Hi ${name},<br/><br/>
        We received a request to reset your password for your Kiln account. Click the button below to choose a new password.
      </p>
      <div style="margin: 32px 0;">
        <a href="${resetUrl}" style="background: #17150F; color: #FAF8F5; padding: 12px 24px; text-decoration: none; border-radius: 999px; font-size: 14px; font-weight: 500; display: inline-block;">
          Reset Password &rarr;
        </a>
      </div>
      <p style="font-size: 13px; color: #8F8978; line-height: 1.5;">
        This single-use link is valid for 48 hours. If you did not request a password reset, you can safely ignore this email.<br/>
        <a href="${resetUrl}" style="color: #75801F;">${resetUrl}</a>
      </p>
    </div>
  `;

  const text = `Hi ${name},\n\nWe received a request to reset your password for your Kiln account.\n\nReset your password here:\n${resetUrl}\n\nThis link is valid for 48 hours. If you did not request this, ignore this email.`;

  return sendEmail({ to, name, subject, html, text });
}
