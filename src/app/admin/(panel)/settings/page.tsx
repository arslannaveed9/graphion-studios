import { connectDb } from "@/lib/db";
import { SiteSettings } from "@/models";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { saveSettingsAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { JsonListField, SeoFields } from "@/components/admin/fields";
import { ImageField } from "@/components/admin/image-field";
import { serialize } from "@/lib/format";

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  await connectDb();
  const settings = serialize(await SiteSettings.findOne().lean());
  return (
    <div>
      <AdminHeader title="Global settings" />
      <form action={saveSettingsAction} className="grid max-w-2xl gap-4">
        <Input name="companyName" defaultValue={settings?.companyName} placeholder="Company name" className="rounded-none" />
        <Input name="tagline" defaultValue={settings?.tagline} placeholder="Tagline" className="rounded-none" />
        <div className="space-y-1">
          <ImageField name="logoLight" label="Logo (light mode)" defaultValue={settings?.logoLight} contain />
          <p className="text-xs text-muted-foreground">Used on light backgrounds. Darker mark recommended. Upload, then click Save settings.</p>
        </div>
        <div className="space-y-1">
          <ImageField name="logo" label="Logo (dark mode)" defaultValue={settings?.logo} contain />
          <p className="text-xs text-muted-foreground">Used on dark backgrounds. Lighter mark recommended. If only one logo is set, it is used for both modes.</p>
        </div>
        <div className="space-y-1">
          <ImageField name="favicon" label="Favicon" defaultValue={settings?.favicon} contain />
          <p className="text-xs text-muted-foreground">Browser tab icon. If empty, the dark-mode logo is used. Square PNG, SVG, or ICO works best. Upload, then click Save settings.</p>
        </div>
        <Input name="email" defaultValue={settings?.email} placeholder="Email" className="rounded-none" />
        <Input name="phone" defaultValue={settings?.phone} placeholder="Phone" className="rounded-none" />
        <Input name="whatsapp" defaultValue={settings?.whatsapp} placeholder="WhatsApp" className="rounded-none" />
        <Input name="address" defaultValue={settings?.address} placeholder="Address" className="rounded-none" />
        <Input name="businessHours" defaultValue={settings?.businessHours} placeholder="Hours" className="rounded-none" />
        <Input name="copyright" defaultValue={settings?.copyright} placeholder="Copyright" className="rounded-none" />
        <Input name="googleAnalyticsId" defaultValue={settings?.googleAnalyticsId} placeholder="GA ID" className="rounded-none" />
        <Input name="googleSiteVerification" defaultValue={settings?.googleSiteVerification} placeholder="Search Console verification" className="rounded-none" />
        <Textarea name="robotsExtra" defaultValue={settings?.robotsExtra} placeholder="Extra robots.txt" className="rounded-none" />
        <Textarea name="contactMapEmbed" defaultValue={settings?.contactMapEmbed} placeholder="Map embed HTML" className="rounded-none" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="sitemapEnabled" defaultChecked={settings?.sitemapEnabled !== false} /> Sitemap enabled
        </label>
        <JsonListField
          name="socialLinks"
          label="Social links"
          value={(settings?.socialLinks as Array<Record<string, string>>) || []}
          keys={[
            { key: "platform", label: "Platform" },
            { key: "url", label: "URL" },
          ]}
        />
        <SeoFields seo={settings?.defaultSeo as Record<string, unknown>} />
        <Button className="rounded-full">Save settings</Button>
      </form>
    </div>
  );
}
