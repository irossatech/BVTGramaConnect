// Home: how it works, the three steps under a heading and one line of context.
import { I } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";
import { StepsGrid } from "../../ui/parts";

export default function Steps({ v }: { v: View }) {
  const { fs, wrap, h2, lead, pillLight } = ui(v);
  return (
    <section style={{padding: "clamp(48px,7vw,88px) 0"}}>
      <div style={{...wrap, display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,32px)"}}>
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "12px"}}>
          <div className="gc-reveal" style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            <h2 style={h2}>{I(v.t?.howTitle)}</h2>
            <p style={{...lead, fontSize: fs.base}}>{I(v.t?.how2Sub)}</p>
          </div>
          <button className="gc-pill" onClick={v.goHow} style={pillLight}>{I(v.t?.howMore)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
        </div>
        <StepsGrid v={v} />
      </div>
    </section>
  );
}
