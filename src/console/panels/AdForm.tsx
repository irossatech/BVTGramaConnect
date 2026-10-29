// Add or edit an ad.
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function AdForm({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeAF} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={v.af?.title_} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(500px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.af?.title_)}</span>
          <button onClick={v.closeAF} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px"}}>
          <div style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Banner image <span style={{color: "#b3261e"}}>*</span></span>
            <button onClick={v.pickAdImage} style={css(`aspect-ratio:3/2;width:100%;border-radius:12px;overflow:hidden;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:6px;background: ${v.af?.preview ? "#0A2550" : "#eef4fb"};border: ${v.af?.preview ? "0" : "1.5px dashed " + (v.af?.errImage ? "#b3261e" : "#9db8d9")}`)}>
              {v.af?.preview ? <span style={{position: "relative", display: "block", width: "100%", height: "100%", overflow: "hidden"}}><img src={v.af?.preview} alt="" aria-hidden="true" style={{position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", filter: "blur(14px) brightness(.8)", transform: "scale(1.15)"}} /><img src={v.af?.preview} alt="Banner preview" style={{position: "relative", width: "100%", height: "100%", objectFit: "contain", display: "block"}} /></span> : <>
                <span style={{fontWeight: "700", color: "#0D3B7A", fontSize: "14px"}}>Choose an image</span>
                <span style={{fontSize: "12px", color: "#3b4a5c"}}>Wide picture, 3:2 (e.g. 1500 × 1000), JPG or PNG, up to 5 MB</span>
              </>}
            </button>
            {v.af?.preview ? <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <span style={{flex: "1", fontSize: "12px", color: "#6b7a8c"}}>This is how it looks on Home. The whole picture is shown, nothing is cut off; a wide 3:2 picture fills the banner best.</span>
                <button onClick={v.pickAdImage} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Change image</button>
              </div> : null}
            {v.af?.errImage ? <span style={{fontSize: "12px", fontWeight: "700", color: "#b3261e"}}>{I(v.af?.errImage)}</span> : null}
          </div>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Ad name <span style={{color: "#b3261e"}}>*</span></span>
            <input name="title" value={val(v.af?.title, "")} onChange={v.onAF} maxLength={80} placeholder="e.g. Free eye camp at Tenali" style={css(`height:42px;padding:0 12px;border-radius:10px;font-size:14px;background:#fff;border:1px solid ${v.af?.errTitle ? "#b3261e" : "#cfd8e3"}`)} />
            <span style={{fontSize: "12px", color: v.af?.errTitle ? "#b3261e" : "#6b7a8c", fontWeight: v.af?.errTitle ? "700" : "400"}}>{v.af?.errTitle || "Shown in this list and read out by screen readers in the app."}</span>
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Link to open on tap</span>
            <input name="link" value={val(v.af?.link, "")} onChange={v.onAF} maxLength={500} placeholder="https://" style={css(`height:42px;padding:0 12px;border-radius:10px;font-size:14px;background:#fff;border:1px solid ${v.af?.errLink ? "#b3261e" : "#cfd8e3"}`)} />
            <span style={{fontSize: "12px", color: v.af?.errLink ? "#b3261e" : "#6b7a8c", fontWeight: v.af?.errLink ? "700" : "400"}}>{v.af?.errLink || "Optional. Without a link, tapping the banner does nothing."}</span>
          </label>
          <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Who sees it</span>
            <span style={{fontSize: "12px", color: "#6b7a8c", lineHeight: "1.4"}}>Leave it on All to show it in every village, or pick a district, mandal or village to show it only there.</span>
            <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
              <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>District</span>
              <select name="d" value={val(v.af?.d, "")} onChange={v.onAF} style={{height: "42px", padding: "0 12px", borderRadius: "10px", fontSize: "14px", background: "#fff", border: "1px solid #cfd8e3"}}>
                <option value="">All districts</option>
                {list(v.af?.dOpts).map((_o, _i1) => <option key={_i1} value={_o?.id}>{_o?.label}</option>)}
              </select>
            </label>
            {v.af?.showM ? <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Mandal</span>
                <select name="m" value={val(v.af?.m, "")} onChange={v.onAF} style={{height: "42px", padding: "0 12px", borderRadius: "10px", fontSize: "14px", background: "#fff", border: "1px solid #cfd8e3"}}>
                  <option value="">{v.af?.allM}</option>
                  {list(v.af?.mOpts).map((_o, _i1) => <option key={_i1} value={_o?.id}>{_o?.label}</option>)}
                </select>
              </label> : null}
            {v.af?.showV ? <label style={{display: "flex", flexDirection: "column", gap: "4px"}}>
                <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Village</span>
                <select name="v" value={val(v.af?.v, "")} onChange={v.onAF} style={{height: "42px", padding: "0 12px", borderRadius: "10px", fontSize: "14px", background: "#fff", border: "1px solid #cfd8e3"}}>
                  <option value="">{v.af?.allV}</option>
                  {list(v.af?.vOpts).map((_o, _i1) => <option key={_i1} value={_o?.id}>{_o?.label}</option>)}
                </select>
              </label> : null}
            <div aria-live="polite" style={{display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "#eef4fb", fontSize: "13px", color: "#0A2550", lineHeight: "1.4"}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0D3B7A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: "0", marginTop: "1px"}}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
              <span>Shows in: <b>{I(v.af?.where)}</b></span>
            </div>
          </div>
          <div style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
            <label style={{flex: "1", minWidth: "160px", display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Start</span>
              <input type="date" name="start" value={val(v.af?.start, "")} onChange={v.onAF} style={{height: "42px", padding: "0 12px", borderRadius: "10px", fontSize: "14px", background: "#fff", border: "1px solid #cfd8e3"}} />
            </label>
            <label style={{flex: "1", minWidth: "160px", display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>End <span style={{fontWeight: "400", color: "#6b7a8c"}}>(empty = no end)</span></span>
              <input type="date" name="end" value={val(v.af?.end, "")} onChange={v.onAF} style={css(`height:42px;padding:0 12px;border-radius:10px;font-size:14px;background:#fff;border:1px solid ${v.af?.errEnd ? "#b3261e" : "#cfd8e3"}`)} />
            </label>
          </div>
          {v.af?.errEnd ? <span style={{fontSize: "12px", fontWeight: "700", color: "#b3261e"}}>{I(v.af?.errEnd)}</span> : null}
          <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", border: "1px solid #eef2f6", borderRadius: "12px"}}>
            <span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px"}}>
              <span style={{fontWeight: "700", color: "#0A2550", fontSize: "14px"}}>Show this ad</span>
              <span style={{fontSize: "12px", color: "#6b7a8c"}}>When off, it is hidden even on its dates.</span>
            </span>
            <button type="button" role="switch" aria-checked={!!v.af?.active} aria-label="Show this ad" onClick={v.af?.toggleActive} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:999px;border:0;padding:3px;cursor:pointer;display:flex;transition:background .15s;justify-content: ${v.af?.active ? "flex-end" : "flex-start"};background: ${v.af?.active ? "#1F8A3B" : "#cfd8e3"}`)}><span style={{width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)"}} /></button>
          </div>
        </div>
        <div style={{padding: "14px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px", alignItems: "center"}}>
          {v.af?.isEdit ? <button onClick={v.af?.del} style={{height: "42px", padding: "0 16px", border: "1px solid #f0c7c4", borderRadius: "999px", background: "#fff", color: "#b3261e", fontWeight: "700", cursor: "pointer"}}>Delete</button> : null}
          <span style={{flex: "1"}} />
          <button onClick={v.closeAF} style={{height: "42px", padding: "0 18px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
          <button onClick={v.saveAF} disabled={!!v.af?.saving} style={css(`height:42px;padding:0 22px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${v.af?.saving ? .6 : 1}`)}>{I(v.af?.saveLabel)}</button>
        </div>
      </div>
    </>
  );
}
