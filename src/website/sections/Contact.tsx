// Contact page: office details and the message form.
import { I, val } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function Contact({ v }: { v: View }) {
  const { ink, green, muted, line, display, fs, wrap, h1, kicker, lead, pillDark, pillLight, textBtn, field } = ui(v);
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
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fName)}</span>
                  <input name="name" autoComplete="name" value={val(v.form?.name, "")} onChange={v.onField} placeholder={v.t?.fNamePh} style={field} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fMobile)}</span>
                  <input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} value={val(v.form?.mobile, "")} onChange={v.onField} placeholder={v.t?.fMobilePh} style={field} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fVillage)}</span>
                  <input name="village" value={val(v.form?.village, "")} onChange={v.onField} placeholder={v.t?.fVillagePh} style={field} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fMessage)}</span>
                  <textarea name="message" rows={4} value={val(v.form?.message, "")} onChange={v.onField} placeholder={v.t?.fMessagePh} style={{...field, height: "auto", padding: "12px 14px", lineHeight: "1.5", resize: "vertical"}} />
                </label>
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{position: "absolute", left: "-10000px", width: "1px", height: "1px", opacity: "0"}} />
                {v.formError ? <div role="alert" style={{fontSize: fs.base, color: "#b3261e", fontWeight: "500"}}>{I(v.t?.fError)}</div> : null}
                <button className="gc-pill" onClick={v.submitForm} style={{...pillDark, height: "48px", fontSize: fs.base, marginTop: "4px"}}>{I(v.t?.fSend)}</button>
                <p style={{margin: "0", fontSize: fs.sm, lineHeight: "1.5", color: muted, textAlign: "center"}}>{I(v.t?.formNote)}{" "}<button onClick={v.goPrivacy} style={{...textBtn, fontSize: fs.sm, textDecoration: "underline", textUnderlineOffset: "3px"}}>{I(v.t?.footPrivacy)}</button></p>
              </div> : null}
          </div>
        </div>
      </section>
  );
}
