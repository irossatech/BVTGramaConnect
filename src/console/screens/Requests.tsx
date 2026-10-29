// Service requests citizens send from the app.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { Pager } from "../ui/parts";

export default function Requests({ v }: { v: View }) {
  return (
    <>
      <span style={{fontSize: "13px", color: "#6b7a8c", lineHeight: "1.5"}}>Requests citizens send from the app. Each goes to the Village Admin of their village; the Mandal and District Admins see it too.</span>
      <div style={{display: "flex", gap: "4px", borderBottom: "1px solid #cfd8e3", overflowX: "auto"}}>
        {list(v.reqTabs).map((_s, _i1) => (
          <React.Fragment key={_i1}>
            <button onClick={_s?.go} style={css(`height:44px;padding:0 14px;border:0;background:none;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;white-space:nowrap;border-bottom:3px solid ${_s?.line ?? ""};color: ${_s?.color ?? ""};margin-bottom:-1px`)}>
              {I(_s?.label)}
              <span style={css(`min-width:22px;height:20px;padding:0 6px;border-radius:999px;font-size:11px;display:inline-flex;align-items:center;justify-content:center;background: ${_s?.cbg ?? ""};color: ${_s?.ccolor ?? ""}`)}>{I(_s?.count)}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <div style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <input value={val(v.reqQ, "")} onChange={v.onReqQ} placeholder="Search name or phone" aria-label="Search service requests" style={{flex: "1", minWidth: "200px", maxWidth: "340px", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px"}} />
        <span style={{fontSize: "13px", color: "#6b7a8c", marginLeft: "auto"}}>{I(v.reqCountLabel)}</span>
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", fontSize: "13px", minWidth: "760px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Received</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Service</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Citizen</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Village / Mandal</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Assigned to</th>
              <th style={{padding: "12px 16px"}} />
            </tr>
          </thead>
          <tbody>
            {list(v.reqRows).map((_c, _i1) => (
              <React.Fragment key={_i1}>
                <tr style={{borderTop: "1px solid #f3f5f8"}}>
                  <td style={{padding: "10px 16px", color: "#6b7a8c", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>{I(_c?.time)}</td>
                  <td style={{padding: "10px 16px", fontWeight: "700", color: "#0A2550"}}>{I(_c?.service)}<div style={{fontWeight: "400", color: "#6b7a8c", fontSize: "12px"}}>{"No. "}{I(_c?.ref)}</div></td>
                  <td style={{padding: "10px 16px", color: "#17212e"}}>{I(_c?.name)}<div style={{color: "#6b7a8c", fontSize: "12px", whiteSpace: "nowrap"}}>{I(_c?.mobile)}</div>{_c?.address ? <div style={{color: "#3b4a5c", fontSize: "12px", maxWidth: "240px"}}>{I(_c?.address)}</div> : null}</td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_c?.place)}</td>
                  <td style={{padding: "10px 16px"}}>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_c?.sbg ?? ""};color: ${_c?.scolor ?? ""}`)}>{I(_c?.status)}</span>
                  </td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_c?.assignee)}</td>
                  <td style={{padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap"}}>
                    <button onClick={_c?.open} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Open</button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
            {v.reqEmpty ? <tr><td colSpan={7} style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.reqEmptyText)}</td></tr> : null}
          </tbody>
        </table>
      </div>
      {v.reqPager?.show ? <Pager p={v.reqPager} /> : null}
    </>
  );
}
