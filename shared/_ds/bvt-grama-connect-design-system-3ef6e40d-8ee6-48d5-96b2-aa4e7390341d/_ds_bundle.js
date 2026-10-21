/* @ds-bundle: {"format":4,"namespace":"BVTGramaConnectDesignSystem_3ef6e4","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"BottomNav","sourcePath":"components/core/BottomNav.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"HeroCard","sourcePath":"components/core/HeroCard.jsx"},{"name":"IconBadge","sourcePath":"components/core/IconBadge.jsx"},{"name":"LocationSelector","sourcePath":"components/core/LocationSelector.jsx"},{"name":"ServiceCard","sourcePath":"components/core/ServiceCard.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"862c23a5af30","components/core/BottomNav.jsx":"669807823af2","components/core/Button.jsx":"e37cdae678a8","components/core/HeroCard.jsx":"2a39d873b729","components/core/IconBadge.jsx":"237a7156305e","components/core/LocationSelector.jsx":"e7a58a927742","components/core/ServiceCard.jsx":"d31410154598","ui_kits/app/HomeScreen.jsx":"761741c7ccf3"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BVTGramaConnectDesignSystem_3ef6e4 = window.BVTGramaConnectDesignSystem_3ef6e4 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function Badge({
  children,
  tone = 'news',
  style
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--cat-' + tone + '-bg)',
      color: 'var(--cat-' + tone + ')',
      fontFamily: 'var(--font-telugu)',
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      lineHeight: 1.4,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/BottomNav.jsx
try { (() => {
const P = {
  home: 'M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z',
  news: 'M4 4h13a3 3 0 0 1 3 3v12H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zm3 4h6M7 12h6M7 16h4M16 8h1M16 12h1',
  notices: 'M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1zm3 5h6M9 12h6',
  profile: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0'
};
function BottomNav({
  items = [{
    id: 'home',
    label: 'Home'
  }, {
    id: 'news',
    label: 'News'
  }, {
    id: 'notices',
    label: 'Notices'
  }, {
    id: 'profile',
    label: 'Profile'
  }],
  active = 'home',
  onChange,
  style
}) {
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      background: '#fff',
      borderTop: '1px solid var(--border-subtle)',
      padding: '8px 0 10px',
      fontFamily: 'var(--font-latin)',
      ...style
    }
  }, items.map(it => {
    const on = it.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: it.id,
      onClick: () => onChange && onChange(it.id),
      style: {
        flex: 1,
        background: 'none',
        border: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        color: on ? 'var(--blue-900)' : 'var(--gray-500)',
        fontSize: 'var(--text-xs)',
        fontWeight: on ? 700 : 500,
        padding: 4
      }
    }, /*#__PURE__*/React.createElement("svg", {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: on && it.id === 'home' ? 'currentColor' : 'none',
      stroke: "currentColor",
      strokeWidth: "1.8",
      strokeLinecap: "round",
      strokeLinejoin: "round"
    }, /*#__PURE__*/React.createElement("path", {
      d: P[it.id] || P.home
    })), it.label);
  }));
}
Object.assign(__ds_scope, { BottomNav });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/BottomNav.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  children,
  variant = 'primary',
  size = 'md',
  chevron = true,
  style,
  ...rest
}) {
  const pal = {
    primary: {
      background: 'var(--blue-900)',
      color: '#fff'
    },
    secondary: {
      background: 'var(--green-600)',
      color: '#fff'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--blue-900)',
      border: '1.5px solid var(--blue-900)'
    },
    subtle: {
      background: 'var(--blue-100)',
      color: 'var(--blue-900)'
    }
  }[variant];
  const sz = {
    sm: {
      padding: '6px 14px',
      fontSize: 'var(--text-sm)'
    },
    md: {
      padding: '10px 20px',
      fontSize: 'var(--text-base)'
    },
    lg: {
      padding: '14px 26px',
      fontSize: 'var(--text-md)'
    }
  }[size];
  return /*#__PURE__*/React.createElement("button", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      border: 0,
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-telugu)',
      fontWeight: 600,
      cursor: 'pointer',
      lineHeight: 1.2,
      opacity: rest.disabled ? 0.5 : 1,
      transition: 'transform var(--duration-fast) var(--ease-standard)',
      ...pal,
      ...sz,
      ...style
    },
    onMouseDown: e => e.currentTarget.style.transform = 'scale(0.98)',
    onMouseUp: e => e.currentTarget.style.transform = ''
  }, rest), children, chevron && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: '1.1em',
      lineHeight: 1
    }
  }, "\u203A"));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconBadge.jsx
