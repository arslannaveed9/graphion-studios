"use server";

import { headers } from "next/headers";
import { connectDb } from "@/lib/db";
import { Lead } from "@/models/lead";
import { NewsletterSubscriber } from "@/models/ops";
import { Service } from "@/models/service";
import { SaaSProduct } from "@/models/saas-product";
import { contactSchema, inquirySchema, newsletterSchema } from "@/lib/validators";
import { clientIp, enforceRateLimit } from "@/lib/rate-limit";
import { getEmailConfig, inquiryEmailHtml, sendEmail } from "@/lib/email";
import { uploadMediaFile } from "@/lib/media";
import { createCaptchaChallenge, verifyCaptcha, type CaptchaChallenge } from "@/lib/captcha";

export type { CaptchaChallenge };

export type PublicFormState =
  | { ok: true }
  | { error: string; captcha: CaptchaChallenge; fields?: Record<string, string> };

function honeypotTripped(formData: FormData) {
  const website = String(formData.get("website") || "");
  return website.trim().length > 0;
}

function formFields(formData: FormData) {
  const fields: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (
      typeof value === "string" &&
      key !== "website" &&
      key !== "captchaToken" &&
      key !== "captchaAnswer" &&
      key !== "attachment"
    ) {
      fields[key] = value;
    }
  }
  return fields;
}

function captchaFailed(formData: FormData): PublicFormState | null {
  const token = String(formData.get("captchaToken") || "");
  const answer = String(formData.get("captchaAnswer") || "");
  if (verifyCaptcha(token, answer)) return null;
  return {
    error: "Complete the human verification to send this form.",
    captcha: createCaptchaChallenge(),
    fields: formFields(formData),
  };
}

function formError(message: string, formData?: FormData): PublicFormState {
  return {
    error: message,
    captcha: createCaptchaChallenge(),
    fields: formData ? formFields(formData) : undefined,
  };
}

