// Public website at /. Rendered in the browser only, like the prototype: the page reads the
// window size, the URL hash and the API on mount.
import dynamic from "next/dynamic";
import PageHead from "../components/PageHead";

const Site = dynamic(() => import("../components/Site"), { ssr: false });

const CSS = `
:root{--blue-900:#0D3B7A;--green-600:#1F8A3B;--orange-500:#E9791E;--text-heading:#0A2550;--font-latin:"Rubik","Noto Sans Telugu",sans-serif;--font-telugu:"Nunito Sans","Noto Sans Telugu",sans-serif}
body{margin:0;background:#e6ebe3;font-family:"Nunito Sans","Noto Sans Telugu",sans-serif;color:#17212e}
a{color:#0D3B7A}a:hover{color:#0A2550}
input,textarea,select,button{font-family:inherit}
@keyframes mk-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
html,body{height:100%;margin:0}#__next{height:100%}
`;

export default function WebsitePage() {
  return (
    <>
      <PageHead fonts="family=Rubik:wght@500;600;700;800&family=Nunito+Sans:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700;800" css={CSS} />
      <Site />
    </>
  );
}
