// Important numbers and their contact types.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { TickBox, SelBar, Pager } from "../ui/parts";

export default function Numbers({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "flex", gap: "4px", borderBottom: "1px solid #cfd8e3"}}>
        {list(v.numTabs).map((_s, _i1) => (
          <React.Fragment key={_i1}>
            <button onClick={_s?.go} style={css(`height:44px;padding:0 16px;border:0;background:none;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;border-bottom:3px solid ${_s?.line ?? ""};color: ${_s?.color ?? ""};margin-bottom:-1px`)}>{I(_s?.label)}</button>
          </React.Fragment>
        ))}
      </div>
      {v.isTypesTab ? <>
        <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
          <span style={{fontSize: "13px", color: "#6b7a8c"}}>Types group the numbers citizens see. Switched-off types are hidden in the app; their numbers stay.</span>
          <button onClick={v.addType} style={{marginLeft: "auto", height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>+ Add type</button>
        </div>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
          <table style={{width: "100%", fontSize: "13px"}}>
            <thead>
              <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Type</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Section</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Key</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Numbers</th>
                <th style={{padding: "12px 16px", fontWeight: "600", textAlign: "right"}}>Active</th>
                <th style={{padding: "12px 16px"}}><span style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {list(v.typeRows).map((_t, _i1) => (
                <React.Fragment key={_i1}>
                  <tr style={{borderTop: "1px solid #f3f5f8"}}>
                    <td style={{padding: "10px 16px"}}>
                      <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_t?.en)}</span>
                      <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_t?.te)}</span>
                    </td>
                    <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_t?.section)}</td>
                    <td style={{padding: "10px 16px", color: "#6b7a8c", fontFamily: "monospace"}}>{I(_t?.key)}</td>
                    <td style={{padding: "10px 16px", color: "#3b4a5c", fontVariantNumeric: "tabular-nums"}}>{I(_t?.count)}</td>
                    <td style={{padding: "10px 16px", textAlign: "right"}}>
                      <button onClick={_t?.toggle} aria-label={"Switch " + (_t?.en ?? "")} style={css(`width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;background: ${_t?.swBg ?? ""}`)}>
                        <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${_t?.swLeft ?? ""};transition:left .15s`)} />
                      </button>
                    </td>
                    <td style={{padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap"}}>
                      <span style={{display: "inline-flex", gap: "6px"}}>
                        <button onClick={_t?.edit} aria-label={"Edit " + (_t?.en ?? "")} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Edit</button>
                        <button onClick={_t?.del} aria-label={"Delete " + (_t?.en ?? "")} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#b3261e", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Delete</button>
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </> : <>
        <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
          <div style={{display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", width: "360px", color: "#6b7a8c"}}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={val(v.numQ, "")} onChange={v.onNumQ} placeholder="Search name or phone…" style={{flex: "1", border: "0", outline: "none", fontSize: "13px", background: "transparent"}} />
          </div>
          <select value={val(v.numType, "")} onChange={v.onNumType} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
            {list(v.numTypeOpts).map((_o, _i1) => (
              <React.Fragment key={_i1}>
                <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
              </React.Fragment>
            ))}
          </select>
          <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.numCount)}</span>
          <button onClick={v.importNumbers} style={{marginLeft: "auto", height: "40px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Import CSV</button>
          <button onClick={v.addNumber} style={{height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>+ Add number</button>
        </div>
        <SelBar sel={v.numSel} removeLabel="Remove selected" />
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
          <table style={{width: "100%", fontSize: "13px"}}>
            <thead>
              <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                <th style={{padding: "12px 0 12px 16px", width: "34px"}}>{v.numSel?.show ? <TickBox on={v.numSel?.all} some={v.numSel?.some} onChange={v.numSel?.toggleAll} label="Select all numbers on this page" /> : null}</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Type</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Name</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Phone</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
                <th style={{padding: "12px 16px", fontWeight: "600"}}>Checked</th>
                <th style={{padding: "12px 16px"}} />
              </tr>
            </thead>
            <tbody>
              {list(v.numRows).map((_c, _i1) => (
                <React.Fragment key={_i1}>
                  <tr style={{borderTop: "1px solid #f3f5f8"}}>
                    <td style={{padding: "10px 0 10px 16px"}}>{_c?.canSel ? <TickBox on={_c?.sel} onChange={_c?.toggleSel} label={"Select " + (_c?.name || "")} /> : null}</td>
                    <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_c?.type)}</td>
                    <td style={{padding: "10px 16px"}}>
                      <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_c?.name)}</span>
                      {_c?.te ? <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_c?.te)}</span> : null}
                    </td>
                    <td style={{padding: "10px 16px", color: "#3b4a5c", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>
                      <span style={{display: "block"}}>{I(_c?.phone)}</span>
                      {_c?.email ? <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_c?.email)}</span> : null}
                    </td>
                    <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_c?.area)}</td>
                    <td style={{padding: "10px 16px"}}>
                      <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_c?.sbg ?? ""};color: ${_c?.scolor ?? ""}`)}>{I(_c?.status)}</span>
                    </td>
                    <td style={{padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap"}}>
                      <span style={{display: "inline-flex", gap: "6px"}}>
                        {_c?.canVerify ? <button onClick={_c?.verify} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#1d7a33", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Verify</button> : null}
                        {_c?.canEdit ? <button onClick={_c?.edit} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Edit</button> : null}
                        {_c?.canRemove ? <button onClick={_c?.remove} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#b3261e", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Remove</button> : null}
                      </span>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
              {v.numEmpty ? <tr><td colSpan={7} style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.numEmptyText)}</td></tr> : null}
            </tbody>
          </table>
          {v.numPager?.show ? <Pager p={v.numPager} /> : null}
        </div>
      </>}
    </>
  );
}
