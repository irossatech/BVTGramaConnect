// New post (Posts page, "New post"; the app's Compose): category, language, title, message, who sees it (district,
// mandal or village, or everyone), an optional event date (kind, start, optional end; owner decision Q7), urgent,
// and up to 3 photos or one video (its length and first frame read in the
// browser). Saving creates the post, uploads each file (a retry carries on after the last file that went up) and
// submits it. Moved out of Console.tsx unchanged (audit WEB-ARCH-001). Calls /posts/ (.claude/api.md).
import type React from "react";
import type { Post } from "../types";
import type { ComposeForm, FieldChange } from "../model";
import type { ConsoleHost } from "./host";
import { newClientRef } from "../clientRef";
import { loadPosts } from "./posts";
import { loadCategories } from "./settings";

// ---- new post (the app's Compose) ----
// Up to 3 photos, or one video, never both (lead's decision of 2026-11-13, for everyone who posts);
// the video at most 60 MB and 60 seconds (lead's decision of 2026-11-14; banner videos have no
// time limit, logic/ads.ts). The same numbers as the server: MAX_PHOTOS_PER_POST, MAX_IMAGE_UPLOAD_MB,
// MAX_VIDEO_UPLOAD_MB and VIDEO_MAX_SECONDS. Change them together.
const CF_MAX_PHOTOS = 3;
const CF_MAX_MB = 10;
const CF_VIDEO_MAX_MB = 60;
const CF_VIDEO_MAX_S = 60;

function openCompose(h: ConsoleHost) {
  const cats = h.state.categories.filter((c) => c.is_active);
  // Fresh every time the form opens (a quick request), so a category switched on meanwhile is there; the list
  // already loaded shows at once, and if the sign-in load has not come back yet the form picks the first on arrival.
  loadCategories(h);
  h.setState({cf: {cat: cats[0]?.key || '', title: '', body: '', d: '', m: '', v: '', urgent: false, evKind: '', evStart: '', evEnd: '', files: [], previews: [], kinds: [], durs: [], posters: [], checking: 0, saving: false, tried: false, step: '', clientRef: newClientRef(), postId: '', uploaded: 0, photoErr: ''}});
}

function closeCompose(h: ConsoleHost) {
  const f = h.state.cf;
  if (f && f.saving) return;
  f?.previews.forEach((u) => URL.revokeObjectURL(u));
  h.setState({cf: null});
}

// The post's language, read from its text: any Telugu letter makes it Telugu (as the server's translation reads it).
function cfLang(f: ComposeForm): 'te' | 'en' {
  return /[\u0C00-\u0C7F]/.test(f.title + f.body) ? 'te' : 'en';
}

// A counter only near the limit; until then it is noise.
const nearLimit = (n: number, max: number) => n >= max * 0.8 ? n + ' / ' + max : '';

// The optional event's kinds (backend EventKind, contract section 1), labelled as the post panel shows them.
const EVENT_KINDS: readonly (readonly [string, string])[] = [['deadline', 'Deadline'], ['camp', 'Camp'], ['distribution', 'Distribution'], ['closure', 'Closure'], ['meeting', 'Meeting']];

// Today in India (the server's dates are IST), as YYYY-MM-DD for the date fields' min.
const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

type CFField = 'cat' | 'title' | 'body' | 'evStart' | 'evEnd';

function cfErrors(f: ComposeForm): Partial<Record<CFField, string>> {
  const e: Partial<Record<CFField, string>> = {};
  if (!f.cat) e.cat = 'Choose a category.';
  if (!f.title.trim()) e.title = 'Write a title.';
  if (!f.body.trim()) e.body = 'Write the message.';
  if (f.evKind && !f.evStart) e.evStart = 'Choose the date.';
  // YYYY-MM-DD strings compare as dates.
  if (f.evKind && f.evStart && f.evEnd && f.evEnd < f.evStart) e.evEnd = 'The end date cannot be before the start date.';
  return e;
}

