// Post details inside the side panel.
import React from "react";
import { I, css, list } from "../../shared/dc";
import * as ds from "../ds";
import type { View } from "../Console";

export default function PostDetail({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
        <div className="sc-host-x" style={{display: "contents"}}><ds.Badge tone={v.sp?.cat}>{I(v.sp?.catLabel)}</ds.Badge></div>
        {v.sp?.urgent ? <span style={{padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", background: "#fde7e5", color: "#b3261e"}}>Urgent</span> : null}
        {v.sp?.hasEvent ? <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${v.sp?.eventBg ?? ""};color: ${v.sp?.eventColor ?? ""}`)}>{I(v.sp?.eventLabel)}</span> : null}
        <span style={{fontSize: "12px", color: "#6b7a8c"}}>{"Shown to "}{I(v.sp?.area)}{" · "}{I(v.sp?.date)}</span>
        {v.sp?.shareUrl ? <button onClick={v.sp?.copyLink} style={{marginLeft: "auto", height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "5px"}}><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></svg>Copy link
        </button> : null}
      </div>
      {/* Where the post is now: its status, what that means, who decided and when, and the reason (owner, 2026-11-21). */}
      <div role="status" style={css(`padding:14px 16px;border-radius:12px;background: ${v.sp?.card?.bg ?? ""}`)}>
        <div style={css(`display:flex;align-items:center;gap:8px;font-family:'Rubik',sans-serif;font-size:16px;font-weight:700;color: ${v.sp?.card?.color ?? ""}`)}>
          <span aria-hidden="true" style={css(`width:10px;height:10px;border-radius:50%;flex-shrink:0;background: ${v.sp?.card?.color ?? ""}`)} />{I(v.sp?.card?.label)}
        </div>
        <div style={css(`font-size:13.5px;line-height:1.5;margin-top:6px;color: ${v.sp?.card?.color ?? ""}`)}>{I(v.sp?.card?.why)}</div>
        {v.sp?.card?.who ? <div style={css(`font-size:12.5px;font-weight:600;margin-top:6px;color: ${v.sp?.card?.color ?? ""}`)}>{I(v.sp?.card?.who)}</div> : null}
        {v.sp?.card?.reason ? <div style={{marginTop: "10px", padding: "10px 12px", background: "#fff", borderRadius: "10px", fontSize: "13.5px", lineHeight: "1.5", color: "#3b4a5c"}}><b style={{color: "#0A2550"}}>Reason: </b>{I(v.sp?.card?.reason)}</div> : null}
      </div>
      <div>
        <div lang={v.sp?.lang} style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "20px", fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{I(v.sp?.titleTe)}</div>
        <div lang={v.sp?.langEn} style={{fontSize: "14px", color: "#6b7a8c", marginTop: "2px"}}>{I(v.sp?.titleEn)}</div>
      </div>
      <p lang={v.sp?.lang} style={{margin: "0", fontSize: "15px", lineHeight: "1.65", color: "#3b4a5c"}}>{I(v.sp?.bodyTe)}</p>
      {v.sp?.bodyEn ? <div style={{background: "#f7f9fb", borderRadius: "10px", padding: "10px 12px"}}>
        <div style={{fontSize: "11px", fontWeight: "700", color: "#6b7a8c", marginBottom: "4px"}}>Automatic translation</div>
        <p lang={v.sp?.langEn} style={{margin: "0", fontSize: "13px", lineHeight: "1.6", color: "#6b7a8c"}}>{I(v.sp?.bodyEn)}</p>
      </div> : null}
      {v.sp?.hasVideo ? <>
        {list(v.sp?.videos).map((_v, _i1) => (
          <React.Fragment key={_i1}>
            <video src={_v?.src} poster={_v?.poster} controls={true} preload="none" style={{width: "100%", aspectRatio: "16/9", borderRadius: "10px", background: "#0A2550", objectFit: "contain"}} />
          </React.Fragment>
        ))}
      </> : null}
      {v.sp?.hasPhoto ? <div style={{display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px"}}>
          {list(v.sp?.photos).map((_ph, _i1) => (
            <React.Fragment key={_i1}>
              <img src={_ph?.src} alt="" style={css(`width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;object-position: ${_ph?.pos ?? ""}`)} />
            </React.Fragment>
          ))}
        </div> : null}
      <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#f7f9fb", borderRadius: "12px"}}>
        <span style={css(`width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;background: ${v.sp?.abg ?? ""}`)}>{I(v.sp?.ainitial)}</span>
        <span style={{flex: "1"}}>
          <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(v.sp?.author)}</span>
          <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(v.sp?.authorRole)}</span>
        </span>
      </div>
      {/* Urgent: an on/off switch, only while the post waits or is public. */}
      {v.sp?.urgentOk ? <div style={{display: "flex", alignItems: "center", gap: "12px", paddingTop: "14px", borderTop: "1px solid #eef2f6"}}>
        <span style={{flex: "1"}}>
          <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>Urgent</span>
          <span style={{display: "block", fontSize: "12.5px", color: "#6b7a8c"}}>Shows first, with a red “Urgent” tag.</span>
        </span>
        <button role="switch" aria-checked={!!v.sp?.urgentOn} aria-label="Urgent" onClick={v.sp?.toggleUrgent} style={css(`position:relative;width:46px;height:28px;border:0;border-radius:999px;cursor:pointer;flex-shrink:0;background: ${v.sp?.urgentOn ? "#b3261e" : "#cfd8e3"}`)}>
          <span aria-hidden="true" style={css(`position:absolute;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;transition:left .15s ease-out;left: ${v.sp?.urgentOn ? "21px" : "3px"}`)} />
        </button>
      </div> : null}
      {/* The citizen's phone, apart from the review: its posts so far, block or unblock, discard all waiting. */}
      {v.sp?.phone ? <div style={{display: "flex", flexDirection: "column", gap: "10px", paddingTop: "14px", borderTop: "1px solid #eef2f6"}}>
        <span style={{fontWeight: "700", color: "#0A2550"}}>Citizen’s phone</span>
        <span style={{fontSize: "13px", color: "#3b4a5c"}}>{I(v.sp?.phone?.line)}</span>
        {v.sp?.phone?.actions?.length ? <div style={{display: "flex", flexWrap: "wrap", gap: "8px"}}>
          {list(v.sp?.phone?.actions).map((_a, _i1) => (
            <React.Fragment key={_i1}>
              <button onClick={_a?.go} style={css(`height:36px;padding:0 14px;border-radius:999px;font-weight:700;cursor:pointer;font-size:12.5px;border:1.5px solid ${_a?.border ?? ""};background: ${_a?.bg ?? ""};color: ${_a?.color ?? ""}`)}>{I(_a?.label)}</button>
            </React.Fragment>
          ))}
        </div> : null}
      </div> : null}
      <div style={{display: "flex", flexDirection: "column", gap: "0"}}>
        <div style={{fontWeight: "700", color: "#0A2550", marginBottom: "8px"}}>Review history</div>
        {list(v.sp?.history).map((_h, _i1) => (
          <React.Fragment key={_i1}>
            <div style={{display: "grid", gridTemplateColumns: "22px 1fr", gap: "12px"}}>
              <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <span style={css(`width:12px;height:12px;border-radius:50%;margin-top:4px;flex-shrink:0;background: ${_h?.dot ?? ""}`)} />
                <span style={{flex: "1", width: "2px", background: "#eef2f6", margin: "4px 0"}} />
              </div>
              <div style={{paddingBottom: "16px"}}>
                <div style={{fontSize: "13px"}}><b style={{color: "#0A2550"}}>{I(_h?.who)}</b>{" "}<span style={{color: "#6b7a8c"}}>{"· "}{I(_h?.role)}</span></div>
                <div style={{fontSize: "13px", color: "#3b4a5c", marginTop: "2px"}}>{I(_h?.action)}</div>
                {_h?.hasNote ? <div style={{marginTop: "6px", padding: "8px 10px", background: "#f7f9fb", borderRadius: "8px", fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_h?.note)}</div> : null}
                <div style={{fontSize: "11px", color: "#6b7a8c", marginTop: "4px"}}>{I(_h?.time)}</div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
