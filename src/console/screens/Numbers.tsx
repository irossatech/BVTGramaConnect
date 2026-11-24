// Important numbers: the For villages / Government helplines / Types switch, then the numbers or the types.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { EmptyState, Pager, SegmentTabs, SelBar, TickBox, SearchSelect } from "../ui/parts";

const PHONE = "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z";
const th = {padding: "12px 16px", fontWeight: "600"} as const;
const td = {padding: "12px 16px"} as const;
const select = {height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "160px"} as const;
const pill = (color: string) => ({height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color, fontWeight: "700", cursor: "pointer", fontSize: "12px"}) as const;
const plus = <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "6px"}}><path d="M12 5v14M5 12h14" /></svg>;
const primary = {height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap"} as const;

export default function Numbers({ v }: { v: View }) {
  return (
    <>
      <SegmentTabs items={v.numTabs} label="Important numbers" />
      {v.isTypesTab ? <>
        <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
          <span style={{flex: "1", minWidth: "240px", fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>Types group the numbers in the app. A hidden type's numbers stay saved.</span>
          <button onClick={v.addType} style={primary}>{plus}Add type</button>
        </div>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
          <table style={{width: "100%", fontSize: "13px", minWidth: "620px"}}>
            <thead>
              <tr style={{background: "#f7f9fb", color: "#647182", textAlign: "left", fontSize: "12px"}}>
                <th style={th}>Type</th>
                <th style={th}>Section</th>
                <th style={{...th, textAlign: "right"}}>Numbers</th>
                <th style={th}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Show and actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list(v.typeRows).map((_t, _i1) => (
                <React.Fragment key={_t?.key ?? _i1}>
                  <tr style={{borderTop: "1px solid #f3f5f8"}}>
                    <td style={td}>
                      <span style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
                        <span style={{fontWeight: "700", color: _t?.on ? "#0A2550" : "#647182"}}>{I(_t?.en)}</span>
                        {_t?.on ? null : <span style={{padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#eef2f6", color: "#3b4a5c"}}>Hidden</span>}
                      </span>
                      {_t?.te && _t.te !== _t.en ? <span lang="te" style={{display: "block", fontSize: "12px", color: "#647182"}}>{I(_t?.te)}</span> : null}
                    </td>
                    <td style={{...td, color: "#3b4a5c"}}>{I(_t?.section)}</td>
                    <td style={{...td, color: "#3b4a5c", textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{I(_t?.count)}</td>
                    <td style={{...td, textAlign: "right", whiteSpace: "nowrap"}}>
                      <span style={{display: "inline-flex", alignItems: "center", gap: "10px"}}>
                        <label style={{display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "700", color: "#3b4a5c", cursor: "pointer"}}>
                          Show
                          <button type="button" role="switch" aria-checked={!!_t?.on} onClick={_t?.toggle} aria-label={"Show " + (_t?.en ?? "") + " in the app"} style={css(`width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;background: ${_t?.swBg ?? ""}`)}>
                            <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${_t?.swLeft ?? ""};transition:left .15s`)} />
                          </button>
                        </label>
                        <button onClick={_t?.edit} aria-label={"Edit " + (_t?.en ?? "")} style={pill("#0D3B7A")}>Edit</button>
                        <button onClick={_t?.del} aria-label={"Delete " + (_t?.en ?? "")} style={pill("#b3261e")}>Delete</button>
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </> : <>
        <div className="sa-bar" style={{display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap"}}>
          <label style={{position: "relative", flex: "0 1 280px", minWidth: "200px"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#647182" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input type="search" aria-label="Search important numbers" value={val(v.numQ, "")} onChange={v.onNumQ} placeholder="Search name or phone" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13.5px", background: "#fff"}} />
          </label>
          {v.numAreaFilter ? <SearchSelect value={val(v.numDistrict, "")} onChange={v.onNumDistrict} aria-label="District" style={select}>
            {list(v.numDistrictOpts).map((_o, _i1) => <option key={_i1} value={_o.id}>{_o.label}</option>)}
          </SearchSelect> : null}
          <select aria-label="Type" value={val(v.numType, "")} onChange={v.onNumType} style={select}>
            {list(v.numTypeOpts).map((_o, _i1) => <option key={_i1} value={val(_o?.id, "")}>{_o?.label}</option>)}
          </select>
          <span style={{flex: "1"}} />
          <button onClick={v.importNumbers} style={{height: "40px", padding: "0 16px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap"}}>Import CSV</button>
          <button onClick={v.addNumber} style={primary}>{plus}Add number</button>
        </div>
        <SelBar sel={v.numSel} removeLabel="Remove selected" />
        {v.numEmpty ? <EmptyState title={v.numEmptyText} hint={v.numEmptyHint} icon={PHONE} /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
          <table style={{width: "100%", fontSize: "13px", minWidth: "820px"}}>
            <thead>
              <tr style={{background: "#f7f9fb", color: "#647182", textAlign: "left", fontSize: "12px"}}>
                <th style={{padding: "12px 0 12px 16px", width: "34px"}}>{v.numSel?.show ? <TickBox on={v.numSel?.all} some={v.numSel?.some} onChange={v.numSel?.toggleAll} label="Select all numbers on this page" /> : null}</th>
                <th style={th}>Name</th>
                <th style={th}>Phone</th>
                <th style={th}>Type</th>
                <th style={th}>Area</th>
                <th style={th}>Checked</th>
                <th style={th}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list(v.numRows).map((_c, _i1) => (
                <React.Fragment key={_c?.rowKey ?? _i1}>
                  <tr style={{borderTop: "1px solid #f3f5f8"}}>
                    <td style={{padding: "12px 0 12px 16px"}}>{_c?.canSel ? <TickBox on={_c?.sel} onChange={_c?.toggleSel} label={"Select " + (_c?.name || "")} /> : null}</td>
                    <td style={td}>
                      <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_c?.name)}</span>
                      {_c?.te ? <span lang="te" style={{display: "block", fontSize: "12px", color: "#647182"}}>{I(_c?.te)}</span> : null}
                    </td>
                    <td style={{...td, color: "#17212e", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>
                      <span style={{display: "block", fontWeight: "600"}}>{I(_c?.phone)}</span>
                      {_c?.email ? <span style={{display: "block", fontSize: "12px", color: "#647182"}}>{I(_c?.email)}</span> : null}
                    </td>
                    <td style={{...td, color: "#3b4a5c"}}>{I(_c?.type)}</td>
                    <td style={{...td, color: "#3b4a5c"}}>{I(_c?.area)}</td>
                    <td style={td}>
                      <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_c?.sbg ?? ""};color: ${_c?.scolor ?? ""}`)}>{I(_c?.status)}</span>
                    </td>
                    <td style={{...td, textAlign: "right", whiteSpace: "nowrap"}}>
                      <span style={{display: "inline-flex", gap: "6px"}}>
                        {_c?.canVerify ? <button onClick={_c?.verify} style={pill("#1d7a33")}>Verify</button> : null}
                        {_c?.canEdit ? <button onClick={_c?.edit} style={pill("#0D3B7A")}>Edit</button> : null}
                        {_c?.canRemove ? <button onClick={_c?.remove} style={pill("#b3261e")}>Remove</button> : null}
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>}
        {v.numPager?.show ? <Pager p={v.numPager} /> : null}
      </>}
    </>
  );
}
