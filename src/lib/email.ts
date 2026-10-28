/**
 * Transactional email service for onboarding, call scheduling, and password recovery
 * Supports Nodemailer (Gmail / Custom SMTP) and Resend API, with local console fallback.
 */

import nodemailer from "nodemailer";
import { syncCloudflareEnv } from "@/lib/env";

export interface EmailOptions {
  to: string;
  name: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  syncCloudflareEnv();

  const errors: string[] = [];

  // 1. Priority 1: Zoho Work Mail / Custom SMTP (Official Domain)
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || "smtp.zoho.in";
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 465;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ""),
        },
      });

      const fromAddress = process.env.FROM_EMAIL || `"Digigrantha Studio" <${smtpUser}>`;

      await transporter.sendMail({
        from: fromAddress,
        to: `"${options.name}" <${options.to}>`,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`[EMAIL SENT VIA ZOHO WORK MAIL] To: ${options.to} (${options.subject})`);
      return { success: true };
    } catch (err: any) {
      console.warn("[ZOHO SMTP FAILED - ATTEMPTING FALLBACK]:", err.message);
      errors.push(`Zoho SMTP error: ${err.message}`);
    }
  }

  // 2. Priority 2: Gmail SMTP Fallback
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (gmailUser && gmailPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ""),
        },
      });

      await transporter.sendMail({
        from: `"Digigrantha Studio" <${gmailUser}>`,
        to: `"${options.name}" <${options.to}>`,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log(`[EMAIL SENT VIA GMAIL FALLBACK] To: ${options.to} (${options.subject})`);
      return { success: true };
    } catch (err: any) {
      console.warn("[GMAIL SMTP FAILED - ATTEMPTING RESEND FALLBACK]:", err.message);
      errors.push(`Gmail error: ${err.message}`);
    }
  }

  // 3. Priority 3: Resend API Fallback
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    const fromEmail =
      process.env.FROM_EMAIL && !process.env.FROM_EMAIL.includes("team@digigrantha.com") && !process.env.FROM_EMAIL.includes("team@kiln.design")
        ? process.env.FROM_EMAIL
        : "Digigrantha Studio <onboarding@resend.dev>";

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
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

      if (res.ok) {
        console.log(`[EMAIL SENT VIA RESEND FALLBACK] From: ${fromEmail} -> To: ${options.to} (${options.subject})`);
        return { success: true };
      } else {
        const errorData = await res.json().catch(() => ({}));
        errors.push(`Resend error: ${errorData.message || "Failed"}`);
      }
    } catch (err: any) {
      console.warn("[RESEND API FAILED]:", err.message);
      errors.push(`Resend error: ${err.message}`);
    }
  }

  // If configured providers all failed
  if (errors.length > 0) {
    return { success: false, error: errors.join(" | ") };
  }

  // 4. Local Development Fallback: Log email details cleanly to console
  console.log("=================================================");
  console.log(`[LOCAL EMAIL DISPATCH - No email providers configured]`);
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
  const subject = `Discovery Call Confirmed — Digigrantha Studio`;

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
        Digigrantha Engineering Team
      </p>
    </div>
  `;

  const text = `Hi ${name},\n\nWe've scheduled your discovery call for:\n${formattedDate}\n\nMeeting link/details: ${meetingUrl || "We will call your phone number directly."}\n\n${notes ? `Agenda: ${notes}\n\n` : ""}Looking forward to speaking with you.\nDigigrantha Studio`;

  return sendEmail({ to, name, subject, html, text });
}

export async function sendOnboardingEmail(
  to: string,
  name: string,
  inviteUrl: string,
  role: "CLIENT" | "DEVELOPER"
) {
  const roleName = role === "DEVELOPER" ? "developer workspace" : "project portal";
  const subject = `Your Digigrantha ${roleName} is ready`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; color: #17150F;">
      <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin-bottom: 16px;">Welcome to Digigrantha.</h1>
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

  const text = `Hi ${name},\n\nYour Digigrantha ${roleName} is ready. Access real-time status updates, submit tickets, and chat with your assigned team directly.\n\nSet up your password here:\n${inviteUrl}\n\nThis single-use link is valid for 48 hours.`;

  return sendEmail({ to, name, subject, html, text });
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  const subject = "Reset your Digigrantha password";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #FAF8F5; color: #17150F;">
      <h1 style="font-family: Georgia, serif; font-size: 24px; font-weight: normal; margin-bottom: 16px;">Reset your password.</h1>
      <p style="font-size: 15px; line-height: 1.6; color: #4A463B; margin-bottom: 24px;">
        Hi ${name},<br/><br/>
        We received a request to reset your password for your Digigrantha account. Click the button below to choose a new password.
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

  const text = `Hi ${name},\n\nWe received a request to reset your password for your Digigrantha account.\n\nReset your password here:\n${resetUrl}\n\nThis link is valid for 48 hours. If you did not request this, ignore this email.`;

  return sendEmail({ to, name, subject, html, text });
}

