// Citizens & wallet (BVTGC-139/140; BackEnd docs/features/citizen-wallet/mockups/console.html): three tabs. Accounts
// with Find by mobile or email for a caller (each row opens the account panel); Referrals by status, with Confirm and
// Reject; every Wallet entry with the export's filters. Each list has its CSV export. The filters, table and
// pills copy the Users and Contact messages screens. No full email or mobile number: the masked email and the
// last 4 digits only.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { EmptyState, Pager, SearchSelect, SegmentTabs, StatusPills } from "../ui/parts";

const WALLET = "M3 7a2 2 0 0 1 2-2h13v4M3 7v10a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2zM16 14h.01";
const th = {padding: "12px 16px", fontWeight: "600"} as const;
const td = {padding: "13px 16px"} as const;
const select = {height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "150px"} as const;
const pillBtn = {height: "38px", padding: "0 16px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap"} as const;

const REFER = "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6";
const small = {height: "30px", padding: "0 12px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "12px", whiteSpace: "nowrap"} as const;

export default function CitizensWallet({ v }: { v: View }) {
  return (
    <>
      {list(v.waTabs).length > 1 ? <SegmentTabs items={v.waTabs} label="Citizens & wallet" /> : null}
      {v.waIsAccounts ? <Accounts v={v} /> : null}
      {v.waIsReferrals ? <Referrals v={v} /> : null}
      {v.waIsEntries ? <Entries v={v} /> : null}
    </>
  );
}

function Referrals({ v }: { v: View }) {
  return (
    <>
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <StatusPills items={v.waRefTabs} label="Referral status" />
        <label style={{position: "relative", flex: "1 0 200px", maxWidth: "280px", minWidth: "200px", marginLeft: "auto"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#647182" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" aria-label="Search referrals" value={val(v.waRefQ, "")} onChange={v.onWaRefQ} placeholder="Name, last 4 digits or code" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13.5px", background: "#fff"}} />
        </label>
        <button onClick={v.exportRefs} disabled={v.exportingRefs} style={{...pillBtn, opacity: v.exportingRefs ? ".6" : "1"}}>{v.exportingRefs ? "Exporting…" : "Export CSV"}</button>
      </div>
      {v.waRefEmpty ? <EmptyState title={v.waRefEmptyText} hint={v.waRefEmptyHint} icon={REFER} /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", fontSize: "13px", minWidth: "820px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#647182", textAlign: "left", fontSize: "12px"}}>
              <th style={th}>Invited by</th>
              <th style={th}>New citizen</th>
              <th style={{...th, width: "110px"}}>Joined</th>
              <th style={{...th, width: "120px"}}>Decided after</th>
              <th style={th}>Status</th>
              <th style={{...th, width: "170px"}}><span className="sa-sr" style={{position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)"}}>Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {list(v.waRefRows).map((_r, _i1) => (
              <React.Fragment key={_r?.rowKey ?? _i1}>
                <tr style={{borderTop: "1px solid #f3f5f8", verticalAlign: "top"}}>
                  <td style={td}>
                    <div style={{fontWeight: "700", color: "#0A2550"}}>{I(_r?.referrer)}</div>
                    <div style={{fontSize: "12px", color: "#647182", marginTop: "2px"}}>{I(_r?.referrerLast4)}{" · "}{I(_r?.referrerCode)}</div>
                  </td>
                  <td style={td}>
                    <div style={{fontWeight: "700", color: "#0A2550"}}>{I(_r?.referee)}</div>
                    <div style={{fontSize: "12px", color: "#647182", marginTop: "2px"}}>{I(_r?.refereeLast4)}</div>
                  </td>
                  <td style={{...td, color: "#3b4a5c", whiteSpace: "nowrap"}}>{I(_r?.joined)}</td>
                  <td style={{...td, color: "#3b4a5c", whiteSpace: "nowrap"}}>{I(_r?.decideAfter)}</td>
                  <td style={td}>
                    <span style={css(`padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700;background: ${_r?.sbg ?? ""};color: ${_r?.scolor ?? ""}`)}>{I(_r?.statusLabel)}</span>
                    {_r?.decidedBy ? <div style={{fontSize: "12px", color: "#647182", marginTop: "4px"}}>{I(_r?.decidedBy)}</div> : null}
                    {_r?.comment ? <div style={{fontSize: "12px", color: "#3b4a5c", marginTop: "2px", overflowWrap: "anywhere"}}>{"“"}{I(_r?.comment)}{"”"}</div> : null}
                  </td>
                  <td style={{...td, textAlign: "right"}}>
                    <span style={{display: "inline-flex", gap: "6px"}}>
                      {_r?.canConfirm ? <button onClick={_r?.confirm} style={{...small, border: "0", background: "#1F8A3B", color: "#fff"}}>Confirm</button> : null}
                      {_r?.canReject ? <button onClick={_r?.reject} style={{...small, border: "0", background: "#b3261e", color: "#fff"}}>Reject</button> : null}
                    </span>
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>}
      {v.waRefPager?.show ? <Pager p={v.waRefPager} /> : null}
    </>
  );
}

function Entries({ v }: { v: View }) {
  return (
    <>
      <div className="sa-bar" style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
        <select name="kind" aria-label="Kind" value={val(v.waEntKind, "")} onChange={v.onWaEntKind} style={select}>
          {list(v.waKindOpts).map((_o, _i1) => (
            <React.Fragment key={_i1}>
              <option value={_o.id}>{_o.label}</option>
            </React.Fragment>
          ))}
        </select>
        <select name="status" aria-label="Status" value={val(v.waEntStatus, "")} onChange={v.onWaEntStatus} style={select}>
          {list(v.waEntStatusOpts).map((_o, _i1) => (
            <React.Fragment key={_i1}>
              <option value={_o.id}>{_o.label}</option>
            </React.Fragment>
          ))}
        </select>
        <label style={{display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#647182"}}>From
          <input type="date" value={val(v.waEntFrom, "")} onChange={v.onWaEntFrom} style={{...select, minWidth: "0"}} />
        </label>
        <label style={{display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: "#647182"}}>To
          <input type="date" value={val(v.waEntTo, "")} onChange={v.onWaEntTo} style={{...select, minWidth: "0"}} />
        </label>
        <span style={{flex: "1"}} />
        <button onClick={v.exportEntries} disabled={v.exportingEntries} style={{...pillBtn, opacity: v.exportingEntries ? ".6" : "1"}}>{v.exportingEntries ? "Exporting…" : "Export CSV"}</button>
      </div>
      {v.waEntEmpty ? <EmptyState title={v.waEntEmptyText} hint="" icon={WALLET} /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", fontSize: "13px", minWidth: "820px"}}>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#647182", textAlign: "left", fontSize: "12px"}}>
              <th style={{...th, width: "130px"}}>When</th>
              <th style={th}>Citizen</th>
              <th style={{...th, width: "140px"}}>Kind</th>
              <th style={{...th, width: "80px", textAlign: "right"}}>Points</th>
              <th style={{...th, width: "110px"}}>Status</th>
              <th style={th}>Reason</th>
            </tr>
          </thead>
          <tbody>
            {list(v.waEntRows).map((_e, _i1) => (
              <React.Fragment key={_e?.rowKey ?? _i1}>
                <tr style={{borderTop: "1px solid #f3f5f8", verticalAlign: "top"}}>
                  <td style={{...td, color: "#3b4a5c", whiteSpace: "nowrap"}}>{I(_e?.when)}</td>
                  <td style={td}><span style={{fontWeight: "700", color: "#0A2550"}}>{I(_e?.citizen)}</span>{_e?.last4 ? <span style={{color: "#647182", fontSize: "12px"}}>{" "}{I(_e?.last4)}</span> : null}</td>
                  <td style={{...td, color: "#3b4a5c"}}>{I(_e?.kind)}</td>
                  <td style={css(`padding:13px 16px;text-align:right;font-family:'Rubik',sans-serif;font-weight:700;color: ${_e?.pointsColor ?? ""}`)}>{I(_e?.points)}</td>
                  <td style={td}><span style={css(`padding:2px 9px;border-radius:999px;font-size:11.5px;font-weight:700;background: ${_e?.sbg ?? ""};color: ${_e?.scolor ?? ""}`)}>{I(_e?.statusLabel)}</span></td>
                  <td style={{...td, color: "#3b4a5c", overflowWrap: "anywhere"}}>{I(_e?.reason)}{_e?.by ? <span style={{color: "#647182", fontSize: "12px"}}>{" · "}{I(_e?.by)}</span> : null}</td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>}
      {v.waEntPager?.show ? <Pager p={v.waEntPager} /> : null}
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
