// Sponsored banners: status tabs, the list (running first) with on/off and bulk delete.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";
import { EmptyState, SelBar, StatusPills, TickBox } from "../ui/parts";

export default function Ads({ v }: { v: View }) {
  return (
    <>
      {/* Status pills and New banner on one row. */}
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <StatusPills items={v.adTabs} label="Filter banners by status" />
        <button onClick={v.newAd} disabled={v.adsUnavailable} style={css(`height:40px;padding:0 18px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;font-size:13px;white-space:nowrap;opacity: ${v.adsUnavailable ? .5 : 1}`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "6px"}}><path d="M12 5v14M5 12h14" /></svg>New banner</button>
      </div>
      <SelBar sel={v.adSel} removeLabel="Delete selected" />
      {v.adsEmpty ? <EmptyState title={v.adsEmptyText} hint={v.adsEmptyHint} icon="M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6" /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
        {v.adSel?.show ? <label style={{display: "flex", gap: "12px", alignItems: "center", padding: "10px 16px", background: "#f7f9fb", fontSize: "12.5px", fontWeight: "600", color: "#6b7a8c", cursor: "pointer"}}>
            <TickBox on={v.adSel?.all} some={v.adSel?.some} onChange={v.adSel?.toggleAll} label="Select all banners in this list" />Select all
          </label> : null}
        {list(v.adRows).map((_a, _i1) => (
          <React.Fragment key={_a?.rowKey ?? _i1}>
            <div style={css(`display:flex;align-items:center;gap:16px;padding:14px 16px;flex-wrap:wrap;border-top: ${_i1 || v.adSel?.show ? "1px solid #f3f5f8" : "0"}`)}>
              <TickBox on={_a?.sel} onChange={_a?.toggleSel} label={"Select " + (_a?.title || "")} />
              <button onClick={_a?.open} aria-label={"Edit " + (_a?.title || "")} style={css(`width:144px;aspect-ratio:3/2;border:0;padding:0;border-radius:10px;overflow:hidden;background:#f1f3f6;cursor:pointer;flex-shrink:0;opacity: ${_a?.dim ?? 1}`)}>
                <span style={{position: "relative", display: "block", width: "100%", height: "100%", overflow: "hidden", background: "#0A2550"}}>{_a?.isVideo
                  ? <video src={_a?.frame} muted={true} playsInline={true} preload="metadata" aria-hidden="true" tabIndex={-1} style={{width: "100%", height: "100%", objectFit: "contain", display: "block", pointerEvents: "none"}} />
                  : <><img src={_a?.image} alt="" aria-hidden="true" style={{position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", filter: "blur(14px) brightness(.8)", transform: "scale(1.15)"}} /><img src={_a?.image} alt="" style={{position: "relative", width: "100%", height: "100%", objectFit: "contain", display: "block"}} /></>}{_a?.isVideo ? <span aria-label="Video banner" style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(0,0,0,.45)", display: "flex", alignItems: "center", justifyContent: "center"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg></span> : null}</span>
              </button>
              <div style={{flex: "1", minWidth: "180px", display: "flex", flexDirection: "column", gap: "4px"}}>
                <span style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
                  <span style={{fontWeight: "700", color: "#0A2550", fontSize: "14.5px"}}>{I(_a?.title)}</span>
                  <span style={css(`padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700;white-space:nowrap;background: ${_a?.sbg ?? ""};color: ${_a?.scolor ?? ""}`)}>{I(_a?.status)}</span>
                </span>
                <span style={{fontSize: "13px", color: "#3b4a5c"}}>{I(_a?.area)}</span>
                <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_a?.dates)}</span>
              </div>
              <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
                {_a?.canToggle ? <label style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#3b4a5c", cursor: "pointer"}}>
                    Show
                    <button type="button" role="switch" aria-checked={!!_a?.on} aria-label={"Show " + (_a?.title || "")} onClick={_a?.toggle} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:999px;border:0;padding:3px;cursor:pointer;display:flex;transition:background .15s;justify-content: ${_a?.on ? "flex-end" : "flex-start"};background: ${_a?.on ? "#1F8A3B" : "#cfd8e3"}`)}><span style={{width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)"}} /></button>
                  </label> : null}
                <button onClick={_a?.open} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Edit</button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>}
    </>
  );
}
