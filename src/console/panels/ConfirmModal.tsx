// The confirm / prompt dialog.
import React from "react";
import { I, css, list, val } from "../../shared/dc";
import type { View } from "../Console";

export default function ConfirmModal({ v }: { v: View }) {
  return (
    <>
      {" "}
      <div style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "60"}}>
        <div style={{width: "460px", background: "#fff", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 60px rgba(0,0,0,.25)", animation: "sa-fade .15s ease-out"}}>
          <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "19px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.title)}</div>
          <div style={{fontSize: "14px", color: "#3b4a5c", lineHeight: "1.55"}}>{I(v.modal?.body)}</div>
          {v.modal?.hasSelect ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.selectLabel)}</span>
              <select value={val(v.modalSel, "")} onChange={v.onModalSel} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
                {list(v.modal?.options).map((_o, _i1) => (
                  <React.Fragment key={_i1}>
                    <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                  </React.Fragment>
                ))}
              </select>
            </label> : null}
          {v.modal?.needsText ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.textLabel)}</span>
              <textarea value={val(v.modalText, "")} onChange={v.onModalText} rows={4} autoFocus={true} style={{padding: "12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", lineHeight: "1.5", resize: "none", outlineColor: "#0D3B7A"}} />
            </label> : null}
          {v.modal?.hasInput ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.inputLabel)}</span>
              <span style={{display: "flex", gap: "10px"}}>
                <input type="text" value={val(v.modalText, "")} onChange={v.onModalText} placeholder={v.modal?.inputPh} autoComplete="off" style={{flex: "1", height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                {v.modal?.hasGen ? <button onClick={v.genModal} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Generate</button> : null}
              </span>
            </label> : null}
          {v.modal?.hasSecret ? <span style={{display: "flex", gap: "10px"}}>
              <input type="text" value={val(v.modal?.secret, "")} onChange={v.noop} autoComplete="off" style={{flex: "1", height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A", letterSpacing: ".08em"}} />
              <button onClick={v.copySecret} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Copy</button>
            </span> : null}
          <div style={{display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px"}}>
            {v.modal?.hasCancel ? <button onClick={v.closeModal} style={{height: "42px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button> : null}
            <button onClick={v.confirmModal} disabled={v.modal?.cannot} style={css(`height:42px;padding:0 20px;border:0;border-radius:999px;color:#fff;font-weight:700;cursor:pointer;background: ${v.modal?.bg ?? ""};opacity: ${v.modal?.opacity ?? ""}`)}>{I(v.modal?.confirmLabel)}</button>
          </div>
        </div>
      </div>
      {" "}
    </>
  );
}
