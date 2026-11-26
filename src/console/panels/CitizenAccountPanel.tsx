// A citizen's wallet account (BVTGC-139/140; mockup console.html frame 1): the balance, the details the Super Admin
// may see (masked email, last 4 digits), the actions the server allows, and the wallet history. Built from the
// Contact message panel. Not panels/CitizenDetail.tsx, which is about blocked phones.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

const field = {fontSize: "12px", fontWeight: "600", color: "#647182"} as const;
const value = {fontSize: "14px", fontWeight: "600", color: "#17212e", lineHeight: "1.35"} as const;
const heading = {fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"} as const;
const stat = {flex: "1", border: "1px solid #eef2f6", borderRadius: "12px", padding: "10px 12px", display: "flex", flexDirection: "column", gap: "2px"} as const;
const statN = {fontFamily: "'Rubik',sans-serif", fontSize: "24px", fontWeight: "700", color: "#0A2550"} as const;
const tag = (ok?: boolean) => ({padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", marginLeft: "6px", background: ok ? "#e4f4df" : "#eef2f6", color: ok ? "#1d7a33" : "#3b4a5c"});

export default function CitizenAccountPanel({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeWa} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={"Wallet account of " + (v.wa?.name || "")} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(480px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <div style={{flex: "1", minWidth: "0"}}>
            <div style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
              <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.wa?.name)}</span>
              <span style={css(`padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700;background: ${v.wa?.sbg ?? ""};color: ${v.wa?.scolor ?? ""}`)}>{I(v.wa?.statusLabel)}</span>
            </div>
            <div style={{fontSize: "12px", color: "#647182"}}>{"Joined "}{I(v.wa?.joined)}{" · last active "}{I(v.wa?.lastActive)}</div>
          </div>
          <button onClick={v.closeWa} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "12px"}}>
          <div style={{display: "flex", gap: "10px", flexShrink: "0"}}>
            <div style={stat}><span style={field}>Confirmed</span><span style={statN}>{I(v.wa?.confirmed)}</span></div>
            <div style={stat}><span style={field}>On hold</span><span style={{...statN, color: "#b35a0e"}}>{I(v.wa?.held)}</span></div>
          </div>
          {v.wa?.releaseNote ? <div style={{fontSize: "12px", color: "#647182", marginTop: "-4px"}}>{I(v.wa?.releaseNote)}</div> : null}
          {v.wa?.deleted ? <div style={{background: "#eef2f6", color: "#3b4a5c", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", lineHeight: "1.45"}}>{"Deleted on "}{I(v.wa?.deletedOn)}{". The name, email and number were removed; the wallet history stays."}</div> : null}
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden", flexShrink: "0"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px"}}><span style={field}>Village</span><span style={value}>{I(v.wa?.village)}</span></div>
            <div style={{display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}>
              <span style={field}>Mobile</span>
              <span style={value}>{I(v.wa?.mobile)}{v.wa?.deleted ? null : <span style={tag(v.wa?.mobileOk)}>{I(v.wa?.mobileVerified)}</span>}</span>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}>
              <span style={field}>Email</span>
              <span style={value}>{I(v.wa?.email)}{v.wa?.deleted ? null : <span style={tag(v.wa?.emailOk)}>{I(v.wa?.emailVerified)}</span>}</span>
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: "2px", padding: "10px 14px", borderTop: "1px solid #f3f5f8"}}><span style={field}>Referral code</span><span style={{...value, letterSpacing: ".06em"}}>{I(v.wa?.code)}</span></div>
          </div>
          {list(v.waActs).length ? <>
              <span style={{...heading, marginTop: "6px"}}>Actions</span>
              <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                {list(v.waActs).map((_a, _i1) => (
                  <React.Fragment key={_i1}>
                    <button onClick={_a.go} style={css(`height:36px;padding:0 16px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;background: ${_a.bg};color: ${_a.color};border: ${_a.border}`)}>{I(_a.label)}</button>
                  </React.Fragment>
                ))}
              </div>
            </> : null}
          {v.waCanHistory ? <>
              <span style={{...heading, marginTop: "6px"}}>Wallet history</span>
              {v.waHistEmpty ? <div style={{fontSize: "13px", color: "#647182"}}>{I(v.waHistText)}</div> : <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden", flexShrink: "0"}}>
                {list(v.waHist).map((_e, _i1) => (
                  <React.Fragment key={_e?.rowKey ?? _i1}>
                    <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderTop: _i1 ? "1px solid #f3f5f8" : "0"}}>
                      <span style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px"}}>
                        <span style={{fontWeight: "700", color: "#0A2550", fontSize: "13px"}}>{I(_e?.label)}</span>
                        <span style={{fontSize: "12px", color: "#647182", lineHeight: "1.4", overflowWrap: "anywhere"}}>{I(_e?.sub)}</span>
                      </span>
                      <span style={css(`font-family:'Rubik',sans-serif;font-weight:700;font-size:14px;color: ${_e?.color ?? ""}`)}>{I(_e?.points)}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>}
              {v.waHistMore ? <div style={{fontSize: "12px", color: "#647182"}}>{I(v.waHistMore)}</div> : null}
            </> : null}
        </div>
        <div style={{padding: "14px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", justifyContent: "flex-end"}}>
          <button onClick={v.closeWa} style={{height: "42px", padding: "0 18px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Close</button>
        </div>
      </div>
    </>
  );
}
