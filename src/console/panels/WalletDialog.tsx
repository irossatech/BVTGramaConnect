// The Citizens & wallet dialogs (BVTGC-139/140; mockup console.html frames 2, 3, 4b and 4c): set a new email or remove
// a number after a call-back (the button works only after the tick and a reason), block, unblock, delete, find a
// caller's account, adjust points and decide a referral. Built from the confirm dialog (ConfirmModal.tsx); the
// server's field errors show under their field.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

const label = {fontSize: "12px", fontWeight: "700", color: "#0A2550"} as const;
const input = {height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"} as const;
const errText = {fontSize: "12px", color: "#b3261e", lineHeight: "1.4"} as const;
const box = (warn: boolean) => ({background: warn ? "#fff0dc" : "#eef4fb", color: warn ? "#b35a0e" : "#0D3B7A", borderRadius: "10px", padding: "10px 12px", fontSize: "13px", lineHeight: "1.45"});

export default function WalletDialog({ v }: { v: View }) {
  const d = v.wd;
  return (
    <>
      <div style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "60"}}>
        <div role="dialog" aria-modal="true" aria-labelledby="gc-wd-title" style={{width: "min(480px, calc(100vw - 32px))", maxHeight: "calc(100vh - 48px)", overflowY: "auto", background: "#fff", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 60px rgba(0,0,0,.25)", animation: "sa-fade .15s ease-out"}}>
          <div id="gc-wd-title" style={{fontFamily: "'Rubik',sans-serif", fontSize: "19px", fontWeight: "700", color: "#0A2550"}}>{I(d?.title)}</div>
          {d?.info ? <div style={box(false)}>{I(d?.info)}</div> : null}
          {d?.warn ? <div style={box(true)}>{I(d?.warn)}</div> : null}
          {d?.needsCalled ? <label style={{display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer", fontSize: "13.5px", color: "#17212e", lineHeight: "1.45"}}>
              <input type="checkbox" checked={val(d?.called, false)} onChange={v.toggleWdCalled} style={{width: "18px", height: "18px", marginTop: "1px", accentColor: "#0D3B7A", flexShrink: "0"}} />
              <span>I called the number back and spoke to the citizen.</span>
            </label> : null}
          {d?.errCalled ? <span style={errText}>{I(d?.errCalled)}</span> : null}
          {d?.needsEmail ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={label}>New email</span>
              <input type="email" value={val(d?.email, "")} onChange={v.onWdEmail} autoComplete="off" style={{...input, borderColor: d?.errEmail ? "#b3261e" : "#cfd8e3"}} />
              {d?.errEmail ? <span style={errText}>{I(d?.errEmail)}</span> : null}
            </label> : null}
          {d?.needsFind ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={label}>Mobile number or email</span>
              <input type="text" value={val(d?.find, "")} onChange={v.onWdFind} onKeyDown={v.onWdFindKey} autoFocus={true} autoComplete="off" style={{...input, borderColor: d?.errFind ? "#b3261e" : "#cfd8e3"}} />
              {d?.errFind ? <span style={errText}>{I(d?.errFind)}</span> : null}
            </label> : null}
          {d?.needsPoints ? <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={label}>Points</span>
              <span style={{display: "flex", gap: "8px", alignItems: "center"}}>
                {list(v.wdSigns).map((_s, _i1) => (
                  <React.Fragment key={_i1}>
                    <button type="button" onClick={_s.go} aria-pressed={_s.on} style={css(`height:40px;padding:0 14px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;border:1px solid ${_s.on ? "#0D3B7A" : "#cfd8e3"};background: ${_s.on ? "#0D3B7A" : "#fff"};color: ${_s.on ? "#fff" : "#3b4a5c"}`)}>{I(_s.label)}</button>
                  </React.Fragment>
                ))}
                <input type="text" inputMode="numeric" aria-label="Points" value={val(d?.points, "")} onChange={v.onWdPoints} autoComplete="off" style={{...input, width: "120px", fontFamily: "'Rubik',sans-serif", fontWeight: "700", borderColor: d?.errPoints ? "#b3261e" : "#cfd8e3"}} />
              </span>
              {d?.errPoints ? <span style={errText}>{I(d?.errPoints)}</span> : null}
            </div> : null}
          {d?.needsReason ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={label}>{I(d?.reasonLabel)}</span>
              <textarea value={val(d?.reason, "")} onChange={v.onWdReason} rows={3} maxLength={500} style={{padding: "12px", border: "1px solid " + (d?.errReason ? "#b3261e" : "#cfd8e3"), borderRadius: "10px", fontSize: "14px", lineHeight: "1.5", resize: "none", outlineColor: "#0D3B7A"}} />
              {d?.errReason ? <span style={errText}>{I(d?.errReason)}</span> : null}
            </label> : null}
          {d?.errForm ? <span style={errText}>{I(d?.errForm)}</span> : null}
          {d?.foundNone ? <span style={{fontSize: "13px", color: "#647182"}}>No account has this mobile number or email.</span> : null}
          {list(v.wdFound).length ? <table style={{width: "100%", fontSize: "13px"}}>
              <thead>
                <tr style={{color: "#647182", textAlign: "left", fontSize: "12px"}}><th style={{padding: "6px 4px", fontWeight: "600"}}>Name</th><th style={{padding: "6px 4px", fontWeight: "600"}}>Village</th><th style={{padding: "6px 4px", fontWeight: "600"}}>Mobile</th><th /></tr>
              </thead>
              <tbody>
                {list(v.wdFound).map((_f, _i1) => (
                  <React.Fragment key={_f?.rowKey ?? _i1}>
                    <tr style={{borderTop: "1px solid #f3f5f8"}}>
                      <td style={{padding: "8px 4px", fontWeight: "700", color: "#0A2550"}}>{I(_f?.name)}<span style={{display: "block", fontWeight: "400", fontSize: "11.5px", color: "#647182"}}>{I(_f?.status)}</span></td>
                      <td style={{padding: "8px 4px", color: "#3b4a5c"}}>{I(_f?.village)}</td>
                      <td style={{padding: "8px 4px", color: "#3b4a5c"}}>{I(_f?.mobile)}</td>
                      <td style={{padding: "8px 4px", textAlign: "right"}}><button onClick={_f?.open} style={{border: "0", background: "transparent", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Open ›</button></td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table> : null}
          <div style={{display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px"}}>
            <button onClick={v.closeWd} style={{height: "42px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>{d?.kind === "find" ? "Close" : "Cancel"}</button>
            <button onClick={v.submitWd} disabled={d?.cannot} style={css(`height:42px;padding:0 20px;border:0;border-radius:999px;color:#fff;font-weight:700;cursor:pointer;background: ${d?.bg ?? ""};opacity: ${d?.opacity ?? ""}`)}>{d?.busy ? "Working…" : I(d?.confirm)}</button>
          </div>
        </div>
      </div>
    </>
  );
}
