// The two design-system components the console uses, copied from the prototype's
// _ds_bundle.js (BVTGramaConnectDesignSystem_3ef6e4). Keep them identical to the design system.

export function Badge({ children, tone = "news", style }) {
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

const ICON = { announce: "announce", schemes: "schemes", news: "news", updates: "updates", location: "location" };

export function IconBadge({ category = "announce", size = 48, icon, style }) {
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
      {icon ? icon : <img alt="" src={"/assets/icon-" + ICON[category] + ".png"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
    </span>
  );
}
