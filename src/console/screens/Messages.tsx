// Contact messages sent from the website: status pills and search, then each message in full with View and Mark handled.
import React from "react";
import { I, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { EmptyState, Pager, StatusPills } from "../ui/parts";

const MAIL = "M4 6h16v12H4zM4 7l8 6 8-6";

export default function Messages({ v }: { v: View }) {
  return (
    <>
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <StatusPills items={v.contactTabs} label="Filter messages" />
        <label style={{position: "relative", flex: "0 1 300px", minWidth: "200px"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7a8c" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" aria-label="Search contact messages" value={val(v.contactQ, "")} onChange={v.onContactQ} placeholder="Search name, mobile or message" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13.5px", background: "#fff"}} />
        </label>
      </div>
      {v.contactEmpty ? <EmptyState title={v.contactEmptyText} hint={v.contactEmptyHint} icon={MAIL} /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", fontSize: "13px", minWidth: "720px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 16px", fontWeight: "600", width: "220px"}}>From</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Message</th>
              <th style={{padding: "12px 16px", fontWeight: "600", width: "120px"}}>Received</th>
              <th style={{padding: "12px 16px", width: "130px"}}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {list(v.contactRows).map((_c, _i1) => (
              <React.Fragment key={_c?.rowKey ?? _i1}>
                <tr style={{borderTop: "1px solid #f3f5f8", verticalAlign: "top"}}>
                  <td style={{padding: "14px 16px"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap"}}>
                      <span style={{fontWeight: "700", color: "#0A2550"}}>{I(_c?.name)}</span>
                      {_c?.showHandled ? <span style={{padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#e4f4df", color: "#1d7a33"}}>Handled</span> : null}
                    </div>
                    {_c?.village ? <div style={{color: "#3b4a5c", fontSize: "12.5px", marginTop: "3px"}}>{I(_c?.village)}</div> : null}
                    {_c?.mobile ? <div style={{color: "#6b7a8c", fontSize: "12px", marginTop: "2px", fontVariantNumeric: "tabular-nums"}}>{I(_c?.mobile)}</div> : null}
                  </td>
                  {/* The whole message, as written. */}
                  <td style={{padding: "14px 16px", color: "#17212e", fontSize: "13.5px", lineHeight: "1.55", whiteSpace: "pre-wrap", overflowWrap: "anywhere"}}>{I(_c?.message)}</td>
                  <td style={{padding: "14px 16px", color: "#6b7a8c", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>{I(_c?.time)}</td>
                  <td style={{padding: "12px 16px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "6px", alignItems: "stretch"}}>
                      <button onClick={_c?.view} aria-label={"View message from " + (_c?.name || "")} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}>View</button>
                      <button onClick={_c?.toggle} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: _c?.toggleColor, fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}>{I(_c?.toggleLabel)}</button>
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>}
      {v.contactPager?.show ? <Pager p={v.contactPager} /> : null}
    </>
  );
}
