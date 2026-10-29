// Add or edit an important number.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function NumberForm({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeNF} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={v.nfTitle} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(460px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.nfTitle)}</span>
          <button onClick={v.closeNF} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px"}}>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Type</span>
            <select name="type" value={val(v.nf?.type, "")} onChange={v.onNF} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
              {list(v.nfTypes).map((_o, _i1) => (
                <React.Fragment key={_i1}>
                  <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                </React.Fragment>
              ))}
            </select>
          </label>
          {v.nfIsOther ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Type name</span>
              <input name="custom" value={val(v.nf?.custom, "")} onChange={v.onNF} maxLength={40} placeholder="e.g. Anganwadi" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
            </label> : null}
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Name</span>
            <input name="name" value={val(v.nf?.name, "")} onChange={v.onNF} maxLength={150} placeholder="e.g. Tahsildar Office, Tenali" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>పేరు (తెలుగు, optional)</span>
            <input name="te" value={val(v.nf?.te, "")} onChange={v.onNF} maxLength={150} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Phone</span>
            <input name="phone" type="tel" value={val(v.nf?.phone, "")} onChange={v.onNF} maxLength={20} placeholder="Mobile, landline, toll-free or short code" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          {v.nfMobile ? <label style={{display: "flex", gap: "10px", alignItems: "flex-start", fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5", cursor: "pointer"}}>
              <input name="consent" type="checkbox" checked={val(v.nf?.consent, false)} onChange={v.onNF} style={{marginTop: "3px", width: "16px", height: "16px"}} />
              <span>This person agreed to have this number shown to the public.</span>
            </label> : null}
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Email (optional)</span>
            <input name="email" type="email" value={val(v.nf?.email, "")} onChange={v.onNF} placeholder="office@example.gov.in" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          {v.nfIsArea ? <>
            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Who sees it</span>
              <select name="level" value={val(v.nf?.level, "")} onChange={v.onNF} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
                {list(v.nfLevels).map((_o, _i1) => (
                  <React.Fragment key={_i1}>
                    <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                  </React.Fragment>
                ))}
              </select>
            </label>
            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Area</span>
              <select name="area" value={val(v.nf?.area, "")} onChange={v.onNF} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
                {list(v.nfAreas).map((_o, _i1) => (
                  <React.Fragment key={_i1}>
                    <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                  </React.Fragment>
                ))}
              </select>
            </label>
          </> : null}
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Order (0–1000, lower shows first)</span>
            <input name="sort" type="number" min="0" max="1000" value={val(v.nf?.sort, "")} onChange={v.onNF} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          <div style={{fontSize: "12px", color: "#6b7a8c", lineHeight: "1.5"}}>
            {v.nfIsArea ? "Citizens of the area and every village below it see this number in the app's Contacts tab." : "Helplines are statewide: every citizen sees them under Government helplines."}
          </div>
        </div>
        <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px"}}>
          <button onClick={v.saveNF} disabled={v.cannotSaveNF} style={css(`flex:1;height:44px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${v.saveNFOpacity ?? ""}`)}>{I(v.nfSaveLabel)}</button>
          <button onClick={v.closeNF} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
        </div>
      </div>
    </>
  );
}
