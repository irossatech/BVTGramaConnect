// Posts: status tabs, filters, the review table and its pager.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import * as ds from "../ds";
import type { View } from "../Console";
import { Pager, DistrictOptions, EmptyState, StatusPills, TickBox, SearchSelect, BulkBar } from "../ui/parts";

export default function Posts({ v }: { v: View }) {
  return (
    <>
      {/* Status pills and New post; the filters on the row below. */}
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <StatusPills items={v.statusTabs} label="Filter posts by status" />
        {v.canCompose ? <button onClick={v.openCompose} style={{height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "6px"}}><path d="M12 5v14M5 12h14" /></svg>New post</button> : null}
      </div>
      <div className="sa-bar" style={{display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap"}}>
        <select name="source" value={val(v.pf?.source, "")} onChange={v.onPF} aria-label="Who posted" style={{height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "160px"}}>
          <option value="">Posted by anyone</option>
          <option value="official">Posted by officials</option>
          <option value="citizen">Posted by citizens</option>
        </select>
        <SearchSelect name="district" aria-label="District" value={val(v.pf?.district, "")} onChange={v.onPF} style={{height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "160px"}}>
          <DistrictOptions v={v} />
        </SearchSelect>
        <select name="cat" aria-label="Category" value={val(v.pf?.cat, "")} onChange={v.onPF} style={{height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "160px"}}>
          <option value="">All categories</option>
          {list(v.catOpts).map((_c, _i1) => (
            <React.Fragment key={_i1}>
              <option value={val(_c?.id, "")}>{_c?.label}</option>
            </React.Fragment>
          ))}
        </select>
        {v.filtersOn ? <button onClick={v.clearFilters} style={{height: "32px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}>Clear filters</button> : null}
        <span style={{marginLeft: "auto", fontSize: "13px", color: "#6b7a8c"}}>{I(v.postCount)}{v.postCount === 1 ? " post" : " posts"}{v.searchNote ? <>{" · "}{I(v.searchNote)}</> : null}</span>
      </div>
      {v.postSel?.count ? <BulkBar region="Selected posts" label={v.postSel.label} all={v.postSel.all} some={v.postSel.some} toggleAll={v.postSel.toggleAll} allLabel="Select all posts on this page" busy={v.postSel.busy} actions={v.postSel.actions} note={v.postSel.note} clear={v.postSel.clear} /> : null}
      {v.postEmpty ? <EmptyState title={v.postEmptyText} hint={v.postEmptyHint} icon="M4 5h12v14H6a2 2 0 0 1-2-2V5zM16 9h4v8a2 2 0 0 1-2 2M8 9h4M8 13h4" /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
        {" "}
        <table style={{width: "100%", fontSize: "13px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={{padding: "12px 0 12px 16px", width: "34px"}}>{v.postSel?.show ? <TickBox on={v.postSel?.all} some={v.postSel?.some} onChange={v.postSel?.toggleAll} label="Select all posts on this page" /> : null}</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Post</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Category</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Shown to</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Posted by</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Sent in</th>
              <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
              <th style={{padding: "12px 16px"}}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Open</span></th>
            </tr>
          </thead>
          <tbody>
            {list(v.postRows).map((_p, _i1) => (
              <React.Fragment key={_p?.rowKey ?? _i1}>
                <tr onClick={_p?.open} tabIndex={0} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); _p?.open(); } }} style={css(`border-top:1px solid #f3f5f8;cursor:pointer;background: ${_p?.rowBg ?? ""}`)}>
                  {/* Ticking a box selects the row; it must not open the post. */}
                  <td onClick={(e) => e.stopPropagation()} style={{padding: "10px 0 10px 16px", width: "34px", cursor: "default"}}>{_p?.selectable ? <TickBox on={_p?.sel} onChange={_p?.toggleSel} label={"Select " + (_p?.titleTe || "post")} /> : null}</td>
                  <td style={{padding: "10px 16px", maxWidth: "380px"}}>
                    <div style={{fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{_p?.urgent ? <span style={{display: "inline-block", marginRight: "6px", padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#fde7e5", color: "#b3261e", verticalAlign: "1px"}}>Urgent</span> : null}{I(_p?.titleTe)}</div>
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
                    <span title={_p?.st?.tip || undefined} style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_p?.st?.bg ?? ""};color: ${_p?.st?.color ?? ""}`)}>{I(_p?.st?.label)}</span>
                  </td>
                  <td style={{padding: "10px 16px", color: "#6b7a8c", textAlign: "right"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign: "-2px", display: "inline-block"}}><path d="M9 6l6 6-6 6" /></svg></td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {" "}
      </div>}
      {v.postsPager?.show ? <Pager p={v.postsPager} /> : null}
    </>
  );
}
