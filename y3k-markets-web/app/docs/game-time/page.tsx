import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

export const metadata: Metadata = {
  title: "Game Time Checklist | Y3K Markets",
  description: "Bowl-week operations checklist for the mint funnel (web + payments-api + Stripe webhooks).",
  alternates: { canonical: "/docs/game-time/" },
  openGraph: {
    title: "Game Time Checklist | Y3K Markets",
    description: "Bowl-week operations checklist for the mint funnel (web + payments-api + Stripe webhooks).",
  },
};

function markdownToHtml(markdown: string): string {
  const renderer = new marked.Renderer();

  // Security hardening: strip raw HTML from markdown.
  renderer.html = () => "";

  // Open external links in a new tab.
  renderer.link = (href: string | null, title: string | null, text: string) => {
    const safeHref = (href ?? "").trim();
    const safeTitle = title ? ` title=\"${title.replace(/\"/g, "&quot;")}\"` : "";
    const isExternal = /^https?:\/\//i.test(safeHref);
    const rel = isExternal ? " rel=\"noopener noreferrer\"" : "";
    const target = isExternal ? " target=\"_blank\"" : "";
    return `<a href=\"${safeHref}\"${safeTitle}${target}${rel}>${text}</a>`;
  };

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });

  return marked.parse(markdown) as string;
}

export default async function GameTimeChecklistPage() {
  const absoluteDocPath = path.resolve(process.cwd(), "GAME_TIME_CHECKLIST.md");

  let markdown: string;
  try {
    markdown = await fs.readFile(absoluteDocPath, "utf8");
  } catch {
    notFound();
  }

  const html = markdownToHtml(markdown);

  return (
    <main className="min-h-screen pt-16">
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold gradient-text">
              Y3K Markets
            </Link>
            <div className="flex gap-8">
              <Link href="/" className="hover:text-purple-400 transition">
                Home
              </Link>
              <Link href="/practice" className="hover:text-purple-400 transition">
                Practice
              </Link>
              <Link href="/explore" className="hover:text-purple-400 transition">
                Explore
              </Link>
              <Link href="/docs" className="text-purple-400">
                Docs
              </Link>
              <Link href="/trust" className="hover:text-purple-400 transition">
                Trust
              </Link>
              <Link href="/status" className="hover:text-purple-400 transition">
                Status
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Game Time Checklist</h1>
          <p className="text-gray-400">
            Phone-friendly operations checklist for bowl-week traffic.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/mint"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Go to Mint
            </Link>
            <Link
              href="/bowl/miami/citynil"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Miami funnel
            </Link>
            <Link
              href="/bowl/olemiss/citynil"
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 transition"
            >
              Ole Miss funnel
            </Link>
          </div>
        </div>

        <article
          className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-purple-300 prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
