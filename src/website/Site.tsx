// Public website, ported from the approved prototype "Public Website.dc.html".
// render() is the prototype's template as JSX; data enters only through state and renderVals().
// Texts live in strings.ts (Telugu and English), page addresses in routes.ts.
import React from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { I } from "../shared/dc";
import GCApi, { type SiteApiError } from "./api";
import LEGAL, { type Lang } from "./content/legal";
import STRINGS, { type Strings } from "./content/strings";
import { isPage, pageFromSlug, pathOf, type Page } from "./routes";
import { cream, ui } from "./ui/theme";
import Header from "./sections/Header";
import Home from "./sections/Home";
import HowItWorks from "./sections/HowItWorks";
import Officials from "./sections/Officials";
import Faq from "./sections/Faq";
import Contact from "./sections/Contact";
import Legal from "./sections/Legal";
import Footer from "./sections/Footer";

type Category = "announce" | "schemes" | "news" | "updates";

/** A post in GET /public/showcase/. */
interface ShowcasePost {
  category: string;
  title: string;
  published_at: string;
  area?: { name: string } | null;
}

interface Showcase {
  featured: ShowcasePost | null;
  items?: ShowcasePost[];
}

/** GET /public/site-config/: office details and store links the Super Admin sets. */
interface SiteConfig {
  phone?: string;
  email?: string;
  play_store_url?: string;
  app_store_url?: string;
  office_address_te?: string;
  office_address_en?: string;
  hours_te?: string;
  hours_en?: string;
}

interface ContactForm {
  name: string;
  mobile: string;
  village: string;
  message: string;
}

/** A line in the hero ticker, also what Listen reads aloud. */
interface FeedItem {
  chip: string;
  title: string;
  meta: string;
}

interface Props {
  page: Page;
  /** Each page's document title, so in-page navigation keeps the tab title right. */
  titles: Record<Page, string>;
}

interface State {
  page: Page;
  tick: number;
  showcase: Partial<Record<Lang, Showcase>>;
  lang: Lang;
  menuOpen: boolean;
  w: number;
  faqOpen: number;
  form: ContactForm;
  sent: boolean;
  formError: boolean;
  toast: string | null;
  site: SiteConfig | null;
  sending: boolean;
  scrolled: boolean;
  speaking: boolean;
  /** The Super Admin switched English off (GET /app-config/): Telugu only, no language switch. */
  enOff: boolean;
}

// Showcase category chips and labels; announce keeps the prototype's exact chip colours.
const CAT: Record<Category, { te: string; en: string; bg: string; color: string }> = {
  announce: { te: "గ్రామ చాటింపులు", en: "Announcements", bg: "#e4f4df", color: "#1d7a33" },
  schemes: { te: "ప్రభుత్వ పథకాలు", en: "Govt Schemes", bg: "#fff0dc", color: "#9a4a08" },
  news: { te: "వార్తలు & నోటీసులు", en: "News & Notices", bg: "#e3f0fb", color: "#0D3B7A" },
  updates: { te: "ప్రజా అప్‌డేట్లు", en: "Public Updates", bg: "#f1e6f7", color: "#6e3590" },
};
const isCategory = (x: string): x is Category => x in CAT;
const MONTHS: Record<Lang, string[]> = {
  te: ["జన", "ఫిబ్ర", "మార్చి", "ఏప్రి", "మే", "జూన్", "జులై", "ఆగ", "సెప్టెం", "అక్టో", "నవం", "డిసెం"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};
const EMPTY_FORM: ContactForm = { name: "", mobile: "", village: "", message: "" };
const isFormField = (x: string): x is keyof ContactForm => x in EMPTY_FORM;

/** The page the address names: /faq/ style, or an old #faq style link. */
function pageFromUrl(): Page {
  const l = window.location;
  const hash = (l.hash || "").replace(/^#/, "");
  return pageFromSlug(l.pathname.replace(/^\/+|\/+$/g, "")) ?? (isPage(hash) ? hash : "home");
}

// Read-aloud, like the app's Listen: the best voice the browser has for the language.
function pickVoice(voices: SpeechSynthesisVoice[], L: Lang): SpeechSynthesisVoice | null {
  const code = L === "te" ? "te" : "en";
  const lang = (x: SpeechSynthesisVoice) => (x.lang || "").toLowerCase().replace("_", "-");
  const rank = (x: SpeechSynthesisVoice) => (lang(x) === code + "-in" ? 2 : 0) + (/natural|online|google/i.test(x.name) ? 1 : 0);
  const ok = voices.filter((x) => lang(x).startsWith(code) || (L === "te" && /telugu/i.test(x.name)));
  return ok.sort((a, b) => rank(b) - rank(a))[0] || null;
}

/** "14 అక్టో" / "14 Oct" in India time; "" for a bad date. */
function day(iso: string, L: Lang): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "numeric", timeZone: "Asia/Kolkata" }).formatToParts(d);
  const dd = parts.find((x) => x.type === "day")?.value ?? "";
  const mm = Number(parts.find((x) => x.type === "month")?.value ?? 1) - 1;
  return dd + " " + MONTHS[L][mm];
}