try { (() => {
const SRC = {
  announce: 'announce',
  schemes: 'schemes',
  news: 'news',
  updates: 'updates',
  location: 'location'
};
/** Resolve asset path relative to the page via data attribute on <html data-ds-base> or default '../../assets' */
function base() {
  return typeof document !== 'undefined' && document.documentElement.dataset.dsBase || '../../assets';
}
function IconBadge({
  category = 'announce',
  size = 48,
  icon,
  style
}) {
  const color = 'var(--cat-' + category + ')';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      background: color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      flexShrink: 0,
      overflow: 'hidden',
      ...style
    }
  }, icon ? icon : /*#__PURE__*/React.createElement("img", {
    alt: "",
    src: base() + '/icon-' + SRC[category] + '.png',
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }));
}
Object.assign(__ds_scope, { IconBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconBadge.jsx", error: String((e && e.message) || e) }); }

// components/core/HeroCard.jsx
try { (() => {
function HeroCard({
  category = 'announce',
  title,
  description,
  cta = 'వివరాలు చూడండి',
  image,
  onClick,
  style
}) {
  const img = image || (typeof document !== 'undefined' && document.documentElement.dataset.dsBase || '../../assets') + '/village-landscape.jpg';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-raised)',
      minHeight: 150,
      backgroundImage: 'url(' + img + ')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: 'var(--font-telugu)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'linear-gradient(90deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.75) 60%,rgba(255,255,255,.2) 100%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      gap: 14,
      alignItems: 'center',
      padding: '18px 16px'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconBadge, {
    category: category,
    size: 56
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-heading)',
      lineHeight: 1.25
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-body)',
      marginTop: 4
    }
  }, description), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    size: "sm",
    onClick: onClick,
    style: {
      marginTop: 12
    }
  }, cta))));
}
Object.assign(__ds_scope, { HeroCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/HeroCard.jsx", error: String((e && e.message) || e) }); }

// components/core/LocationSelector.jsx
try { (() => {
function LocationSelector({
  value = 'మీ గ్రామం / మండలం / జిల్లా',
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: '100%',
      padding: '10px 14px',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-pill)',
      background: 'var(--surface-muted)',
      fontFamily: 'var(--font-telugu)',
      fontSize: 'var(--text-sm)',
      fontWeight: 500,
      color: 'var(--text-heading)',
      cursor: 'pointer',
      textAlign: 'left',
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "18",
    height: "18",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--green-600)",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "10",
    r: "3"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      fontSize: 10,
      color: 'var(--text-heading)'
    }
  }, "\u25BC"));
}
Object.assign(__ds_scope, { LocationSelector });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/LocationSelector.jsx", error: String((e && e.message) || e) }); }

