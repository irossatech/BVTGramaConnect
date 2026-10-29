// Change password (forced after a temporary password, or from the menu).
import { I, css, val } from "../../shared/dc";
import type { View } from "../Console";

export default function ChangePassword({ v }: { v: View }) {
  return (
    <div style={{display: "flex", flexDirection: "column", gap: "18px", animation: "sa-fade .2s ease-out"}}>
        <div>
          <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "26px", fontWeight: "700", color: "#0A2550"}}>Change password</div>
          <div style={{color: "#6b7a8c", marginTop: "4px"}}>{I(v.cpSub)}</div>
        </div>
        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>Current password</span>
          <span style={{position: "relative", display: "block"}}>
            <input name="current" type={v.pw?.current?.type} value={val(v.cpCurrent, "")} onChange={v.onCp} onKeyDown={v.onCpKey} autoComplete="current-password" style={{width: "100%", boxSizing: "border-box", height: "48px", padding: "0 48px 0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
            <button type="button" onClick={v.pw?.current?.toggle} aria-label={v.pw?.current?.label} aria-pressed={v.pw?.current?.shown} title={v.pw?.current?.label} style={{position: "absolute", top: "50%", right: "6px", transform: "translateY(-50%)", width: "36px", height: "36px", border: "0", borderRadius: "8px", background: "none", color: "#6b7a8c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={v.pw?.current?.icon} /></svg>
            </button>
          </span>
        </label>
        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>New password</span>
          <span style={{position: "relative", display: "block"}}>
            <input name="next" type={v.pw?.next?.type} value={val(v.cpNext, "")} onChange={v.onCp} onKeyDown={v.onCpKey} autoComplete="new-password" style={{width: "100%", boxSizing: "border-box", height: "48px", padding: "0 48px 0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
            <button type="button" onClick={v.pw?.next?.toggle} aria-label={v.pw?.next?.label} aria-pressed={v.pw?.next?.shown} title={v.pw?.next?.label} style={{position: "absolute", top: "50%", right: "6px", transform: "translateY(-50%)", width: "36px", height: "36px", border: "0", borderRadius: "8px", background: "none", color: "#6b7a8c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={v.pw?.next?.icon} /></svg>
            </button>
          </span>
        </label>
        <button onClick={v.changePassword} disabled={v.cannotChange} style={css(`height:48px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-size:15px;font-weight:700;cursor:pointer;opacity: ${v.changeOpacity ?? ""}`)}>{"Save & continue ›"}</button>
        <div style={{display: "flex", justifyContent: "space-between"}}>
          <button onClick={v.cpBack} style={{background: "none", border: "0", color: "#6b7a8c", fontWeight: "700", cursor: "pointer"}}>{I(v.cpBackLabel)}</button>
        </div>
      </div>
  );
}
