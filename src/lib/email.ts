import { Resend } from "resend";
import { connectDb } from "@/lib/db";
import { EmailSettings, type EmailProviderMode } from "@/models/settings";
import { escapeText } from "@/lib/sanitize";
import { brand } from "@/config/site";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email-templates";

export { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email-templates";

function themedOrStored(stored: string | undefined | null, fallback: string) {
  if (!stored?.trim()) return fallback;
  // Upgrade plain first-version templates to the themed defaults.
  const plain =
    !stored.includes("#a66b2e") &&
    !stored.includes("border-collapse") &&
    (stored.includes("You received a new contact") ||
      stored.includes("A new project enquiry arrived.") ||
      stored.includes("<blockquote>{{message}}</blockquote>") ||
      stored.startsWith("<p>Hi {{name}},</p>\n<p>Thanks for"));
  return plain ? fallback : stored;
}

interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export type TemplateVars = Record<string, string | undefined | null>;

function filled(value?: string | null) {
  return Boolean(value && String(value).trim());
}

export function renderTemplate(template: string, vars: TemplateVars) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value == null ? "" : escapeText(String(value));
  });
}

export function wrapEmailHtml(
  body: string,
  options?: {
    title?: string;
    eyebrow?: string;
    siteName?: string;
    siteUrl?: string;
    preheader?: string;
  },
) {
  const siteName = options?.siteName || brand.name;
  const siteUrl = options?.siteUrl || process.env.NEXT_PUBLIC_SITE_URL || "https://graphion.studio";
  const eyebrow = options?.eyebrow || brand.shortName.toUpperCase();
  const title = options?.title;
  const preheader = options?.preheader || title || siteName;
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeText(title || siteName)}</title>
</head>
<body style="margin:0;padding:0;background:#f3eee6;color:#2c241c">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeText(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#f3eee6">
    <tr>
      <td align="center" style="padding:36px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;max-width:640px;width:100%">
          <tr>
            <td style="padding:0 0 18px;text-align:left">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#a66b2e">${escapeText(eyebrow)}</p>
            </td>
          </tr>
          <tr>
            <td style="background:#ffffff;border:1px solid #e4ddd2">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
                <tr>
                  <td style="height:4px;background:#a66b2e;font-size:0;line-height:0">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:28px 28px 8px">
                    <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#a66b2e">${escapeText(siteName)}</p>
                    ${
                      title
                        ? `<h1 style="margin:12px 0 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.2;font-weight:700;color:#2c241c">${escapeText(title)}</h1>`
                        : ""
                    }
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px 32px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.65;color:#2c241c">
                    ${body}
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 28px;border-top:1px solid #e4ddd2;background:#fbf8f2">
                    <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#a66b2e">${escapeText(brand.tagline)}</p>
                    <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:13px;line-height:1.6;color:#6f6559">
                      <a href="${escapeText(siteUrl)}" style="color:#a66b2e;text-decoration:none">${escapeText(siteName)}</a>
                      · Custom platforms, product engineering, and SaaS.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 4px 0;text-align:center">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;color:#8a8074">© ${year} ${escapeText(siteName)}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function inquiryEmailHtml(input: {
  title: string;
  fields: Record<string, string | undefined>;
  siteName?: string;
}) {
  const rows = Object.entries(input.fields)
    .filter(([, value]) => value)
    .map(
      ([key, value]) =>
        `<tr>
          <td style="padding:14px 18px;border-bottom:1px solid #e4ddd2;width:140px;font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#a66b2e;font-family:Arial,Helvetica,sans-serif;vertical-align:top">${escapeText(key)}</td>
          <td style="padding:14px 18px;border-bottom:1px solid #e4ddd2;font-size:15px;color:#2c241c;font-family:Georgia,'Times New Roman',serif;vertical-align:top;white-space:pre-wrap">${escapeText(value || "")}</td>
        </tr>`,
    )
    .join("");

  return wrapEmailHtml(
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #e4ddd2;background:#fbf8f2">
      <tr>
        <td style="width:4px;background:#a66b2e;font-size:0;line-height:0">&nbsp;</td>
        <td style="padding:0">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows}</table>
        </td>
      </tr>
    </table>`,
    { title: input.title, siteName: input.siteName },
  );
}

export async function getEmailConfig() {
  await connectDb();
  const settings = await EmailSettings.findOne().select("+smtpPassword").lean();
  const fromEmail = settings?.fromEmail || process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] || "";
  const fromName = settings?.fromName || brand.name;
  const envFrom = process.env.EMAIL_FROM || `${brand.name} <hello@graphion.studio>`;

  return {
    notifyOnContact: settings?.notifyOnContact ?? true,
    notifyOnInquiry: settings?.notifyOnInquiry ?? true,
    sendCustomerConfirmation: settings?.sendCustomerConfirmation ?? true,
    from:
      settings?.fromEmail
        ? settings.fromName
          ? `${settings.fromName} <${settings.fromEmail}>`
          : settings.fromEmail
        : envFrom,
    fromName,
    fromEmail,
    notifyEmail: settings?.notifyEmail || process.env.ADMIN_NOTIFY_EMAIL || "",
    provider: (settings?.provider || "auto") as EmailProviderMode,
    smtpHost: settings?.smtpHost || process.env.SMTP_HOST || "",
    smtpPort: settings?.smtpPort || Number(process.env.SMTP_PORT || 587),
    smtpUser: settings?.smtpUser || process.env.SMTP_USER || "",
    smtpPassword: settings?.smtpPassword || process.env.SMTP_PASSWORD || "",
    smtpSecure: settings?.smtpSecure ?? process.env.SMTP_SECURE === "true",
    templates: {
      contactAdminSubject: settings?.contactAdminSubject || DEFAULT_EMAIL_TEMPLATES.contactAdminSubject,
      contactAdminHtml: themedOrStored(settings?.contactAdminHtml, DEFAULT_EMAIL_TEMPLATES.contactAdminHtml),
      contactCustomerSubject: settings?.contactCustomerSubject || DEFAULT_EMAIL_TEMPLATES.contactCustomerSubject,
      contactCustomerHtml: themedOrStored(settings?.contactCustomerHtml, DEFAULT_EMAIL_TEMPLATES.contactCustomerHtml),
      inquiryAdminSubject: settings?.inquiryAdminSubject || DEFAULT_EMAIL_TEMPLATES.inquiryAdminSubject,
      inquiryAdminHtml: themedOrStored(settings?.inquiryAdminHtml, DEFAULT_EMAIL_TEMPLATES.inquiryAdminHtml),
      inquiryCustomerSubject: settings?.inquiryCustomerSubject || DEFAULT_EMAIL_TEMPLATES.inquiryCustomerSubject,
      inquiryCustomerHtml: themedOrStored(settings?.inquiryCustomerHtml, DEFAULT_EMAIL_TEMPLATES.inquiryCustomerHtml),
    },
    hasSmtpPassword: Boolean(settings?.smtpPassword || process.env.SMTP_PASSWORD),
    hasResend: Boolean(process.env.RESEND_API_KEY),
  };
}

function smtpReady(config: Awaited<ReturnType<typeof getEmailConfig>>) {
  return filled(config.smtpHost) && filled(config.smtpUser) && filled(config.smtpPassword);
}

async function sendViaSmtp(
  config: Awaited<ReturnType<typeof getEmailConfig>>,
  payload: EmailPayload,
) {
  const nodemailer = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpSecure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPassword,
    },
  });
  await transporter.sendMail({
    from: config.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    replyTo: payload.replyTo,
  });
}

async function sendViaResend(config: Awaited<ReturnType<typeof getEmailConfig>>, payload: EmailPayload) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({
    from: config.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    replyTo: payload.replyTo,
  });
  if (result.error) throw new Error(result.error.message);
}

export async function sendEmail(payload: EmailPayload) {
  const config = await getEmailConfig();
  const mode = config.provider;

  if (mode === "smtp" || (mode === "auto" && smtpReady(config))) {
    if (!smtpReady(config)) throw new Error("SMTP is selected but host, user, or password is missing.");
    await sendViaSmtp(config, payload);
    return;
  }

  if (mode === "resend" || (mode === "auto" && process.env.RESEND_API_KEY)) {
    if (!process.env.RESEND_API_KEY) throw new Error("Resend is selected but RESEND_API_KEY is not set.");
    await sendViaResend(config, payload);
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    console.info("[email:dev]", payload.subject, payload.to);
    return;
  }

  throw new Error("No email provider configured. Add SMTP details in Admin → Settings → Email, or set RESEND_API_KEY.");
}

export function buildTemplatedEmail(
  subjectTemplate: string,
  htmlTemplate: string,
  vars: TemplateVars,
  options?: { wrapTitle?: string; eyebrow?: string; preheader?: string },
) {
  const subject = renderTemplate(subjectTemplate, vars);
  const body = renderTemplate(htmlTemplate, vars);

  return {
    subject,
    html: wrapEmailHtml(body, {
      title: options?.wrapTitle,
      eyebrow: options?.eyebrow,
      siteName: vars.siteName ? String(vars.siteName) : brand.name,
      siteUrl: vars.siteUrl ? String(vars.siteUrl) : undefined,
      preheader: options?.preheader || subject,
    }),
  };
}
