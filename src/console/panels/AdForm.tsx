// New banner / Edit banner: one slot takes a picture or a video, then its name, link, area, dates and on/off.
import { I, css, list, val } from "../../shared/dc";
import { SearchSelect } from "../ui/parts";
import type { View } from "../Console";

const field = (bad: boolean) => css(`width:100%;box-sizing:border-box;height:42px;padding:0 12px;border-radius:10px;font-size:14px;background:#fff;border:1px solid ${bad ? "#b3261e" : "#cfd8e3"}`);
const label = {fontSize: "13px", fontWeight: "700", color: "#0A2550"} as const;
const hint = {fontSize: "12px", color: "#6b7a8c"} as const;
const errText = {fontSize: "12px", fontWeight: "700", color: "#b3261e"} as const;
const col = {display: "flex", flexDirection: "column", gap: "6px"} as const;
const optional = <span style={{fontWeight: "400", color: "#6b7a8c"}}>· optional</span>;
const changeBtn = {height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", flexShrink: "0"} as const;

export default function AdForm({ v }: { v: View }) {
  const f = v.af;
  if (!f) return null;
  return (
    <>
      <div onClick={v.closeAF} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={f.title_} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(500px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(f.title_)}</span>
          <button onClick={v.closeAF} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "20px"}}>
          <div style={col}>
            <span style={label}>Picture or video</span>
            {f.isVideo && f.vpreview ? <>
                <span style={{position: "relative", display: "block"}}>
                  {/* No poster: the server's is a grey placeholder without ffmpeg; one second in shows a real frame. */}
                  <video src={f.vpreview + "#t=1"} controls={true} preload="metadata" aria-label="Banner video preview" style={{width: "100%", aspectRatio: "3/2", borderRadius: "12px", background: "#0A2550", objectFit: "contain", display: "block"}} />
                  {f.durLabel ? <span style={{position: "absolute", left: "10px", top: "10px", padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", background: "rgba(0,0,0,.6)", color: "#fff"}}>{I(f.durLabel)}</span> : null}
                </span>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                  <span style={{flex: "1", ...hint}}>Plays without sound on Home; people can turn it on.</span>
                  <button onClick={v.pickAdMedia} disabled={!!f.saving} style={changeBtn}>Change</button>
                </div>
              </> : !f.isVideo && f.preview ? <>
                <button onClick={v.pickAdMedia} disabled={!!f.saving} aria-label="Change banner" style={{aspectRatio: "3/2", width: "100%", borderRadius: "12px", overflow: "hidden", cursor: "pointer", padding: "0", display: "flex", background: "#0A2550", border: "0"}}>
                  <span style={{position: "relative", display: "block", width: "100%", height: "100%", overflow: "hidden"}}><img src={f.preview} alt="" aria-hidden="true" style={{position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", filter: "blur(14px) brightness(.8)", transform: "scale(1.15)"}} /><img src={f.preview} alt="Banner preview" style={{position: "relative", width: "100%", height: "100%", objectFit: "contain", display: "block"}} /></span>
                </button>
                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                  <span style={{flex: "1", ...hint}}>As it shows on Home: the whole picture, nothing cut off.</span>
                  <button onClick={v.pickAdMedia} disabled={!!f.saving} style={changeBtn}>Change</button>
                </div>
              </> : <button onClick={v.pickAdMedia} disabled={!!f.vchecking} style={css(`aspect-ratio:3/2;width:100%;border-radius:12px;overflow:hidden;cursor:pointer;padding:0 24px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;background:#eef4fb;border: 1.5px dashed ${f.errImage ? "#b3261e" : "#9db8d9"}`)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D3B7A" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                <span style={{fontWeight: "700", color: "#0D3B7A", fontSize: "14px"}}>Choose a picture or video</span>
                <span aria-live="polite" style={{fontSize: "12px", color: "#3b4a5c", lineHeight: "1.4"}}>{I(f.mediaHint)}</span>
              </button>}
            {f.errImage ? <span style={errText}>{I(f.errImage)}</span> : null}
          </div>
          <label style={col}>
            <span style={label}>Banner name</span>
            <input name="title" value={val(f.title, "")} onChange={v.onAF} maxLength={80} placeholder="e.g. Free eye camp at Tenali" aria-invalid={!!f.errTitle} style={field(!!f.errTitle)} />
            {f.errTitle ? <span style={errText}>{I(f.errTitle)}</span> : null}
          </label>
          <label style={col}>
            <span style={label}>Link {optional}</span>
            <input name="link" value={val(f.link, "")} onChange={v.onAF} maxLength={500} placeholder="https://" aria-invalid={!!f.errLink} style={field(!!f.errLink)} />
            {f.errLink ? <span style={errText}>{I(f.errLink)}</span> : <span style={hint}>Opens when someone taps the banner.</span>}
          </label>
          <div style={col}>
            <span style={label}>Who sees it</span>
            <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
              <SearchSelect name="d" aria-label="District" value={val(f.d, "")} onChange={v.onAF} style={{...field(false), flex: "1 1 130px", width: "auto"}}>
                <option value="">Everyone</option>
                {list(f.dOpts).map((_o, _i1) => <option key={_i1} value={_o?.id}>{_o?.label}</option>)}
              </SearchSelect>
              {f.showM ? <SearchSelect name="m" aria-label="Mandal" value={val(f.m, "")} onChange={v.onAF} style={{...field(false), flex: "1 1 130px", width: "auto"}}>
                  <option value="">All mandals</option>
                  {list(f.mOpts).map((_o, _i1) => <option key={_i1} value={_o?.id}>{_o?.label}</option>)}
                </SearchSelect> : null}
              {f.showV ? <SearchSelect name="v" aria-label="Village" value={val(f.v, "")} onChange={v.onAF} style={{...field(false), flex: "1 1 130px", width: "auto"}}>
                  <option value="">All villages</option>
                  {list(f.vOpts).map((_o, _i1) => <option key={_i1} value={_o?.id}>{_o?.label}</option>)}
                </SearchSelect> : null}
            </div>
            <span aria-live="polite" style={hint}>{I(f.where)}</span>
          </div>
          <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
            <label style={{...col, flex: "1", minWidth: "160px"}}>
              <span style={label}>Starts</span>
              <input type="date" name="start" value={val(f.start, "")} onChange={v.onAF} style={field(false)} />
            </label>
            <label style={{...col, flex: "1", minWidth: "160px"}}>
              <span style={label}>Ends {optional}</span>
              <input type="date" name="end" value={val(f.end, "")} onChange={v.onAF} aria-invalid={!!f.errEnd} style={field(!!f.errEnd)} />
            </label>
          </div>
          {f.errEnd ? <span style={{...errText, marginTop: "-12px"}}>{I(f.errEnd)}</span> : null}
          <label style={{display: "flex", alignItems: "center", gap: "12px", cursor: "pointer"}}>
            <span style={{flex: "1", ...label}}>Show this banner</span>
            <button type="button" role="switch" aria-checked={!!f.active} aria-label="Show this banner" onClick={f.toggleActive} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:999px;border:0;padding:3px;cursor:pointer;display:flex;transition:background .15s;justify-content: ${f.active ? "flex-end" : "flex-start"};background: ${f.active ? "#1F8A3B" : "#cfd8e3"}`)}><span style={{width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)"}} /></button>
          </label>
        </div>
        <div style={{padding: "14px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", alignItems: "center"}}>
          {f.isEdit ? <button onClick={f.del} disabled={!!f.saving} style={{height: "42px", padding: "0 16px", border: "1px solid #f0c7c4", borderRadius: "999px", background: "#fff", color: "#b3261e", fontWeight: "700", cursor: "pointer"}}>Delete</button> : null}
          <span style={{flex: "1"}} />
          <button onClick={v.closeAF} disabled={!!f.saving} style={{height: "42px", padding: "0 18px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: f.saving ? "not-allowed" : "pointer", opacity: f.saving ? ".6" : "1"}}>Cancel</button>
          <button onClick={v.saveAF} disabled={!!f.saving} aria-busy={!!f.saving} style={css(`height:42px;padding:0 22px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${f.saving ? .6 : 1}`)}>{I(f.saveLabel)}</button>
        </div>
      </div>
    </>
  );
}
