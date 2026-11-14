// Public website, ported from the approved prototype "Public Website.dc.html".
// render() is the prototype's template as JSX; data enters only through state and renderVals().
// Texts live in locales/te.json and locales/en.json (i18n.ts), page addresses in routes.ts.
import React from "react";
import type { ChangeEvent, MouseEvent } from "react";
import { I } from "../shared/dc";
import config from "../shared/config";
import GCApi, { type SiteApiError } from "./api";
import LOCALES, { type Lang, type Strings } from "./i18n";
import { isPage, pageFromSlug, pathOf, type Page } from "./routes";
import { cream, ui } from "./ui/theme";
import Header from "./sections/Header";
import Home from "./sections/Home";
import HowItWorks from "./sections/HowItWorks";
import Officials from "./sections/Officials";
import Faq from "./sections/Faq";
import Contact from "./sections/Contact";
import Legal from "./sections/Legal";
import NotFound from "./sections/NotFound";
import Footer from "./sections/Footer";

type Category = "announce" | "schemes" | "news" | "updates";

/** A post in GET /public/showcase/. */
interface ShowcasePost {
  category: string;
  title: string;
  /** The post's own language, and its title in the other language once translated. */
  language?: string;
  translation?: { language: string; title: string } | null;
  published_at: string;
  area?: { name: string } | null;
}

interface Showcase {
  featured: ShowcasePost | null;
  items?: ShowcasePost[];
}

interface ContactForm {
  name: string;
  mobile: string;
  village: string;
  message: string;
}

/** A line in the hero ticker. */
interface FeedItem {
  chip: string;
  title: string;
  meta: string;
  /** Set when the title is not in the page's language (no translation yet), for screen readers. */
  lang?: string;
}

interface Props {
  page: Page;
  /** Each page's document title, so in-page navigation keeps the tab title right. */
  titles: Record<Page, string>;
  /** The 404 page (src/pages/404.tsx): shows "page not found" until the visitor goes to a real page. */
  notFound?: boolean;
  /** The 404 page's document title. */
  notFoundTitle?: string;
}

interface State {
  page: Page;
  /** The address names no page (404): the header and footer show, with the not-found message between them. */
  missing: boolean;
  showcase: Partial<Record<Lang, Showcase>>;
  lang: Lang;
  menuOpen: boolean;
  w: number;
  faqOpen: number;
  form: ContactForm;
  sent: boolean;
  formError: boolean;
  /** Contact form fields that failed the check on Send; each clears as it is edited. */
  errs: Partial<Record<keyof ContactForm, boolean>>;
  toast: string | null;
  sending: boolean;
  scrolled: boolean;
  /** The Super Admin switched English off (GET /app-config/): Telugu only, no language switch. */
  enOff: boolean;
}

// Showcase category chip colours (labels: categories in the locale files); announce keeps the prototype's exact chip colours.
const CAT: Record<Category, { bg: string; color: string }> = {
  announce: { bg: "#e4f4df", color: "#1d7a33" },
  schemes: { bg: "#fff0dc", color: "#9a4a08" },
  news: { bg: "#e3f0fb", color: "#0D3B7A" },
  updates: { bg: "#f1e6f7", color: "#6e3590" },
};
const isCategory = (x: string): x is Category => x in CAT;
const EMPTY_FORM: ContactForm = { name: "", mobile: "", village: "", message: "" };
const isFormField = (x: string): x is keyof ContactForm => x in EMPTY_FORM;
/** Every contact field is required; the mobile is an Indian 10-digit number (starts 6-9). */
const formErrs = (f: ContactForm): Partial<Record<keyof ContactForm, boolean>> => {
  const bad = { name: !f.name.trim(), mobile: !/^[6-9]\d{9}$/.test(f.mobile), village: !f.village.trim(), message: !f.message.trim() };
  return Object.fromEntries(Object.entries(bad).filter(([, b]) => b));
};
/** The form fields a 400 answer names (`error.fields`, API names: village_text is the village field). */
const API_FIELD: Readonly<Record<string, keyof ContactForm>> = { name: "name", mobile: "mobile", village_text: "village", message: "message" };
const serverFieldErrs = (err: SiteApiError): Partial<Record<keyof ContactForm, boolean>> =>
  Object.fromEntries(Object.keys(err.fields || {}).flatMap((k) => (API_FIELD[k] ? [[API_FIELD[k], true]] : [])));

/** Whether the address names a page at all (the 404 page is served for any other address). */
function knownUrl(): boolean {
  const l = window.location;
  const seg = l.pathname.replace(/^\/+|\/+$/g, "");
  return seg === "" || pageFromSlug(seg) !== null;
}

