// Public website at /. Rendered in the browser only, like the prototype: the page reads the
// window size, the URL hash and the API on mount.
import dynamic from "next/dynamic";
import PageHead from "../components/PageHead";

const Site = dynamic(() => import("../components/Site"), { ssr: false });

const CSS = `
/* "Telugu UI": the mobile app's Telugu face (Noto Sans Telugu scaled to 88% with tighter line metrics), so Telugu sits
   at the same size as the Latin text. Telugu characters only, so English pages never download it. */
@font-face{font-family:"Telugu UI";src:url(/assets/fonts/telugu-ui-400.woff) format("woff");font-weight:400 500;font-display:swap;unicode-range:U+0C00-0C7F,U+0964-0965,U+200C-200D,U+25CC}
@font-face{font-family:"Telugu UI";src:url(/assets/fonts/telugu-ui-600.woff) format("woff");font-weight:600;font-display:swap;unicode-range:U+0C00-0C7F,U+0964-0965,U+200C-200D,U+25CC}
@font-face{font-family:"Telugu UI";src:url(/assets/fonts/telugu-ui-700.woff) format("woff");font-weight:700 900;font-display:swap;unicode-range:U+0C00-0C7F,U+0964-0965,U+200C-200D,U+25CC}
:root{--blue-900:#0D3B7A;--green-600:#1F8A3B;--orange-500:#E9791E;--text-heading:#0A2550;--font-latin:"Rubik","Noto Sans Telugu",sans-serif;--font-telugu:"Nunito Sans","Noto Sans Telugu",sans-serif}
body{margin:0;background:#F6F8F3;font-family:"Nunito Sans","Telugu UI","Noto Sans Telugu",sans-serif;color:#17212e;-webkit-font-smoothing:antialiased}
a{color:#0D3B7A}a:hover{color:#0A2550}
input,textarea,select,button{font-family:inherit}
button:focus-visible,a:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid #0D3B7A;outline-offset:2px}
@keyframes mk-fade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
/* Micro-interactions: quick (120-250 ms), ease-out, small distances. Hover effects only on devices that hover. */
:root{--ease-out:cubic-bezier(.16,1,.3,1)}
.gc-site button{transition:transform .12s var(--ease-out),background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .2s ease}
.gc-site button:not(:disabled):active{transform:scale(.97)}
.gc-site input,.gc-site textarea{transition:border-color .15s ease,box-shadow .15s ease}
.gc-site input:focus,.gc-site textarea:focus{border-color:#0D3B7A!important;box-shadow:0 0 0 3px rgba(13,59,122,.14);outline:none}
.gc-arrow{display:inline-block;transition:transform .18s var(--ease-out)}
.gc-globe,.gc-dot,.gc-row img,.gc-lift img,.gc-site header button img{transition:transform .35s var(--ease-out)}
.gc-row>div{transition:transform .3s var(--ease-out)}
.gc-lift{transition:transform .3s var(--ease-out),box-shadow .3s ease}
/* Nav links: a short underline grows from the centre on hover; the current page keeps its soft pill. */
.gc-nav{position:relative}
.gc-nav::after{content:"";position:absolute;left:14px;right:14px;bottom:6px;height:2px;border-radius:2px;background:#0D3B7A;transform:scaleX(0);transition:transform .25s var(--ease-out)}
.gc-nav[aria-current]::after{display:none}
@media (hover:hover){
.gc-pill:hover{transform:translateY(-2px);box-shadow:0 10px 22px -10px rgba(10,37,80,.5)}
.gc-nav:not([aria-current]):hover{color:#0D3B7A!important}
.gc-nav:hover::after{transform:scaleX(1)}
.gc-site header button:hover img{transform:rotate(-6deg) scale(1.05)}
.gc-site button:hover .gc-arrow{transform:translateX(4px)}
.gc-site .gc-lift:hover{transform:translateY(-6px);box-shadow:0 28px 50px -22px rgba(10,37,80,.45)!important}
.gc-lift:hover img:first-child{transform:scale(1.05)}
.gc-row:hover img{transform:scale(1.1) rotate(-6deg)}
.gc-row:hover>div{transform:translateX(4px)}
.gc-step:hover .gc-dot{transform:scale(1.15)}
.gc-lang:hover{background:#eef4fb!important}
.gc-lang:hover .gc-globe{transform:rotate(-20deg)}
.gc-faq:hover>span:first-child{color:#0D3B7A}
}
/* Scroll reveal, both ways: --from is +28px below the fold (scrolling down) or -28px above it (scrolling back up). */
.gc-reveal{opacity:0;transform:translateY(var(--from,28px));transition:opacity .6s ease,transform .7s var(--ease-out);transition-delay:var(--d,0ms)}
.gc-reveal.is-in{opacity:1;transform:none}
/* New in the app (a day in the village): dots fill and cards lift as each moment comes into view. */
.gc-tl-dot{transition:background-color .4s ease .15s,transform .4s var(--ease-out) .15s}
.gc-moment.is-in .gc-tl-dot{background:currentColor!important;transform:scale(1.15)}
.gc-moment-card{transition:box-shadow .3s ease,transform .3s var(--ease-out)}
@media (hover:hover){.gc-moment:hover .gc-moment-card{transform:translateY(-3px);box-shadow:0 18px 36px -22px rgba(10,37,80,.4)}}
.gc-lift.gc-reveal.is-in{transition:opacity .6s ease var(--d,0ms),transform .3s var(--ease-out),box-shadow .3s ease}
@keyframes gc-pulse{0%{box-shadow:0 0 0 0 rgba(143,224,160,.6)}100%{box-shadow:0 0 0 10px rgba(143,224,160,0)}}
.gc-live{animation:gc-pulse 1.8s ease-out infinite}
html{scroll-behavior:smooth}
/* Hero: the word slides up as it changes, the ring turns, the ticker scrolls (pauses on hover). */
@keyframes gc-word{from{opacity:0;transform:translateY(60%)}to{opacity:1;transform:none}}
.gc-word{animation:gc-word .55s var(--ease-out)}
/* Listen button: grows a little on hover; while reading aloud, yellow rings pulse out from it. */
.gc-speak{transition:transform .25s var(--ease-out),background-color .2s ease,color .2s ease}
@media (hover:hover){.gc-speak:hover{transform:scale(1.07)}}
@keyframes gc-ring{0%{box-shadow:0 0 0 0 rgba(242,221,61,.7),0 12px 24px -10px rgba(10,37,80,.4)}100%{box-shadow:0 0 0 22px rgba(242,221,61,0),0 12px 24px -10px rgba(10,37,80,.4)}}
.gc-speak.is-on{animation:gc-ring 1.4s ease-out infinite}
@keyframes gc-spin{to{transform:rotate(360deg)}}
.gc-spin{animation:gc-spin 40s linear infinite}
@keyframes gc-marquee{to{transform:translateX(-50%)}}
.gc-ticker-track{animation:gc-marquee 36s linear infinite}
.gc-ticker:hover .gc-ticker-track{animation-play-state:paused}
/* Reduced motion: keep the gentle fades and colour changes, drop movement, parallax and pulsing. */
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.gc-reveal,.gc-reveal.is-in{transform:none!important}.gc-site .gc-lift:hover,.gc-pill:hover,.gc-site button:active,.gc-row:hover img,.gc-row:hover>div,.gc-step:hover .gc-dot,.gc-site header button:hover img{transform:none!important}.gc-live,.gc-spin,.gc-word{animation:none}.gc-ticker{overflow-x:auto!important}.gc-ticker-track{animation:none}}
html,body{height:100%;margin:0}#__next{height:100%}
`;

export default function WebsitePage() {
  return (
    <>
      <PageHead fonts="family=Rubik:wght@500;600;700;800&family=Nunito+Sans:wght@400;600;700" css={CSS} />
      <Site />
    </>
  );
}
