// Services or bills & recharges shown on the app's Home (one list, two catalogs).
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function Services({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <span style={{flex: "1", minWidth: "240px", fontSize: "13px", color: "#6b7a8c", lineHeight: "1.5"}}>{I(v.catSub)}</span>
        <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.svcShownLabel)}</span>
        <button onClick={v.newService} disabled={v.svcsUnavailable} style={css(`height:40px;padding:0 18px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;font-size:13px;display:inline-flex;align-items:center;gap:6px;opacity: ${v.svcsUnavailable ? .5 : 1}`)}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>{I(v.catNew)}</button>
      </div>
      {v.svcsUnavailable ? <div role="status" style={{background: "#FFF0DC", color: "#9a4a08", borderRadius: "12px", padding: "12px 16px", fontSize: "13px", lineHeight: "1.5"}}>{I(v.catUnavailText)}</div> : null}
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
        {list(v.svcRows).map((_g, _i1) => (
          <div key={_i1} style={css(`display:flex;align-items:center;gap:14px;padding:12px 16px;border-top: ${_i1 ? "1px solid #f3f5f8" : "0"}`)}>
            <span style={{opacity: _g?.on ? "1" : ".45", display: "flex"}}><span style={{width: "44px", height: "44px", borderRadius: "13px", background: _g.tint, color: _g.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>{_g.img ? <img src={_g.img} alt="" style={{height: "24px", maxWidth: "30px"}} /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={_g.d} /></svg>}</span></span>
            <button onClick={_g?.open} disabled={_g?.locked} style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px", textAlign: "left", background: "none", border: "0", padding: "0", cursor: _g?.locked ? "default" : "pointer"}}>
              <span style={{fontWeight: "700", fontSize: "14.5px", color: _g?.on ? "#0A2550" : "#6b7a8c"}}>{I(_g?.name)}</span>
              <span style={{fontSize: "12.5px", color: "#6b7a8c"}}>{I(_g?.sub)}</span>
            </button>
            <button onClick={_g?.up} disabled={!_g?.canUp} aria-label={"Move up: " + (_g?.name || "")} style={{width: "34px", height: "34px", border: "0", borderRadius: "8px", background: "none", cursor: "pointer", color: _g?.canUp ? "#3b4a5c" : "#cfd8e3", display: "flex", alignItems: "center", justifyContent: "center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6" /></svg></button>
            <button onClick={_g?.down} disabled={!_g?.canDown} aria-label={"Move down: " + (_g?.name || "")} style={{width: "34px", height: "34px", border: "0", borderRadius: "8px", background: "none", cursor: "pointer", color: _g?.canDown ? "#3b4a5c" : "#cfd8e3", display: "flex", alignItems: "center", justifyContent: "center"}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg></button>
            <button type="button" role="switch" aria-checked={!!_g?.on} aria-label={"Show on Home: " + (_g?.name || "")} onClick={_g?.toggle} disabled={_g?.locked} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:999px;border:0;padding:3px;cursor:pointer;display:flex;transition:background .15s;justify-content: ${_g?.on ? "flex-end" : "flex-start"};background: ${_g?.on ? "#1F8A3B" : "#cfd8e3"};opacity: ${_g?.locked ? .5 : 1}`)}><span style={{width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)"}} /></button>
            <button onClick={_g?.open} disabled={_g?.locked} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", opacity: _g?.locked ? ".5" : "1"}}>Edit</button>
          </div>
        ))}
        {v.svcsEmpty ? <div style={{padding: "40px", textAlign: "center", color: "#6b7a8c", fontSize: "13px"}}>{I(v.svcsEmptyText)}</div> : null}
      </div>
      <span style={{fontSize: "12.5px", color: "#6b7a8c", lineHeight: "1.5"}}>{I(v.catHelp)}</span>
    </>
  );
}
