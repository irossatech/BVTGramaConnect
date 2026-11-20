// Users: status pills and Add user, filters and search, then the table (View, Block) and its pager.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { Pager, DistrictOptions, EmptyState, StatusPills, SearchSelect, TickBox } from "../ui/parts";

export default function Users({ v }: { v: View }) {
  return (
    <>
      {/* Status pills and Add user; role, district and search on the row below. */}
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <StatusPills items={v.userTabs} label="Filter users by status" />
        {v.canAddUser ? <button onClick={v.openAddUser} style={{flexShrink: "0", whiteSpace: "nowrap", height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "6px"}}><path d="M12 5v14M5 12h14" /></svg>Add user</button> : null}
      </div>
      <div className="sa-bar" style={{display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap"}}>
        <label style={{position: "relative", flex: "0 1 280px", minWidth: "200px"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7a8c" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" name="q" aria-label="Search name or mobile" value={val(v.uf?.q, "")} onChange={v.onUF} placeholder="Search name or mobile" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13.5px", background: "#fff"}} />
        </label>
        <select name="role" aria-label="Role" value={val(v.uf?.role, "")} onChange={v.onUF} style={{height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "160px"}}>
          <option value="">All roles</option>
          <option value="district">District Admin</option>
          <option value="mandal">Mandal Admin</option>
          <option value="village">Village Admin</option>
          <option value="panchayat">Panchayat Member</option>
        </select>
        <SearchSelect name="district" aria-label="District" value={val(v.uf?.district, "")} onChange={v.onUF} style={{height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "160px"}}>
          <DistrictOptions v={v} />
        </SearchSelect>
        <span style={{marginLeft: "auto", fontSize: "13px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(v.userCount)}{v.userCount === 1 ? " user" : " users"}</span>
      </div>
      {/* Ticked users: Block / Unblock them at once (owner, 2026-11-20); same bar as the Posts page. */}
      {v.userSel?.count ? <div role="region" aria-label="Selected users" style={{display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", padding: "10px 14px", borderRadius: "12px", background: "#e3f0fb", fontSize: "13px", color: "#0A2550"}}>
        <strong style={{fontWeight: "700"}}>{I(v.userSel?.label)}</strong>
        {v.userSel?.busy ? <span aria-live="polite" style={{color: "#3b4a5c"}}>{I(v.userSel?.busy)}</span> : <>
          {v.userSel?.canBlock ? <button onClick={v.userSel?.block} style={{height: "32px", padding: "0 14px", border: "0", borderRadius: "999px", background: "#b3261e", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "12.5px"}}>{I(v.userSel?.blockLabel)}</button> : null}
          {v.userSel?.canUnblock ? <button onClick={v.userSel?.unblock} style={{height: "32px", padding: "0 14px", border: "0", borderRadius: "999px", background: "#1F8A3B", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "12.5px"}}>{I(v.userSel?.unblockLabel)}</button> : null}
          <button onClick={v.userSel?.clear} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12.5px"}}>Clear</button>
        </>}
      </div> : null}
      {v.userEmpty ? <EmptyState title={v.userEmptyText} hint={v.userEmptyHint} icon="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", fontSize: "13px", minWidth: "820px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 0 12px 16px", width: "34px"}}>{v.userSel?.show ? <TickBox on={v.userSel?.all} some={v.userSel?.some} onChange={v.userSel?.toggleAll} label="Select all users on this page" /> : null}</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Name</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Role</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Mobile</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Last login</th>
              <th style={{padding: "12px 16px", width: "110px"}}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {list(v.userRows).map((_u, _i1) => (
              <React.Fragment key={_u?.rowKey ?? _i1}>
                <tr style={{borderTop: "1px solid #f3f5f8"}}>
                  <td style={{padding: "10px 0 10px 16px", width: "34px"}}>{_u?.selectable ? <TickBox on={_u?.sel} onChange={_u?.toggleSel} label={"Select " + (_u?.name || "user")} /> : null}</td>
                  <td style={{padding: "12px 16px"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                      <span style={css(`width:34px;height:34px;flex-shrink:0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:13px;opacity:${_u?.blocked ? .5 : 1};background: ${_u?.bg ?? ""}`)}>{I(_u?.initial)}</span>
                      <span style={{minWidth: "0"}}>
                        <span style={{display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap"}}>
                          <span style={{fontWeight: "700", color: _u?.blocked ? "#6b7a8c" : "#0A2550"}}>{I(_u?.name)}</span>
                          {_u?.blocked ? <span style={{padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#fde7e5", color: "#b3261e"}}>Blocked</span> : null}
                        </span>
                        <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_u?.te)}</span>
                      </span>
                    </div>
                  </td>
                  <td style={{padding: "12px 16px"}}>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_u?.rbg ?? ""};color: ${_u?.rcolor ?? ""}`)}>{I(_u?.roleLabel)}</span>
                  </td>
                  <td style={{padding: "12px 16px", color: "#3b4a5c"}}>{I(_u?.area)}</td>
                  <td style={{padding: "12px 16px", color: "#3b4a5c", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap"}}>{I(_u?.mobile)}</td>
                  <td style={{padding: "12px 16px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(_u?.lastLogin)}</td>
                  <td style={{padding: "10px 16px"}}>
                    <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                      <button onClick={_u?.view} aria-label={"View " + (_u?.name || "")} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}>View</button>
                      {_u?.canToggle ? <button onClick={_u?.toggle} aria-label={(_u?.toggleLabel || "") + " " + (_u?.name || "")} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;font-weight:700;cursor:pointer;font-size:12px;white-space:nowrap;color: ${_u?.tcolor ?? ""}`)}>{I(_u?.toggleLabel)}</button> : null}
                    </div>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>}
      {v.usersPager?.show ? <Pager p={v.usersPager} /> : null}
    </>
  );
}
