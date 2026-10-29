// Add or edit a user.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function UserDrawer({ v }: { v: View }) {
  return (
    <>
      {" "}
      <div onClick={v.closeDrawer} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      {" "}
      <div role="dialog" aria-modal="true" aria-label={v.nuTitle} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(460px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.nuTitle)}</span>
          <button onClick={v.closeDrawer} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px"}}>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Full name</span>
            <input name="name" value={val(v.nu?.name, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>పేరు (తెలుగు)</span>
            <input name="te" value={val(v.nu?.te, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Username</span>
            <input name="username" type="text" value={val(v.nu?.username, "")} onChange={v.onNU} readOnly={v.nuEdit} placeholder="e.g. ravi.kumar" style={css(`height:44px;padding:0 12px;border:1px solid #cfd8e3;border-radius:10px;font-size:14px;outline-color:#0D3B7A;background: ${v.nuEdit ? "#f7f9fb" : "#fff"}`)} />
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Email (optional)</span>
            <input name="email" type="email" value={val(v.nu?.email, "")} onChange={v.onNU} placeholder="name@example.com" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Mobile (optional)</span>
            <input name="mobile" value={val(v.nu?.mobile, "")} onChange={v.onNU} maxLength={10} placeholder="10 digits" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
          </label>
          {v.nuEdit ? <div style={{fontSize: "12px", color: "#6b7a8c", lineHeight: "1.5"}}>
              The username cannot change. Use Reassign area, Add role or Reset password in the user panel for the rest.
            </div> : <>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Temporary password (optional)</span>
            <span style={{display: "flex", gap: "10px"}}>
              <input name="password" type="text" value={val(v.nu?.password, "")} onChange={v.onNU} placeholder="Leave empty to generate one" autoComplete="off" style={{flex: "1", height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
              <button onClick={v.genNU} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Generate</button>
            </span>
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Role</span>
            <select name="role" value={val(v.nu?.role, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
              {list(v.nuRoles).map((_o, _i1) => (
                <React.Fragment key={_i1}>
                  <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                </React.Fragment>
              ))}
            </select>
          </label>
          {list(v.nuSteps).map((_st) => (
            <label key={_st.key} style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>{I(_st.label)}</span>
              <select name={_st.key} value={val(_st.value, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
                <option value="" disabled>{I(_st.ph)}</option>
                {list(_st.options).map((_o) => (
                  <option key={_o.id} value={val(_o?.id, "")}>{I(_o?.label)}</option>
                ))}
              </select>
            </label>
          ))}
          {v.noDistricts ? <div role="alert" style={{padding: "10px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", background: "#fff0dc", color: "#b35a0e", lineHeight: "1.5"}}>
            No districts yet. Add districts, mandals and villages in Geography first, then add officials.
          </div> : <div style={{padding: "10px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "700", background: v.nuPlace ? "#e4f4df" : "#f6f8f3", color: v.nuPlace ? "#1d7a33" : "#6b7a8c"}}>
            {v.nuPlace ? "✓ " + v.nuRoleLabel + " · " + v.nuPlace : "Choose the role and the place"}
          </div>}
          <div style={{fontSize: "12px", color: "#6b7a8c", lineHeight: "1.5"}}>
            Leave the password empty to generate one. It is shown once after you save: give it to the person yourself. They choose their own password at first login. Panchayat members' posts go through the Village Admin review queue.
          </div>
          </>}
        </div>
        <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px"}}>
          <button onClick={v.saveNU} disabled={v.cannotSaveNU} style={css(`flex:1;height:44px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${v.saveNUOpacity ?? ""}`)}>{I(v.nuSaveLabel)}</button>
          <button onClick={v.closeDrawer} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
        </div>
      </div>
      {" "}
    </>
  );
}
