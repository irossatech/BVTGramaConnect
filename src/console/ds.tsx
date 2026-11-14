// The two design-system components the console uses, copied from the prototype's
// _ds_bundle.js. Keep them identical to the design system (public/_ds/grama-connect/), with one approved
// difference: the category icons load as same-size WebP copies (icon-<category>-120.webp, 120 px like the PNGs,
// 2-4 KB instead of 16-28 KB; owner's choice of 14 Nov 2026, audit WEB-PERF-002).
import type { CSSProperties, ReactNode } from "react";

/** Post categories the design system has colours (--cat-*) and icons for. */
export type Category = "announce" | "schemes" | "news" | "updates" | "location";

export function Badge({ children, tone = "news", style }: { children: ReactNode; tone?: string; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "var(--radius-pill)",
        background: "var(--cat-" + tone + "-bg)",
        color: "var(--cat-" + tone + ")",
        fontFamily: "var(--font-telugu)",
        fontSize: "var(--text-xs)",
        fontWeight: 600,
        lineHeight: 1.4,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function IconBadge({ category = "announce", size = 48, icon, style }: { category?: Category; size?: number; icon?: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--cat-" + category + ")",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        flexShrink: 0,
        overflow: "hidden",
        ...style,
      }}
    >
      {icon ? icon : <img alt="" src={"/assets/icon-" + category + "-120.webp"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </span>
  );
}
