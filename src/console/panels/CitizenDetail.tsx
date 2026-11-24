// A blocked citizen's phone inside the side panel (Posts › Blocked, owner 2026-11-21): until when, why and by whom,
// and the posts the block closed. Unblock sits in the panel's action bar (DetailPanel).
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function CitizenDetail({ v }: { v: View }) {
  const c = v.cz;
  if (!c) return <span style={{fontSize: "13px", color: "#647182"}}>No blocked citizens</span>;
  return (
    <>
      <div>
        <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "20px", fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{I(c.title)}</div>
        <div style={{fontSize: "13px", color: "#647182", marginTop: "4px"}}>{I(c.counts)}</div>
      </div>
      <div role="status" style={css(`padding:14px 16px;border-radius:12px;background: ${c.blocked ? "#f3e3e1" : "#f7f9fb"}`)}>
        <div style={css(`display:flex;align-items:center;gap:8px;font-family:'Rubik',sans-serif;font-size:16px;font-weight:700;color: ${c.blocked ? "#7a1f17" : "#3b4a5c"}`)}>
          <span aria-hidden="true" style={css(`width:10px;height:10px;border-radius:50%;flex-shrink:0;background: ${c.blocked ? "#7a1f17" : "#3b4a5c"}`)} />{I(c.state)}
        </div>
        <div style={css(`font-size:13.5px;line-height:1.5;margin-top:6px;color: ${c.blocked ? "#7a1f17" : "#3b4a5c"}`)}>{I(c.why)}</div>
        {c.by ? <div style={css(`font-size:12.5px;font-weight:600;margin-top:6px;color: ${c.blocked ? "#7a1f17" : "#3b4a5c"}`)}>{I(c.by)}</div> : null}
        {c.reason ? <div style={{marginTop: "10px", padding: "10px 12px", background: "#fff", borderRadius: "10px", fontSize: "13.5px", lineHeight: "1.5", color: "#3b4a5c"}}><b style={{color: "#0A2550"}}>Reason: </b>{I(c.reason)}</div> : null}
      </div>
      {c.periods.length ? <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
        <div style={{fontWeight: "700", color: "#0A2550"}}>Block history</div>
        {list(c.periods).map((_l, _i1) => <div key={_i1} style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_l)}</div>)}
      </div> : null}
      <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
        <div style={{fontWeight: "700", color: "#0A2550"}}>{I(c.postsLabel)}</div>
        {list(c.posts).map((_p, _i1) => (
          <React.Fragment key={_p?.key ?? _i1}>
            <button onClick={_p?.open} style={{display: "flex", alignItems: "center", gap: "12px", textAlign: "left", padding: "12px 14px", border: "1px solid #eef2f6", borderRadius: "12px", background: "#fff", cursor: "pointer"}}>
              <span style={{flex: "1", minWidth: "0"}}>
                <span style={{display: "block", fontWeight: "700", color: "#0A2550", fontSize: "14px"}}>{I(_p?.title)}</span>
                <span style={{display: "flex", alignItems: "center", gap: "8px", marginTop: "4px"}}>
                  <span style={css(`padding:1px 8px;border-radius:999px;font-size:11px;font-weight:700;background: ${_p?.sbg ?? ""};color: ${_p?.scolor ?? ""}`)}>{I(_p?.status)}</span>
                  <span style={{fontSize: "12px", color: "#647182"}}>{I(_p?.date)}</span>
                </span>
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#647182" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