/** The post's `event`, or null when no kind is chosen (contract: `{kind, start_date, end_date}`). */
function cfEvent(f: ComposeForm) {
  return f.evKind && f.evStart ? {kind: f.evKind, start_date: f.evStart, end_date: f.evEnd || null} : null;
}

function onCF(h: ConsoleHost, e: FieldChange) {
  const {name, value} = e.target;
  if (name === 'm' && value) void h.loadVillages(value); // the Village menu lists this mandal's villages
  h.setState((st) => {
    if (!st.cf) return null;
    const p: Partial<ComposeForm> = name === 'd' ? {d: value, m: '', v: ''} : name === 'm' ? {m: value, v: ''} : {[name]: value};
    return {cf: {...st.cf, ...p}};
  });
}

/** Add one file to the form, at the end. */
function addCFItem(h: ConsoleHost, file: File, kind: 'image' | 'video', url: string, dur: number, poster: Blob | null, err = '') {
  h.setState((st) => {
    const f = st.cf;
    if (!f) {
      URL.revokeObjectURL(url);
      return null;
    }
    return {cf: {...f, files: [...f.files, file], previews: [...f.previews, url], kinds: [...f.kinds, kind], durs: [...f.durs, dur], posters: [...f.posters, poster], photoErr: err || f.photoErr}};
  });
}

/** A video's length and first frame, read in the browser. Null when the browser cannot play it. */
function readVideo(url: string): Promise<{secs: number; poster: Blob | null} | null> {
  return new Promise((resolve) => {
    const probe = document.createElement('video');
    probe.preload = 'auto';
    probe.muted = true;
    let secs = 0;
    // A browser that never seeks still gets an answer: the length without a poster.
    setTimeout(() => resolve(secs > 0 ? {secs, poster: null} : null), 8000);
    const posterNow = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = probe.videoWidth;
        canvas.height = probe.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx || !canvas.width || !canvas.height) return resolve({secs, poster: null});
        ctx.drawImage(probe, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve({secs, poster: blob}), 'image/jpeg', 0.85);
      } catch {
        resolve({secs, poster: null});
      }
    };
    probe.onloadedmetadata = () => {
      secs = probe.duration;
      if (!isFinite(secs) || secs <= 0) return resolve(null);
      probe.currentTime = Math.min(1, secs / 2); // the first second, as the server's poster
    };
    probe.onseeked = posterNow;
    probe.onerror = () => resolve(secs > 0 ? {secs, poster: null} : null);
    probe.src = url;
  });
}

// Up to 3 photos, or one video, never both. Photos are added at once; a video after its length and
// first frame are read (sent as duration_s and poster for a server without ffmpeg); one over
// 60 seconds is refused here (the server allows half a second of slack, as here).
function pickCFMedia(h: ConsoleHost, e: React.ChangeEvent<HTMLInputElement>) {
  const f = h.state.cf;
  const picked = Array.from(e.target.files || []);
  e.target.value = '';
  if (!f || !picked.length) return;
  const setErr = (photoErr: string) => h.setState((st) => st.cf ? {cf: {...st.cf, photoErr}} : null);
  const isPhoto = (x: File) => /^image\/(jpeg|png|webp)$/.test(x.type);
  const isVideo = (x: File) => /^video\/(mp4|quicktime)$/.test(x.type);
  const both = 'A post has up to ' + CF_MAX_PHOTOS + ' photos or one video, not both.';
  if (f.kinds.includes('video') || f.checking) return setErr(both + ' Remove the video first.');
  if (picked.some((x) => !isPhoto(x) && !isVideo(x))) return setErr('Choose JPG, PNG or WebP photos, or an MP4 or MOV video.');
  const videos = picked.filter(isVideo), photos = picked.filter(isPhoto);
  if (videos.length) {
    if (photos.length || f.files.length) return setErr(both + (f.files.length ? ' Remove the photos first.' : ''));
    if (videos.length > 1) return setErr('A post can have one video.');
    const file = videos[0];
    if (file.size > CF_VIDEO_MAX_MB * 1024 * 1024) return setErr(file.name + ' is larger than ' + CF_VIDEO_MAX_MB + ' MB.');
    const url = URL.createObjectURL(file);
    h.setState({cf: {...f, photoErr: '', checking: 1}});
    readVideo(url).then((read) => {
      h.setState((st) => st.cf ? {cf: {...st.cf, checking: 0}} : null);
      if (!read) {
        URL.revokeObjectURL(url);
        return setErr(file.name + ' could not be read. Try an MP4 file.');
      }
      if (read.secs > CF_VIDEO_MAX_S + 0.5) {
        URL.revokeObjectURL(url);
        return setErr(file.name + ' is longer than ' + CF_VIDEO_MAX_S + ' seconds.');
      }
      addCFItem(h, file, 'video', url, Math.round(read.secs), read.poster);
    });
    return;
  }
  const room = Math.max(0, CF_MAX_PHOTOS - f.files.length);
  const small = photos.filter((x) => x.size <= CF_MAX_MB * 1024 * 1024);
  const added = small.slice(0, room);
  const err = small.length < photos.length ? 'Photos larger than ' + CF_MAX_MB + ' MB were not added.'
    : added.length < small.length ? 'Up to ' + CF_MAX_PHOTOS + ' photos per post.' : '';
  h.setState({cf: {...f, photoErr: err}});
  added.forEach((x) => addCFItem(h, x, 'image', URL.createObjectURL(x), 0, null));
}

