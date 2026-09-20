import type { Metadata } from "next";
import { ContactForm } from "@/components/site/inquiry-form";
import { Section, SectionIntro } from "@/components/site/section";
import { getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import { createCaptchaChallenge } from "@/lib/captcha";
import { safe } from "@/lib/safe";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: "Start a working session with Graphion Studios.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await safe(getSettings, null);
  return (
    <Section className="pt-16 md:pt-24">
      <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0">
          <SectionIntro
            kicker="Contact"
            heading="Bring the operational problem."
            subheading="A working session is usually enough to know if we are the right studio."
          />
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="surface p-4">
              <dt className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">Email</dt>
              <dd className="mt-2 text-sm">{settings?.email}</dd>
            </div>
            <div className="surface p-4">
              <dt className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">Phone</dt>
              <dd className="mt-2 text-sm">{settings?.phone}</dd>
            </div>
            <div className="surface p-4">
              <dt className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">Studio</dt>
              <dd className="mt-2 text-sm">{settings?.address}</dd>
            </div>
            <div className="surface p-4">
              <dt className="text-xs font-semibold tracking-[0.16em] text-copper uppercase">Hours</dt>
              <dd className="mt-2 text-sm">{settings?.businessHours}</dd>
            </div>
          </dl>
        </div>
        <div className="min-w-0">
          <ContactForm captcha={createCaptchaChallenge()} />
        </div>
      </div>
    </Section>
  );
}
