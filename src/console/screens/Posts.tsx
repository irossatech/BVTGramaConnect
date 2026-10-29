// Posts: status tabs, filters, the review table and its pager.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import * as ds from "../ds";
import type { View } from "../Console";
import { Pager, DistrictOptions } from "../ui/parts";

export default function Posts({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", gap: "4px", borderBottom: "1px solid #cfd8e3"}}>
        {list(v.statusTabs).map((_s, _i1) => (
          <React.Fragment key={_i1}>
            <button onClick={_s?.go} style={css(`height:44px;padding:0 16px;border:0;background:none;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;border-bottom:3px solid ${_s?.line ?? ""};color: ${_s?.color ?? ""};margin-bottom:-1px`)}>
              {I(_s?.label)}
              <span style={css(`min-width:22px;padding:2px 7px;border-radius:999px;font-size:11px;font-family:'Rubik',sans-serif;background: ${_s?.cbg ?? ""};color: ${_s?.ccolor ?? ""}`)}>{I(_s?.count)}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
      <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
        <select name="source" value={val(v.pf?.source, "")} onChange={v.onPF} aria-label="Who posted" style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "150px"}}>
          <option value="">All posts</option>
          <option value="official">Officials' posts</option>
          <option value="citizen">Citizens' posts</option>
        </select>
        <select name="district" value={val(v.pf?.district, "")} onChange={v.onPF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
          <DistrictOptions v={v} />
        </select>
        <select name="cat" value={val(v.pf?.cat, "")} onChange={v.onPF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "190px"}}>
          <option value="">All categories</option>
          {list(v.catOpts).map((_c, _i1) => (
            <React.Fragment key={_i1}>
              <option value={val(_c?.id, "")}>{I(_c?.label)}</option>
            </React.Fragment>
          ))}
        </select>
        <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.postCount)}{" posts"}</span>
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
        {" "}
        <table style={{width: "100%", fontSize: "13px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Post</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Category</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Author</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Submitted</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
              <th style={{padding: "12px 16px"}} />
            </tr>
          </thead>
          <tbody>
            {v.postEmpty ? <tr><td colSpan={7} style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.postEmptyText)}</td></tr> : null}
            {list(v.postRows).map((_p, _i1) => (
              <React.Fragment key={_i1}>
                <tr onClick={_p?.open} style={css(`border-top:1px solid #f3f5f8;cursor:pointer;background: ${_p?.rowBg ?? ""}`)}>
                  <td style={{padding: "10px 16px", maxWidth: "380px"}}>
                    <div style={{fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{I(_p?.titleTe)}</div>
                    <div style={{fontSize: "12px", color: "#6b7a8c", marginTop: "2px"}}>{I(_p?.titleEn)}</div>
                  </td>
                  <td style={{padding: "10px 16px"}}><div className="sc-host-x" style={{display: "contents"}}><ds.Badge tone={_p?.cat}>{I(_p?.catLabel)}</ds.Badge></div></td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_p?.area)}</td>
                  <td style={{padding: "10px 16px", color: "#3b4a5c"}}>
                    <span style={{display: "block"}}>{I(_p?.author)}</span>
                    <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_p?.authorRole)}</span>
                  </td>
                  <td style={{padding: "10px 16px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(_p?.date)}</td>
                  <td style={{padding: "10px 16px"}}>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_p?.st?.bg ?? ""};color: ${_p?.st?.color ?? ""}`)}>{I(_p?.st?.label)}</span>
                  </td>
                  <td style={{padding: "10px 16px", color: "#6b7a8c", textAlign: "right"}}>›</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {" "}
      </div>
      {v.postsPager?.show ? <Pager p={v.postsPager} /> : null}
    </>
  );
}
