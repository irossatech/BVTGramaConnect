// How it works page: state, district, mandal and village, and the three steps.
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";
import { StepsGrid } from "../ui/parts";

export default function HowItWorks({ v }: { v: View }) {
  const { ink, muted, line, display, fs, wrap, h1, kicker, lead } = ui(v);
  return (
    <>
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(24px,4vw,48px)"}}>
      <div style={{...wrap, display: "flex", flexDirection: "column", gap: "16px", animation: "mk-fade .25s ease-out"}}>
        <div style={kicker}>{I(v.t?.nav_how)}</div>
        <h1 style={{...h1, maxWidth: "900px"}}>{I(v.t?.how2Title)}</h1>
        <p style={lead}>{I(v.t?.how2Sub)}</p>
      </div>
    </section>
    <section style={{padding: "0 0 clamp(40px,6vw,72px)"}}>
      <div style={{...wrap}}>
        <div style={{borderBottom: "1px solid " + line}}>
          {list(v.levels).map((_l, _i1) => (
            <div key={_i1} className="gc-reveal" style={{"--d": _i1 * 70 + "ms", display: "flex", flexWrap: "wrap", gap: "16px 32px", padding: "28px 0", borderTop: "1px solid " + line}}>
              <div style={{display: "flex", alignItems: "center", gap: "14px", flex: "0 0 260px"}}>
                <span style={{width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: fs.base, background: _l?.bg, color: "#fff"}}>{I(_l?.short)}</span>
                <span>
                  <span style={{display: "block", fontFamily: display, fontWeight: "700", fontSize: fs.lg, color: ink}}>{I(_l?.name)}</span>
                  <span style={{display: "block", fontSize: fs.sm, color: muted}}>{I(_l?.example)}</span>
                </span>
              </div>
              <div style={{flex: "1 1 320px", minWidth: "0"}}>
                <div style={{fontWeight: "700", fontSize: fs.base, color: ink, marginBottom: "4px"}}>{I(_l?.role)}</div>
                <div style={{fontSize: fs.base, lineHeight: "1.6", color: muted}}>{I(_l?.desc)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <section style={{padding: "0 0 clamp(56px,8vw,112px)"}}>
      <div style={{...wrap}}><StepsGrid v={v} /></div>
    </section>
    </>
  );
}
