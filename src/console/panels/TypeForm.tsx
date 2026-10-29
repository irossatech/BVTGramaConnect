// Add or edit a contact type.
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function TypeForm({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeTF} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={v.tfTitle} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(460px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.tfTitle)}</span>
          <button onClick={v.closeTF} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px"}}>
          {v.tfEditing ? <div style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Section</span>
              <span style={{fontSize: "14px", color: "#3b4a5c"}}>{I(v.tfSectionLabel)} <span style={{color: "#6b7a8c", fontSize: "12.5px"}}>· cannot be changed</span></span>
            </div> : null}
          {v.tfEditing ? null : <div role="radiogroup" aria-label="Section" style={{display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Section</span>
            {list(v.tfSections).map((_o, _i1) => (
              <button key={_i1} type="button" role="radio" aria-checked={!!_o?.on} onClick={_o?.pick} style={css(`display:flex;gap:12px;align-items:flex-start;text-align:left;padding:12px 14px;border-radius:12px;cursor:pointer;background: ${_o?.on ? "#e3f0fb" : "#fff"};border: 1.5px solid ${_o?.on ? "#0D3B7A" : "#cfd8e3"}`)}>
                <span aria-hidden="true" style={css(`flex-shrink:0;margin-top:2px;width:18px;height:18px;border-radius:50%;box-sizing:border-box;border: ${_o?.on ? "5px solid #0D3B7A" : "2px solid #cfd8e3"};background:#fff`)} />
                <span style={{display: "flex", flexDirection: "column", gap: "2px"}}>
                  <span style={{fontSize: "14px", fontWeight: "700", color: "#0A2550"}}>{I(_o?.label)}</span>
                  <span style={{fontSize: "12.5px", color: "#6b7a8c", lineHeight: "1.4"}}>{I(_o?.sub)}</span>
                </span>
              </button>
            ))}
          </div>}
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>English name</span>
            <input name="en" value={val(v.tf?.en, "")} onChange={v.onTF} maxLength={60} placeholder="e.g. Anganwadi centre" aria-invalid={!!v.tfErr?.en} style={css(`height:44px;padding:0 12px;border-radius:10px;font-size:14px;border:1px solid ${v.tfErr?.en ? "#b3261e" : "#cfd8e3"}`)} />
            {v.tfErr?.en ? <span style={{fontSize: "12px", color: "#b3261e"}}>{I(v.tfErr?.en)}</span> : null}
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Telugu name <span style={{fontWeight: "600", color: "#6b7a8c"}}>(optional)</span></span>
            <input name="te" value={val(v.tf?.te, "")} onChange={v.onTF} maxLength={60} placeholder="ఉదా. అంగన్‌వాడీ కేంద్రం" aria-invalid={!!v.tfErr?.te} style={css(`height:44px;padding:0 12px;border-radius:10px;font-size:14px;border:1px solid ${v.tfErr?.te ? "#b3261e" : "#cfd8e3"}`)} />
            {v.tfErr?.te ? <span style={{fontSize: "12px", color: "#b3261e"}}>{I(v.tfErr?.te)}</span> : <span style={{fontSize: "12px", color: "#6b7a8c"}}>Citizens see this name in the app's Telugu mode. Left empty, they see the English name.</span>}
          </label>
        </div>
        <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px"}}>
          <button onClick={v.saveTF} disabled={!!v.tf?.saving} style={css(`flex:1;height:44px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${v.tf?.saving ? .6 : 1}`)}>{I(v.tfSaveLabel)}</button>
          <button onClick={v.closeTF} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
        </div>
      </div>
    </>
  );
}
