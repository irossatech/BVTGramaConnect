// Home: a rotating word, the village photo ringed by turning text, and a ticker of the newest posts.
import { I, list } from "../../../shared/dc";
import type { View } from "../../Site";
import { ui } from "../../ui/theme";
import { Tricolour, Ticks, StoreButtons } from "../../ui/parts";

export default function Hero({ v }: { v: View }) {
  const { ink, green, muted, cream, display, fs, wrap, h2, lead, badgeLight } = ui(v);
  return (
    <section style={{position: "relative", overflow: "hidden", background: cream}}>
        <div style={{...wrap, padding: "clamp(40px,6vw,88px) clamp(16px,4vw,40px) clamp(40px,6vw,72px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(32px,5vw,64px)"}}>
          <div style={{flex: "1 1 520px", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px"}}>
            <span className="gc-reveal" style={{...badgeLight, "--d": "0ms"}}><Tricolour />{I(v.t?.heroBadge)}</span>
            <h1 className="gc-reveal" style={{"--d": "90ms", ...h2, fontWeight: v.te ? "700" : "800", fontSize: v.te ? "clamp(30px,4vw,52px)" : "clamp(36px,4.8vw,64px)", lineHeight: v.headLh}}>
              {I(v.t?.wordPre)}{" "}
              <span style={{display: "inline-block", verticalAlign: "bottom", overflow: "hidden", paddingBottom: ".06em"}}>
                <span key={v.wordIdx} className="gc-word" style={{display: "inline-flex", alignItems: "center", gap: ".25em", color: v.word.color}}><img src={v.word.icon} alt="" style={{width: ".85em", height: ".85em", borderRadius: "50%", flexShrink: "0"}} />{I(v.word.text)}</span>
              </span>
              {v.t?.wordPost ? <>{" "}{I(v.t.wordPost)}</> : null}
            </h1>
            <p className="gc-reveal" style={{"--d": "180ms", ...lead}}>{I(v.t?.heroSub)}</p>
            <div className="gc-reveal" style={{"--d": "270ms"}}><StoreButtons v={v} /></div>
            <div className="gc-reveal" style={{"--d": "360ms"}}><Ticks v={v} color={muted} tick={green} justify="flex-start" /></div>
          </div>
          <div className="gc-reveal" style={{"--d": "200ms", flex: "0 1 400px", minWidth: "0", margin: "0 auto", position: "relative", width: "min(100%,400px)", aspectRatio: "1"}}>
            <svg className="gc-spin" viewBox="0 0 400 400" aria-hidden="true" style={{position: "absolute", inset: "0", width: "100%", height: "100%"}}>
              <defs><path id="gc-ring" d="M200 200 m-182 0 a182 182 0 1 1 364 0 a182 182 0 1 1 -364 0" /></defs>
              <text style={{fontFamily: display, fontWeight: "700", fontSize: fs.base, letterSpacing: "3px", fill: ink}}><textPath href="#gc-ring" textLength="1140" lengthAdjust="spacing">{v.ringText}</textPath></text>
            </svg>
            <div style={{position: "absolute", inset: "13%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(10,37,80,.5)"}}>
              <img src="/assets/village-square.jpg" alt={v.t?.villageImgAlt} width="632" height="632" fetchPriority="high" style={{width: "100%", height: "100%", objectFit: "cover"}} />
            </div>
            <button className={"gc-speak" + (v.speaking ? " is-on" : "")} onClick={v.listen} aria-pressed={v.speaking} aria-label={v.speaking ? v.t?.stopListen : v.t?.listen} title={v.speaking ? v.t?.stopListen : v.t?.listen} style={{position: "absolute", right: "15%", bottom: "15%", width: "72px", height: "72px", padding: "0", border: "0", borderRadius: "50%", background: v.speaking ? ink : "#f2dd3d", color: v.speaking ? "#f2dd3d" : ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(10,37,80,.4)"}}>
              {v.speaking ? <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>
                : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>}
            </button>
          </div>
        </div>
        {/* chatimpu ticker: the newest titles, scrolling; pauses on hover */}
        <div style={{background: ink, color: "#fff", display: "flex", alignItems: "stretch", overflow: "hidden"}}>
          <span style={{flexShrink: "0", display: "flex", alignItems: "center", gap: "8px", padding: "0 18px", background: "#E9791E", fontWeight: "700", fontSize: fs.sm, position: "relative", zIndex: "1"}}>
            <span aria-hidden="true" className="gc-live" style={{width: "8px", height: "8px", borderRadius: "50%", background: "#fff"}} />{I(v.t?.tickerLabel)}
          </span>
          <div className="gc-ticker" style={{flex: "1", overflow: "hidden", padding: "14px 0"}}>
            <div className="gc-ticker-track" style={{display: "flex", width: "max-content"}}>
              {[0, 1].map(copy => (
                <div key={copy} aria-hidden={copy === 1} style={{display: "flex", gap: "40px", paddingRight: "40px", whiteSpace: "nowrap", fontSize: fs.base}}>
                  {list(v.feed).map((_p, _i1) => <span key={_i1}><b style={{color: "#f2dd3d", fontWeight: "700"}}>{I(_p?.chip)}</b>{" · "}{I(_p?.title)}{_p?.meta ? <span style={{opacity: ".65"}}>{" · " + _p.meta}</span> : null}</span>)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}