// The visitor's last language choice, kept on their own device only (no cookie, nothing sent to the server).
// The exported pages are Telugu; a saved "en" switches to English once the page starts (audit WEB-I18N-001).
const LANG_KEY = "gc-lang";
function savedLang(): Lang | null {
  try {
    const x = window.localStorage.getItem(LANG_KEY);
    return x === "te" || x === "en" ? x : null;
  } catch {
    return null; // storage blocked (private window, site data off): Telugu, as before
  }
}
function saveLang(l: Lang) {
  try {
    window.localStorage.setItem(LANG_KEY, l);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
}

/** The page the address names: /faq/ style, or an old #faq style link. */
function pageFromUrl(): Page {
  const l = window.location;
  const hash = (l.hash || "").replace(/^#/, "");
  return pageFromSlug(l.pathname.replace(/^\/+|\/+$/g, "")) ?? (isPage(hash) ? hash : "home");
}

/** "14 అక్టో" / "14 Oct" in India time; "" for a bad date. */
function day(iso: string, L: Lang): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "numeric", timeZone: "Asia/Kolkata" }).formatToParts(d);
  const dd = parts.find((x) => x.type === "day")?.value ?? "";
  const mm = Number(parts.find((x) => x.type === "month")?.value ?? 1) - 1;
  return dd + " " + LOCALES[L].months[mm];
}

/** Everything the sections render: texts, lists and handlers (Site.renderVals()). */
export type View = ReturnType<Site["renderVals"]>;

export default class Site extends React.Component<Props, State> {
  state: State = {
    page: this.props.page,
    missing: !!this.props.notFound,
    showcase: {},
    lang: "te",
    menuOpen: false,
    w: 1440,
    faqOpen: 0,
    form: EMPTY_FORM,
    sent: false,
    formError: false,
    errs: {},
    toast: null,
    sending: false,
    scrolled: false,
    enOff: false,
  };

