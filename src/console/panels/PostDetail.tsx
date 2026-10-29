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
        <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${v.sp?.st?.bg ?? ""};color: ${v.sp?.st?.color ?? ""}`)}>{I(v.sp?.st?.label)}</span>
        {v.sp?.urgent ? <span style={{padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", background: "#fde7e5", color: "#b3261e"}}>Urgent</span> : null}
        {v.sp?.hasEvent ? <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${v.sp?.eventBg ?? ""};color: ${v.sp?.eventColor ?? ""}`)}>{I(v.sp?.eventLabel)}</span> : null}
        <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(v.sp?.area)}{" · "}{I(v.sp?.date)}</span>
      </div>
      <div>
        <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "20px", fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{I(v.sp?.titleTe)}</div>
        <div style={{fontSize: "14px", color: "#6b7a8c", marginTop: "2px"}}>{I(v.sp?.titleEn)}</div>
      </div>
      <p style={{margin: "0", fontSize: "15px", lineHeight: "1.65", color: "#3b4a5c"}}>{I(v.sp?.bodyTe)}</p>
      <p style={{margin: "0", fontSize: "13px", lineHeight: "1.6", color: "#6b7a8c", borderLeft: "3px solid #eef2f6", paddingLeft: "12px"}}>{I(v.sp?.bodyEn)}</p>
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
          <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(v.sp?.authorRole)}{" · "}{I(v.sp?.area)}{" · "}{I(v.sp?.amobile)}</span>
        </span>
      </div>
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
