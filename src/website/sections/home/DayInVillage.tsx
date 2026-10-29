// Home: a day in the village; each moment is one app feature, the line fills as you scroll.
import { I, list } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";
import { AppHead } from "../../ui/parts";

export default function DayInVillage({ v }: { v: View }) {
  const { ink, green, line, display, fs, wrap, lead } = ui(v);
  return (
    <section aria-labelledby="app-title-d" style={{padding: "clamp(48px,7vw,88px) 0 0"}}>
        <div style={{...wrap, display: "flex", flexDirection: "column", gap: "clamp(28px,4vw,48px)"}}>
          <div className="gc-reveal" style={{textAlign: v.mobile ? "left" : "center", display: "flex", justifyContent: v.mobile ? "flex-start" : "center"}}><AppHead v={v} id="app-title-d" title={v.day.title} dark={false} center={!v.mobile} /></div>
          <div ref={v.day.ref} style={{position: "relative", display: "flex", flexDirection: "column", gap: v.mobile ? "16px" : "6px"}}>
            <span aria-hidden="true" style={{position: "absolute", top: "8px", bottom: "8px", left: v.mobile ? "19px" : "50%", width: "2px", marginLeft: "-1px", background: line}}><span ref={v.day.fillRef} style={{display: "block", height: "100%", background: green, transform: "scaleY(0)", transformOrigin: "50% 0"}} /></span>
            {list(v.day.items).map((_d, _i1) => {
              const right = !v.mobile && _i1 % 2 === 1;
              return (
                <div key={_i1} className="gc-reveal gc-moment" style={{"--from": "28px", position: "relative", display: "flex", justifyContent: right ? "flex-end" : "flex-start", paddingLeft: v.mobile ? "48px" : "0", color: _d?.color}}>
                  <span className="gc-tl-dot" aria-hidden="true" style={{position: "absolute", top: "24px", left: v.mobile ? "12px" : "calc(50% - 8px)", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", border: "3px solid currentColor", boxSizing: "border-box"}} />
                  <div className="gc-moment-card" style={{boxSizing: "border-box", width: v.mobile ? "100%" : "calc(50% - 44px)", background: "#fff", color: ink, border: "1px solid " + line, borderRadius: "20px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px"}}>
                    <span style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap"}}>
                      <span style={{padding: "4px 10px", borderRadius: "999px", background: _d?.bg, color: _d?.color, fontSize: fs.xs, fontWeight: "800"}}>{I(_d?.time)}</span>
                      <span style={{display: "inline-flex", alignItems: "center", gap: "6px", fontSize: fs.sm, fontWeight: "700", color: _d?.color}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={_d?.icon} /></svg>{I(_d?.title)}</span>
                    </span>
                    <span style={{fontFamily: display, fontWeight: "600", fontSize: fs.md, lineHeight: v.headLh, color: ink}}>{I(_d?.story)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="gc-reveal" style={{...lead, fontSize: fs.base, maxWidth: "none", textAlign: v.mobile ? "left" : "center"}}>{I(v.t?.appMore)}</p>
        </div>
      </section>
  );
}
