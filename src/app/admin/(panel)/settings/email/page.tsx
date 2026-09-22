import { connectDb } from "@/lib/db";
import { EmailSettings } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { EmailSettingsForm } from "@/components/admin/email-settings-form";
import { getEmailConfig } from "@/lib/email";

export const dynamic = "force-dynamic";

export default async function EmailSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  await requirePermission("settings:manage");
  const { saved } = await searchParams;
  await connectDb();
  const settings = await EmailSettings.findOne().select("+smtpPassword").lean();
  const config = await getEmailConfig();

  return (
    <div>
      <AdminHeader
        title="Email"
        description="Configure SMTP, who gets notified, and the templates used for contact and enquiry forms."
      />
      <EmailSettingsForm
        saved={saved === "1"}
        hasResend={Boolean(process.env.RESEND_API_KEY)}
        values={{
          notifyOnContact: settings?.notifyOnContact !== false,
          notifyOnInquiry: settings?.notifyOnInquiry !== false,
          sendCustomerConfirmation: settings?.sendCustomerConfirmation !== false,
          fromName: settings?.fromName || "",
          fromEmail: settings?.fromEmail || "",
          notifyEmail: settings?.notifyEmail || "",
          provider: settings?.provider || "auto",
          smtpHost: settings?.smtpHost || "",
          smtpPort: settings?.smtpPort || 587,
          smtpUser: settings?.smtpUser || "",
          smtpSecure: Boolean(settings?.smtpSecure),
          hasSmtpPassword: Boolean(settings?.smtpPassword),
          contactAdminSubject: config.templates.contactAdminSubject,
          contactAdminHtml: config.templates.contactAdminHtml,
          contactCustomerSubject: config.templates.contactCustomerSubject,
          contactCustomerHtml: config.templates.contactCustomerHtml,
          inquiryAdminSubject: config.templates.inquiryAdminSubject,
          inquiryAdminHtml: config.templates.inquiryAdminHtml,
          inquiryCustomerSubject: config.templates.inquiryCustomerSubject,
          inquiryCustomerHtml: config.templates.inquiryCustomerHtml,
        }}
      />
    </div>
  );
}
