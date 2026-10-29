// Geography: districts, mandals and villages, with the edit form beside the tree.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function Geography({ v }: { v: View }) {
  return (
    <div style={{display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, 360px)", gap: "20px", alignItems: "start"}}>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "16px 20px", minWidth: "0"}}>
          {" "}
          <div style={{display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #eef2f6"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>State → District → Mandal → Village</span>
            <span style={{display: "flex", gap: "8px"}}>
              <button onClick={v.importCsv} style={{height: "36px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Import CSV</button>
              <button onClick={v.addDistrict} style={{height: "36px", padding: "0 14px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>+ Add district</button>
            </span>
          </div>
          {" "}
          <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "12px 8px", fontWeight: "700", color: "#0A2550", fontSize: "15px"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F8A3B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
            {I(v.stateName)}{" "}
            <span style={{fontWeight: "500", color: "#6b7a8c"}}>{I(v.stateTe)}</span>
          </div>
          {" "}
          {v.noDistricts ? <div style={{padding: "28px 8px", textAlign: "center", color: "#6b7a8c", fontSize: "13px", lineHeight: "1.5"}}>No districts yet. Use <b>+ Add district</b> or <b>Import CSV</b> to add districts, mandals and villages.</div> : null}
          {list(v.tree).map((_n, _i1) => (
            <React.Fragment key={_i1}>
              {" "}
              <div style={css(`display:flex;align-items:center;gap:8px;min-height:44px;border-bottom:1px solid #f3f5f8;padding-right:8px;padding-left: ${_n?.indent ?? ""};background: ${_n?.rowBg ?? ""};opacity: ${_n?.opacity ?? ""}`)}>
                <button onClick={_n?.toggle} style={css(`width:28px;height:28px;border:0;background:none;cursor:pointer;color:#6b7a8c;display:flex;align-items:center;justify-content:center;visibility: ${_n?.toggleVis ?? ""}`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={_n?.chev} /></svg>
                </button>
                <button onClick={_n?.select} style={{flex: "1", minWidth: "0", overflow: "hidden", display: "flex", alignItems: "center", gap: "10px", background: "none", border: "0", padding: "6px 0", cursor: "pointer", textAlign: "left"}}>
                  <span style={css(`padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;background: ${_n?.tagBg ?? ""};color: ${_n?.tagColor ?? ""}`)}>{I(_n?.kind)}</span>
                  <span style={{fontWeight: "700", color: "#0A2550", fontSize: "14px", flexShrink: "1", minWidth: "48px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{I(_n?.name)}</span>
                  <span style={{color: "#6b7a8c", fontSize: "13px", flexShrink: "100", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{I(_n?.te)}</span>
                  {_n?.inactive ? <span style={{padding: "2px 8px", borderRadius: "999px", background: "#eef2f6", color: "#3b4a5c", fontSize: "11px", fontWeight: "700"}}>Inactive</span> : null}
                  <span style={{marginLeft: "auto", fontSize: "12px", color: "#6b7a8c", whiteSpace: "nowrap", flexShrink: "0"}}>{I(_n?.meta)}</span>
                </button>
                {_n?.canAdd ? <button onClick={_n?.add} style={{flexShrink: "0", whiteSpace: "nowrap", height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>{"+ "}{I(_n?.childKind)}</button> : null}
                <button onClick={_n?.select} style={{flexShrink: "0", height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Edit</button>
                <button onClick={_n?.deact} style={css(`flex-shrink:0;white-space:nowrap;height:30px;padding:0 10px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;font-weight:700;cursor:pointer;font-size:12px;color: ${_n?.deactColor ?? ""}`)}>{I(_n?.deactLabel)}</button>
              </div>
              {" "}
            </React.Fragment>
          ))}
          {" "}
        </div>
        <div style={{position: "sticky", top: "20px", minWidth: "0", maxHeight: "calc(100vh - 104px)", overflowY: "auto", overscrollBehavior: "contain", borderRadius: "14px"}}>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px", minWidth: "0"}}>
          <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>{I(v.geoFormTitle)}</div>
          {v.geoFormEmpty ? <div style={{color: "#6b7a8c", fontSize: "13px", lineHeight: "1.6"}}>Select a district, mandal or village on the left to edit it, or use the + buttons to add a new entry under its parent.</div> : null}
          {v.geoFormShow ? <>
            <div style={{fontSize: "12px", color: "#6b7a8c"}}>{"Parent: "}<b style={{color: "#3b4a5c"}}>{I(v.geoForm?.parent)}</b></div>
            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Name (English)<span style={{color: "#b3261e"}}> *</span></span>
              <input name="name" value={val(v.geoForm?.name, "")} onChange={v.onGeoField} placeholder={v.geoNamePh} style={css(`min-width:0;height:42px;padding:0 12px;border:1px solid ${v.geoErr?.name ? "#b3261e" : "#cfd8e3"};border-radius:10px;font-size:14px;outline-color:#0D3B7A`)} />
              {v.geoErr?.name ? <span role="alert" style={{fontSize: "12px", fontWeight: "700", color: "#b3261e"}}>{I(v.geoErr?.name)}</span> : null}
            </label>
            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>పేరు (తెలుగు)</span>
              <input name="te" value={val(v.geoForm?.te, "")} onChange={v.onGeoField} placeholder="తెలుగులో పేరు" style={{minWidth: "0", height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
            </label>
            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>LGD code (optional)</span>
              <input name="lgd" value={val(v.geoForm?.lgd, "")} onChange={v.onGeoField} maxLength={20} placeholder="Local Government Directory code" style={{minWidth: "0", height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
            </label>
            {v.geoForm?.isVillage ? <>
              <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>PIN code</span>
                <input name="pin" inputMode="numeric" maxLength={6} value={val(v.geoForm?.pin, "")} onChange={v.onGeoField} placeholder="522xxx" style={css(`min-width:0;height:42px;padding:0 12px;border:1px solid ${v.geoErr?.pin ? "#b3261e" : "#cfd8e3"};border-radius:10px;font-size:14px;outline-color:#0D3B7A`)} />
                <span style={css(`font-size:12px;line-height:1.5;font-weight:${v.geoErr?.pin ? "700" : "400"};color:${v.geoErr?.pin ? "#b3261e" : "#6b7a8c"}`)}>{v.geoErr?.pin ? v.geoErr.pin : "6-digit postal code (optional)"}</span>
              </label>
              <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Location{v.geoCoordsRequired ? <span style={{color: "#b3261e"}}> *</span> : null}</span>
                  <input name="where" value={val(v.geoForm?.where, "")} onChange={v.onGeoWhere} placeholder="Paste a Google Maps link or 16.2345, 80.4567" autoComplete="off" style={css(`min-width:0;height:42px;padding:0 12px;border:1px solid ${v.geoErr?.coords ? "#b3261e" : "#cfd8e3"};border-radius:10px;font-size:14px;outline-color:#0D3B7A`)} />
                  <span style={css(`font-size:12px;line-height:1.5;color:${v.geoWhereOk ? "#1d7a33" : "#6b7a8c"};font-weight:${v.geoWhereOk ? "700" : "400"}`)}>{v.geoWhereNote ? v.geoWhereNote : "Find the village on Google Maps, copy its link (or right-click it and copy the numbers), and paste here."}</span>
                </label>
                <div style={css(`display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;font-size:13px;background:${v.geoHasCoords ? "#e4f4df" : "#f3f5f8"};color:${v.geoHasCoords ? "#1d7a33" : "#6b7a8c"}`)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: "0"}}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                  <span style={{flex: "1", minWidth: "0", fontWeight: "700", fontVariantNumeric: "tabular-nums"}}>{v.geoHasCoords ? v.geoCoordsText : "No location yet"}</span>
                  {v.geoViewUrl ? <a href={v.geoViewUrl} target="_blank" rel="noopener noreferrer" style={{color: "#0D3B7A", fontWeight: "700", whiteSpace: "nowrap"}}>View on map ↗</a> : null}
                </div>
                {v.geoErr?.coords ? <span role="alert" style={{fontSize: "12px", fontWeight: "700", color: "#b3261e", lineHeight: "1.5"}}>{I(v.geoErr?.coords)}</span> : null}
                <span style={{display: "flex", flexWrap: "wrap", gap: "14px", fontSize: "13px", fontWeight: "700"}}>
                  {v.geoFindUrl ? <a href={v.geoFindUrl} target="_blank" rel="noopener noreferrer" style={{color: "#0D3B7A"}}>Find on Google Maps ↗</a> : <span style={{color: "#6b7a8c", fontWeight: "400"}}>Enter the name to search for it on Google Maps.</span>}
                  <button type="button" onClick={v.toggleGeoManual} aria-expanded={v.geoManual} style={{border: "0", background: "none", padding: "0", color: "#0D3B7A", fontWeight: "700", fontSize: "13px", cursor: "pointer"}}>{v.geoManual ? "Hide number boxes" : "Enter numbers manually"}</button>
                </span>
                {v.geoManual ? <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
                    <label style={{display: "flex", flexDirection: "column", gap: "6px", minWidth: "0"}}>
                      <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Latitude</span>
                      <input name="lat" inputMode="decimal" maxLength={11} value={val(v.geoForm?.lat, "")} onChange={v.onGeoField} placeholder="16.2345" style={css(`min-width:0;height:42px;padding:0 12px;border:1px solid ${v.geoErr?.coords ? "#b3261e" : "#cfd8e3"};border-radius:10px;font-size:14px;outline-color:#0D3B7A`)} />
                    </label>
                    <label style={{display: "flex", flexDirection: "column", gap: "6px", minWidth: "0"}}>
                      <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Longitude</span>
                      <input name="lng" inputMode="decimal" maxLength={11} value={val(v.geoForm?.lng, "")} onChange={v.onGeoField} placeholder="80.4567" style={css(`min-width:0;height:42px;padding:0 12px;border:1px solid ${v.geoErr?.coords ? "#b3261e" : "#cfd8e3"};border-radius:10px;font-size:14px;outline-color:#0D3B7A`)} />
                    </label>
                  </div> : null}
              </div>
            </> : null}
            {v.geoActive ? <div style={css(`display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:${v.geoActive.bg}`)}>
                <span style={{flex: "1", minWidth: "0"}}>
                  <span style={{display: "block", fontWeight: "700", color: "#0A2550", fontSize: "14px"}}>Visible to citizens</span>
                  <span style={{display: "block", fontSize: "12px", color: "#3b4a5c", lineHeight: "1.4", marginTop: "2px"}}>{I(v.geoActive.sub)}</span>
                </span>
                <button onClick={v.toggleGeoActive} role="switch" aria-checked={v.geoActive.on} aria-label="Visible to citizens" style={css(`flex-shrink:0;width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;background: ${v.geoActive.swBg}`)}>
                  <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${v.geoActive.swLeft};transition:left .15s`)} />
                </button>
              </div> : null}
            <div style={{display: "flex", gap: "10px", marginTop: "4px"}}>
              <button onClick={v.saveGeo} disabled={v.cannotSaveGeo} style={css(`flex:1;height:44px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${v.saveGeoOpacity ?? ""}`)}>{I(v.geoSaveLabel)}</button>
              <button onClick={v.cancelGeo} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
            </div>
          </> : null}
        </div>
        </div>
      </div>
  );
}
