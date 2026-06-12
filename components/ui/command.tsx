"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl bg-pitch-900 text-white",
        className
      )}
      {...props}
    />
  );
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex items-center gap-2 border-b border-white/10 px-3"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 text-white/40"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-11 w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  );
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-64 overflow-y-auto overflow-x-hidden p-1",
        className
      )}
      {...props}
    />
  );
}

function CommandEmpty(
  props: React.ComponentProps<typeof CommandPrimitive.Empty>
) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="py-6 text-center text-sm text-white/50"
      {...props}
    />
  );
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn("overflow-hidden p-1 text-white", className)}
      {...props}
    />
  );
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-white/85 outline-none",
        "data-[selected=true]:bg-white/10 data-[selected=true]:text-white",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
};
