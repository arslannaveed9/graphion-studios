import { config } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

config({ path: ".env.local" });
config({ path: ".env" });

import { AdminUser } from "../src/models/admin-user";
import { Service } from "../src/models/service";
import { SaaSProduct } from "../src/models/saas-product";
import { PortfolioProject } from "../src/models/portfolio-project";
import { Author, BlogCategory, BlogPost, BlogTag } from "../src/models/blog";
import { TeamMember } from "../src/models/team-member";
import { Testimonial } from "../src/models/testimonial";
import { FAQ } from "../src/models/faq";
import { Technology } from "../src/models/technology";
import { Page } from "../src/models/page";
import { AboutPage, Footer, Homepage, Navigation } from "../src/models/site-content";
import { EmailSettings, SiteSettings } from "../src/models/settings";
import { SearchDocument } from "../src/models/ops";

const img = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const IMAGES = {
  office: img("photo-1497366216548-37526070297c"),
  board: img("photo-1556761175-5973dc0f32e7"),
  code: img("photo-1515879218367-8466d910aaa4"),
  dashboard: img("photo-1551288049-bebda4e38f71"),
  mobile: img("photo-1512941937669-90a1b58e7e9c"),
  cloud: img("photo-1451187580459-43490279c0fa"),
  commerce: img("photo-1556742049-0cfed4f6a45d"),
  ai: img("photo-1677442136019-21780ecad995"),
  meeting: img("photo-1600880292203-757bb62b4baf"),
  portrait1: img("photo-1544005313-94ddf0286df2", 800),
  portrait2: img("photo-1506794778202-cad84cf45f1d", 800),
  portrait3: img("photo-1573496359142-b8d87734a5a2", 800),
  portrait4: img("photo-1472099645785-5658abf4ff4e", 800),
};

