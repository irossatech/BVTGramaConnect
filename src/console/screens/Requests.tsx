// Service requests citizens send from the app.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { EmptyState, Pager, StatusPills } from "../ui/parts";

export default function Requests({ v }: { v: View }) {
  return (
    <>
      {/* One toolbar: status filter pills (a different look from the Requests / Services list switch above) and search. */}
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <StatusPills items={v.reqTabs} label="Filter requests by status" />
        {/* At least 200 px, up to 280 px: it shrinks before it moves to a row of its own, and stays on the right. */}
        <label style={{position: "relative", flex: "1 0 200px", maxWidth: "280px", minWidth: "200px", marginLeft: "auto"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#647182" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" value={val(v.reqQ, "")} onChange={v.onReqQ} placeholder="Search name or phone" aria-label="Search service requests" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13.5px", background: "#fff"}} />
        </label>
      </div>
      {v.reqEmpty ? <EmptyState title={v.reqEmptyText} hint={v.reqEmptyHint} icon="M9 12h6M9 16h4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", fontSize: "13px", minWidth: "760px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#647182", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Request</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Citizen</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Place</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Assigned to</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Received</th>
              <th style={{padding: "12px 16px", width: "14px"}}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Open</span></th>
            </tr>
          </thead>
          <tbody>
            {list(v.reqRows).map((_c, _i1) => (
              <React.Fragment key={_c?.rowKey ?? _i1}>
                {/* The whole row opens the request (click, or Enter / Space on the focused row). */}
                <tr onClick={_c?.open} tabIndex={0} aria-label={"Open " + (_c?.service || "request") + " from " + (_c?.name || "")} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); _c?.open(); } }} style={{borderTop: "1px solid #f3f5f8", cursor: "pointer"}}>
                  <td style={{padding: "12px 16px"}}>
                    <div style={{fontWeight: "700", color: "#0A2550"}}>{I(_c?.service)}</div>
                    <div style={{color: "#647182", fontSize: "12px", marginTop: "2px"}}>{"No. "}{I(_c?.ref)}</div>
                  </td>
                  <td style={{padding: "12px 16px", color: "#17212e"}}>{I(_c?.name)}</td>
                  <td style={{padding: "12px 16px", color: "#3b4a5c"}}>{I(_c?.place)}</td>
                  <td style={{padding: "12px 16px"}}>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_c?.sbg ?? ""};color: ${_c?.scolor ?? ""}`)}>{I(_c?.status)}</span>
                  </td>
                  <td style={{padding: "12px 16px", color: _c?.assigned ? "#3b4a5c" : "#b35a0e", fontWeight: _c?.assigned ? "400" : "700"}}>{I(_c?.assignee)}</td>
                  <td style={{padding: "12px 16px", color: "#647182", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>{I(_c?.time)}</td>
                  <td style={{padding: "12px 16px", color: "#647182", textAlign: "right"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign: "-2px", display: "inline-block"}}><path d="M9 6l6 6-6 6" /></svg></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>}
      {v.reqPager?.show ? <Pager p={v.reqPager} /> : null}
    </>
  );
}
