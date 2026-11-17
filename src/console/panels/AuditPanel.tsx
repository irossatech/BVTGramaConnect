// One Audit log entry in full: the table cuts long text short, so a row opens this panel.
import { I, css } from "../../shared/dc";
import type { View } from "../Console";

const label = {width: "112px", flexShrink: "0", fontSize: "12px", fontWeight: "600", color: "#6b7a8c"} as const;
const value = {flex: "1", minWidth: "0", fontSize: "14px", fontWeight: "600", color: "#17212e", lineHeight: "1.45", overflowWrap: "anywhere"} as const;

export default function AuditPanel({ v }: { v: View }) {
  const a = v.ae;
  if (!a) return null;
  const rows: readonly [string, string][] = [["Done by", a.user], ["Their role", a.role], ["On what", a.target || "—"], ["Place", a.area || "—"], ["Date & time", a.at]];
  return (
    <>
      <div onClick={v.closeAE} aria-hidden="true" style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
      <div role="dialog" aria-modal="true" aria-label="Audit log entry" style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(440px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
        <div style={{display: "flex", alignItems: "flex-start", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
          <div style={{flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "6px"}}>
            <span style={css(`align-self:flex-start;padding:2px 10px;border-radius:6px;font-size:11px;font-weight:700;background: ${a.kbg};color: ${a.kcolor}`)}>{I(a.kind)}</span>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{I(a.actionCap)}</span>
            <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(a.ago)}</span>
          </div>
          <button onClick={v.closeAE} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>
            <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div style={{flex: "1", overflow: "auto", padding: "20px 24px"}}>
          <div style={{border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
            {rows.map(([k, val], i) => (
              <div key={k} style={{display: "flex", gap: "12px", padding: "12px 14px", borderTop: i ? "1px solid #f3f5f8" : "0"}}>
                <span style={label}>{k}</span>
                <span style={value}>{I(val)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