function plan(
  name: string,
  price: number | null,
  extras: Partial<{
    recommended: boolean;
    custom: boolean;
    features: string[];
    notIncluded: string[];
    label: string;
    billing: string;
    order: number;
  }>,
) {
  return {
    name,
    price,
    currency: "USD",
    billingType: extras.billing || (price === null ? "custom" : "one_time"),
    customPriceLabel: extras.label,
    isCustom: extras.custom || price === null,
    isRecommended: extras.recommended || false,
    isEnabled: true,
    features: extras.features || [],
    notIncluded: extras.notIncluded || [],
    ctaText: price === null ? "Talk to us" : "Start this engagement",
    ctaHref: "/contact",
    order: extras.order || 0,
  };
}

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  await Promise.all([
    AdminUser.deleteMany({}),
    Service.deleteMany({}),
    SaaSProduct.deleteMany({}),
    PortfolioProject.deleteMany({}),
    BlogPost.deleteMany({}),
    BlogCategory.deleteMany({}),
    BlogTag.deleteMany({}),
    Author.deleteMany({}),
    TeamMember.deleteMany({}),
    Testimonial.deleteMany({}),
    FAQ.deleteMany({}),
    Technology.deleteMany({}),
    Page.deleteMany({}),
    AboutPage.deleteMany({}),
    Footer.deleteMany({}),
    Homepage.deleteMany({}),
    Navigation.deleteMany({}),
    SiteSettings.deleteMany({}),
    EmailSettings.deleteMany({}),
    SearchDocument.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || "ChangeMeNow!2026", 12);
  await AdminUser.create({
    name: process.env.ADMIN_NAME || "Graphion Admin",
    email: (process.env.ADMIN_EMAIL || "admin@graphion.studio").toLowerCase(),
    passwordHash,
    role: "super_admin",
    isActive: true,
  });

  const services = await Service.insertMany([
    {
      name: "Web Platforms",
      slug: "web-platforms",
      icon: "LayoutDashboard",
      heroImage: IMAGES.office,
      shortDescription: "High-performance web platforms designed for complex operations, not brochure sites.",
      fullDescription:
        "<p>We design and engineer web platforms that become the operating layer of a business — customer portals, partner networks, internal tools, and public products with serious traffic and serious rules.</p>",
      problem: "Most companies outgrow a marketing site long before they have a real product architecture.",
      solution: "We treat the web as infrastructure: information architecture, design systems, APIs, and operational tooling in one engagement.",
      features: [
        { title: "Product-grade frontends", description: "App Router, design systems, accessibility, and performance budgets." },
        { title: "Domain modelling", description: "Clear data models so the product can grow without a rewrite." },
        { title: "Integrations", description: "Payments, identity, CRMs, ERPs, and internal services." },
      ],
      benefits: [
        { title: "Ownership", description: "You own the codebase, the content model, and the roadmap." },
        { title: "Speed to value", description: "Ship a first useful slice, then compound." },
      ],
      technologies: ["Next.js", "TypeScript", "Node.js", "MongoDB", "PostgreSQL"],
      process: [
        { title: "Discover", description: "Map users, constraints, and the operational reality." },
        { title: "Architect", description: "Information architecture, stack, and delivery plan." },
        { title: "Build", description: "Iterative delivery with demos every sprint." },
        { title: "Harden", description: "Testing, observability, and launch." },
      ],
      pricingPlans: [
        plan("Foundation", 18000, { order: 1, features: ["IA + design system", "Core pages and CMS", "Launch support"] }),
        plan("Platform", 42000, { order: 2, recommended: true, features: ["Custom app surfaces", "Integrations", "Admin + roles", "Performance work"] }),
        plan("Enterprise", null, { order: 3, custom: true, label: "Custom", features: ["Dedicated team", "SLA", "Security reviews"] }),
      ],
      enableCustomProject: true,
      customProjectHeading: "Need a different shape of platform?",
      customProjectBody: "Tell us the operational problem. We’ll propose an architecture and a first release.",
      customProjectCta: "Request a custom quote",
      faqs: [
        { question: "Do you rebuild existing sites?", answer: "Yes. We migrate when the current stack is blocking growth, and we keep SEO equity in the move." },
        { question: "Can non-technical teams manage content?", answer: "That’s the default. The admin you see on this site is the same class of system we build for clients." },
      ],
      status: "published",
      featured: true,
      order: 1,
      seo: { title: "Web Platforms — Graphion Studios", description: "Custom web platforms, portals, and product-grade websites." },
      publishedAt: new Date(),
    },
    {
      name: "Product Engineering",
      slug: "product-engineering",
      icon: "Cpu",
      heroImage: IMAGES.code,
      shortDescription: "A senior engineering team that can own a product from prototype to production.",
      fullDescription: "<p>Embedded product engineering for companies that need more than staff augmentation — architecture, delivery, and the judgement to say no.</p>",
      problem: "Hiring a full product org is slow. Agencies often ship screens, not systems.",
      solution: "A compact senior team that covers product, design, and engineering with a single accountable lead.",
      features: [
        { title: "Roadmapping", description: "Sequence work by risk and revenue, not by who shouted last." },
        { title: "Full-stack delivery", description: "Frontend, APIs, data, and cloud as one unit." },
      ],
      benefits: [{ title: "Continuity", description: "The people who design it stay to operate it." }],
      technologies: ["TypeScript", "Node.js", "Python", "AWS", "Docker"],
      process: [
        { title: "Shape", description: "Problem framing and constraints." },
        { title: "Build", description: "Thin slices, production quality." },
        { title: "Operate", description: "Metrics, incidents, and iteration." },
      ],
      pricingPlans: [
        plan("Sprint pod", 28000, { order: 1, billing: "monthly", features: ["2–3 senior engineers", "Weekly demos", "Slack-first"] }),
        plan("Product squad", 52000, { order: 2, recommended: true, billing: "monthly", features: ["Eng + design + PM", "On-call option"] }),
        plan("Dedicated", null, { order: 3, label: "Custom", features: ["Named team", "Quarterly planning"] }),
      ],
      enableCustomProject: true,
      customProjectHeading: "Need a squad with a different mix?",
      customProjectBody: "We staff against the problem, not a fixed package.",
      customProjectCta: "Request a custom quote",
      faqs: [{ question: "Do you work in our repos?", answer: "Yes. We prefer your Git, your cloud, your identity provider." }],
      status: "published",
      featured: true,
      order: 2,
      seo: { title: "Product Engineering — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Mobile Applications",
      slug: "mobile-applications",
      icon: "Smartphone",
      heroImage: IMAGES.mobile,
      shortDescription: "Native-quality mobile products for iOS and Android, with the backend to match.",
      fullDescription: "<p>We ship mobile products that feel considered: offline-aware, fast, and connected to the same systems your teams already run.</p>",
      features: [
        { title: "Cross-platform", description: "React Native or Flutter when it is the honest choice." },
        { title: "Store-ready", description: "Review, analytics, push, and release trains." },
      ],
      benefits: [{ title: "One product, two stores", description: "Shared domain logic without a lowest-common-denominator UI." }],
      technologies: ["React Native", "Flutter", "Swift", "Kotlin"],
      process: [
        { title: "Flows", description: "Critical user journeys first." },
        { title: "Build", description: "Weekly TestFlight / internal tracks." },
        { title: "Launch", description: "Store, monitoring, iteration." },
      ],
      pricingPlans: [
        plan("MVP", 36000, { order: 1, features: ["Core journeys", "API integration", "Store submission"] }),
        plan("Product", 64000, { order: 2, recommended: true, features: ["Design system", "Push & analytics", "Admin"] }),
        plan("Programme", null, { order: 3, label: "Custom" }),
      ],
      enableCustomProject: true,
      faqs: [{ question: "Native or cross-platform?", answer: "We choose based on UX constraints, team, and how long the product must live." }],
      status: "published",
      featured: true,
      order: 3,
      seo: { title: "Mobile Applications — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "SaaS Product Development",
      slug: "saas-development",
      icon: "Boxes",
      heroImage: IMAGES.dashboard,
      shortDescription: "Multi-tenant SaaS products with billing, roles, onboarding, and the unglamorous parts that make software sellable.",
      fullDescription: "<p>We have shipped our own products. That changes how we build yours — tenancy, metering, admin, and support tooling are first-class.</p>",
      features: [
        { title: "Tenancy & auth", description: "Roles, invitations, SSO-ready architecture." },
        { title: "Billing-ready", description: "Plans, trials, usage — wired for Stripe when you need it." },
      ],
      benefits: [{ title: "Sellable software", description: "Not a demo. An actual product with an operations surface." }],
      technologies: ["Next.js", "MongoDB", "Stripe", "AWS"],
      process: [
        { title: "Position", description: "Who it is for, what it replaces." },
        { title: "Core loop", description: "The job the product does every week." },
        { title: "Expand", description: "Plans, teams, integrations." },
      ],
      pricingPlans: [
        plan("Launch", 48000, { order: 1, features: ["Auth", "Core product", "Admin", "Basic billing"] }),
        plan("Scale", 88000, { order: 2, recommended: true, features: ["Teams", "Usage", "Integrations"] }),
        plan("Custom", null, { order: 3, label: "Talk to us" }),
      ],
      enableCustomProject: true,
      faqs: [{ question: "Can you take over an existing SaaS?", answer: "Yes. We start with an architecture review, then a 90-day delivery plan." }],
      status: "published",
      featured: true,
      order: 4,
      seo: { title: "SaaS Product Development — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Cloud & DevOps",
      slug: "cloud-devops",
      icon: "Cloud",
      heroImage: IMAGES.cloud,
      shortDescription: "Infrastructure that is boring in the best way: observable, repeatable, and cheap enough to sleep.",
      fullDescription: "<p>We design cloud platforms, CI/CD, and runtime practices so shipping is a habit, not a ceremony.</p>",
      features: [
        { title: "IaC", description: "Environments you can recreate, not snowflake servers." },
        { title: "Delivery", description: "Preview deploys, guarded production, rollback." },
      ],
      technologies: ["AWS", "Docker", "Kubernetes", "GitHub Actions", "Terraform"],
      process: [
        { title: "Assess", description: "Runtime, cost, and risk." },
        { title: "Platform", description: "Pipelines and environments." },
        { title: "Operate", description: "Alerts that mean something." },
      ],
      pricingPlans: [
        plan("Stabilise", 14000, { order: 1, features: ["CI/CD", "Observability baseline"] }),
        plan("Platform", 32000, { order: 2, recommended: true, features: ["IaC", "Preview envs", "Hardening"] }),
        plan("Retainer", null, { order: 3, label: "Monthly", billing: "monthly" }),
      ],
      enableCustomProject: true,
      status: "published",
      featured: false,
      order: 5,
      seo: { title: "Cloud & DevOps — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Applied AI",
      slug: "applied-ai",
      icon: "Sparkles",
      heroImage: IMAGES.ai,
      shortDescription: "AI features that sit inside real workflows — retrieval, agents, and evaluation, not a chatbot bolted on.",
      fullDescription: "<p>We add AI where it changes cycle time or quality, with evaluation so you know if it is actually working.</p>",
      features: [
        { title: "Workflow AI", description: "Assist, extract, route, draft — with a human in the loop." },
        { title: "Evaluation", description: "Offline tests and production traces." },
      ],
      technologies: ["Python", "TypeScript", "OpenAI", "pgvector"],
      process: [
        { title: "Use case", description: "Where latency and error cost actually matter." },
        { title: "Prototype", description: "A thin slice with measurement." },
        { title: "Productise", description: "Permissions, logging, fallbacks." },
      ],
      pricingPlans: [
        plan("Discovery", 12000, { order: 1, features: ["Opportunity map", "Risk review"] }),
        plan("Pilot", 38000, { order: 2, recommended: true, features: ["Working feature", "Eval harness"] }),
        plan("Programme", null, { order: 3, label: "Custom" }),
      ],
      enableCustomProject: true,
      status: "published",
      featured: false,
      order: 6,
      seo: { title: "Applied AI — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Commerce Systems",
      slug: "commerce-systems",
      icon: "ShoppingBag",
      heroImage: IMAGES.commerce,
      shortDescription: "Storefronts and commerce backends that can handle catalogue complexity, not just a theme.",
      fullDescription: "<p>Headless and custom commerce for brands that have outgrown a template and need operations, not just a prettier cart.</p>",
      features: [{ title: "Headless storefronts", description: "Speed, merchandising, and content as one system." }],
      technologies: ["Next.js", "Shopify", "Stripe", "MongoDB"],
      process: [
        { title: "Catalogue", description: "The real product model." },
        { title: "Checkout", description: "Payments, tax, fulfilment." },
        { title: "Operate", description: "Merch tools and reporting." },
      ],
      pricingPlans: [
        plan("Storefront", 24000, { order: 1, features: ["Design + build", "CMS", "Checkout"] }),
        plan("Commerce ops", 54000, { order: 2, recommended: true, features: ["Custom admin", "ERP hooks"] }),
        plan("Enterprise", null, { order: 3, label: "Custom" }),
      ],
      enableCustomProject: true,
      status: "published",
      featured: false,
      order: 7,
      seo: { title: "Commerce Systems — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Care & Evolution",
      slug: "care-evolution",
      icon: "Wrench",
      heroImage: IMAGES.meeting,
      shortDescription: "Retained engineering for products that are live and still changing.",
      fullDescription: "<p>After launch is when most software dies. We stay — incidents, small bets, and the unglamorous work of keeping systems honest.</p>",
      features: [{ title: "Retainer", description: "A named engineer, a backlog, and a monthly review." }],
      technologies: ["Whatever you already run"],
      process: [
        { title: "Triage", description: "What is actually on fire." },
        { title: "Rhythm", description: "A cadence of change." },
        { title: "Improve", description: "Pay down the debt that is costing you." },
      ],
      pricingPlans: [
        plan("Care", 6000, { order: 1, billing: "monthly", features: ["Up to 20 hours", "SLA lite"] }),
        plan("Evolution", 14000, { order: 2, recommended: true, billing: "monthly", features: ["Dedicated hours", "Roadmap"] }),
        plan("On-site mix", null, { order: 3, label: "Custom" }),
      ],
      enableCustomProject: true,
      status: "published",
      featured: false,
      order: 8,
      seo: { title: "Care & Evolution — Graphion Studios" },
      publishedAt: new Date(),
    },
  ]);

  const products = await SaaSProduct.insertMany([
    {
      name: "Ledgerline",
      slug: "ledgerline",
      logo: "",
      heroImage: IMAGES.dashboard,
      shortDescription: "An operations ledger for service businesses that still run on spreadsheets and Slack.",
      fullDescription:
        "<p>Ledgerline is our internal-grade operations product: jobs, retainers, utilisation, and a single place finance and delivery can agree.</p>",
      screenshots: [IMAGES.dashboard, IMAGES.board],
      features: [
        { title: "Delivery ledger", description: "Work, time, and outcomes in one timeline." },
        { title: "Client rooms", description: "A quiet surface for status that is not a status meeting." },
      ],
      benefits: [{ title: "Fewer surprises", description: "Utilisation and margin visible before month-end." }],
      targetAudience: ["Agencies", "Consultancies", "Product studios"],
      useCases: [{ title: "Retainer visibility", description: "See remaining hours before someone over-delivers." }],
      pricingPlans: [
        plan("Studio", 89, { order: 1, billing: "monthly", features: ["3 seats", "Projects", "Invoices"] }),
        plan("Firm", 219, { order: 2, recommended: true, billing: "monthly", features: ["Unlimited seats", "Utilisation", "SSO soon"] }),
        plan("Enterprise", null, { order: 3, billing: "contact", label: "Contact sales" }),
      ],
      integrations: ["Slack", "Google Workspace", "Stripe"],
      technologies: ["Next.js", "MongoDB"],
      faqs: [{ question: "Is this generally available?", answer: "Ledgerline is in controlled rollout. Request a demo and we’ll qualify fit." }],
      ctaLabel: "Request a demo",
      ctaHref: "/contact",
      demoUrl: "/contact",
      featured: true,
      status: "published",
      order: 1,
      seo: { title: "Ledgerline — Operations software by Graphion" },
      publishedAt: new Date(),
    },
    {
      name: "Relaydesk",
      slug: "relaydesk",
      heroImage: IMAGES.board,
      shortDescription: "Support orchestration for teams who have outgrown a shared inbox.",
      fullDescription: "<p>Relaydesk routes, drafts, and tracks customer conversations with the same seriousness as a product backlog.</p>",
      screenshots: [IMAGES.board],
      features: [{ title: "Queues with owners", description: "Not a pile. A system." }],
      benefits: [{ title: "Faster first response", description: "Without pretending a bot is your brand." }],
      targetAudience: ["SaaS support teams"],
      useCases: [{ title: "Tiered support", description: "L1 drafts, L2 owns." }],
      pricingPlans: [
        plan("Team", 49, { order: 1, billing: "monthly", features: ["3 inboxes"] }),
        plan("Scale", 129, { order: 2, recommended: true, billing: "monthly", features: ["AI drafts", "SLA"] }),
        plan("Custom", null, { order: 3, billing: "contact", label: "Contact sales" }),
      ],
      integrations: ["Gmail", "Intercom"],
      technologies: ["Next.js", "TypeScript"],
      ctaLabel: "Talk to product",
      ctaHref: "/contact",
      featured: true,
      status: "published",
      order: 2,
      seo: { title: "Relaydesk — Support orchestration" },
      publishedAt: new Date(),
    },
    {
      name: "Northframe",
      slug: "northframe",
      heroImage: IMAGES.cloud,
      shortDescription: "A lightweight analytics layer for product teams who do not need another warehouse project.",
      fullDescription: "<p>Northframe sits on the events you already have and answers the five questions leadership actually asks.</p>",
      screenshots: [IMAGES.cloud],
      features: [{ title: "Opinionated dashboards", description: "Activation, retention, revenue — not 400 tiles." }],
      benefits: [{ title: "Hours not quarters", description: "Useful in a week, not a transformation programme." }],
      targetAudience: ["Product-led companies"],
      useCases: [{ title: "Board pack", description: "A truthful weekly snapshot." }],
      pricingPlans: [
        plan("Core", 199, { order: 1, billing: "monthly" }),
        plan("Org", 499, { order: 2, recommended: true, billing: "monthly" }),
        plan("Custom", null, { order: 3, billing: "contact", label: "Contact sales" }),
      ],
      integrations: ["Segment", "BigQuery"],
      technologies: ["TypeScript", "Python"],
      ctaLabel: "Request access",
      ctaHref: "/contact",
      featured: false,
      status: "published",
      order: 3,
      seo: { title: "Northframe — Product analytics without the warehouse theatre" },
      publishedAt: new Date(),
    },
  ]);

  const projects = await PortfolioProject.insertMany([
    {
      name: "Harbor Mutual Portal",
      slug: "harbor-mutual-portal",
      client: "Harbor Mutual",
      industry: "Insurance",
      summary: "A claims and broker portal that replaced three legacy tools and a weekly spreadsheet ritual.",
      description: "<p>We rebuilt Harbor Mutual’s broker-facing platform as a single authenticated product with claims status, document exchange, and role-aware admin.</p>",
      heroImage: IMAGES.office,
      images: [IMAGES.office, IMAGES.dashboard],
      technologies: ["Next.js", "MongoDB", "AWS"],
      results: [
        { label: "Time to quote", value: "−41%" },
        { label: "Broker tickets", value: "−28%" },
      ],
      challenges: "Three systems, inconsistent identity, and an operations team who could not wait for a 12-month programme.",
      solution: "A strangler migration: identity first, then claims, then documents, with brokers on the new surface within 14 weeks.",
      testimonialQuote: "They treated our operations people as the customer. That is rarer than good code.",
      testimonialAuthor: "Priya N., COO",
      featured: true,
      status: "published",
      order: 1,
      seo: { title: "Harbor Mutual Portal — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Kitefield Commerce",
      slug: "kitefield-commerce",
      client: "Kitefield",
      industry: "Retail",
      summary: "A headless storefront and merchandising admin for a brand expanding into three markets.",
      description: "<p>Custom storefront performance with a merch calendar and localisation that marketing could actually run.</p>",
      heroImage: IMAGES.commerce,
      images: [IMAGES.commerce],
      technologies: ["Next.js", "Shopify", "Stripe"],
      results: [
        { label: "LCP", value: "1.4s" },
        { label: "Conversion", value: "+18%" },
      ],
      challenges: "Theme debt and a catalogue model that lied about variants.",
      solution: "New product model, new storefront, merch tools that match how the team already worked.",
      featured: true,
      status: "published",
      order: 2,
      seo: { title: "Kitefield Commerce — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Northwind Field App",
      slug: "northwind-field-app",
      client: "Northwind Energy",
      industry: "Energy",
      summary: "An offline-first mobile app for field engineers with a dispatch console in the office.",
      description: "<p>Jobs, parts, photos, and signatures that sync when the radio does.</p>",
      heroImage: IMAGES.mobile,
      images: [IMAGES.mobile],
      technologies: ["React Native", "Node.js", "AWS"],
      results: [{ label: "Paper forms", value: "retired" }],
      challenges: "Intermittent connectivity and a workforce that will not tolerate a cute UI.",
      solution: "Offline queue, large tap targets, and a dispatch board that operations already understood.",
      featured: true,
      status: "published",
      order: 3,
      seo: { title: "Northwind Field App — Graphion Studios" },
      publishedAt: new Date(),
    },
    {
      name: "Aperture Analytics",
      slug: "aperture-analytics",
      client: "Aperture",
      industry: "SaaS",
      summary: "A product analytics slice that answered five board questions without a warehouse programme.",
      description: "<p>We instrumented the product, defined events honestly, and shipped a weekly operating review.</p>",
      heroImage: IMAGES.cloud,
      images: [IMAGES.cloud],
      technologies: ["TypeScript", "Python", "BigQuery"],
      results: [{ label: "Time to insight", value: "days, not quarters" }],
      featured: false,
      status: "published",
      order: 4,
      seo: { title: "Aperture Analytics — Graphion Studios" },
      publishedAt: new Date(),
    },
  ]);

  const author = await Author.create({
    name: "Maya Ellison",
    slug: "maya-ellison",
    role: "Editorial / Engineering",
    bio: "Writes about delivery systems, product architecture, and the unfashionable parts of shipping.",
    avatar: IMAGES.portrait3,
  });
  const catEng = await BlogCategory.create({ name: "Engineering", slug: "engineering" });
  const catProduct = await BlogCategory.create({ name: "Product", slug: "product" });
  const tagDelivery = await BlogTag.create({ name: "Delivery", slug: "delivery" });
  const tagArchitecture = await BlogTag.create({ name: "Architecture", slug: "architecture" });

  await BlogPost.insertMany([
    {
      title: "Stop designing pages. Start designing systems of record.",
      slug: "systems-of-record",
      excerpt: "A website is not a stack of sections. It is a contract between operations, customers, and the people who have to change it on a Tuesday.",
      content: "<p>Most rebuilds fail because they start with a homepage. We start with the objects the business already argues about: jobs, policies, SKUs, tenants.</p><h2>What changes</h2><p>When those objects are modelled, pages become cheap. When they are not, every new page is a negotiation.</p>",
      featuredImage: IMAGES.office,
      author: author._id,
      category: catEng._id,
      tags: [tagArchitecture._id],
      status: "published",
      featured: true,
      publishedAt: new Date("2026-04-12"),
      readingMinutes: 6,
      seo: { title: "Systems of record — Graphion Journal" },
    },
    {
      title: "The first ninety days of a SaaS you actually intend to sell",
      slug: "first-ninety-days-of-saas",
      excerpt: "Auth, tenancy, billing, and an admin are not phase two. They are how you discover whether you have a product.",
      content: "<p>A demo with a hardcoded user is a sketch. A product is what happens when a second company signs in.</p>",
      featuredImage: IMAGES.dashboard,
      author: author._id,
      category: catProduct._id,
      tags: [tagDelivery._id],
      status: "published",
      featured: true,
      publishedAt: new Date("2026-05-03"),
      readingMinutes: 7,
      seo: { title: "First ninety days of SaaS — Graphion Journal" },
    },
    {
      title: "Performance is a product decision",
      slug: "performance-is-a-product-decision",
      excerpt: "Core Web Vitals are not a Lighthouse score. They are whether a broker waits or opens a competitor tab.",
      content: "<p>We treat performance budgets as acceptance criteria, same as a failing test.</p>",
      featuredImage: IMAGES.code,
      author: author._id,
      category: catEng._id,
      tags: [tagDelivery._id],
      status: "published",
      publishedAt: new Date("2026-06-18"),
      readingMinutes: 5,
      seo: { title: "Performance is a product decision — Graphion Journal" },
    },
    {
      title: "How we run discovery without a theatre of sticky notes",
      slug: "discovery-without-theatre",
      excerpt: "Talk to the people who do the work. Watch the ugly tools. Write down the constraints. Then decide.",
      content: "<p>Workshops are useful when they decide something. They are expensive when they are a substitute for sitting with operations for a morning.</p>",
      featuredImage: IMAGES.meeting,
      author: author._id,
      category: catProduct._id,
      tags: [tagDelivery._id],
      status: "published",
      publishedAt: new Date("2026-07-09"),
      readingMinutes: 5,
      seo: { title: "Discovery without theatre — Graphion Journal" },
    },
  ]);

  await TeamMember.insertMany([
    { name: "Adrian Cole", position: "Founder / Engineering", image: IMAGES.portrait2, bio: "Former platform lead. Obsessed with systems that survive contact with operations.", skills: ["Architecture", "TypeScript"], order: 1, isActive: true, socialLinks: [{ platform: "linkedin", url: "https://linkedin.com" }] },
    { name: "Maya Ellison", position: "Design & Editorial", image: IMAGES.portrait3, bio: "Makes interfaces that operations people do not need a training session to use.", skills: ["Product design", "Writing"], order: 2, isActive: true, socialLinks: [] },
    { name: "Jonah Reed", position: "Cloud", image: IMAGES.portrait4, bio: "Keeps production boring. Considers that a compliment.", skills: ["AWS", "Observability"], order: 3, isActive: true, socialLinks: [] },
    { name: "Leila Hart", position: "Delivery", image: IMAGES.portrait1, bio: "Turns vague urgency into a sequence of honest releases.", skills: ["Programme", "Discovery"], order: 4, isActive: true, socialLinks: [] },
  ]);

  await Testimonial.insertMany([
    { quote: "They treated our operations people as the customer. That is rarer than good code.", authorName: "Priya N.", authorTitle: "COO", company: "Harbor Mutual", featured: true, isActive: true, rating: 5, order: 1 },
    { quote: "The first demo was a working slice, not a slide. We signed the next phase the same week.", authorName: "Daniel K.", authorTitle: "CPO", company: "Kitefield", featured: true, isActive: true, rating: 5, order: 2 },
    { quote: "Finally an engineering partner who will argue with us when the brief is wrong.", authorName: "Sofia M.", authorTitle: "VP Engineering", company: "Aperture", featured: true, isActive: true, rating: 5, order: 3 },
    { quote: "Offline-first, no drama, field teams actually use it. That was the brief. They hit it.", authorName: "Marcus L.", authorTitle: "Head of Field Ops", company: "Northwind Energy", featured: false, isActive: true, rating: 5, order: 4 },
  ]);

  await FAQ.insertMany([
    { question: "Do you only work with large enterprises?", answer: "No. We work with companies that have a real operational problem and the authority to fix it — often 30 to 500 people.", order: 1, isActive: true, category: "General" },
    { question: "Can we start with a paid discovery?", answer: "Yes. Most engagements begin with a two to four week discovery that produces an architecture and a first-release plan.", order: 2, isActive: true, category: "Engagement" },
    { question: "Do you take over existing codebases?", answer: "Regularly. We prefer a short audit before we commit to a delivery plan.", order: 3, isActive: true, category: "Engagement" },
    { question: "Where are you based?", answer: "We operate remotely with on-site workshops when the work needs a room.", order: 4, isActive: true, category: "General" },
  ]);

  const techs = ["React", "Next.js", "TypeScript", "Node.js", "MongoDB", "PostgreSQL", "React Native", "Flutter", "AWS", "Docker", "Python", "Stripe"];
  await Technology.insertMany(techs.map((name, order) => ({ name, slug: name.toLowerCase().replace(/\./g, "").replace(/\s+/g, "-"), category: "Stack", order, isActive: true })));

  await Page.insertMany([
    { title: "Privacy Policy", slug: "privacy", kind: "legal", status: "published", content: "<p>Graphion Studios collects only what we need to respond to enquiries and operate this website. Contact data is stored in our CMS database and is not sold.</p><p>You may request access or deletion by writing to hello@graphion.studio.</p>", seo: { title: "Privacy Policy — Graphion Studios" } },
    { title: "Terms & Conditions", slug: "terms", kind: "legal", status: "published", content: "<p>Use of this website does not create a client relationship. Statements of work govern delivery. Content is provided as-is for information.</p>", seo: { title: "Terms — Graphion Studios" } },
    { title: "Cookie Policy", slug: "cookies", kind: "legal", status: "published", content: "<p>We use essential cookies for admin sessions. Analytics cookies are used only when a measurement ID is configured in settings.</p>", seo: { title: "Cookies — Graphion Studios" } },
    { title: "Refund Policy", slug: "refunds", kind: "legal", status: "published", content: "<p>Professional services are billed per statement of work. SaaS fees, when billed, follow the plan terms agreed at checkout or in a sales order.</p>", seo: { title: "Refunds — Graphion Studios" } },
    { title: "Disclaimer", slug: "disclaimer", kind: "legal", status: "published", content: "<p>Case studies describe outcomes in specific contexts. They are not guarantees. Technology choices are made per engagement.</p>", seo: { title: "Disclaimer — Graphion Studios" } },
    { title: "Data Processing", slug: "data-processing", kind: "legal", status: "published", content: "<p>When we process personal data on a client’s behalf, a data processing addendum is executed with the statement of work.</p>", seo: { title: "Data Processing — Graphion Studios" } },
  ]);

  await SiteSettings.create({
    companyName: "Graphion Studios",
    tagline: "Systems. Software. Scale.",
    email: "hello@graphion.studio",
    phone: "+44 20 7946 0120",
    whatsapp: "+442079460120",
    address: "Level 4, 18 Finsbury Avenue, London EC2M 2PT",
    businessHours: "Mon–Fri, 09:00–18:00 GMT",
    socialLinks: [
      { platform: "linkedin", url: "https://linkedin.com" },
      { platform: "x", url: "https://x.com" },
    ],
    copyright: "© Graphion Studios. All rights reserved.",
    sitemapEnabled: true,
    defaultSeo: {
      title: "Graphion Studios — Custom software, platforms, and SaaS products",
      description: "We design, engineer, and operate the digital products ambitious companies run on.",
    },
  });

  await EmailSettings.create({
    notifyOnContact: true,
    notifyOnInquiry: true,
    sendCustomerConfirmation: true,
    fromName: "Graphion Studios",
    fromEmail: "hello@graphion.studio",
    notifyEmail: process.env.ADMIN_NOTIFY_EMAIL || "hello@graphion.studio",
  });

  await Navigation.create({
    location: "header",
    items: [
      { id: "work", label: "Work", href: "/portfolio", isEnabled: true, order: 1 },
      {
        id: "services",
        label: "Services",
        href: "/services",
        isEnabled: true,
        order: 2,
        children: services.slice(0, 6).map((s, i) => ({
          id: s.slug,
          label: s.name,
          href: `/services/${s.slug}`,
          isEnabled: true,
          order: i,
        })),
      },
      { id: "products", label: "Products", href: "/products", isEnabled: true, order: 3 },
      { id: "journal", label: "Journal", href: "/blog", isEnabled: true, order: 4 },
      { id: "about", label: "Studio", href: "/about", isEnabled: true, order: 5 },
    ],
  });

  await Footer.create({
    newsletterEnabled: true,
    newsletterHeading: "A short letter, occasionally.",
    newsletterBody: "Delivery notes, architecture, and what we are actually building.",
    copyright: "© Graphion Studios",
    columns: [
      {
        id: "studio",
        title: "Studio",
        order: 1,
        links: [
          { label: "About", href: "/about" },
          { label: "Journal", href: "/blog" },
          { label: "Contact", href: "/contact" },
        ],
      },
      {
        id: "build",
        title: "Build",
        order: 2,
        links: [
          { label: "Services", href: "/services" },
          { label: "Products", href: "/products" },
          { label: "Work", href: "/portfolio" },
        ],
      },
      {
        id: "legal",
        title: "Legal",
        order: 3,
        links: [
          { label: "Privacy", href: "/legal/privacy" },
          { label: "Terms", href: "/legal/terms" },
          { label: "Cookies", href: "/legal/cookies" },
        ],
      },
    ],
  });

  await Homepage.create({
    sections: [
      {
        id: "hero",
        type: "hero",
        enabled: true,
        order: 1,
        kicker: "Graphion Studios / London",
        heading: "Software that can carry the weight of the business.",
        subheading:
          "We design, engineer, and operate platforms, products, and SaaS systems for companies that have outgrown templates and theatre.",
        primaryCta: { label: "Start a conversation", href: "/contact" },
        secondaryCta: { label: "See the work", href: "/portfolio" },
        mediaUrl: IMAGES.office,
      },
      { id: "logos", type: "logos", enabled: true, order: 2, kicker: "Selected clients", heading: "Trusted with operational software." },
      {
        id: "services",
        type: "services",
        enabled: true,
        order: 3,
        kicker: "01 / Capabilities",
        heading: "What we actually build.",
        subheading: "Not a menu of buzzwords. The work we staff senior people against.",
        featuredIds: services.slice(0, 6).map((s) => String(s._id)),
      },
      {
        id: "why",
        type: "why",
        enabled: true,
        order: 4,
        kicker: "02 / Why Graphion",
        heading: "A studio, not a slide deck.",
        items: [
          { title: "Operators in the room", description: "We sit with the people who do the work before we draw a wireframe." },
          { title: "Systems, not pages", description: "Content models, tenancy, and admin are part of the product, not a later phase." },
          { title: "We ship our own SaaS", description: "The discipline of living with software we sell changes how we build yours." },
        ],
      },
      { id: "technologies", type: "technologies", enabled: true, order: 5, kicker: "03 / Stack", heading: "Tools we will still stand behind in five years." },
      {
        id: "process",
        type: "process",
        enabled: true,
        order: 6,
        kicker: "04 / Method",
        heading: "A sequence, not a mystery.",
        items: [
          { title: "Discovery", description: "Constraints, users, and the operational truth." },
          { title: "Planning", description: "Architecture and a first release that is useful." },
          { title: "Design", description: "Interfaces that match how people already work." },
          { title: "Development", description: "Thin vertical slices, production quality." },
          { title: "Testing", description: "Automated where it counts, exploratory where it doesn’t." },
          { title: "Deployment", description: "Guarded production, observability, rollback." },
          { title: "Maintenance", description: "The product keeps moving after the launch email." },
        ],
      },
      { id: "products", type: "products", enabled: true, order: 7, kicker: "05 / Our products", heading: "Software we operate ourselves.", featuredIds: products.map((p) => String(p._id)) },
      { id: "portfolio", type: "portfolio", enabled: true, order: 8, kicker: "06 / Selected work", heading: "Quiet systems. Visible results.", featuredIds: projects.slice(0, 3).map((p) => String(p._id)) },
      { id: "stats", type: "stats", enabled: true, order: 9, items: [
        { label: "Years in market", value: "12" },
        { label: "Platforms shipped", value: "80+" },
        { label: "NPS from retainers", value: "74" },
        { label: "Average engagement", value: "14 mo" },
      ] },
      { id: "testimonials", type: "testimonials", enabled: true, order: 10, kicker: "07 / In their words", heading: "What it is like to work with us." },
      {
        id: "cta",
        type: "cta",
        enabled: true,
        order: 11,
        heading: "Bring us the operational problem, not a feature list.",
        body: "If you already know the screens you want, we can still help. If you only know the pain, that is often the better brief.",
        primaryCta: { label: "Book a working session", href: "/contact" },
        secondaryCta: { label: "Browse services", href: "/services" },
      },
    ],
  });

  await AboutPage.create({
    introductionHeading: "A small studio for serious software.",
    introduction:
      "Graphion Studios is an independent technology practice. We build the systems companies run on — platforms, products, and the unglamorous software that keeps a business coherent.",
    mission: "Ship software that operations teams trust on a bad Tuesday.",
    vision: "A world where custom software is quieter, more honest, and owned by the people who depend on it.",
    story:
      "The studio started because too many ‘digital transformations’ produced slideware and a brittle CMS. We staff senior generalists, keep the team small, and stay after launch.",
    values: [
      { title: "Specificity", description: "We would rather be useful in one domain than vague in twelve." },
      { title: "Stewardship", description: "Code is an asset. We write it as if we will be paged for it." },
      { title: "Candour", description: "If the brief is wrong, we say so before we staff a team." },
    ],
    whyUs: [
      { title: "We sell our own products", description: "SaaS we operate ourselves keeps us honest about tenancy, billing, and support." },
      { title: "CMS as a product", description: "Non-technical operators should be able to run the site. That is why this platform exists." },
    ],
    stats: [
      { label: "People", value: "18" },
      { label: "Cities", value: "4" },
      { label: "Active retainers", value: "11" },
    ],
    ctaHeading: "If the problem is real, we should talk.",
    ctaBody: "A working session is usually enough to know if we are the right studio.",
    ctaLabel: "Contact the studio",
    ctaHref: "/contact",
    heroImage: IMAGES.meeting,
  });

  const searchDocs = [
    ...services.map((s) => ({ type: "service" as const, title: s.name, excerpt: s.shortDescription, url: `/services/${s.slug}`, slug: s.slug, published: true })),
    ...products.map((s) => ({ type: "product" as const, title: s.name, excerpt: s.shortDescription, url: `/products/${s.slug}`, slug: s.slug, published: true })),
    ...projects.map((s) => ({ type: "portfolio" as const, title: s.name, excerpt: s.summary || "", url: `/portfolio/${s.slug}`, slug: s.slug, published: true })),
  ];
  await SearchDocument.insertMany(searchDocs);
  const posts = await BlogPost.find().lean();
  await SearchDocument.insertMany(
    posts.map((s) => ({ type: "blog" as const, title: s.title, excerpt: s.excerpt, url: `/blog/${s.slug}`, slug: s.slug, published: true })),
  );

  console.log("Seed complete. Admin:", process.env.ADMIN_EMAIL || "admin@graphion.studio");
  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
