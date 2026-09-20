import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { getFooter, getNavigation, getSettings } from "@/lib/queries";
import { safe } from "@/lib/safe";
import type { FooterColumn, NavItem } from "@/types";

export const dynamic = "force-dynamic";

const fallbackNav: NavItem[] = [
  { id: "work", label: "Work", href: "/portfolio", order: 1, isEnabled: true },
  { id: "services", label: "Services", href: "/services", order: 2, isEnabled: true },
  { id: "products", label: "Products", href: "/products", order: 3, isEnabled: true },
  { id: "journal", label: "Journal", href: "/blog", order: 4, isEnabled: true },
  { id: "about", label: "Studio", href: "/about", order: 5, isEnabled: true },
];

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [nav, footer, settings] = await Promise.all([
    safe(getNavigation, null),
    safe(getFooter, null),
    safe(getSettings, null),
  ]);

  return (
    <>
      <SiteHeader items={(nav?.items as NavItem[]) || fallbackNav} />
      <main className="flex-1">{children}</main>
      <SiteFooter
        columns={((footer?.columns as FooterColumn[]) || []).length ? (footer!.columns as FooterColumn[]) : [
          { id: "s", title: "Studio", order: 1, links: [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
          { id: "l", title: "Legal", order: 2, links: [{ label: "Privacy", href: "/legal/privacy" }, { label: "Terms", href: "/legal/terms" }] },
        ]}
        copyright={footer?.copyright || settings?.copyright}
        newsletterEnabled={footer?.newsletterEnabled}
        newsletterHeading={footer?.newsletterHeading}
        newsletterBody={footer?.newsletterBody}
        email={settings?.email}
        address={settings?.address}
      />
    </>
  );
}
