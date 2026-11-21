// Pieces more than one screen uses. Markup exactly as in the original template.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { SelView, View } from "../Console";
import type { BulkAction } from "../model";

// Select several rows and remove them at once: a tick box (with the "some" dash) and the bar shown while rows are ticked.
export const TickBox = ({on, some, onChange, label}: {on?: boolean; some?: boolean; onChange?: () => void; label: string}) => (
  <input type="checkbox" checked={!!on} onChange={onChange} aria-label={label} ref={el => { if (el) el.indeterminate = !!some; }} style={{width: "18px", height: "18px", accentColor: "#0D3B7A", cursor: "pointer", margin: "0", flexShrink: "0"}} />
);
/** Posts and Users with ticked rows (owner, 2026-11-20, laid out as the app's): select all and how many are
 *  ticked with Clear; then one button per action, each with its own count; then why some ticked rows have none. */
export const BulkBar = ({label, region, all, some, toggleAll, allLabel, busy, actions, note, clear}: {label: string; region: string; all: boolean; some: boolean; toggleAll: () => void; allLabel: string; busy: string; actions: BulkAction[]; note: string; clear: () => void}) => (
  <div role="region" aria-label={region} style={{display: "flex", flexDirection: "column", gap: "12px", padding: "14px 16px", borderRadius: "12px", background: "#e3f0fb", border: "1px solid #cfe0f3", fontSize: "13px", color: "#0A2550"}}>
    <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
      <label style={{display: "flex", alignItems: "center", gap: "10px", cursor: "pointer"}}>
        <TickBox on={all} some={some} onChange={toggleAll} label={allLabel} />
        <strong style={{fontWeight: "700", fontSize: "14px"}}>{label}</strong>
      </label>
      {busy ? null : <button onClick={clear} style={{marginLeft: "auto", height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12.5px"}}>Clear selection</button>}
    </div>
    {busy ? <span aria-live="polite" style={{color: "#3b4a5c", fontWeight: "600"}}>{busy}</span> : actions.length ? <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
      {actions.map((a) => (
        <button key={a.label} onClick={a.onClick} style={{display: "inline-flex", alignItems: "center", gap: "8px", height: "36px", padding: "0 8px 0 16px", border: "1.5px solid " + a.border, borderRadius: "999px", background: a.bg, color: a.fg, fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>
          {a.label}
          <span style={{minWidth: "22px", height: "22px", padding: "0 6px", boxSizing: "border-box", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", background: a.bg === "#fff" ? "#eef2f6" : "rgba(255,255,255,.22)"}}>{a.count}</span>
        </button>
      ))}
    </div> : null}
    {note && !busy ? <div style={{display: "flex", gap: "8px", alignItems: "flex-start", padding: "8px 12px", borderRadius: "10px", background: "#fff", border: "1px solid #f3d9b5", color: "#7a4a0e", lineHeight: "1.45"}}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{flexShrink: "0", marginTop: "1px"}}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.5" /></svg>
      <span>{note}</span>
    </div> : null}
  </div>
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

/** Status filter pills (Posts, Service requests, Sponsored banners, Contact messages); a zero count is dimmed,
 *  and a pill without a count (the server sends none) shows just its label.
 *  Always one row (2026-11-20): wrapped pills left the search box centred between two rows. The group takes its
 *  natural width and grows into free space; on a narrow screen it scrolls sideways, and the toolbar puts what
 *  sits beside it (search, New post) on the next row only when there is really no room. */
export function StatusPills({ items, label }: { items?: readonly {label: string; count?: number; on: boolean; go: () => void}[]; label: string }) {
  return (
    <div role="group" aria-label={label} style={{display: "flex", gap: "8px", flexWrap: "nowrap", flex: "1 0 auto", maxWidth: "100%", minWidth: "0", overflowX: "auto", scrollbarWidth: "thin"}}>
      {list(items).map((t, i) => (
        <button key={i} onClick={t.go} aria-pressed={t.on} style={css(`flex-shrink:0;height:34px;padding:0 14px;border-radius:999px;cursor:pointer;font-size:13px;font-weight:700;display:inline-flex;align-items:center;gap:7px;white-space:nowrap;border:1px solid ${t.on ? "#0D3B7A" : "#cfd8e3"};background: ${t.on ? "#0D3B7A" : "#fff"};color: ${t.on ? "#fff" : "#3b4a5c"}`)}>
          {t.label}
          {t.count === undefined ? null : <span style={css(`font-size:12px;font-family:'Rubik',sans-serif;opacity:${t.on || t.count ? 1 : .55}`)}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** A page's sections as a switch (Services: Citizen requests / Services list; Important numbers); a count shows as a badge. */
export function SegmentTabs({ items, label }: { items?: readonly {label: string; on: boolean; go: () => void; count?: number; countLabel?: string}[]; label: string }) {
  return (
    <div role="tablist" aria-label={label} style={{display: "inline-flex", alignSelf: "flex-start", flexWrap: "wrap", gap: "4px", padding: "4px", borderRadius: "12px", background: "#eef2f6"}}>
      {list(items).map((t, i) => (
        <button key={i} role="tab" aria-selected={t.on} onClick={t.go} style={css(`height:36px;padding:0 18px;border:0;border-radius:9px;font-weight:700;font-size:13.5px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;background: ${t.on ? "#fff" : "transparent"};color: ${t.on ? "#0A2550" : "#6b7a8c"};box-shadow: ${t.on ? "0 1px 3px rgba(10,37,80,.12)" : "none"}`)}>
          {t.label}
          {t.count ? <span aria-label={t.countLabel} style={{minWidth: "20px", height: "20px", padding: "0 6px", borderRadius: "999px", fontSize: "11px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#0D3B7A", color: "#fff", fontFamily: "'Rubik',sans-serif"}}>{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** An empty list: an icon, what is (not) there, and one line on what to do. */
export function EmptyState({ title, hint, icon }: { title?: string; hint?: string; icon: string }) {
  return (
    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center"}}>
      <span style={{width: "48px", height: "48px", borderRadius: "14px", background: "#eef4fb", color: "#0D3B7A", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon} /></svg>
      </span>
      <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "15px", fontWeight: "700", color: "#0A2550"}}>{I(title)}</span>
      {hint ? <span style={{fontSize: "13px", color: "#6b7a8c", maxWidth: "420px", lineHeight: "1.5"}}>{I(hint)}</span> : null}
    </div>
  );
}

/** Prev / Page n of m / Next under a paged table. */
export function Pager({ p }: { p: View["usersPager"] }) {
  return (
    <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6b7a8c"}}>
        <button onClick={p?.prev} disabled={p?.prevOpacity !== 1} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${p?.prevOpacity ?? ""}`)}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "2px"}}><path d="M15 6l-6 6 6 6" /></svg>Prev</button>
        <span>{"Page "}{I(p?.page)}{" of "}{I(p?.pages)}</span>
        <button onClick={p?.next} disabled={p?.nextOpacity !== 1} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${p?.nextOpacity ?? ""}`)}>Next<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{verticalAlign: "-2px", marginLeft: "2px"}}><path d="M9 6l6 6-6 6" /></svg></button>
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
          <option value={val(_o?.id, "")}>{_o?.label}</option>
        </React.Fragment>
      ))}
    </>
  );
}

// A <select> with a search box (districts, mandals, villages). Same props and children as <select>; a list of
// SEARCH_FROM choices or fewer stays a plain <select>. onChange gets {target: {name, value}}, as from a <select>.
const SEARCH_FROM = 8;
type Opt = {value: string; label: string; disabled?: boolean};
function optionsOf(children: React.ReactNode): Opt[] {
  const out: Opt[] = [];
  const walk = (n: React.ReactNode): void => React.Children.forEach(n, (c) => {
    if (!React.isValidElement(c)) return;
    const p = c.props as {value?: unknown; children?: React.ReactNode; disabled?: boolean};
    if (c.type === "option") out.push({value: String(p.value ?? ""), label: React.Children.toArray(p.children).join(""), disabled: p.disabled});
    else if (typeof c.type === "function") walk((c.type as (q: unknown) => React.ReactNode)(c.props)); // DistrictOptions
    else walk(p.children);
  });
  walk(children);
  return out;
}
export function SearchSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const opts = optionsOf(props.children);
  if (opts.length <= SEARCH_FROM) return <select {...props} />;
  const {value, onChange, name, style = {}} = props;
  const what = String(props["aria-label"] || "").toLowerCase();
  const cur = opts.find((o) => o.value === String(value ?? ""));
  const needle = q.trim().toLowerCase();
  const shown = opts.filter((o) => !o.disabled && o.label.toLowerCase().includes(needle));
  const close = () => { setOpen(false); setQ(""); };
  const pick = (o: Opt) => {
    close();
    onChange?.({target: {name: name || "", value: o.value}, currentTarget: {name: name || "", value: o.value}} as unknown as React.ChangeEvent<HTMLSelectElement>);
  };
  return (
    <div style={{position: "relative", flex: style.flex, minWidth: style.minWidth}} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close(); }} onKeyDown={(e) => { if (e.key === "Escape" && open) { e.stopPropagation(); close(); } }}>
      <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={props["aria-label"]} onClick={() => (open ? close() : setOpen(true))} style={{...style, flex: undefined, minWidth: undefined, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", cursor: "pointer", textAlign: "left", color: "#17212e"}}>
        <span style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{cur ? cur.label : ""}</span>
        <svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3b4a5c" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: "0"}}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {open ? <div style={{position: "absolute", zIndex: 60, top: "calc(100% + 4px)", left: "0", minWidth: "100%", width: "max-content", maxWidth: "340px", boxSizing: "border-box", background: "#fff", border: "1px solid #cfd8e3", borderRadius: "10px", boxShadow: "0 8px 24px rgba(10,37,80,.14)", padding: "6px"}}>
        <input type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (shown[0]) pick(shown[0]); } }} placeholder={"Search " + what} aria-label={"Search " + what} style={{width: "100%", boxSizing: "border-box", height: "36px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "8px", fontSize: "13px", outlineColor: "#0D3B7A"}} />
        <div role="listbox" aria-label={props["aria-label"]} style={{maxHeight: "260px", overflowY: "auto", marginTop: "6px"}}>
          {shown.map((o, i) => (
            <button key={i} type="button" role="option" aria-selected={o === cur} onClick={() => pick(o)} style={{display: "block", width: "100%", textAlign: "left", padding: "8px 10px", border: "0", borderRadius: "6px", background: o === cur ? "#e3f0fb" : "transparent", color: "#17212e", fontSize: "13px", fontWeight: o === cur ? "700" : "400", cursor: "pointer"}}>{o.label}</button>
          ))}
          {shown.length ? null : <div style={{padding: "8px 10px", color: "#6b7a8c", fontSize: "13px"}}>No match</div>}
        </div>
      </div> : null}
    </div>
  );
}
