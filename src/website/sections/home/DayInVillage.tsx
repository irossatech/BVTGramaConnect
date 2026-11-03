// Home: a day in the village, read like a schedule. Heading stays put on the left (desktop) while the day runs
// down the right: time, a rail that fills in as each moment arrives, then the feature and what it does for you.
import { I, list } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";

export default function DayInVillage({ v }: { v: View }) {
  const { ink, line, display, fs, wrap, h2, lead } = ui(v);
  const items = list(v.day.items);
  const m = v.mobile;
  return (
    <section aria-labelledby="app-title-d" style={{padding: "clamp(48px,7vw,88px) 0 0"}}>
      <div style={{...wrap, display: "grid", gridTemplateColumns: m ? "minmax(0,1fr)" : "minmax(0,5fr) minmax(0,7fr)", gap: m ? "28px" : "clamp(40px,6vw,88px)", alignItems: "start"}}>
        <div className="gc-reveal" style={{position: m ? "static" : "sticky", top: "140px", display: "flex", flexDirection: "column", gap: "20px"}}>
          <h2 id="app-title-d" style={h2}>{I(v.day.title)}</h2>
          {m ? null : <p style={{...lead, fontSize: fs.base, paddingTop: "20px", borderTop: "1px solid " + line}}>{I(v.t?.appMore)}</p>}
        </div>
        <ol style={{listStyle: "none", margin: "0", padding: "0"}}>
          {items.map((_d, _i1) => {
            const last = _i1 === items.length - 1;
            const time = <span style={{fontFamily: display, fontWeight: "700", fontSize: m ? fs.md : fs.xl, lineHeight: "1.2", color: _d?.color, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap"}}>{I(_d?.time)}</span>;
            const feature = <span style={{display: "inline-flex", alignItems: "center", gap: "6px", fontSize: fs.sm, fontWeight: "700", color: _d?.color}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={_d?.icon} /></svg>{I(_d?.title)}</span>;
            return (
              <li key={_i1} className="gc-reveal gc-moment" style={{"--from": "20px", display: "grid", gridTemplateColumns: m ? "20px minmax(0,1fr)" : "112px 20px minmax(0,1fr)", columnGap: m ? "14px" : "20px", color: _d?.color}}>
                {m ? null : <div style={{paddingTop: "2px", textAlign: "right"}}>{time}</div>}
                <div aria-hidden="true" style={{position: "relative"}}>
                  <span className="gc-tl-dot" style={{position: "absolute", top: m ? "4px" : "6px", left: "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", border: "3px solid currentColor", boxSizing: "border-box", zIndex: "1"}} />
                  {last ? null : <span style={{position: "absolute", top: m ? "12px" : "14px", bottom: m ? "-12px" : "-14px", left: "9px", width: "2px", background: line}}><span className="gc-seg" style={{display: "block", height: "100%", background: "currentColor"}} /></span>}
                </div>
                <div style={{display: "flex", flexDirection: "column", gap: "6px", paddingBottom: last ? "0" : m ? "28px" : "36px"}}>
                  {m ? <span style={{display: "flex", alignItems: "baseline", gap: "6px 12px", flexWrap: "wrap"}}>{time}{feature}</span> : <span style={{paddingTop: "6px"}}>{feature}</span>}
                  <span style={{fontFamily: display, fontWeight: "600", fontSize: m ? fs.base : fs.lg, lineHeight: v.headLh, color: ink, textWrap: "pretty"}}>{I(_d?.story)}</span>
                </div>
              </li>
            );
          })}
        </ol>
        {m ? <p className="gc-reveal" style={{...lead, fontSize: fs.base, paddingTop: "20px", borderTop: "1px solid " + line}}>{I(v.t?.appMore)}</p> : null}
      </div>
    </section>
  );
}
