import { useId, useState } from "react";
import { widgetEmbedSnippet, WIDGET_PATH } from "../../lib/widget/embedSnippet";

function publisherSiteUrl(): string {
  const fromEnv = import.meta.env.PUBLIC_SITE_URL?.trim();
  return (fromEnv || "https://perdiemcalculator.com").replace(/\/+$/, "");
}

export function EmbedCodeCard({
  showPreview = true
}: {
  showPreview?: boolean;
}) {
  const snippetId = useId();
  const snippet = widgetEmbedSnippet(publisherSiteUrl());
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.getElementById(snippetId) as HTMLTextAreaElement | null;
      el?.select();
    }
  };

  return (
    <div>
      <label htmlFor={snippetId} className="sr-only">
        Embed HTML snippet
      </label>
      <textarea
        id={snippetId}
        readOnly
        rows={10}
        value={snippet}
        className="w-full resize-none rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-ink)] p-4 font-mono text-xs leading-relaxed text-white"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center rounded-lg bg-[var(--color-ink)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]"
        >
          {copied ? "Copied" : "Copy HTML snippet"}
        </button>
        {showPreview ? (
          <a
            href="/embed/"
            target="_blank"
            rel="noopener"
            className="text-sm font-semibold text-[var(--color-accent)] hover:underline"
          >
            Open preview ↗
          </a>
        ) : (
          <a href={WIDGET_PATH} className="text-sm font-semibold text-[var(--color-accent)] hover:underline">
            Full webmaster guide
          </a>
        )}
      </div>
    </div>
  );
}

export function EmbedOnYourSite() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-end">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink)] hover:border-[var(--color-accent)]"
      >
        <span aria-hidden className="font-mono text-xs text-[var(--color-accent)]">
          {"</>"}
        </span>
        Embed on your site
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Embed this calculator"
          className="absolute right-0 top-full z-20 mt-2 w-[min(100vw-2rem,24rem)] rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-elevated)] p-4 shadow-[0_12px_40px_-12px_rgba(0,33,71,0.2)]"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--color-ink)]">Embed GSA calculator</p>
            <button
              type="button"
              className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
          <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
            Paste this HTML on WordPress, Wix, Squarespace, or any HTML page.
          </p>
          <div className="mt-3">
            <EmbedCodeCard showPreview={false} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
