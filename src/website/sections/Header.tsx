// Site header: logo, menu (desktop and phone), language switch and Get the app.
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function Header({ v }: { v: View }) {
  const { ink, blue, green, line, display, fs, wrap, pillDark } = ui(v);
  return (
    <header style={{position: "sticky", top: "0", zIndex: "30", padding: v.scrolled ? "12px clamp(10px,2vw,24px) 0" : "0", transition: "padding .35s var(--ease-out)"}}>
      <div style={{position: "relative", overflow: "hidden", maxWidth: v.scrolled ? "1140px" : "100%", margin: "0 auto", background: v.scrolled ? "rgba(255,255,255,.82)" : "#fff", backdropFilter: "saturate(180%) blur(16px)", WebkitBackdropFilter: "saturate(180%) blur(16px)", border: "1px solid " + (v.scrolled ? "rgba(10,37,80,.07)" : "transparent"), borderBottomColor: v.scrolled ? "rgba(10,37,80,.07)" : line, borderRadius: v.scrolled ? "16px" : "0", boxShadow: v.scrolled ? "0 1px 2px rgba(10,37,80,.05), 0 10px 30px -12px rgba(10,37,80,.22)" : "none", transition: "max-width .4s var(--ease-out), border-radius .35s var(--ease-out), box-shadow .35s ease, background-color .35s ease"}}>
      <div style={{...wrap, padding: v.scrolled ? "0 14px 0 18px" : wrap.padding, height: v.scrolled ? "60px" : "72px", display: "flex", alignItems: "center", gap: "14px", transition: "height .3s var(--ease-out)"}}>
        <button onClick={v.goHome} style={{display: "flex", alignItems: "center", gap: "10px", background: "none", border: "0", padding: "0", cursor: "pointer", color: ink}}>
          <img src="/assets/logo-mark.png" alt="" style={{width: "40px", height: "40px", borderRadius: "18.5%"}} />
          <span style={{textAlign: "left"}}>
            <span style={{display: "block", fontFamily: display, fontWeight: "700", fontSize: fs.base, letterSpacing: ".03em", lineHeight: "1.15", whiteSpace: "nowrap"}}>BVT GRAMA CONNECT</span>
            <span style={{display: "block", fontSize: fs.xs, fontWeight: "700", color: green}}>{I(v.t?.taglineShort)}</span>
          </span>
        </button>
        {v.desktop ? <nav aria-label="Main" style={{display: "flex", gap: "2px", marginLeft: "auto"}}>
            {list(v.navItems).map((_n, _i1) => (
              <a key={_i1} className="gc-nav" href={_n?.href} onClick={_n?.link} aria-current={_n?.on ? "page" : undefined} style={{display: "inline-flex", alignItems: "center", boxSizing: "border-box", height: "38px", padding: "0 12px", border: "0", borderRadius: "999px", cursor: "pointer", fontSize: fs.base, fontWeight: "700", lineHeight: "normal", textDecoration: "none", background: _n?.bg, color: _n?.color}}>{I(_n?.label)}</a>
            ))}
          </nav> : null}
        <button className="gc-lang" onClick={v.toggleLang} aria-label={v.te ? "Switch to English" : "తెలుగుకు మార్చండి"} style={{marginLeft: v.langMargin, height: "36px", padding: "0 12px 0 10px", border: "1.5px solid " + blue, borderRadius: "999px", background: "#fff", color: blue, fontWeight: "700", fontSize: fs.sm, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px"}}>
          <svg className="gc-globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5c2.6 2.6 4 6 4 9.5s-1.4 6.9-4 9.5c-2.6-2.6-4-6-4-9.5s1.4-6.9 4-9.5z" /></svg>
          {I(v.langLabel)}
        </button>
        {v.desktop ? <button className="gc-pill" onClick={v.goGetApp} style={{...pillDark, height: "40px", padding: "0 18px", fontSize: fs.base}}>{I(v.t?.getApp)}</button> : null}
        {v.mobile ? <button onClick={v.toggleMenu} aria-label="Menu" aria-expanded={v.menuOpen} style={{width: "44px", height: "44px", border: "0", background: "none", cursor: "pointer", color: ink, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={v.menuIcon} /></svg>
          </button> : null}
      </div>
      {v.menuOpen ? <nav aria-label="Main" style={{display: "flex", flexDirection: "column", padding: "8px 16px 16px", gap: "2px", borderTop: "1px solid " + line, animation: "mk-fade .15s ease-out"}}>
          {list(v.navItems).map((_n, _i1) => (
            <a key={_i1} className="gc-nav" href={_n?.href} onClick={_n?.link} aria-current={_n?.on ? "page" : undefined} style={{display: "flex", alignItems: "center", boxSizing: "border-box", height: "48px", padding: "0 14px", border: "0", borderRadius: "12px", cursor: "pointer", fontSize: fs.base, fontWeight: "700", lineHeight: "normal", textDecoration: "none", textAlign: "left", background: _n?.bg, color: _n?.color}}>{I(_n?.label)}</a>
          ))}
          <button className="gc-pill" onClick={v.goGetApp} style={{...pillDark, marginTop: "8px"}}>{I(v.t?.getApp)}</button>
        </nav> : null}
      </div>
    </header>
  );
}