  private el: HTMLDivElement | null = null;
  private io: IntersectionObserver | null = null;
  private ro: ResizeObserver | null = null;
  private raf = 0;
  private tt = 0;
  private dead = false;
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
    // The address decides the page; an old #faq link moves to /faq/. The 404 page stays itself.
    const p = this.props.notFound ? this.state.page : pageFromUrl();
    if (!this.props.notFound && isPage((window.location.hash || "").slice(1))) {
      try {
        window.history.replaceState(null, "", pathOf(p) + window.location.search);
      } catch {
        /* history not available */
      }
    }
    if (p !== this.state.page) this.setState({ page: p });
    // The layout itself follows the width in CSS (ui/theme.ts rsp()); the width here only drives the phone menu.
    // window.innerWidth, like the CSS media queries, so both switch at the same 820 px.
    if (Math.abs(window.innerWidth - this.state.w) > 2) this.setState({ w: window.innerWidth });
    const L = savedLang() ?? this.state.lang;
    if (L !== this.state.lang) this.setState({ lang: L });
    document.documentElement.lang = L;
    // Mark what is already on screen as revealed before the reveal effect switches on, so nothing blinks.
    this.reveal();
    document.documentElement.classList.add("gc-ready");
    this.loadSite();
    this.loadShowcase(L);
    this.scrollFx();
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("hashchange", this.onNav);
    window.addEventListener("popstate", this.onNav);
    if (this.el && window.ResizeObserver) {
      this.ro = new ResizeObserver(() => {
        const w = window.innerWidth;
        if (Math.abs(w - this.state.w) > 2) this.setState({ w });
      });
      this.ro.observe(this.el);
    }
  }

  // After each update: reveal new sections, and keep the tab title in step with the page.
  componentDidUpdate(_: Props, prev: State) {
    this.reveal();
    if (prev.page !== this.state.page || prev.missing !== this.state.missing)
      document.title = this.state.missing ? (this.props.notFoundTitle ?? "") : this.props.titles[this.state.page];
  }

  componentWillUnmount() {
    this.dead = true;
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
    const h = window.innerHeight * 0.92;
    els.forEach((e) => {
      const r = e.getBoundingClientRect();
      if (r.top < h && r.bottom > 0) e.classList.add("is-in");
      e.setAttribute("data-watch", "");
      io.observe(e);
    });
  }

  // The office details and store links are part of the website (locales/*.json, GC_*_STORE_URL), not fetched.
  private loadSite() {
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

  // Back/Forward, or a typed #link.
  private syncPage() {
    const p = pageFromUrl();
    // Back to the mistyped address the 404 page was opened at: the not-found message again.
    const missing = !!this.props.notFound && !knownUrl();
    if (p !== this.state.page || missing !== this.state.missing) {
      this.setState({ page: p, missing, menuOpen: false });
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
        if (err.status !== 400) {
          this.toast(err.status === 429 ? t.toastBusy : t.toastFail);
          return;
        }
        // The server names the fields it refused: mark those (the page's own messages) and go to the first one.
        const errs = serverFieldErrs(err);
        const first = Object.keys(errs)[0];
        if (!first) {
          this.setState({ formError: true });
          return;
        }
        this.setState({ errs, formError: false });
        this.el?.querySelector<HTMLElement>(`[name=${first}]`)?.focus();
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
    if (p !== this.state.page || this.state.missing) {
      try {
        window.history.pushState(null, "", pathOf(p) + window.location.search);
      } catch {
        /* history not available */
      }
    }
    this.setState({ page: p, missing: false, menuOpen: false });
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
      loc = LOCALES[L],
      t = loc.ui;
    // Texts looked up by a built key ("f1" + "d").
    const tx: Readonly<Record<string, string>> = t;
    const mobile = s.w < 820;
    const pg: Partial<Record<Page, true>> = s.missing ? {} : { [s.page]: true };
    const navItems = (
      [
        ["home", "nav_home"],
        ["how", "nav_how"],
        ["officials", "nav_officials"],
        ["faq", "nav_faq"],
        ["contact", "nav_contact"],
      ] as const
    ).map(([k, lk]) => {
      const on = !s.missing && s.page === k;
      return { label: t[lk], on, bg: on ? "#e3f0fb" : "transparent", color: on ? "#0D3B7A" : "#17212e", href: pathOf(k), link: this.link(k) };
    });
    const icons: Record<Category | "location", string> = {
      announce: "/assets/icon-announce.webp",
      schemes: "/assets/icon-schemes.webp",
      news: "/assets/icon-news.webp",
      updates: "/assets/icon-updates.webp",
      location: "/assets/icon-location.webp",
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
      { k: "a1", bg: "#e4f4df", border: "#cfe9c7", accent: "#1F8A3B", go: () => this.openStore(config.playStoreUrl, t) },
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
    // How it works and Contact: the explainer rows under each page's main content.
    const howDetails = [1, 2, 3, 4, 5].map((n) => ({ title: tx["hw" + n], desc: tx["hw" + n + "d"] }));
    const contactHelp = [1, 2, 3, 4, 5].map((n) => ({ title: tx["ct" + n], desc: tx["ct" + n + "d"] }));
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
      const k = isCategory(p.category) ? p.category : "updates";
      // On the English page a Telugu post shows its English title when there is one.
      const tr = p.language && p.language !== L && p.translation?.language === L ? p.translation.title : "";
      const lang = !tr && p.language && p.language !== L ? p.language : undefined;
      return { chip: loc.categories[k], title: tr || p.title, lang, meta: [day(p.published_at, L), p.area?.name].filter(Boolean).join(" · ") };
    };
    const sc = s.showcase[L];
    const feed = (sc?.featured ? [sc.featured, ...(sc.items || [])].slice(0, 3) : (loc.sample as ShowcasePost[])).map(card);
    const f = s.form;
    const addr = loc.office.address.split("\n");
    const contact = {
      addr1: addr[0] || "",
      addr2: addr.slice(1).join(" "),
      phone: loc.office.phone,
      hours: t.hours,
      email: loc.office.email,
    };
    // Hero: the words that take turns every few seconds (ui/parts.tsx RotatingWord), and the brand line around the photo.
    const words = (["announce", "schemes", "news", "updates"] as const).map((k) => ({ text: loc.words[k], color: CAT[k].color, icon: icons[k] }));
    const legalPage = !s.missing && (s.page === "privacy" || s.page === "terms") ? s.page : null;
    const fill = (x: string) => x.replace("{email}", contact.email).replace("{phone}", contact.phone);
    return {
      page: s.page,
      te: L === "te",
      // One day in the village, each moment tied to a feature (index into appFeatures).
      day: {
        title: loc.day.title,
        items: loc.day.moments.map(({ feature, time, story }) => ({ ...appFeatures[feature], time, story })),
      },
      words,
      ringText: t.ring,
      scrolled: s.scrolled,
      rootRef: (el: HTMLDivElement | null) => {
        this.el = el;
      },
      headLh: L === "te" ? "1.4" : "1.15",
      menuOpen: mobile && s.menuOpen,
      menuIcon: s.menuOpen ? "M18 6L6 18M6 6l12 12" : "M4 7h16M4 12h16M4 17h16",
      t,
      pg,
      navItems,
      privacyHref: pathOf("privacy"),
      termsHref: pathOf("terms"),
      privacyLink: this.link("privacy"),
      termsLink: this.link("terms"),
      langLabel: t.langOther,
      enOff: s.enOff,
      // The 404 page: its message and the link back home.
      missing: s.missing,
      homeHref: pathOf("home"),
      homeLink: this.link("home"),
      toggleLang: (e?: MouseEvent<HTMLButtonElement>) => {
        // A tap made before the scripts started is tapped again by scripts/boot.js once React is ready (a synthetic
        // click: isTrusted false). It was made on the exported page, which is always Telugu, so it means "English",
        // even when the saved language (savedLang) has already switched to English by then. A real tap toggles.
        const nl: Lang = e && !e.isTrusted ? "en" : L === "te" ? "en" : "te";
        saveLang(nl);
        this.setState({ lang: nl });
        document.documentElement.lang = nl;
        this.loadShowcase(nl);
      },
      toggleMenu: () => this.setState((st) => ({ menuOpen: !st.menuOpen })),
      goHome: () => this.go("home"),
      goHow: () => this.go("how"),
      goContact: () => this.go("contact"),
      // "Get the app" (header): the Play Store when the app is there, else the Android APK download on
      // Android and computers, else a short message (iPhone, or no APK yet). It never scrolls the page.
      getAppClick: () => {
        this.setState({ menuOpen: false });
        const iPhone = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        if (config.playStoreUrl && !iPhone) window.open(config.playStoreUrl, "_blank", "noopener");
        else if (config.appStoreUrl && iPhone) window.open(config.appStoreUrl, "_blank", "noopener");
        else if (config.androidApkUrl && !iPhone) {
          const a = document.createElement("a");
          a.href = config.androidApkUrl;
          a.download = "";
          document.body.appendChild(a);
          a.click();
          a.remove();
          this.toast(t.toastApk);
        } else this.toast(t.toastStore);
      },
      goPrivacy: () => this.go("privacy"),
      goTerms: () => this.go("terms"),
      legal: legalPage
        ? {
            title: loc.legal[legalPage].title,
            updated: loc.legal[legalPage].updated,
            intro: loc.legal[legalPage].intro,
            note: loc.legal.note,
            sections: loc.legal[legalPage].sections.map((x) => ({
              h: x.h,
              body: x.body.map((b) => (Array.isArray(b) ? { list: b.map(fill), text: undefined } : { list: undefined, text: fill(b) })),
            })),
          }
        : null,
      playClick: () => this.openStore(config.playStoreUrl, t),
      appClick: () => this.openStore(config.appStoreUrl, t),
      // No app in a store yet: each button says so in large text until the server has its store link.
      apkUrl: config.androidApkUrl,
      apkLabel: t.apkLabel,
      playLabel: config.playStoreUrl ? [t.playPre, t.playName] as const : [t.playName, t.comingSoon] as const,
      appLabel: config.appStoreUrl ? [t.appPre, t.appName] as const : [t.appName, t.comingSoon] as const,
      contact,
      features,
      steps,
      audiences,
      levels,
      offCards,
      howDetails,
      contactHelp,
      faqs,
      feed,
      form: f,
      onField: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (!isFormField(name)) return;
        this.setState((st) => ({ form: { ...st.form, [name]: name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value }, formError: false, errs: { ...st.errs, [name]: false } }));
      },
      submitForm: () => {
        const errs = formErrs(f);
        const first = Object.keys(errs)[0];
        if (first) {
          this.setState({ errs, formError: false });
          this.el?.querySelector<HTMLElement>(`[name=${first}]`)?.focus();
          return;
        }
        this.send(f, L, t);
      },
      resetForm: () => this.setState({ sent: false, form: EMPTY_FORM, errs: {} }),
      sent: s.sent,
      notSent: !s.sent,
      formError: s.formError,
      errs: s.errs,
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
          {v.missing ? <NotFound v={v} /> : null}
        </main>
        <Footer v={v} />
        {v.toast?.show ? <div role="status" style={{position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", background: ink, color: "#fff", padding: "12px 20px", borderRadius: "999px", fontSize: fs.base, fontWeight: "700", boxShadow: "0 8px 24px rgba(0,64,126,.3)", zIndex: "50", animation: "mk-fade .2s ease-out", maxWidth: "calc(100vw - 32px)", textAlign: "center"}}>{I(v.toast?.text)}</div> : null}
      </div>
    );
  }
}

