// Super Admin console, ported from the approved prototype "Super Admin Console.dc.html"
// with the documented additions. The logic class holds all behaviour; render() is the template as JSX.
// Keep render() bound to the same renderVals() keys; map API data into those shapes in the logic.
import React from "react";
import { I, css, list, val } from "../lib/dc";
import * as ds from "./ds";
import GC_API from "../lib/console-api";

export default class Component extends React.Component {
  static ICON={contact:'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 6l-10 7L2 6',dashboard:'M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z',geography:'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',users:'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',posts:'M4 4h13a3 3 0 0 1 3 3v12H5a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1zm3 4h6M7 12h6M7 16h4M16 8h1M16 12h1',reports:'M3 20h18M6 17V10M11 17V4M16 17v-7M21 17v-4',audit:'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 8h6m-6 4h4',settings:'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7.4-3a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.5 7.5 0 0 0-1.7-1L14.8 3H9.2l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.4L4.7 11a7.4 7.4 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h5.6l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z'};
  static STATUS={Pending:{bg:'#fff0dc',color:'#b35a0e',label:'Pending'},Published:{bg:'#e4f4df',color:'#1d7a33',label:'Published'},Recheck:{bg:'#f1e6f7',color:'#8f4bb4',label:'Recheck'},Discarded:{bg:'#eef2f6',color:'#3b4a5c',label:'Discarded'},TakenDown:{bg:'#fde7e5',color:'#b3261e',label:'Taken down'},Draft:{bg:'#eef2f6',color:'#6b7a8c',label:'Draft'}};
  static ROLE={super:{label:'Super Admin',bg:'#0A2550',tbg:'#e3f0fb',tc:'#0D3B7A'},district:{label:'District Admin',bg:'#0D3B7A',tbg:'#e3f0fb',tc:'#0D3B7A'},mandal:{label:'Mandal Admin',bg:'#07818e',tbg:'#dff3f5',tc:'#07818e'},village:{label:'Village Admin',bg:'#1F8A3B',tbg:'#e4f4df',tc:'#1d7a33'},panchayat:{label:'Panchayat Member',bg:'#E9791E',tbg:'#fff0dc',tc:'#b35a0e'},system:{label:'System',bg:'#6b7a8c',tbg:'#eef2f6',tc:'#3b4a5c'}};
  static CATL={announce:'Announcements',schemes:'Govt Schemes',news:'News & Notices',updates:'Public Updates'};
  // API values -> the prototype's keys
  static RK={SUPER_ADMIN:'super',DISTRICT_ADMIN:'district',MANDAL_ADMIN:'mandal',VILLAGE_ADMIN:'village',PANCHAYAT_MEMBER:'panchayat',SYSTEM:'system'};
  static RAPI={district:'DISTRICT_ADMIN',mandal:'MANDAL_ADMIN',village:'VILLAGE_ADMIN',panchayat:'PANCHAYAT_MEMBER'};
  static SK={PENDING:'Pending',PUBLISHED:'Published',RECHECK:'Recheck',DISCARDED:'Discarded',UNPUBLISHED:'TakenDown',DRAFT:'Draft'};
  static SAPI={Pending:'PENDING',Published:'PUBLISHED',Recheck:'RECHECK',Discarded:'DISCARDED',TakenDown:'UNPUBLISHED'};
  static LEVEL_OF_ROLE={district:'DISTRICT',mandal:'MANDAL',village:'VILLAGE',panchayat:'VILLAGE'};
  static HIST={SUBMIT:'Submitted for review',RESUBMIT:'Resubmitted',PUBLISH:'Published',AUTO_PUBLISH:'Published directly (admin post)',RECHECK:'Sent back for recheck',DISCARD:'Discarded',UNPUBLISH:'Taken down',ESCALATE:'Escalated'};
  static ACT={'post.created':'created post','post.updated':'edited post','post.deleted':'deleted draft','post.urgent_set':'marked post urgent','post.urgent_cleared':'removed urgent mark','user.updated':'edited user','user.password_changed':'changed password','user.password_reset':'reset password','setting.role_password_changed':'changed a default password','email.failed':'email not delivered','email.skipped':'email skipped','contact.handled':'handled contact message','contact.reopened':'reopened contact message','auth.login':'logged in','auth.logout':'logged out','auth.login_failed':'failed login','auth.locked_out':'locked out after failed logins','user.unlocked':'unlocked user','user.password_set':'set a temporary password','group.permissions_changed':'changed group permissions','post.submitted':'submitted post','post.resubmitted':'resubmitted post','post.published':'published post','post.auto_published':'published post','post.recheck':'sent for recheck','post.discarded':'discarded post','post.unpublished':'took down post','post.reversed':'overrode decision','post.overridden':'overrode decision','post.escalated':'escalated post','user.created':'added user','user.blocked':'blocked user','user.unblocked':'unblocked user','user.reassigned':'reassigned user','user.assignment_added':'added role','user.assignment_removed':'removed role','area.created':'added area','area.updated':'edited area','area.deactivated':'deactivated area','area.reactivated':'reactivated area','area.imported':'imported villages','category.created':'added category','category.updated':'changed category','setting.changed':'changed setting','template.updated':'edited template','report.exported':'exported report','push.failed':'push failed'};
  static EVENT={deadline:['Deadline','#fff0dc','#b35a0e'],camp:['Camp','#e4f4df','#1d7a33'],distribution:['Distribution','#e3f0fb','#0D3B7A'],closure:['Closure','#eef2f6','#3b4a5c'],meeting:['Meeting','#f1e6f7','#8f4bb4']};
  static PAGE=20;
  static PAGES=['dashboard','geography','users','posts','reports','audit','contact','settings'];
  // A page shows when the user has any one of these permissions (BackEnd apps/accounts/role_matrix.py).
  static NAV_PERM={dashboard:['web_admin.view_dashboard'],geography:['geography.manage_master_data'],users:['accounts.manage_district_admin','accounts.manage_mandal_admin','accounts.manage_village_admin','accounts.manage_panchayat_member'],posts:['posts.view_review_queue'],reports:['web_admin.view_reports'],audit:['audit.view_audit_log'],contact:['web_public.manage_contact_messages'],settings:['posts.manage_settings','posts.manage_categories','notifications.manage_templates']};
  static MANAGE={district:'accounts.manage_district_admin',mandal:'accounts.manage_mandal_admin',village:'accounts.manage_village_admin',panchayat:'accounts.manage_panchayat_member'};
  static CONSOLE_PERM='web_admin.access_web_console';
  static LOGIN_ERR={invalid_credentials:'Wrong username or password.',not_console_user:'This console is for Super Admins only. Use the mobile app.',account_blocked:'This account is blocked. Contact your administrator.'};

  state={screen:'login',page:'dashboard',username:'',password:'',cpCurrent:'',cpNext:'',cpVoluntary:false,menuOpen:false,gsearch:'',me:null,
    geo:[],stateRow:null,expanded:{},geoForm:null,
    users:[],userCount:0,userPage:1,userPages:1,usersLoading:false,uf:{role:'',district:'',status:'',q:''},
    posts:[],postCount:0,postPage:1,postPages:1,postsLoading:false,statusCounts:{},pendingCount:0,pf:{district:'',cat:''},statusTab:'Pending',
    panel:null,panelPost:null,panelHistory:[],panelUser:null,panelUserPosts:[],drawerOpen:false,nu:{name:'',te:'',email:'',username:'',mobile:'',password:'',role:'panchayat',area:''},
    audit:[],auditCount:0,auditPage:1,auditPages:1,auditQ:'',auditLoading:false,
    contacts:[],contactCount:0,contactPage:1,contactPages:1,contactQ:'',contactFilter:'new',contactLoading:false,
    dash:null,reports:{byArea:[],reviewTime:[],activity:[]},categories:[],
    settings:{escalation:24,cats:[],langs:{te:true,en:true},templates:[]},
    newCat:{te:'',en:''},modal:null,modalText:'',modalSel:'',modalGen:'',toasts:[]};

  get api(){return GC_API}
  componentDidMount(){
    // A console reload keeps the Django session (HttpOnly sessionid cookie).
    this.api.start().then(me=>this.afterLogin(me,true)).catch(()=>{});
  }
  componentWillUnmount(){(this._tt||[]).forEach(clearTimeout);clearTimeout(this._ct);clearTimeout(this._qt);clearTimeout(this._at);clearTimeout(this._gt)}
  toast(text,dot){const id=Date.now()+Math.random();this.setState(s=>({toasts:[...s.toasts,{id,text,dot:dot||'#6cc04a'}]}));this._tt=this._tt||[];this._tt.push(setTimeout(()=>this.setState(s=>({toasts:s.toasts.filter(t=>t.id!==id)})),2600))}
  fail(e){
    if(e&&e.code==='password_change_required'){this.setState({screen:'change_password',cpVoluntary:false,cpCurrent:'',cpNext:'',menuOpen:false,panel:null,drawerOpen:false});this.toast('Choose a new password first.','#E9791E');return}
    if(e&&e.status===401&&this.state.screen!=='login'){this.setState({screen:'login',me:null,menuOpen:false,panel:null,drawerOpen:false,cpVoluntary:false,cpCurrent:'',cpNext:''});this.toast('Your session has ended. Log in again.','#E9791E');return}
    let text=(e&&e.message)||'Something went wrong. Try again.';
    const f=e&&e.body&&e.body.fields;if(f){const k=Object.keys(f)[0];const v=Array.isArray(f[k])?f[k][0]:f[k];if(v&&typeof v==='string'&&!text.includes(v))text=text+' '+v}
    this.toast(text,'#b3261e')}
  goPage(p){this.setState({page:p,menuOpen:false,panel:null,drawerOpen:false});this.loadPage(p)}
  ask(m){this.setState({modal:m,modalText:m.preset||'',modalSel:m.options&&m.options.length?m.options[0].id:'',modalGen:''})}
  closeModal(){this.setState({modal:null,modalText:'',modalSel:'',modalGen:''})}

  // ---- permissions (from GET /me/; the server enforces every one) ----
  // "app_label.codename" strings from GET /me/ permissions. No list means no permissions.
  can(code,me){const p=(me||this.state.me||{}).permissions;return Array.isArray(p)&&p.includes(code)}
  canAny(list,me){return !list||!list.length||list.some(c=>this.can(c,me))}
  navOk(k,me){return this.canAny(Component.NAV_PERM[k],me)}
  userCan(u,a){return !u||!u.allowed||u.allowed.includes(a)}
  roleChoices(){return ['district','mandal','village','panchayat'].filter(k=>this.can(Component.MANAGE[k])).map(k=>({id:k,label:Component.ROLE[k].label}))}
  // A temporary password to hand over in person: 12 characters, no look-alikes, at least one lower, upper and digit.
  newPassword(){const sets=['abcdefghjkmnpqrstuvwxyz','ABCDEFGHJKLMNPQRSTUVWXYZ','23456789'];const all=sets.join('');const pick=(chars,n)=>{const r=new Uint32Array(n);crypto.getRandomValues(r);return Array.from(r,x=>chars[x%chars.length])};const out=[...sets.map(c=>pick(c,1)[0]),...pick(all,9)];const r=new Uint32Array(out.length);crypto.getRandomValues(r);for(let i=out.length-1;i>0;i--){const j=r[i]%(i+1);[out[i],out[j]]=[out[j],out[i]]}return out.join('')}
  showSecret(name,secret){this.ask({title:'Temporary password · '+name,body:'Shown only this once. Give it to '+name+' in person. They choose their own password when they first log in.',secret,confirmLabel:'Done',noCancel:true,bg:'#0D3B7A',onConfirm:()=>{}})}
  copySecret(){const v=this.state.modal&&this.state.modal.secret;if(!v)return;const ok=()=>this.toast('Copied');(navigator.clipboard&&window.isSecureContext?navigator.clipboard.writeText(v):Promise.reject()).then(ok).catch(()=>{const t=document.createElement('textarea');t.value=v;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();try{document.execCommand('copy');ok()}catch(e){this.toast('Select the password and copy it','#E9791E')}t.remove()})}

