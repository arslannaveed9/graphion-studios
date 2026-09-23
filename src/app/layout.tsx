import type { Metadata } from "next";
import { Geist_Mono, Outfit, Syne } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { brand } from "@/config/site";
import { getSettings } from "@/lib/queries";
import { buildMetadata, jsonLd } from "@/lib/seo";
import { safe } from "@/lib/safe";
import "./globals.css";

export const dynamic = "force-dynamic";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await safe(getSettings, null);
  const seo = (settings?.defaultSeo || {}) as { title?: string; description?: string; ogImage?: string };
  const icon = settings?.favicon || settings?.logo;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
    ...buildMetadata({
      title: seo.title || `${brand.name} — ${brand.tagline}`,
      description: seo.description || brand.description,
      path: "/",
      image: seo.ogImage,
    }),
    title: {
      default: seo.title || `${brand.name} — ${brand.tagline}`,
      template: `%s · ${settings?.companyName || brand.name}`,
    },
    icons: icon
      ? {
          icon: [{ url: icon }],
          shortcut: icon,
          apple: [{ url: icon }],
        }
      : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await safe(getSettings, null);
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.companyName || brand.name,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logo: settings?.logo,
    email: settings?.email,
    telephone: settings?.phone,
    address: settings?.address,
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings?.companyName || brand.name,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/search?q={query}`,
      "query-input": "required name=query",
    },
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${outfit.variable} ${syne.variable} ${geistMono.variable} h-full`}
    >
      <head>
        {settings?.googleSiteVerification ? (
          <meta name="google-site-verification" content={settings.googleSiteVerification} />
        ) : null}
        {settings?.googleAnalyticsId ? (
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
          />
        ) : null}
        {settings?.googleAnalyticsId ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${settings.googleAnalyticsId}');`,
            }}
          />
        ) : null}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(org) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(website) }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
