import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import fs from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";

type Params = { slug: string[] };

type CanonicalDoc = {
  title: string;
  description: string;
  // Path relative to the monorepo root (one level up from y3k-markets-web)
  file: string;
  canonicalPath: string;
};

const CANONICAL_DOCS: Record<string, CanonicalDoc> = {
  "readme": {
    title: "README (Protocol Overview)",
    description: "Canonical protocol overview and repository README.",
    file: "README.md",
    canonicalPath: "/docs/canonical/readme/",
  },
  "executive-briefing": {
    title: "Executive Briefing",
    description: "High-level briefing for investors, auditors, and implementers.",
    file: "EXECUTIVE_BRIEFING.md",
    canonicalPath: "/docs/canonical/executive-briefing/",
  },
  "spec-index": {
    title: "Specification Index",
    description: "Index of frozen specifications and protocol artifacts.",
    file: "SPEC_INDEX.md",
    canonicalPath: "/docs/canonical/spec-index/",
  },
  "security": {
    title: "Security",
    description: "Threat model, security posture, and operational guidance.",
    file: "SECURITY.md",
    canonicalPath: "/docs/canonical/security/",
  },
  "security-verification": {
    title: "Security Verification",
    description: "Verification procedures and audit-oriented security checks.",
    file: "SECURITY_VERIFICATION.md",
    canonicalPath: "/docs/canonical/security-verification/",
  },
  "key-security": {
    title: "Key Security",
    description: "Key handling, storage, and operational safety guidance.",
    file: "KEY_SECURITY.md",
    canonicalPath: "/docs/canonical/key-security/",
  },
  "version": {
    title: "Version",
    description: "Protocol versioning and current release information.",
    file: "VERSION.md",
    canonicalPath: "/docs/canonical/version/",
  },

  "specs/constitution": {
    title: "Constitution",
    description: "Immutable protocol rules and constitutional constraints.",
    file: "specs/CONSTITUTION.md",
    canonicalPath: "/docs/canonical/specs/constitution/",
  },
  "specs/crypto-profile": {
    title: "Crypto Profile",
    description: "Post-quantum signatures and hashing algorithm profile.",
    file: "specs/CRYPTO_PROFILE.md",
    canonicalPath: "/docs/canonical/specs/crypto-profile/",
  },
  "specs/genesis-spec": {
    title: "Genesis Specification",
    description: "Single-use genesis ceremony and derivation rules.",
    file: "specs/GENESIS_SPEC.md",
    canonicalPath: "/docs/canonical/specs/genesis-spec/",
  },
  "specs/namespace-object": {
    title: "Namespace Object",
    description: "Core cryptographic identity primitive and object model.",
    file: "specs/NAMESPACE_OBJECT.md",
    canonicalPath: "/docs/canonical/specs/namespace-object/",
  },
  "specs/policy-spec": {
    title: "Policy Specification",
    description: "Deterministic policy engine rules and evaluation semantics.",
    file: "specs/POLICY_SPEC.md",
    canonicalPath: "/docs/canonical/specs/policy-spec/",
  },
  "specs/rarity-spec": {
    title: "Rarity Specification",
    description: "Deterministic rarity scoring and six-tier classification.",
    file: "specs/RARITY_SPEC.md",
    canonicalPath: "/docs/canonical/specs/rarity-spec/",
  },
  "specs/sovereignty-classes": {
    title: "Sovereignty Classes",
    description: "Transfer, delegation, inheritance, sealing, and class rules.",
    file: "specs/SOVEREIGNTY_CLASSES.md",
    canonicalPath: "/docs/canonical/specs/sovereignty-classes/",
  },
  "specs/stateless-verifier": {
    title: "Stateless Verifier",
    description: "Offline verification without chain dependency.",
    file: "specs/STATELESS_VERIFIER.md",
    canonicalPath: "/docs/canonical/specs/stateless-verifier/",
  },
  "specs/vault-model": {
    title: "Vault Model",
    description: "Key custody, vault construction, and recovery model.",
    file: "specs/VAULT_MODEL.md",
    canonicalPath: "/docs/canonical/specs/vault-model/",
  },
};

