// 404 page: the address names no page. A heading, one line and a link back home, in the FAQ and Contact pages' styles.
import { I } from "../../shared/dc";
import type { View } from "../Site";
import { ui } from "../ui/theme";

export default function NotFound({ v }: { v: View }) {
  const { fs, wrap, h1, lead, pillDark } = ui(v);
  return (
    <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
        <div style={{...wrap, maxWidth: "900px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "24px", animation: "mk-fade .25s ease-out"}}>
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
            <h1 style={h1}>{I(v.t?.nfTitle)}</h1>
            <p style={lead}>{I(v.t?.nfBody)}</p>
          </div>
          <a className="gc-pill" href={v.homeHref} onClick={v.homeLink} style={{...pillDark, height: "48px", fontSize: fs.base, textDecoration: "none"}}>{I(v.t?.nfHome)}</a>
        </div>
    </section>
  );
}
