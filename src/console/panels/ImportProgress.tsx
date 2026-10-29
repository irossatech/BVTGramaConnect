// CSV import progress.
import { I } from "../../shared/dc";
import type { View } from "../Console";

export default function ImportProgress({ imp }: { imp: NonNullable<View["imp"]> }) {
  return (
    <div style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "60", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px"}}>
        <div role="status" aria-live="polite" style={{width: "min(420px, 100%)", background: "#fff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 20px 50px rgba(0,64,126,.25)", display: "flex", flexDirection: "column", gap: "12px"}}>
          <div style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "16px", color: "#0A2550"}}>{I(imp.label)}</div>
          <div style={{fontSize: "13px", color: "#6b7a8c", wordBreak: "break-all"}}>{I(imp.name)}</div>
          <div style={{height: "8px", borderRadius: "999px", background: "#eef2f6", overflow: "hidden"}}><div style={{height: "100%", width: imp.pct + "%", background: "#0D3B7A", borderRadius: "999px", transition: "width .3s ease"}} /></div>
          <div style={{fontSize: "12px", color: "#6b7a8c"}}>Keep this page open until it finishes.</div>
        </div>
      </div>
  );
}
