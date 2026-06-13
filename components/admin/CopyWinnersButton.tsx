"use client";

import { useState } from "react";

export type Winner = { name: string; points: number };

export default function CopyWinnersButton({
  winners,
}: {
  winners: Winner[];
}) {
  const [copied, setCopied] = useState(false);

  const text = winners.map((w) => `${w.name} +${w.points}`).join("\n");

  async function copy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts / older mobile browsers.
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy the winners list:", text);
    }
  }

  const disabled = winners.length === 0;

  return (
    <button
      type="button"
      onClick={copy}
      disabled={disabled}
      title={disabled ? "No one earned points" : undefined}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-600 text-white/80 transition hover:border-gold-400/50 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {copied ? (
        <>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 text-gold-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
          Copy Winners List
        </>
      )}
    </button>
  );
}