// components/core/ServiceCard.jsx
try { (() => {
function ServiceCard({
  category = 'announce',
  title,
  description,
  tinted = true,
  onClick,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    onClick: onClick,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      width: '100%',
      textAlign: 'left',
      padding: '14px 16px',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      background: tinted ? 'var(--cat-' + category + '-bg)' : 'var(--surface-card)',
      boxShadow: 'var(--shadow-card)',
      cursor: 'pointer',
      fontFamily: 'var(--font-telugu)',
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconBadge, {
    category: category,
    size: 48
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-md)',
      fontWeight: 600,
      color: tinted && category !== 'announce' ? 'var(--cat-' + category + ')' : 'var(--text-heading)',
      lineHeight: 1.3
    }
  }, title), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2,
      lineHeight: 1.4
    }
  }, description)), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      color: 'var(--text-muted)',
      fontSize: 20,
      lineHeight: 1
    }
  }, "\u203A"));
}
Object.assign(__ds_scope, { ServiceCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ServiceCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/HomeScreen.jsx
try { (() => {
const {
  Button,
  ServiceCard,
  HeroCard,
  IconBadge,
  LocationSelector,
  BottomNav,
  Badge
} = window.BVTGramaConnectDesignSystem_3ef6e4;
function Header() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px 10px'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-mark.png",
    alt: "",
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      objectFit: 'cover'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-latin)',
      lineHeight: 1.05
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 800,
      color: 'var(--blue-900)',
      fontSize: 18
    }
  }, "BVT ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green-600)'
    }
  }, "GRAMA CONNECT")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-telugu)',
      fontSize: 10,
      color: 'var(--text-muted)',
      marginTop: 3
    }
  }, "\u0C2E\u0C28 \u0C17\u0C4D\u0C30\u0C3E\u0C2E\u0C02 \u2013 \u0C2E\u0C28 \u0C38\u0C47\u0C35\u0C32\u0C41 \u2013 \u0C2E\u0C28 \u0C05\u0C2D\u0C3F\u0C35\u0C43\u0C26\u0C4D\u0C27\u0C3F")));
}
function HomeScreen({
  go
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      padding: '0 16px 16px'
    }
  }, /*#__PURE__*/React.createElement(LocationSelector, {
    onClick: () => go('location')
  }), /*#__PURE__*/React.createElement(HeroCard, {
    title: "\u0C17\u0C4D\u0C30\u0C3E\u0C2E \u0C1A\u0C3E\u0C1F\u0C3F\u0C02\u0C2A\u0C41\u0C32\u0C41",
    description: "\u0C24\u0C3E\u0C1C\u0C3E \u0C2A\u0C4D\u0C30\u0C15\u0C1F\u0C28\u0C32\u0C41, \u0C2E\u0C41\u0C16\u0C4D\u0C2F\u0C2E\u0C48\u0C28 \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02",
    onClick: () => go('notices')
  }), /*#__PURE__*/React.createElement(ServiceCard, {
    category: "schemes",
    title: "\u0C2A\u0C4D\u0C30\u0C2D\u0C41\u0C24\u0C4D\u0C35 \u0C2A\u0C25\u0C15\u0C3E\u0C32\u0C41",
    description: "\u0C05\u0C30\u0C4D\u0C39\u0C24\u0C32\u0C41, \u0C26\u0C30\u0C16\u0C3E\u0C38\u0C4D\u0C24\u0C41 \u0C2E\u0C3E\u0C30\u0C4D\u0C17\u0C26\u0C30\u0C4D\u0C36\u0C15\u0C3E\u0C32\u0C41",
    onClick: () => go('news')
  }), /*#__PURE__*/React.createElement(ServiceCard, {
    category: "news",
    title: "\u0C17\u0C4D\u0C30\u0C3E\u0C2E \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41 & \u0C28\u0C4B\u0C1F\u0C40\u0C38\u0C41\u0C32\u0C41",
    description: "\u0C24\u0C3E\u0C1C\u0C3E \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41, \u0C38\u0C4D\u0C25\u0C3E\u0C28\u0C3F\u0C15 \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02",
    onClick: () => go('news')
  }), /*#__PURE__*/React.createElement(ServiceCard, {
    category: "updates",
    title: "\u0C2A\u0C4D\u0C30\u0C1C\u0C32\u0C15\u0C41 \u0C09\u0C2A\u0C2F\u0C4B\u0C17\u0C15\u0C30\u0C2E\u0C48\u0C28 \u0C05\u0C2A\u0C4D\u200C\u0C21\u0C47\u0C1F\u0C4D\u0C32\u0C41",
    description: "\u0C05\u0C35\u0C38\u0C30\u0C2E\u0C48\u0C28 \u0C38\u0C2E\u0C3E\u0C1A\u0C3E\u0C30\u0C02, \u0C1C\u0C3E\u0C17\u0C4D\u0C30\u0C24\u0C4D\u0C24\u0C32\u0C41",
    onClick: () => go('notices')
  }), /*#__PURE__*/React.createElement(ServiceCard, {
    category: "location",
    tinted: false,
    title: "\u0C17\u0C4D\u0C30\u0C3E\u0C2E\u0C02 / \u0C2E\u0C02\u0C21\u0C32\u0C02 / \u0C1C\u0C3F\u0C32\u0C4D\u0C32\u0C3E",
    description: "\u0C38\u0C4D\u0C25\u0C3E\u0C28\u0C3F\u0C15 \u0C28\u0C41\u0C02\u0C21\u0C3F \u0C1C\u0C3F\u0C32\u0C4D\u0C32\u0C3E \u0C35\u0C30\u0C15\u0C41",
    onClick: () => go('location')
  }));
}
const NEWS = [{
  t: 'గ్రామ సభ – అక్టోబర్ 20',
  d: 'ఉదయం 10 గంటలకు పంచాయతీ కార్యాలయంలో',
  b: 'announce'
}, {
  t: 'రైతు భరోసా కొత్త దరఖాస్తులు',
  d: 'చివరి తేదీ అక్టోబర్ 31',
  b: 'schemes'
}, {
  t: 'తాగునీటి సరఫరా షెడ్యూల్',
  d: 'ఈ వారం ఉదయం 6–8 గంటలు',
  b: 'updates'
}];
function ListScreen({
  title,
  items
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px',
      fontFamily: 'var(--font-telugu)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-heading)',
      margin: '4px 0 12px'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, items.map((n, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      boxShadow: 'var(--shadow-card)',
      padding: '14px 16px'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: n.b
  }, {
    announce: 'చాటింపు',
    schemes: 'పథకం',
    updates: 'అప్‌డేట్',
    news: 'వార్త'
  }[n.b]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text-heading)',
      marginTop: 8,
      fontSize: 'var(--text-base)'
    }
  }, n.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 2
    }
  }, n.d)))));
}
function LocationScreen({
  onPick
}) {
  const [v, setV] = React.useState({
    g: '',
    m: '',
    j: ''
  });
  const F = (k, l, o) => /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'block',
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginBottom: 4
    }
  }, l), /*#__PURE__*/React.createElement("select", {
    value: v[k],
    onChange: e => setV({
      ...v,
      [k]: e.target.value
    }),
    style: {
      width: '100%',
      padding: '10px 12px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border-default)',
      fontFamily: 'var(--font-telugu)',
      fontSize: 'var(--text-base)',
      background: '#fff'
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, "\u0C0E\u0C02\u0C1A\u0C41\u0C15\u0C4B\u0C02\u0C21\u0C3F"), o.map(x => /*#__PURE__*/React.createElement("option", {
    key: x
  }, x))));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px',
      fontFamily: 'var(--font-telugu)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--text-lg)',
      fontWeight: 700,
      color: 'var(--text-heading)',
      margin: '4px 0 12px'
    }
  }, "\u0C17\u0C4D\u0C30\u0C3E\u0C2E\u0C02 / \u0C2E\u0C02\u0C21\u0C32\u0C02 / \u0C1C\u0C3F\u0C32\u0C4D\u0C32\u0C3E"), F('j', 'జిల్లా', ['NTR', 'కృష్ణా', 'గుంటూరు']), F('m', 'మండలం', ['ఇబ్రహీంపట్నం', 'విజయవాడ రూరల్']), F('g', 'గ్రామం', ['కొండపల్లి', 'గుంటుపల్లి']), /*#__PURE__*/React.createElement(Button, {
    onClick: () => onPick(v),
    style: {
      width: '100%',
      justifyContent: 'center'
    }
  }, "\u0C38\u0C47\u0C35\u0C4D \u0C1A\u0C47\u0C2F\u0C02\u0C21\u0C3F"));
}
function ProfileScreen() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px',
      fontFamily: 'var(--font-telugu)',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 80,
      height: 80,
      borderRadius: '50%',
      background: 'var(--blue-100)',
      margin: '16px auto 12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--blue-900)',
      fontWeight: 700,
      fontSize: 28,
      fontFamily: 'var(--font-latin)'
    }
  }, "RK"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 700,
      color: 'var(--text-heading)',
      fontSize: 'var(--text-md)'
    }
  }, "\u0C30\u0C2E\u0C47\u0C37\u0C4D \u0C15\u0C41\u0C2E\u0C3E\u0C30\u0C4D"), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 'var(--text-sm)'
    }
  }, "\u0C15\u0C4A\u0C02\u0C21\u0C2A\u0C32\u0C4D\u0C32\u0C3F, \u0C07\u0C2C\u0C4D\u0C30\u0C39\u0C40\u0C02\u0C2A\u0C1F\u0C4D\u0C28\u0C02, NTR"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, ['భాష', 'నోటిఫికేషన్లు', 'సహాయం'].map(x => /*#__PURE__*/React.createElement("div", {
    key: x,
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      background: '#fff',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '14px 16px',
      fontWeight: 500,
      color: 'var(--text-heading)'
    }
  }, x, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)'
    }
  }, "\u203A")))));
}
function App() {
  const [tab, setTab] = React.useState('home');
  const [loc, setLoc] = React.useState(null);
  const body = tab === 'home' ? /*#__PURE__*/React.createElement(HomeScreen, {
    go: setTab
  }) : tab === 'news' ? /*#__PURE__*/React.createElement(ListScreen, {
    title: "\u0C17\u0C4D\u0C30\u0C3E\u0C2E \u0C35\u0C3E\u0C30\u0C4D\u0C24\u0C32\u0C41 & \u0C28\u0C4B\u0C1F\u0C40\u0C38\u0C41\u0C32\u0C41",
    items: NEWS
  }) : tab === 'notices' ? /*#__PURE__*/React.createElement(ListScreen, {
    title: "\u0C17\u0C4D\u0C30\u0C3E\u0C2E \u0C1A\u0C3E\u0C1F\u0C3F\u0C02\u0C2A\u0C41\u0C32\u0C41",
    items: NEWS.filter(n => n.b !== 'schemes')
  }) : tab === 'location' ? /*#__PURE__*/React.createElement(LocationScreen, {
    onPick: v => {
      setLoc(v);
      setTab('home');
    }
  }) : /*#__PURE__*/React.createElement(ProfileScreen, null);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: 390,
      height: 844,
      margin: '0 auto',
      background: 'var(--surface-page)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: 40,
      boxShadow: '0 20px 60px rgba(0,64,126,.25)',
      border: '8px solid #1a2a3a'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 24px 0',
      fontFamily: 'var(--font-latin)',
      fontSize: 14,
      fontWeight: 600,
      color: '#000'
    }
  }, /*#__PURE__*/React.createElement("span", null, "9:41"), /*#__PURE__*/React.createElement("span", null, "\u25AA\u25AA\u25AA \u25E0 \u25AE")), /*#__PURE__*/React.createElement(Header, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflowY: 'auto'
    }
  }, tab === 'home' && loc && loc.g ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 8px',
      fontFamily: 'var(--font-telugu)',
      fontSize: 'var(--text-xs)',
      color: 'var(--green-800)'
    }
  }, loc.g, " / ", loc.m, " / ", loc.j) : null, body), /*#__PURE__*/React.createElement(BottomNav, {
    active: tab === 'location' ? 'home' : tab,
    onChange: setTab
  }));
}
window.GramaApp = App;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/HomeScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.BottomNav = __ds_scope.BottomNav;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.HeroCard = __ds_scope.HeroCard;

__ds_ns.IconBadge = __ds_scope.IconBadge;

__ds_ns.LocationSelector = __ds_scope.LocationSelector;

__ds_ns.ServiceCard = __ds_scope.ServiceCard;

})();