  // ---- formatting ----
  fmt(iso,withYear){if(!iso)return '—';const d=new Date(iso);const o={day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Kolkata'};if(withYear!==false)o.year='numeric';return new Intl.DateTimeFormat('en-GB',o).format(d).replace(',','')}
  dayKey(d){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata'}).format(d)}
  fmtLast(iso){if(!iso)return 'Never';const d=new Date(iso),now=new Date();const t=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Asia/Kolkata'}).format(d);if(this.dayKey(d)===this.dayKey(now))return 'Today '+t;if(this.dayKey(d)===this.dayKey(new Date(now-864e5)))return 'Yesterday '+t;return this.fmt(iso,false)}
  te(ref){return ref?(this._te||{})[ref.level+':'+ref.id]||'':''}
  an(ref){if(!ref)return '';const t=this.te(ref);return ref.name+(t&&t!==ref.name?' · '+t:'')}
  pathParts(area){const parts=(area&&area.path?area.path.split(' · '):[]);const lv=area&&area.level;const r={district:null,mandal:null,village:null};if(lv==='VILLAGE'){r.village=parts[0];r.mandal=parts[1];r.district=parts[2]}else if(lv==='MANDAL'){r.mandal=parts[0];r.district=parts[1]}else if(lv==='DISTRICT'){r.district=parts[0]}return r}

  // ---- auth (username + password, Django session for the console) ----
  enter(me){const page=Component.PAGES.find(k=>this.navOk(k,me))||'dashboard';this.setState({me,screen:'app',page,password:'',cpCurrent:'',cpNext:'',cpVoluntary:false});this.loadGeo();this.loadCategories();this.loadPage(page)}
  afterLogin(me,quiet){if(!this.can(Component.CONSOLE_PERM,me)){this.api.logout();this.setState({screen:'login',me:null,password:''});if(!quiet)this.toast(Component.LOGIN_ERR.not_console_user,'#b3261e');return false}
    if(me.must_change_password){this.setState({me,screen:'change_password',cpVoluntary:false,password:'',cpCurrent:'',cpNext:''});return false}this.enter(me);return true}
  signIn(){const s=this.state;if(!s.username.trim()||!s.password)return;this.api.login(s.username.trim(),s.password).then(d=>{const me=(d&&d.user)||d;if(this.afterLogin(me))this.toast('Welcome, '+me.name)}).catch(e=>{this.setState({password:''});this.loginFail(e)})}
  loginFail(e){const c=e&&e.code,L=Component.LOGIN_ERR;if(c==='locked_out'){const sec=Number((e.body||{}).retry_after_s)||900;const min=Math.max(1,Math.ceil(sec/60));this.toast('Too many failed attempts. Try again in '+min+' minute'+(min===1?'':'s')+'.','#b3261e');return}if(L[c]){this.toast(L[c],'#b3261e');return}this.fail(e)}
  openChangePassword(){this.setState({screen:'change_password',cpVoluntary:true,menuOpen:false,cpCurrent:'',cpNext:''})}
  changePassword(){const s=this.state;if(!s.cpCurrent||!s.cpNext)return;const vol=s.cpVoluntary;this.api.post('/auth/password/change/',{current_password:s.cpCurrent,new_password:s.cpNext}).then(()=>this.api.get('/me/')).then(me=>{if(vol)this.setState({me,screen:'app',cpCurrent:'',cpNext:'',cpVoluntary:false});else this.enter(me);this.toast(vol?'Password changed · your other sessions are signed out':'Password changed')}).catch(e=>{this.setState({cpCurrent:'',cpNext:''});this.fail(e)})}
  logout(){this.api.logout().finally(()=>{this.setState({screen:'login',menuOpen:false,panel:null,drawerOpen:false,modal:null,username:'',password:'',cpCurrent:'',cpNext:'',cpVoluntary:false,me:null});this.toast('Signed out')})}

  // ---- loading ----
  loadPage(p){if(p==='dashboard')this.loadDash();if(p==='users')this.loadUsers(1);if(p==='posts')this.loadPosts(1);if(p==='audit')this.loadAudit(1);if(p==='contact')this.loadContacts(1);if(p==='reports')this.loadReports();if(p==='settings')this.loadSettings();if(p==='geography')this.loadGeo()}
  loadGeo(){return this.api.get('/geo/tree/',{villages:1}).then(tree=>{const st=tree[0]||null;const teMap={};const geo=(st?st.districts:[]).map(d=>{teMap['DISTRICT:'+d.id]=d.name_te;return {id:d.id,name:d.name_en,te:d.name_te,active:d.is_active,mandals:d.mandals.map(m=>{teMap['MANDAL:'+m.id]=m.name_te;return {id:m.id,name:m.name_en,te:m.name_te,active:m.is_active,villages:(m.villages||[]).map(v=>{teMap['VILLAGE:'+v.id]=v.name_te;return {id:v.id,name:v.name_en,te:v.name_te,lat:v.latitude||'',lng:v.longitude||'',pin:v.pin_code||'',active:v.is_active}})}})}});if(st)teMap['STATE:'+st.id]=st.name_te;this._te=teMap;const expanded={...this.state.expanded};if(geo[0]&&!Object.keys(expanded).length){expanded[geo[0].id]=true;if(geo[0].mandals[0])expanded['m'+geo[0].mandals[0].id]=true}this.setState({geo,stateRow:st,expanded})}).catch(e=>this.fail(e))}
  loadCategories(){return this.api.get('/admin/categories/').then(d=>{const list=Array.isArray(d)?d:(d.results||[]);this.setState({categories:list})}).catch(()=>{})}
  loadDash(){this.api.get('/admin/dashboard/').then(dash=>this.setState({dash,pendingCount:dash.kpis.pending})).catch(e=>this.fail(e))}
  adaptUser(u){const ras=(u.role_assignments||[]).filter(r=>r.is_active!==false);const ra=ras[0]||null;const role=ra?(Component.RK[ra.role]||'panchayat'):'panchayat';const parts=this.pathParts(ra&&ra.area);return {id:u.id,name:u.name,te:u.name_te||u.name,mobile:u.mobile||'',email:u.email||'',username:u.username||'',role,district:parts.district,mandal:parts.mandal,village:parts.village,area:ra?ra.area:null,raId:ra?ra.id:null,ras,active:u.is_active!==undefined?!!u.is_active:u.status==='ACTIVE',locked:!!u.locked_out,allowed:Array.isArray(u.allowed_actions)?u.allowed_actions:null,last:this.fmtLast(u.last_login_at)}}
  loadUsers(page){const uf=this.state.uf;this.setState({usersLoading:true});this.api.get('/users/',{role:uf.role?Component.RAPI[uf.role]:'',district:uf.district,status:uf.status?uf.status.toUpperCase():'',is_active:uf.status?String(uf.status==='active'):'',q:uf.q,page,page_size:Component.PAGE}).then(d=>this.setState({users:d.results.map(u=>this.adaptUser(u)),userCount:d.count,userPage:page,userPages:Math.max(1,Math.ceil(d.count/Component.PAGE)),usersLoading:false})).catch(e=>{this.setState({usersLoading:false});this.fail(e)})}
  adaptPost(p){const a=p.author||{};const role=Component.RK[a.role]||'panchayat';return {id:p.id,raw:p,cat:p.category?p.category.key:'updates',catLabel:p.category?p.category.name:'',titleTe:p.title,titleEn:p.translation?p.translation.title:'',bodyTe:p.body,bodyEn:p.translation?p.translation.body:'',area:this.an(p.target_area),areaName:p.target_area?p.target_area.name:'',date:this.fmt(p.submitted_at||p.published_at||p.created_at),author:a.name||'—',authorId:a.id,role,status:Component.SK[p.status]||'Pending',media:(p.media||[]).filter(m=>m.kind!=='video'),videos:(p.media||[]).filter(m=>m.kind==='video'),urgent:!!p.is_urgent,event:p.event||null,allowed:p.allowed_actions||[],escalated:p.escalated}}
  postQuery(page){const s=this.state;return {status:s.statusTab==='All'?'':Component.SAPI[s.statusTab],district:s.pf.district,category:s.pf.cat,q:s.gsearch,page,page_size:Component.PAGE}}
  loadPosts(page){this.setState({postsLoading:true});this.api.get('/posts/',this.postQuery(page)).then(d=>this.setState({posts:d.results.map(p=>this.adaptPost(p)),postCount:d.count,postPage:page,postPages:Math.max(1,Math.ceil(d.count/Component.PAGE)),statusCounts:d.status_counts||{},pendingCount:(d.status_counts||{}).PENDING||0,postsLoading:false})).catch(e=>{this.setState({postsLoading:false});this.fail(e)})}
  loadAudit(page){this.setState({auditLoading:true});this.api.get('/audit/',{q:this.state.auditQ,page,page_size:Component.PAGE}).then(d=>this.setState({audit:d.results,auditCount:d.count,auditPage:page,auditPages:Math.max(1,Math.ceil(d.count/Component.PAGE)),auditLoading:false})).catch(e=>{this.setState({auditLoading:false});this.fail(e)})}
  loadContacts(page){const s=this.state;this.setState({contactLoading:true});this.api.get('/admin/contact-messages/',{status:s.contactFilter==='all'?'':s.contactFilter,q:s.contactQ,page,page_size:Component.PAGE}).then(d=>this.setState({contacts:d.results||[],contactCount:d.count||0,contactPage:page,contactPages:Math.max(1,Math.ceil((d.count||0)/Component.PAGE)),contactLoading:false})).catch(e=>{this.setState({contactLoading:false,contacts:[],contactCount:0});this.fail(e)})}
  isHandled(c){return c.status?String(c.status).toUpperCase()==='HANDLED':!!c.handled}
  toggleContact(c){const done=!this.isHandled(c);this.api.patch('/admin/contact-messages/'+c.id+'/',{handled:done}).then(()=>{this.toast(done?'Marked handled':'Marked new',done?'#6cc04a':'#E9791E');this.loadContacts(this.state.contactPage)}).catch(e=>this.fail(e))}
  humanAction(k){const p=String(k||'').split('.');return (p[1]||p[0]).replace(/_/g,' ')}
  loadReports(){Promise.all([this.api.get('/admin/reports/posts-by-area/'),this.api.get('/admin/reports/review-time/'),this.api.get('/admin/reports/admin-activity/',{page_size:8})]).then(([byArea,reviewTime,activity])=>this.setState({reports:{byArea,reviewTime,activity:activity.results}})).catch(e=>this.fail(e))}
  loadSettings(){this.loadCategories();this.api.get('/admin/settings/').then(st=>this.setState(s=>({settings:{...s.settings,escalation:st.review_escalation_hours,langs:{te:true,en:!!(st.languages||{}).en}}}))).catch(e=>this.fail(e));this.api.get('/admin/notification-templates/').then(d=>{const list=Array.isArray(d)?d:(d.results||[]);this.setState(s=>({settings:{...s.settings,templates:list}}))}).catch(()=>{})}
  openPost(p){this.setState({panel:{type:'post',id:p.id},panelPost:p,panelHistory:[]});this.api.get('/posts/'+p.id+'/history/').then(h=>{if(this.state.panel&&this.state.panel.id===p.id)this.setState({panelHistory:h})}).catch(()=>{})}
  refreshPost(id){return this.api.get('/posts/'+id+'/').then(p=>{const ap=this.adaptPost(p);this.setState(s=>({panelPost:s.panel&&s.panel.id===id?ap:s.panelPost,posts:s.posts.map(x=>x.id===id?ap:x)}));return this.api.get('/posts/'+id+'/history/').then(h=>{if(this.state.panel&&this.state.panel.id===id)this.setState({panelHistory:h})})}).catch(()=>{})}
  openUser(u){this.setState({panel:{type:'user',id:u.id},panelUser:u,panelUserPosts:[]});this.api.get('/posts/',{author:u.id,page_size:5}).then(d=>this.setState({panelUserPosts:d.results.map(p=>this.adaptPost(p))})).catch(()=>{})}

  // ---- posts actions ----
  review(p,body,done,err){this.api.post('/posts/'+p.id+'/review/',body).then(()=>{done();this.loadPosts(this.state.postPage);this.refreshPost(p.id)}).catch(e=>{
    if(e&&e.code==='already_decided'){const b=e.body||{};const who=b.decided_by?(b.decided_by.name+' ('+((Component.ROLE[Component.RK[b.decided_by.role]]||{}).label||b.decided_by.role)+')'):'another reviewer';this.toast('Already decided by '+who+'. Showing the latest status.','#E9791E');this.loadPosts(this.state.postPage);this.refreshPost(p.id);return}
    this.fail(e)})}
  postAction(kind,p){if(kind==='urgent')return this.urgentPost(p);const title=p.titleTe;const area=p.areaName;const C=Component;
    if(kind==='publish')this.ask({title:'Publish post',body:'Publish "'+title+'" to citizens in '+area+'? This overrides the local review queue.',confirmLabel:'Publish',bg:'#1F8A3B',onConfirm:()=>this.review(p,{action:'publish'},()=>this.toast('Post published'))});
    if(kind==='recheck')this.ask({title:'Send for recheck',body:'The author will see your comment and can edit and resubmit.',needsText:true,textLabel:'Comment to author (required)',confirmLabel:'Send for recheck',bg:'#E9791E',onConfirm:t=>this.review(p,{action:'recheck',comment:t},()=>this.toast('Sent back for recheck','#E9791E'))});
    if(kind==='discard')this.ask({title:'Discard post',body:'The post will not be published. The author is notified with your reason.',needsText:true,textLabel:'Reason (required)',confirmLabel:'Discard',bg:'#3b4a5c',onConfirm:t=>this.review(p,{action:'discard',comment:t},()=>this.toast('Post discarded','#cfd8e3'))});
    if(kind==='takedown')this.ask({title:'Take down post',body:'Remove "'+title+'" from all citizen feeds immediately.',needsText:true,textLabel:'Reason (required)',confirmLabel:'Take down',bg:'#b3261e',onConfirm:t=>this.review(p,{action:'unpublish',comment:t},()=>this.toast('Post taken down','#E9791E'))});
    if(kind==='override')this.ask({title:'Override previous decision',body:'Current status: '+C.STATUS[p.status].label+'. Choose the new status and record why you are overriding the earlier reviewer.',hasSelect:true,selectLabel:'New status',options:[{id:'Published',label:'Published'},{id:'Pending',label:'Pending (back to queue)'},{id:'Recheck',label:'Recheck'},{id:'Discarded',label:'Discarded'}].filter(o=>o.id!==p.status),needsText:true,textLabel:'Override reason (required)',confirmLabel:'Override',bg:'#0D3B7A',onConfirm:(t,sel)=>this.review(p,{action:'reverse',to_status:C.SAPI[sel],comment:t},()=>this.toast('Decision overridden → '+C.STATUS[sel].label))})}

  urgentPost(p){const on=!p.urgent;this.api.post('/posts/'+p.id+'/urgent/',{is_urgent:on}).then(()=>{this.toast(on?'Marked urgent':'Urgent mark removed',on?'#E9791E':'#6cc04a');this.loadPosts(this.state.postPage);this.refreshPost(p.id)}).catch(e=>this.fail(e))}

  // ---- users actions ----
  areaOptions(role){const lv=Component.LEVEL_OF_ROLE[role];const g=this.state.geo;if(lv==='DISTRICT')return g.filter(d=>d.active).map(d=>({id:String(d.id),label:d.name+' · '+d.te,level:lv}));if(lv==='MANDAL')return g.flatMap(d=>d.mandals.filter(m=>m.active&&d.active).map(m=>({id:String(m.id),label:m.name+' · '+m.te,level:lv})));return g.flatMap(d=>d.mandals.flatMap(m=>m.villages.filter(v=>v.active&&m.active&&d.active).map(v=>({id:String(v.id),label:v.name+' · '+v.te,level:'VILLAGE'}))))}
  toggleUser(u){const R=Component.ROLE;this.ask({title:u.active?'Block user':'Unblock user',body:(u.active?'Block ':'Unblock ')+u.name+' ('+R[u.role].label+', '+(u.area?u.area.name:'—')+')? '+(u.active?'They will be signed out and cannot post or review.':'They regain access immediately.'),confirmLabel:u.active?'Block':'Unblock',bg:u.active?'#b3261e':'#1F8A3B',onConfirm:()=>this.api.post('/users/'+u.id+'/'+(u.active?'block':'unblock')+'/',{}).then(d=>{const nu=this.adaptUser(d&&d.user?d.user:d);this.setState(s=>({users:s.users.map(x=>x.id===u.id?nu:x),panelUser:s.panelUser&&s.panelUser.id===u.id?nu:s.panelUser}));this.toast(u.name+(u.active?' blocked':' unblocked'),u.active?'#E9791E':'#6cc04a')}).catch(e=>this.fail(e))})}
  reassignUser(u){const R=Component.ROLE;const opts=this.areaOptions(u.role);if(!u.raId){this.toast('This user has no role to move.','#E9791E');return}this.ask({title:'Reassign area',body:'Move '+u.name+' ('+R[u.role].label+') to a different '+(u.role==='district'?'district':u.role==='mandal'?'mandal':'village')+'. Their pending reviews stay with the old area.',hasSelect:true,selectLabel:'New area',options:opts,confirmLabel:'Reassign',bg:'#0D3B7A',onConfirm:(t,sel)=>{const o=opts.find(x=>x.id===sel)||opts[0];if(!o)return;this.api.patch('/users/'+u.id+'/role-assignments/'+u.raId+'/',{area:{level:o.level,id:Number(o.id)}}).then(()=>{this.toast(u.name+' reassigned to '+o.label.split(' · ')[0]);this.loadUsers(this.state.userPage);if(this.state.panel&&this.state.panel.type==='user')this.setState({panel:null})}).catch(e=>this.fail(e))}})}
  refreshUser(id){return this.api.get('/users/'+id+'/').then(x=>{const u=this.adaptUser(x);this.setState(s=>({panelUser:s.panel&&s.panel.id===id?u:s.panelUser}));this.loadUsers(this.state.userPage)}).catch(e=>this.fail(e))}
  addRole(u){const R=Component.ROLE;const roles=this.roleChoices();if(!roles.length){this.toast('You cannot add roles.','#E9791E');return}this.ask({title:'Add role',body:'Give '+u.name+' another role. They choose which role to use after login.',hasSelect:true,selectLabel:'Role',options:roles,confirmLabel:'Next',bg:'#0D3B7A',onConfirm:(t,role)=>{const opts=this.areaOptions(role);if(!opts.length){this.toast('Add areas in Geography first.','#E9791E');return}setTimeout(()=>this.ask({title:'Add role · '+R[role].label,body:'Choose the area for this role.',hasSelect:true,selectLabel:'Area',options:opts,confirmLabel:'Add role',bg:'#0D3B7A',onConfirm:(t2,areaId)=>{const o=opts.find(x=>x.id===areaId)||opts[0];this.api.post('/users/'+u.id+'/role-assignments/',{role:Component.RAPI[role],area:{level:o.level,id:Number(o.id)}}).then(()=>{this.toast('Role added · '+R[role].label+' · '+o.label);this.refreshUser(u.id)}).catch(e=>this.fail(e))}}),0)}})}
  removeRole(u,ra){const R=Component.ROLE;const label=(R[Component.RK[ra.role]]||{label:ra.role}).label;this.ask({title:'Remove role',body:'Remove '+label+' · '+(ra.area?ra.area.name:'')+' from '+u.name+'?'+((u.ras||[]).length<=1?' This is their only role: they will not be able to log in.':''),confirmLabel:'Remove',bg:'#b3261e',onConfirm:()=>this.api.del('/users/'+u.id+'/role-assignments/'+ra.id+'/').then(()=>{this.toast('Role removed','#E9791E');this.refreshUser(u.id)}).catch(e=>this.fail(e))})}
  resetPassword(u){this.ask({title:'Reset password',body:'Give '+u.name+' a new temporary password. They are signed out everywhere and must choose their own password at their next login.',hasInput:true,inputLabel:'Temporary password',inputPh:'Leave empty to generate one',confirmLabel:'Reset password',bg:'#0D3B7A',onConfirm:(t,sel,gen)=>{const pw=(t||'').trim();this.api.post('/users/'+u.id+'/reset-password/',pw?{password:pw}:{}).then(d=>{const temp=(d&&d.temporary_password)||(pw&&pw===gen?pw:'');if(temp)this.showSecret(u.name,temp);else this.toast('Password reset · '+u.name);this.refreshUser(u.id)}).catch(e=>this.fail(e))}})}
  unlockUser(u){this.ask({title:'Unlock login',body:u.name+' is locked out after too many wrong passwords. Unlock now so they can try again?',confirmLabel:'Unlock',bg:'#1F8A3B',onConfirm:()=>this.api.post('/users/'+u.id+'/unlock/',{}).then(()=>{this.toast(u.name+' unlocked');this.refreshUser(u.id)}).catch(e=>this.fail(e))})}
  nuValid(f){return !!(f.name.trim()&&f.username.trim()&&(!f.email.trim()||/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()))&&(!f.mobile||f.mobile.length===10))}
  saveNU(){const f=this.state.nu;if(!this.nuValid(f))return;const opts=this.areaOptions(f.role);const o=opts.find(x=>x.id===f.area)||opts[0];if(!o){this.toast('Add areas in Geography first.','#E9791E');return}
    const body={username:f.username.trim(),name:f.name.trim(),name_te:f.te.trim(),role:Component.RAPI[f.role],area:{level:o.level,id:Number(o.id)}};if(f.email.trim())body.email=f.email.trim();if(f.mobile)body.mobile=f.mobile;const pw=f.password.trim();if(pw)body.password=pw;const gen=this._nuGen;
    this.api.post('/users/',body).then(d=>{this._nuGen='';this.setState({drawerOpen:false,nu:{name:'',te:'',email:'',username:'',mobile:'',password:'',role:'panchayat',area:''}});const temp=(d&&d.temporary_password)||(pw&&pw===gen?pw:'');if(temp)this.showSecret(body.name,temp);else this.toast('User created · '+body.username);this.loadUsers(1)}).catch(e=>this.fail(e))}

  // ---- geography ----
  geoSave(){const f=this.state.geoForm;if(!f||!f.name.trim())return;const name=f.name.trim(),te=(f.te||'').trim();const base={name_en:name,name_te:te};let req;
    if(f.kind==='district')req=f.id?this.api.patch('/geo/districts/'+f.id+'/',base):this.api.post('/geo/districts/',{...base,state_id:this.state.stateRow&&this.state.stateRow.id});
    else if(f.kind==='mandal')req=f.id?this.api.patch('/geo/mandals/'+f.id+'/',base):this.api.post('/geo/mandals/',{...base,district_id:f.parentId});
    else{const v={...base,latitude:f.lat,longitude:f.lng,pin_code:f.pin||''};req=f.id?this.api.patch('/geo/villages/'+f.id+'/',v):this.api.post('/geo/villages/',{...v,mandal_id:f.parentId})}
    req.then(()=>{const ex={...this.state.expanded};if(f.parentKey)ex[f.parentKey]=true;this.setState({geoForm:null,expanded:ex});this.toast((f.id?'Updated ':'Added ')+f.kind+' · '+name);this.loadGeo()}).catch(e=>this.fail(e))}
  geoDeact(node){const next=!node.active;const path={district:'districts',mandal:'mandals',village:'villages'}[node.kind];this.ask({title:(next?'Reactivate ':'Deactivate ')+node.kind,body:(next?'Reactivate ':'Deactivate ')+node.name+'? '+(next?'It becomes selectable again for users and posts.':'Existing posts stay visible; no new users or posts can be assigned here'+(node.kind!=='village'?', including all areas under it.':'.')),confirmLabel:next?'Reactivate':'Deactivate',bg:next?'#1F8A3B':'#b3261e',onConfirm:()=>this.api.patch('/geo/'+path+'/'+node.id+'/',{is_active:next}).then(()=>{this.toast(node.name+(next?' reactivated':' deactivated'),next?'#6cc04a':'#E9791E');this.loadGeo()}).catch(e=>this.fail(e))})}
  importCsv(){const input=document.createElement('input');input.type='file';input.accept='.csv,text/csv';input.onchange=()=>{const file=input.files&&input.files[0];if(!file)return;const form=()=>{const fd=new FormData();fd.append('file',file);return fd};
    this.api.upload('/geo/villages/import/',form(),{dry_run:1}).then(r=>{const c=r.counts||{};const v=c.village||{created:0,updated:0,unchanged:0};const body=r.rows+' rows checked. Villages: '+v.created+' new, '+v.updated+' updated, '+v.unchanged+' unchanged.'+(r.missing_coordinates_count?' '+r.missing_coordinates_count+' without coordinates.':'')+(r.warnings&&r.warnings.length?' '+r.warnings.length+' warning(s).':'');
      this.ask({title:'Import villages',body,confirmLabel:'Import',bg:'#0D3B7A',onConfirm:()=>this.api.upload('/geo/villages/import/',form()).then(()=>{this.toast('Imported '+r.rows+' rows');this.loadGeo()}).catch(e=>this.fail(e))})}).catch(e=>{const rep=e&&e.body&&e.body.report;if(rep&&rep.errors&&rep.errors.length){this.ask({title:'File has errors',body:rep.errors.slice(0,5).join(' · ')+(rep.errors.length>5?' · and '+(rep.errors.length-5)+' more.':''),confirmLabel:'Close',bg:'#3b4a5c',onConfirm:()=>{}})}else this.fail(e)})};input.click()}

  // ---- exports ----
  exportCsv(){const s=this.state;const stamp=new Date().toISOString().slice(0,10);if(s.page==='audit')this.api.download('/audit/export/',{q:s.auditQ},'grama-audit-'+stamp+'.csv').then(()=>this.toast('Audit log exported')).catch(e=>this.fail(e));else this.exportReport('posts-by-area')}
  exportReport(name){const stamp=new Date().toISOString().slice(0,10);this.api.download('/admin/reports/'+name+'/export/',{format:'csv'},'grama-'+name+'-'+stamp+'.csv').then(()=>this.toast('Report exported')).catch(e=>this.fail(e))}

  renderVals(){
    const s=this.state,C=Component,ST=C.STATUS,R=C.ROLE;
    const is={auth:s.screen!=='app',login:s.screen==='login',changePassword:s.screen==='change_password',app:s.screen==='app'};
    const pg={};pg[s.page]=true;
    const titles={dashboard:'Dashboard',geography:'Geography · Master Data',users:'Users',posts:'Posts & Moderation',reports:'Reports',audit:'Audit Log',contact:'Contact messages',settings:'Settings'};
    const pendingN=s.pendingCount;
    const navItems=C.PAGES.filter(k=>this.navOk(k)).map(k=>{const on=s.page===k;return {label:titles[k].split(' ·')[0],d:C.ICON[k],color:on?'#fff':'rgba(255,255,255,.78)',bg:on?'#0D3B7A':'transparent',hasCount:k==='posts'&&pendingN>0,count:pendingN,go:()=>this.goPage(k)}});
    const hist=h=>{const rk=C.RK[h.actor&&h.actor.role]||'system';const label=h.action==='REVERSE'?'Override: '+(ST[C.SK[h.from_status]]||{label:h.from_status}).label+' → '+(ST[C.SK[h.to_status]]||{label:h.to_status}).label:(C.HIST[h.action]||h.action);return {who:(h.actor&&h.actor.name)||'System',role:R[rk].label,action:label,note:h.comment||'',hasNote:!!h.comment,time:this.fmt(h.at),dot:/PUBLISH/.test(h.action)?'#1F8A3B':h.action==='RECHECK'?'#8f4bb4':/DISCARD|UNPUBLISH/.test(h.action)?'#b3261e':h.action==='REVERSE'?'#0D3B7A':'#E9791E'}};
    const dp=(p,withHistory)=>{const st=ST[p.status]||ST.Pending;const rr=R[p.role]||R.panchayat;const al=p.allowed;const acts=[];
      if(p.status==='Pending'){if(al.includes('publish'))acts.push(['Publish','publish','#1F8A3B','#1F8A3B','#fff']);if(al.includes('recheck'))acts.push(['Recheck (comment)','recheck','#E9791E','#fff0dc','#b35a0e']);if(al.includes('discard'))acts.push(['Discard (reason)','discard','#cfd8e3','#fff','#3b4a5c'])}
      else if(p.status==='Published'){if(al.includes('unpublish'))acts.push(['Take down','takedown','#b3261e','#fff','#b3261e']);if(al.includes('reverse'))acts.push(['Override previous decision','override','#0D3B7A','#fff','#0D3B7A'])}
      else if(al.includes('reverse'))acts.push(['Override previous decision','override','#0D3B7A','#0D3B7A','#fff']);
      if(al.includes('set_urgent'))acts.push([p.urgent?'Remove urgent':'Mark urgent','urgent','#E9791E','#fff','#b35a0e']);
      const ev=p.event;const evs=ev?(C.EVENT[ev.kind]||[ev.kind,'#e3f0fb','#0D3B7A']):null;const evDates=ev?(this.fmt(ev.start_date+'T00:00:00+05:30',true).slice(0,11)+(ev.end_date?' – '+this.fmt(ev.end_date+'T00:00:00+05:30',true).slice(0,11):'')):'';
      return {id:p.id,cat:p.cat,catLabel:p.catLabel,titleTe:p.titleTe,titleEn:p.titleEn,bodyTe:p.bodyTe,bodyEn:p.bodyEn,area:p.area,date:p.date,author:p.author,authorRole:rr.label,amobile:'',abg:rr.bg,ainitial:(p.author||'?')[0],st:{bg:st.bg,color:st.color,label:st.label},hasPhoto:p.media.length>0,photos:p.media.slice(0,5).map(m=>({src:m.thumb_url||m.url,pos:'center'})),urgent:!!p.urgent,hasEvent:!!ev,eventLabel:evs?evs[0]+' · '+evDates:'',eventBg:evs?evs[1]:'',eventColor:evs?evs[2]:'',hasVideo:(p.videos||[]).length>0,videos:(p.videos||[]).map(v=>({src:v.url,poster:v.poster_url||v.thumb_url||''})),rowBg:s.panel&&s.panel.type==='post'&&s.panel.id===p.id?'#f0f6fd':'#fff',
        history:withHistory?s.panelHistory.map(hist):[],open:()=>this.openPost(p),actions:acts.map(([label,k,border,bg,color])=>({label,border,bg,color,go:()=>this.postAction(k,p)}))}};
    // dashboard
    const D=s.dash,K=D?D.kpis:{};const dayLabel=iso=>{const d=new Date(iso+'T00:00:00');return d.getDate()+' '+d.toLocaleString('en-GB',{month:'short'})};
    const todayLabel=new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'Asia/Kolkata'}).format(new Date());
    const kpis=[{label:'Total posts',value:D?K.total_posts:'…',sub:'All statuses · '+(D?D.geo.districts:'…')+' districts',color:'#0A2550',go:()=>{this.setState({page:'posts',statusTab:'All'},()=>this.loadPosts(1))}},{label:'Pending review',value:D?K.pending:'…',sub:D?(K.pending?'Oldest '+Math.round(K.oldest_pending_hours||0)+' h · '+K.escalated+' escalated':'Nothing waiting'):'',color:'#b35a0e',go:()=>{this.setState({page:'posts',statusTab:'Pending'},()=>this.loadPosts(1))}},{label:'Published today',value:D?K.published_today:'…',sub:todayLabel,color:'#1F8A3B',go:()=>{this.setState({page:'posts',statusTab:'Published'},()=>this.loadPosts(1))}},{label:'Active admins',value:D?K.active_admins:'…',sub:'District · Mandal · Village',color:'#0D3B7A',go:()=>{this.setState({page:'users',uf:{...s.uf,status:'active'}},()=>this.loadUsers(1))}},{label:'Blocked users',value:D?K.blocked_users:'…',sub:'Across all roles',color:'#b3261e',go:()=>{this.setState({page:'users',uf:{...s.uf,status:'blocked'}},()=>this.loadUsers(1))}}];
    const ppd=D?D.posts_per_day:[];const max=Math.max(1,...ppd.map(c=>c.submitted));
    const chart=ppd.map(c=>({h1:Math.round(c.submitted/max*100)+'%',h2:Math.round(c.published/max*100)+'%',day:dayLabel(c.date),tip:dayLabel(c.date)+': '+c.submitted+' submitted, '+c.published+' published'}));
    const pendingByDistrict=(D?D.pending_by_district:[]).map(r=>({name:r.district.name,te:r.name_te||'',count:r.pending,oldest:r.pending&&r.oldest_pending_hours!==null?Math.round(r.oldest_pending_hours)+' h':'—',go:()=>{this.setState({page:'posts',statusTab:'Pending',pf:{...s.pf,district:String(r.district.id)}},()=>this.loadPosts(1))}}));
    const auditRow=a=>{const rk=C.RK[a.actor&&a.actor.role]||(a.actor&&a.actor.role==='SYSTEM'?'system':'super');const name=(a.actor&&a.actor.name)||'System';return {time:this.fmt(a.at,false),user:name,role:R[rk].label,action:C.ACT[a.action]||this.humanAction(a.action),target:a.target_label||'',area:a.area?a.area.name:'State',bg:R[rk].bg,initial:name[0],rbg:R[rk].tbg,rcolor:R[rk].tc}};
    const recent=(D?D.recent_activity:[]).map(auditRow);
    // geography
    const tree=[];const tag={district:['#e3f0fb','#0D3B7A'],mandal:['#dff3f5','#07818e'],village:['#e4f4df','#1d7a33']};
    const row=(node,kind,depth,parentId,parentName,parentKey,meta)=>{const key=(kind==='district'?'':kind==='mandal'?'m':'v')+node.id;const hasKids=kind!=='village';const open=!!s.expanded[key];const sel=s.geoForm&&s.geoForm.id===node.id&&s.geoForm.kind===kind;tree.push({id:key,kind,name:node.name,te:node.te&&node.te!==node.name?node.te:'',indent:(8+depth*28)+'px',rowBg:sel?'#f0f6fd':'transparent',opacity:node.active?1:.55,toggleVis:hasKids?'visible':'hidden',chev:open?'M6 9l6 6 6-6':'M9 6l6 6-6 6',tagBg:tag[kind][0],tagColor:tag[kind][1],inactive:!node.active,meta,canAdd:hasKids,childKind:kind==='district'?'Mandal':'Village',
      toggle:()=>this.setState(st=>({expanded:{...st.expanded,[key]:!st.expanded[key]}})),
      select:()=>this.setState({geoForm:{kind,id:node.id,parentId,parentName,parentKey,parent:parentName||(s.stateRow?s.stateRow.name_en:'Andhra Pradesh'),name:node.name,te:node.te||'',lat:node.lat||'',lng:node.lng||'',pin:node.pin||'',isVillage:kind==='village'}}),
      add:()=>this.setState({geoForm:{kind:kind==='district'?'mandal':'village',id:null,parentId:node.id,parentName:node.name,parentKey:key,parent:node.name,name:'',te:'',lat:'',lng:'',pin:'',isVillage:kind==='mandal'}}),
      deact:()=>this.geoDeact({...node,kind}),deactLabel:node.active?'Deactivate':'Reactivate',deactColor:node.active?'#b3261e':'#1d7a33'});
      if(hasKids&&open)(node.mandals||node.villages).forEach(k=>row(k,kind==='district'?'mandal':'village',depth+1,node.id,node.name,key,kind==='district'?k.villages.length+' villages':(k.lat?Number(k.lat).toFixed(4)+', '+Number(k.lng).toFixed(4):'')))};
    s.geo.forEach(d=>row(d,'district',0,null,null,null,d.mandals.length+' mandals'));
    const gf=s.geoForm;
    // users
    const uf=s.uf;const userRows=s.users.map(u=>({id:u.id,name:u.name,te:u.te,mobile:u.mobile?'+91 '+u.mobile:(u.email||'—'),roleLabel:R[u.role].label,rbg:R[u.role].tbg,rcolor:R[u.role].tc,bg:R[u.role].bg,initial:u.name[0],area:this.an(u.area),statusLabel:u.active?'Active':'Blocked',scolor:u.active?'#1d7a33':'#b3261e',lastLogin:u.last,toggleLabel:u.active?'Block':'Unblock',tcolor:u.active?'#b3261e':'#1d7a33',canReassign:!!u.raId&&this.userCan(u,'reassign'),canToggle:this.userCan(u,u.active?'block':'unblock'),view:()=>this.openUser(u),reassign:()=>this.reassignUser(u),toggle:()=>this.toggleUser(u)}));
    const districtOpts=s.geo.map(d=>({id:String(d.id),label:d.name}));
    const pager=(page,pages,load)=>({show:pages>1,page,pages,prev:()=>{if(page>1)load(page-1)},next:()=>{if(page<pages)load(page+1)},prevOpacity:page>1?1:.4,nextOpacity:page<pages?1:.4});
    // posts
    const tabs=['Pending','Published','Recheck','Discarded','TakenDown'];const sc=s.statusCounts;const statusTabs=[{id:'All',label:'All'},...tabs.map(k=>({id:k,label:ST[k].label}))].map(t=>{const on=s.statusTab===t.id;const n=t.id==='All'?(sc.ALL||0):(sc[C.SAPI[t.id]]||0);return {label:t.label,count:n,line:on?'#0D3B7A':'transparent',color:on?'#0A2550':'#6b7a8c',cbg:on?'#0D3B7A':'#eef2f6',ccolor:on?'#fff':'#3b4a5c',go:()=>{this.setState({statusTab:t.id},()=>this.loadPosts(1))}}});
    const pf=s.pf;const postRows=s.posts.map(p=>dp(p));
    const catOpts=s.categories.map(c=>({id:c.key,label:c.name_en||c.name||c.key}));
    // reports
    const RP=s.reports;const byArea=[];RP.byArea.forEach(d=>{byArea.push({name:d.district.name,indent:'0px',weight:700,total:d.total,pub:d.published,pend:d.pending,rej:d.rejected});d.mandals.forEach(m=>byArea.push({name:m.mandal.name,indent:'20px',weight:500,total:m.total,pub:m.published,pend:m.pending,rej:m.rejected}))});
    const LV={VILLAGE:['Village Admin','#1F8A3B'],MANDAL:['Mandal Admin','#07818e'],DISTRICT:['District Admin','#E9791E']};
    const reviewTime=RP.reviewTime.filter(r=>LV[r.level]).map(r=>{const hours=r.avg_hours||0;return {level:LV[r.level][0],hours,n:r.reviews,sla:r.escalation_hours,color:LV[r.level][1],w:Math.min(100,Math.round(hours/(r.escalation_hours||24)*100))+'%'}});
    const adminActivity=RP.activity.map(a=>({name:a.user.name,role:(R[C.RK[a.user.role]]||R.village).label,area:a.area?a.area.name:'—',reviewed:a.reviewed,pub:a.published,re:a.recheck,dis:a.discarded,avg:'—',last:this.fmtLast(a.last_active_at)}));
    // audit
    const auditRows=s.audit.map(auditRow);
    // settings
    const catRows=s.categories.map(c=>({te:c.name_te,en:c.name_en,icon:C.CATL[c.key]?c.key:'updates',count:c.post_count||0,swBg:c.is_active?'#1F8A3B':'#cfd8e3',swLeft:c.is_active?'21px':'3px',toggle:()=>this.api.patch('/admin/categories/'+c.id+'/',{is_active:!c.is_active}).then(()=>{this.toast(c.name_en+(c.is_active?' disabled':' enabled'),c.is_active?'#E9791E':'#6cc04a');this.loadCategories()}).catch(e=>this.fail(e))}));
    const langRows=[{id:'te',name:'తెలుగు · Telugu',sub:'Default app language'},{id:'en',name:'English',sub:'Secondary · header toggle'}].map(l=>{const on=s.settings.langs[l.id];return {...l,swBg:on?'#1F8A3B':'#cfd8e3',swLeft:on?'21px':'3px',toggle:()=>{if(l.id==='te'){this.toast('Telugu is the default language and cannot be disabled','#E9791E');return}this.api.patch('/admin/settings/',{languages:{en:!on}}).then(()=>{this.setState(st=>({settings:{...st.settings,langs:{...st.settings.langs,en:!on}}}));this.toast('English '+(on?'disabled':'enabled'))}).catch(e=>this.fail(e))}}});
    const CH={push:'Push'};
    const templates=s.settings.templates.map(tp=>({id:tp.key,name:tp.name||tp.key,channel:CH[tp.channel]||tp.channel,te:tp.text_te,en:tp.text_en,edit:()=>{if(tp.editable===false){this.toast('This template cannot be edited','#E9791E');return}this.ask({title:'Edit template · '+(tp.name||tp.key),body:'Placeholders: '+(tp.variables||[]).map(v=>'{'+v+'}').join(' ')+'. Telugu and English are sent according to each user’s language.',needsText:true,textLabel:'English template',confirmLabel:'Save template',bg:'#0D3B7A',preset:tp.text_en,onConfirm:t=>this.api.patch('/admin/notification-templates/'+tp.key+'/',{text_te:tp.text_te,text_en:t}).then(()=>{this.toast('Template saved · '+(tp.name||tp.key));this.loadSettings()}).catch(e=>this.fail(e))})}}));
    // panel
    const panel=s.panel?{show:true,isPost:s.panel.type==='post',isUser:s.panel.type==='user',title:s.panel.type==='post'?'Post review':'User details'}:{show:false};
    const empty={id:'',cat:'updates',catLabel:'',titleTe:'',titleEn:'',bodyTe:'',bodyEn:'',area:'',areaName:'',date:'',author:'',role:'panchayat',status:'Pending',media:[],allowed:[]};
    const sp=dp(s.panelPost||empty,true);
    const pu=s.panelUser;const su=pu?{name:pu.name,te:pu.te,initial:pu.name[0],bg:R[pu.role].bg,fields:[{k:'Role',v:R[pu.role].label},{k:'Mobile',v:pu.mobile?'+91 '+pu.mobile:(pu.email||'—')},{k:'District',v:pu.district||'—'},{k:'Mandal',v:pu.mandal||'—'},{k:'Village',v:pu.village||'—'},{k:'Status',v:(pu.active?'Active · last login '+pu.last:'Blocked')+(pu.locked?' · locked after failed logins':'')}],posts:s.panelUserPosts.map(p=>dp(p)),roles:(pu.ras||[]).map(ra=>{const k=C.RK[ra.role]||'panchayat';return {label:R[k].label,rbg:R[k].tbg,rcolor:R[k].tc,area:ra.area?(ra.area.path||ra.area.name):'—',canRemove:this.userCan(pu,'remove_assignment'),remove:()=>this.removeRole(pu,ra)}}),canAddRole:this.userCan(pu,'add_assignment')&&this.roleChoices().length>0,canReassign:!!pu.raId&&this.userCan(pu,'reassign'),canReset:this.userCan(pu,'reset_password'),canUnlock:pu.locked&&this.userCan(pu,'unlock'),canToggle:this.userCan(pu,pu.active?'block':'unblock'),addRole:()=>this.addRole(pu),reassign:()=>this.reassignUser(pu),reset:()=>this.resetPassword(pu),unlock:()=>this.unlockUser(pu),toggle:()=>this.toggleUser(pu),toggleLabel:pu.active?'Block user':'Unblock user',tbg:pu.active?'#b3261e':'#1F8A3B'}:{fields:[],posts:[],roles:[]};
    // modal
    const m=s.modal;const cannot=!!(m&&m.needsText&&!s.modalText.trim());
    const modal=m?{show:true,title:m.title,body:m.body,hasInput:!!m.hasInput,inputLabel:m.inputLabel||'',inputPh:m.inputPh||'',hasSecret:!!m.secret,secret:m.secret||'',hasCancel:!m.noCancel,needsText:!!m.needsText,textLabel:m.textLabel||'',hasSelect:!!m.hasSelect,selectLabel:m.selectLabel||'',options:m.options||[],confirmLabel:m.confirmLabel,bg:m.bg||'#0D3B7A',cannot,opacity:cannot?.5:1}:{show:false,options:[],hasCancel:true};
    const nu=s.nu;const nuAreas=this.areaOptions(nu.role);const canNU=this.nuValid(nu);const nuRoles=this.roleChoices();
    const nuShown={...nu,area:nu.area||(nuAreas[0]?nuAreas[0].id:'')};
    const me=s.me||{name:'',username:'',email:''};
    return {screen:s.screen,is,pg,pageTitle:titles[s.page],navItems,menuOpen:s.menuOpen,toggleMenu:()=>this.setState(st=>({menuOpen:!st.menuOpen})),menuProfile:()=>{this.setState({menuOpen:false});const g=(me.groups||[]).map(x=>x.name||x.label||x.key||x).join(', ')||'Super Admin';this.toast('Profile: '+me.name+' · '+g+' · '+(me.username||''))},goSettingsM:()=>this.goPage('settings'),canSettings:this.navOk('settings'),menuChangePassword:()=>this.openChangePassword(),goAudit:()=>this.goPage('audit'),
      meName:me.name,meInitial:(me.name||'?')[0],stateName:s.stateRow?s.stateRow.name_en:'',stateTe:s.stateRow?s.stateRow.name_te:'',
      logout:()=>this.logout(),
      frameW:'100%',frameH:'100vh',
      username:s.username,password:s.password,onLogin:e=>{const {name,value}=e.target;this.setState({[name]:value})},onLoginKey:e=>{if(e.key==='Enter')this.signIn()},cannotSignIn:!(s.username.trim()&&s.password),signInOpacity:s.username.trim()&&s.password?1:.5,signIn:()=>this.signIn(),
      cpCurrent:s.cpCurrent,cpNext:s.cpNext,onCp:e=>{const {name,value}=e.target;this.setState(name==='current'?{cpCurrent:value}:{cpNext:value})},onCpKey:e=>{if(e.key==='Enter')this.changePassword()},cannotChange:!(s.cpCurrent&&s.cpNext),changeOpacity:s.cpCurrent&&s.cpNext?1:.5,changePassword:()=>this.changePassword(),cpSub:s.cpVoluntary?'Your other sessions are signed out when you save.':'Choose your own password before you continue.',cpBackLabel:s.cpVoluntary?'‹ Back':'‹ Sign out',cpBack:()=>{if(s.cpVoluntary)this.setState({screen:'app',cpVoluntary:false,cpCurrent:'',cpNext:''});else this.logout()},
      gsearch:s.gsearch,onGSearch:e=>{const v=e.target.value;this.setState({gsearch:v,page:v?'posts':s.page,statusTab:v?'All':s.statusTab});clearTimeout(this._gt);this._gt=setTimeout(()=>this.loadPosts(1),300)},
      kpis,chart,pendingByDistrict,recent,
      tree,addDistrict:()=>this.setState({geoForm:{kind:'district',id:null,parentId:null,parentName:null,parent:s.stateRow?s.stateRow.name_en:'Andhra Pradesh',name:'',te:'',lat:'',lng:'',pin:'',isVillage:false}}),importCsv:()=>this.importCsv(),geoForm:gf||{},geoFormShow:!!gf,geoFormEmpty:!gf,geoFormTitle:gf?((gf.id?'Edit ':'Add ')+gf.kind):'Details',geoSaveLabel:gf&&gf.id?'Save changes':'Add',cannotSaveGeo:!(gf&&gf.name.trim()),saveGeoOpacity:gf&&gf.name.trim()?1:.5,onGeoField:e=>{const {name,value}=e.target;this.setState(st=>({geoForm:{...st.geoForm,[name]:value}}))},saveGeo:()=>this.geoSave(),cancelGeo:()=>this.setState({geoForm:null}),
      uf,onUF:e=>{const {name,value}=e.target;this.setState(st=>({uf:{...st.uf,[name]:value}}),()=>{clearTimeout(this._qt);this._qt=setTimeout(()=>this.loadUsers(1),name==='q'?300:0)})},userRows,userCount:s.userCount,userEmpty:!userRows.length,userEmptyText:s.usersLoading?'Loading…':'No users match these filters.',usersPager:pager(s.userPage,s.userPages,p=>this.loadUsers(p)),districtOpts,openAddUser:()=>this.setState(st=>({drawerOpen:true,nu:{...st.nu,role:nuRoles.some(r=>r.id===st.nu.role)?st.nu.role:(nuRoles[0]?nuRoles[0].id:st.nu.role)}})),canAddUser:nuRoles.length>0,nuRoles,genNU:e=>{if(e&&e.preventDefault)e.preventDefault();const p=this.newPassword();this._nuGen=p;this.setState(st=>({nu:{...st.nu,password:p}}))},closeDrawer:()=>this.setState({drawerOpen:false}),drawerOpen:s.drawerOpen,nu:nuShown,nuAreas,onNU:e=>{const {name,value}=e.target;this.setState(st=>{const n={...st.nu,[name]:name==='mobile'?value.replace(/\D/g,'').slice(0,10):value};if(name==='role')n.area='';return {nu:n}})},cannotSaveNU:!canNU,saveNUOpacity:canNU?1:.5,saveNU:()=>this.saveNU(),
      statusTabs,pf,onPF:e=>{const {name,value}=e.target;this.setState(st=>({pf:{...st.pf,[name]:value}}),()=>this.loadPosts(1))},postRows,postCount:s.postCount,postEmpty:!postRows.length,postEmptyText:s.postsLoading?'Loading…':'No posts match these filters.',postsPager:pager(s.postPage,s.postPages,p=>this.loadPosts(p)),catOpts,
      byArea,reviewTime,adminActivity,exportCsv:()=>this.exportCsv(),exportByArea:()=>this.exportReport('posts-by-area'),exportReviewTime:()=>this.exportReport('review-time'),exportActivity:()=>this.exportReport('admin-activity'),
      auditQ:s.auditQ,onAuditQ:e=>{this.setState({auditQ:e.target.value});clearTimeout(this._at);this._at=setTimeout(()=>this.loadAudit(1),300)},auditRows,auditCount:s.auditCount,auditEmpty:!auditRows.length,auditEmptyText:s.auditLoading?'Loading…':'No entries match.',auditPager:pager(s.auditPage,s.auditPages,p=>this.loadAudit(p)),canExportAudit:this.can('audit.export_audit_log'),
      contactQ:s.contactQ,onContactQ:e=>{this.setState({contactQ:e.target.value});clearTimeout(this._ct);this._ct=setTimeout(()=>this.loadContacts(1),300)},contactFilter:s.contactFilter,contactFilters:[{id:'new',label:'New'},{id:'handled',label:'Handled'},{id:'all',label:'All'}],onContactFilter:e=>this.setState({contactFilter:e.target.value},()=>this.loadContacts(1)),
      contactRows:s.contacts.map(c=>{const done=this.isHandled(c);return {time:this.fmt(c.created_at,false),name:c.name,mobile:c.mobile?'+91 '+c.mobile:'—',village:c.village_text||'—',message:c.message,status:done?'Handled':'New',sbg:done?'#e4f4df':'#fff0dc',scolor:done?'#1d7a33':'#b35a0e',toggleLabel:done?'Mark new':'Mark handled',toggle:()=>this.toggleContact(c)}}),contactCount:s.contactCount+(s.contactCount===1?' message':' messages'),contactEmpty:!s.contacts.length,contactEmptyText:s.contactLoading?'Loading…':'No messages match.',contactPager:pager(s.contactPage,s.contactPages,p=>this.loadContacts(p)),
      settings:s.settings,catRows,langRows,templates,badge36:{size:36},newCat:s.newCat,onNewCat:e=>{const {name,value}=e.target;this.setState(st=>({newCat:{...st.newCat,[name]:value}}))},addCat:()=>{const c=s.newCat;if(!c.te.trim()&&!c.en.trim()){this.toast('Enter a category name','#E9791E');return}const en=(c.en||c.te).trim(),te=(c.te||c.en).trim();const key=(en.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'category').slice(0,20);this.api.post('/admin/categories/',{key,name_te:te,name_en:en}).then(()=>{this.setState({newCat:{te:'',en:''}});this.toast('Category added · '+en);this.loadCategories()}).catch(e=>this.fail(e))},
      onEscalation:e=>this.setState(st=>({settings:{...st.settings,escalation:Number(e.target.value)||0}})),saveSettings:()=>this.api.patch('/admin/settings/',{review_escalation_hours:s.settings.escalation}).then(()=>this.toast('Settings saved · escalation '+s.settings.escalation+' h')).catch(e=>this.fail(e)),
      panel,sp,su,closePanel:()=>this.setState({panel:null}),
      modal,modalText:s.modalText,modalSel:s.modalSel,onModalText:e=>this.setState({modalText:e.target.value}),onModalSel:e=>this.setState({modalSel:e.target.value}),closeModal:()=>this.closeModal(),confirmModal:()=>{if(!m||cannot)return;const t=s.modalText,sel=s.modalSel,gen=s.modalGen;this.closeModal();m.onConfirm(t,sel,gen)},genModal:e=>{if(e&&e.preventDefault)e.preventDefault();const p=this.newPassword();this.setState({modalText:p,modalGen:p})},copySecret:()=>this.copySecret(),noop:()=>{},
      toasts:s.toasts};
  }

  render() {
    const v = this.renderVals();
    return (
      <div data-screen-label={v.screen} style={css(`width: ${v.frameW ?? ""};min-height: ${v.frameH ?? ""};background:#F6F8F3;position:relative;font-family:'Nunito Sans','Noto Sans Telugu',sans-serif;color:#17212e;font-size:14px;overflow:hidden`)}>
        {" "}
        {/* LOGIN / CHANGE PASSWORD */}
        {" "}
        {v.is?.auth ? <>
          {" "}
          <div style={{height: "100vh", display: "grid", gridTemplateColumns: "1fr 520px"}}>
            <div style={{position: "relative", overflow: "hidden", background: "#0A2550"}}>
              {" "}
              <img src="/assets/village-landscape.jpg" alt="" style={{position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: ".55"}} />
              {" "}
              <div style={{position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(10,37,80,.3),rgba(10,37,80,.9))"}} />
              {" "}
              <div style={{position: "absolute", left: "64px", bottom: "72px", right: "64px", color: "#fff", display: "flex", flexDirection: "column", gap: "14px"}}>
                <div style={{display: "flex", height: "4px", width: "120px", borderRadius: "2px", overflow: "hidden"}}>
                  <span style={{flex: "1", background: "#E9791E"}} />
                  <span style={{flex: "1", background: "#fff"}} />
                  <span style={{flex: "1", background: "#1F8A3B"}} />
                </div>
                <div style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "40px", lineHeight: "1.15", letterSpacing: ".01em"}}>BVT GRAMA CONNECT</div>
                <div style={{fontSize: "22px", fontWeight: "600", color: "#f2dd3d"}}>మన గ్రామం – మన సేవలు – మన అభివృద్ధి</div>
                <div style={{fontSize: "16px", opacity: ".9"}}>Connecting Villages, Empowering India · Super Admin Console</div>
              </div>
              {" "}
            </div>
            <div style={{display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 64px", background: "#fff"}}>
              <img src="/assets/logo-mark.png" alt="" style={{width: "72px", height: "72px", borderRadius: "18.5%", boxShadow: "0 6px 20px rgba(0,64,126,.18)", marginBottom: "24px"}} />
              {v.is?.login ? <div style={{display: "flex", flexDirection: "column", gap: "18px", animation: "sa-fade .2s ease-out"}}>
                  <div>
                    <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "26px", fontWeight: "700", color: "#0A2550"}}>Super Admin sign in</div>
                    <div style={{color: "#6b7a8c", marginTop: "4px"}}>Restricted to authorised state-level administrators.</div>
                  </div>
                  <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>Username</span>
                    <input name="username" type="text" value={val(v.username, "")} onChange={v.onLogin} onKeyDown={v.onLoginKey} autoComplete="username" style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
                  </label>
                  <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>Password</span>
                    <input name="password" type="password" value={val(v.password, "")} onChange={v.onLogin} onKeyDown={v.onLoginKey} autoComplete="current-password" style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
                  </label>
                  <button onClick={v.signIn} disabled={v.cannotSignIn} style={css(`height:48px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-size:15px;font-weight:700;cursor:pointer;opacity: ${v.signInOpacity ?? ""}`)}>Sign in ›</button>
                </div> : null}
              {v.is?.changePassword ? <div style={{display: "flex", flexDirection: "column", gap: "18px", animation: "sa-fade .2s ease-out"}}>
                  <div>
                    <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "26px", fontWeight: "700", color: "#0A2550"}}>Change password</div>
                    <div style={{color: "#6b7a8c", marginTop: "4px"}}>{I(v.cpSub)}</div>
                  </div>
                  <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>Current password</span>
                    <input name="current" type="password" value={val(v.cpCurrent, "")} onChange={v.onCp} onKeyDown={v.onCpKey} autoComplete="current-password" style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
                  </label>
                  <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>New password</span>
                    <input name="next" type="password" value={val(v.cpNext, "")} onChange={v.onCp} onKeyDown={v.onCpKey} autoComplete="new-password" style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
                  </label>
                  <button onClick={v.changePassword} disabled={v.cannotChange} style={css(`height:48px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-size:15px;font-weight:700;cursor:pointer;opacity: ${v.changeOpacity ?? ""}`)}>{"Save & continue ›"}</button>
                  <div style={{display: "flex", justifyContent: "space-between"}}>
                    <button onClick={v.cpBack} style={{background: "none", border: "0", color: "#6b7a8c", fontWeight: "700", cursor: "pointer"}}>{I(v.cpBackLabel)}</button>
                  </div>
                </div> : null}
            </div>
          </div>
          {" "}
        </> : null}
        {" "}
        {/* APP SHELL */}
        {" "}
        {v.is?.app ? <>
          {" "}
          <div style={{display: "grid", gridTemplateColumns: "248px minmax(0, 1fr)", minHeight: "100vh"}}>
            <aside style={{background: "#0A2550", color: "#fff", display: "flex", flexDirection: "column", padding: "20px 14px", gap: "6px"}}>
              <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "4px 10px 20px"}}>
                <img src="/assets/logo-mark.png" alt="" style={{width: "40px", height: "40px", borderRadius: "18.5%"}} />
                <div>
                  <div style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "14px", letterSpacing: ".03em", lineHeight: "1.2"}}>BVT GRAMA CONNECT</div>
                  <div style={{fontSize: "11px", opacity: ".7"}}>Super Admin Console</div>
                </div>
              </div>
              {list(v.navItems).map((_n, _i1) => (
                <React.Fragment key={_i1}>
                  <button onClick={_n?.go} style={css(`display:flex;align-items:center;gap:12px;height:44px;padding:0 12px;border:0;border-radius:10px;cursor:pointer;text-align:left;font-size:14px;font-weight:600;color: ${_n?.color ?? ""};background: ${_n?.bg ?? ""}`)}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={_n?.d} /></svg>
                    <span style={{flex: "1"}}>{I(_n?.label)}</span>
                    {_n?.hasCount ? <span style={{minWidth: "22px", height: "22px", padding: "0 7px", borderRadius: "999px", background: "#E9791E", color: "#fff", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rubik',sans-serif"}}>{I(_n?.count)}</span> : null}
                  </button>
                </React.Fragment>
              ))}
              <div style={{marginTop: "auto", padding: "14px 12px", borderRadius: "12px", background: "rgba(255,255,255,.06)", fontSize: "12px", lineHeight: "1.5", opacity: ".85"}}>మన గ్రామం – మన సేవలు – మన అభివృద్ధి<br />v2.4 · Andhra Pradesh</div>
            </aside>
            <main style={{display: "flex", flexDirection: "column", minWidth: "0"}}>
              <header style={{height: "64px", background: "#fff", borderBottom: "1px solid #eef2f6", display: "flex", alignItems: "center", gap: "16px", padding: "0 28px", position: "relative"}}>
                <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "20px", fontWeight: "700", color: "#0A2550", flex: "1"}}>{I(v.pageTitle)}</div>
                <div style={{display: "flex", alignItems: "center", gap: "8px", height: "38px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#f7f9fb", width: "280px", color: "#6b7a8c"}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                  <input value={val(v.gsearch, "")} onChange={v.onGSearch} placeholder="Search posts, users, villages…" style={{flex: "1", border: "0", background: "transparent", outline: "none", fontSize: "13px"}} />
                </div>
                <button onClick={v.goAudit} aria-label="Notifications" style={{width: "40px", height: "40px", border: "0", background: "transparent", color: "#3b4a5c", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", position: "relative"}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
                  <span style={{position: "absolute", top: "8px", right: "9px", width: "8px", height: "8px", borderRadius: "50%", background: "#E9791E"}} />
                </button>
                <button onClick={v.toggleMenu} style={{display: "flex", alignItems: "center", gap: "10px", height: "42px", padding: "0 10px 0 4px", border: "1px solid #eef2f6", borderRadius: "999px", background: "#fff", cursor: "pointer"}}>
                  <span style={{width: "34px", height: "34px", borderRadius: "50%", background: "#0D3B7A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rubik',sans-serif", fontWeight: "700"}}>{I(v.meInitial)}</span>
                  <span style={{textAlign: "left", lineHeight: "1.2"}}>
                    <span style={{display: "block", fontWeight: "700", fontSize: "13px", color: "#0A2550"}}>{I(v.meName)}</span>
                    <span style={{display: "block", fontSize: "11px", color: "#6b7a8c"}}>Super Admin</span>
                  </span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a8c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {v.menuOpen ? <div style={{position: "absolute", top: "60px", right: "28px", width: "220px", background: "#fff", border: "1px solid #eef2f6", borderRadius: "12px", boxShadow: "0 10px 30px rgba(0,64,126,.16)", padding: "6px", zIndex: "40", animation: "sa-fade .15s ease-out"}}>
                    {" "}
                    <button onClick={v.menuProfile} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#17212e"}}>My profile</button>
                    {" "}
                    {v.canSettings ? <button onClick={v.goSettingsM} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#17212e"}}>Settings</button> : null}
                    {" "}
                    <button onClick={v.menuChangePassword} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#17212e"}}>Change password</button>
                    {" "}
                    <div style={{height: "1px", background: "#eef2f6", margin: "4px 0"}} />
                    {" "}
                    <button onClick={v.logout} style={{display: "block", width: "100%", textAlign: "left", padding: "10px 12px", border: "0", background: "none", borderRadius: "8px", cursor: "pointer", fontSize: "14px", color: "#b3261e", fontWeight: "700"}}>Logout</button>
                    {" "}
                  </div> : null}
              </header>
              <div style={{padding: "24px 28px 40px", display: "flex", flexDirection: "column", gap: "20px", animation: "sa-fade .2s ease-out"}}>
                {/* DASHBOARD */}
                {v.pg?.dashboard ? <>
                  <div style={{display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "16px"}}>
                    {list(v.kpis).map((_k, _i1) => (
                      <React.Fragment key={_i1}>
                        <button onClick={_k?.go} style={{textAlign: "left", background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "18px 20px", boxShadow: "0 2px 8px rgba(0,64,126,.06)", cursor: "pointer", display: "flex", flexDirection: "column", gap: "8px"}}>
                          <span style={{fontSize: "13px", color: "#6b7a8c", fontWeight: "600"}}>{I(_k?.label)}</span>
                          <span style={css(`font-family:'Rubik',sans-serif;font-size:32px;font-weight:700;line-height:1;color: ${_k?.color ?? ""}`)}>{I(_k?.value)}</span>
                          <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_k?.sub)}</span>
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "20px"}}>
                    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px"}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline"}}>
                        <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Posts per day</span>
                        <span style={{fontSize: "12px", color: "#6b7a8c"}}>Last 14 days · published vs submitted</span>
                      </div>
                      <div style={{display: "flex", alignItems: "flex-end", gap: "10px", height: "190px", paddingTop: "10px", borderBottom: "1px solid #eef2f6"}}>
                        {list(v.chart).map((_c, _i1) => (
                          <React.Fragment key={_i1}>
                            <div title={_c?.tip} style={{flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "0", height: "100%"}}>
                              <div style={{width: "100%", display: "flex", alignItems: "flex-end", gap: "3px", height: "100%"}}>
                                <div style={css(`flex:1;background:#0D3B7A;border-radius:4px 4px 0 0;height: ${_c?.h1 ?? ""}`)} />
                                <div style={css(`flex:1;background:#6cc04a;border-radius:4px 4px 0 0;height: ${_c?.h2 ?? ""}`)} />
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{display: "flex", gap: "10px"}}>
                        {list(v.chart).map((_c, _i1) => (
                          <React.Fragment key={_i1}>
                            <div style={{flex: "1", textAlign: "center", fontSize: "11px", color: "#6b7a8c"}}>{I(_c?.day)}</div>
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{display: "flex", gap: "18px", fontSize: "12px", color: "#3b4a5c"}}>
                        <span style={{display: "flex", alignItems: "center", gap: "6px"}}><span style={{width: "10px", height: "10px", borderRadius: "2px", background: "#0D3B7A"}} />Submitted</span>
                        <span style={{display: "flex", alignItems: "center", gap: "6px"}}><span style={{width: "10px", height: "10px", borderRadius: "2px", background: "#6cc04a"}} />Published</span>
                      </div>
                    </div>
                    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                      <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Pending by district</span>
                      <table style={{width: "100%", fontSize: "13px"}}>
                        <thead>
                          <tr style={{color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                            <th style={{padding: "8px 0", fontWeight: "600", borderBottom: "1px solid #eef2f6"}}>District</th>
                            <th style={{padding: "8px 0", fontWeight: "600", borderBottom: "1px solid #eef2f6", textAlign: "right"}}>Pending</th>
                            <th style={{padding: "8px 0", fontWeight: "600", borderBottom: "1px solid #eef2f6", textAlign: "right"}}>Oldest</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list(v.pendingByDistrict).map((_r, _i1) => (
                            <React.Fragment key={_i1}>
                              <tr>
                                <td style={{padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
                                  <button onClick={_r?.go} style={{background: "none", border: "0", padding: "0", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>{I(_r?.name)}</button>
                                  <div style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_r?.te)}</div>
                                </td>
                                <td style={{padding: "10px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right"}}>
                                  <span style={{display: "inline-block", minWidth: "26px", padding: "3px 8px", borderRadius: "999px", background: "#fff0dc", color: "#b35a0e", fontWeight: "700", textAlign: "center", fontFamily: "'Rubik',sans-serif"}}>{I(_r?.count)}</span>
                                </td>
                                <td style={{padding: "10px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#6b7a8c"}}>{I(_r?.oldest)}</td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "6px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px"}}>
                      <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Recent activity</span>
                      <button onClick={v.goAudit} style={{background: "none", border: "0", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Open audit log ›</button>
                    </div>
                    {list(v.recent).map((_a, _i1) => (
                      <React.Fragment key={_i1}>
                        <div style={{display: "flex", gap: "14px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
                          <span style={css(`width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:13px;flex-shrink:0;background: ${_a?.bg ?? ""}`)}>{I(_a?.initial)}</span>
                          <span style={{flex: "1", minWidth: "0", fontSize: "13px"}}>
                            <b style={{color: "#0A2550"}}>{I(_a?.user)}</b>
                            {" "}
                            <span style={{color: "#6b7a8c"}}>({I(_a?.role)})</span>
                            {" "}{I(_a?.action)}{" "}
                            <b>{I(_a?.target)}</b>
                          </span>
                          <span style={{fontSize: "12px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(_a?.area)}{" · "}{I(_a?.time)}</span>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </> : null}
                {/* GEOGRAPHY */}
                {v.pg?.geography ? <div style={{display: "grid", gridTemplateColumns: "1fr 420px", gap: "20px", alignItems: "start"}}>
                    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "16px 20px"}}>
                      {" "}
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid #eef2f6"}}>
                        <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>State → District → Mandal → Village</span>
                        <span style={{display: "flex", gap: "8px"}}>
                          <button onClick={v.importCsv} style={{height: "36px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Import CSV</button>
                          <button onClick={v.addDistrict} style={{height: "36px", padding: "0 14px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>+ Add district</button>
                        </span>
                      </div>
                      {" "}
                      <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "12px 8px", fontWeight: "700", color: "#0A2550", fontSize: "15px"}}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F8A3B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        {I(v.stateName)}{" "}
                        <span style={{fontWeight: "500", color: "#6b7a8c"}}>{I(v.stateTe)}</span>
                      </div>
                      {" "}
                      {list(v.tree).map((_n, _i1) => (
                        <React.Fragment key={_i1}>
                          {" "}
                          <div style={css(`display:flex;align-items:center;gap:8px;min-height:44px;border-bottom:1px solid #f3f5f8;padding-right:8px;padding-left: ${_n?.indent ?? ""};background: ${_n?.rowBg ?? ""};opacity: ${_n?.opacity ?? ""}`)}>
                            <button onClick={_n?.toggle} style={css(`width:28px;height:28px;border:0;background:none;cursor:pointer;color:#6b7a8c;display:flex;align-items:center;justify-content:center;visibility: ${_n?.toggleVis ?? ""}`)}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d={_n?.chev} /></svg>
                            </button>
                            <button onClick={_n?.select} style={{flex: "1", display: "flex", alignItems: "center", gap: "10px", background: "none", border: "0", padding: "6px 0", cursor: "pointer", textAlign: "left"}}>
                              <span style={css(`padding:2px 8px;border-radius:6px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;background: ${_n?.tagBg ?? ""};color: ${_n?.tagColor ?? ""}`)}>{I(_n?.kind)}</span>
                              <span style={{fontWeight: "700", color: "#0A2550", fontSize: "14px"}}>{I(_n?.name)}</span>
                              <span style={{color: "#6b7a8c", fontSize: "13px"}}>{I(_n?.te)}</span>
                              {_n?.inactive ? <span style={{padding: "2px 8px", borderRadius: "999px", background: "#eef2f6", color: "#3b4a5c", fontSize: "11px", fontWeight: "700"}}>Inactive</span> : null}
                              <span style={{marginLeft: "auto", fontSize: "12px", color: "#6b7a8c"}}>{I(_n?.meta)}</span>
                            </button>
                            {_n?.canAdd ? <button onClick={_n?.add} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>{"+ "}{I(_n?.childKind)}</button> : null}
                            <button onClick={_n?.select} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Edit</button>
                            <button onClick={_n?.deact} style={css(`height:30px;padding:0 10px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;font-weight:700;cursor:pointer;font-size:12px;color: ${_n?.deactColor ?? ""}`)}>{I(_n?.deactLabel)}</button>
                          </div>
                          {" "}
                        </React.Fragment>
                      ))}
                      {" "}
                    </div>
                    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px", position: "sticky", top: "20px"}}>
                      <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>{I(v.geoFormTitle)}</div>
                      {v.geoFormEmpty ? <div style={{color: "#6b7a8c", fontSize: "13px", lineHeight: "1.6"}}>Select a district, mandal or village on the left to edit it, or use the + buttons to add a new entry under its parent.</div> : null}
                      {v.geoFormShow ? <>
                        <div style={{fontSize: "12px", color: "#6b7a8c"}}>{"Parent: "}<b style={{color: "#3b4a5c"}}>{I(v.geoForm?.parent)}</b></div>
                        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                          <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Name (English)</span>
                          <input name="name" value={val(v.geoForm?.name, "")} onChange={v.onGeoField} style={{height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                        </label>
                        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                          <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>పేరు (తెలుగు)</span>
                          <input name="te" value={val(v.geoForm?.te, "")} onChange={v.onGeoField} style={{height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                        </label>
                        {v.geoForm?.isVillage ? <>
                          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Latitude</span>
                              <input name="lat" value={val(v.geoForm?.lat, "")} onChange={v.onGeoField} placeholder="16.2345" style={{height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                            </label>
                            <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                              <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Longitude</span>
                              <input name="lng" value={val(v.geoForm?.lng, "")} onChange={v.onGeoField} placeholder="80.6123" style={{height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                            </label>
                          </div>
                          <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                            <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Pincode</span>
                            <input name="pin" value={val(v.geoForm?.pin, "")} onChange={v.onGeoField} placeholder="522xxx" style={{height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                          </label>
                        </> : null}
                        <div style={{display: "flex", gap: "10px", marginTop: "4px"}}>
                          <button onClick={v.saveGeo} disabled={v.cannotSaveGeo} style={css(`flex:1;height:44px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${v.saveGeoOpacity ?? ""}`)}>{I(v.geoSaveLabel)}</button>
                          <button onClick={v.cancelGeo} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
                        </div>
                      </> : null}
                    </div>
                  </div> : null}
                {/* USERS */}
                {v.pg?.users ? <>
                  <div style={{display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap"}}>
                    <select name="role" value={val(v.uf?.role, "")} onChange={v.onUF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
                      <option value="">All roles</option>
                      <option value="district">District Admin</option>
                      <option value="mandal">Mandal Admin</option>
                      <option value="village">Village Admin</option>
                      <option value="panchayat">Panchayat Member</option>
                    </select>
                    <select name="district" value={val(v.uf?.district, "")} onChange={v.onUF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
                      <option value="">All districts</option>
                      {list(v.districtOpts).map((_o, _i1) => (
                        <React.Fragment key={_i1}>
                          <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                        </React.Fragment>
                      ))}
                    </select>
                    <select name="status" value={val(v.uf?.status, "")} onChange={v.onUF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "150px"}}><option value="">All statuses</option><option value="active">Active</option><option value="blocked">Blocked</option></select>
                    <input name="q" value={val(v.uf?.q, "")} onChange={v.onUF} placeholder="Search name or mobile" style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", width: "220px"}} />
                    <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.userCount)}{" users"}</span>
                    {v.canAddUser ? <button onClick={v.openAddUser} style={{marginLeft: "auto", height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>+ Add User</button> : null}
                  </div>
                  <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
                    {" "}
                    <table style={{width: "100%", fontSize: "13px"}}>
                      <thead>
                        <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Name</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Mobile</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Role</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Last login</th>
                          <th style={{padding: "12px 16px", fontWeight: "600", textAlign: "right"}}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list(v.userRows).map((_u, _i1) => (
                          <React.Fragment key={_i1}>
                            <tr style={{borderTop: "1px solid #f3f5f8"}}>
                              <td style={{padding: "10px 16px"}}>
                                <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                                  <span style={css(`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:13px;background: ${_u?.bg ?? ""}`)}>{I(_u?.initial)}</span>
                                  <span>
                                    <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_u?.name)}</span>
                                    <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_u?.te)}</span>
                                  </span>
                                </div>
                              </td>
                              <td style={{padding: "10px 16px", color: "#3b4a5c", fontVariantNumeric: "tabular-nums"}}>{I(_u?.mobile)}</td>
                              <td style={{padding: "10px 16px"}}>
                                <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${_u?.rbg ?? ""};color: ${_u?.rcolor ?? ""}`)}>{I(_u?.roleLabel)}</span>
                              </td>
                              <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_u?.area)}</td>
                              <td style={{padding: "10px 16px"}}>
                                <span style={css(`display:inline-flex;align-items:center;gap:6px;font-weight:700;font-size:12px;color: ${_u?.scolor ?? ""}`)}><span style={css(`width:8px;height:8px;border-radius:50%;background: ${_u?.scolor ?? ""}`)} />{I(_u?.statusLabel)}</span>
                              </td>
                              <td style={{padding: "10px 16px", color: "#6b7a8c"}}>{I(_u?.lastLogin)}</td>
                              <td style={{padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap"}}>
                                <button onClick={_u?.view} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px", marginLeft: "6px"}}>View</button>
                                {_u?.canReassign ? <button onClick={_u?.reassign} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer", fontSize: "12px", marginLeft: "6px"}}>Reassign area</button> : null}
                                {_u?.canToggle ? <button onClick={_u?.toggle} style={css(`height:30px;padding:0 10px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;font-weight:700;cursor:pointer;font-size:12px;margin-left:6px;color: ${_u?.tcolor ?? ""}`)}>{I(_u?.toggleLabel)}</button> : null}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                        {v.userEmpty ? <tr><td colSpan="7" style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.userEmptyText)}</td></tr> : null}
                      </tbody>
                    </table>
                    {" "}
                  </div>
                  {v.usersPager?.show ? <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6b7a8c"}}>
                      <button onClick={v.usersPager?.prev} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.usersPager?.prevOpacity ?? ""}`)}>‹ Prev</button>
                      <span>{"Page "}{I(v.usersPager?.page)}{" of "}{I(v.usersPager?.pages)}</span>
                      <button onClick={v.usersPager?.next} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.usersPager?.nextOpacity ?? ""}`)}>Next ›</button>
                    </div> : null}
                </> : null}
                {/* POSTS */}
                {v.pg?.posts ? <>
                  <div style={{display: "flex", gap: "4px", borderBottom: "1px solid #cfd8e3"}}>
                    {list(v.statusTabs).map((_s, _i1) => (
                      <React.Fragment key={_i1}>
                        <button onClick={_s?.go} style={css(`height:44px;padding:0 16px;border:0;background:none;cursor:pointer;font-size:14px;font-weight:700;display:flex;align-items:center;gap:8px;border-bottom:3px solid ${_s?.line ?? ""};color: ${_s?.color ?? ""};margin-bottom:-1px`)}>
                          {I(_s?.label)}
                          <span style={css(`min-width:22px;padding:2px 7px;border-radius:999px;font-size:11px;font-family:'Rubik',sans-serif;background: ${_s?.cbg ?? ""};color: ${_s?.ccolor ?? ""}`)}>{I(_s?.count)}</span>
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
                    <select name="district" value={val(v.pf?.district, "")} onChange={v.onPF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
                      <option value="">All districts</option>
                      {list(v.districtOpts).map((_o, _i1) => (
                        <React.Fragment key={_i1}>
                          <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                        </React.Fragment>
                      ))}
                    </select>
                    <select name="cat" value={val(v.pf?.cat, "")} onChange={v.onPF} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "190px"}}>
                      <option value="">All categories</option>
                      {list(v.catOpts).map((_c, _i1) => (
                        <React.Fragment key={_i1}>
                          <option value={val(_c?.id, "")}>{I(_c?.label)}</option>
                        </React.Fragment>
                      ))}
                    </select>
                    <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.postCount)}{" posts"}</span>
                  </div>
                  <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
                    {" "}
                    <table style={{width: "100%", fontSize: "13px"}}>
                      <thead>
                        <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Post</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Category</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Author</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Submitted</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
                          <th style={{padding: "12px 16px"}} />
                        </tr>
                      </thead>
                      <tbody>
                        {v.postEmpty ? <tr><td colSpan="7" style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.postEmptyText)}</td></tr> : null}
                        {list(v.postRows).map((_p, _i1) => (
                          <React.Fragment key={_i1}>
                            <tr onClick={_p?.open} style={css(`border-top:1px solid #f3f5f8;cursor:pointer;background: ${_p?.rowBg ?? ""}`)}>
                              <td style={{padding: "10px 16px", maxWidth: "380px"}}>
                                <div style={{fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{I(_p?.titleTe)}</div>
                                <div style={{fontSize: "12px", color: "#6b7a8c", marginTop: "2px"}}>{I(_p?.titleEn)}</div>
                              </td>
                              <td style={{padding: "10px 16px"}}><div className="sc-host-x" style={{display: "contents"}}><ds.Badge tone={_p?.cat}>{I(_p?.catLabel)}</ds.Badge></div></td>
                              <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_p?.area)}</td>
                              <td style={{padding: "10px 16px", color: "#3b4a5c"}}>
                                <span style={{display: "block"}}>{I(_p?.author)}</span>
                                <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(_p?.authorRole)}</span>
                              </td>
                              <td style={{padding: "10px 16px", color: "#6b7a8c", whiteSpace: "nowrap"}}>{I(_p?.date)}</td>
                              <td style={{padding: "10px 16px"}}>
                                <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_p?.st?.bg ?? ""};color: ${_p?.st?.color ?? ""}`)}>{I(_p?.st?.label)}</span>
                              </td>
                              <td style={{padding: "10px 16px", color: "#6b7a8c", textAlign: "right"}}>›</td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                    {" "}
                  </div>
                  {v.postsPager?.show ? <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6b7a8c"}}>
                      <button onClick={v.postsPager?.prev} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.postsPager?.prevOpacity ?? ""}`)}>‹ Prev</button>
                      <span>{"Page "}{I(v.postsPager?.page)}{" of "}{I(v.postsPager?.pages)}</span>
                      <button onClick={v.postsPager?.next} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.postsPager?.nextOpacity ?? ""}`)}>Next ›</button>
                    </div> : null}
                </> : null}
                {/* REPORTS */}
                {v.pg?.reports ? <>
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px"}}>
                    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Posts by area</span>
                        <button onClick={v.exportByArea} style={{height: "32px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Export CSV</button>
                      </div>
                      <table style={{width: "100%", fontSize: "13px"}}>
                        <thead>
                          <tr style={{color: "#6b7a8c", fontSize: "12px", textAlign: "left"}}>
                            <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600"}}>Area</th>
                            <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Total</th>
                            <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Published</th>
                            <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Pending</th>
                            <th style={{padding: "8px 0", borderBottom: "1px solid #eef2f6", fontWeight: "600", textAlign: "right"}}>Rejected</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list(v.byArea).map((_r, _i1) => (
                            <React.Fragment key={_i1}>
                              <tr>
                                <td style={css(`padding:9px 0;border-bottom:1px solid #f3f5f8;font-weight: ${_r?.weight ?? ""};color:#0A2550;padding-left: ${_r?.indent ?? ""}`)}>{I(_r?.name)}</td>
                                <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{I(_r?.total)}</td>
                                <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#1d7a33", fontVariantNumeric: "tabular-nums"}}>{I(_r?.pub)}</td>
                                <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#b35a0e", fontVariantNumeric: "tabular-nums"}}>{I(_r?.pend)}</td>
                                <td style={{padding: "9px 0", borderBottom: "1px solid #f3f5f8", textAlign: "right", color: "#6b7a8c", fontVariantNumeric: "tabular-nums"}}>{I(_r?.rej)}</td>
                              </tr>
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                        <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Average review time by level</span>
                        <button onClick={v.exportReviewTime} style={{height: "32px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Export CSV</button>
                      </div>
                      {list(v.reviewTime).map((_r, _i1) => (
                        <React.Fragment key={_i1}>
                          <div style={{display: "flex", flexDirection: "column", gap: "6px", padding: "8px 0", borderBottom: "1px solid #f3f5f8"}}>
                            <div style={{display: "flex", justifyContent: "space-between", fontSize: "13px"}}>
                              <span style={{fontWeight: "700", color: "#0A2550"}}>{I(_r?.level)}</span>
                              <span style={{color: "#3b4a5c"}}>
                                <b style={css(`font-family:'Rubik',sans-serif;font-size:16px;color: ${_r?.color ?? ""}`)}>{I(_r?.hours)}</b>
                                {" h avg · "}{I(_r?.n)}{" reviews · SLA "}{I(_r?.sla)}{" h"}
                              </span>
                            </div>
                            <div style={{height: "8px", borderRadius: "4px", background: "#eef2f6", overflow: "hidden"}}><div style={css(`height:100%;border-radius:4px;background: ${_r?.color ?? ""};width: ${_r?.w ?? ""}`)} /></div>
                          </div>
                        </React.Fragment>
                      ))}
                      <div style={{fontSize: "12px", color: "#6b7a8c"}}>{"Escalation after "}{I(v.settings?.escalation)}{" h without action (Settings)."}</div>
                    </div>
                  </div>
                  <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                      <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Admin activity · last 30 days</span>
                      <div style={{display: "flex", gap: "8px"}}>
                        <button onClick={v.exportActivity} style={{height: "32px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Export CSV</button>
                      </div>
                    </div>
                    <table style={{width: "100%", fontSize: "13px"}}>
                      <thead>
                        <tr style={{background: "#f7f9fb", color: "#6b7a8c", fontSize: "12px", textAlign: "left"}}>
                          <th style={{padding: "10px 12px", fontWeight: "600"}}>Admin</th>
                          <th style={{padding: "10px 12px", fontWeight: "600"}}>Role · Area</th>
                          <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Reviewed</th>
                          <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Published</th>
                          <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Recheck</th>
                          <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Discarded</th>
                          <th style={{padding: "10px 12px", fontWeight: "600", textAlign: "right"}}>Avg time</th>
                          <th style={{padding: "10px 12px", fontWeight: "600"}}>Last active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list(v.adminActivity).map((_r, _i1) => (
                          <React.Fragment key={_i1}>
                            <tr style={{borderTop: "1px solid #f3f5f8"}}>
                              <td style={{padding: "10px 12px", fontWeight: "700", color: "#0A2550"}}>{I(_r?.name)}</td>
                              <td style={{padding: "10px 12px", color: "#3b4a5c"}}>{I(_r?.role)}{" · "}{I(_r?.area)}</td>
                              <td style={{padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{I(_r?.reviewed)}</td>
                              <td style={{padding: "10px 12px", textAlign: "right", color: "#1d7a33", fontVariantNumeric: "tabular-nums"}}>{I(_r?.pub)}</td>
                              <td style={{padding: "10px 12px", textAlign: "right", color: "#8f4bb4", fontVariantNumeric: "tabular-nums"}}>{I(_r?.re)}</td>
                              <td style={{padding: "10px 12px", textAlign: "right", color: "#6b7a8c", fontVariantNumeric: "tabular-nums"}}>{I(_r?.dis)}</td>
                              <td style={{padding: "10px 12px", textAlign: "right", fontVariantNumeric: "tabular-nums"}}>{I(_r?.avg)}{" h"}</td>
                              <td style={{padding: "10px 12px", color: "#6b7a8c"}}>{I(_r?.last)}</td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </> : null}
                {/* AUDIT */}
                {v.pg?.audit ? <>
                  <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", width: "360px", color: "#6b7a8c"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                      <input value={val(v.auditQ, "")} onChange={v.onAuditQ} placeholder="Search user, action, target, area…" style={{flex: "1", border: "0", outline: "none", fontSize: "13px", background: "transparent"}} />
                    </div>
                    <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.auditCount)}{" entries"}</span>
                    {v.canExportAudit ? <button onClick={v.exportCsv} style={{marginLeft: "auto", height: "40px", padding: "0 16px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Export CSV</button> : null}
                  </div>
                  <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
                    {" "}
                    <table style={{width: "100%", fontSize: "13px"}}>
                      <thead>
                        <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Time</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>User</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Role</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Action</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Target</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Area</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list(v.auditRows).map((_a, _i1) => (
                          <React.Fragment key={_i1}>
                            <tr style={{borderTop: "1px solid #f3f5f8"}}>
                              <td style={{padding: "10px 16px", color: "#6b7a8c", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>{I(_a?.time)}</td>
                              <td style={{padding: "10px 16px", fontWeight: "700", color: "#0A2550"}}>{I(_a?.user)}</td>
                              <td style={{padding: "10px 16px"}}>
                                <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${_a?.rbg ?? ""};color: ${_a?.rcolor ?? ""}`)}>{I(_a?.role)}</span>
                              </td>
                              <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_a?.action)}</td>
                              <td style={{padding: "10px 16px", color: "#17212e"}}>{I(_a?.target)}</td>
                              <td style={{padding: "10px 16px", color: "#6b7a8c"}}>{I(_a?.area)}</td>
                            </tr>
                          </React.Fragment>
                        ))}
                        {v.auditEmpty ? <tr><td colSpan="6" style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.auditEmptyText)}</td></tr> : null}
                      </tbody>
                    </table>
                    {v.auditPager?.show ? <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6b7a8c"}}>
                        <button onClick={v.auditPager?.prev} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.auditPager?.prevOpacity ?? ""}`)}>‹ Prev</button>
                        <span>{"Page "}{I(v.auditPager?.page)}{" of "}{I(v.auditPager?.pages)}</span>
                        <button onClick={v.auditPager?.next} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.auditPager?.nextOpacity ?? ""}`)}>Next ›</button>
                      </div> : null}
                    {" "}
                  </div>
                </> : null}
                {/* CONTACT MESSAGES */}
                {v.pg?.contact ? <>
                  <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "8px", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", width: "360px", color: "#6b7a8c"}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                      <input value={val(v.contactQ, "")} onChange={v.onContactQ} placeholder="Search name, mobile, village, message…" style={{flex: "1", border: "0", outline: "none", fontSize: "13px", background: "transparent"}} />
                    </div>
                    <select value={val(v.contactFilter, "")} onChange={v.onContactFilter} style={{height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", background: "#fff", fontSize: "13px", minWidth: "170px"}}>
                      {list(v.contactFilters).map((_o, _i1) => (
                        <React.Fragment key={_i1}>
                          <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                        </React.Fragment>
                      ))}
                    </select>
                    <span style={{fontSize: "13px", color: "#6b7a8c"}}>{I(v.contactCount)}</span>
                  </div>
                  <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", overflow: "hidden"}}>
                    {" "}
                    <table style={{width: "100%", fontSize: "13px"}}>
                      <thead>
                        <tr style={{background: "#f7f9fb", color: "#6b7a8c", textAlign: "left", fontSize: "12px"}}>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Received</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Name</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Mobile</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Village / Mandal</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Message</th>
                          <th style={{padding: "12px 16px", fontWeight: "600"}}>Status</th>
                          <th style={{padding: "12px 16px"}} />
                        </tr>
                      </thead>
                      <tbody>
                        {list(v.contactRows).map((_c, _i1) => (
                          <React.Fragment key={_i1}>
                            <tr style={{borderTop: "1px solid #f3f5f8"}}>
                              <td style={{padding: "10px 16px", color: "#6b7a8c", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums"}}>{I(_c?.time)}</td>
                              <td style={{padding: "10px 16px", fontWeight: "700", color: "#0A2550"}}>{I(_c?.name)}</td>
                              <td style={{padding: "10px 16px", color: "#3b4a5c", whiteSpace: "nowrap"}}>{I(_c?.mobile)}</td>
                              <td style={{padding: "10px 16px", color: "#3b4a5c"}}>{I(_c?.village)}</td>
                              <td style={{padding: "10px 16px", color: "#17212e", lineHeight: "1.5"}}>{I(_c?.message)}</td>
                              <td style={{padding: "10px 16px"}}>
                                <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_c?.sbg ?? ""};color: ${_c?.scolor ?? ""}`)}>{I(_c?.status)}</span>
                              </td>
                              <td style={{padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap"}}>
                                <button onClick={_c?.toggle} style={{height: "30px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>{I(_c?.toggleLabel)}</button>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                        {v.contactEmpty ? <tr><td colSpan="7" style={{padding: "40px", textAlign: "center", color: "#6b7a8c"}}>{I(v.contactEmptyText)}</td></tr> : null}
                      </tbody>
                    </table>
                    {v.contactPager?.show ? <div style={{display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "10px", fontSize: "13px", color: "#6b7a8c"}}>
                        <button onClick={v.contactPager?.prev} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.contactPager?.prevOpacity ?? ""}`)}>‹ Prev</button>
                        <span>{"Page "}{I(v.contactPager?.page)}{" of "}{I(v.contactPager?.pages)}</span>
                        <button onClick={v.contactPager?.next} style={css(`height:30px;padding:0 12px;border:1px solid #cfd8e3;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;cursor:pointer;font-size:12px;opacity: ${v.contactPager?.nextOpacity ?? ""}`)}>Next ›</button>
                      </div> : null}
                    {" "}
                  </div>
                </> : null}
                {/* SETTINGS */}
                {v.pg?.settings ? <>
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start"}}>
                    <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                      <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Post categories</span>
                      {list(v.catRows).map((_c, _i1) => (
                        <React.Fragment key={_i1}>
                          <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderBottom: "1px solid #f3f5f8"}}>
                            <div className="sc-host-x" style={{width: "36px", height: "36px"}}><ds.IconBadge category={_c?.icon} {...v.badge36} /></div>
                            <span style={{flex: "1"}}>
                              <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_c?.te)}</span>
                              <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_c?.en)}{" · "}{I(_c?.count)}{" posts"}</span>
                            </span>
                            <button onClick={_c?.toggle} style={css(`width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;background: ${_c?.swBg ?? ""}`)}>
                              <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${_c?.swLeft ?? ""};transition:left .15s`)} />
                            </button>
                          </div>
                        </React.Fragment>
                      ))}
                      <div style={{display: "flex", gap: "8px"}}>
                        <input value={val(v.newCat?.te, "")} name="te" onChange={v.onNewCat} placeholder="కొత్త వర్గం (తెలుగు)" style={{flex: "1", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13px"}} />
                        <input value={val(v.newCat?.en, "")} name="en" onChange={v.onNewCat} placeholder="English name" style={{flex: "1", height: "40px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "13px"}} />
                        <button onClick={v.addCat} style={{height: "40px", padding: "0 14px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Add</button>
                      </div>
                    </div>
                    <div style={{display: "flex", flexDirection: "column", gap: "20px"}}>
                      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                        <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Languages</span>
                        {list(v.langRows).map((_l, _i1) => (
                          <React.Fragment key={_i1}>
                            <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", borderBottom: "1px solid #f3f5f8"}}>
                              <span style={{flex: "1"}}>
                                <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_l?.name)}</span>
                                <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_l?.sub)}</span>
                              </span>
                              <button onClick={_l?.toggle} style={css(`width:44px;height:26px;border-radius:13px;border:0;cursor:pointer;position:relative;background: ${_l?.swBg ?? ""}`)}>
                                <span style={css(`position:absolute;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);left: ${_l?.swLeft ?? ""};transition:left .15s`)} />
                              </button>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                        <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Review escalation</span>
                        <div style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>If a pending post is not reviewed within this time, it is escalated to the next level and flagged on the dashboard.</div>
                        <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                          <input type="number" min="1" max="168" value={val(v.settings?.escalation, "")} onChange={v.onEscalation} style={{width: "100px", height: "42px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "16px", fontWeight: "700", fontFamily: "'Rubik',sans-serif"}} />
                          <span style={{color: "#3b4a5c"}}>hours</span>
                          <button onClick={v.saveSettings} style={{marginLeft: "auto", height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>Save</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{background: "#fff", border: "1px solid #eef2f6", borderRadius: "14px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "12px"}}>
                    <span style={{fontFamily: "'Rubik',sans-serif", fontSize: "16px", fontWeight: "700", color: "#0A2550"}}>Notification templates</span>
                    {list(v.templates).map((_tp, _i1) => (
                      <React.Fragment key={_i1}>
                        <div style={{display: "grid", gridTemplateColumns: "200px 1fr 1fr auto", gap: "16px", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f5f8"}}>
                          <span>
                            <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(_tp?.name)}</span>
                            <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(_tp?.channel)}</span>
                          </span>
                          <span style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_tp?.te)}</span>
                          <span style={{fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_tp?.en)}</span>
                          <button onClick={_tp?.edit} style={{height: "32px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Edit</button>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </> : null}
              </div>
            </main>
          </div>
          {" "}
          {/* SIDE PANEL (post / user) */}
          {" "}
          {v.panel?.show ? <>
            {" "}
            <div onClick={v.closePanel} style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
            {" "}
            <div style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(520px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
              <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
                <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>{I(v.panel?.title)}</span>
                <button onClick={v.closePanel} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "16px"}}>
                {v.panel?.isPost ? <>
                  <div style={{display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap"}}>
                    <div className="sc-host-x" style={{display: "contents"}}><ds.Badge tone={v.sp?.cat}>{I(v.sp?.catLabel)}</ds.Badge></div>
                    <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${v.sp?.st?.bg ?? ""};color: ${v.sp?.st?.color ?? ""}`)}>{I(v.sp?.st?.label)}</span>
                    {v.sp?.urgent ? <span style={{padding: "3px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "700", background: "#fde7e5", color: "#b3261e"}}>Urgent</span> : null}
                    {v.sp?.hasEvent ? <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;background: ${v.sp?.eventBg ?? ""};color: ${v.sp?.eventColor ?? ""}`)}>{I(v.sp?.eventLabel)}</span> : null}
                    <span style={{fontSize: "12px", color: "#6b7a8c"}}>{I(v.sp?.area)}{" · "}{I(v.sp?.date)}</span>
                  </div>
                  <div>
                    <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "20px", fontWeight: "700", color: "#0A2550", lineHeight: "1.3"}}>{I(v.sp?.titleTe)}</div>
                    <div style={{fontSize: "14px", color: "#6b7a8c", marginTop: "2px"}}>{I(v.sp?.titleEn)}</div>
                  </div>
                  <p style={{margin: "0", fontSize: "15px", lineHeight: "1.65", color: "#3b4a5c"}}>{I(v.sp?.bodyTe)}</p>
                  <p style={{margin: "0", fontSize: "13px", lineHeight: "1.6", color: "#6b7a8c", borderLeft: "3px solid #eef2f6", paddingLeft: "12px"}}>{I(v.sp?.bodyEn)}</p>
                  {v.sp?.hasVideo ? <>
                    {list(v.sp?.videos).map((_v, _i1) => (
                      <React.Fragment key={_i1}>
                        <video src={_v?.src} poster={_v?.poster} controls={true} preload="none" style={{width: "100%", aspectRatio: "16/9", borderRadius: "10px", background: "#0A2550", objectFit: "contain"}} />
                      </React.Fragment>
                    ))}
                  </> : null}
                  {v.sp?.hasPhoto ? <div style={{display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "8px"}}>
                      {list(v.sp?.photos).map((_ph, _i1) => (
                        <React.Fragment key={_i1}>
                          <img src={_ph?.src} alt="" style={css(`width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:10px;object-position: ${_ph?.pos ?? ""}`)} />
                        </React.Fragment>
                      ))}
                    </div> : null}
                  <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", background: "#f7f9fb", borderRadius: "12px"}}>
                    <span style={css(`width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;background: ${v.sp?.abg ?? ""}`)}>{I(v.sp?.ainitial)}</span>
                    <span style={{flex: "1"}}>
                      <span style={{display: "block", fontWeight: "700", color: "#0A2550"}}>{I(v.sp?.author)}</span>
                      <span style={{display: "block", fontSize: "12px", color: "#6b7a8c"}}>{I(v.sp?.authorRole)}{" · "}{I(v.sp?.area)}{" · "}{I(v.sp?.amobile)}</span>
                    </span>
                  </div>
                  <div style={{display: "flex", flexDirection: "column", gap: "0"}}>
                    <div style={{fontWeight: "700", color: "#0A2550", marginBottom: "8px"}}>Review history</div>
                    {list(v.sp?.history).map((_h, _i1) => (
                      <React.Fragment key={_i1}>
                        <div style={{display: "grid", gridTemplateColumns: "22px 1fr", gap: "12px"}}>
                          <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                            <span style={css(`width:12px;height:12px;border-radius:50%;margin-top:4px;flex-shrink:0;background: ${_h?.dot ?? ""}`)} />
                            <span style={{flex: "1", width: "2px", background: "#eef2f6", margin: "4px 0"}} />
                          </div>
                          <div style={{paddingBottom: "16px"}}>
                            <div style={{fontSize: "13px"}}><b style={{color: "#0A2550"}}>{I(_h?.who)}</b>{" "}<span style={{color: "#6b7a8c"}}>{"· "}{I(_h?.role)}</span></div>
                            <div style={{fontSize: "13px", color: "#3b4a5c", marginTop: "2px"}}>{I(_h?.action)}</div>
                            {_h?.hasNote ? <div style={{marginTop: "6px", padding: "8px 10px", background: "#f7f9fb", borderRadius: "8px", fontSize: "13px", color: "#3b4a5c", lineHeight: "1.5"}}>{I(_h?.note)}</div> : null}
                            <div style={{fontSize: "11px", color: "#6b7a8c", marginTop: "4px"}}>{I(_h?.time)}</div>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </> : null}
                {v.panel?.isUser ? <>
                  <div style={{display: "flex", alignItems: "center", gap: "14px"}}>
                    <span style={css(`width:56px;height:56px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:'Rubik',sans-serif;font-size:22px;background: ${v.su?.bg ?? ""}`)}>{I(v.su?.initial)}</span>
                    <span>
                      <span style={{display: "block", fontSize: "18px", fontWeight: "700", color: "#0A2550"}}>{I(v.su?.name)}</span>
                      <span style={{display: "block", color: "#6b7a8c"}}>{I(v.su?.te)}</span>
                    </span>
                  </div>
                  <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px"}}>
                    {list(v.su?.fields).map((_f, _i1) => (
                      <React.Fragment key={_i1}>
                        <div style={{padding: "12px 14px", background: "#f7f9fb", borderRadius: "10px"}}>
                          <div style={{fontSize: "11px", color: "#6b7a8c", textTransform: "uppercase", letterSpacing: ".05em", fontWeight: "700"}}>{I(_f?.k)}</div>
                          <div style={{fontWeight: "700", color: "#0A2550", marginTop: "3px"}}>{I(_f?.v)}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <span style={{fontWeight: "700", color: "#0A2550"}}>Roles</span>
                    {v.su?.canAddRole ? <button onClick={v.su?.addRole} style={{height: "30px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>+ Add role</button> : null}
                  </div>
                  {list(v.su?.roles).map((_r, _i1) => (
                    <React.Fragment key={_i1}>
                      <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", border: "1px solid #eef2f6", borderRadius: "10px", background: "#fff"}}>
                        <span style={css(`padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;white-space:nowrap;background: ${_r?.rbg ?? ""};color: ${_r?.rcolor ?? ""}`)}>{I(_r?.label)}</span>
                        <span style={{flex: "1", fontSize: "13px", color: "#3b4a5c"}}>{I(_r?.area)}</span>
                        {_r?.canRemove ? <button onClick={_r?.remove} style={{height: "28px", padding: "0 10px", border: "1px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#b3261e", fontWeight: "700", cursor: "pointer", fontSize: "12px"}}>Remove</button> : null}
                      </div>
                    </React.Fragment>
                  ))}
                  <div style={{fontWeight: "700", color: "#0A2550"}}>Recent posts by this user</div>
                  {list(v.su?.posts).map((_p, _i1) => (
                    <React.Fragment key={_i1}>
                      <button onClick={_p?.open} style={{display: "flex", justifyContent: "space-between", gap: "12px", width: "100%", textAlign: "left", padding: "10px 12px", border: "1px solid #eef2f6", borderRadius: "10px", background: "#fff", cursor: "pointer"}}>
                        <span style={{fontWeight: "700", color: "#0A2550", fontSize: "13px"}}>{I(_p?.titleTe)}</span>
                        <span style={css(`padding:3px 10px;border-radius:999px;font-size:11px;font-weight:700;white-space:nowrap;background: ${_p?.st?.bg ?? ""};color: ${_p?.st?.color ?? ""}`)}>{I(_p?.st?.label)}</span>
                      </button>
                    </React.Fragment>
                  ))}
                </> : null}
              </div>
              {v.panel?.isPost ? <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", flexWrap: "wrap", gap: "10px", background: "#fff"}}>
                  {list(v.sp?.actions).map((_a, _i1) => (
                    <React.Fragment key={_i1}>
                      <button onClick={_a?.go} style={css(`height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;border:1.5px solid ${_a?.border ?? ""};background: ${_a?.bg ?? ""};color: ${_a?.color ?? ""}`)}>{I(_a?.label)}</button>
                    </React.Fragment>
                  ))}
                </div> : null}
              {v.panel?.isUser ? <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px"}}>
                  {v.su?.canReassign ? <button onClick={v.su?.reassign} style={{height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Reassign area</button> : null}
                  {v.su?.canReset ? <button onClick={v.su?.reset} style={{height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Reset password</button> : null}
                  {v.su?.canUnlock ? <button onClick={v.su?.unlock} style={{height: "42px", padding: "0 18px", borderRadius: "999px", fontWeight: "700", cursor: "pointer", fontSize: "13px", border: "1.5px solid #cfd8e3", background: "#fff", color: "#3b4a5c"}}>Unlock</button> : null}
                  {v.su?.canToggle ? <button onClick={v.su?.toggle} style={css(`height:42px;padding:0 18px;border-radius:999px;font-weight:700;cursor:pointer;font-size:13px;border:0;color:#fff;background: ${v.su?.tbg ?? ""}`)}>{I(v.su?.toggleLabel)}</button> : null}
                </div> : null}
            </div>
            {" "}
          </> : null}
          {" "}
          {/* ADD USER DRAWER */}
          {" "}
          {v.drawerOpen ? <>
            {" "}
            <div onClick={v.closeDrawer} style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.35)", zIndex: "50"}} />
            {" "}
            <div style={{position: "fixed", top: "0", right: "0", bottom: "0", width: "min(460px, 100vw)", background: "#fff", boxShadow: "-10px 0 40px rgba(0,64,126,.2)", zIndex: "51", display: "flex", flexDirection: "column", animation: "sa-slide .2s ease-out"}}>
              <div style={{display: "flex", alignItems: "center", gap: "12px", padding: "18px 24px", borderBottom: "1px solid #eef2f6"}}>
                <span style={{flex: "1", fontFamily: "'Rubik',sans-serif", fontSize: "17px", fontWeight: "700", color: "#0A2550"}}>Add User</span>
                <button onClick={v.closeDrawer} aria-label="Close" style={{width: "36px", height: "36px", border: "0", borderRadius: "50%", background: "#f7f9fb", cursor: "pointer", color: "#3b4a5c", display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
              <div style={{flex: "1", overflow: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: "14px"}}>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Full name</span>
                  <input name="name" value={val(v.nu?.name, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>పేరు (తెలుగు)</span>
                  <input name="te" value={val(v.nu?.te, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Username</span>
                  <input name="username" type="text" value={val(v.nu?.username, "")} onChange={v.onNU} placeholder="e.g. ravi.kumar" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Email (optional)</span>
                  <input name="email" type="email" value={val(v.nu?.email, "")} onChange={v.onNU} placeholder="name@example.com" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Mobile (optional)</span>
                  <input name="mobile" value={val(v.nu?.mobile, "")} onChange={v.onNU} maxLength="10" placeholder="10 digits" style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Temporary password (optional)</span>
                  <span style={{display: "flex", gap: "10px"}}>
                    <input name="password" type="text" value={val(v.nu?.password, "")} onChange={v.onNU} placeholder="Leave empty to generate one" autoComplete="off" style={{flex: "1", height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                    <button onClick={v.genNU} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Generate</button>
                  </span>
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Role</span>
                  <select name="role" value={val(v.nu?.role, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
                    {list(v.nuRoles).map((_o, _i1) => (
                      <React.Fragment key={_i1}>
                        <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                      </React.Fragment>
                    ))}
                  </select>
                </label>
                <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                  <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>Area</span>
                  <select name="area" value={val(v.nu?.area, "")} onChange={v.onNU} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
                    {list(v.nuAreas).map((_o, _i1) => (
                      <React.Fragment key={_i1}>
                        <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                      </React.Fragment>
                    ))}
                  </select>
                </label>
                <div style={{fontSize: "12px", color: "#6b7a8c", lineHeight: "1.5"}}>
                  Leave the password empty to generate one. It is shown once after you save: give it to the person yourself. They choose their own password at first login. Panchayat members' posts go through the Village Admin review queue.
                </div>
              </div>
              <div style={{padding: "16px 24px", borderTop: "1px solid #eef2f6", display: "flex", gap: "10px"}}>
                <button onClick={v.saveNU} disabled={v.cannotSaveNU} style={css(`flex:1;height:44px;border:0;border-radius:999px;background:#0D3B7A;color:#fff;font-weight:700;cursor:pointer;opacity: ${v.saveNUOpacity ?? ""}`)}>Create user</button>
                <button onClick={v.closeDrawer} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button>
              </div>
            </div>
            {" "}
          </> : null}
          {" "}
          {/* MODAL */}
          {" "}
          {v.modal?.show ? <>
            {" "}
            <div style={{position: "fixed", inset: "0", background: "rgba(10,37,80,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "60"}}>
              <div style={{width: "460px", background: "#fff", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 60px rgba(0,0,0,.25)", animation: "sa-fade .15s ease-out"}}>
                <div style={{fontFamily: "'Rubik',sans-serif", fontSize: "19px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.title)}</div>
                <div style={{fontSize: "14px", color: "#3b4a5c", lineHeight: "1.55"}}>{I(v.modal?.body)}</div>
                {v.modal?.hasSelect ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.selectLabel)}</span>
                    <select value={val(v.modalSel, "")} onChange={v.onModalSel} style={{height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", background: "#fff"}}>
                      {list(v.modal?.options).map((_o, _i1) => (
                        <React.Fragment key={_i1}>
                          <option value={val(_o?.id, "")}>{I(_o?.label)}</option>
                        </React.Fragment>
                      ))}
                    </select>
                  </label> : null}
                {v.modal?.needsText ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.textLabel)}</span>
                    <textarea value={val(v.modalText, "")} onChange={v.onModalText} rows="4" autoFocus={true} style={{padding: "12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", lineHeight: "1.5", resize: "none", outlineColor: "#0D3B7A"}} />
                  </label> : null}
                {v.modal?.hasInput ? <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "12px", fontWeight: "700", color: "#0A2550"}}>{I(v.modal?.inputLabel)}</span>
                    <span style={{display: "flex", gap: "10px"}}>
                      <input type="text" value={val(v.modalText, "")} onChange={v.onModalText} placeholder={v.modal?.inputPh} autoComplete="off" style={{flex: "1", height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A"}} />
                      <button onClick={v.genModal} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Generate</button>
                    </span>
                  </label> : null}
                {v.modal?.hasSecret ? <span style={{display: "flex", gap: "10px"}}>
                    <input type="text" value={val(v.modal?.secret, "")} onChange={v.noop} autoComplete="off" style={{flex: "1", height: "44px", padding: "0 12px", border: "1px solid #cfd8e3", borderRadius: "10px", fontSize: "14px", outlineColor: "#0D3B7A", letterSpacing: ".08em"}} />
                    <button onClick={v.copySecret} style={{height: "44px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Copy</button>
                  </span> : null}
                <div style={{display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "4px"}}>
                  {v.modal?.hasCancel ? <button onClick={v.closeModal} style={{height: "42px", padding: "0 18px", border: "1.5px solid #cfd8e3", borderRadius: "999px", background: "#fff", color: "#3b4a5c", fontWeight: "700", cursor: "pointer"}}>Cancel</button> : null}
                  <button onClick={v.confirmModal} disabled={v.modal?.cannot} style={css(`height:42px;padding:0 20px;border:0;border-radius:999px;color:#fff;font-weight:700;cursor:pointer;background: ${v.modal?.bg ?? ""};opacity: ${v.modal?.opacity ?? ""}`)}>{I(v.modal?.confirmLabel)}</button>
                </div>
              </div>
            </div>
            {" "}
          </> : null}
          {" "}
        </> : null}
        {" "}
        {/* TOASTS */}
        {" "}
        <div style={{position: "fixed", top: "20px", right: "24px", display: "flex", flexDirection: "column", gap: "8px", zIndex: "100", pointerEvents: "none"}}>
          {list(v.toasts).map((_t, _i1) => (
            <React.Fragment key={_i1}>
              <div style={{display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "12px", background: "#0A2550", color: "#fff", fontSize: "14px", fontWeight: "600", boxShadow: "0 8px 24px rgba(0,64,126,.3)", animation: "sa-fade .2s ease-out", minWidth: "260px"}}><span style={css(`width:8px;height:8px;border-radius:50%;flex-shrink:0;background: ${_t?.dot ?? ""}`)} />{I(_t?.text)}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }
}
