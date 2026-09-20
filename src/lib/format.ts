import slugify from "slugify";

export function toSlug(value: string) {
  return slugify(value, { lower: true, strict: true, trim: true });
}

export function serialize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function readingMinutes(html: string) {
  const text = html.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function excerptFromHtml(html: string, length = 160) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}…`;
}

export function formatCurrency(amount: number | null | undefined, currency = "USD") {
  if (amount === null || amount === undefined) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function billingLabel(type: string) {
  switch (type) {
    case "monthly":
      return "/ month";
    case "yearly":
      return "/ year";
    case "one_time":
      return " one-time";
    case "free":
      return "";
    default:
      return "";
  }
}

export function planPriceRange(
  plans?: Array<{
    price?: number | null;
    currency?: string;
    billingType?: string;
    customPriceLabel?: string;
    isCustom?: boolean;
    isEnabled?: boolean;
  }>,
) {
  const enabled = (plans || []).filter((plan) => plan.isEnabled !== false);
  if (!enabled.length) return null;

  const amounts = enabled
    .map((plan) => plan.price)
    .filter((price): price is number => typeof price === "number" && Number.isFinite(price));
  const hasCustom = enabled.some((plan) => plan.isCustom || plan.price == null);
  const currency = enabled.find((plan) => plan.currency)?.currency || "USD";
  const billed = enabled.filter((plan) => typeof plan.price === "number");
  const billings = [...new Set(billed.map((plan) => plan.billingType || ""))];
  const suffix =
    billings.length === 1 && billings[0] !== "one_time" && billings[0] !== "custom"
      ? billingLabel(billings[0]).trim()
      : "";

  if (!amounts.length) return enabled.find((plan) => plan.customPriceLabel)?.customPriceLabel || "Custom";

  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const minLabel = formatCurrency(min, currency);
  const maxLabel = formatCurrency(max, currency);
  const withSuffix = (value: string) => (suffix ? `${value} ${suffix}` : value);

  if (hasCustom && minLabel) {
    const numeric = min === max ? withSuffix(minLabel) : withSuffix(`${minLabel} – ${maxLabel}`);
    return `${numeric} – Custom`;
  }
  if (min === max) return withSuffix(minLabel || "Custom");
  return withSuffix(`${minLabel} – ${maxLabel}`);
}

export function enabledPlanNames(
  plans?: Array<{ name?: string; isEnabled?: boolean; order?: number }>,
) {
  return (plans || [])
    .filter((plan) => plan.isEnabled !== false && Boolean(plan.name))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((plan) => String(plan.name));
}
