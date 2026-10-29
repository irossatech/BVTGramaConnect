// Helpers the ported Design Canvas templates use. They reproduce how the Design Canvas
// runtime rendered {{ }} bindings, so the pages look and behave exactly as the prototypes.
import React from "react";

// Text binding: strings and numbers render in <span class="sc-interp">, as the runtime did
// (it matters inside flex rows, where each span is its own flex item).
export function I(x: React.ReactNode): React.ReactNode {
  if (x === undefined || x === null || typeof x === "boolean") return null;
  if (React.isValidElement(x) || Array.isArray(x)) return x;
  return <span className="sc-interp">{String(x)}</span>;
}

const kebabToCamel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());

// Inline style string with bindings -> React style object (custom properties such as --d stay as they are).
export function css(s: string): React.CSSProperties {
  const o: Record<string, string> = {};
  for (const decl of s.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    o[prop.startsWith("--") ? prop : kebabToCamel(prop)] = decl.slice(i + 1).trim();
  }
  return o as React.CSSProperties;
}

// sc-for over anything that is not an array renders nothing.
export const list = <T,>(x: readonly T[] | null | undefined): readonly T[] => (Array.isArray(x) ? x : []);

// Unset value/checked bindings stay controlled: "" and false.
export const val = <T,>(x: T | undefined, fallback: T): T => (x === undefined ? fallback : x);
