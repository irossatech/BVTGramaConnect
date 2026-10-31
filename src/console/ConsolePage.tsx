// The console page: its <head> (title, noindex, fonts, global CSS) and the console itself. Rendered in the
// browser only, like the prototype: it checks the session with the API on mount.
import dynamic from "next/dynamic";
import PageHead from "../shared/PageHead";

const Console = dynamic(() => import("./Console"), { ssr: false });

const CSS = `
:root{--blue-900:#0D3B7A;--green-600:#1F8A3B;--orange-500:#E9791E;--text-heading:#0A2550;--font-latin:"Rubik","Noto Sans Telugu",sans-serif;--font-telugu:"Nunito Sans","Noto Sans Telugu",sans-serif}
body{margin:0;background:#F6F8F3;font-family:"Nunito Sans","Noto Sans Telugu",sans-serif;color:#17212e;font-size:14px}
a{color:#0D3B7A}a:hover{color:#0A2550}
input,textarea,select,button{font-family:inherit}
table{border-collapse:collapse}
*{scrollbar-width:none}*::-webkit-scrollbar{display:none}
@keyframes sa-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* Micro-interactions: quick press feedback on buttons, a soft hover on table rows, smooth field focus. Inline styles still win. */
:root{--ease-out:cubic-bezier(.16,1,.3,1)}
button{transition:transform .12s var(--ease-out),background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .2s ease,opacity .15s ease}
button:not(:disabled):active{transform:scale(.97)}
input,select,textarea{transition:border-color .15s ease,box-shadow .15s ease}
input:focus,select:focus,textarea:focus{box-shadow:0 0 0 3px rgba(13,59,122,.12)}
tbody tr{transition:background-color .12s ease}
@media (hover:hover){tbody tr:hover{background-color:#f5f8fc}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@keyframes sa-slide{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
`;

export default function ConsolePage() {
  return (
    <>
      <PageHead fonts="family=Rubik:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700" css={CSS} title="Grama Connect – Console" robots="noindex, nofollow" />
      <Console />
    </>
  );
}