function removeCFPhoto(h: ConsoleHost, i: number) {
  const f = h.state.cf;
  if (!f || f.saving) return;
  URL.revokeObjectURL(f.previews[i]);
  const keep = (_: unknown, k: number) => k !== i;
  h.setState({cf: {...f, files: f.files.filter(keep), previews: f.previews.filter(keep), kinds: f.kinds.filter(keep), durs: f.durs.filter(keep), posters: f.posters.filter(keep), photoErr: ''}});
}

function saveCompose(h: ConsoleHost) {
  const f = h.state.cf;
  if (!f || f.saving) return;
  if (Object.keys(cfErrors(f)).length) {
    h.setState({cf: {...f, tried: true}});
    return;
  }
  const st = h.state.stateRow;
  const target = f.v ? {level: 'VILLAGE', id: Number(f.v)} : f.m ? {level: 'MANDAL', id: Number(f.m)} : f.d ? {level: 'DISTRICT', id: Number(f.d)} : st ? {level: 'STATE', id: st.id} : null;
  if (!target) {
    h.toast('Areas are still loading. Try again in a moment.', '#b3261e');
    return;
  }
  if (f.checking) {
    h.toast('A video is still being checked. Try again in a moment.', '#b3261e');
    return;
  }
  const setF = (p: Partial<ComposeForm>) => h.setState((x) => ({cf: x.cf && {...x.cf, ...p}}));
  const count = f.files.length;
  setF({saving: true, step: 'Saving…'});
  const created: Promise<Post> = f.postId
    ? Promise.resolve({id: f.postId} as Post)
    : h.api.post<Post>('/posts/', {category: f.cat, language: cfLang(f), title: f.title.trim(), body: f.body.trim(), targets: [target], event: cfEvent(f), is_urgent: f.urgent, submit: !count, client_ref: f.clientRef});
  created.then(async (p) => {
    if (!count) return p;
    setF({postId: p.id});
    // One file per request, in the order picked; each goes after those already on the post.
    for (let i = h.state.cf?.uploaded || 0; i < count; i++) {
      const video = f.kinds[i] === 'video';
      setF({step: 'Uploading ' + (video ? 'video' : 'photo') + ' ' + (i + 1) + ' of ' + count + '…'});
      const form = new FormData();
      form.append('kind', f.kinds[i]);
      form.append('file', f.files[i]);
      if (video) {
        // Used only by a server without ffmpeg; one with it measures and cuts its own poster.
        if (f.durs[i]) form.append('duration_s', String(f.durs[i]));
        const poster = f.posters[i];
        if (poster) form.append('poster', poster, 'poster.jpg');
      }
      await h.api.upload('/posts/' + p.id + '/media/', form);
      setF({uploaded: i + 1});
    }
    setF({step: 'Publishing…'});
    return h.api.post<Post>('/posts/' + p.id + '/submit/');
  }).then((p) => {
    f.previews.forEach((u) => URL.revokeObjectURL(u));
    h.setState({cf: null});
    h.toast(p && p.status === 'PUBLISHED' ? 'Post published' : 'Post sent for review');
    if (h.state.page === 'posts') loadPosts(h, 1);
  }).catch((e: unknown) => {
    setF({saving: false, step: ''});
    h.fail(e);
  });
}

