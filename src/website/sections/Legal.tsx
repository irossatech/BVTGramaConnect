// Privacy policy and Terms: one document layout.
import { I } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function Legal({ v, legal }: { v: View; legal: NonNullable<View["legal"]> }) {
  const { green, muted, line, fs, wrap, h2, h1, lead, pillDark, pillLight } = ui(v);
  return (
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
        <article style={{...wrap, maxWidth: "800px", display: "flex", flexDirection: "column", gap: "clamp(24px,3vw,32px)", animation: "mk-fade .25s ease-out"}}>
          <header style={{display: "flex", flexDirection: "column", gap: "12px"}}>
            <h1 style={h1}>{I(legal.title)}</h1>
            <div style={{fontSize: fs.sm, fontWeight: "600", color: muted}}>{I(legal.updated)}</div>
            <p style={{...lead, maxWidth: "none"}}>{I(legal.intro)}</p>
            {legal.note ? <p style={{margin: "0", fontSize: fs.sm, color: muted}}>{I(legal.note)}</p> : null}
          </header>
          {legal.sections.map((sec, i) => (
            <section key={i} className="gc-reveal" style={{borderTop: "1px solid " + line, paddingTop: "22px", display: "flex", flexDirection: "column", gap: "10px"}}>
              <h2 style={{...h2, fontSize: "clamp(18px,1.8vw,21px)"}}><span style={{color: green, marginRight: "8px"}}>{i + 1}.</span>{I(sec.h)}</h2>
              {sec.body.map((b, j) => b.list
                ? <ul key={j} style={{margin: "0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: fs.base, lineHeight: v.te ? "1.75" : "1.65", color: muted}}>{b.list.map((li, k) => <li key={k}>{I(li)}</li>)}</ul>
                : <p key={j} style={{margin: "0", fontSize: fs.base, lineHeight: v.te ? "1.75" : "1.65", color: muted}}>{I(b.text)}</p>)}
            </section>
          ))}
          <div style={{borderTop: "1px solid " + line, paddingTop: "22px", display: "flex", flexWrap: "wrap", gap: "12px"}}>
            <button className="gc-pill" onClick={v.goContact} style={pillDark}>{I(v.t?.contactUs)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
            <button className="gc-pill" onClick={v.page === "privacy" ? v.goTerms : v.goPrivacy} style={pillLight}>{I(v.page === "privacy" ? v.t?.footTerms : v.t?.footPrivacy)}</button>
          </div>
        </article>
      </section>
  );
}
