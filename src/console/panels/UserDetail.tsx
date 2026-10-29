// User details inside the side panel.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function UserDetail({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", alignItems: "center", gap: "14px"}}>
        <span style={css(`width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:22px;background: ${v.su?.bg ?? ""}`)}>{I(v.su?.initial)}</span>
        <span>
          <span style={{display: "block", fontSize: "18px", fontWeight: "700", color: "#0A2550"}}>{I(v.su?.name)}</span>
          <span style={{display: "block", color: "#6b7a8c"}}>{I(v.su?.te)}</span>
        </span>
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
        {list(v.su?.fields).map((_f, _i1) => (
          <React.Fragment key={_i1}>
            <div style={{padding: "12px 14px", background: "#f7f9fb", borderRadius: "10px"}}>
              <div style={{fontSize: "11px", color: "#6b7a8c", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: "700"}}>{I(_f?.k)}</div>
              <div style={{fontWeight: "700", color: "#0A2550", marginTop: "3px"}}>{I(_f?.v)}</div>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <span style={{fontWeight: "700", color: "#0A2550"}}>Roles</span>
        {v.su?.canAddRole ? <button onClick={v.su?.addRole} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>+ Add role</button> : null}
      </div>
      {list(v.su?.roles).map((_r, _i1) => (
        <React.Fragment key={_i1}>
          <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #eef2f6", borderRadius: "10px", background: "#fff"}}>
            <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_r?.rbg ?? ""};color: ${_r?.rcolor ?? ""}`)}>{I(_r?.label)}</span>
            <span style={{flex: "1", fontSize: "13px", color: "#3b4a5c"}}>{I(_r?.area)}</span>
            {_r?.canRemove ? <button onClick={_r?.remove} style={{height: "28px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#b3261e", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Remove</button> : null}
          </div>
        </React.Fragment>
      ))}
      <div style={{fontWeight: "700", color: "#0A2550"}}>Recent posts by this user</div>
      {list(v.su?.posts).map((_p, _i1) => (
        <React.Fragment key={_i1}>
          <button onClick={_p?.open} style={{display: "flex", justifyContent: "space-between", gap: "12px", width: "100%", textAlign: "left", padding: "10px 12px", border: "1px solid #eef2f6", borderRadius: "10px", background: "#fff", cursor: "pointer"}}>
            <span style={{fontWeight: "700", color: "#0A2550", fontSize: "13px"}}>{I(_p?.titleTe)}</span>
            <span style={css(`padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;background: ${_p?.st?.bg ?? ""};color: ${_p?.st?.color ?? ""}`)}>{I(_p?.st?.label)}</span>
          </button>
        </React.Fragment>
      ))}
    </>
  );
}
