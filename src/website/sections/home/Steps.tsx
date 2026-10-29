// Home: how it works, three coloured columns in a white panel.
import { I } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";
import { StepsGrid } from "../../ui/parts";

export default function Steps({ v }: { v: View }) {
  const { fs, wrap, h2, kicker, lead, pillLight } = ui(v);
  return (
    <section style={{padding: "clamp(48px,7vw,88px) 0"}}>
      <div style={{...wrap, display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,32px)"}}>
        <div style={{display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "12px"}}>
          <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            <div style={kicker}>{I(v.t?.howKicker)}</div>
            <h2 className="gc-reveal" style={h2}>{I(v.t?.howTitle)}</h2>
          </div>
          <button className="gc-pill" onClick={v.goHow} style={pillLight}>{I(v.t?.howMore)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
        </div>
        <StepsGrid v={v} />
        <p style={{...lead, fontSize: fs.base, maxWidth: "none"}}>{I(v.t?.how2Sub)}</p>
      </div>
    </section>
  );
}
