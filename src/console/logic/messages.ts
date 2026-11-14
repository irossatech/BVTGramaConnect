// Contact messages page (sidebar "Contact messages") and its View panel: the website's contact form messages.
// Moved out of Console.tsx unchanged (audit WEB-ARCH-001). Calls GET/PATCH /admin/contact-messages/ (.claude/api.md).
import type { ContactMessage, Paged } from "../types";
import { maskMobile, mobileDigits } from "../mask";
import { orEmpty, pageCount, pager, PAGE_SIZE, type FieldChange } from "../model";
import type { ConsoleHost } from "./host";

export function loadContacts(h: ConsoleHost, page: number) {
  const s = h.state;
  const latest = h.ticket('contacts');
  h.setState({contactLoading: true});
  // contact=0: rows with the mobile's last 4 digits and no message (audit WEB-DP-001); View reads the message in full.
  h.api.get<Paged<ContactMessage>>('/admin/contact-messages/', {status: s.contactFilter === 'all' ? '' : s.contactFilter, q: s.contactQ, contact: '0', page, page_size: PAGE_SIZE})
    .then((d) => latest() && h.setState({contacts: d.results || [], contactCount: d.count || 0, contactPage: page, contactPages: pageCount(d.count), contactLoading: false}))
    .catch((e: unknown) => {
      if (!latest()) return;
      h.setState({contactLoading: false, contacts: [], contactCount: 0});
      h.fail(e);
    });
}

export function isHandled(c: ContactMessage) {
  return c.status ? String(c.status).toUpperCase() === 'HANDLED' : !!c.handled;
}

// "View": the row has no full mobile or message, so the panel shows the message as the server sends it alone.
function openContact(h: ConsoleHost, c: ContactMessage) {
  const latest = h.ticket('cmOpen');
  h.api.get<ContactMessage>('/admin/contact-messages/' + c.id + '/').then((full) => latest() && h.setState({cm: full})).catch((e: unknown) => latest() && h.fail(e));
}

function toggleContact(h: ConsoleHost, c: ContactMessage) {
  const done = !isHandled(c);
  h.api.patch<ContactMessage | null>('/admin/contact-messages/' + c.id + '/', {handled: done}).then((n) => {
    h.setState((x) => x.cm && x.cm.id === c.id ? {cm: n || {...x.cm, handled: done}} : null);
    h.toast(done ? 'Marked handled' : 'Marked new', done ? '#6cc04a' : '#E9791E');
    loadContacts(h, h.state.contactPage);
  }).catch((e: unknown) => h.fail(e));
}

/** The page's renderVals() values (screens/Messages.tsx). */
export function contactsView(h: ConsoleHost) {
  const s = h.state;
  return {
    contactQ: s.contactQ,
    onContactQ: (e: FieldChange) => {
      h.setState({contactQ: e.target.value});
      h.later('contacts', () => loadContacts(h, 1), 300);
    },
    contactFilter: s.contactFilter, contactFilters: [{id: 'new', label: 'New'}, {id: 'handled', label: 'Handled'}, {id: 'all', label: 'All'}], onContactFilter: (e: FieldChange) => h.setState({contactFilter: e.target.value}, () => loadContacts(h, 1)),
    contactRows: s.contacts.map((c) => {
      const done = isHandled(c);
      // Mobile masked and no message in the table (audit WEB-DP-001); View shows both in full.
      const mobile = c.mobile_last4 ? '+91 ******' + c.mobile_last4 : maskMobile(c.mobile);
      return {rowKey: String(c.id), time: h.fmt(c.created_at, false), name: c.name, mobile: mobile || '—', village: c.village_text || '—', status: done ? 'Handled' : 'New', sbg: done ? '#e4f4df' : '#fff0dc', scolor: done ? '#1d7a33' : '#b35a0e', toggleLabel: done ? 'Mark new' : 'Mark handled', toggle: () => toggleContact(h, c), view: () => openContact(h, c)};
    }),
    contactCount: s.contactCount + (s.contactCount === 1 ? ' message' : ' messages'), contactEmpty: !s.contacts.length, contactEmptyText: s.contactLoading ? 'Loading…' : 'No messages match.', contactPager: pager(s.contactPage, s.contactPages, (p) => loadContacts(h, p)),
  };
}

/** The View panel's renderVals() values (panels/ContactPanel.tsx). */
export function contactPanelView(h: ConsoleHost) {
  const s = h.state;
  return {
    cmShow: !!s.cm, closeCM: () => h.setState({cm: null}),
    cm: orEmpty(s.cm ? (() => {
      const c = s.cm, done = isHandled(c), digits = mobileDigits(c.mobile);
      return {name: c.name, time: h.fmt(c.created_at, true), statusLabel: done ? 'Handled' : 'New', sbg: done ? '#e4f4df' : '#fff0dc', scolor: done ? '#1d7a33' : '#b35a0e',
        mobile: digits.length === 10 ? '+91 ' + digits : (c.mobile || '—'), tel: digits ? 'tel:' + (digits.length === 10 ? '+91' : '') + digits : '', village: c.village_text || '—', message: c.message || '',
        toggleLabel: done ? 'Mark new' : 'Mark handled', toggleColor: done ? '#b35a0e' : '#1d7a33', toggle: () => toggleContact(h, c)};
    })() : null),
  };
}
