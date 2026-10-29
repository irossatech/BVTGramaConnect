// Home: who it is for, each audience marked by its brand accent.
import { I, list } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";

export default function Audiences({ v }: { v: View }) {
  const { ink, muted, line, display, fs, wrap, h2, kicker, textBtn } = ui(v);
  return (
    <section style={{background: "#fff", borderTop: "1px solid " + line, borderBottom: "1px solid " + line, padding: "clamp(48px,7vw,88px) 0"}}>
      <div style={{...wrap, display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,32px)"}}>
        <h2 className="gc-reveal" style={h2}>{I(v.t?.whoTitle)}</h2>
        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(20px,3vw,36px)"}}>
          {list(v.audiences).map((_a, _i1) => (
            <div key={_i1} className="gc-reveal" style={{"--d": _i1 * 90 + "ms", borderTop: "3px solid " + _a?.accent, paddingTop: "18px", display: "flex", flexDirection: "column", gap: "8px"}}>
              <div style={{...kicker, color: _a?.accent}}>{I(_a?.kicker)}</div>
              <div style={{fontFamily: display, fontWeight: "700", fontSize: fs.lg, lineHeight: v.headLh, color: ink}}>{I(_a?.title)}</div>
              <div style={{fontSize: fs.base, lineHeight: v.te ? "1.7" : "1.6", color: muted, flex: "1"}}>{I(_a?.desc)}</div>
              <button onClick={_a?.go} style={{...textBtn, color: _a?.accent, alignSelf: "flex-start", marginTop: "6px"}}>{I(_a?.cta)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
