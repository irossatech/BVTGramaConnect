// Pieces more than one screen uses. Markup exactly as in the original template.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { SelView, View } from "../Console";

// Select several rows and remove them at once: a tick box (with the "some" dash) and the bar shown while rows are ticked.
export const TickBox = ({on, some, onChange, label}: {on?: boolean; some?: boolean; onChange?: () => void; label: string}) => (
  <input type="checkbox" checked={!!on} onChange={onChange} aria-label={label} ref={el => { if (el) el.indeterminate = !!some; }} style={{width: "18px", height: "18px", accentColor: "#0D3B7A", cursor: "pointer", margin: "0", flexShrink: "0"}} />
);
export const SelBar = ({sel, removeLabel}: {sel?: SelView; removeLabel: string}) => sel?.count ? (
  <div role="region" aria-label="Selected rows" style={{display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", padding: "10px 14px", borderRadius: "12px", background: "#e3f0fb", fontSize: "13px", color: "#0A2550"}}>
    <strong style={{fontWeight: "700"}}>{sel.label}</strong>
    {sel.busy ? <span aria-live="polite" style={{color: "#3b4a5c"}}>{sel.busy}</span> : <>
      <button onClick={sel.remove} style={{height: "32px", padding: "0 14px", border: "0", borderRadius: "999px", background: "#b3261e", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "12.5px"}}>{removeLabel}</button>
      <button onClick={sel.clear} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12.5px"}}>Clear</button>
    </>}
  </div>
) : null;

/** Prev / Page n of m / Next under a paged table. */
export function Pager({ p }: { p: View["usersPager"] }) {
  return (
    <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6b7a8c"}}>
        <button onClick={p?.prev} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${p?.prevOpacity ?? ""}`)}>‹ Prev</button>
        <span>{"Page "}{I(p?.page)}{" of "}{I(p?.pages)}</span>
        <button onClick={p?.next} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${p?.nextOpacity ?? ""}`)}>Next ›</button>
      </div>
  );
}

/** "All districts" and one option per district, for a district filter. */
export function DistrictOptions({ v }: { v: View }) {
  return (
    <>
      <option value="">All districts</option>
      {list(v.districtOpts).map((_o, _i1) => (
        <React.Fragment key={_i1}>
          <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
        </React.Fragment>
      ))}
    </>
  );
}