const CANONICAL_BY_SOURCE_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(CANONICAL_DOCS).map(([slug, doc]) => [doc.file.replace(/\\/g, "/"), doc.canonicalPath])
);

function rewriteDocHref(originalHref: string): string {
  let href = originalHref.trim();
  if (!href) return href;

  // Leave same-page anchors alone.
  if (href.startsWith("#")) return href;

  const githubRepo = "https://github.com/Y3KDigital/sovereign-namespace-protocol";
  const githubBlobPrefix = `${githubRepo}/blob/main/`;

  // Normalize common scheme-less forms (e.g. "github.com/..." in markdown).
  if (href.startsWith("github.com/")) {
    href = `https://${href}`;
  }

  // If the repo isn't public, rewrite to the published canonical docs.
  if (href === githubRepo || href === `${githubRepo}/`) {
    return "/docs/";
  }

  if (href.startsWith(`${githubRepo}/issues`)) {
    return "/docs/";
  }

  if (href.startsWith(githubBlobPrefix)) {
    const repoPath = href.slice(githubBlobPrefix.length).replace(/\\/g, "/");
    const mapped = CANONICAL_BY_SOURCE_PATH[repoPath];
    if (mapped) return mapped;
    return "/docs/";
  }

  // Rewrite common relative links found inside the markdown docs.
  // Examples: "specs/GENESIS_SPEC.md", "./specs/GENESIS_SPEC.md"
  const rel = href.replace(/^\.\//, "");
  if (rel.endsWith(".md")) {
    const normalized = rel.replace(/^\.\.\//g, "").replace(/\\/g, "/");

    // 1) Direct mapping (e.g. "specs/GENESIS_SPEC.md")
    const direct = CANONICAL_BY_SOURCE_PATH[normalized];
    if (direct) return direct;

    // 2) SPEC_INDEX.md commonly links to filenames without the "specs/" prefix
    // (e.g. "CONSTITUTION.md"). Rewrite those to the canonical specs routes.
    const basename = normalized.split("/").pop() ?? normalized;
    const inferredSpecsPath = `specs/${basename}`;
    const inferred = CANONICAL_BY_SOURCE_PATH[inferredSpecsPath];
    if (inferred) return inferred;
  }

  return href;
}

function markdownToHtml(markdown: string): string {
  const renderer = new marked.Renderer();

  // Security hardening: strip raw HTML from markdown.
  renderer.html = () => "";

  // Rewrite links that point back to a private GitHub repo into on-site canonical docs.
  renderer.link = (href: string | null, title: string | null, text: string) => {
    const safeHref = rewriteDocHref(href ?? "");
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

function getMonorepoRootPath() {
  // y3k-markets-web lives at monorepoRoot/y3k-markets-web
  // During build/export, process.cwd() should be y3k-markets-web.
  return path.resolve(process.cwd(), "..");
}

export async function generateStaticParams(): Promise<Params[]> {
  return Object.keys(CANONICAL_DOCS).map((key) => ({ slug: key.split("/") }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const key = params.slug.join("/");
  const doc = CANONICAL_DOCS[key];
  if (!doc) return {};

  return {
    title: `${doc.title} | Canonical Docs | Y3K Markets`,
    description: doc.description,
    alternates: { canonical: doc.canonicalPath },
    openGraph: {
      title: `${doc.title} | Canonical Docs | Y3K Markets`,
      description: doc.description,
    },
  };
}

export default async function CanonicalDocPage({ params }: { params: Params }) {
  const key = params.slug.join("/");
  const doc = CANONICAL_DOCS[key];
  if (!doc) notFound();

  const root = getMonorepoRootPath();
  const absoluteDocPath = path.resolve(root, doc.file);

  let markdown: string;
  try {
    markdown = await fs.readFile(absoluteDocPath, "utf8");
  } catch {
    // If the file goes missing, fail closed.
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

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition">
            ← Back to Protocol Docs
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mt-3 mb-2 gradient-text">{doc.title}</h1>
          <p className="text-gray-400">{doc.description}</p>
        </div>

        <article
          className="y3k-markdown bg-white/5 border border-white/10 rounded-lg p-6 md:p-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </main>
  );
}
