// Settings: review rules, categories and notification templates.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import * as ds from "../ds";
import type { View } from "../Console";

export default function Settings({ v }: { v: View }) {
  return (
    <>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start"}}>
        <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
          <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Post categories</span>
          {list(v.catRows).map((_c, _i1) => (
            <React.Fragment key={_i1}>
              <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
                <div className="sc-host-x" style={{width: "36px", height: "36px"}}><ds.IconBadge category={_c?.icon} {...v.badge36} /></div>
                <span style={{flex: "1"}}>
                  <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_c?.te)}</span>
                  <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_c?.en)}{" · "}{I(_c?.count)}{" posts"}</span>
                </span>
                <button onClick={_c?.toggle} style={css(`width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;background: ${_c?.swBg ?? ""}`)}>
                  <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${_c?.swLeft ?? ""};transition:left .15s`)} />
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
          <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Languages</span>
            {list(v.langRows).map((_l, _i1) => (
              <React.Fragment key={_i1}>
                <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f3f5f8"}}>
                  <span style={{flex: "1"}}>
                    <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_l?.name)}</span>
                    <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_l?.sub)}</span>
                  </span>
                  <button onClick={_l?.toggle} style={css(`width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;background: ${_l?.swBg ?? ""}`)}>
                    <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${_l?.swLeft ?? ""};transition:left .15s`)} />
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
            <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Review escalation</span>
            <div style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>If a pending post is not reviewed within this time, it is escalated to the next level and flagged on the dashboard.</div>
            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
              <input type="number" min="1" max="168" value={val<number | "">(v.settings?.escalation, "")} onChange={v.onEscalation} style={{width: "100px", height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "16px", fontWeight: "700", fontFamily: "'Rubik',sans-serif"}} />
              <span style={{color: "#3b4a5c"}}>hours</span>
              <button onClick={v.saveSettings} style={{marginLeft: "auto", height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Save</button>
            </div>
          </div>
          <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
            <label htmlFor="citizen-per-day" style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Citizen posts per day</label>
            <div id="citizen-per-day-help" style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>How many posts one phone can send in 24 hours, counted across reinstalls. 0 means no limit.</div>
            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
              <input id="citizen-per-day" aria-describedby="citizen-per-day-help" type="number" min="0" max="1000" value={val(v.settings?.citizenPerDay, "")} onChange={v.onCitizenPerDay} style={{width: "100px", height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "16px", fontWeight: "700", fontFamily: "'Rubik',sans-serif"}} />
              <span style={{color: "#3b4a5c"}}>{Number(v.settings?.citizenPerDay) === 0 ? "no limit" : "posts a day"}</span>
              <button onClick={v.saveCitizenPerDay} style={{marginLeft: "auto", height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Save</button>
            </div>
          </div>
        </div>
      </div>
      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
        <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Notification templates</span>
        {list(v.templates).map((_tp, _i1) => (
          <React.Fragment key={_i1}>
            <div style={{display: "grid", gridTemplateColumns: "200px 1fr 1fr auto", gap: "16px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f5f8"}}>
              <span>
                <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_tp?.name)}</span>
                <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_tp?.channel)}</span>
              </span>
              <span style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_tp?.te)}</span>
              <span style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_tp?.en)}</span>
              <button onClick={_tp?.edit} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Edit</button>
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
}
