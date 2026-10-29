// Shown while the session is checked on page load.

export default function Checking() {
  return (
    <div role="status" aria-live="polite" style={{height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", background: "#0A2550", color: "rgba(255,255,255,.8)"}}>
        <img src="/assets/logo-mark.png" alt="" style={{width: "64px", height: "64px", borderRadius: "18.5%", animation: "sa-fade .3s ease-out"}} />
        <span style={{fontSize: "14px", fontWeight: "600"}}>Loading…</span>
      </div>
  );
}
