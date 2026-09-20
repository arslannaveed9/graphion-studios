import { Resend } from "resend";
import { connectDb } from "@/lib/db";
import { EmailSettings } from "@/models/settings";
import { escapeText } from "@/lib/sanitize";

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function getEmailConfig() {
  await connectDb();
  const settings = await EmailSettings.findOne().lean();
  return {
    notifyOnContact: settings?.notifyOnContact ?? true,
    notifyOnInquiry: settings?.notifyOnInquiry ?? true,
    sendCustomerConfirmation: settings?.sendCustomerConfirmation ?? true,
    from:
      settings?.fromEmail && settings.fromName
        ? `${settings.fromName} <${settings.fromEmail}>`
        : process.env.EMAIL_FROM || "Graphion Studios <hello@graphion.studio>",
    notifyEmail: settings?.notifyEmail || process.env.ADMIN_NOTIFY_EMAIL || "",
  };
}

export async function sendEmail(payload: EmailPayload) {
  const from = (await getEmailConfig()).from;

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      replyTo: payload.replyTo,
    });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      replyTo: payload.replyTo,
    });
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[email:dev]", payload.subject, payload.to);
    return;
  }

  throw new Error("No email provider configured");
}

export function inquiryEmailHtml(input: {
  title: string;
  fields: Record<string, string | undefined>;
}) {
  const rows = Object.entries(input.fields)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<tr><td style="padding:8px 12px;color:#6b6258;width:160px;vertical-align:top">${escapeText(key)}</td><td style="padding:8px 12px;color:#1c1917">${escapeText(value || "")}</td></tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="font-family:Georgia,serif;background:#f4efe8;padding:32px">
    <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #e7e0d6">
      <div style="padding:24px 28px;border-bottom:1px solid #e7e0d6">
        <p style="margin:0;letter-spacing:.28em;font-size:11px;color:#b0894a">GRAPHION STUDIOS</p>
        <h1 style="margin:12px 0 0;font-size:24px;color:#1c1917">${escapeText(input.title)}</h1>
      </div>
      <table style="width:100%;border-collapse:collapse">${rows}</table>
    </div>
  </body></html>`;
}