export async function sendQuotationEmail(
  quotation: {
    quotationNumber: string;
    clientName: string;
    clientEmail: string;
    clientCompany?: string | null;
    projectTitle: string;
    overview: string;
    currency: "INR" | "USD";
    subtotal: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    timeline: string;
    paymentSchedule: string;
    validUntil: string;
    lineItems: Array<{
      id: string;
      title: string;
      description: string;
      hours?: number;
      amount: number;
    }>;
    techStack?: string[];
    termsAndNotes?: string | null;
    viewToken: string;
  },
  options?: {
    customSubject?: string;
    customNote?: string;
    baseUrl?: string;
  }
) {
  const currencySymbol = quotation.currency === "INR" ? "₹" : "$";
  const formatAmt = (num: number) => {
    if (quotation.currency === "INR") {
      return `₹${num.toLocaleString("en-IN")}`;
    }
    return `$${num.toLocaleString("en-US")}`;
  };

  const subject =
    options?.customSubject ||
    `Project Proposal & Quotation — ${quotation.projectTitle} [${quotation.quotationNumber}]`;

  const validUntilFormatted = new Date(quotation.validUntil).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const origin = options?.baseUrl || process.env.NEXTAUTH_URL || "https://digigrantha.com";
  const quoteUrl = `${origin}/quote/${quotation.viewToken}`;

  const lineItemsHtml = quotation.lineItems
    .map(
      (item, idx) => `
      <tr style="border-bottom: 1px solid #E8E4DC;">
        <td style="padding: 14px 10px; font-size: 13.5px; color: #17150F; vertical-align: top;">
          <strong>${idx + 1}. ${item.title}</strong>
          ${item.description ? `<div style="color: #726C5C; font-size: 12.5px; margin-top: 4px; line-height: 1.4;">${item.description}</div>` : ""}
        </td>
        <td style="padding: 14px 10px; font-size: 13px; color: #726C5C; font-family: monospace; text-align: center; vertical-align: top;">
          ${item.hours ? `${item.hours} hrs` : "Included"}
        </td>
        <td style="padding: 14px 10px; font-size: 14px; font-weight: 600; color: #17150F; text-align: right; vertical-align: top; white-space: nowrap;">
          ${formatAmt(item.amount)}
        </td>
      </tr>
    `
    )
    .join("");

  const techChipsHtml = (quotation.techStack || [])
    .map(
      (tech) => `
      <span style="display: inline-block; background: #EEF0DD; color: #75801F; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; margin: 2px 4px 2px 0;">
        ${tech}
      </span>
    `
    )
    .join("");

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 620px; margin: 0 auto; padding: 36px 24px; background: #FAF8F5; color: #17150F;">
      
      <!-- Brand & Header -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #17150F; padding-bottom: 16px; margin-bottom: 24px;">
        <div style="font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #17150F;">
          Digigrantha<span style="color: #75801F;">.</span>
        </div>
        <div style="font-family: monospace; font-size: 11.5px; color: #726C5C; text-align: right;">
          ESTIMATE / PROPOSAL<br/>
          <strong style="color: #17150F;">${quotation.quotationNumber}</strong>
        </div>
      </div>

      <!-- Greeting -->
      <h2 style="font-family: Georgia, serif; font-size: 22px; font-weight: normal; margin-bottom: 12px; color: #17150F;">
        Project Quotation for ${quotation.clientName}
      </h2>
      ${quotation.clientCompany ? `<div style="font-size: 13.5px; color: #726C5C; margin-bottom: 16px;"><strong>Company:</strong> ${quotation.clientCompany}</div>` : ""}

      ${
        options?.customNote
          ? `<div style="background: #FFFFFF; border-left: 3px solid #75801F; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px; font-size: 14px; line-height: 1.55; color: #4A463B;">
               ${options.customNote.replace(/\n/g, "<br/>")}
             </div>`
          : ""
      }

      <!-- Project Overview -->
      <div style="background: #FFFFFF; border: 1px solid #E8E4DC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #75801F; letter-spacing: 0.05em; margin-bottom: 6px;">
          Project Scope
        </div>
        <h3 style="font-size: 17px; font-weight: 600; margin: 0 0 8px 0; color: #17150F;">
          ${quotation.projectTitle}
        </h3>
        <p style="font-size: 14px; line-height: 1.6; color: #4A463B; margin: 0;">
          ${quotation.overview.replace(/\n/g, "<br/>")}
        </p>
      </div>

      <!-- Scope Breakdown Table -->
      <div style="background: #FFFFFF; border: 1px solid #E8E4DC; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
        <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #75801F; letter-spacing: 0.05em; margin-bottom: 12px;">
          Deliverables &amp; Investment
        </div>
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1.5px solid #17150F;">
              <th style="padding: 8px 10px; font-size: 11.5px; font-family: monospace; text-transform: uppercase; color: #726C5C;">Deliverable</th>
              <th style="padding: 8px 10px; font-size: 11.5px; font-family: monospace; text-transform: uppercase; color: #726C5C; text-align: center;">Scope</th>
              <th style="padding: 8px 10px; font-size: 11.5px; font-family: monospace; text-transform: uppercase; color: #726C5C; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #E8E4DC;">
          <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #726C5C; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>${formatAmt(quotation.subtotal)}</span>
          </div>
          ${
            quotation.discount > 0
              ? `<div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #75801F; margin-bottom: 6px;">
                   <span>Studio Partner Discount:</span>
                   <span>- ${formatAmt(quotation.discount)}</span>
                 </div>`
              : ""
          }
          ${
            quotation.taxRate > 0
              ? `<div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #726C5C; margin-bottom: 6px;">
                   <span>GST / Tax (${quotation.taxRate}%):</span>
                   <span>+ ${formatAmt(quotation.taxAmount)}</span>
                 </div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #17150F; padding-top: 10px; border-top: 2px solid #17150F; margin-top: 8px;">
            <span>Total Investment:</span>
            <span style="color: #75801F;">${formatAmt(quotation.totalAmount)}</span>
          </div>
        </div>
      </div>

      <!-- Execution Terms Grid -->
      <div style="background: #FFFFFF; border: 1px solid #E8E4DC; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px; font-size: 13.5px;">
        <div style="margin-bottom: 12px;">
          <strong style="color: #726C5C; font-size: 11.5px; font-family: monospace; text-transform: uppercase;">Estimated Timeline:</strong>
          <div style="color: #17150F; font-weight: 600; margin-top: 2px;">${quotation.timeline}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <strong style="color: #726C5C; font-size: 11.5px; font-family: monospace; text-transform: uppercase;">Payment Milestones:</strong>
          <div style="color: #17150F; font-weight: 500; margin-top: 2px;">${quotation.paymentSchedule}</div>
        </div>
        <div style="margin-bottom: 12px;">
          <strong style="color: #726C5C; font-size: 11.5px; font-family: monospace; text-transform: uppercase;">Validity:</strong>
          <div style="color: #17150F; margin-top: 2px;">This estimate is valid until ${validUntilFormatted}.</div>
        </div>
        ${
          techChipsHtml
            ? `<div>
                 <strong style="color: #726C5C; font-size: 11.5px; font-family: monospace; text-transform: uppercase; display: block; margin-bottom: 6px;">Recommended Stack:</strong>
                 <div>${techChipsHtml}</div>
               </div>`
            : ""
        }
        ${
          quotation.termsAndNotes
            ? `<div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #E8E4DC; color: #726C5C; font-size: 12.5px; line-height: 1.5;">
                 <strong>Notes &amp; Inclusions:</strong><br/>
                 ${quotation.termsAndNotes.replace(/\n/g, "<br/>")}
               </div>`
            : ""
        }
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0 24px;">
        <a href="${quoteUrl}" style="background: #17150F; color: #FAF8F5; padding: 14px 32px; text-decoration: none; border-radius: 999px; font-size: 15px; font-weight: 600; display: inline-block;">
          View &amp; Accept Proposal Online &rarr;
        </a>
        <div style="font-size: 12px; color: #8F8978; margin-top: 10px;">
          Or copy link: <a href="${quoteUrl}" style="color: #75801F;">${quoteUrl}</a>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="border-top: 1px solid #E8E4DC; padding-top: 20px; font-size: 12.5px; color: #8F8978; line-height: 1.5;">
        To proceed with this quotation or request scope adjustments, simply reply directly to this email.<br/>
        <strong>Digigrantha Studio</strong> — Bespoke design and software engineering, in-house, start to finish.
      </div>
    </div>
  `;

  const textItems = quotation.lineItems
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.title}: ${formatAmt(item.amount)} (${item.hours ? `${item.hours} hrs` : "Included"})\n   ${item.description}`
    )
    .join("\n\n");

  const text = `Digigrantha Studio — Project Quotation [${quotation.quotationNumber}]
Project: ${quotation.projectTitle}
Client: ${quotation.clientName} (${quotation.clientCompany || ""})
Total: ${formatAmt(quotation.totalAmount)}
Timeline: ${quotation.timeline}
Payment Terms: ${quotation.paymentSchedule}
Valid Until: ${validUntilFormatted}

OVERVIEW:
${quotation.overview}

DELIVERABLES:
${textItems}

SUBTOTAL: ${formatAmt(quotation.subtotal)}
${quotation.discount > 0 ? `DISCOUNT: - ${formatAmt(quotation.discount)}\n` : ""}${quotation.taxRate > 0 ? `TAX (${quotation.taxRate}%): + ${formatAmt(quotation.taxAmount)}\n` : ""}TOTAL INVESTMENT: ${formatAmt(quotation.totalAmount)}

View & Accept Online: ${quoteUrl}

To accept or adjust this quotation, reply directly to this email.
Digigrantha Studio`;

  return sendEmail({
    to: quotation.clientEmail,
    name: quotation.clientName,
    subject,
    html,
    text,
  });
}

export async function sendInvoiceEmail(
  invoice: {
    id: string;
    invoiceNumber: string;
    clientName: string;
    clientEmail: string;
    clientCompany?: string | null;
    projectTitle: string;
    currency: "INR" | "USD";
    subtotal: number;
    discount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    issueDate: string;
    dueDate: string;
    lineItems: Array<{
      id: string;
      title: string;
      description?: string;
      quantity: number;
      rate: number;
      amount: number;
    }>;
    bankDetails?: {
      accountName?: string;
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      branchName?: string | null;
      swiftCode?: string | null;
      upiId?: string | null;
    } | null;
    paymentTerms?: string | null;
    notes?: string | null;
    viewToken: string;
  },
  options?: {
    customSubject?: string;
    customNote?: string;
    baseUrl?: string;
  }
) {
  const formatAmt = (num: number) => {
    if (invoice.currency === "INR") {
      return `₹${Number(num).toLocaleString("en-IN")}`;
    }
    return `$${Number(num).toLocaleString("en-US")}`;
  };

  const formattedDueDate = new Date(invoice.dueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const formattedIssueDate = new Date(invoice.issueDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const origin = options?.baseUrl || process.env.NEXTAUTH_URL || "https://digigrantha.com";
  const invoiceUrl = `${origin}/invoice/${invoice.viewToken}`;

  const subject =
    options?.customSubject ||
    `Invoice ${invoice.invoiceNumber} from Digigrantha Studio — ${formatAmt(invoice.totalAmount)}`;

  const lineItemsHtml = invoice.lineItems
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #E8E4DC;">
        <td style="padding: 12px 10px; font-size: 13.5px; color: #17150F; vertical-align: top;">
          <strong>${item.title}</strong>
          ${item.description ? `<div style="font-size: 12px; color: #726C5C; margin-top: 4px; line-height: 1.4;">${item.description}</div>` : ""}
        </td>
        <td style="padding: 12px 10px; font-size: 13px; color: #726C5C; text-align: center; font-family: monospace; vertical-align: top;">
          ${item.quantity || 1}
        </td>
        <td style="padding: 12px 10px; font-size: 13px; color: #726C5C; text-align: right; font-family: monospace; vertical-align: top;">
          ${formatAmt(item.rate)}
        </td>
        <td style="padding: 12px 10px; font-size: 13.5px; font-weight: 600; color: #17150F; text-align: right; font-family: monospace; vertical-align: top;">
          ${formatAmt(item.amount)}
        </td>
      </tr>
    `
    )
    .join("");

  const bank = invoice.bankDetails;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 640px; margin: 0 auto; padding: 36px 24px; background: #FAF8F5; color: #17150F;">
      
      <!-- Brand & Header -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 2px solid #17150F; padding-bottom: 16px; margin-bottom: 24px;">
        <div>
          <div style="font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #17150F;">
            Digigrantha<span style="color: #75801F;">.</span>
          </div>
          <div style="font-size: 12px; color: #726C5C; margin-top: 4px; font-family: monospace;">
            TAX INVOICE &amp; PAYMENT NOTICE
          </div>
        </div>
        <div style="font-family: monospace; font-size: 12px; color: #726C5C; text-align: right;">
          INVOICE NO.<br/>
          <strong style="color: #17150F; font-size: 14px;">${invoice.invoiceNumber}</strong>
        </div>
      </div>

      <!-- Bill To & Summary Meta Grid -->
      <div style="background: #FFFFFF; border: 1px solid #E8E4DC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 50%;">
              <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #75801F; margin-bottom: 4px;">Billed To</div>
              <div style="font-size: 15px; font-weight: 600; color: #17150F;">${invoice.clientName}</div>
              ${invoice.clientCompany ? `<div style="font-size: 13px; color: #726C5C; margin-top: 2px;">${invoice.clientCompany}</div>` : ""}
              <div style="font-size: 13px; color: #726C5C; margin-top: 2px;">${invoice.clientEmail}</div>
            </td>
            <td style="vertical-align: top; width: 50%; text-align: right;">
              <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #75801F; margin-bottom: 4px;">Invoice Details</div>
              <div style="font-size: 13px; color: #726C5C;">Issued: <strong>${formattedIssueDate}</strong></div>
              <div style="font-size: 13px; color: #991b1b; margin-top: 4px;">Due Date: <strong>${formattedDueDate}</strong></div>
              <div style="font-size: 13px; color: #17150F; margin-top: 4px;">Project: <strong>${invoice.projectTitle}</strong></div>
            </td>
          </tr>
        </table>
      </div>

      ${
        options?.customNote
          ? `<div style="background: #FFFFFF; border-left: 3px solid #75801F; padding: 14px 18px; border-radius: 4px; margin-bottom: 24px; font-size: 14px; line-height: 1.55; color: #4A463B;">
               ${options.customNote.replace(/\n/g, "<br/>")}
             </div>`
          : ""
      }

      <!-- Line Items Table -->
      <div style="background: #FFFFFF; border: 1px solid #E8E4DC; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1.5px solid #17150F;">
              <th style="padding: 8px 10px; font-size: 11.5px; font-family: monospace; text-transform: uppercase; color: #726C5C;">Description</th>
              <th style="padding: 8px 10px; font-size: 11.5px; font-family: monospace; text-transform: uppercase; color: #726C5C; text-align: center;">Qty</th>
              <th style="padding: 8px 10px; font-size: 11.5px; font-family: monospace; text-transform: uppercase; color: #726C5C; text-align: right;">Rate</th>
              <th style="padding: 8px 10px; font-size: 11.5px; font-family: monospace; text-transform: uppercase; color: #726C5C; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${lineItemsHtml}
          </tbody>
        </table>

        <!-- Totals Summary -->
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #E8E4DC;">
          <div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #726C5C; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span>${formatAmt(invoice.subtotal)}</span>
          </div>
          ${
            invoice.discount > 0
              ? `<div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #75801F; margin-bottom: 6px;">
                   <span>Discount Applied:</span>
                   <span>- ${formatAmt(invoice.discount)}</span>
                 </div>`
              : ""
          }
          ${
            invoice.taxRate > 0
              ? `<div style="display: flex; justify-content: space-between; font-size: 13.5px; color: #726C5C; margin-bottom: 6px;">
                   <span>GST / Tax (${invoice.taxRate}%):</span>
                   <span>+ ${formatAmt(invoice.taxAmount)}</span>
                 </div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; font-size: 19px; font-weight: bold; color: #17150F; padding-top: 10px; border-top: 2px solid #17150F; margin-top: 8px;">
            <span>Total Balance Due:</span>
            <span style="color: #75801F;">${formatAmt(invoice.totalAmount)}</span>
          </div>
        </div>
      </div>

      <!-- Payment Instructions / Bank Details -->
      ${
        bank
          ? `
      <div style="background: #FFFFFF; border: 1px solid #E8E4DC; border-radius: 12px; padding: 20px; margin-bottom: 24px; font-size: 13px;">
        <div style="font-size: 11px; font-family: monospace; text-transform: uppercase; color: #75801F; margin-bottom: 12px; letter-spacing: 0.05em;">
          Remittance &amp; Wire Transfer Details
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #4A463B;">
          <tr>
            <td style="padding: 4px 0; width: 38%; color: #726C5C;">Beneficiary Name:</td>
            <td style="padding: 4px 0; font-weight: 600; color: #17150F;">${bank.accountName || "Digigrantha Studio"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #726C5C;">Bank:</td>
            <td style="padding: 4px 0; font-weight: 500; color: #17150F;">${bank.bankName || "HDFC Bank"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #726C5C;">Account Number:</td>
            <td style="padding: 4px 0; font-family: monospace; font-weight: 600; color: #17150F;">${bank.accountNumber || "—"}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #726C5C;">IFSC Code:</td>
            <td style="padding: 4px 0; font-family: monospace; font-weight: 600; color: #17150F;">${bank.ifscCode || "—"}</td>
          </tr>
          ${
            bank.branchName
              ? `<tr>
                   <td style="padding: 4px 0; color: #726C5C;">Branch:</td>
                   <td style="padding: 4px 0; font-weight: 500; color: #17150F;">${bank.branchName}</td>
                 </tr>`
              : ""
          }
          ${
            bank.upiId
              ? `<tr>
                   <td style="padding: 4px 0; color: #726C5C;">Instant UPI ID:</td>
                   <td style="padding: 4px 0; font-family: monospace; font-weight: 600; color: #75801F;">${bank.upiId}</td>
                 </tr>`
              : ""
          }
          ${
            bank.swiftCode
              ? `<tr>
                   <td style="padding: 4px 0; color: #726C5C;">SWIFT Code (USD):</td>
                   <td style="padding: 4px 0; font-family: monospace; color: #17150F;">${bank.swiftCode}</td>
                 </tr>`
              : ""
          }
        </table>
      </div>
      `
          : ""
      }

      <!-- CTA Buttons -->
      <div style="text-align: center; margin: 32px 0 20px;">
        <a href="${invoiceUrl}" style="background: #17150F; color: #FAF8F5; padding: 14px 34px; text-decoration: none; border-radius: 999px; font-size: 15px; font-weight: 600; display: inline-block;">
          View Invoice &amp; Download PDF &rarr;
        </a>
        <div style="font-size: 12px; color: #8F8978; margin-top: 10px;">
          Direct web link: <a href="${invoiceUrl}" style="color: #75801F;">${invoiceUrl}</a>
        </div>
      </div>

      <!-- Footer Note -->
      <div style="border-top: 1px solid #E8E4DC; padding-top: 20px; font-size: 12.5px; color: #8F8978; line-height: 1.5;">
        After making payment, please reply to this email with your transaction UTR / receipt so we can issue your paid confirmation.<br/>
        <strong>Digigrantha Studio</strong> — Engineering &amp; digital craft.
      </div>
    </div>
  `;

  const textItems = invoice.lineItems
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.title} (Qty: ${item.quantity || 1} @ ${formatAmt(item.rate)}) = ${formatAmt(item.amount)}`
    )
    .join("\n");

  const text = `Digigrantha Studio — Tax Invoice [${invoice.invoiceNumber}]
Project: ${invoice.projectTitle}
Client: ${invoice.clientName} (${invoice.clientCompany || ""})
Amount Due: ${formatAmt(invoice.totalAmount)}
Issued: ${formattedIssueDate}
Due Date: ${formattedDueDate}

LINE ITEMS:
${textItems}

SUBTOTAL: ${formatAmt(invoice.subtotal)}
${invoice.discount > 0 ? `DISCOUNT: - ${formatAmt(invoice.discount)}\n` : ""}${invoice.taxRate > 0 ? `TAX (${invoice.taxRate}%): + ${formatAmt(invoice.taxAmount)}\n` : ""}TOTAL: ${formatAmt(invoice.totalAmount)}

REMITTANCE DETAILS:
A/C Name: ${bank?.accountName || "Digigrantha Studio"}
Bank: ${bank?.bankName || "HDFC Bank"}
Account: ${bank?.accountNumber || "—"}
IFSC: ${bank?.ifscCode || "—"}
${bank?.branchName ? `Branch: ${bank.branchName}\n` : ""}${bank?.upiId ? `UPI: ${bank.upiId}\n` : ""}
View & Download PDF: ${invoiceUrl}

Please reply with the payment confirmation once sent.
Digigrantha Studio`;

  return sendEmail({
    to: invoice.clientEmail,
    name: invoice.clientName,
    subject,
    html,
    text,
  });
}

