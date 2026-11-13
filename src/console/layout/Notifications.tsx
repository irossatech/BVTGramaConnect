// The bell's dropdown: this official's notifications, newest first. Unread rows carry a tint and a dot;
// a row opens its post or service request and marks it read. Phones get a full-width sheet (ConsolePage CSS).
import React from "react";
import { I, list } from "../../shared/dc";
import type { View } from "../Console";

export default function Notifications({ v }: { v: View }) {
  return (
    <>
      {/* Click outside closes the list. */}
      <div aria-hidden="true" onClick={v.closeNotifs} style={{position: "fixed", inset: "0", zIndex: "38"}} />
      <section id="sa-notifs" className="sa-notif" role="dialog" aria-label="Notifications" style={{position: "absolute", top: "calc(100% + 8px)", right: "0", width: "380px", maxHeight: "min(520px, calc(100dvh - 96px))", display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", boxShadow: "0 1px 2px rgba(10,37,80,.06), 0 18px 40px -12px rgba(10,37,80,.28)", zIndex: "40", overflow: "hidden", animation: "sa-fade .15s ease-out", textAlign: "left"}}>
        <header style={{display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px 12px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"}}>Notifications</span>
          {v.notifUnread ? <span style={{padding: "2px 8px", borderRadius: "999px", background: "#fff0dc", color: "#b35a0e", fontSize: "11px", fontWeight: "700"}}>{I(v.notifBadge)}{" new"}</span> : null}
          {v.notifUnread ? <button onClick={v.readAllNotifs} style={{marginLeft: "auto", height: "30px", padding: "0 10px", border: "0", borderRadius: "999px", background: "transparent", color: "#0D3B7A", fontWeight: "700", fontSize: "12px", cursor: "pointer"}}>Mark all as read</button> : null}
        </header>
        <div style={{flex: "1", minHeight: "0", overflowY: "auto"}}>
          {v.notifError ? <div role="alert" style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "32px 20px", textAlign: "center", fontSize: "13px", color: "#6b7a8c"}}>
              Couldn’t load your notifications.
              <button onClick={v.notifRetry} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", fontSize: "12px", cursor: "pointer"}}>Try again</button>
            </div> : null}
          {v.notifEmpty ? <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", padding: "36px 24px", textAlign: "center"}}>
              <span style={{width: "44px", height: "44px", borderRadius: "50%", background: "#e4f4df", color: "#1F8A3B", display: "flex", alignItems: "center", justifyContent: "center"}}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              </span>
              <span style={{fontWeight: "700", fontSize: "14px", color: "#0A2550"}}>You’re all caught up</span>
              <span style={{fontSize: "12px", lineHeight: "1.5", color: "#6b7a8c", maxWidth: "260px"}}>New posts to review, escalations and service requests will show up here.</span>
            </div> : null}
          {list(v.notifRows).map((_n) => (
            <React.Fragment key={_n.id}>
              <button className="sa-notif-row" onClick={_n.open} style={{display: "flex", gap: "12px", width: "100%", padding: "12px 16px", border: "0", borderBottom: "1px solid #f3f5f8", background: _n.unread ? "#f5f9ff" : "#fff", textAlign: "left", cursor: _n.linked ? "pointer" : "default"}}>
                <span aria-hidden="true" style={{flexShrink: "0", width: "34px", height: "34px", borderRadius: "50%", background: _n.bg, color: _n.color, display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d={_n.d} /></svg>
                </span>
                <span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px"}}>
                  <span style={{display: "flex", alignItems: "baseline", gap: "8px"}}>
                    <span style={{flex: "1", minWidth: "0", fontSize: "13px", lineHeight: "1.35", fontWeight: _n.unread ? "700" : "600", color: "#0A2550"}}>{I(_n.title)}</span>
                    <span style={{flexShrink: "0", fontSize: "11px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(_n.time)}</span>
                  </span>
                  {_n.body ? <span style={{fontSize: "12px", lineHeight: "1.45", color: "#3b4a5c", display: "-webkit-box", WebkitLineClamp: "2", WebkitBoxOrient: "vertical", overflow: "hidden"}}>{I(_n.body)}</span> : null}
                  {_n.label ? <span style={{fontSize: "11px", fontWeight: "700", color: _n.color}}>{I(_n.label)}</span> : null}
                </span>
                {_n.unread ? <span aria-label="Unread" style={{flexShrink: "0", alignSelf: "center", width: "8px", height: "8px", borderRadius: "50%", background: "#0D3B7A"}} /> : null}
              </button>
            </React.Fragment>
          ))}
          {v.notifLoading ? <div aria-live="polite" style={{padding: "14px", textAlign: "center", fontSize: "12px", color: "#6b7a8c"}}>Loading…</div> : null}
          {v.notifHasMore && !v.notifLoading ? <div style={{padding: "10px", textAlign: "center"}}>
              <button onClick={v.notifMore} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", fontSize: "12px", cursor: "pointer"}}>Show older</button>
            </div> : null}
        </div>
      </section>
    </>
  );
}
