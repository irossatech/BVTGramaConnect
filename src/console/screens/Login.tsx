// Super Admin sign in.
import { css, val } from "../../shared/dc";
import type { View } from "../Console";

export default function Login({ v }: { v: View }) {
  return (
    <div style={{display: "flex", flexDirection: "column", gap: "18px", animation: "sa-fade .2s ease-out"}}>
        <div>
          <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "26px", fontWeight: "700", color: "#0A2550"}}>Super Admin sign in</div>
          <div style={{color: "#6b7a8c", marginTop: "4px"}}>Restricted to authorised state-level administrators.</div>
        </div>
        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>Username</span>
          <input name="username" type="text" value={val(v.username, "")} onChange={v.onLogin} onKeyDown={v.onLoginKey} autoComplete="username" style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
        </label>
        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>Password</span>
          <span style={{position: "relative", display: "block"}}>
            <input name="password" type={v.pw?.login?.type} value={val(v.password, "")} onChange={v.onLogin} onKeyDown={v.onLoginKey} autoComplete="current-password" style={{width: "100%", boxSizing: "border-box", height: "48px", padding: "0 48px 0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
            <button type="button" onClick={v.pw?.login?.toggle} aria-label={v.pw?.login?.label} aria-pressed={v.pw?.login?.shown} title={v.pw?.login?.label} style={{position: "absolute", top: "50%", right: "6px", transform: "translateY(-50%)", width: "36px", height: "36px", border: "0", borderRadius: "8px", background: "none", color: "#6b7a8c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={v.pw?.login?.icon} /></svg>
            </button>
          </span>
        </label>
        <button onClick={v.signIn} disabled={v.cannotSignIn} style={css(`height:48px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-size:15px;font-weight:700;cursor:pointer;opacity: ${v.signInOpacity ?? ""}`)}>Sign in ›</button>
      </div>
  );
}
