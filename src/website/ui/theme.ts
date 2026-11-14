// The website's look, in the app's own colours: navy headings, blue actions, green/orange/yellow accents.
// Telugu sits one step below English at every type size (the Telugu UI face already runs small and dense).
import type { CSSProperties } from "react";
import type { View } from "../Site";

export const ink = "#0A2550", blue = "#0D3B7A", green = "#1F8A3B", muted = "#4A5868", line = "#E3E8DF", cream = "#F6F8F3";
/** A value for wide screens and one for phones (under 820 px), switched by CSS, not JavaScript: the page is built
 *  ahead of time, so the exported HTML must already be right at every width. Works in any inline style property.
 *  How: SitePage's CSS sets --gc-m/--gc-d to "initial" (invalid, so var() takes its fallback) or " " (empty). */
export const rsp = (wide: string, phone: string) => `var(--gc-m,${wide}) var(--gc-d,${phone})`;
export const display = "'Rubik','Telugu UI','Noto Sans Telugu',sans-serif";

export function ui(v: Pick<View, "te" | "headLh">) {
  // Telugu xs and sm were 11.5 and 12 px in the prototype; 13 px since 2026-11-14 (owner's approval,
  // audit WEB-I18N-003), easier to read on budget phones. English keeps the prototype's sizes.
  const fs: Record<"xs" | "sm" | "base" | "md" | "lg" | "xl", string> = v.te ? {xs: "13px", sm: "13px", base: "14px", md: "16px", lg: "18px", xl: "20px"} : {xs: "12px", sm: "13px", base: "15px", md: "17px", lg: "19px", xl: "22px"};
  const wrap: CSSProperties = {maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)"};
  const h2: CSSProperties = {margin: "0", fontFamily: display, fontWeight: "700", fontSize: v.te ? "clamp(22px,2.3vw,30px)" : "clamp(24px,2.6vw,34px)", lineHeight: v.headLh, letterSpacing: v.te ? "0" : "-0.01em", color: ink, textWrap: "balance"};
  const h1: CSSProperties = {...h2, fontSize: v.te ? "clamp(26px,3vw,38px)" : "clamp(28px,3.4vw,44px)"};
  const kicker: CSSProperties = {fontSize: fs.xs, fontWeight: "700", letterSpacing: v.te ? "0" : ".08em", textTransform: "uppercase", color: green};
  const lead: CSSProperties = {margin: "0", fontSize: v.te ? "clamp(14px,1.1vw,16px)" : "clamp(15px,1.2vw,17px)", lineHeight: v.te ? "1.75" : "1.6", color: muted, maxWidth: "620px", textWrap: "pretty"};
  const pill: CSSProperties = {height: "46px", padding: "0 20px", borderRadius: "999px", fontWeight: "700", fontSize: v.te ? "13px" : "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px"};
  const pillDark: CSSProperties = {...pill, border: "1.5px solid " + blue, background: blue, color: "#fff"};
  const pillLight: CSSProperties = {...pill, border: "1.5px solid " + blue, background: "#fff", color: blue};
  const badgeLight: CSSProperties = {display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", padding: "6px 12px 6px 8px", borderRadius: "999px", background: "#e4f4df", color: "#1d7a33", fontSize: fs.xs, fontWeight: "700"};
  const textBtn: CSSProperties = {display: "inline-flex", alignItems: "center", gap: "4px", minHeight: "44px", background: "none", border: "0", padding: "0", color: blue, fontWeight: "700", fontSize: v.te ? "13px" : "14px", cursor: "pointer"};
  const field: CSSProperties = {height: "46px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "15px", background: "#fff", color: "#17212e", outlineColor: blue};
  return { ink, blue, green, muted, line, cream, display, fs, wrap, h2, h1, kicker, lead, pill, pillDark, pillLight, badgeLight, textBtn, field };
}
