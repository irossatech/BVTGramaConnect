// New post: the app's Compose in the console. Category, language, title and message, who sees it,
// urgent, up to 3 photos or one video. An admin's post is published at once (the server decides).
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

const field = (bad: boolean) => css(`height:42px;padding:0 12px;border-radius:10px;font-size:14px;background:#fff;border:1px solid ${bad ? "#b3261e" : "#cfd8e3"}`);
const label = {fontSize: "12px", fontWeight: "700", color: "#0A2550"} as const;
const errText = {fontSize: "12px", fontWeight: "700", color: "#b3261e"} as const;

export default function ComposeForm({ v }: { v: View }) {
  const f = v.cf;
  if (!f) return null;
  return (
    <>
      <div onClick={v.closeCF} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label="New post" style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(540px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-fade .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>New post</span>
          <button onClick={v.closeCF} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px"}}>
          <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
            <label style={{flex: "2", minWidth: "200px", display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={label}>Category <span style={{color: "#b3261e"}}>*</span></span>
              <select name="cat" value={val(f.cat, "")} onChange={v.onCF} style={field(!!f.errCat)}>
                {list(f.catOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
              </select>
              {f.errCat ? <span style={errText}>{I(f.errCat)}</span> : null}
            </label>
            <label style={{flex: "1", minWidth: "140px", display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={label}>Written in</span>
              <select name="lang" value={val(f.lang, "te")} onChange={v.onCF} style={field(false)}>
                <option value="te">Telugu</option>
                <option value="en">English</option>
              </select>
            </label>
          </div>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{...label, display: "flex"}}><span style={{flex: "1"}}>Title <span style={{color: "#b3261e"}}>*</span></span><span style={{fontWeight: "400", color: "#6b7a8c"}}>{I(f.titleCount)}</span></span>
            <input name="title" value={val(f.title, "")} onChange={v.onCF} maxLength={150} lang={f.lang} placeholder={f.lang === "te" ? "ఉదా: తాగునీటి సరఫరా సమయం మార్పు" : "e.g. Drinking water timing change"} aria-invalid={!!f.errTitle} style={field(!!f.errTitle)} />
            {f.errTitle ? <span style={errText}>{I(f.errTitle)}</span> : null}
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{...label, display: "flex"}}><span style={{flex: "1"}}>Message <span style={{color: "#b3261e"}}>*</span></span><span style={{fontWeight: "400", color: "#6b7a8c"}}>{I(f.bodyCount)}</span></span>
            <textarea name="body" value={val(f.body, "")} onChange={v.onCF} maxLength={5000} rows={6} lang={f.lang} aria-invalid={!!f.errBody} style={css(`padding:12px;border-radius:10px;font-size:14px;line-height:1.55;resize:vertical;border:1px solid ${f.errBody ? "#b3261e" : "#cfd8e3"}`)} />
            {f.errBody ? <span style={errText}>{I(f.errBody)}</span> : null}
          </label>
          <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={label}>Photos or a video <span style={{fontWeight: "400", color: "#6b7a8c"}}>(optional · {I(f.photoCount)})</span></span>
            <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
              {list(f.photos).map((_p, _i1) => (
                <span key={_i1} style={{position: "relative", width: "88px", height: "88px", borderRadius: "10px", overflow: "hidden", background: _p.isVideo ? "#0A2550" : "#f7f9fb"}}>
                  {_p.isVideo ? <>
                      <video src={_p.src} muted={true} preload="metadata" aria-label={"Video " + (_i1 + 1)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
                      <span aria-hidden="true" style={{position: "absolute", left: "6px", bottom: "6px", display: "flex", alignItems: "center", gap: "3px", padding: "2px 6px", borderRadius: "999px", background: "rgba(10,37,80,.75)", color: "#fff", fontSize: "11px", fontWeight: "700"}}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4l14 8-14 8z" /></svg>
                        {I(_p.dur)}
                      </span>
                    </> : <img src={_p.src} alt={"Photo " + (_i1 + 1)} style={{width: "100%", height: "100%", objectFit: "cover"}} />}
                  <button onClick={_p.remove} aria-label={(_p.isVideo ? "Remove video " : "Remove photo ") + (_i1 + 1)} style={{position: "absolute", top: "4px", right: "4px", width: "24px", height: "24px", border: "0", borderRadius: "50%", background: "rgba(10,37,80,.7)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
              {f.canAddPhoto ? <label style={{position: "relative", width: "88px", height: "88px", borderRadius: "10px", border: "1.5px dashed #cfd8e3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", cursor: "pointer", color: "#0D3B7A", fontSize: "12px", fontWeight: "700"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  {I(f.addLabel)}
                  <input type="file" accept={f.accept} multiple onChange={v.pickCFPhotos} aria-label={f.addLabel} style={{position: "absolute", width: "1px", height: "1px", opacity: "0"}} />
                </label> : null}
            </div>
            {f.photoErr ? <span style={errText}>{I(f.photoErr)}</span> : <span style={{fontSize: "12px", color: "#6b7a8c"}}>Up to 3 photos (JPG, PNG or WebP, up to 10 MB each), or one video (MP4 or MOV, up to 60 MB, any length). Not both.</span>}
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={label}>Who sees it</span>
            <span style={{fontSize: "12px", color: "#6b7a8c", lineHeight: "1.4"}}>Leave it on All for everyone, or pick a district, mandal or village.</span>
            <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>District</span>
              <select name="d" value={val(f.d, "")} onChange={v.onCF} style={field(false)}>
                <option value="">All districts</option>
                {list(f.dOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
              </select>
            </label>
            {f.showM ? <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Mandal</span>
                <select name="m" value={val(f.m, "")} onChange={v.onCF} style={field(false)}>
                  <option value="">{f.allM}</option>
                  {list(f.mOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
                </select>
              </label> : null}
            {f.showV ? <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Village</span>
                <select name="v" value={val(f.v, "")} onChange={v.onCF} style={field(false)}>
                  <option value="">{f.allV}</option>
                  {list(f.vOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
                </select>
              </label> : null}
            <div aria-live="polite" style={{display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#eef4fb", fontSize: "13px", color: "#0A2550", lineHeight: "1.4"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D3B7A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: "0", marginTop: "1px"}}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>Shows in: <b>{I(f.where)}</b></span>
            </div>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: "1px solid #eef2f6", borderRadius: "12px"}}>
            <span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}>
              <span style={{fontWeight: "700", color: "#0A2550", fontSize: "14px"}}>Urgent</span>
              <span style={{fontSize: "12px", color: "#6b7a8c"}}>Shown at the top with an urgent mark.</span>
            </span>
            <button type="button" role="switch" aria-checked={!!f.urgent} aria-label="Urgent" onClick={f.toggleUrgent} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:999px;border:0;padding:3px;cursor:pointer;display:flex;transition:background .15s;justify-content:${f.urgent ? "flex-end" : "flex-start"};background:${f.urgent ? "#b3261e" : "#cfd8e3"}`)}>
              <span style={{width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)"}} />
            </button>
          </div>
        </div>
        <div style={{padding: "14px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", alignItems: "center"}}>
          <span style={{flex: "1"}} />
          <button onClick={v.closeCF} disabled={!!f.saving} style={{height: "42px", padding: "0 18px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
          <button onClick={v.saveCF} disabled={!!f.saving} aria-busy={!!f.saving} style={css(`height:42px;padding:0 22px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity:${f.saving ? .7 : 1}`)}>{I(f.saveLabel)}</button>
        </div>
      </div>
    </>
  );
}
