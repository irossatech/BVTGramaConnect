// One website page: its <head> (title, description, share preview, canonical address, structured data), a
// summary for browsers without JavaScript, and the site itself. The site is rendered at build time, so the
// exported HTML already holds the page's text for search engines, link previews and AI assistants.
import PageHead from "../shared/PageHead";
import config from "../shared/config";
import Site from "./Site";
import LOCALES from "./i18n";
import { pathOf, type Page } from "./routes";

const CSS = `
/* "Telugu UI": the mobile app's Telugu face (Noto Sans Telugu scaled to 88% with tighter line metrics), so Telugu sits
   at the same size as the Latin text. Telugu characters only, so English pages never download it. */
@font-face{font-family:"Telugu UI";src:url(/assets/fonts/telugu-ui-400.woff2) format("woff2");font-weight:400 500;font-display:swap;unicode-range:U+0C00-0C7F,U+0964-0965,U+200C-200D,U+25CC}
@font-face{font-family:"Telugu UI";src:url(/assets/fonts/telugu-ui-600.woff2) format("woff2");font-weight:600;font-display:swap;unicode-range:U+0C00-0C7F,U+0964-0965,U+200C-200D,U+25CC}
@font-face{font-family:"Telugu UI";src:url(/assets/fonts/telugu-ui-700.woff2) format("woff2");font-weight:700 900;font-display:swap;unicode-range:U+0C00-0C7F,U+0964-0965,U+200C-200D,U+25CC}
:root{--blue-900:#0D3B7A;--green-600:#1F8A3B;--orange-500:#E9791E;--text-heading:#0A2550;--font-latin:"Rubik","Noto Sans Telugu",sans-serif;--font-telugu:"Nunito Sans","Noto Sans Telugu",sans-serif}
body{margin:0;background:#F6F8F3;font-family:"Nunito Sans","Telugu UI","Noto Sans Telugu",sans-serif;color:#17212e;-webkit-font-smoothing:antialiased}
a{color:#0D3B7A}a:hover{color:#0A2550}
input,textarea,select,button{font-family:inherit}
/* Cursor: the arrow everywhere; the hand on links and buttons; the text cursor only where you type. */
body{cursor:default}
a[href],button:not(:disabled),[role=button],summary,label[for],select{cursor:pointer}
input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]),textarea,[contenteditable=true]{cursor:text}
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
/* Scroll reveal, both ways: --from is +28px below the fold (scrolling down) or -28px above it (scrolling back up).
   Only once the script runs (.gc-ready): before that, and without JavaScript, everything is simply visible. */
.gc-reveal{transition:opacity .6s ease,transform .7s var(--ease-out);transition-delay:var(--d,0ms)}
.gc-ready .gc-reveal:not(.is-in){opacity:0;transform:translateY(var(--from,28px))}
/* Hero entrance: plain CSS, so it plays as the page paints instead of waiting for the script. A slide only, no fade:
   the hero stays visible from the first paint, so the browser counts it as shown at once (Largest Contentful Paint). */
@keyframes gc-in{from{transform:translateY(16px)}}
.gc-in{animation:gc-in .7s var(--ease-out) both;animation-delay:var(--d,0ms)}
/* Phone (under 820 px) and wide layouts in CSS (ui/theme.ts rsp()), so the built page is right at every width. */
:root{--gc-m:initial;--gc-d: }
@media (max-width:819.98px){:root{--gc-m: ;--gc-d:initial}.gc-wide{display:none!important}}
@media (min-width:820px){.gc-phone{display:none!important}.gc-stick{position:sticky}}
/* New in the app (a day in the village): as each moment comes into view its dot fills, then the rail runs on to the next. */
.gc-tl-dot{transition:background-color .4s ease .15s,transform .4s var(--ease-out) .15s}
.gc-moment.is-in .gc-tl-dot{background:currentColor!important;transform:scale(1.15)}
.gc-seg{transform:scaleY(0);transform-origin:50% 0;transition:transform .8s var(--ease-out) .35s}
.gc-moment.is-in .gc-seg{transform:none}
/* Header: when the page scrolls, the bar becomes a floating card in one step (same height, so nothing below moves) and settles in with transform only. */
@keyframes gc-float{from{opacity:.7;transform:translateY(-6px) scaleX(1.02)}}
.gc-float{animation:gc-float .35s var(--ease-out)}
.gc-draw{clip-path:inset(0 0 100% 0);transition:clip-path .8s var(--ease-out) .35s}
.gc-moment.is-in .gc-draw{clip-path:inset(0)}
/* How it works: each level row lifts onto white on hover, its badge grows a touch. */
.gc-level.gc-reveal{transition:opacity .6s ease var(--d,0ms),transform .7s var(--ease-out) var(--d,0ms),background-color .25s ease,box-shadow .25s ease}
.gc-lv-dot{transition:transform .3s var(--ease-out),box-shadow .25s ease}
@media (hover:hover){.gc-level:hover{background:#fff;box-shadow:0 18px 36px -28px rgba(10,37,80,.45)}.gc-level:hover .gc-lv-dot{transform:scale(1.08);box-shadow:0 0 0 5px #fff!important}}
.gc-lift.gc-reveal.is-in{transition:opacity .6s ease var(--d,0ms),transform .3s var(--ease-out),box-shadow .3s ease}
@keyframes gc-pulse{0%{box-shadow:0 0 0 0 rgba(143,224,160,.6)}100%{box-shadow:0 0 0 10px rgba(143,224,160,0)}}
.gc-live{animation:gc-pulse 1.8s ease-out infinite}
html{scroll-behavior:smooth}
/* /#get-app (the backend's /app/ invite link lands here): stop below the sticky header. */
#get-app{scroll-margin-top:80px}
/* Hero: the word slides up as it changes, the ring turns, the ticker scrolls (pauses on hover). */
@keyframes gc-word{from{opacity:0;transform:translateY(60%)}to{opacity:1;transform:none}}
.gc-word{animation:gc-word .55s var(--ease-out)}
@keyframes gc-spin{to{transform:rotate(360deg)}}
.gc-spin{animation:gc-spin 40s linear infinite}
@keyframes gc-marquee{to{transform:translateX(-50%)}}
.gc-ticker-track{animation:gc-marquee 36s linear infinite}
.gc-ticker:hover .gc-ticker-track{animation-play-state:paused}
/* Reduced motion: keep the gentle fades and colour changes, drop movement, parallax and pulsing. */
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}.gc-reveal,.gc-reveal.is-in,.gc-seg{transform:none!important}.gc-draw{clip-path:none!important}.gc-site .gc-lift:hover,.gc-pill:hover,.gc-site button:active,.gc-row:hover img,.gc-row:hover>div,.gc-step:hover .gc-dot,.gc-level:hover .gc-lv-dot,.gc-site header button:hover img{transform:none!important}.gc-live,.gc-spin,.gc-word,.gc-float,.gc-in{animation:none}.gc-ticker{overflow-x:auto!important}.gc-ticker-track{animation:none}}
@media (max-width:600px){.gc-foot-nav{display:grid!important;grid-template-columns:1fr 1fr;width:100%}.gc-dl-head{flex-direction:column;align-items:flex-start!important;gap:14px!important}.gc-dl-actions{width:100%;align-items:stretch!important}.gc-dl-btns{display:grid!important;grid-template-columns:1fr;gap:10px!important}.gc-dl-btns>button{width:100%}}
html,body{height:100%;margin:0}#__next{height:100%}
`;