/** The New post button's and form's renderVals() values (screens/Posts.tsx; panels/ComposeForm.tsx). */
export function composeView(h: ConsoleHost) {
  const s = h.state;
  return {
    canCompose: h.can('posts.create_post') && s.me?.capabilities?.can_post !== false, openCompose: () => openCompose(h),
    cfShow: !!s.cf, closeCF: () => closeCompose(h), onCF: (e: FieldChange) => onCF(h, e), pickCFPhotos: (e: React.ChangeEvent<HTMLInputElement>) => pickCFMedia(h, e), saveCF: () => saveCompose(h),
    cf: s.cf ? (() => {
      const f = s.cf;
      const err = f.tried ? cfErrors(f) : {};
      const d = s.geo.find((x) => String(x.id) === f.d), m = d && d.mandals.find((x) => String(x.id) === f.m), vl = m && m.villages.find((x) => String(x.id) === f.v);
      return {
        cat: f.cat, lang: cfLang(f), title: f.title, body: f.body, d: f.d, m: f.m, v: f.v, urgent: f.urgent, saving: f.saving,
        catOpts: s.categories.filter((c) => c.is_active).map((c) => ({id: c.key, label: (c.name_en || c.key) + (c.name_te ? ' · ' + c.name_te : '')})),
        errCat: err.cat || '', errTitle: err.title || '', errBody: err.body || '',
        evKind: f.evKind, evStart: f.evStart, evEnd: f.evEnd, evMin: todayIST(), evEndMin: f.evStart || todayIST(),
        evOpts: EVENT_KINDS.map(([id, label]) => ({id, label})),
        errEvStart: err.evStart || '', errEvEnd: err.evEnd || '',
        titleCount: nearLimit(f.title.length, 150), bodyCount: nearLimit(f.body.length, 5000),
        photos: f.previews.map((src, i) => ({src, isVideo: f.kinds[i] === 'video', dur: f.durs[i] ? f.durs[i] + ' s' : '', remove: () => removeCFPhoto(h, i)})),
        canAddPhoto: !f.saving && !f.checking && !f.kinds.includes('video') && f.files.length < CF_MAX_PHOTOS,
        photoErr: f.photoErr,
        // With photos already there only photos can be added; an empty form takes either.
        accept: f.files.length ? 'image/jpeg,image/png,image/webp' : 'image/jpeg,image/png,image/webp,video/mp4,video/quicktime',
        addLabel: f.files.length ? 'Add photo' : 'Add photo or video',
        mediaHelp: f.checking ? 'Checking the video…' : 'Up to ' + CF_MAX_PHOTOS + ' photos, or 1 video up to ' + CF_VIDEO_MAX_S + ' seconds.',
        toggleUrgent: () => h.setState((x) => x.cf ? {cf: {...x.cf, urgent: !x.cf.urgent}} : null),
        showM: !!d, showV: !!m,
        where: vl ? 'Only ' + vl.name + ' village' : m ? 'All villages in ' + m.name + ' mandal' : d ? 'All villages in ' + d.name + ' district' : 'Every village',
        dOpts: s.geo.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})), mOpts: d ? d.mandals.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : [], vOpts: m ? m.villages.filter((x) => x.active).map((x) => ({id: String(x.id), label: x.name})) : [],
        saveLabel: f.saving ? f.step || 'Saving…' : f.postId ? 'Retry' : 'Publish',
      };
    })() : null,
  };
}
