// "Delete my wallet account" (/delete-account/, BVTGC-142; mockup website.html frame 2): the deletion page given to
// Google Play. Step 1: the email or mobile number and Send code. Step 2: the emailed code, the warning, "I understand"
// and Delete. Step 3: done. It always says "If this is registered, we sent a code", so it never tells who is
// registered. Built from the Contact page's form card and fields.
import { I, val } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function DeleteAccount({ v }: { v: View }) {
  const { ink, green, muted, display, fs, wrap, h1, kicker, lead, pillDark, pillLight, textBtn, field } = ui(v);
  const red = "#b3261e";
  const d = v.del;
  const note = (warn: boolean) => ({padding: "12px 14px", borderRadius: "12px", fontSize: fs.base, lineHeight: "1.55", fontWeight: "600", background: warn ? "#fde8e6" : "#e3f0fb", color: warn ? red : "#0D3B7A"});
  const err = d?.err ? <div role="alert" style={{display: "flex", flexDirection: "column", gap: "8px", fontSize: fs.sm, lineHeight: "1.45", color: red, fontWeight: "600"}}>
      {I(d?.err)}
      {d?.expired ? <button onClick={v.delResend} style={{...textBtn, color: red, textDecoration: "underline", textUnderlineOffset: "3px", alignSelf: "flex-start"}}>{I(v.t?.delResend)}</button> : null}
    </div> : null;
  return (
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
      <div style={{...wrap, maxWidth: "560px", display: "flex", flexDirection: "column", gap: "16px", animation: "mk-fade .25s ease-out"}}>
        <div style={kicker}>{I(d?.stepLabel)}</div>
        <h1 style={h1}>{I(d?.step3 ? v.t?.delDoneTitle : v.t?.delTitle)}</h1>
        <div style={{background: "#fff", borderRadius: "24px", padding: "clamp(22px,3vw,36px)", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 1px 2px rgba(17,17,17,.04), 0 12px 32px -12px rgba(17,17,17,.08)"}}>
          {d?.step1 ? <>
              <p style={{...lead, maxWidth: "none"}}>{I(v.t?.delSub)}</p>
              <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.delLogin)}</span>
                <input name="login" autoComplete="username" value={val(d?.login, "")} onChange={v.onDelLogin} onKeyDown={v.onDelLoginKey} aria-invalid={!!d?.err} style={{...field, ...(d?.err ? {borderColor: red, outlineColor: red} : null)}} />
              </label>
              {err}
              <button className="gc-pill" onClick={v.delSend} disabled={!d?.canSend} style={{...pillDark, height: "48px", fontSize: fs.base, opacity: d?.canSend ? "1" : ".55"}}>{I(d?.busy ? v.t?.delWait : v.t?.delSend)}</button>
              <p style={{margin: "0", fontSize: fs.sm, lineHeight: "1.5", color: muted}}>{I(v.t?.delOther)}</p>
            </> : null}
          {d?.step2 ? <>
              <div role="status" style={note(false)}>{I(v.t?.delSent)}</div>
              <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.delCode)}</span>
                <input name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={val(d?.code, "")} onChange={v.onDelCode} aria-invalid={!!d?.err} style={{...field, fontFamily: display, fontSize: "22px", letterSpacing: ".3em", textAlign: "center", ...(d?.err ? {borderColor: red, outlineColor: red} : null)}} />
              </label>
              <div style={note(true)}>{I(v.t?.delWarn)}</div>
              <label style={{display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: fs.base, color: ink, fontWeight: "600"}}>
                <input type="checkbox" checked={val(d?.ok, false)} onChange={v.toggleDelOk} style={{width: "20px", height: "20px", accentColor: red}} />
                {I(v.t?.delUnderstand)}
              </label>
              {err}
              <button className="gc-pill" onClick={v.delConfirm} disabled={!d?.canDelete} style={{...pillDark, height: "48px", fontSize: fs.base, border: "1.5px solid " + red, background: red, opacity: d?.canDelete ? "1" : ".55"}}>{I(d?.busy ? v.t?.delWait : v.t?.delBtn)}</button>
              <div style={{display: "flex", flexWrap: "wrap", gap: "4px 18px"}}>
                <button onClick={v.delResend} style={{...textBtn, fontSize: fs.sm}}>{I(v.t?.delResend)}</button>
                <button onClick={v.delBack} style={{...textBtn, fontSize: fs.sm}}>{I(v.t?.delChange)}</button>
              </div>
            </> : null}
          {d?.step3 ? <div role="status" style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", padding: "8px 0"}}>
              <span style={{width: "56px", height: "56px", borderRadius: "50%", background: green, display: "flex", alignItems: "center", justifyContent: "center"}}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
              </span>
              <div style={note(false)}>{I(v.t?.delDoneSub)}</div>
              <p style={{margin: "0", fontSize: fs.base, lineHeight: "1.6", color: muted}}>{I(v.t?.delDoneMore)}</p>
              <a className="gc-pill" href={v.homeHref} onClick={v.homeLink} style={{...pillLight, textDecoration: "none"}}>{I(v.t?.nav_home)}</a>
            </div> : null}
        </div>
      </div>
    </section>
  );
}
