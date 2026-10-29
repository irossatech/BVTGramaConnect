// Dashboard: KPI tiles, charts and the latest activity.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function Dashboard({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "16px"}}>
        {list(v.kpis).map((_k, _i1) => (
          <React.Fragment key={_i1}>
            <button onClick={_k?.go} style={{textAlign: "left", background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,64,126,.06)", cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px"}}>
              <span style={{fontSize: "13px", color: "#6b7a8c", fontWeight: "600"}}>{I(_k?.label)}</span>
              <span style={css(`font-family:'Rubik',sans-serif;font-size:32px;font-weight:700;line-height:1;color: ${_k?.color ?? ""}`)}>{I(_k?.value)}</span>
              <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_k?.sub)}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px"}}>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Posts per day</span>
            <span style={{fontSize: "12px", color: "#6b7a8c"}}>Last 14 days · published vs submitted</span>
          </div>
          <div style={{position: "relative", display: "flex", alignItems: "flex-end", gap: "10px", height: "190px", paddingTop: "10px", borderBottom: "1px solid #eef2f6"}}>
            {v.chartEmpty ? <div style={{position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7a8c", fontSize: "13px"}}>No posts in the last 14 days.</div> : null}
            {list(v.chart).map((_c, _i1) => (
              <React.Fragment key={_i1}>
                <div title={_c?.tip} style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "0", height: "100%"}}>
                  <div style={{width: "100%", display: "flex", alignItems: "flex-end", gap: "3px", height: "100%"}}>
                    <div style={css(`flex:1;background:#0D3B7A;border-radius:4px 4px 0 0;height: ${_c?.h1 ?? ""}`)} />
                    <div style={css(`flex:1;background:#6cc04a;border-radius:4px 4px 0 0;height: ${_c?.h2 ?? ""}`)} />
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{display: "flex", gap: "10px"}}>
            {list(v.chart).map((_c, _i1) => (
              <React.Fragment key={_i1}>
                <div style={{flex: "1", textAlign: "center", fontSize: "11px", color: "#6b7a8c"}}>{I(_c?.day)}</div>
              </React.Fragment>
            ))}
          </div>
          <div style={{display: "flex", gap: "18px", fontSize: "12px", color: "#3b4a5c"}}>
            <span style={{display: "flex", alignItems: "center", gap: "6px"}}><span style={{width: "10px", height: "10px", borderRadius: "2px", background: "#0D3B7A"}} />Submitted</span>
            <span style={{display: "flex", alignItems: "center", gap: "6px"}}><span style={{width: "10px", height: "10px", borderRadius: "2px", background: "#6cc04a"}} />Published</span>
          </div>
        </div>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Pending by district</span>
          <table style={{width: "100%", fontSize: "13px"}}>
            <thead>
              <tr style={{color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                <th style={{padding: "8px 0", fontWeight: "600", borderBottom: "1px solid #eef2f6"}}>District</th>
                <th style={{padding: "8px 0", fontWeight: "600", borderBottom: "1px solid #eef2f6", textAlign: "right"}}>Pending</th>
                <th style={{padding: "8px 0", fontWeight: "600", borderBottom: "1px solid #eef2f6", textAlign: "right"}}>Oldest</th>
              </tr>
            </thead>
            <tbody>
              {!list(v.pendingByDistrict).length ? <tr><td colSpan={3} style={{padding: "28px 8px", textAlign: "center", color: "#6b7a8c", fontSize: "13px", lineHeight: "1.5"}}>Nothing waiting for review.</td></tr> : null}
              {list(v.pendingByDistrict).map((_r, _i1) => (
                <React.Fragment key={_i1}>
                  <tr>
                    <td style={{padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
                      <button onClick={_r?.go} style={{background: "none", border: "0", padding: "0", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>{I(_r?.name)}</button>
                      <div style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_r?.te)}</div>
                    </td>
                    <td style={{padding: "10px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right"}}>
                      <span style={{display: "inline-block", minWidth: "26px", padding: "3px 8px", borderRadius: "999px", background: "#fff0dc", color: "#b35a0e", fontWeight: "700", textAlign: "center", fontFamily: "'Rubik',sans-serif"}}>{I(_r?.count)}</span>
                    </td>
                    <td style={{padding: "10px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#6b7a8c"}}>{I(_r?.oldest)}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "6px"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px"}}>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Recent activity</span>
          <button onClick={v.goAudit} style={{background: "none", border: "0", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Open audit log ›</button>
        </div>
        {list(v.recent).map((_a, _i1) => (
          <React.Fragment key={_i1}>
            <div style={{display: "flex", gap: "14px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
              <span style={css(`width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:13px;flex-shrink:0;background: ${_a?.bg ?? ""}`)}>{I(_a?.initial)}</span>
              <span style={{flex: "1", minWidth: "0", fontSize: "13px"}}>
                <b style={{color: "#0A2550"}}>{I(_a?.user)}</b>
                {" "}
                <span style={{color: "#6b7a8c"}}>({I(_a?.role)})</span>
                {" "}{I(_a?.action)}{" "}
                <b>{I(_a?.target)}</b>
              </span>
              <span style={{fontSize: "12px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(_a?.area)}{" · "}{I(_a?.time)}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
