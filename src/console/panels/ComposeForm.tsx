// New post: the app's Compose in the console. Title, message, category, photos or one video, who sees it, urgent.
// The language is read from the text (logic/compose.ts). An admin's post is published at once (the server decides).
import { I, css, list, val } from "../../shared/dc";
import { SearchSelect } from "../ui/parts";
import type { View } from "../Console";

const field = (bad: boolean) => css(`width:100%;box-sizing:border-box;height:42px;padding:0 12px;border-radius:10px;font-size:14px;background:#fff;border:1px solid ${bad ? "#b3261e" : "#cfd8e3"}`);
const label = {fontSize: "13px", fontWeight: "700", color: "#0A2550"} as const;
const hint = {fontSize: "12px", color: "#6b7a8c"} as const;
const errText = {fontSize: "12px", fontWeight: "700", color: "#b3261e"} as const;
const col = {display: "flex", flexDirection: "column", gap: "6px"} as const;
// A required field's mark: the red star the prototype's Compose uses. Screen readers get aria-required instead.
const Req = () => <span aria-hidden="true" style={{color: "#b3261e"}}> *</span>;

export default function ComposeForm({ v }: { v: View }) {
  const f = v.cf;
  if (!f) return null;
  return (
    <>
      <div onClick={v.closeCF} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label="New post" style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(520px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-fade .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>New post</span>
          <button onClick={v.closeCF} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px"}}>
          <label style={col}>
            <span style={label}>Title<Req /></span>
            <input name="title" value={val(f.title, "")} onChange={v.onCF} maxLength={150} lang={f.lang} aria-required={true} aria-invalid={!!f.errTitle} style={field(!!f.errTitle)} />
            {f.errTitle ? <span style={errText}>{I(f.errTitle)}</span> : f.titleCount ? <span style={hint}>{I(f.titleCount)}</span> : null}
          </label>
          <label style={col}>
            <span style={label}>Message<Req /></span>
            <textarea name="body" value={val(f.body, "")} onChange={v.onCF} maxLength={5000} rows={6} lang={f.lang} aria-required={true} aria-invalid={!!f.errBody} style={css(`width:100%;box-sizing:border-box;padding:12px;border-radius:10px;font-size:14px;line-height:1.55;resize:vertical;border:1px solid ${f.errBody ? "#b3261e" : "#cfd8e3"}`)} />
            {f.errBody ? <span style={errText}>{I(f.errBody)}</span> : f.bodyCount ? <span style={hint}>{I(f.bodyCount)}</span> : null}
          </label>
          <label style={col}>
            <span style={label}>Category<Req /></span>
            <select name="cat" value={val(f.cat, "")} onChange={v.onCF} aria-required={true} aria-invalid={!!f.errCat} style={field(!!f.errCat)}>
              {list(f.catOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
            </select>
            {f.errCat ? <span style={errText}>{I(f.errCat)}</span> : null}
          </label>
          <div style={col}>
            <span style={label}>Who sees it</span>
            <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
              <SearchSelect name="d" aria-label="District" value={val(f.d, "")} onChange={v.onCF} style={{...field(false), flex: "1 1 140px", width: "auto"}}>
                <option value="">Everyone</option>
                {list(f.dOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
              </SearchSelect>
              {f.showM ? <SearchSelect name="m" aria-label="Mandal" value={val(f.m, "")} onChange={v.onCF} style={{...field(false), flex: "1 1 140px", width: "auto"}}>
                  <option value="">All mandals</option>
                  {list(f.mOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
                </SearchSelect> : null}
              {f.showV ? <SearchSelect name="v" aria-label="Village" value={val(f.v, "")} onChange={v.onCF} style={{...field(false), flex: "1 1 140px", width: "auto"}}>
                  <option value="">All villages</option>
                  {list(f.vOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
                </SearchSelect> : null}
            </div>
            <span aria-live="polite" style={hint}>{I(f.where)}</span>
          </div>
          <div style={col}>
            <span style={label}>Photos or video <span style={{fontWeight: "400", color: "#6b7a8c"}}>· optional</span></span>
            <div style={{display: "flex", gap: "10px", flexWrap: "wrap"}}>
              {list(f.photos).map((_p, _i1) => (
                <span key={_i1} style={{position: "relative", width: "80px", height: "80px", borderRadius: "10px", overflow: "hidden", background: _p.isVideo ? "#0A2550" : "#f7f9fb"}}>
                  {_p.isVideo ? <>
                      <video src={_p.src} muted={true} preload="metadata" aria-label={"Video " + (_i1 + 1)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
                      <span aria-hidden="true" style={{position: "absolute", left: "6px", bottom: "6px", padding: "2px 6px", borderRadius: "999px", background: "rgba(10,37,80,.75)", color: "#fff", fontSize: "11px", fontWeight: "700"}}>{I(_p.dur)}</span>
                    </> : <img src={_p.src} alt={"Photo " + (_i1 + 1)} style={{width: "100%", height: "100%", objectFit: "cover"}} />}
                  <button onClick={_p.remove} aria-label={(_p.isVideo ? "Remove video " : "Remove photo ") + (_i1 + 1)} style={{position: "absolute", top: "4px", right: "4px", width: "24px", height: "24px", border: "0", borderRadius: "50%", background: "rgba(10,37,80,.7)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
              {f.canAddPhoto ? <label style={{position: "relative", width: "80px", height: "80px", borderRadius: "10px", border: "1.5px dashed #cfd8e3", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0D3B7A"}}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                  <input type="file" accept={f.accept} multiple onChange={v.pickCFPhotos} aria-label={f.addLabel} style={{position: "absolute", width: "1px", height: "1px", opacity: "0"}} />
                </label> : null}
            </div>
            {f.photoErr ? <span style={errText}>{I(f.photoErr)}</span> : <span style={hint}>{I(f.mediaHelp)}</span>}
          </div>
          <label style={{display: "flex", alignItems: "center", gap: "12px", cursor: "pointer"}}>
            <span style={{flex: "1", ...label}}>Mark as urgent</span>
            <button type="button" role="switch" aria-checked={!!f.urgent} aria-label="Mark as urgent" onClick={f.toggleUrgent} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:999px;border:0;padding:3px;cursor:pointer;display:flex;transition:background .15s;justify-content:${f.urgent ? "flex-end" : "flex-start"};background:${f.urgent ? "#b3261e" : "#cfd8e3"}`)}>
              <span style={{width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.2)"}} />
            </button>
          </label>
        </div>
        <div style={{padding: "14px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", justifyContent: "flex-end"}}>
          <button onClick={v.closeCF} disabled={!!f.saving} style={{height: "42px", padding: "0 18px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: f.saving ? "not-allowed" : "pointer", opacity: f.saving ? ".6" : "1"}}>Cancel</button>
          <button onClick={v.saveCF} disabled={!!f.saving} aria-busy={!!f.saving} style={css(`height:42px;padding:0 22px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity:${f.saving ? .7 : 1}`)}>{I(f.saveLabel)}</button>
        </div>
      </div>
    </>
  );
}
