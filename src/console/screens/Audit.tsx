// Audit log: search and type, then the log: one line per action (who, action, done to, when); a row opens it in full.
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";
import { EmptyState, Pager } from "../ui/parts";

const cellHead = {padding: "12px 16px", fontWeight: "600"} as const;
const cell = {padding: "8px 16px"} as const;
const oneLine = {whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"} as const;

export default function Audit({ v }: { v: View }) {
  return (
    <>
      {/* One toolbar row: search, the type, the period (From – To in one box, never split apart), then the number of
          entries and Export CSV at the right. Clearing both dates goes back to the default period. */}
      <div className="sa-bar" style={{display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap"}}>
        <label style={{position: "relative", flex: "0 1 280px", minWidth: "200px"}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7a8c" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)"}}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          <input type="search" aria-label="Search the audit log" value={val(v.auditQ, "")} onChange={v.onAuditQ} placeholder="Search a name or an action" style={{width: "100%", boxSizing: "border-box", height: "38px", padding: "0 12px 0 34px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13.5px", background: "#fff"}} />
        </label>
        <select aria-label="Type of activity" value={val(v.auditType, "")} onChange={v.onAuditType} style={{height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "160px"}}>
          {list(v.auditTypes).map((_t, _i1) => <option key={_i1} value={_t.id}>{_t.label}</option>)}
        </select>
        {/* The period (contract section 8): any past days, however old; none chosen = the last 180 days. */}
        <div role="group" aria-label="Period" style={{display: "flex", alignItems: "center", gap: "6px", height: "38px", padding: "0 6px 0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", color: "#6b7a8c", whiteSpace: "nowrap"}}>
          <label style={{display: "flex", alignItems: "center", gap: "6px"}}>
            From
            <input type="date" aria-label="From date" value={val(v.auditFrom, "")} max={v.auditTo || v.auditToday} onChange={v.onAuditFrom} style={{height: "30px", padding: "0 4px", border: "0", borderRadius: "6px", background: "transparent", fontSize: "13px", color: "#17212e"}} />
          </label>
          <span aria-hidden="true" style={{color: "#cfd8e3"}}>–</span>
          <label style={{display: "flex", alignItems: "center", gap: "6px"}}>
            To
            <input type="date" aria-label="To date" value={val(v.auditTo, "")} min={v.auditFrom || undefined} max={v.auditToday} onChange={v.onAuditTo} style={{height: "30px", padding: "0 4px", border: "0", borderRadius: "6px", background: "transparent", fontSize: "13px", color: "#17212e"}} />
          </label>
        </div>
        <span style={{marginLeft: "auto", fontSize: "13px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(v.auditInfo)}</span>
        {v.canExportAudit ? <button onClick={v.exportCsv} disabled={!!v.exporting} aria-busy={v.exporting === "audit"} style={{height: "38px", padding: "0 16px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px", whiteSpace: "nowrap", opacity: v.exporting ? ".6" : "1"}}>{v.exporting === "audit" ? "Exporting…" : "Export CSV"}</button> : null}
      </div>
      {/* A log table as web apps show one: fixed columns, newest first, a row opens the entry in full.
          Done by · What they did · On what (the post, user, service… it was about) · Date & time.
          The two text columns wrap onto more lines, never cut; Where is in the details panel. */}
      {v.auditEmpty ? <EmptyState title={v.auditEmptyText} hint={v.auditEmptyHint} icon="M9 12h6M9 16h6M9 8h6M5 3h14v18H5z" /> : <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "auto"}}>
        <table style={{width: "100%", minWidth: "820px", fontSize: "13px", tableLayout: "fixed", borderCollapse: "collapse"}}>
          <colgroup>
            <col style={{width: "24%"}} /><col style={{width: "36%"}} /><col style={{width: "28%"}} /><col style={{width: "12%"}} />
          </colgroup>
          <thead>
            <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
              <th style={cellHead}>Done by</th>
              <th style={cellHead}>What they did</th>
              <th style={cellHead}>{I(v.auditOnWhat)}</th>
              <th style={{...cellHead, textAlign: "right"}}>Date & time</th>
            </tr>
          </thead>
          <tbody>
            {list(v.auditRows).map((_a, _i1) => (
              <tr key={_i1} onClick={_a.open} tabIndex={0} aria-label={_a.user + " " + _a.action + (_a.target ? " " + _a.target : "") + ", " + _a.ago} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); _a.open(); } }} className="sa-audit-row" style={{borderTop: "1px solid #f3f5f8", cursor: "pointer", height: "52px"}}>
                <td style={cell}>
                  <span style={{display: "flex", alignItems: "center", gap: "10px", minWidth: "0"}}>
                    <span aria-hidden="true" style={css(`width:28px;height:28px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:12px;background: ${_a?.bg ?? ""}`)}>{I(_a?.initial)}</span>
                    <span style={{minWidth: "0", lineHeight: "1.25"}}>
                      <span style={{...oneLine, display: "block", fontWeight: "700", color: "#0A2550"}} title={_a.user}>{I(_a?.user)}</span>
                      <span style={{...oneLine, display: "block", fontSize: "11.5px", color: "#6b7a8c"}}>{I(_a?.role)}</span>
                    </span>
                  </span>
                </td>
                <td style={cell}>
                  <span style={{display: "flex", alignItems: "flex-start", gap: "8px", minWidth: "0"}}>
                    <span style={css(`flex-shrink:0;width:64px;margin-top:1px;text-align:center;padding:2px 0;border-radius:6px;font-size:11px;font-weight:700;background: ${_a?.kbg ?? ""};color: ${_a?.kcolor ?? ""}`)}>{I(_a?.kind)}</span>
                    <span style={{color: "#17212e", whiteSpace: "normal", lineHeight: "1.4"}}>{I(_a?.actionCap)}</span>
                  </span>
                </td>
                <td style={{...cell, color: "#17212e", fontWeight: "600", whiteSpace: "normal", lineHeight: "1.4", overflowWrap: "anywhere"}}>{_a?.target ? I(_a?.target) : <span style={{color: "#a3adb9", fontWeight: "400"}}>—</span>}</td>
                <td style={{...cell, ...oneLine, color: "#6b7a8c", textAlign: "right", fontVariantNumeric: "tabular-nums"}} title={_a.at}>{I(_a?.ago)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
      {v.auditPager?.show ? <Pager p={v.auditPager} /> : null}
    </>
  );
}
