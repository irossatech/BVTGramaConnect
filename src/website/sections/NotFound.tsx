// 404 page: the address names no page. Centred and quiet: a soft "404", the heading and one line, the way home,
// and the site's main pages as quick links, in the site's own colours, type and pill styles.
import React from "react";
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function NotFound({ v }: { v: View }) {
  const { fs, wrap, h1, lead, kicker, pillDark, pillLight, display, line } = ui(v);
  return (
    <section style={{padding: "clamp(48px,8vw,112px) 0 clamp(64px,9vw,128px)"}}>
      <div style={{...wrap, maxWidth: "720px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "20px", animation: "mk-fade .25s ease-out"}}>
        <div aria-hidden="true" style={{fontFamily: display, fontWeight: "800", fontSize: "clamp(88px,14vw,152px)", lineHeight: "1", letterSpacing: "-0.04em", color: "#dbe7f5"}}>{I(v.t?.nfCode)}</div>
        <span style={kicker}>{I(v.t?.nfKicker)}</span>
        <h1 style={{...h1, maxWidth: "560px"}}>{I(v.t?.nfTitle)}</h1>
        <p style={{...lead, maxWidth: "520px"}}>{I(v.t?.nfBody)}</p>
        <a className="gc-pill" href={v.homeHref} onClick={v.homeLink} style={{...pillDark, height: "48px", marginTop: "8px", fontSize: fs.base, textDecoration: "none"}}>{I(v.t?.nfHome)}</a>
        <nav aria-label={v.t?.nfOr} style={{width: "100%", marginTop: "24px", paddingTop: "24px", borderTop: "1px solid " + line, display: "flex", flexDirection: "column", alignItems: "center", gap: "14px"}}>
          <span style={{fontSize: fs.sm, color: "#4A5868"}}>{I(v.t?.nfOr)}</span>
          <div style={{display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "10px"}}>
            {list(v.nfLinks).map((x, i) => (
              <React.Fragment key={i}>
                <a className="gc-pill" href={x.href} onClick={x.link} style={{...pillLight, height: "44px", borderColor: "#cfd8e3", textDecoration: "none"}}>{I(x.label)}</a>
              </React.Fragment>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}
