"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type Entry = { sort: number; label: string };

type Ctx = {
  selected: Map<string, Entry>;
  toggle: (id: string, entry: Entry) => void;
};

const MatchCopyContext = createContext<Ctx | null>(null);

export function MatchCopyProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<Map<string, Entry>>(new Map());

  const toggle = (id: string, entry: Entry) => {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(id)) next.delete(id);
      else next.set(id, entry);
      return next;
    });
  };

  const value = useMemo(() => ({ selected, toggle }), [selected]);

  return (
    <MatchCopyContext.Provider value={value}>
      {children}
    </MatchCopyContext.Provider>
  );
}

function useMatchCopy() {
  const ctx = useContext(MatchCopyContext);
  if (!ctx) throw new Error("useMatchCopy must be used within MatchCopyProvider");
  return ctx;
}

export function MatchCheckbox({
  id,
  sort,
  label,
}: {
  id: string;
  sort: number;
  label: string;
}) {
  const { selected, toggle } = useMatchCopy();
  return (
    <input
      type="checkbox"
      aria-label={`Select ${label}`}
      checked={selected.has(id)}
      onChange={() => toggle(id, { sort, label })}
      className="h-5 w-5 shrink-0 cursor-pointer accent-gold-400"
    />
  );
}

export function CopySelectedBar() {
  const { selected } = useMatchCopy();
  const [copied, setCopied] = useState(false);

  const count = selected.size;
  if (count === 0) return null;

  const handleCopy = async () => {
    const text = Array.from(selected.values())
      .sort((a, b) => a.sort - b.sort)
      .map((e) => e.label)
      .join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable — ignore.
    }
  };

  return (
    <div className="sticky top-2 z-10 flex items-center justify-between gap-3 rounded-xl border border-gold-400/30 bg-pitch-900/90 px-4 py-2.5 backdrop-blur">
      <span className="text-sm font-600 text-white/80">
        {count} match{count === 1 ? "" : "es"} selected
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-lg bg-gold-400 px-3 py-1.5 text-sm font-700 text-pitch-950 transition hover:bg-gold-300"
      >
        {copied ? "Copied!" : "Copy to clipboard"}
      </button>
    </div>
  );
}
