// Audit log: filters and the entries table.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { Pager } from "../ui/parts";

export default function Audit({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
        <div style={{display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", width: "360px", color: "#6b7a8c"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input value={val(v.auditQ, "")} onChange={v.onAuditQ} placeholder="Search user, action, target, area…" style={{flex: "1", border: "0", outline: "none", fontSize: "13px", background: "transparent"}} />
        </div>
        <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.auditCount)}{" entries"}</span>
        {v.canExportAudit ? <button onClick={v.exportCsv} style={{marginLeft: "auto", height: "40px", padding: "0 16px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Export CSV</button> : null}
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
        {" "}
        <table style={{width: "100%", fontSize: "13px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Time</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>User</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Role</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Action</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Target</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
            </tr>
          </thead>
          <tbody>
            {list(v.auditRows).map((_a, _i1) => (
              <React.Fragment key={_i1}>
                <tr style={{borderTop: "1px solid #f3f5f8"}}>
                  <td style={{padding: "10px 16px", color: "#6b7a8c", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>{I(_a?.time)}</td>
                  <td style={{padding: "10px 16px", fontWeight: "700", color: "#0A2550"}}>{I(_a?.user)}</td>
                  <td style={{padding: "10px 16px"}}>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${_a?.rbg ?? ""};color: ${_a?.rcolor ?? ""}`)}>{I(_a?.role)}</span>
                  </td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_a?.action)}</td>
                  <td style={{padding: "10px 16px", color: "#17212e"}}>{I(_a?.target)}</td>
                  <td style={{padding: "10px 16px", color: "#6b7a8c"}}>{I(_a?.area)}</td>
                </tr>
              </React.Fragment>
            ))}
            {v.auditEmpty ? <tr><td colSpan={6} style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.auditEmptyText)}</td></tr> : null}
          </tbody>
        </table>
        {v.auditPager?.show ? <Pager p={v.auditPager} /> : null}
        {" "}
      </div>
    </>
  );
}
