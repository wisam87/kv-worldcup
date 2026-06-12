"use client";

import * as React from "react";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./command";
import { cn } from "@/lib/utils";

export type ComboboxOption = { value: string; label: string };

/** Searchable single-select (shadcn Combobox: Popover + cmdk Command). */
export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No match.",
  className,
  id,
}: {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          id={id}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-left text-sm text-white outline-none transition focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/20",
            className
          )}
        >
          <span className={cn("truncate", !selected && "text-white/40")}>
            {selected ? selected.label : placeholder}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 shrink-0 opacity-50"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className={cn(
                      "h-4 w-4 shrink-0 text-gold-400",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
