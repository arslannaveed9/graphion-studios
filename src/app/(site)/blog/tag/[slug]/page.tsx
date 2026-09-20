import { BlogFilteredPage } from "@/components/site/blog-filtered";

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogFilteredPage kind="tag" slug={slug} />;
}
