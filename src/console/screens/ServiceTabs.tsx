// The Requests / Services switch on the Services page.
import { I, css, list } from "../../shared/dc";
import type { View } from "../Console";

export default function ServiceTabs({ v }: { v: View }) {
  return (
    <div role="tablist" aria-label="Services" style={{display: "inline-flex", alignSelf: "flex-start", gap: "4px", padding: "4px", borderRadius: "12px", background: "#eef2f6"}}>
        {list(v.svcTabs).map((_t, _i1) => (
          <button key={_i1} role="tab" aria-selected={!!_t?.on} onClick={_t?.go} style={css(`height:36px;padding:0 18px;border:0;border-radius:9px;font-weight:700;font-size:13.5px;cursor:pointer;background: ${_t?.bg};color: ${_t?.color};box-shadow: ${_t?.shadow}`)}>{I(_t?.label)}</button>
        ))}
      </div>
  );
}
