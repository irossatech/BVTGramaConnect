// Home: the download panel (green, so it never runs into the footer's tricolour strip).
import { I } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";
import { appleIcon, playIcon, storeLabel } from "../../ui/parts";

export default function Download({ v }: { v: View }) {
  const { ink, green, fs, wrap, h2, lead, pill } = ui(v);
  return (
    <section id="get-app" style={{padding: "clamp(40px,6vw,72px) 0"}}>
      <div style={{...wrap}}>
        <div className="gc-reveal" style={{position: "relative", overflow: "hidden", borderRadius: "24px", background: green, color: "#fff", padding: "clamp(28px,4vw,48px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px 40px", boxShadow: "0 20px 44px -24px rgba(31,138,59,.6)"}}>
          {/* Announcement waves: a drum's sound spreading out, the app's own idea of "chatimpu" */}
          <svg aria-hidden="true" width="480" height="480" viewBox="0 0 480 480" fill="none" style={{position: "absolute", right: "-240px", bottom: "-240px", pointerEvents: "none"}}>
            {[70, 120, 170, 220].map((r, i) => <circle key={r} cx="240" cy="240" r={r} stroke="#fff" strokeOpacity={0.18 - i * 0.035} strokeWidth="1.5" />)}
            <circle cx="240" cy="240" r="34" fill="#f2dd3d" fillOpacity=".9" />
          </svg>
          <div style={{position: "relative", display: "flex", alignItems: "center", gap: "18px", flex: "1 1 420px", minWidth: "0"}}>
            <span style={{flexShrink: "0", width: "64px", height: "64px", borderRadius: "20px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px -8px rgba(0,0,0,.3)"}}>
              <img src="/assets/logo-mark.png" alt="" style={{width: "48px", height: "48px", borderRadius: "18.5%"}} />
            </span>
            <div style={{display: "flex", flexDirection: "column", gap: "6px", minWidth: "0"}}>
              <h2 style={{...h2, color: "#fff", fontSize: "clamp(22px,2.4vw,30px)"}}>{I(v.t?.ctaTitle)}</h2>
              <p style={{...lead, fontSize: fs.base, color: "rgba(255,255,255,.9)"}}>{I(v.t?.ctaSub)}</p>
            </div>
          </div>
          <div style={{position: "relative", display: "flex", flexWrap: "wrap", gap: "12px"}}>
            <button className="gc-pill" onClick={v.playClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid #fff", background: "#fff", color: ink}}>{playIcon}{storeLabel("GET IT ON", "Google Play")}</button>
            <button className="gc-pill" onClick={v.appClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid rgba(255,255,255,.75)", background: "rgba(255,255,255,.08)", color: "#fff"}}>{appleIcon}{storeLabel(v.appLabel[0], v.appLabel[1])}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
