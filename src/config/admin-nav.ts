import {
  BookOpen,
  Box,
  Briefcase,
  FileText,
  Home,
  ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Search,
  Settings,
  Workflow,
} from "lucide-react";

export const adminNav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  {
    label: "Website",
    icon: Home,
    items: [
      { href: "/admin/website/homepage", label: "Homepage" },
      { href: "/admin/website/navigation", label: "Navigation" },
      { href: "/admin/website/footer", label: "Footer" },
      { href: "/admin/settings", label: "Global settings" },
    ],
  },
  {
    label: "Services",
    icon: Workflow,
    items: [
      { href: "/admin/services", label: "All services" },
      { href: "/admin/services/new", label: "New service" },
    ],
  },
  {
    label: "SaaS products",
    icon: Box,
    items: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/products/new", label: "New product" },
    ],
  },
  {
    label: "Portfolio",
    icon: Briefcase,
    items: [
      { href: "/admin/portfolio", label: "Projects" },
      { href: "/admin/portfolio/new", label: "New project" },
    ],
  },
  {
    label: "Journal",
    icon: BookOpen,
    items: [
      { href: "/admin/blog", label: "Posts" },
      { href: "/admin/blog/new", label: "New post" },
      { href: "/admin/blog/taxonomies", label: "Categories & tags" },
    ],
  },
  {
    label: "Content",
    icon: FileText,
    items: [
      { href: "/admin/content/about", label: "About" },
      { href: "/admin/content/faqs", label: "FAQs" },
      { href: "/admin/content/testimonials", label: "Testimonials" },
      { href: "/admin/content/team", label: "Team" },
      { href: "/admin/content/technologies", label: "Technologies" },
    ],
  },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  {
    label: "SEO",
    icon: Search,
    items: [
      { href: "/admin/seo", label: "Global SEO" },
      { href: "/admin/legal", label: "Legal pages" },
    ],
  },
  {
    label: "Settings",
    icon: Settings,
    items: [
      { href: "/admin/settings/users", label: "Admin users" },
      { href: "/admin/settings/email", label: "Email" },
    ],
  },
] as const;