// Search results and share previews are in Telugu, the language every exported page is in, so the title,
// description, page text and language tags all agree (audit WEB-SEO-001, owner's choice: Telugu titles, no
// English pages). Each title ends in the English brand name, so "Grama Connect" searches still match.
// Every text comes from the locale files.
const { en: EN, te: TE } = LOCALES;
const NAME = EN.seo.name, NAME_TE = TE.seo.name;
const cut = (x: string) => (x.length > 160 ? x.slice(0, 157).replace(/\s+\S*$/, "") + "…" : x);
const title = (p: Exclude<Page, "home">) => TE.seo[p] + " – " + NAME_TE + " | " + NAME;

// Title and description of each page.
const META: Record<Page, { title: string; description: string }> = {
  home: { title: NAME_TE + " – " + TE.seo.home + " | " + NAME, description: TE.seo.homeDesc },
  how: { title: title("how"), description: cut(TE.seo.howDesc) },
  officials: { title: title("officials"), description: cut(TE.ui.offSub) },
  faq: { title: title("faq"), description: cut(TE.seo.faqDesc) },
  contact: { title: title("contact"), description: cut(TE.ui.contactSub) },
  privacy: { title: title("privacy"), description: cut(TE.legal.privacy.intro) },
  terms: { title: title("terms"), description: cut(TE.legal.terms.intro) },
};

