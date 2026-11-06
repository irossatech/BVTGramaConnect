// Contact page: office details and the message form.
import { I, val } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";
import { DetailRows } from "../ui/parts";
import type { ReactNode } from "react";

type Field = "name" | "mobile" | "village" | "message";

export default function Contact({ v }: { v: View }) {
  const { ink, green, muted, line, display, fs, wrap, h1, kicker, lead, pillDark, pillLight, textBtn, field: fieldStyle } = ui(v);
  // Every field is required: a star on the label, and a message under the field when Send finds it empty or wrong.
  const red = "#b3261e";
  const bad = (n: Field) => !!v.errs?.[n];
  const aria = (n: Field) => ({required: true, "aria-required": true, "aria-invalid": bad(n), "aria-describedby": bad(n) ? "err-" + n : undefined});
  const box = (n: Field) => ({...fieldStyle, ...(bad(n) ? {borderColor: red, outlineColor: red, background: "#fffafa"} : null)});
  const field = (n: Field, label: string | undefined, err: string | undefined, input: ReactNode) => (
    <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
      <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(label)} <span aria-hidden="true" style={{color: red}}>*</span></span>
      {input}
      {bad(n) ? <span id={"err-" + n} className="gc-err" style={{animation: "mk-fade .2s ease-out", display: "flex", alignItems: "flex-start", gap: "6px", fontSize: fs.sm, lineHeight: "1.4", color: red, fontWeight: "600"}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true" style={{flexShrink: "0", marginTop: "1px"}}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16v.5" /></svg>{I(err)}</span> : null}
    </label>
  );
  return (
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
        <div style={{...wrap, display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,72px)", alignItems: "flex-start", animation: "mk-fade .25s ease-out"}}>
          <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "18px"}}>
            <h1 style={h1}>{I(v.t?.contactTitle)}</h1>
            <p style={lead}>{I(v.t?.contactSub)}</p>
            <div style={{marginTop: "8px", borderBottom: "1px solid " + line}}>
              <div style={{padding: "18px 0", borderTop: "1px solid " + line, fontSize: fs.base, lineHeight: "1.6", color: muted}}>
                <div style={{...kicker, marginBottom: "6px"}}>{I(v.t?.officeLabel)}</div>
                {I(v.contact?.addr1)}<br />{I(v.contact?.addr2)}
              </div>
              <div style={{padding: "18px 0", borderTop: "1px solid " + line, fontSize: fs.base, lineHeight: "1.6", color: muted}}>
                <div style={{...kicker, marginBottom: "6px"}}>{I(v.t?.phoneLabel)}</div>
                <span style={{color: ink, fontWeight: "500"}}>{I(v.contact?.phone)}</span>{" · "}{I(v.contact?.hours)}<br />{I(v.contact?.email)}
              </div>
            </div>
          </div>
          <div style={{flex: "1 1 420px", background: "#fff", borderRadius: "24px", padding: "clamp(24px,3vw,40px)", boxShadow: "0 1px 2px rgba(17,17,17,.04), 0 12px 32px -12px rgba(17,17,17,.08)"}}>
            {v.sent ? <div role="status" style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", padding: "24px 0", animation: "mk-fade .25s ease-out"}}>
                <span style={{width: "56px", height: "56px", borderRadius: "50%", background: green, display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                <div style={{fontFamily: display, fontWeight: "700", fontSize: fs.xl, color: ink}}>{I(v.t?.sentTitle)}</div>
                <div style={{fontSize: fs.base, lineHeight: "1.6", color: muted, maxWidth: "360px"}}>{I(v.t?.sentBody)}{" "}<b style={{color: ink}}>{I(v.form?.name)}</b>{", +91 "}{I(v.form?.mobile)}</div>
                <button className="gc-pill" onClick={v.resetForm} style={{...pillLight, marginTop: "8px"}}>{I(v.t?.sendAnother)}</button>
              </div> : null}
            {v.notSent ? <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                {field("name", v.t?.fName, v.t?.errName, <input name="name" autoComplete="name" value={val(v.form?.name, "")} onChange={v.onField} placeholder={v.t?.fNamePh} {...aria("name")} style={box("name")} />)}
                {field("mobile", v.t?.fMobile, v.t?.errMobile, <input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={val(v.form?.mobile, "")} onChange={v.onField} placeholder={v.t?.fMobilePh} {...aria("mobile")} style={box("mobile")} />)}
                {field("village", v.t?.fVillage, v.t?.errVillage, <input name="village" autoComplete="address-level2" value={val(v.form?.village, "")} onChange={v.onField} placeholder={v.t?.fVillagePh} {...aria("village")} style={box("village")} />)}
                {field("message", v.t?.fMessage, v.t?.errMessage, <textarea name="message" rows={4} value={val(v.form?.message, "")} onChange={v.onField} placeholder={v.t?.fMessagePh} {...aria("message")} style={{...box("message"), height: "auto", padding: "12px 14px", lineHeight: "1.5", resize: "vertical"}} />)}
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position: "absolute", left: "-10000px", width: "1px", height: "1px", opacity: "0"}} />
                {v.formError ? <div role="alert" style={{fontSize: fs.base, color: "#b3261e", fontWeight: "500"}}>{I(v.t?.fError)}</div> : null}
                <button className="gc-pill" onClick={v.submitForm} style={{...pillDark, height: "48px", fontSize: fs.base, marginTop: "4px"}}>{I(v.t?.fSend)}</button>
                <p style={{margin: "0", fontSize: fs.sm, lineHeight: "1.5", color: muted, textAlign: "center"}}>{I(v.t?.formNote)}{" "}<button onClick={v.goPrivacy} style={{...textBtn, fontSize: fs.sm, textDecoration: "underline", textUnderlineOffset: "3px"}}>{I(v.t?.footPrivacy)}</button></p>
              </div> : null}
          </div>
        </div>
        <div style={{...wrap, marginTop: "clamp(48px,7vw,96px)"}}><DetailRows v={v} title={v.t?.ctTitle} items={v.contactHelp} note={v.t?.ctSafe} /></div>
      </section>
  );
}