/** Everything the sections render: texts, lists and handlers (Site.renderVals()). */
export type View = ReturnType<Site["renderVals"]>;

export default class Site extends React.Component<Props, State> {
  state: State = {
    page: this.props.page,
    tick: 0,
    showcase: {},
    lang: "te",
    menuOpen: false,
    w: 1440,
    faqOpen: 0,
    form: EMPTY_FORM,
    sent: false,
    formError: false,
    toast: null,
    site: null,
    sending: false,
    scrolled: false,
    speaking: false,
    enOff: false,
  };

  private el: HTMLDivElement | null = null;
  private tl: HTMLElement | null = null;
  private tlFill: HTMLElement | null = null;
  private io: IntersectionObserver | null = null;
  private ro: ResizeObserver | null = null;
  private iv = 0;
  private raf = 0;
  private tt = 0;
  private dead = false;
  private reducedMotion = false;
  private readonly onNav = () => this.syncPage();
  // The header floats once the page has scrolled (rAF-throttled).
  private readonly onScroll = () => {
    if (!this.raf)
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.scrollFx();
      });
  };

  componentDidMount() {
    // The address decides the page; an old #faq link moves to /faq/.
    const p = pageFromUrl();
    if (isPage((window.location.hash || "").slice(1))) {
      try {
        window.history.replaceState(null, "", pathOf(p) + window.location.search);
      } catch {
        /* history not available */
      }
    }
    if (p !== this.state.page) this.setState({ page: p });
    // The page was built ahead of time at the desktop width: lay it out at the real width, then show it.
    if (this.el && Math.abs(this.el.clientWidth - this.state.w) > 2) this.setState({ w: this.el.clientWidth });
    document.documentElement.classList.add("gc-ready");
    document.documentElement.lang = this.state.lang;
    this.reveal();
    this.loadSite();
    this.loadShowcase(this.state.lang);
    this.reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    this.scrollFx();
    this.iv = window.setInterval(() => {
      if (this.reducedMotion || document.hidden || this.state.page !== "home") return;
      this.setState((st) => ({ tick: st.tick + 1 }));
    }, 3200);
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("hashchange", this.onNav);
    window.addEventListener("popstate", this.onNav);
    if (this.el && window.ResizeObserver) {
      this.ro = new ResizeObserver((entries) => {
        const w = entries[0].contentRect.width;
        if (Math.abs(w - this.state.w) > 2) this.setState({ w });
      });
      this.ro.observe(this.el);
    }
  }

  // After each update: reveal new sections, and keep the tab title in step with the page.
  componentDidUpdate(_: Props, prev: State) {
    this.reveal();
    if (prev.page !== this.state.page) document.title = this.props.titles[this.state.page];
  }

  componentWillUnmount() {
    this.dead = true;
    this.hush();
    clearInterval(this.iv);
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
    this.ro?.disconnect();
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("hashchange", this.onNav);
    window.removeEventListener("popstate", this.onNav);
    clearTimeout(this.tt);
  }

  private scrollFx() {
    const scrolled = window.scrollY > 8;
    if (scrolled !== this.state.scrolled) this.setState({ scrolled });
    // "A day in the village": the line fills as the day scrolls past the middle of the screen.
    if (this.tl && this.tlFill) {
      const r = this.tl.getBoundingClientRect();
      const p = (window.innerHeight * 0.6 - r.top) / r.height;
      this.tlFill.style.transform = "scaleY(" + Math.min(1, Math.max(0, p)) + ")";
    }
  }

  // Sections animate every time they enter the viewport, from below when scrolling down and from above when
  // scrolling back up (CSS: .gc-reveal / .is-in and --from in SitePage.tsx).
  private reveal() {
    if (!this.el) return;
    const els = this.el.querySelectorAll<HTMLElement>(".gc-reveal:not([data-watch])");
    if (!els.length) return;
    if (!window.IntersectionObserver) {
      els.forEach((e) => e.classList.add("is-in"));
      return;
    }
    const io = (this.io ??= new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const t = e.target as HTMLElement;
          if (e.isIntersecting) t.classList.add("is-in");
          else {
            t.style.setProperty("--from", e.boundingClientRect.top < 0 ? "-28px" : "28px");
            t.classList.remove("is-in");
          }
        }),
      { rootMargin: "0px 0px -8% 0px" },
    ));
    els.forEach((e) => {
      e.setAttribute("data-watch", "");
      io.observe(e);
    });
  }

  private loadSite() {
    GCApi.get<SiteConfig>("/public/site-config/")
      .then((site) => {
        if (!this.dead) this.setState({ site });
      })
      .catch(() => {});
    // No answer (not on the server yet) keeps both languages.
    GCApi.get<{ languages?: { en?: boolean } }>("/app-config/")
      .then((c) => {
        if (this.dead || c?.languages?.en !== false) return;
        this.setState({ enOff: true });
        if (this.state.lang === "en") {
          this.setState({ lang: "te" });
          document.documentElement.lang = "te";
          this.loadShowcase("te");
        }
      })
      .catch(() => {});
  }

  private loadShowcase(L: Lang) {
    if (this.state.showcase[L]) return;
    GCApi.get<Showcase | null>("/public/showcase/", { lang: L })
      .then((d) => {
        if (!this.dead && d?.featured) this.setState((st) => ({ showcase: { ...st.showcase, [L]: d } }));
      })
      .catch(() => {});
  }

  // Read-aloud, like the app's Listen: today's posts in the chosen language, through the browser's own speech voices.
  private listen(L: Lang, t: Strings, items: FeedItem[], retry = false) {
    const sp = window.speechSynthesis;
    if (!sp || !window.SpeechSynthesisUtterance) {
      this.toast(t.noVoice, 6000);
      return;
    }
    if (this.state.speaking && !retry) {
      this.hush();
      return;
    }
    if (!sp.getVoices().length && !retry) {
      // Voices load late on some browsers.
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        sp.removeEventListener("voiceschanged", go);
        this.listen(L, t, items, true);
      };
      sp.addEventListener("voiceschanged", go);
      setTimeout(go, 1200);
      return;
    }
    const voice = pickVoice(sp.getVoices(), L);
    if (L === "te" && !voice) {
      this.toast(t.noVoice, 6000);
      return;
    }
    sp.cancel();
    const parts = items.map((p) => p.chip + ". " + p.title + ".");
    const stop = () => {
      if (!this.dead) this.setState({ speaking: false });
    };
    parts.forEach((txt, i) => {
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = L === "te" ? "te-IN" : "en-IN";
      if (voice) u.voice = voice;
      u.rate = 0.95;
      if (i === parts.length - 1) u.onend = stop;
      u.onerror = stop;
      sp.speak(u);
    });
    this.setState({ speaking: true });
  }

  private hush() {
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* no speech support */
    }
    if (this.state.speaking) this.setState({ speaking: false });
  }

  // Back/Forward, or a typed #link.
  private syncPage() {
    this.hush();
    const p = pageFromUrl();
    if (p !== this.state.page) {
      this.setState({ page: p, menuOpen: false });
      window.scrollTo({ top: 0 });
    }
  }

  private openStore(url: string | undefined, t: Strings) {
    if (url) window.open(url, "_blank", "noopener");
    else this.toast(t.toastStore);
  }

  private send(f: ContactForm, L: Lang, t: Strings) {
    if (this.state.sending) return;
    const honeypot = this.el?.querySelector<HTMLInputElement>("input[name=website]");
    this.setState({ sending: true });
    GCApi.post(
      "/public/contact-messages/",
      { name: f.name.trim(), mobile: f.mobile, village_text: f.village.trim(), message: f.message.trim(), language: L, website: honeypot?.value ?? "" },
      { lang: L },
    )
      .then(() => {
        if (!this.dead) this.setState({ sent: true, formError: false, sending: false });
      })
      .catch((err: SiteApiError) => {
        if (this.dead) return;
        this.setState({ sending: false });
        if (err.status === 400) this.setState({ formError: true });
        else this.toast(err.status === 429 ? t.toastBusy : t.toastFail);
      });
  }

  // A real link (search engines follow it, Ctrl-click opens a tab) that a plain click handles in the page.
  private link(p: Page) {
    return (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
      e.preventDefault();
      this.go(p);
    };
  }

  private go(p: Page) {
    this.hush();
    if (p !== this.state.page) {
      try {
        window.history.pushState(null, "", pathOf(p) + window.location.search);
      } catch {
        /* history not available */
      }
    }
    this.setState({ page: p, menuOpen: false });
    this.el?.closest('[style*="overflow"]')?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }

  private toast(text: string, ms = 2600) {
    this.setState({ toast: text });
    clearTimeout(this.tt);
    this.tt = window.setTimeout(() => this.setState({ toast: null }), ms);
  }

  renderVals() {
    const s = this.state,
      L = s.lang,
      t = STRINGS[L];
    // Texts looked up by a built key ("f1" + "d").
    const tx: Readonly<Record<string, string>> = t;
    const mobile = s.w < 820;
    const pg: Partial<Record<Page, true>> = { [s.page]: true };
    const navItems = (
      [
        ["home", "nav_home"],
        ["how", "nav_how"],
        ["officials", "nav_officials"],
        ["faq", "nav_faq"],
        ["contact", "nav_contact"],
      ] as const
    ).map(([k, lk]) => {
      const on = s.page === k;
      return { label: t[lk], on, bg: on ? "#e3f0fb" : "transparent", color: on ? "#0D3B7A" : "#17212e", href: pathOf(k), link: this.link(k) };
    });
    const icons: Record<Category | "location", string> = {
      announce: "/assets/icon-announce.png",
      schemes: "/assets/icon-schemes.png",
      news: "/assets/icon-news.png",
      updates: "/assets/icon-updates.png",
      location: "/assets/icon-location.png",
    };
    const features = (
      [
        ["announce", "f1"],
        ["schemes", "f2"],
        ["news", "f3"],
        ["updates", "f4"],
        ["location", "f5"],
      ] as const
    ).map(([i, k]) => ({ icon: icons[i], title: t[k], desc: tx[k + "d"] }));
    const steps = (
      [
        ["s1", "#fff0dc", "#E9791E"],
        ["s2", "#e3f0fb", "#0D3B7A"],
        ["s3", "#e4f4df", "#1F8A3B"],
      ] as const
    ).map(([k, bg, dot], i) => ({ n: i + 1, title: t[k], desc: tx[k + "d"], bg, dot }));
    const audiences = [
      { k: "a1", bg: "#e4f4df", border: "#cfe9c7", accent: "#1F8A3B", go: () => this.openStore(s.site?.play_store_url, t) },
      { k: "a2", bg: "#fff0dc", border: "#f6ddb8", accent: "#E9791E", go: () => this.go("officials") },
      { k: "a3", bg: "#e3f0fb", border: "#c9dff5", accent: "#0D3B7A", go: () => this.go("officials") },
    ].map((a) => ({ kicker: tx[a.k + "k"], title: tx[a.k + "t"], desc: tx[a.k + "d"], cta: tx[a.k + "c"], bg: a.bg, border: a.border, accent: a.accent, go: a.go }));
    const levels = (
      [
        ["l1", "S", "#0A2550"],
        ["l2", "D", "#0D3B7A"],
        ["l3", "M", "#07818e"],
        ["l4", "V", "#1F8A3B"],
      ] as const
    ).map(([k, short, bg], i) => ({ name: t[k], example: tx[k + "e"], role: tx[k + "r"], desc: tx[k + "d"], short, bg, indent: mobile ? "0" : i * 36 + "px" }));
    const offCards = (["o1", "o2", "o3"] as const).map((k) => ({ title: t[k], items: ["a", "b", "c"].map((x) => ({ text: tx[k + x] })) }));
    // Newer mobile-app features (citizen side), shown in "A day in the village". Icons are simple line drawings.
    const appFeatures = (
      [
        ["x1", "#e3f0fb", "#0D3B7A", "M9 12h6M9 16h4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6"],
        ["x2", "#e4f4df", "#1F8A3B", "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z"],
        ["x3", "#fff0dc", "#E9791E", "M10 8.5v7l6-3.5-6-3.5zM5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"],
        ["x4", "#f1e6f7", "#6e3590", "M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"],
        ["x5", "#fde8e6", "#b3261e", "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM12 14v3"],
        ["x6", "#e3f0fb", "#0D3B7A", "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"],
      ] as const
    ).map(([k, bg, color, icon]) => ({ title: t[k], desc: tx[k + "d"], bg, color, icon }));
    const faqs = [1, 2, 3, 4, 5, 6, 7, 8].map((n, i) => {
      const open = s.faqOpen === i;
      return {
        q: tx["q" + n],
        a: tx["ans" + n],
        open,
        iconBg: open ? "#0D3B7A" : "#eef2f6",
        iconColor: open ? "#fff" : "#0A2550",
        rot: open ? "rotate(45deg)" : "none",
        toggle: () => this.setState({ faqOpen: open ? -1 : i }),
      };
    });
    // Hero ticker: the newest published posts (showcase API); without data, three sample notices.
    const card = (p: ShowcasePost): FeedItem => {
      const c = CAT[isCategory(p.category) ? p.category : "updates"];
      return { chip: c[L], title: p.title, meta: [day(p.published_at, L), p.area?.name].filter(Boolean).join(" · ") };
    };
    const sc = s.showcase[L];
    const sample: ShowcasePost[] =
      L === "te"
        ? [
            { category: "announce", title: "తాగునీటి సరఫరా సమయం మార్పు", published_at: "2026-10-14", area: { name: "కొలకలూరు" } },
            { category: "schemes", title: "రేషన్ కార్డు శిబిరం – అక్టోబర్ 18", published_at: "2026-10-13", area: { name: "తెనాలి" } },
            { category: "news", title: "రోడ్డు మరమ్మతు నోటీసు", published_at: "2026-10-12", area: { name: "గుంటూరు" } },
          ]
        : [
            { category: "announce", title: "Drinking water timing change", published_at: "2026-10-14", area: { name: "Kolakaluru" } },
            { category: "schemes", title: "Ration card camp – 18 Oct", published_at: "2026-10-13", area: { name: "Tenali" } },
            { category: "news", title: "Road repair notice", published_at: "2026-10-12", area: { name: "Guntur" } },
          ];
    const feed = (sc?.featured ? [sc.featured, ...(sc.items || [])].slice(0, 3) : sample).map(card);
    const f = s.form;
    const site: SiteConfig = s.site || {};
    const addr = (site[`office_address_${L}`] || "GramaConnect, 2nd Floor, Collectorate Road,\nGuntur – 522004, Andhra Pradesh").split("\n");
    const contact = {
      addr1: addr[0] || "",
      addr2: addr.slice(1).join(" "),
      phone: site.phone || "+91 863 223 4567",
      hours: site[`hours_${L}`] || t.hours,
      email: site.email || "help@gramaconnect.com",
    };
    // Hero: the word that changes every few seconds, and the brand line around the photo.
    const WORD: Record<Lang, Record<Category, string>> = {
      te: { announce: "చాటింపులు", schemes: "ప్రభుత్వ పథకాలు", news: "వార్తలు & నోటీసులు", updates: "ప్రజా అప్‌డేట్లు" },
      en: { announce: "announcements", schemes: "govt schemes", news: "news & notices", updates: "public updates" },
    };
    const words = (["announce", "schemes", "news", "updates"] as const).map((k) => ({ text: WORD[L][k], color: CAT[k].color, icon: icons[k] }));
    const ring = "GRAMA CONNECT  •  CONNECTING VILLAGES  •  EMPOWERING INDIA  •  ";
    // One day in the village, each moment tied to a feature (index into appFeatures).
    const DAY: { title: string; m: [number, string, string][] } =
      L === "te"
        ? {
            title: "ఊరిలో ఒక రోజు — యాప్‌తో",
            m: [
              [3, "ఉ. 6:30", "ఉదయం టీ తాగుతూనే — నేటి వార్తలను యాప్ చదివి వినిపిస్తుంది."],
              [0, "ఉ. 10:00", "ఆధార్, భూమి రికార్డులు, సర్టిఫికెట్లు — ఏ సేవ కావాలన్నా అభ్యర్థన పంపండి; అధికారులే మీకు కాల్ చేస్తారు."],
              [2, "మ. 1:00", "విరామంలో 60 సెకన్ల వీడియోలు చూడండి — ఆరోగ్యం, భద్రత, గ్రామ సభపై ఉపయోగకరమైన చిట్కాలు."],
              [4, "సా. 4:00", "పథకాల చివరి తేదీలు, రాబోయే శిబిరాలు — ఇంకా ఎన్ని రోజులో యాప్ గుర్తుచేస్తుంది, ఏ గడువూ మిస్ అవ్వదు."],
              [5, "రా. 7:00", "నచ్చిన పోస్టును సేవ్ చేయండి, లేదా కుటుంబం, ఇరుగుపొరుగుతో వాట్సాప్‌లో పంచుకోండి."],
              [1, "ఎప్పుడైనా", "అవసరమైనప్పుడు — పోలీసు, అంబులెన్స్, హెల్ప్‌లైన్లు, మీ అధికారులు ఒక్క తాకుతో."],
            ],
          }
        : {
            title: "A day in the village, with the app",
            m: [
              [3, "6:30 am", "Over morning tea, the app reads today’s news aloud."],
              [0, "10:00 am", "Aadhaar, land records, certificates — whatever you need, send a request and the officials call you back."],
              [2, "1:00 pm", "Take a break with 60-second videos — useful tips on health, safety and your Gram Sabha."],
              [4, "4:00 pm", "Scheme last dates and upcoming camps — the app counts down the days, so no deadline slips by."],
              [5, "7:00 pm", "Save a post for later, or share it with family and neighbours on WhatsApp."],
              [1, "Any time", "When it matters — police, ambulance, helplines and your officials, one tap away."],
            ],
          };
    const legalPage = s.page === "privacy" || s.page === "terms" ? s.page : null;
    const fill = (x: string) => x.replace("{email}", contact.email).replace("{phone}", contact.phone);
    return {
      page: s.page,
      te: L === "te",
      day: {
        title: DAY.title,
        ref: (el: HTMLElement | null) => {
          this.tl = el;
          if (el) this.scrollFx();
        },
        fillRef: (el: HTMLElement | null) => {
          this.tlFill = el;
        },
        items: DAY.m.map(([k, time, story]) => ({ ...appFeatures[k], time, story })),
      },
      speaking: s.speaking,
      listen: () => this.listen(L, t, feed),
      wordIdx: s.tick,
      word: words[s.tick % words.length],
      ringText: ring,
      scrolled: s.scrolled,
      rootRef: (el: HTMLDivElement | null) => {
        this.el = el;
      },
      headLh: L === "te" ? "1.4" : "1.15",
      desktop: !mobile,
      mobile,
      menuOpen: mobile && s.menuOpen,
      menuIcon: s.menuOpen ? "M18 6L6 18M6 6l12 12" : "M4 7h16M4 12h16M4 17h16",
      langMargin: mobile ? "auto" : "0",
      t,
      pg,
      navItems,
      privacyHref: pathOf("privacy"),
      termsHref: pathOf("terms"),
      privacyLink: this.link("privacy"),
      termsLink: this.link("terms"),
      langLabel: L === "te" ? "EN" : "తెలుగు",
      enOff: s.enOff,
      toggleLang: () => {
        this.hush();
        const nl: Lang = L === "te" ? "en" : "te";
        this.setState({ lang: nl });
        document.documentElement.lang = nl;
        this.loadShowcase(nl);
      },
      toggleMenu: () => this.setState((st) => ({ menuOpen: !st.menuOpen })),
      goHome: () => this.go("home"),
      goHow: () => this.go("how"),
      goContact: () => this.go("contact"),
      goGetApp: () => {
        this.go("home");
        setTimeout(() => document.getElementById("get-app")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
      },
      goPrivacy: () => this.go("privacy"),
      goTerms: () => this.go("terms"),
      legal: legalPage
        ? {
            title: LEGAL[L][legalPage].title,
            updated: LEGAL[L][legalPage].updated,
            intro: LEGAL[L][legalPage].intro,
            note: LEGAL[L].note,
            sections: LEGAL[L][legalPage].sections.map((x) => ({
              h: x.h,
              body: x.body.map((b) => (Array.isArray(b) ? { list: b.map(fill), text: undefined } : { list: undefined, text: fill(b) })),
            })),
          }
        : null,
      playClick: () => this.openStore(site.play_store_url, t),
      appClick: () => this.openStore(site.app_store_url, t),
      // No iPhone app yet: the button says so in large text until the server has an App Store link.
      appLabel: site.app_store_url ? ["Download on the", "App Store"] as const : ["App Store", L === "te" ? "త్వరలో వస్తోంది" : "Coming soon"] as const,
      contact,
      features,
      steps,
      audiences,
      levels,
      offCards,
      faqs,
      feed,
      form: f,
      onField: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (!isFormField(name)) return;
        this.setState((st) => ({ form: { ...st.form, [name]: name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value }, formError: false }));
      },
      submitForm: () => {
        if (!f.name.trim() || f.mobile.length < 10 || !f.message.trim()) {
          this.setState({ formError: true });
          return;
        }
        this.send(f, L, t);
      },
      resetForm: () => this.setState({ sent: false, form: EMPTY_FORM }),
      sent: s.sent,
      notSent: !s.sent,
      formError: s.formError,
      toast: { show: !!s.toast, text: s.toast || "" },
    };
  }

  render() {
    const v = this.renderVals();
    const { ink, fs } = ui(v);
    return (
      <div ref={v.rootRef} className="gc-site" data-screen-label={v.page} style={{width: "100%", maxWidth: "100%", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflowX: "clip", background: cream, color: "#17212e", fontFamily: "'Nunito Sans','Telugu UI','Noto Sans Telugu',sans-serif"}}>
        <Header v={v} />
        <main style={{flex: "1", display: "flex", flexDirection: "column"}}>
          {v.pg?.home ? <Home v={v} /> : null}
          {v.pg?.how ? <HowItWorks v={v} /> : null}
          {v.pg?.officials ? <Officials v={v} /> : null}
          {v.pg?.faq ? <Faq v={v} /> : null}
          {v.pg?.contact ? <Contact v={v} /> : null}
          {v.legal ? <Legal v={v} legal={v.legal} /> : null}
        </main>
        <Footer v={v} />
        {v.toast?.show ? <div role="status" style={{position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", background: ink, color: "#fff", padding: "12px 20px", borderRadius: "999px", fontSize: fs.base, fontWeight: "700", boxShadow: "0 8px 24px rgba(0,64,126,.3)", zIndex: "50", animation: "mk-fade .2s ease-out", maxWidth: "calc(100vw - 32px)", textAlign: "center"}}>{I(v.toast?.text)}</div> : null}
      </div>
    );
  }
}