const TITLES = Object.fromEntries(Object.entries(META).map(([k, m]) => [k, m.title])) as Record<Page, string>;

// FAQ questions and answers looked up by a built key ("q1", "ans1").
const FAQ_TE: Readonly<Record<string, string>> = TE.ui;

const AP = { "@type": "AdministrativeArea", name: EN.seo.region };

// Structured data (schema.org) for search engines. The FAQ uses the page's own Telugu text, as rendered.
function jsonLd(page: Page): object {
  const site = config.siteUrl, url = site + pathOf(page), org = { "@id": site + "/#org" };
  const graph: object[] = [
    { "@type": "Organization", "@id": site + "/#org", name: NAME, alternateName: NAME_TE, url: site + "/", logo: site + "/assets/logo-mark.png", areaServed: AP },
    { "@type": "WebSite", "@id": site + "/#website", name: NAME, alternateName: NAME_TE, url: site + "/", inLanguage: ["te", "en"], publisher: org },
    { "@type": "WebPage", "@id": url + "#page", url, name: META[page].title, description: META[page].description, inLanguage: "te", isPartOf: { "@id": site + "/#website" } },
  ];
  if (page === "home") {
    graph.push({ "@type": "MobileApplication", name: NAME, alternateName: NAME_TE, url: site + "/", image: site + "/assets/og-image.jpg", operatingSystem: "Android", applicationCategory: "NewsApplication", inLanguage: ["te", "en"], description: TE.seo.homeDesc, areaServed: AP, offers: { "@type": "Offer", price: "0", priceCurrency: "INR" }, publisher: org,
      ...(config.androidApkUrl ? { downloadUrl: new URL(config.androidApkUrl, site + "/").href } : {}) });
  } else {
    graph.push({ "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: TE.ui.nav_home, item: site + "/" },
      { "@type": "ListItem", position: 2, name: META[page].title.split(" – ")[0], item: url },
    ] });
  }
  if (page === "faq") {
    graph.push({ "@type": "FAQPage", mainEntity: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
      "@type": "Question", name: FAQ_TE["q" + n], acceptedAnswer: { "@type": "Answer", text: FAQ_TE["ans" + n] },
    })) });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}

export default function SitePage({ page }: { page: Page }) {
  const m = META[page];
  return (
    <>
      <PageHead
        css={CSS}
        title={m.title}
        description={m.description}
        path={pathOf(page)}
        jsonLd={jsonLd(page)}
        siteName={NAME}
        imageAlt={TE.seo.imageAlt}
        fonts={["/assets/fonts/telugu-ui-400.woff2", "/assets/fonts/telugu-ui-700.woff2"]}
      />
      <noscript>
        <main style={{maxWidth: "640px", margin: "0 auto", padding: "48px 16px", lineHeight: "1.6"}}>
          <p><strong>{NAME}</strong></p>
          <p lang="te">{TE.seo.noscript}</p>
          <p lang="en">{EN.seo.noscript}</p>
          <p lang="en">{EN.seo.needJs}</p>
        </main>
      </noscript>
      <Site page={page} titles={TITLES} />
    </>
  );
}
