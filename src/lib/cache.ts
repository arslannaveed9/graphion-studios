import { revalidatePath, revalidateTag } from "next/cache";

export const cacheTags = {
  settings: "settings",
  navigation: "navigation",
  homepage: "homepage",
  services: "services",
  products: "products",
  portfolio: "portfolio",
  blog: "blog",
  pages: "pages",
  content: "content",
} as const;

export function bust(tag: keyof typeof cacheTags, paths: string[] = []) {
  revalidateTag(cacheTags[tag], "max");
  for (const path of paths) {
    revalidatePath(path);
  }
}

export function bustPublicSite() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}
