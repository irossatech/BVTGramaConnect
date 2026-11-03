// The top bar: page title, post search, the notifications bell (with its dropdown), the account menu.
import { I, val } from "../../shared/dc";
import type { View } from "../Console";
import Notifications from "./Notifications";

export default function TopBar({ v }: { v: View }) {
  return (
    <header className="sa-top" style={{height: "64px", flexShrink: "0", background: "#fff", borderBottom: "1px solid #eef2f6", display: "flex", alignItems: "center", gap: "16px", padding: "0 28px", position: "relative", zIndex: "30"}}>
      <button className="sa-burger" onClick={v.toggleNav} aria-label="Menu" aria-controls="sa-nav" aria-expanded={!!v.navOpen} style={{display: "none", width: "44px", height: "44px", marginLeft: "-8px", border: "0", borderRadius: "10px", background: "transparent", color: "#0A2550", cursor: "pointer", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
      </button>
      <div className="sa-title" style={{fontFamily: "'Rubik',sans-serif", fontSize: "20px", fontWeight: "700", color: "#0A2550", flex: "1", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{I(v.pageTitle)}</div>
      <div className="sa-search" style={{display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#f7f9fb", width: "280px", color: "#6b7a8c"}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input value={val(v.gsearch, "")} onChange={v.onGSearch} placeholder="Search posts…" aria-label="Search posts" style={{flex: "1", border: "0", background: "transparent", outline: "none", fontSize: "13px"}} />
      </div>
      <span style={{position: "relative", display: "flex"}}>
        <button onClick={v.toggleNotifs} aria-label={v.notifUnread ? "Notifications, " + v.notifBadge + " unread" : "Notifications"} aria-expanded={!!v.notifOpen} aria-controls="sa-notifs" style={{width: "40px", height: "40px", border: "0", borderRadius: "10px", background: v.notifOpen ? "#eef4fb" : "transparent", color: v.notifOpen ? "#0D3B7A" : "#3b4a5c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
          {v.notifUnread ? <span aria-hidden="true" style={{position: "absolute", top: "3px", right: "2px", minWidth: "18px", height: "18px", padding: "0 5px", boxSizing: "border-box", borderRadius: "999px", background: "#E9791E", color: "#fff", border: "2px solid #fff", fontSize: "10px", fontWeight: "700", lineHeight: "14px", textAlign: "center", fontFamily: "'Rubik',sans-serif"}}>{I(v.notifBadge)}</span> : null}
        </button>
        {v.notifOpen ? <Notifications v={v} /> : null}
      </span>
      <button onClick={v.toggleMenu} style={{display: "flex", alignItems: "center", gap: "10px", height: "42px", padding: "0 10px 0 4px", border: "1px solid #eef2f6", borderRadius: "999px", background: "#fff", cursor: "pointer"}}>
        <span style={{width: "34px", height: "34px", borderRadius: "50%", background: "#0D3B7A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rubik',sans-serif", fontWeight: "700"}}>{I(v.meInitial)}</span>
        <span className="sa-me" style={{textAlign: "left", lineHeight: "1.2"}}>
          <span style={{display: "block", fontWeight: "700", fontSize: "13px", color: "#0A2550"}}>{I(v.meName)}</span>
          <span style={{display: "block", fontSize: "11px", color: "#6b7a8c"}}>Super Admin</span>
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a8c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {/* Click anywhere outside the account menu closes it. */}
      {v.menuOpen ? <div aria-hidden="true" onClick={v.toggleMenu} style={{position: "fixed", inset: "0", zIndex: "38"}} /> : null}
      {v.menuOpen ? <div style={{position: "absolute", top: "60px", right: "min(28px, 3vw)", width: "220px", background: "#fff", border: "1px solid #eef2f6", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,64,126,.16)", padding: "6px", zIndex: "40", animation: "sa-fade .15s ease-out"}}>
          {" "}
          <button onClick={v.menuProfile} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#17212e"}}>My profile</button>
          {" "}
          {v.canSettings ? <button onClick={v.goSettingsM} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#17212e"}}>Settings</button> : null}
          {" "}
          <button onClick={v.menuChangePassword} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#17212e"}}>Change password</button>
          {" "}
          <div style={{height: "1px", background: "#eef2f6", margin: "4px 0"}} />
          {" "}
          <button onClick={v.logout} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#b3261e", fontWeight: "700"}}>Logout</button>
          {" "}
        </div> : null}
    </header>
  );
}
