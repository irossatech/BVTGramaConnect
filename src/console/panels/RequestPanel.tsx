// A service request: details, status and assignment.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function RequestPanel({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeRQ} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={v.rq?.service} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(480px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <div style={{flex: "1"}}>
            <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.rq?.service)}</div>
            <div style={{fontSize: "12px", color: "#6b7a8c"}}>{"No. "}{I(v.rq?.ref)}{" · "}{I(v.rq?.time)}</div>
          </div>
          <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${v.rq?.sbg ?? ""};color: ${v.rq?.scolor ?? ""}`)}>{I(v.rq?.statusLabel)}</span>
          <button onClick={v.closeRQ} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px"}}>
          <div role="img" aria-label={"Status: " + (v.rq?.statusLabel || "")} style={{display: "flex", alignItems: "flex-start", flexShrink: "0"}}>
            {list(v.rqView?.steps).map((_p, _i1) => (
              <React.Fragment key={_i1}>
                {_p?.line ? <span style={{flex: "1", height: "2px", marginTop: "9px", background: _p.line}} /> : null}
                <span style={{width: "72px", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", flexShrink: "0"}}>
                  <span style={{width: "20px", height: "20px", borderRadius: "50%", boxSizing: "border-box", background: _p?.bg, border: _p?.bw + "px solid " + _p?.border, color: "#fff", fontSize: "11px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center"}}>{_p?.mark}</span>
                  <span style={{fontSize: "11px", fontWeight: _p?.weight, color: _p?.color, textAlign: "center", lineHeight: "1.2"}}>{I(_p?.label)}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px", flexShrink: "0"}}>
            <div style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap"}}>
              <span style={{fontSize: "13px", fontWeight: "700", color: "#6b7a8c"}}>Current status</span>
              <span style={{padding: "5px 14px", borderRadius: "999px", fontSize: "15px", fontWeight: "800", background: v.rqView?.curBg, color: v.rqView?.curColor}}>{I(v.rqView?.curLabel)}</span>
            </div>
            {v.rqView?.note ? <span style={{fontSize: "13.5px", color: "#3b4a5c", lineHeight: "1.45"}}>{"Note to the citizen: “"}{I(v.rqView?.note)}{"”"}</span> : null}
            {v.rqView?.viewOnly ? <span style={{display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#f7f9fb", fontSize: "13px", color: "#3b4a5c", lineHeight: "1.4"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a8c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: "0", marginTop: "1px"}} aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>{I(v.rqView?.viewOnly)}</span> : null}
            {list(v.rqView?.moves).length ? <>
              <span style={{fontSize: "13px", fontWeight: "700", color: "#6b7a8c"}}>Change status to</span>
              <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                {list(v.rqView?.moves).map((_m, _i1) => (
                  <button key={_i1} onClick={_m?.go} style={{height: "38px", padding: "0 16px", borderRadius: "999px", border: "1.5px solid #cfd8e3", background: "#fff", color: _m?.color, fontWeight: "700", fontSize: "13.5px", cursor: "pointer"}}>{I(_m?.label)}</button>
                ))}
              </div>
            </> : null}
          </div>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"}}>Requested by</span>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden", marginTop: "-6px", flexShrink: "0"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Name</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.rq?.name)}</span></div>
            <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Phone</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.rq?.mobile)}</span></span><a href={v.rq?.tel} style={{color: "#0D3B7A", fontWeight: "700", fontSize: "14px", textDecoration: "none", padding: "8px"}}>Call</a></div>
            {v.rq?.email ? <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px", minWidth: "0"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Email</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.rq?.email)}</span></span><a href={v.rq?.mailto} style={{color: "#0D3B7A", fontWeight: "700", fontSize: "14px", textDecoration: "none", padding: "8px"}}>Email</a></div> : null}
            {v.rq?.address ? <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={{display: "flex", flexDirection: "column", gap: "2px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Address</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.rq?.address)}</span></span></div> : null}
            <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={{display: "flex", flexDirection: "column", gap: "2px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Village</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.rq?.place)}</span></span></div>
            {v.rq?.details ? <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={{display: "flex", flexDirection: "column", gap: "2px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>What they need</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.rq?.details)}</span></span></div> : null}
          </div>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"}}>Assigned to</span>
          {v.rq?.canAssign ? <select aria-label="Assigned to" value={val(v.rq?.assigned, "")} onChange={v.rqView?.onAssign} style={{height: "46px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "14.5px", fontWeight: "600", background: "#fff", marginTop: "-6px", flexShrink: "0"}}>
              {list(v.rqAssigneeOpts).map((_o, _i1) => (
                <React.Fragment key={_i1}><option value={val(_o?.id, "")}>{I(_o?.label)}</option></React.Fragment>
              ))}
            </select> : <div style={{border: "1px solid #eef2f6", borderRadius: "14px", padding: "12px 14px", fontSize: "14.5px", fontWeight: "600", color: "#17212e", marginTop: "-6px", flexShrink: "0"}}>{I(v.rqView?.assignedName)}</div>}
          <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"}}>History</span>
            {list(v.rqHistory).map((_h, _i1) => (
              <React.Fragment key={_i1}>
                <div style={{display: "flex", gap: "10px", fontSize: "13px"}}>
                  <span style={css(`margin-top:5px;width:8px;height:8px;border-radius:50%;flex:none;background: ${_h?.dot ?? ""}`)} />
                  <div>
                    {_h?.what ? <div style={{fontWeight: "700", color: "#0A2550"}}>{I(_h?.what)}</div> : null}
                    {_h?.note ? <div style={{color: "#3b4a5c", lineHeight: "1.45"}}>{I(_h?.note)}</div> : null}
                    <div style={{color: "#6b7a8c", fontSize: "12px"}}>{I(_h?.meta)}</div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
        {/* each change above saves at once, as in the app */}
      </div>
    </>
  );
}
