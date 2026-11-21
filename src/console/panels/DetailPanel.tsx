// The side panel for a post or a user, with its action bar.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";
import PostDetail from "./PostDetail";
import UserDetail from "./UserDetail";
import CitizenDetail from "./CitizenDetail";

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
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px"}}>
          {v.panel?.isPost ? <PostDetail v={v} /> : null}
          {v.panel?.isUser ? <UserDetail v={v} /> : null}
          {v.panel?.isCitizen ? <CitizenDetail v={v} /> : null}
        </div>
        {v.panel?.isPost ? <div style={{padding: "14px 24px 16px", borderTop: "1px solid #eef2f6", display: "flex", flexDirection: "column", gap: "10px", background: "#fff"}}>
            <div style={{display: "flex", alignItems: "baseline", gap: "8px", flexWrap: "wrap"}}>
              <span style={{fontWeight: "700", color: "#0A2550", fontSize: "13px"}}>What you can do</span>
              <span style={{fontSize: "12.5px", color: "#6b7a8c"}}>{v.sp?.noActions ? I(v.sp?.noWhy) : I(v.sp?.actHint)}</span>
            </div>
            {v.sp?.noActions ? null : <div style={{display: "flex", flexWrap: "wrap", gap: "10px"}}>
              {list(v.sp?.actions).map((_a, _i1) => (
                <React.Fragment key={_i1}>
                  <button onClick={_a?.go} style={css(`height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;border:1.5px solid ${_a?.border ?? ""};background: ${_a?.bg ?? ""};color: ${_a?.color ?? ""}`)}>{I(_a?.label)}</button>
                </React.Fragment>
              ))}
            </div>}
          </div> : null}
        {/* A blocked citizen: Unblock now, before the block ends by itself. */}
        {v.panel?.isCitizen && (v.cz?.blocked || v.cz?.canBringBack) ? <div style={{padding: "14px 24px 16px", borderTop: "1px solid #eef2f6", display: "flex", flexDirection: "column", gap: "8px", background: "#fff"}}>
            {v.cz?.canUnblock ? <>
              <button onClick={v.cz?.unblock} style={{alignSelf: "flex-start", height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #0D3B7A", background: "#fff", color: "#0D3B7A"}}>Unblock this phone</button>
              <span style={{fontSize: "12.5px", color: "#6b7a8c"}}>Lets this phone post again now. Its closed posts stay closed.</span>
            </> : <span style={{fontSize: "12.5px", color: "#6b7a8c"}}>{v.cz?.blocked ? "Only a Super Admin can unblock this phone." : null}</span>}
            {v.cz?.canBringBack ? <>
              <button onClick={v.cz?.bringBack} style={{alignSelf: "flex-start", height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Bring their posts back</button>
              <span style={{fontSize: "12.5px", color: "#6b7a8c"}}>Send the posts the block closed back to review, or publish them. A reason is needed.</span>
            </> : null}
          </div> : null}
        {/* Block on the left, on its own; Reset password and Edit details on the right. Change area and Unlock are in the panel. */}
        {v.panel?.isUser ? <div style={{padding: "14px 24px", borderTop: "1px solid #eef2f6", display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center"}}>
            {v.su?.canToggle ? <button onClick={v.su?.toggle} style={css(`height:40px;padding:0 16px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;background:#fff;border:1.5px solid ${v.su?.tbg ?? ""};color: ${v.su?.tbg ?? ""}`)}>{I(v.su?.toggleLabel)}</button> : null}
            <span style={{flex: "1"}} />
            {v.su?.canReset ? <button onClick={v.su?.reset} style={{height: "40px", padding: "0 16px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Reset password</button> : null}
            {v.su?.canEdit ? <button onClick={v.su?.edit} style={{height: "40px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "0", background: "#0D3B7A", color: "#fff"}}>Edit details</button> : null}
          </div> : null}
      </div>
      {" "}
    </>
  );
}
