(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[523],{705:(e,t,a)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o={default:function(){return d},noSSR:function(){return l}};for(var n in o)Object.defineProperty(t,n,{enumerable:!0,get:o[n]});let r=a(4252);a(7876),a(4232);let s=r._(a(6006));function i(e){return{default:e?.default||e}}function l(e,t){return delete t.webpack,delete t.modules,e(t)}function d(e,t){let a=s.default,o={loading:({error:e,isLoading:t,pastDelay:a})=>null};e instanceof Promise?o.loader=()=>e:"function"==typeof e?o.loader=e:"object"==typeof e&&(o={...o,...e});let n=(o={...o,...t}).loader;return(o.loadableGenerated&&(o={...o,...o.loadableGenerated},delete o.loadableGenerated),"boolean"!=typeof o.ssr||o.ssr)?a({...o,loader:()=>null!=n?n().then(i):Promise.resolve(i(()=>null))}):(delete o.webpack,delete o.modules,l(a,o))}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},2936:(e,t,a)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"LoadableContext",{enumerable:!0,get:function(){return o}});let o=(a(4252)._(a(4232))).default.createContext(null)},5135:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>p});var o=a(7876),n=a(8847),r=a.n(n),s=a(9924);let i=r()(()=>a.e(897).then(a.bind(a,3897)),{loadableGenerated:{webpack:()=>[3897]},ssr:!1}),l=`
:root{--blue-900:#0D3B7A;--green-600:#1F8A3B;--orange-500:#E9791E;--text-heading:#0A2550;--font-latin:"Rubik","Noto Sans Telugu",sans-serif;--font-telugu:"Nunito Sans","Noto Sans Telugu",sans-serif}
body{margin:0;background:#F6F8F3;font-family:"Nunito Sans","Noto Sans Telugu",sans-serif;color:#17212e;font-size:14px}
a{color:#0D3B7A}a:hover{color:#0A2550}
input,textarea,select,button{font-family:inherit}
table{border-collapse:collapse}
/* Scrollbars stay hidden; lists and tables still scroll by wheel, trackpad, touch and keyboard. */
*{scrollbar-width:none}*::-webkit-scrollbar{display:none}
@keyframes sa-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
/* Micro-interactions: quick press feedback on buttons, a soft hover on table rows, smooth field focus. Inline styles still win. */
:root{--ease-out:cubic-bezier(.16,1,.3,1)}
button{transition:transform .12s var(--ease-out),background-color .15s ease,border-color .15s ease,color .15s ease,box-shadow .2s ease,opacity .15s ease}
button:not(:disabled):active{transform:scale(.97)}
input,select,textarea{transition:border-color .15s ease,box-shadow .15s ease}
input:focus,select:focus,textarea:focus{box-shadow:0 0 0 3px rgba(13,59,122,.12)}
/* Keyboard focus is always visible; disabled buttons say so. */
button:focus-visible,a:focus-visible{outline:2px solid #0D3B7A;outline-offset:2px}
.sa-side button:focus-visible{outline-color:#fff}
button:disabled{cursor:not-allowed!important}
/* Side bar: a soft hover on the pages you are not on. */
@media (hover:hover){.sa-navb:not([aria-current]):hover{background:rgba(255,255,255,.07)!important;color:#fff!important}}
tbody tr{transition:background-color .12s ease}
@media (hover:hover){tbody tr:hover{background-color:#f5f8fc}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
/* Tables at every width: pills (role, category, status), headers, dates and numbers stay on one line;
   names and titles may wrap. A table wider than its card scrolls inside the card. */
.sa-content td span[style*="999px"]{white-space:nowrap;display:inline-block}
.sa-content th{white-space:nowrap}
.sa-content td[style*="tabular-nums"]{white-space:nowrap}
.sa-content div:has(> table){overflow-x:auto!important;overscroll-behavior-x:contain}
/* Phones and tablets: the side bar becomes a drawer behind the menu button, splits stack, wide tables scroll sideways. */
.sa-scrim{display:none}
@media (max-width:900px){
.sa-shell{grid-template-columns:minmax(0,1fr)!important}
.sa-side{position:fixed;top:0;bottom:0;left:0;width:min(280px,85vw);z-index:70;transform:translateX(-100%);visibility:hidden;transition:transform .25s var(--ease-out),visibility 0s .25s}
.sa-shell.is-open .sa-side{transform:none;visibility:visible;transition:transform .25s var(--ease-out);box-shadow:10px 0 40px rgba(0,0,0,.25)}
.sa-shell.is-open .sa-scrim{display:block;position:fixed;inset:0;z-index:65;border:0;background:rgba(10,37,80,.45);animation:sa-fade .15s ease-out}
.sa-burger{display:flex!important}
.sa-top{padding:0 12px!important;gap:8px!important}
.sa-title{font-size:17px!important}
.sa-search{width:auto!important;flex:0 1 200px;min-width:0}
.sa-content{padding:16px 16px 32px!important;gap:16px!important}
.sa-content div:has(> table){overflow-x:auto!important;overscroll-behavior-x:contain;background:linear-gradient(to left,#fff 30%,rgba(255,255,255,0)) right/24px 100% no-repeat local,radial-gradient(farthest-side at 100% 50%,rgba(10,37,80,.18),transparent) right/12px 100% no-repeat scroll,#fff!important}
.sa-content table{width:max-content!important;min-width:100%!important}
.sa-content th,.sa-content td{white-space:nowrap}
.sa-content td.sa-c-full{white-space:normal;min-width:240px;max-width:320px}
.sa-cols{grid-template-columns:minmax(0,1fr)!important}
.sa-cols>div:first-child:has(> img){display:none}
}
/* Notifications: a soft hover on rows; on phones the list is a full-width sheet under the top bar. */
@media (hover:hover){.sa-notif-row:hover{background:#eef4fb!important}}
@media (max-width:600px){.sa-notif{position:fixed!important;top:64px!important;left:8px!important;right:8px!important;width:auto!important}}
@media (max-width:600px){.sa-me,.sa-search{display:none!important}.sa-kpis>:last-child:nth-child(odd){grid-column:1/-1}}
/* Phones: filters two per row, chart dates every other day, geography rows wrap. */
@media (max-width:700px){
.sa-bar>select,.sa-bar>input{flex:1 1 calc(50% - 6px);min-width:0!important;width:auto!important}
.sa-chart{gap:4px!important}
.sa-chart-days>div:nth-child(even){visibility:hidden}
.sa-geo-row{flex-wrap:wrap;padding-top:4px;padding-bottom:8px}
.sa-geo-row>button:nth-child(2){flex:1 1 calc(100% - 40px)!important}
.sa-geo-acts{flex-basis:100%;flex-wrap:wrap;padding-left:36px}
.sa-geo-row>button:nth-child(2)>span:nth-child(3){display:none}
.sa-geo-row>button:nth-child(2)>span:nth-child(2){white-space:normal!important;overflow:visible!important}
}
@media (max-width:900px){
.sa-geo-form{display:none}
.sa-geo-form.is-open{display:block;position:fixed!important;inset:0;top:0!important;max-height:none!important;z-index:55;border-radius:0!important;background:rgba(10,37,80,.45);padding:16px;overflow-y:auto;animation:sa-fade .15s ease-out}
}
@keyframes sa-slide{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
`;function d(){return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(s.A,{fonts:"family=Rubik:wght@500;600;700&family=Nunito+Sans:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;500;600;700",css:l,title:"Grama Connect – Console",robots:"noindex, nofollow"}),(0,o.jsx)(i,{})]})}function p(){return(0,o.jsx)(d,{})}},6006:(e,t,a)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return c}});let o=a(4252)._(a(4232)),n=a(2936),r=[],s=[],i=!1;function l(e){let t=e(),a={loading:!0,loaded:null,error:null};return a.promise=t.then(e=>(a.loading=!1,a.loaded=e,e)).catch(e=>{throw a.loading=!1,a.error=e,e}),a}class d{constructor(e,t){this._loadFn=e,this._opts=t,this._callbacks=new Set,this._delay=null,this._timeout=null,this.retry()}promise(){return this._res.promise}retry(){this._clearTimeouts(),this._res=this._loadFn(this._opts.loader),this._state={pastDelay:!1,timedOut:!1};let{_res:e,_opts:t}=this;e.loading&&("number"==typeof t.delay&&(0===t.delay?this._state.pastDelay=!0:this._delay=setTimeout(()=>{this._update({pastDelay:!0})},t.delay)),"number"==typeof t.timeout&&(this._timeout=setTimeout(()=>{this._update({timedOut:!0})},t.timeout))),this._res.promise.then(()=>{this._update({}),this._clearTimeouts()}).catch(e=>{this._update({}),this._clearTimeouts()}),this._update({})}_update(e){this._state={...this._state,error:this._res.error,loaded:this._res.loaded,loading:this._res.loading,...e},this._callbacks.forEach(e=>e())}_clearTimeouts(){clearTimeout(this._delay),clearTimeout(this._timeout)}getCurrentValue(){return this._state}subscribe(e){return this._callbacks.add(e),()=>{this._callbacks.delete(e)}}}function p(e){return function(e,t){let a=Object.assign({loader:null,loading:null,delay:200,timeout:null,webpack:null,modules:null},t),r=null;function l(){if(!r){let t=new d(e,a);r={getCurrentValue:t.getCurrentValue.bind(t),subscribe:t.subscribe.bind(t),retry:t.retry.bind(t),promise:t.promise.bind(t)}}return r.promise()}if(!i){let e=a.webpack&&1?a.webpack():a.modules;e&&s.push(t=>{for(let a of e)if(t.includes(a))return l()})}function p(e,t){let s;l(),(s=o.default.useContext(n.LoadableContext))&&Array.isArray(a.modules)&&a.modules.forEach(e=>{s(e)});let i=o.default.useSyncExternalStore(r.subscribe,r.getCurrentValue,r.getCurrentValue);return o.default.useImperativeHandle(t,()=>({retry:r.retry}),[]),o.default.useMemo(()=>{var t;return i.loading||i.error?o.default.createElement(a.loading,{isLoading:i.loading,pastDelay:i.pastDelay,timedOut:i.timedOut,error:i.error,retry:r.retry}):i.loaded?o.default.createElement((t=i.loaded)&&t.default?t.default:t,e):null},[e,i])}return p.preload=()=>l(),p.displayName="LoadableComponent",o.default.forwardRef(p)}(l,e)}function u(e,t){let a=[];for(;e.length;){let o=e.pop();a.push(o(t))}return Promise.all(a).then(()=>{if(e.length)return u(e,t)})}p.preloadAll=()=>new Promise((e,t)=>{u(r).then(e,t)}),p.preloadReady=(e=[])=>new Promise(t=>{let a=()=>(i=!0,t());u(s,e).then(a,a)}),window.__NEXT_PRELOADREADY=p.preloadReady;let c=p},7328:(e,t,a)=>{e.exports=a(8022)},7737:(e,t,a)=>{"use strict";a.d(t,{A:()=>o});let o={apiBase:"/api/v1",siteUrl:"https://www.gramaconnect.com",androidApkUrl:""}},7833:(e,t,a)=>{(window.__NEXT_P=window.__NEXT_P||[]).push(["/console",function(){return a(5135)}])},8847:(e,t,a)=>{e.exports=a(705)},9924:(e,t,a)=>{"use strict";a.d(t,{A:()=>i});var o=a(7876),n=a(7328),r=a.n(n),s=a(7737);function i({fonts:e,css:t,title:a,description:n,robots:l,path:d="/",jsonLd:p}){let u=s.A.siteUrl;return(0,o.jsxs)(r(),{children:[(0,o.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1"},"viewport"),a?(0,o.jsx)("title",{children:a}):null,(0,o.jsx)("link",{rel:"icon",type:"image/png",href:"/assets/logo-mark.png"}),(0,o.jsx)("link",{rel:"apple-touch-icon",href:"/assets/logo-mark.png"}),(0,o.jsx)("meta",{name:"theme-color",content:"#0D3B7A"}),l?(0,o.jsx)("meta",{name:"robots",content:l}):null,n?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("meta",{name:"description",content:n}),(0,o.jsx)("meta",{property:"og:type",content:"website"}),(0,o.jsx)("meta",{property:"og:site_name",content:"Grama Connect"}),(0,o.jsx)("meta",{property:"og:locale",content:"te_IN"}),(0,o.jsx)("meta",{property:"og:locale:alternate",content:"en_IN"}),(0,o.jsx)("meta",{property:"og:title",content:a}),(0,o.jsx)("meta",{property:"og:description",content:n})]}):null,n&&u?(0,o.jsxs)(o.Fragment,{children:[l?null:(0,o.jsx)("link",{rel:"canonical",href:u+d}),(0,o.jsx)("meta",{property:"og:url",content:u+d}),(0,o.jsx)("meta",{property:"og:image",content:u+"/assets/og-image.jpg"}),(0,o.jsx)("meta",{property:"og:image:width",content:"1200"}),(0,o.jsx)("meta",{property:"og:image:height",content:"630"}),(0,o.jsx)("meta",{property:"og:image:alt",content:"Grama Connect: verified village news for Andhra Pradesh, in Telugu"}),(0,o.jsx)("meta",{name:"twitter:card",content:"summary_large_image"}),p?(0,o.jsx)("script",{type:"application/ld+json",dangerouslySetInnerHTML:{__html:JSON.stringify(p)}}):null]}):null,["tokens/fonts.css","tokens/colors.css","tokens/typography.css","tokens/spacing.css","styles.css"].map(e=>(0,o.jsx)("link",{rel:"stylesheet",href:"/_ds/grama-connect/"+e},e)),(0,o.jsx)("link",{rel:"stylesheet",href:"https://fonts.googleapis.com/css2?"+e+"&display=swap"}),(0,o.jsx)("style",{dangerouslySetInnerHTML:{__html:t}})]})}}},e=>{e.O(0,[636,593,792],()=>e(e.s=7833)),_N_E=e.O()}]);