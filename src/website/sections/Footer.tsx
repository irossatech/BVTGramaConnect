// Site footer: tricolour strip, logo, page links, privacy and terms.
import { I, list } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function Footer({ v }: { v: View }) {
  const { ink, green, display, fs, wrap } = ui(v);
  return (
    <footer style={{background: ink, color: "#fff"}}>
        <div aria-hidden="true" style={{height: "5px", display: "flex"}}><span style={{flex: "1", background: "#E9791E"}} /><span style={{flex: "1", background: "#fff"}} /><span style={{flex: "1", background: green}} /></div>
        <div style={{...wrap, padding: "clamp(32px,5vw,48px) clamp(16px,4vw,40px) 24px", display: "flex", flexDirection: "column", gap: "28px"}}>
          <div style={{display: "flex", flexWrap: "wrap", gap: "24px 40px", justifyContent: "space-between", alignItems: "flex-start"}}>
            <div style={{display: "flex", flexDirection: "column", gap: "10px", flex: "1 1 280px"}}>
              <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                <img src="/assets/logo-mark.png" alt="" style={{width: "36px", height: "36px", borderRadius: "18.5%"}} />
                <span style={{fontFamily: display, fontWeight: "700", fontSize: fs.base, letterSpacing: ".03em"}}>GRAMA CONNECT</span>
              </div>
              <div style={{fontFamily: display, fontWeight: "700", fontSize: fs.md, color: "#f2dd3d"}}>ప్రతి గ్రామం... ప్రతి కుటుంబం... మన లక్ష్యం!</div>
            </div>
            <nav aria-label="Footer" style={{display: "flex", flexWrap: "wrap", gap: "8px 20px", alignItems: "center"}}>
              {list(v.navItems).map((_n, _i1) => (
                <a key={_i1} href={_n?.href} onClick={_n?.link} style={{display: "inline-block", background: "none", border: "0", padding: "6px 0", color: "rgba(255,255,255,.9)", fontSize: fs.base, lineHeight: "normal", textDecoration: "none", cursor: "pointer"}}>{I(_n?.label)}</a>
              ))}
            </nav>
          </div>
          <div style={{borderTop: "1px solid rgba(255,255,255,.15)", paddingTop: "18px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "10px", fontSize: fs.sm, color: "rgba(255,255,255,.7)"}}>
            <span>© 2026 BVT Grama Connect · Andhra Pradesh · Connecting Villages, Empowering India</span>
            <span style={{display: "flex", gap: "16px"}}><a href={v.privacyHref} onClick={v.privacyLink} style={{background: "none", border: "0", padding: "0", color: "inherit", fontSize: fs.sm, lineHeight: "normal", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px"}}>{I(v.t?.footPrivacy)}</a><a href={v.termsHref} onClick={v.termsLink} style={{background: "none", border: "0", padding: "0", color: "inherit", fontSize: fs.sm, lineHeight: "normal", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px"}}>{I(v.t?.footTerms)}</a></span>
          </div>
        </div>
      </footer>
  );
}
