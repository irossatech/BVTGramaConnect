// Users: filters, the user table and its pager.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { Pager, DistrictOptions } from "../ui/parts";

export default function Users({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <select name="role" value={val(v.uf?.role, "")} onChange={v.onUF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
          <option value="">All roles</option>
          <option value="district">District Admin</option>
          <option value="mandal">Mandal Admin</option>
          <option value="village">Village Admin</option>
          <option value="panchayat">Panchayat Member</option>
        </select>
        <select name="district" value={val(v.uf?.district, "")} onChange={v.onUF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
          <DistrictOptions v={v} />
        </select>
        <select name="status" value={val(v.uf?.status, "")} onChange={v.onUF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "150px"}}><option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option></select>
        <input name="q" value={val(v.uf?.q, "")} onChange={v.onUF} placeholder="Search name or mobile" style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", width: "220px"}} />
        <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.userCount)}{" users"}</span>
        {v.canAddUser ? <button onClick={v.openAddUser} style={{marginLeft: "auto", height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>+ Add User</button> : null}
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
        {" "}
        <table style={{width: "100%", fontSize: "13px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Name</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Mobile</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Role</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Last login</th>
              <th style={{padding: "12px 16px", fontWeight: "600", textAlign: "right"}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list(v.userRows).map((_u, _i1) => (
              <React.Fragment key={_i1}>
                <tr style={{borderTop: "1px solid #f3f5f8"}}>
                  <td style={{padding: "10px 16px"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                      <span style={css(`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:13px;background: ${_u?.bg ?? ""}`)}>{I(_u?.initial)}</span>
                      <span>
                        <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_u?.name)}</span>
                        <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_u?.te)}</span>
                      </span>
                    </div>
                  </td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c", fontVariantNumeric: "tabular-nums"}}>{I(_u?.mobile)}</td>
                  <td style={{padding: "10px 16px"}}>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${_u?.rbg ?? ""};color: ${_u?.rcolor ?? ""}`)}>{I(_u?.roleLabel)}</span>
                  </td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_u?.area)}</td>
                  <td style={{padding: "10px 16px"}}>
                    <span style={css(`display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:12px;color: ${_u?.scolor ?? ""}`)}><span style={css(`width:8px;height:8px;border-radius:50%;background: ${_u?.scolor ?? ""}`)} />{I(_u?.statusLabel)}</span>
                  </td>
                  <td style={{padding: "10px 16px", color: "#6b7a8c"}}>{I(_u?.lastLogin)}</td>
                  <td style={{padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap"}}>
                    <button onClick={_u?.view} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", marginLeft: "6px"}}>View</button>
                    {_u?.canReassign ? <button onClick={_u?.reassign} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer", fontSize: "12px", marginLeft: "6px"}}>Reassign area</button> : null}
                    {_u?.canToggle ? <button onClick={_u?.toggle} style={css(`height:30px;padding:0 10px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;font-weight:700;cursor:pointer;font-size:12px;margin-left:6px;color: ${_u?.tcolor ?? ""}`)}>{I(_u?.toggleLabel)}</button> : null}
                  </td>
                </tr>
              </React.Fragment>
            ))}
            {v.userEmpty ? <tr><td colSpan={7} style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.userEmptyText)}</td></tr> : null}
          </tbody>
        </table>
        {" "}
      </div>
      {v.usersPager?.show ? <Pager p={v.usersPager} /> : null}
    </>
  );
}
