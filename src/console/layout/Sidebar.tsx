// The navy side bar: logo, the pages this user may open in four short groups, the footer note.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function Sidebar({ v }: { v: View }) {
  return (
    <aside id="sa-nav" className="sa-side" style={{background: "#0A2550", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 14px 16px", minHeight: "0", overflowY: "auto"}}>
      <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "4px 10px 14px"}}>
        <img src="/assets/logo-mark-192.webp" alt="" style={{width: "40px", height: "40px", borderRadius: "18.5%"}} />
        <div>
          <div style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "14px", letterSpacing: ".03em", lineHeight: "1.2"}}>GRAMA CONNECT</div>
          <div style={{fontSize: "11px", opacity: ".7"}}>Super Admin Console</div>
        </div>
      </div>
      <nav aria-label="Console" style={{display: "flex", flexDirection: "column", gap: "10px"}}>
        {list(v.navGroups).map((_g, _gi) => (
          <div key={_gi} role="group" aria-label={_g.label || "Overview"} style={{display: "flex", flexDirection: "column", gap: "2px"}}>
            {_g.label ? <div aria-hidden="true" style={{padding: "0 12px 6px", fontSize: "11px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", color: "rgba(255,255,255,.45)"}}>{I(_g.label)}</div> : null}
            {list(_g.items).map((_n, _i1) => (
              <React.Fragment key={_i1}>
                <button className="sa-navb" onClick={_n?.go} aria-current={_n?.on ? "page" : undefined} style={css(`display:flex;align-items:center;gap:12px;height:38px;padding:0 12px;border:0;border-radius:10px;cursor:pointer;text-align:left;font-size:14px;font-weight:600;color: ${_n?.color ?? ""};background: ${_n?.bg ?? ""}`)}>
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: "0"}}><path d={_n?.d} /></svg>
                  <span style={{flex: "1", minWidth: "0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{I(_n?.label)}</span>
                  {_n?.hasCount ? <span style={{minWidth: "22px", height: "20px", padding: "0 7px", borderRadius: "999px", background: "#E9791E", color: "#fff", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", fontFamily: "'Rubik',sans-serif"}}>{I(_n?.count)}</span> : null}
                </button>
              </React.Fragment>
            ))}
          </div>
        ))}
      </nav>
      <div style={{marginTop: "auto", padding: "18px 12px 0", fontSize: "11.5px", lineHeight: "1.5", color: "rgba(255,255,255,.55)"}}><span style={{display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>మన గ్రామం – మన సేవలు – మన అభివృద్ధి</span>v2.4 · Andhra Pradesh</div>
    </aside>
  );
}
