// Small pieces more than one section uses. Markup exactly as in the original template.
import type { CSSProperties, ReactNode } from "react";
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { green, ui } from "./theme";

/** The India tricolour as a small flag strip. */
export function Tricolour() {
  return <span aria-hidden="true" style={{display: "flex", height: "10px", width: "30px", borderRadius: "2px", overflow: "hidden", border: "1px solid rgba(0,0,0,.06)"}}><span style={{flex: "1", background: "#E9791E"}} /><span style={{flex: "1", background: "#fff"}} /><span style={{flex: "1", background: green}} /></span>;
}

/** "Free · Verified · No login", each with a tick. */
export function Ticks({ v, color, tick, justify }: { v: View; color: string; tick: string; justify: CSSProperties["justifyContent"] }) {
  const { fs } = ui(v);
  return <div style={{display: "flex", flexWrap: "wrap", justifyContent: justify, gap: "6px 18px", fontSize: fs.sm, fontWeight: "600", color}}>{[v.t?.free, v.t?.verified, v.t?.noLogin].map((x, i) => <span key={i} style={{display: "inline-flex", alignItems: "center", gap: "6px"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tick} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>{I(x)}</span>)}</div>;
}

/** A section heading with the "New in the app" kicker and subtitle. */
export function AppHead({ v, id, title, dark, center }: { v: View; id: string; title: ReactNode; dark: boolean; center?: boolean }) {
  const { ink, muted, kicker, h2, lead } = ui(v);
  return <div style={{display: "flex", flexDirection: "column", gap: "10px", maxWidth: "680px", alignItems: center ? "center" : "flex-start"}}><div style={kicker}>{I(v.t?.appKicker)}</div><h2 id={id} style={{...h2, color: dark ? "#fff" : ink}}>{I(title)}</h2><p style={{...lead, color: dark ? "rgba(255,255,255,.78)" : muted}}>{I(v.t?.appSub)}</p></div>;
}

export const playIcon = <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#32BBFF" d="M3.6 1.9 13.7 12 3.6 22.1c-.4-.2-.6-.6-.6-1.1V3c0-.5.2-.9.6-1.1z" /><path fill="#00D86E" d="M3.6 1.9c.3-.2.8-.2 1.2 0l11.9 6.9-3 3.2z" /><path fill="#FFC700" d="m16.7 8.8 3.6 2.1c.8.5.8 1.7 0 2.2l-3.6 2.1-3-3.2z" /><path fill="#FF3A44" d="m13.7 12 3 3.2-11.9 6.9c-.4.2-.9.2-1.2 0z" /></svg>;
export const appleIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>;
export const storeLabel = (cap: string, name: string) => <span style={{display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.1", textAlign: "left"}}><span style={{fontSize: "10px", fontWeight: "600", letterSpacing: ".04em", opacity: ".75"}}>{cap}</span><span style={{fontSize: "16px", fontWeight: "700", letterSpacing: "-.01em"}}>{name}</span></span>;

/** Google Play and App Store buttons. */
export function StoreButtons({ v }: { v: View }) {
  const { ink, pill } = ui(v);
  return (
    <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
      <button className="gc-pill" onClick={v.playClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid " + ink, background: ink, color: "#fff"}}>{playIcon}{storeLabel("GET IT ON", "Google Play")}</button>
      <button className="gc-pill" onClick={v.appClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid " + ink, background: "#fff", color: ink}}>{appleIcon}{storeLabel("Download on the", "App Store")}</button>
    </div>
  );
}

/** The three steps, as coloured columns joined by thin rules (home and How it works). */
export function StepsGrid({ v }: { v: View }) {
  const { ink, muted, display, fs } = ui(v);
  return (
    <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1px", background: "#cfd8e3", border: "1px solid #cfd8e3", borderRadius: "20px", overflow: "hidden"}}>
      {list(v.steps).map((_s, _i1) => (
        <div key={_i1} className="gc-step gc-reveal" style={{"--d": _i1 * 80 + "ms", background: _s?.bg, padding: "clamp(20px,2.2vw,26px)", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px"}}>
          <span className="gc-dot" style={{width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: _s?.dot, color: "#fff", fontFamily: display, fontWeight: "700", fontSize: "15px"}}>{I(_s?.n)}</span>
          <h3 style={{margin: "0", fontFamily: display, fontWeight: "700", fontSize: "clamp(18px,1.6vw,21px)", lineHeight: v.headLh, color: ink}}>{I(_s?.title)}</h3>
          <div style={{fontSize: fs.base, lineHeight: v.te ? "1.7" : "1.6", color: muted}}>{I(_s?.desc)}</div>
        </div>
      ))}
    </div>
  );
}
