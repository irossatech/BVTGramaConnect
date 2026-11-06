// How it works page: state, district, mandal and village, and the three steps.
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { rsp, ui } from "../ui/theme";
import { DetailRows, StepsGrid } from "../ui/parts";

export default function HowItWorks({ v }: { v: View }) {
  const { ink, muted, line, cream, display, fs, wrap, h1, lead } = ui(v);
  const levels = list(v.levels);
  const step = 72; // each level starts this much further in (wide screens; phones: no indent)
  return (
    <>
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(24px,4vw,48px)"}}>
      <div style={{...wrap, display: "flex", flexDirection: "column", gap: "16px", animation: "mk-fade .25s ease-out"}}>
        <h1 style={{...h1, maxWidth: "900px"}}>{I(v.t?.how2Title)}</h1>
        <p style={lead}>{I(v.t?.how2Sub)}</p>
      </div>
    </section>
    {/* The four levels as a ladder: a rail joins the badges and fills level by level as they come into view. */}
    <section style={{padding: "0 0 clamp(40px,6vw,72px)"}}>
      <div style={{...wrap}}>
        <ol style={{listStyle: "none", margin: "0 -16px", padding: "0"}}>
          {levels.map((_l, _i1) => (
            <li key={_i1} className="gc-reveal gc-moment gc-level" style={{"--d": _i1 * 70 + "ms", position: "relative", marginLeft: rsp(_i1 * step + "px", "0px"), display: "grid", gridTemplateColumns: rsp("44px minmax(180px,240px) minmax(0,1fr)", "44px minmax(0,1fr)"), gap: rsp("0 24px", "10px 14px"), alignItems: "start", padding: "20px 16px", borderRadius: "18px", color: _l?.bg}}>
              {_i1 < levels.length - 1 ? <>
                {/* Wide screens: a staircase connector drops from this badge and turns right into the next one, drawing itself in. Phones: a straight rail. */}
                <span className="gc-wide" aria-hidden="true" style={{position: "absolute", left: "37px", top: "68px", bottom: "-42px", width: step - 21 + "px", boxSizing: "border-box", border: "2px solid " + line, borderTop: "0", borderRight: "0", borderBottomLeftRadius: "16px"}}><span className="gc-draw" style={{position: "absolute", inset: "0 0 -2px -2px", border: "2px solid currentColor", borderTop: "0", borderRight: "0", borderBottomLeftRadius: "16px"}} /></span>
                <span className="gc-phone" aria-hidden="true" style={{position: "absolute", left: "37px", top: "68px", bottom: "-20px", width: "2px", background: line}}><span className="gc-seg" style={{display: "block", height: "100%", background: "currentColor"}} /></span></> : null}
              <span className="gc-lv-dot" aria-hidden="true" style={{width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: display, fontWeight: "700", fontSize: fs.base, background: _l?.bg, color: "#fff", boxShadow: "0 0 0 5px " + cream}}>{I(_l?.short)}</span>
              <span style={{paddingTop: "2px"}}>
                <span style={{display: "block", fontFamily: display, fontWeight: "700", fontSize: fs.lg, lineHeight: "1.3", color: ink}}>{I(_l?.name)}</span>
                <span style={{display: "block", marginTop: "2px", fontSize: fs.sm, lineHeight: "1.45", color: muted}}>{I(_l?.example)}</span>
              </span>
              <div style={{gridColumn: rsp("auto", "2"), minWidth: "0", paddingTop: rsp("2px", "0")}}>
                <div style={{display: "inline-flex", alignItems: "center", gap: "6px", fontWeight: "700", fontSize: fs.sm, color: _l?.bg, marginBottom: "6px"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" /></svg>{I(_l?.role)}</div>
                <div style={{fontSize: fs.base, lineHeight: v.te ? "1.75" : "1.6", color: muted, maxWidth: "62ch", textWrap: "pretty"}}>{I(_l?.desc)}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
    <section style={{padding: "0 0 clamp(56px,8vw,112px)"}}>
      <div style={{...wrap}}><StepsGrid v={v} /></div>
    </section>
    <section style={{padding: "0 0 clamp(56px,8vw,112px)"}}>
      <div style={{...wrap}}><DetailRows v={v} title={v.t?.hwTitle} sub={v.t?.hwSub} items={v.howDetails} /></div>
    </section>
    </>
  );
}
