// Home: what the app gives citizens, as a ruled list.
import { I, list } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";

export default function Services({ v }: { v: View }) {
  const { ink, muted, line, display, fs, wrap, h2, kicker, lead } = ui(v);
  return (
    <section style={{background: "#fff", borderTop: "1px solid " + line, borderBottom: "1px solid " + line, padding: "clamp(48px,7vw,88px) 0"}}>
      <div style={{...wrap, display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,64px)"}}>
        <div className="gc-reveal" style={{flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "12px"}}>
          <div style={kicker}>{I(v.t?.servicesKicker)}</div>
          <h2 style={h2}>{I(v.t?.servicesTitle)}</h2>
          <p style={lead}>{I(v.t?.servicesSub)}</p>
        </div>
        <div style={{flex: "1 1 520px", minWidth: "0", borderBottom: "1px solid " + line}}>
          {list(v.features).map((_f, _i1) => (
            <div key={_i1} className="gc-row gc-reveal" style={{"--d": _i1 * 60 + "ms", display: "flex", gap: "16px", alignItems: "flex-start", padding: "16px 0", borderTop: "1px solid " + line}}>
              <img src={_f?.icon} alt="" style={{width: "38px", height: "38px", borderRadius: "50%", flexShrink: "0"}} />
              <div>
                <div style={{fontFamily: display, fontWeight: "600", fontSize: fs.md, lineHeight: "1.4", color: ink}}>{I(_f?.title)}</div>
                <div style={{marginTop: "3px", fontSize: fs.base, lineHeight: v.te ? "1.7" : "1.55", color: muted}}>{I(_f?.desc)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
