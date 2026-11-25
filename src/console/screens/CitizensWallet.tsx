// Citizens & wallet (BVTGC-139/140; BackEnd docs/features/citizen-wallet/mockups/console.html): citizens' wallet
// accounts with Find by mobile or email for a caller; each row opens the account panel. The filters, table and
// pills copy the Users and Contact messages screens. No full email or mobile number: the masked email and the
// last 4 digits only.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { EmptyState, Pager, SearchSelect } from "../ui/parts";

const WALLET = "M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14h.01";
const th = {padding: "12px 16px", fontWeight: "600"} as const;
const td = {padding: "13px 16px"} as const;
const select = {height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "150px"} as const;
const pillBtn = {height: "38px", padding: "0 16px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap"} as const;

export default function CitizensWallet({ v }: { v: View }) {
  return (
    <>
      {v.waIsAccounts ? <Accounts v={v} /> : null}
    </>
  );
}

function Accounts({ v }: { v: View }) {
  return (
    <>
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <label style={{position: "relative", flex: "1 0 220px", maxWidth: "300px", minWidth: "200px"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#647182" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" aria-label="Search wallet accounts" value={val(v.waQ, "")} onChange={v.onWaQ} placeholder="Name, last 4 digits or code" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13.5px", background: "#fff"}} />
        </label>
        {v.waShowVillage ? <SearchSelect name="village" aria-label="Village" value={val(v.waVillage, "")} onChange={v.onWaVillage} style={select}>
            {list(v.waVillageOpts).map((_o, _i1) => (
              <React.Fragment key={_i1}>
                <option value={_o.id}>{_o.label}</option>
              </React.Fragment>
            ))}
          </SearchSelect> : null}
        <select name="status" aria-label="Status" value={val(v.waStatus, "")} onChange={v.onWaStatus} style={select}>
          {list(v.waStatusOpts).map((_o, _i1) => (
            <React.Fragment key={_i1}>
              <option value={_o.id}>{_o.label}</option>
            </React.Fragment>
          ))}
        </select>
        {v.waPilotNote ? <span style={{fontSize: "12.5px", color: "#647182"}}>{I(v.waPilotNote)}</span> : null}
        <span style={{flex: "1"}} />
        <button onClick={v.openFind} style={pillBtn}>Find by mobile or email</button>
      </div>
      {v.waEmpty ? <EmptyState title={v.waEmptyText} hint={v.waEmptyHint} icon={WALLET} /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", fontSize: "13px", minWidth: "760px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#647182", textAlign: "left", fontSize: "12px"}}>
              <th style={th}>Name</th>
              <th style={th}>Village</th>
              <th style={{...th, width: "110px"}}>Mobile</th>
              <th style={th}>Email</th>
              <th style={{...th, width: "120px", textAlign: "right"}}>Points</th>
              <th style={{...th, width: "100px"}}>Status</th>
              <th style={{...th, width: "90px"}}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Open</span></th>
            </tr>
          </thead>
          <tbody>
            {list(v.waRows).map((_r, _i1) => (
              <React.Fragment key={_r?.rowKey ?? _i1}>
                <tr style={{borderTop: "1px solid #f3f5f8", background: _r?.on ? "#f3f8fd" : "transparent"}}>
                  <td style={{...td, fontWeight: "700", color: "#0A2550"}}>{I(_r?.name)}</td>
                  <td style={{...td, color: "#3b4a5c"}}>{I(_r?.village)}</td>
                  <td style={{...td, color: "#3b4a5c", fontVariantNumeric: "tabular-nums"}}>
                    {_r?.noNumber ? <span style={{padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#fff0dc", color: "#b35a0e"}}>No number</span> : I(_r?.mobile)}
                  </td>
                  <td style={{...td, color: "#3b4a5c"}}>{I(_r?.email)}</td>
                  <td style={{...td, textAlign: "right", fontFamily: "'Rubik',sans-serif", fontWeight: "700", color: "#0A2550"}}>
                    {I(_r?.points)}
                    {_r?.held ? <span style={{marginLeft: "6px", padding: "1px 7px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#fff0dc", color: "#b35a0e"}} title="Points on hold">{I(_r?.held)}</span> : null}
                  </td>
                  <td style={td}><span style={css(`padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700;background: ${_r?.sbg ?? ""};color: ${_r?.scolor ?? ""}`)}>{I(_r?.statusLabel)}</span></td>
                  <td style={{...td, textAlign: "right"}}>
                    <button onClick={_r?.open} aria-label={"Open the account of " + (_r?.name || "")} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"}}>Open</button>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>}
      {v.waPager?.show ? <Pager p={v.waPager} /> : null}
    </>
  );
}
