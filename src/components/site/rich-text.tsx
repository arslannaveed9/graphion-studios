export function RichText({ html, className }: { html?: string; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={
        className ||
        "space-y-4 text-base leading-7 text-muted-foreground [&_a]:text-copper [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_h3]:text-xl [&_h3]:text-foreground [&_ul]:list-disc [&_ul]:pl-5"
      }
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
