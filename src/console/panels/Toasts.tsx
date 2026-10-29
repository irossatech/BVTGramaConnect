// Toasts, top right.
import React from "react";
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function Toasts({ v }: { v: View }) {
  return (
    <div style={{position: "fixed", top: "20px", right: "24px", display: "flex", flexDirection: "column", gap: "8px", zIndex: "100", pointerEvents: "none"}}>
      {list(v.toasts).map((_t, _i1) => (
        <React.Fragment key={_i1}>
          <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", background: "#0A2550", color: "#fff", fontSize: "14px", fontWeight: "600", boxShadow: "0 8px 24px rgba(0,64,126,.3)", animation: "sa-fade .2s ease-out", minWidth: "260px"}}><span style={css(`width:8px;height:8px;border-radius:50%;flex-shrink:0;background: ${_t?.dot ?? ""}`)} />{I(_t?.text)}</div>
        </React.Fragment>
      ))}
    </div>
  );
}