export async function submitContactAction(_: unknown, formData: FormData): Promise<PublicFormState> {
  if (honeypotTripped(formData)) return { ok: true };

  const failed = captchaFailed(formData);
  if (failed) return failed;

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    message: formData.get("message"),
  });
  if (!parsed.success) {
    return formError("Please complete the required fields.", formData);
  }

  const ip = clientIp(await headers());
  const limit = await enforceRateLimit(`form:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) return formError("Too many submissions. Please wait and try again.", formData);

  await connectDb();
  await Lead.create({
    ...parsed.data,
    inquiryType: "contact",
    status: "new",
    source: "contact-page",
    ip,
  });

  const config = await getEmailConfig();
  if (config.notifyOnContact && config.notifyEmail) {
    await sendEmail({
      to: config.notifyEmail,
      subject: `New contact from ${parsed.data.name}`,
      replyTo: parsed.data.email,
      html: inquiryEmailHtml({
        title: "New contact submission",
        fields: parsed.data,
      }),
    }).catch(() => undefined);
  }

  if (config.sendCustomerConfirmation) {
    await sendEmail({
      to: parsed.data.email,
      subject: "We received your message — Graphion Studios",
      html: inquiryEmailHtml({
        title: "Thanks — we’ll be in touch",
        fields: {
          Name: parsed.data.name,
          Note: "Our team reviews every enquiry personally. Expect a reply within one business day.",
        },
      }),
    }).catch(() => undefined);
  }

  return { ok: true };
}

export async function submitInquiryAction(_: unknown, formData: FormData): Promise<PublicFormState> {
  if (honeypotTripped(formData)) return { ok: true };

  const failed = captchaFailed(formData);
  if (failed) return failed;

  const parsed = inquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    company: formData.get("company"),
    message: formData.get("message") || formData.get("requirements"),
    serviceSlug: formData.get("serviceSlug"),
    productSlug: formData.get("productSlug"),
    selectedPackage: formData.get("selectedPackage"),
    projectType: formData.get("projectType"),
    budget: formData.get("budget"),
    timeline: formData.get("timeline"),
    additionalInfo: formData.get("additionalInfo"),
    inquiryType: formData.get("inquiryType") || "service",
  });
  if (!parsed.success) {
    return formError("Please complete the required fields.", formData);
  }

  const ip = clientIp(await headers());
  const limit = await enforceRateLimit(`inquiry:${ip}`, 6, 10 * 60 * 1000);
  if (!limit.ok) return formError("Too many submissions. Please wait and try again.", formData);

  const isProduct = parsed.data.inquiryType === "product";
  const isService = parsed.data.inquiryType === "service" || parsed.data.inquiryType === "custom_project";

  if (isService && !parsed.data.serviceSlug) {
    return formError("This enquiry must be submitted from a service page.", formData);
  }
  if (isProduct && !parsed.data.productSlug) {
    return formError("This enquiry must be submitted from a product page.", formData);
  }

  await connectDb();
  const service = isService && parsed.data.serviceSlug
    ? await Service.findOne({ slug: parsed.data.serviceSlug }).select("_id name slug").lean()
    : null;
  const product = isProduct && parsed.data.productSlug
    ? await SaaSProduct.findOne({ slug: parsed.data.productSlug }).select("_id name slug").lean()
    : null;

  if (isService && !service) {
    return formError("This service enquiry could not be matched. Refresh the page and try again.", formData);
  }
  if (isProduct && !product) {
    return formError("This product enquiry could not be matched. Refresh the page and try again.", formData);
  }

  let attachmentUrl: string | undefined;
  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    const media = await uploadMediaFile(file, { alt: `${parsed.data.name} attachment` });
    attachmentUrl = media.url;
  }

  const source = service
    ? `service:${service.slug}`
    : product
      ? `product:${product.slug}`
      : parsed.data.inquiryType;

  await Lead.create({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    company: parsed.data.company,
    message: parsed.data.message,
    inquiryType: parsed.data.inquiryType,
    selectedPackage: parsed.data.selectedPackage,
    projectType: parsed.data.projectType || service?.name || product?.name,
    budget: parsed.data.budget,
    timeline: parsed.data.timeline,
    additionalInfo: parsed.data.additionalInfo,
    service: service?._id,
    product: product?._id,
    attachmentUrl,
    status: "new",
    source,
    ip,
  });

  const config = await getEmailConfig();
  if (config.notifyOnInquiry && config.notifyEmail) {
    await sendEmail({
      to: config.notifyEmail,
      subject: `New ${parsed.data.inquiryType.replace("_", " ")} — ${service?.name || product?.name || parsed.data.name}`,
      replyTo: parsed.data.email,
      html: inquiryEmailHtml({
        title: "New project enquiry",
        fields: {
          Name: parsed.data.name,
          Email: parsed.data.email,
          Phone: parsed.data.phone,
          Company: parsed.data.company,
          Service: service?.name,
          Product: product?.name,
          Package: parsed.data.selectedPackage,
          Budget: parsed.data.budget,
          Timeline: parsed.data.timeline,
          Source: source,
          Message: parsed.data.message,
        },
      }),
    }).catch(() => undefined);
  }

  return { ok: true };
}

export async function subscribeNewsletterAction(_: unknown, formData: FormData) {
  if (honeypotTripped(formData)) return { ok: true };
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
  });
  if (!parsed.success) return { error: "Enter a valid email address." };

  const ip = clientIp(await headers());
  const limit = await enforceRateLimit(`newsletter:${ip}`, 8, 10 * 60 * 1000);
  if (!limit.ok) return { error: "Too many attempts." };

  await connectDb();
  await NewsletterSubscriber.findOneAndUpdate(
    { email: parsed.data.email.toLowerCase() },
    {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      status: "subscribed",
      subscribedAt: new Date(),
    },
    { upsert: true },
  );
  return { ok: true };
}
