// A website contact message in full (View): who sent it, their mobile, and the message.
// Built from the service request panel's elements and inline styles (RequestPanel.tsx); no new design.
import { I, css } from "../../shared/dc";
import type { View } from "../Console";

export default function ContactPanel({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeCM} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={"Contact message from " + (v.cm?.name || "")} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(480px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <div style={{flex: "1"}}>
            <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>Contact message</div>
            <div style={{fontSize: "12px", color: "#6b7a8c"}}>{"Received "}{I(v.cm?.time)}</div>
          </div>
          <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${v.cm?.sbg ?? ""};color: ${v.cm?.scolor ?? ""}`)}>{I(v.cm?.statusLabel)}</span>
          <button onClick={v.closeCM} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px"}}>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px", flexShrink: "0"}}>
            <div style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap"}}>
              <span style={{fontSize: "13px", fontWeight: "700", color: "#6b7a8c"}}>Current status</span>
              <span style={{padding: "5px 14px", borderRadius: "999px", fontSize: "15px", fontWeight: "800", background: v.cm?.sbg, color: v.cm?.scolor}}>{I(v.cm?.statusLabel)}</span>
            </div>
            <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
              <button onClick={v.cm?.toggle} style={{height: "38px", padding: "0 16px", borderRadius: "999px", border: "1.5px solid #cfd8e3", background: "#fff", color: v.cm?.toggleColor, fontWeight: "700", fontSize: "13.5px", cursor: "pointer"}}>{I(v.cm?.toggleLabel)}</button>
            </div>
          </div>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"}}>Sent by</span>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden", marginTop: "-6px", flexShrink: "0"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Name</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.cm?.name)}</span></div>
            <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Mobile</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.cm?.mobile)}</span></span>{v.cm?.tel ? <a href={v.cm?.tel} style={{color: "#0D3B7A", fontWeight: "700", fontSize: "14px", textDecoration: "none", padding: "8px"}}>Call</a> : null}</div>
            <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={{display: "flex", flexDirection: "column", gap: "2px"}}><span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Village / Mandal</span><span style={{fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"}}>{I(v.cm?.village)}</span></span></div>
          </div>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"}}>Message</span>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", padding: "12px 14px", fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.45", marginTop: "-6px", flexShrink: "0", whiteSpace: "pre-wrap", overflowWrap: "anywhere"}}>{I(v.cm?.message)}</div>
        </div>
      </div>
    </>
  );
}
