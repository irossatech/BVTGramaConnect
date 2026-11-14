// Home: a rotating word, the village photo ringed by turning text, and a ticker of the newest posts.
import { I, list } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";
import { Tricolour, StoreButtons, RotatingWord } from "../../ui/parts";

export default function Hero({ v }: { v: View }) {
  const { ink, cream, display, fs, wrap, h2, lead, badgeLight } = ui(v);
  return (
    <section style={{position: "relative", overflow: "hidden", background: cream}}>
        <div style={{...wrap, padding: "clamp(24px,min(4vw,5vh),56px) clamp(16px,4vw,40px) clamp(32px,min(5vw,6vh),64px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(32px,5vw,64px)"}}>
          <div style={{flex: "1 1 520px", minWidth: "0", display: "flex", flexDirection: "column", gap: "clamp(14px,2.4vh,20px)"}}>
            <span className="gc-in" style={{...badgeLight, "--d": "0ms"}}><Tricolour />{I(v.t?.heroBadge)}</span>
            <h1 className="gc-in" style={{"--d": "90ms", ...h2, fontWeight: v.te ? "700" : "800", fontSize: v.te ? "clamp(28px,min(4vw,7vh),52px)" : "clamp(32px,min(4.8vw,8.5vh),64px)", lineHeight: v.headLh}}>
              {I(v.t?.wordPre)}{" "}
              <span style={{display: "inline-block", verticalAlign: "bottom", overflow: "hidden", paddingBottom: ".06em"}}>
                <RotatingWord words={v.words} />
              </span>
              {v.t?.wordPost ? <>{" "}{I(v.t.wordPost)}</> : null}
            </h1>
            <p className="gc-in" style={{"--d": "180ms", ...lead}}>{I(v.t?.heroSub)}</p>
            <div className="gc-in" style={{"--d": "270ms"}}><StoreButtons v={v} /></div>
          </div>
          <div className="gc-in" style={{"--d": "200ms", flex: "0 1 auto", minWidth: "0", margin: "0 auto", position: "relative", width: "min(100%,400px,max(280px,62vh))", aspectRatio: "1"}}>
            <svg className="gc-spin" viewBox="0 0 400 400" aria-hidden="true" style={{position: "absolute", inset: "0", width: "100%", height: "100%"}}>
              <defs><path id="gc-ring" d="M200 200 m-182 0 a182 182 0 1 1 364 0 a182 182 0 1 1 -364 0" /></defs>
              <text style={{fontFamily: display, fontWeight: "700", fontSize: fs.base, letterSpacing: "3px", fill: ink}}><textPath href="#gc-ring" textLength="1140" lengthAdjust="spacing">{v.ringText}</textPath></text>
            </svg>
            <div style={{position: "absolute", inset: "13%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(10,37,80,.5)"}}>
              <img src="/assets/village-square.webp" srcSet="/assets/village-square-320.webp 320w, /assets/village-square-480.webp 480w, /assets/village-square.webp 632w" sizes="300px" alt={v.t?.villageImgAlt} width="632" height="632" fetchPriority="high" style={{width: "100%", height: "100%", objectFit: "cover"}} />
            </div>
          </div>
        </div>
        {/* chatimpu ticker: the newest titles, scrolling; pauses on hover, and on a tap or keyboard focus (tabIndex),
            so phone and keyboard users can stop it too (audit WEB-A11Y-001) */}
        <div style={{background: ink, color: "#fff", display: "flex", alignItems: "stretch", overflow: "hidden"}}>
          <span style={{flexShrink: "0", display: "flex", alignItems: "center", gap: "8px", padding: "0 18px", background: "#E9791E", color: ink, fontWeight: "700", fontSize: fs.sm, position: "relative", zIndex: "1"}}>
            <span aria-hidden="true" className="gc-live" style={{width: "8px", height: "8px", borderRadius: "50%", background: "#fff"}} />{I(v.t?.tickerLabel)}
          </span>
          <div className="gc-ticker" tabIndex={0} role="region" aria-label={v.t?.tickerLabel} style={{flex: "1", overflow: "hidden", padding: "14px 0"}}>
            <div className="gc-ticker-track" style={{display: "flex", width: "max-content"}}>
              {[0, 1].map(copy => (
                <div key={copy} aria-hidden={copy === 1} style={{display: "flex", gap: "40px", paddingRight: "40px", whiteSpace: "nowrap", fontSize: fs.base}}>
                  {list(v.feed).map((_p, _i1) => <span key={_i1}><b style={{color: "#f2dd3d", fontWeight: "700"}}>{I(_p?.chip)}</b>{" · "}<span lang={_p?.lang}>{I(_p?.title)}</span>{_p?.meta ? <span style={{opacity: ".65"}}>{" · " + _p.meta}</span> : null}</span>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
