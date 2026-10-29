// FAQ page: the questions open one at a time.
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function Faq({ v }: { v: View }) {
  const { ink, muted, line, display, fs, wrap, h1, kicker, textBtn } = ui(v);
  return (
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
        <div style={{...wrap, maxWidth: "900px", display: "flex", flexDirection: "column", gap: "clamp(24px,4vw,48px)", animation: "mk-fade .25s ease-out"}}>
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
            <div style={kicker}>FAQ</div>
            <h1 style={h1}>{I(v.t?.faqTitle)}</h1>
          </div>
          <div style={{borderBottom: "1px solid " + line}}>
            {list(v.faqs).map((_f, _i1) => (
              <div key={_i1} style={{borderTop: "1px solid " + line}}>
                <h2 style={{margin: "0", font: "inherit"}}><button className="gc-faq" onClick={_f?.toggle} aria-expanded={_f?.open} style={{display: "flex", alignItems: "center", gap: "16px", width: "100%", minHeight: "60px", padding: "16px 0", border: "0", background: "none", cursor: "pointer", textAlign: "left", color: ink}}>
                  <span style={{flex: "1", fontFamily: display, fontWeight: "600", fontSize: fs.md, lineHeight: "1.4"}}>{I(_f?.q)}</span>
                  <span style={{width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", transition: "transform .2s ease-out, background-color .2s", background: _f?.iconBg, color: _f?.iconColor, transform: _f?.rot}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  </span>
                </button></h2>
                <div hidden={!_f?.open} style={{padding: "0 48px 22px 0", fontSize: fs.base, lineHeight: "1.65", color: muted, animation: "mk-fade .2s ease-out"}}>{I(_f?.a)}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize: fs.base, color: muted}}>
            {I(v.t?.faqMore)}{" "}
            <button onClick={v.goContact} style={textBtn}>{I(v.t?.contactUs)}{" "}<span className="gc-arrow" aria-hidden="true">→</span></button>
          </div>
        </div>
      </section>
  );
}
