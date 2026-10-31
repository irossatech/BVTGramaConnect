// Add or edit a service or a bill.
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function ServiceForm({ v }: { v: View }) {
  return (
    <>
      <div onClick={v.closeSF} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label={v.sf?.title} style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(480px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <div style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.sf?.title)}</div>
          <button onClick={v.closeSF} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "18px"}}>
          <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: "6px"}}>
            <div style={{width: "108px", padding: "14px 8px", borderRadius: "16px", background: "#fff", border: "1px solid #eef2f6", boxShadow: "0 4px 14px rgba(0,64,126,.08)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px"}}>
              <span style={{width: "52px", height: "52px", borderRadius: "15px", background: v.sf.tint, color: v.sf.c, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>{v.sf.img ? <img src={v.sf.img} alt="" style={{height: "28px", maxWidth: "36px"}} /> : <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={v.sf.d} /></svg>}</span>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550", textAlign: "center", lineHeight: "1.3", wordBreak: "break-word"}}>{I(v.sf?.preview)}</span>
            </div>
            <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>How it looks on Home</span>
          </div>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Name (English) <span style={{color: "#b3261e"}}>*</span></span>
            <input name="en" value={val(v.sf?.en, "")} onChange={v.sf?.onField} placeholder={v.sf?.bill ? "e.g. Gas Booking" : "e.g. Ration Card"} maxLength={60} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A", borderColor: v.sf?.err ? "#b3261e" : "#cfd8e3"}} />
            {v.sf?.err ? <span role="alert" style={{fontSize: "12px", color: "#b3261e", fontWeight: "700"}}>{I(v.sf.err)}</span> : null}
          </label>
          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Name (Telugu)</span>
            <input name="te" value={val(v.sf?.te, "")} onChange={v.sf?.onField} placeholder="ఉదా: రేషన్ కార్డు" maxLength={60} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
            <span style={{fontSize: "12px", color: "#6b7a8c"}}>Shown when the app is in Telugu. Left empty, the English name is used.</span>
          </label>
          {v.sf?.bill ? null : <>
            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Request example (English)</span>
              <input name="hintEn" value={val(v.sf?.hintEn, "")} onChange={v.sf?.onField} placeholder="e.g. apply for a new ration card" maxLength={100} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
            </label>
            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Request example (Telugu)</span>
              <input name="hintTe" value={val(v.sf?.hintTe, "")} onChange={v.sf?.onField} placeholder="ఉదా: కొత్త రేషన్ కార్డు కోసం దరఖాస్తు" maxLength={100} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
              <span style={{fontSize: "12px", color: "#6b7a8c"}}>Shown in grey in the citizen’s “Your request” box when they request this service. Left empty, a general example is shown.</span>
            </label>
          </>}
          <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Icon <span style={{color: "#b3261e"}}>*</span></span>
            <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "12px", background: "#fff", border: v.sf?.ownIcon ? "2px solid " + v.sf.c : "1px solid #cfd8e3"}}>
              <span style={{width: "48px", height: "48px", borderRadius: "12px", background: v.sf?.ownIcon ? v.sf.tint : "#f7f9fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>
                {v.sf?.ownIcon ? <img src={v.sf.ownIcon} alt="" style={{width: "32px", height: "32px", objectFit: "contain"}} /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0D3B7A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 20h16" /></svg>}
              </span>
              <span style={{flex: "1", display: "flex", flexDirection: "column", gap: "2px", minWidth: "0"}}>
                <span style={{fontWeight: "700", fontSize: "13.5px", color: "#0A2550"}}>{v.sf?.ownIcon ? "Your icon" : "Upload your own icon"}</span>
                <span style={{fontSize: "12px", color: "#6b7a8c"}}>Square PNG, JPG or WebP, at least 64 × 64, up to 2 MB. For example a department logo.</span>
              </span>
              <button type="button" onClick={v.sf?.pickIcon} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", flexShrink: "0"}}>{v.sf?.ownIcon ? "Change" : "Upload"}</button>
              {v.sf?.ownIcon ? <button type="button" onClick={v.sf?.removeIcon} aria-label="Remove the uploaded icon" style={{height: "32px", padding: "0 10px", border: "0", borderRadius: "999px", background: "none", color: "#b3261e", fontWeight: "700", cursor: "pointer", fontSize: "12px", flexShrink: "0"}}>Remove</button> : null}
            </div>
            <span style={{fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>Or pick one from the set</span>
            <div role="radiogroup" aria-label="Icon" style={{display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(52px,1fr))", gap: "8px"}}>
              {list(v.sf?.icons).map((_o, _i1) => (
                <button key={_i1} role="radio" aria-checked={_o?.on} aria-label={"Icon: " + _o?.k.replace("_", " ")} onClick={_o?.pick} style={{height: "52px", borderRadius: "12px", border: _o?.on ? "2px solid " + v.sf.c : "1px solid #cfd8e3", background: _o?.on ? v.sf.tint : "#fff", color: _o?.on ? v.sf.c : "#3b4a5c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"}}>
                  {_o?.img ? <img src={_o.img} alt="" style={{height: "24px", maxWidth: "36px"}} /> : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={_o?.d} /></svg>}
                </button>
              ))}
            </div>
          </div>
          <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Colour</span>
            <div role="radiogroup" aria-label="Colour" style={{display: "flex", gap: "12px", flexWrap: "wrap"}}>
              {list(v.sf?.colors).map((_o, _i1) => (
                <button key={_i1} role="radio" aria-checked={_o?.on} aria-label={"Colour: " + _o?.label} onClick={_o?.pick} style={{width: "46px", height: "46px", padding: "3px", borderRadius: "50%", border: "2.5px solid " + (_o?.on ? _o?.c : "transparent"), background: "none", cursor: "pointer"}}>
                  <span style={{width: "100%", height: "100%", borderRadius: "50%", background: _o?.tint, display: "flex", alignItems: "center", justifyContent: "center"}}><span style={{width: "14px", height: "14px", borderRadius: "50%", background: _o?.c}} /></span>
                </button>
              ))}
            </div>
          </div>
          <div style={{display: "flex", alignItems: "center", gap: "12px", border: "1px solid #eef2f6", borderRadius: "14px", padding: "12px 14px"}}>
            <div style={{flex: "1"}}>
              <div style={{fontSize: "14px", fontWeight: "700", color: "#0A2550"}}>Show on Home</div>
              <div style={{fontSize: "12px", color: "#6b7a8c"}}>When off, citizens do not see it</div>
            </div>
            <button type="button" role="switch" aria-checked={!!v.sf?.active} aria-label={"Show on Home"} onClick={v.sf?.toggle} disabled={false} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:999px;border:0;padding:3px;cursor:pointer;display:flex;transition:background .15s;justify-content: ${v.sf?.active ? "flex-end" : "flex-start"};background: ${v.sf?.active ? "#1F8A3B" : "#cfd8e3"};opacity: ${false ? .5 : 1}`)}><span style={{width: "20px", height: "20px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.25)"}} /></button>
          </div>
        </div>
        <div style={{display: "flex", gap: "10px", padding: "16px 24px", borderTop: "1px solid #eef2f6"}}>
          <button onClick={v.closeSF} style={{flex: "1", height: "46px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", fontSize: "14px", cursor: "pointer"}}>Cancel</button>
          <button onClick={v.saveSF} disabled={v.sf?.saving} style={{flex: "1", height: "46px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", opacity: v.sf?.saving ? ".6" : "1"}}>{I(v.sf?.saveLabel)}</button>
        </div>
      </div>
    </>
  );
}
