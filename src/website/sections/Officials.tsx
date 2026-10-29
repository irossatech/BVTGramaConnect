// For officials page: posting, reviewing and getting a login.
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function Officials({ v }: { v: View }) {
  const { ink, blue, muted, display, fs, wrap, h1, kicker, lead, pill } = ui(v);
  return (
    <>
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(32px,5vw,64px)"}}>
      <div style={{...wrap, display: "flex", flexWrap: "wrap", gap: "clamp(28px,4vw,56px)", alignItems: "center", animation: "mk-fade .25s ease-out"}}>
        <div style={{flex: "1 1 420px", display: "flex", flexDirection: "column", gap: "16px"}}>
          <div style={kicker}>{I(v.t?.nav_officials)}</div>
          <h1 style={h1}>{I(v.t?.offTitle)}</h1>
          <p style={lead}>{I(v.t?.offSub)}</p>
        </div>
        <div style={{flex: "1 1 320px", borderRadius: "24px", overflow: "hidden"}}>
          <img src="/assets/village-wide.jpg" alt={v.t?.villageImgAlt} width="774" height="482" loading="lazy" style={{width: "100%", height: "320px", objectFit: "cover", objectPosition: "center 60%", display: "block"}} />
        </div>
      </div>
    </section>
    <section style={{padding: "0 0 clamp(40px,6vw,72px)"}}>
      <div style={{...wrap, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(24px,3vw,40px)"}}>
        {list(v.offCards).map((_c, _i1) => (
          <div key={_i1} className="gc-reveal" style={{"--d": _i1 * 90 + "ms", borderTop: "3px solid " + blue, paddingTop: "18px", display: "flex", flexDirection: "column", gap: "14px"}}>
            <h2 style={{margin: "0", fontFamily: display, fontWeight: "700", fontSize: fs.lg, color: ink}}>{I(_c?.title)}</h2>
            {list(_c?.items).map((_i, _i2) => (
              <div key={_i2} style={{display: "flex", gap: "10px", fontSize: fs.base, lineHeight: "1.55", color: muted}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F8A3B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: "0", marginTop: "3px"}}><path d="M20 6L9 17l-5-5" /></svg>
                <span>{I(_i?.text)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
    <section style={{padding: "0 0 clamp(56px,8vw,112px)"}}>
      <div style={{...wrap}}>
        <div style={{background: blue, color: "#fff", borderRadius: "24px", padding: "clamp(28px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center"}}>
          <div style={{flex: "1 1 380px"}}>
            <div style={{fontFamily: display, fontWeight: "700", fontSize: "clamp(19px,2vw,24px)", lineHeight: v.headLh}}>{I(v.t?.offLoginTitle)}</div>
            <div style={{marginTop: "10px", fontSize: fs.base, lineHeight: "1.6", color: "rgba(255,255,255,.85)"}}>{I(v.t?.offLoginBody)}</div>
          </div>
          <div style={{display: "flex", flexWrap: "wrap", gap: "10px"}}>
            <button className="gc-pill" onClick={v.goContact} style={{...pill, border: "1.5px solid #fff", background: "#fff", color: blue}}>{I(v.t?.contactUs)}</button>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
