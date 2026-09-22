"use client";

import { useActionState, useState } from "react";
import { saveEmailSettingsAction, sendTestEmailAction, resetEmailTemplatesAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email-templates";

type EmailFormValues = {
  notifyOnContact: boolean;
  notifyOnInquiry: boolean;
  sendCustomerConfirmation: boolean;
  fromName: string;
  fromEmail: string;
  notifyEmail: string;
  provider: "auto" | "smtp" | "resend";
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSecure: boolean;
  hasSmtpPassword: boolean;
  contactAdminSubject: string;
  contactAdminHtml: string;
  contactCustomerSubject: string;
  contactCustomerHtml: string;
  inquiryAdminSubject: string;
  inquiryAdminHtml: string;
  inquiryCustomerSubject: string;
  inquiryCustomerHtml: string;
};

const TEMPLATE_TABS = [
  {
    id: "contact-admin",
    label: "Contact → admin",
    subject: "contactAdminSubject",
    html: "contactAdminHtml",
    hint: "Sent to your notify address when the contact form is submitted.",
  },
  {
    id: "contact-customer",
    label: "Contact → customer",
    subject: "contactCustomerSubject",
    html: "contactCustomerHtml",
    hint: "Confirmation email to the person who filled the contact form.",
  },
  {
    id: "inquiry-admin",
    label: "Enquiry → admin",
    subject: "inquiryAdminSubject",
    html: "inquiryAdminHtml",
    hint: "Sent when a service or product enquiry form is submitted.",
  },
  {
    id: "inquiry-customer",
    label: "Enquiry → customer",
    subject: "inquiryCustomerSubject",
    html: "inquiryCustomerHtml",
    hint: "Confirmation to the customer after a service/product enquiry.",
  },
] as const;

const VARS = [
  "siteName",
  "siteUrl",
  "name",
  "email",
  "phone",
  "company",
  "message",
  "inquiryType",
  "subjectName",
  "selectedPackage",
  "enquirySummary",
  "budget",
  "timeline",
  "source",
];

export function EmailSettingsForm({
  values,
  hasResend,
  saved,
}: {
  values: EmailFormValues;
  hasResend: boolean;
  saved?: boolean;
}) {
  const [tab, setTab] = useState<(typeof TEMPLATE_TABS)[number]["id"]>("contact-admin");
  const [testState, testAction, testPending] = useActionState(sendTestEmailAction, null);
  const active = TEMPLATE_TABS.find((item) => item.id === tab) || TEMPLATE_TABS[0];

  return (
    <div className="space-y-10">
      {saved ? (
        <p className="border border-copper/30 bg-copper/10 px-4 py-3 text-sm text-copper">Email settings saved.</p>
      ) : null}

      <form action={saveEmailSettingsAction} className="space-y-10">
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl">Notifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose which form events send mail.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle name="notifyOnContact" label="Notify on contact" defaultChecked={values.notifyOnContact} />
            <Toggle name="notifyOnInquiry" label="Notify on enquiry" defaultChecked={values.notifyOnInquiry} />
            <Toggle
              name="sendCustomerConfirmation"
              label="Customer confirmation"
              defaultChecked={values.sendCustomerConfirmation}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="From name" name="fromName" defaultValue={values.fromName} placeholder="Graphion Studios" />
            <Field label="From email" name="fromEmail" defaultValue={values.fromEmail} placeholder="hello@yourdomain.com" />
            <Field label="Notify email" name="notifyEmail" defaultValue={values.notifyEmail} placeholder="leads@yourdomain.com" />
          </div>
        </section>

        <section className="space-y-4 border-t border-hairline pt-8">
          <div>
            <h2 className="font-display text-2xl">Delivery</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Prefer SMTP from this page for production. Resend still works if <code className="font-mono text-xs">RESEND_API_KEY</code> is set in the environment.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Provider</Label>
            <select
              name="provider"
              defaultValue={values.provider}
              className="h-9 w-full max-w-md border border-input bg-background px-2 text-sm"
            >
              <option value="auto">Auto — SMTP if filled, else Resend, else log in development</option>
              <option value="smtp">SMTP only</option>
              <option value="resend">Resend only {hasResend ? "" : "(set RESEND_API_KEY first)"}</option>
            </select>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="SMTP host" name="smtpHost" defaultValue={values.smtpHost} placeholder="smtp.gmail.com" />
            <Field label="SMTP port" name="smtpPort" defaultValue={String(values.smtpPort || 587)} placeholder="587" />
            <Field label="SMTP username" name="smtpUser" defaultValue={values.smtpUser} placeholder="you@yourdomain.com" />
            <div className="space-y-2">
              <Label>SMTP password</Label>
              <Input
                name="smtpPassword"
                type="password"
                autoComplete="new-password"
                placeholder={values.hasSmtpPassword ? "••••••••  (leave blank to keep)" : "App password or SMTP secret"}
                className="rounded-none"
              />
              {values.hasSmtpPassword ? (
                <p className="text-xs text-muted-foreground">A password is already saved. Leave blank to keep it.</p>
              ) : null}
            </div>
          </div>
          <Toggle name="smtpSecure" label="Use TLS/SSL (port 465)" defaultChecked={values.smtpSecure} />
        </section>

        <section className="space-y-4 border-t border-hairline pt-8">
          <div>
            <h2 className="font-display text-2xl">Email templates</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bodies are wrapped in the Graphion copper/paper layout automatically. Use tokens like{" "}
              <code className="font-mono text-xs">{"{{name}}"}</code>. Available:{" "}
              {VARS.map((v) => (
                <code key={v} className="mr-1 font-mono text-[11px]">{`{{${v}}}`}</code>
              ))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`border px-3 py-1.5 text-sm ${tab === item.id ? "border-copper bg-copper/10 text-copper" : "border-border text-muted-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{active.hint}</p>
          {TEMPLATE_TABS.map((item) => (
            <div key={item.id} className={tab === item.id ? "space-y-3" : "hidden"}>
              <Field
                label="Subject"
                name={item.subject}
                defaultValue={String(values[item.subject] || DEFAULT_EMAIL_TEMPLATES[item.subject])}
              />
              <div className="space-y-2">
                <Label>Body (HTML)</Label>
                <Textarea
                  name={item.html}
                  rows={10}
                  defaultValue={String(values[item.html] || DEFAULT_EMAIL_TEMPLATES[item.html])}
                  className="rounded-none font-mono text-xs"
                />
              </div>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button className="rounded-none">Save email settings</Button>
        </div>
      </form>

      <form action={resetEmailTemplatesAction} className="border-t border-hairline pt-6">
        <p className="mb-3 text-sm text-muted-foreground">
          Clear custom template text and restore the copper/paper studio defaults used for contact and enquiry mail.
        </p>
        <Button type="submit" variant="outline" className="rounded-none">
          Reset templates to theme defaults
        </Button>
      </form>

      <section className="space-y-4 border-t border-hairline pt-8">
        <div>
          <h2 className="font-display text-2xl">Send a test email</h2>
          <p className="mt-1 text-sm text-muted-foreground">Uses the saved provider settings (save first if you just changed SMTP).</p>
        </div>
        <form action={testAction} className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1 space-y-2">
            <Label>Send test to</Label>
            <Input name="testTo" type="email" required placeholder="you@yourdomain.com" className="rounded-none" defaultValue={values.notifyEmail} />
          </div>
          <Button type="submit" variant="outline" className="rounded-none" disabled={testPending}>
            {testPending ? "Sending…" : "Send test"}
          </Button>
        </form>
        {testState && "error" in testState && testState.error ? (
          <p className="text-sm text-destructive">{testState.error}</p>
        ) : null}
        {testState && "ok" in testState && testState.ok ? (
          <p className="text-sm text-copper">{testState.message}</p>
        ) : null}
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input name={name} defaultValue={defaultValue} placeholder={placeholder} className="rounded-none" />
    </div>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 border border-hairline px-3 py-3 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}
