// A user in the side panel: name, role and status; contact; roles (each with its area); recent posts.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

const heading = {fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"} as const;
const tag = (bg: string, color: string) => ({padding: "2px 9px", borderRadius: "999px", fontSize: "11.5px", fontWeight: "700", background: bg, color, whiteSpace: "nowrap"}) as const;

export default function UserDetail({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", alignItems: "center", gap: "14px"}}>
        <span style={css(`width:56px;height:56px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:22px;opacity:${v.su?.active ? 1 : .55};background: ${v.su?.bg ?? ""}`)}>{I(v.su?.initial)}</span>
        <span style={{minWidth: "0", display: "flex", flexDirection: "column", gap: "4px"}}>
          <span style={{fontSize: "18px", fontWeight: "700", color: "#0A2550", lineHeight: "1.2"}}>{I(v.su?.name)}</span>
          {v.su?.te ? <span lang="te" style={{color: "#6b7a8c", fontSize: "13px"}}>{I(v.su?.te)}</span> : null}
          <span style={{display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "2px"}}>
            {v.su?.active ? <span style={tag("#e4f4df", "#1d7a33")}>Active</span> : <span style={tag("#fde7e5", "#b3261e")}>Blocked</span>}
            {v.su?.locked ? <span style={tag("#fff0dc", "#b35a0e")} title="Locked after too many failed logins">Locked</span> : null}
            {v.su?.canUnlock ? <button onClick={v.su?.unlock} style={{height: "22px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "11.5px"}}>Unlock</button> : null}
          </span>
        </span>
      </div>

      {/* Blocked, or no role left: what it means for them, not only a tag. */}
      {v.su?.note ? <div style={{padding: "10px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: "600", lineHeight: "1.45", background: v.su?.noteBad ? "#fde7e5" : "#fff6ec", color: v.su?.noteBad ? "#b3261e" : "#9a4a08"}}>{I(v.su?.note)}</div> : null}

      <span style={heading}>Contact</span>
      <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden", marginTop: "-6px", flexShrink: "0"}}>
        {list(v.su?.contact).map((_f, _i1) => (
          <div key={_i1} style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: _i1 ? "1px solid #f3f5f8" : "0"}}>
            <span style={{width: "92px", flexShrink: "0", fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>{I(_f.k)}</span>
            <span style={{flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: _f.none ? "#9aa6b4" : "#17212e", overflowWrap: "anywhere"}}>{I(_f.v)}</span>
            {_f.href ? <a href={_f.href} style={{color: "#0D3B7A", fontWeight: "700", fontSize: "13px", textDecoration: "none", padding: "4px 6px"}}>{_f.href.startsWith("tel:") ? "Call" : "Email"}</a> : null}
          </div>
        ))}
      </div>

      <span style={heading}>Account</span>
      <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden", marginTop: "-6px", flexShrink: "0"}}>
        {list(v.su?.account).map((_f, _i1) => (
          <div key={_i1} style={{display: "flex", alignItems: "flex-start", gap: "10px", padding: "10px 14px", borderTop: _i1 ? "1px solid #f3f5f8" : "0"}}>
            <span style={{width: "92px", flexShrink: "0", fontSize: "12px", fontWeight: "600", color: "#6b7a8c", lineHeight: "20px"}}>{I(_f.k)}</span>
            <span style={{flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", lineHeight: "1.45", color: _f.warn ? "#b35a0e" : "#17212e", overflowWrap: "anywhere"}}>{I(_f.v)}</span>
          </div>
        ))}
      </div>

      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <span style={heading}>Roles</span>
        {v.su?.canAddRole ? <button onClick={v.su?.addRole} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "6px"}}><path d="M12 5v14M5 12h14" /></svg>Add role</button> : null}
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: "8px", marginTop: "-6px"}}>
        {v.su?.noRoles ? <span style={{fontSize: "13px", color: "#6b7a8c", padding: "4px 2px"}}>No role yet.</span> : null}
        {list(v.su?.roles).map((_r, _i1) => (
          <React.Fragment key={_i1}>
            <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #eef2f6", borderRadius: "12px", background: "#fff"}}>
              <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_r?.rbg ?? ""};color: ${_r?.rcolor ?? ""}`)}>{I(_r?.label)}</span>
              <span style={{flex: "1", minWidth: "0", fontSize: "13px", color: "#3b4a5c"}}>{I(_r?.area)}</span>
              {_r?.canReassign ? <button onClick={_r?.reassign} style={{height: "28px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}>Change area</button> : null}
              {_r?.canRemove ? <button onClick={_r?.remove} style={{height: "28px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#b3261e", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Remove</button> : null}
            </div>
          </React.Fragment>
        ))}
      </div>

      <span style={heading}>Recent posts</span>
      <div style={{display: "flex", flexDirection: "column", gap: "8px", marginTop: "-6px"}}>
        {v.su?.noPosts ? <span style={{fontSize: "13px", color: "#6b7a8c", padding: "4px 2px"}}>No posts yet.</span> : null}
        {list(v.su?.posts).map((_p, _i1) => (
          <React.Fragment key={_i1}>
            <button onClick={_p?.open} style={{display: "flex", alignItems: "center", gap: "12px", width: "100%", textAlign: "left", padding: "10px 12px", border: "1px solid #eef2f6", borderRadius: "12px", background: "#fff", cursor: "pointer"}}>
              <span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px"}}>
                <span lang={_p?.lang} style={{fontWeight: "700", color: "#0A2550", fontSize: "13px", lineHeight: "1.35"}}>{I(_p?.titleTe)}</span>
                <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_p?.date)}</span>
              </span>
              <span style={css(`padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;background: ${_p?.st?.bg ?? ""};color: ${_p?.st?.color ?? ""}`)}>{I(_p?.st?.label)}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
