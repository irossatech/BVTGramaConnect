// The navy side bar: logo, the pages this user may open, the footer note.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function Sidebar({ v }: { v: View }) {
  return (
    <aside style={{background: "#0A2550", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 14px", gap: "6px", minHeight: "0", overflowY: "auto"}}>
      <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "4px 10px 20px"}}>
        <img src="/assets/logo-mark.png" alt="" style={{width: "40px", height: "40px", borderRadius: "18.5%"}} />
        <div>
          <div style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "14px", letterSpacing: ".03em", lineHeight: "1.2"}}>GRAMA CONNECT</div>
          <div style={{fontSize: "11px", opacity: ".7"}}>Super Admin Console</div>
        </div>
      </div>
      {list(v.navItems).map((_n, _i1) => (
        <React.Fragment key={_i1}>
          <button onClick={_n?.go} style={css(`display:flex;align-items:center;gap:12px;height:44px;padding:0 12px;border:0;border-radius:10px;cursor:pointer;text-align:left;font-size:14px;font-weight:600;color: ${_n?.color ?? ""};background: ${_n?.bg ?? ""}`)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={_n?.d} /></svg>
            <span style={{flex: "1"}}>{I(_n?.label)}</span>
            {_n?.hasCount ? <span style={{minWidth: "22px", height: "22px", padding: "0 7px", borderRadius: "999px", background: "#E9791E", color: "#fff", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rubik',sans-serif"}}>{I(_n?.count)}</span> : null}
          </button>
        </React.Fragment>
      ))}
      <div style={{marginTop: "auto", padding: "14px 10px", borderRadius: "12px", background: "rgba(255,255,255,.06)", fontSize: "12px", lineHeight: "1.5", opacity: ".85"}}><span style={{display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>మన గ్రామం – మన సేవలు – మన అభివృద్ధి</span>v2.4 · Andhra Pradesh</div>
    </aside>
  );
}
