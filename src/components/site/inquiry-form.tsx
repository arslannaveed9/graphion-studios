"use client";

import { useActionState } from "react";
import {
  submitContactAction,
  submitInquiryAction,
  subscribeNewsletterAction,
  type PublicFormState,
} from "@/actions/public";

type CaptchaChallenge = Extract<PublicFormState, { captcha: unknown }>["captcha"];
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

function Honeypot() {
  return (
    <div className="hidden" aria-hidden>
      <label>
        Website
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  as = "input",
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  as?: "input" | "textarea";
  defaultValue?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="font-mono text-[11px] tracking-[0.16em] uppercase">
        {label}
      </Label>
      {as === "textarea" ? (
        <Textarea
          id={name}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className="min-h-32 rounded-xl"
        />
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className="rounded-xl"
        />
      )}
    </div>
  );
}

function HumanCheck({ challenge }: { challenge: CaptchaChallenge }) {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
      <Label htmlFor="captchaAnswer" className="font-mono text-[11px] tracking-[0.16em] uppercase">
        Human verification
      </Label>
      <p className="text-sm text-muted-foreground">{challenge.prompt}</p>
      <input type="hidden" name="captchaToken" value={challenge.token} />
      <Input
        key={challenge.token}
        id="captchaAnswer"
        name="captchaAnswer"
        inputMode="numeric"
        autoComplete="off"
        required
        className="max-w-40 rounded-xl"
        aria-describedby="captcha-help"
      />
      <p id="captcha-help" className="text-xs text-muted-foreground">
        Answer the question so we know this request is from a person.
      </p>
    </div>
  );
}

function currentCaptcha(state: PublicFormState | null, initial: CaptchaChallenge) {
  return state && "captcha" in state ? state.captcha : initial;
}

function currentFields(state: PublicFormState | null) {
  return state && "fields" in state ? state.fields ?? {} : {};
}

export function ContactForm({ captcha }: { captcha: CaptchaChallenge }) {
  const [state, action, pending] = useActionState(submitContactAction, null);
  if (state && "ok" in state && state.ok) {
    return <p className="surface px-5 py-6 text-sm">Received. We’ll reply within one business day.</p>;
  }
  const challenge = currentCaptcha(state, captcha);
  const fields = currentFields(state);
  return (
    <form action={action} key={challenge.token} className="surface grid gap-5 p-6 md:p-8">
      <Honeypot />
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" name="name" required defaultValue={fields.name} />
        <Field label="Email" name="email" type="email" required defaultValue={fields.email} />
        <Field label="Phone" name="phone" defaultValue={fields.phone} />
        <Field label="Company" name="company" defaultValue={fields.company} />
      </div>
      <Field label="What should we know?" name="message" as="textarea" required defaultValue={fields.message} />
      <HumanCheck challenge={challenge} />
      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 rounded-full px-6">
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

export function InquiryForm({
  serviceSlug,
  productSlug,
  subjectName,
  inquiryType,
  packages = [],
  selectedPackage,
  captcha,
}: {
  serviceSlug?: string;
  productSlug?: string;
  subjectName: string;
  inquiryType: "service" | "quote" | "custom_project" | "product";
  packages?: string[];
  selectedPackage?: string;
  captcha: CaptchaChallenge;
}) {
  const [state, action, pending] = useActionState(submitInquiryAction, null);
  if (state && "ok" in state && state.ok) {
    return <p className="surface px-5 py-6 text-sm">Thank you. A producer will follow up with next steps.</p>;
  }

  const challenge = currentCaptcha(state, captcha);
  const fields = currentFields(state);
  const kind = inquiryType === "product" ? "product" : "service";
  const packageValue = fields.selectedPackage || (selectedPackage && packages.includes(selectedPackage) ? selectedPackage : "");

  return (
    <form action={action} key={challenge.token} className="surface grid gap-5 p-6 md:p-8">
      <Honeypot />
      <input type="hidden" name="inquiryType" value={inquiryType} />
      {serviceSlug ? <input type="hidden" name="serviceSlug" value={serviceSlug} /> : null}
      {productSlug ? <input type="hidden" name="productSlug" value={productSlug} /> : null}
      <input type="hidden" name="projectType" value={subjectName} />
      <div className="rounded-xl border border-border bg-muted/20 px-4 py-3">
        <p className="font-mono text-[11px] tracking-[0.16em] text-copper uppercase">{kind} enquiry</p>
        <p className="mt-1 text-sm">This form is only for {subjectName}.</p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Name" name="name" required defaultValue={fields.name} />
        <Field label="Email" name="email" type="email" required defaultValue={fields.email} />
        <Field label="Phone" name="phone" defaultValue={fields.phone} />
        <Field label="Company" name="company" defaultValue={fields.company} />
        {packages.length ? (
          <div className="space-y-2">
            <Label htmlFor="selectedPackage" className="font-mono text-[11px] tracking-[0.16em] uppercase">
              Package
            </Label>
            <select
              id="selectedPackage"
              name="selectedPackage"
              defaultValue={packageValue}
              className="h-8 w-full rounded-xl border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              <option value="">Select a package</option>
              {packages.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <Field label="Budget range" name="budget" defaultValue={fields.budget} />
        <Field label="Timeline" name="timeline" defaultValue={fields.timeline} />
      </div>
      <Field label="Requirements" name="message" as="textarea" required defaultValue={fields.message} />
      <Field label="Anything else" name="additionalInfo" as="textarea" defaultValue={fields.additionalInfo} />
      <div className="space-y-2">
        <Label className="font-mono text-[11px] tracking-[0.16em] uppercase">Attachment</Label>
        <Input type="file" name="attachment" className="rounded-xl" />
      </div>
      <HumanCheck challenge={challenge} />
      {state && "error" in state ? <p className="text-sm text-destructive">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="h-11 rounded-full px-6">
        {pending ? "Sending…" : inquiryType === "product" ? "Request a demo" : "Request a quote"}
      </Button>
    </form>
  );
}

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletterAction, null);
  if (state && "ok" in state && state.ok) {
    return <p className="text-sm text-copper">You’re on the list.</p>;
  }
  return (
    <form action={action} className="flex gap-2">
      <Honeypot />
      <Input name="email" type="email" required placeholder="Work email" className="rounded-full" />
      <Button type="submit" disabled={pending} className="rounded-full">
        {pending ? "…" : "Join"}
      </Button>
    </form>
  );
}
