import { BlogFilteredPage } from "@/components/site/blog-filtered";

export default async function BlogCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogFilteredPage kind="category" slug={slug} />;
}
