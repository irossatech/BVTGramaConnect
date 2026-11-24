// Dashboard: KPI tiles, charts and the latest activity.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function Dashboard({ v }: { v: View }) {
  return (
    <>
      <p style={{margin: "0", fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>Click any card or district to open its list.</p>
      <div className="sa-kpis" style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "16px"}}>
        {list(v.kpis).map((_k, _i1) => (
          <React.Fragment key={_i1}>
            <button onClick={_k?.go} aria-label={_k?.aria} style={{textAlign: "left", background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,64,126,.06)", cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px"}}>
              <span style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px", fontSize: "13px", color: "#647182", fontWeight: "600"}}>{I(_k?.label)}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: "0"}}><path d="M9 6l6 6-6 6" /></svg></span>
              {/* The spaces keep the card's words apart for assistive tech ("Active officials 12 Can sign in", not
                  "officials12Can"); a flex column does not draw them (WCAG 2.5.3, axe label-content-name-mismatch). */}
              {" "}<span style={css(`font-family:'Rubik',sans-serif;font-size:32px;font-weight:700;line-height:1;color: ${_k?.color ?? ""}`)}>{I(_k?.value)}</span>
              {" "}<span style={{fontSize: "12px", color: "#647182"}}>{I(_k?.sub)}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <div className="sa-cols" style={{display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px"}}>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px"}}>
          <div style={{display: "flex", flexWrap: "wrap", gap: "4px 12px", justifyContent: "space-between", alignItems: "baseline"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Posts per day</span>
            <span style={{fontSize: "12px", color: "#647182"}}>{I(v.chartTotals)}</span>
          </div>
          <div className="sa-chart" style={{position: "relative", display: "flex", alignItems: "flex-end", gap: "10px", flex: "1 1 auto", minHeight: "190px", paddingTop: "10px", borderBottom: "1px solid #eef2f6"}}>
            {v.chartEmpty || v.chartLoading ? <div style={{position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", color: "#647182", fontSize: "13px"}}>{v.chartLoading ? "Loading…" : "No posts in the last 14 days."}</div> : null}
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
          <div className="sa-chart sa-chart-days" style={{display: "flex", gap: "10px"}}>
            {list(v.chart).map((_c, _i1) => (
              <React.Fragment key={_i1}>
                <div style={{flex: "1", minWidth: "0", textAlign: "center", fontSize: "11px", color: "#647182", whiteSpace: "nowrap", overflow: "visible"}}>{I(_c?.day)}</div>
              </React.Fragment>
            ))}
          </div>
          <div style={{display: "flex", gap: "18px", fontSize: "12px", color: "#3b4a5c"}}>
            <span style={{display: "flex", alignItems: "center", gap: "6px"}}><span style={{width: "10px", height: "10px", borderRadius: "2px", background: "#0D3B7A"}} />Sent in</span>
            <span style={{display: "flex", alignItems: "center", gap: "6px"}}><span style={{width: "10px", height: "10px", borderRadius: "2px", background: "#6cc04a"}} />Published</span>
          </div>
        </div>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
          <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Waiting for review, by district</span>
            <span style={{fontSize: "12px", color: "#647182", lineHeight: "1.5"}}>Click a district to review its posts.</span>
          </div>
          <label style={{position: "relative", display: "block"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#647182" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input type="search" value={val(v.distQ, "")} onChange={v.onDistQ} placeholder="Search district" aria-label="Search district" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px"}} />
          </label>
          {/* Fills the card down to the chart's height (equal cards) and scrolls; on phones it keeps a usable minimum. */}
          <div className="sa-scrolly" style={{flex: "1 1 0", minHeight: "240px", overflowY: "auto"}}>
          <table style={{width: "100%", fontSize: "13px"}}>
            <thead>
              <tr style={{color: "#647182", textAlign: "left", fontSize: "12px", position: "sticky", top: "0", background: "#fff", zIndex: "1"}}>
                <th style={{padding: "8px 0", fontWeight: "600", borderBottom: "1px solid #eef2f6"}}>District</th>
                <th style={{padding: "8px 0 8px 16px", fontWeight: "600", borderBottom: "1px solid #eef2f6", textAlign: "right"}}>Pending</th>
                <th style={{padding: "8px 0 8px 16px", fontWeight: "600", borderBottom: "1px solid #eef2f6", textAlign: "right"}} title={"Hours the oldest post has waited. Over " + v.limitH + " h is overdue."}>Oldest wait</th>
              </tr>
            </thead>
            <tbody>
              {!list(v.pendingByDistrict).length ? <tr><td colSpan={3} style={{padding: "28px 8px", textAlign: "center", color: "#647182", fontSize: "13px", lineHeight: "1.5"}}>{I(v.distEmptyText)}</td></tr> : null}
              {list(v.pendingByDistrict).map((_r, _i1) => (
                <React.Fragment key={_i1}>
                  <tr>
                    <td style={{padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
                      <button onClick={_r?.go} style={{background: "none", border: "0", padding: "0", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px", textAlign: "left"}}>{I(_r?.name)}</button>
                      <div style={{fontSize: "12px", color: "#647182"}}>{I(_r?.te)}</div>
                    </td>
                    <td style={{padding: "10px 0 10px 16px", borderBottom: "1px solid #f3f5f8", textAlign: "right"}}>
                      <span style={{display: "inline-block", minWidth: "26px", padding: "3px 8px", borderRadius: "999px", background: "#fff0dc", color: "#b35a0e", fontWeight: "700", textAlign: "center", fontFamily: "'Rubik',sans-serif"}}>{I(_r?.count)}</span>
                    </td>
                    <td style={{padding: "10px 0 10px 16px", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: _r?.overdue ? "#b3261e" : "#647182", fontWeight: _r?.overdue ? "700" : "400", whiteSpace: "nowrap"}}>{I(_r?.oldest)}{_r?.overdue ? <div style={{fontSize: "11px"}}>overdue</div> : null}</td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "6px"}}>
        <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px"}}>
          <span style={{display: "flex", flexDirection: "column", gap: "4px"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Recent activity</span>
            <span style={{fontSize: "12px", color: "#647182"}}>The 6 latest actions by every official and the system, across all districts</span>
          </span>
          <button onClick={v.goAudit} style={{background: "none", border: "0", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap"}}>See all activity<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign: "-2px", marginLeft: "2px"}}><path d="M9 6l6 6-6 6" /></svg></button>
        </div>
        {v.recentEmptyText ? <div style={{padding: "20px 8px", textAlign: "center", color: "#647182", fontSize: "13px"}}>{I(v.recentEmptyText)}</div> : null}
        {list(v.recent).map((_a, _i1) => (
          <React.Fragment key={_i1}>
            <div style={{display: "flex", gap: "14px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
              <span style={css(`width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:13px;flex-shrink:0;background: ${_a?.bg ?? ""}`)}>{I(_a?.initial)}</span>
              <span style={{flex: "1", minWidth: "0", fontSize: "13px"}}>
                <b style={{color: "#0A2550"}}>{I(_a?.user)}</b>
                {" "}
                <span style={{color: "#647182"}}>({I(_a?.role)})</span>
                {" "}{I(_a?.action)}{" "}
                <b>{I(_a?.target)}</b>
                {_a?.where ? <>{" "}<span style={{color: "#647182"}}>{I(_a?.where)}</span></> : null}
              </span>
              <span title={_a?.at} style={{fontSize: "12px", color: "#647182", whiteSpace: "nowrap"}}>{I(_a?.ago)}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
