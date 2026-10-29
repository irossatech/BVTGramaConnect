// The side panel for a post or a user, with its action bar.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";
import PostDetail from "./PostDetail";
import UserDetail from "./UserDetail";

export default function DetailPanel({ v }: { v: View }) {
  return (
    <>
      {" "}
      <div onClick={v.closePanel} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      {" "}
      <div role="dialog" aria-modal="true" aria-label={v.panel?.title} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(520px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.panel?.title)}</span>
          <button onClick={v.closePanel} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px"}}>
          {v.panel?.isPost ? <PostDetail v={v} /> : null}
          {v.panel?.isUser ? <UserDetail v={v} /> : null}
        </div>
        {v.panel?.isPost ? <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", flexWrap: "wrap", gap: "10px", background: "#fff"}}>
            {list(v.sp?.actions).map((_a, _i1) => (
              <React.Fragment key={_i1}>
                <button onClick={_a?.go} style={css(`height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;border:1.5px solid ${_a?.border ?? ""};background: ${_a?.bg ?? ""};color: ${_a?.color ?? ""}`)}>{I(_a?.label)}</button>
              </React.Fragment>
            ))}
          </div> : null}
        {v.panel?.isUser ? <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", flexWrap: "wrap", gap: "10px"}}>
            {v.su?.canEdit ? <button onClick={v.su?.edit} style={{height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Edit details</button> : null}
            {v.su?.canReassign ? <button onClick={v.su?.reassign} style={{height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Reassign area</button> : null}
            {v.su?.canReset ? <button onClick={v.su?.reset} style={{height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Reset password</button> : null}
            {v.su?.canUnlock ? <button onClick={v.su?.unlock} style={{height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Unlock</button> : null}
            {v.su?.canToggle ? <button onClick={v.su?.toggle} style={css(`height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;border:0;color:#fff;background: ${v.su?.tbg ?? ""}`)}>{I(v.su?.toggleLabel)}</button> : null}
          </div> : null}
      </div>
      {" "}
    </>
  );
}
