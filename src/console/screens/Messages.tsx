// Contact messages sent from the website.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { Pager } from "../ui/parts";

export default function Messages({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
        <div style={{display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", width: "360px", color: "#6b7a8c"}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input value={val(v.contactQ, "")} onChange={v.onContactQ} placeholder="Search name, mobile, village, message…" style={{flex: "1", border: "0", outline: "none", fontSize: "13px", background: "transparent"}} />
        </div>
        <select value={val(v.contactFilter, "")} onChange={v.onContactFilter} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
          {list(v.contactFilters).map((_o, _i1) => (
            <React.Fragment key={_i1}>
              <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
            </React.Fragment>
          ))}
        </select>
        <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.contactCount)}</span>
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
        {" "}
        <table style={{width: "100%", fontSize: "13px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Received</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Name</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Mobile</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Village / Mandal</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Message</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
              <th style={{padding: "12px 16px"}} />
            </tr>
          </thead>
          <tbody>
            {list(v.contactRows).map((_c, _i1) => (
              <React.Fragment key={_i1}>
                <tr style={{borderTop: "1px solid #f3f5f8"}}>
                  <td style={{padding: "10px 16px", color: "#6b7a8c", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>{I(_c?.time)}</td>
                  <td style={{padding: "10px 16px", fontWeight: "700", color: "#0A2550"}}>{I(_c?.name)}</td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c", whiteSpace: "nowrap"}}>{I(_c?.mobile)}</td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_c?.village)}</td>
                  <td style={{padding: "10px 16px", color: "#17212e", lineHeight: "1.5"}}>{I(_c?.message)}</td>
                  <td style={{padding: "10px 16px"}}>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_c?.sbg ?? ""};color: ${_c?.scolor ?? ""}`)}>{I(_c?.status)}</span>
                  </td>
                  <td style={{padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap"}}>
                    <button onClick={_c?.toggle} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>{I(_c?.toggleLabel)}</button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
            {v.contactEmpty ? <tr><td colSpan={7} style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.contactEmptyText)}</td></tr> : null}
          </tbody>
        </table>
        {v.contactPager?.show ? <Pager p={v.contactPager} /> : null}
        {" "}
      </div>
    </>
  );
}
