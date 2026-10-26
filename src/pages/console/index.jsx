// Super Admin console at /console/. Rendered in the browser only, like the prototype: the page
// checks the session with the API on mount.
import dynamic from "next/dynamic";
import PageHead from "../../components/PageHead";

const Console = dynamic(() => import("../../components/Console"), { ssr: false });

const CSS = `
:root{--blue-900:#0D3B7A;--green-600:#1F8A3B;--orange-500:#E9791E;--text-heading:#0A2550;--font-latin:"Rubik","Noto Sans Telugu",sans-serif;--font-telugu:"Nunito Sans","Noto Sans Telugu",sans-serif}
body{margin:0;background:#F6F8F3;font-family:"Nunito Sans","Noto Sans Telugu",sans-serif;color:#17212e;font-size:14px}
a{color:#0D3B7A}a:hover{color:#0A2550}
input,textarea,select,button{font-family:inherit}
table{border-collapse:collapse}
*{scrollbar-width:none}*::-webkit-scrollbar{display:none}
@keyframes sa-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes sa-slide{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
`;

export default function ConsolePage() {
  return (
    <>
      <PageHead fonts="family=Rubik:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700" css={CSS} />
      <Console />
    </>
  );
}
