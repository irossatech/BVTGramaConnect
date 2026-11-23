// Settings: post rules and languages, post categories, then the notification texts (Telugu and English).
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import * as ds from "../ds";
import type { View } from "../Console";

const card = {background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "4px"} as const;
const title = {fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550", marginBottom: "6px"} as const;
const rowLine = {display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderTop: "1px solid #f3f5f8"} as const;
const name = {display: "block", fontWeight: "700", color: "#0A2550"} as const;
const help = {display: "block", fontSize: "12px", color: "#6b7a8c", marginTop: "2px", lineHeight: "1.45"} as const;
const num = {width: "84px", height: "40px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", fontWeight: "700", fontFamily: "'Rubik',sans-serif", textAlign: "center"} as const;
const save = {height: "38px", padding: "0 16px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"} as const;

/** An on/off switch that says what it does and whether it is on. */
function Switch({ on, onClick, label }: { on?: boolean; onClick?: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label} onClick={onClick} style={css(`flex-shrink:0;width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;transition:background .15s;background: ${on ? "#1F8A3B" : "#cfd8e3"}`)}>
      <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${on ? "21px" : "3px"};transition:left .15s`)} />
    </button>
  );
}

export default function Settings({ v }: { v: View }) {
  return (
    <>
      {/* Post categories on the left; Post rules and Languages on the right. Both columns end at the same line:
          the grid stretches them, Languages fills the rest of the right one, the category rows share their card's height. */}
      <div className="sa-cols" style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "stretch"}}>
        <section style={card} aria-labelledby="set-cats">
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px"}}>
            <span id="set-cats" style={title}>Post categories</span>
            {v.canAddCat ? <button onClick={v.addCat} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", flexShrink: "0"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true" style={{verticalAlign: "-2px", marginRight: "6px"}}><path d="M12 5v14M5 12h14" /></svg>Add category</button> : null}
          </div>
          <span style={{fontSize: "12.5px", color: "#6b7a8c", marginTop: "-4px", marginBottom: "4px"}}>A switched-off category is hidden from citizens and from New post.</span>
          {/* The rows share the card's height evenly, so the card is filled without a gap at the bottom. */}
          {list(v.catRows).map((_c, _i1) => (
            <React.Fragment key={_i1}>
              <div style={{...rowLine, flex: "1"}}>
                <div className="sc-host-x" style={{width: "36px", height: "36px", flexShrink: "0", opacity: _c?.on ? "1" : ".45"}}><ds.IconBadge category={_c?.icon} {...v.badge36} /></div>
                <span style={{flex: "1", minWidth: "0"}}>
                  <span style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
                    <span style={{fontWeight: "700", color: _c?.on ? "#0A2550" : "#6b7a8c"}}>{I(_c?.en)}</span>
                    {_c?.on ? null : <span style={{padding: "1px 8px", borderRadius: "999px", fontSize: "11px", fontWeight: "700", background: "#eef2f6", color: "#3b4a5c"}}>Hidden</span>}
                  </span>
                  <span style={help}><span lang="te">{I(_c?.te)}</span>{" · "}{I(_c?.count)}{_c?.count === 1 ? " post" : " posts"}</span>
                </span>
                <Switch on={_c?.on} onClick={_c?.toggle} label={"Show the " + (_c?.en || "") + " category"} />
              </div>
            </React.Fragment>
          ))}
        </section>
        <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
          <section style={card} aria-labelledby="set-rules">
            <span id="set-rules" style={title}>Post rules</span>
            <div style={rowLine}>
              <label htmlFor="set-limit" style={{flex: "1", minWidth: "0"}}>
                <span style={name}>Review time limit</span>
                <span style={help}>A post waiting longer is sent up to the next level of admins (Escalated).</span>
              </label>
              <input id="set-limit" type="number" min="6" max="168" value={val<number | "">(v.settings?.escalation, "")} onChange={v.onEscalation} style={num} />
              <span style={{color: "#3b4a5c", fontSize: "13px", width: "38px"}}>hours</span>
              <button onClick={v.saveSettings} aria-label="Save the review time limit" style={save}>Save</button>
            </div>
            <div style={rowLine}>
              <label htmlFor="set-citizen" style={{flex: "1", minWidth: "0"}}>
                <span style={name}>Citizen posts per day</span>
                <span style={help}>Per phone, in 24 hours. 0 means no limit.</span>
              </label>
              <input id="set-citizen" type="number" min="0" max="1000" value={val(v.settings?.citizenPerDay, "")} onChange={v.onCitizenPerDay} style={num} />
              <span style={{color: "#3b4a5c", fontSize: "13px", width: "38px"}}>{Number(v.settings?.citizenPerDay) === 0 ? "none" : "a day"}</span>
              <button onClick={v.saveCitizenPerDay} aria-label="Save citizen posts per day" style={save}>Save</button>
            </div>
          </section>
          <section style={{...card, flex: "1"}} aria-labelledby="set-langs">
            <span id="set-langs" style={title}>Languages</span>
            {list(v.langRows).map((_l, _i1) => (
              <React.Fragment key={_i1}>
                <div style={rowLine}>
                  <span style={{flex: "1", minWidth: "0"}}>
                    <span style={name}>{I(_l?.name)}</span>
                    <span style={help}>{I(_l?.sub)}</span>
                  </span>
                  {_l?.locked
                    ? <span style={{padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", background: "#e4f4df", color: "#1d7a33", whiteSpace: "nowrap"}}>Always on</span>
                    : <Switch on={_l?.on} onClick={_l?.toggle} label={"Offer " + (_l?.id === "en" ? "English" : "this language")} />}
                </div>
              </React.Fragment>
            ))}
          </section>
        </div>
      </div>
      <section style={card} aria-labelledby="set-texts">
        <span id="set-texts" style={title}>Notification texts</span>
        <span style={{fontSize: "12.5px", color: "#6b7a8c", marginTop: "-4px", marginBottom: "4px"}}>The text phones show for each notification. Each person gets it in their own language.</span>
        {!list(v.templates).length ? <p style={{margin: "8px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#6b7a8c"}}>No notification texts yet. They appear here once the server has them.</p> : <>
          <div className="sa-cols" style={{display: "grid", gridTemplateColumns: "200px 1fr 1fr 64px", gap: "16px", padding: "10px 0 6px", fontSize: "12px", fontWeight: "600", color: "#6b7a8c"}}>
            <span>Notification</span><span>Telugu</span><span>English</span><span />
          </div>
          {list(v.templates).map((_tp, _i1) => (
            <React.Fragment key={_i1}>
              <div className="sa-cols" style={{display: "grid", gridTemplateColumns: "200px 1fr 1fr 64px", gap: "16px", alignItems: "center", padding: "12px 0", borderTop: "1px solid #f3f5f8"}}>
                <span>
                  <span style={name}>{I(_tp?.name)}</span>
                  <span style={help}>{I(_tp?.channel)}</span>
                </span>
                <span lang="te" style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_tp?.te)}</span>
                <span style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_tp?.en)}</span>
                <button onClick={_tp?.edit} aria-label={"Edit " + (_tp?.name || "")} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", justifySelf: "end"}}>Edit</button>
              </div>
            </React.Fragment>
          ))}
        </>}
      </section>
    </>
  );
}
