// Home: a day in the village, read like a schedule. Heading stays put on the left (desktop) while the day runs
// down the right: time, a rail that fills in as each moment arrives, then the feature and what it does for you.
import { I, list } from "../../../shared/dc";
import type { View } from "../../Site";
import { rsp, ui } from "../../ui/theme";

export default function DayInVillage({ v }: { v: View }) {
  const { ink, line, display, fs, wrap, h2, lead } = ui(v);
  const items = list(v.day.items);
  return (
    <section aria-labelledby="app-title-d" style={{padding: "clamp(48px,7vw,88px) 0 0"}}>
      <div style={{...wrap, display: "grid", gridTemplateColumns: rsp("minmax(0,5fr) minmax(0,7fr)", "minmax(0,1fr)"), gap: rsp("clamp(40px,6vw,88px)", "28px"), alignItems: "start"}}>
        <div className="gc-reveal gc-stick" style={{top: "140px", display: "flex", flexDirection: "column", gap: "20px"}}>
          <h2 id="app-title-d" style={h2}>{I(v.day.title)}</h2>
          <p className="gc-wide" style={{...lead, fontSize: fs.base, paddingTop: "20px", borderTop: "1px solid " + line}}>{I(v.t?.appMore)}</p>
        </div>
        <ol style={{listStyle: "none", margin: "0", padding: "0"}}>
          {items.map((_d, _i1) => {
            const last = _i1 === items.length - 1;
            const time = <span style={{fontFamily: display, fontWeight: "700", fontSize: rsp(fs.xl, fs.md), lineHeight: "1.2", color: _d?.color, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap"}}>{I(_d?.time)}</span>;
            const feature = <span style={{display: "inline-flex", alignItems: "center", gap: "6px", fontSize: fs.sm, fontWeight: "700", color: _d?.color}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={_d?.icon} /></svg>{I(_d?.title)}</span>;
            return (
              <li key={_i1} className="gc-reveal gc-moment" style={{"--from": "20px", display: "grid", gridTemplateColumns: rsp("112px 20px minmax(0,1fr)", "20px minmax(0,1fr)"), columnGap: rsp("20px", "14px"), color: _d?.color}}>
                <div className="gc-wide" style={{paddingTop: "2px", textAlign: "right"}}>{time}</div>
                <div aria-hidden="true" style={{position: "relative"}}>
                  <span className="gc-tl-dot" style={{position: "absolute", top: rsp("6px", "4px"), left: "2px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", border: "3px solid currentColor", boxSizing: "border-box", zIndex: "1"}} />
                  {last ? null : <span style={{position: "absolute", top: rsp("14px", "12px"), bottom: rsp("-14px", "-12px"), left: "9px", width: "2px", background: line}}><span className="gc-seg" style={{display: "block", height: "100%", background: "currentColor"}} /></span>}
                </div>
                <div style={{display: "flex", flexDirection: "column", gap: "6px", paddingBottom: last ? "0" : rsp("36px", "28px")}}>
                  <span className="gc-phone" style={{display: "flex", alignItems: "baseline", gap: "6px 12px", flexWrap: "wrap"}}>{time}{feature}</span><span className="gc-wide" style={{paddingTop: "6px"}}>{feature}</span>
                  <span style={{fontFamily: display, fontWeight: "600", fontSize: rsp(fs.lg, fs.base), lineHeight: v.headLh, color: ink, textWrap: "pretty"}}>{I(_d?.story)}</span>
                </div>
              </li>
            );
          })}
        </ol>
        <p className="gc-reveal gc-phone" style={{...lead, fontSize: fs.base, paddingTop: "20px", borderTop: "1px solid " + line}}>{I(v.t?.appMore)}</p>
      </div>
    </section>
  );
}
