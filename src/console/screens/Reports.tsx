// Reports: summary tiles, charts and exports.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function Reports({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px"}}>
        {list(v.repSummary).map((_k, _i1) => (
          <React.Fragment key={_i1}>
            <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,64,126,.06)", display: "flex", flexDirection: "column", gap: "8px"}}>
              <span style={{fontSize: "13px", color: "#6b7a8c", fontWeight: "600"}}>{I(_k?.label)}</span>
              <span style={css(`font-family:'Rubik',sans-serif;font-size:32px;font-weight:700;line-height:1;color: ${_k?.color ?? ""}`)}>{I(_k?.value)}</span>
              <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_k?.sub)}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Posts by area</span>
            <button onClick={v.exportByArea} style={{height: "32px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Export CSV</button>
          </div>
          <table style={{width: "100%", fontSize: "13px"}}>
            <thead>
              <tr style={{color: "#6b7a8c", fontSize: "12px", textAlign: "left"}}>
                <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600"}}>Area</th>
                <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Total</th>
                <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Published</th>
                <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Pending</th>
                <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Rejected</th>
              </tr>
            </thead>
            <tbody>
              {!list(v.byArea).length ? <tr><td colSpan={5} style={{padding: "28px 8px", textAlign: "center", color: "#6b7a8c", fontSize: "13px", lineHeight: "1.5"}}>No posts in the last 30 days.</td></tr> : null}
              {list(v.byArea).map((_r, _i1) => (
                <React.Fragment key={_i1}>
                  <tr>
                    <td style={css(`padding:9px 0;border-bottom:1px solid #f3f5f8;font-weight: ${_r?.weight ?? ""};color:#0A2550;padding-left: ${_r?.indent ?? ""}`)}>{I(_r?.name)}</td>
                    <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{I(_r?.total)}</td>
                    <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#1d7a33", fontVariantNumeric: "tabular-nums"}}>{I(_r?.pub)}</td>
                    <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#b35a0e", fontVariantNumeric: "tabular-nums"}}>{I(_r?.pend)}</td>
                    <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#6b7a8c", fontVariantNumeric: "tabular-nums"}}>{I(_r?.rej)}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Average review time by level</span>
            <button onClick={v.exportReviewTime} style={{height: "32px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Export CSV</button>
          </div>
          {list(v.reviewTime).map((_r, _i1) => (
            <React.Fragment key={_i1}>
              <div style={{display: "flex", flexDirection: "column", gap: "6px", padding: "8px 0", borderBottom: "1px solid #f3f5f8"}}>
                <div style={{display: "flex", justifyContent: "space-between", fontSize: "13px"}}>
                  <span style={{fontWeight: "700", color: "#0A2550"}}>{I(_r?.level)}</span>
                  <span style={{color: "#3b4a5c"}}>
                    <b style={css(`font-family:'Rubik',sans-serif;font-size:16px;color: ${_r?.color ?? ""}`)}>{I(_r?.hours)}</b>
                    {" h avg · "}{I(_r?.n)}{" reviews · SLA "}{I(_r?.sla)}{" h"}
                  </span>
                </div>
                <div style={{height: "8px", borderRadius: "4px", background: "#eef2f6", overflow: "hidden"}}><div style={css(`height:100%;border-radius:4px;background: ${_r?.color ?? ""};width: ${_r?.w ?? ""}`)} /></div>
              </div>
            </React.Fragment>
          ))}
          <div style={{fontSize: "12px", color: "#6b7a8c"}}>{"Escalation after "}{I(v.settings?.escalation)}{" h without action (Settings)."}</div>
        </div>
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Admin activity · last 30 days</span>
          <div style={{display: "flex", gap: "8px"}}>
            <button onClick={v.exportActivity} style={{height: "32px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Export CSV</button>
          </div>
        </div>
        <table style={{width: "100%", fontSize: "13px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", fontSize: "12px", textAlign: "left"}}>
              <th style={{padding: "10px 12px", fontWeight: "600"}}>Admin</th>
              <th style={{padding: "10px 12px", fontWeight: "600"}}>Role · Area</th>
              <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Reviewed</th>
              <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Published</th>
              <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Recheck</th>
              <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Discarded</th>
              <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Avg time</th>
              <th style={{padding: "10px 12px", fontWeight: "600"}}>Last active</th>
            </tr>
          </thead>
          <tbody>
            {!list(v.adminActivity).length ? <tr><td colSpan={8} style={{padding: "28px 8px", textAlign: "center", color: "#6b7a8c", fontSize: "13px", lineHeight: "1.5"}}>No admin reviews in the last 30 days.</td></tr> : null}
            {list(v.adminActivity).map((_r, _i1) => (
              <React.Fragment key={_i1}>
                <tr style={{borderTop: "1px solid #f3f5f8"}}>
                  <td style={{padding: "10px 12px", fontWeight: "700", color: "#0A2550"}}>{I(_r?.name)}</td>
                  <td style={{padding: "10px 12px", color: "#3b4a5c"}}>{I(_r?.role)}{" · "}{I(_r?.area)}</td>
                  <td style={{padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{I(_r?.reviewed)}</td>
                  <td style={{padding: "10px 12px", textAlign: "right", color: "#1d7a33", fontVariantNumeric: "tabular-nums"}}>{I(_r?.pub)}</td>
                  <td style={{padding: "10px 12px", textAlign: "right", color: "#8f4bb4", fontVariantNumeric: "tabular-nums"}}>{I(_r?.re)}</td>
                  <td style={{padding: "10px 12px", textAlign: "right", color: "#6b7a8c", fontVariantNumeric: "tabular-nums"}}>{I(_r?.dis)}</td>
                  <td style={{padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{I(_r?.avg)}{" h"}</td>
                  <td style={{padding: "10px 12px", color: "#6b7a8c"}}>{I(_r?.last)}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
