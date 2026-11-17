// A website contact message in full: the message first, then who sent it; Mark handled / Mark new in the footer.
import { I, css } from "../../shared/dc";
import type { View } from "../Console";

const field = {fontSize: "12px", fontWeight: "600", color: "#6b7a8c"} as const;
const value = {fontSize: "14.5px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"} as const;
const heading = {fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"} as const;

export default function ContactPanel({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeCM} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={"Contact message from " + (v.cm?.name || "")} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(480px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <div style={{flex: "1", minWidth: "0"}}>
            <div style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
              <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.cm?.name)}</span>
              <span style={css(`padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700;background: ${v.cm?.sbg ?? ""};color: ${v.cm?.scolor ?? ""}`)}>{I(v.cm?.statusLabel)}</span>
            </div>
            <div style={{fontSize: "12px", color: "#6b7a8c"}}>{"Received "}{I(v.cm?.time)}</div>
          </div>
          <button onClick={v.closeCM} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "10px"}}>
          <span style={heading}>Message</span>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", padding: "12px 14px", fontSize: "14.5px", color: "#17212e", lineHeight: "1.55", flexShrink: "0", whiteSpace: "pre-wrap", overflowWrap: "anywhere"}}>{I(v.cm?.message)}</div>
          <span style={{...heading, marginTop: "8px"}}>Contact</span>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden", flexShrink: "0"}}>
            <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px"}}>
              <span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}><span style={field}>Mobile</span><span style={value}>{I(v.cm?.mobile)}</span></span>
              {v.cm?.tel ? <a href={v.cm?.tel} style={{color: "#0D3B7A", fontWeight: "700", fontSize: "14px", textDecoration: "none", padding: "8px"}}>Call</a> : null}
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={field}>Village</span><span style={value}>{I(v.cm?.village)}</span></div>
          </div>
        </div>
        <div style={{padding: "14px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", justifyContent: "flex-end"}}>
          <button onClick={v.closeCM} style={{height: "42px", padding: "0 18px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Close</button>
          <button onClick={v.cm?.toggle} style={css(`height:42px;padding:0 22px;border:0;border-radius:999px;font-weight:700;cursor:pointer;color:#fff;background: ${v.cm?.handled ? "#3b4a5c" : "#1F8A3B"}`)}>{I(v.cm?.toggleLabel)}</button>
        </div>
      </div>
    </>
  );
}
