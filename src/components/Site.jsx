// Public website, ported from the approved prototype "Public Website.dc.html".
// The logic class is the prototype's, unchanged; render() is its template as JSX.
// Data enters only through state and renderVals(); every string has a Telugu and an English entry in Component.T.
import React from "react";
import { I, css, list, val } from "../lib/dc";
import GCApi from "../lib/site-api";
import config from "../lib/config";

export default class Component extends React.Component {
  static T={
    te:{taglineShort:'మన గ్రామం – మన సేవలు',getApp:'యాప్ పొందండి',nav_home:'హోమ్',nav_how:'ఇది ఎలా పనిచేస్తుంది',nav_officials:'అధికారుల కోసం',nav_faq:'ప్రశ్నలు',nav_contact:'సంప్రదించండి',
      heroBadge:'ఆంధ్రప్రదేశ్ గ్రామాల కోసం',heroTitle:'గ్రామ చాటింపు & ప్రభుత్వ సమాచారం – మీ మొబైల్‌లోనే!',heroSub:'Village announcements and government information, right on your mobile. Verified by your Panchayat and local administration – in Telugu, free, no login needed.',free:'పూర్తిగా ఉచితం',verified:'అధికారులు ధృవీకరించిన వార్తలు',noLogin:'లాగిన్ అవసరం లేదు',
      servicesKicker:'మా సేవలు',servicesTitle:'ఐదు సేవలు – ఒకే యాప్‌లో',servicesSub:'మీ గ్రామం, మండలం, జిల్లా నుంచి వచ్చే ప్రతి ముఖ్యమైన సమాచారం ఒకే చోట.',
      f1:'గ్రామ చాటింపులు',f1d:'ప్రకటనలు, నోటీసులు, ముఖ్యమైన సమాచారం – చాటింపు వినకపోయినా యాప్‌లో చూడండి.',f2:'ప్రభుత్వ పథకాలు',f2d:'పథకాలు, అర్హతలు, దరఖాస్తు చివరి తేదీలు – సకాలంలో మీకు.',f3:'గ్రామ వార్తలు & నోటీసులు',f3d:'రోడ్డు పనులు, నీటి సరఫరా, శిబిరాలు – మీ గ్రామ తాజా వార్తలు.',f4:'ప్రజలకు ఉపయోగకరమైన అప్‌డేట్లు',f4d:'వైద్య శిబిరాలు, బస్సు సమయాలు, వాతావరణ హెచ్చరికలు.',f5:'గ్రామం / మండలం / జిల్లా సమాచారం',f5d:'మీ ప్రాంతానికి సంబంధించిన సమాచారం మాత్రమే – మూడు స్థాయిలలో.',
      howKicker:'ఇది ఎలా పనిచేస్తుంది',howTitle:'మూడు దశల్లో ధృవీకరించిన వార్త',s1:'పంచాయతీ పోస్ట్ చేస్తుంది',s1d:'పంచాయతీ సభ్యుడు యాప్‌లో చాటింపు లేదా నోటీసును ఫోటోలతో సమర్పిస్తారు.',s2:'అడ్మిన్ ధృవీకరిస్తారు',s2d:'గ్రామ / మండల / జిల్లా అడ్మిన్ సమీక్షించి ప్రచురిస్తారు, సవరణకు పంపుతారు లేదా తిరస్కరిస్తారు.',s3:'పౌరులకు ధృవీకరించిన వార్త',s3d:'ప్రచురించిన వెంటనే గ్రామంలోని అందరి మొబైల్‌కు నోటిఫికేషన్ వస్తుంది.',howMore:'పూర్తి వివరాలు',
      whoTitle:'ఇది ఎవరి కోసం?',a1k:'పౌరులు',a1t:'ప్రతి కుటుంబానికి',a1d:'యాప్ డౌన్‌లోడ్ చేసి మీ గ్రామం ఎంచుకోండి. లాగిన్ అవసరం లేదు. ధృవీకరించిన వార్తలు మాత్రమే కనిపిస్తాయి.',a1c:'యాప్ పొందండి',a2k:'పంచాయతీ సభ్యులు',a2t:'మీ గ్రామ గొంతుక',a2d:'చాటింపులు, నోటీసులు, పథకాల సమాచారం పోస్ట్ చేయండి. అడ్మిన్ సమీక్ష తర్వాత పౌరులకు చేరుతుంది.',a2c:'ఎలా పోస్ట్ చేయాలి',a3k:'అడ్మిన్లు',a3t:'గ్రామం · మండలం · జిల్లా',a3d:'మీ పరిధిలోని పోస్టులను సమీక్షించండి, వినియోగదారులను నిర్వహించండి, మీ ప్రాంతం మొత్తానికి ప్రకటనలు పంపండి.',a3c:'అధికారుల కోసం',
      how2Title:'రాష్ట్రం → జిల్లా → మండలం → గ్రామం: ప్రతి స్థాయికి ఒక బాధ్యత',how2Sub:'సమాచారం పైనుంచి కిందకు ప్రవహిస్తుంది; ధృవీకరణ కిందనుంచి పైకి. ప్రతి స్థాయి తన పరిధిని మాత్రమే చూస్తుంది.',
      l1:'రాష్ట్రం',l1e:'ఆంధ్రప్రదేశ్',l1r:'సూపర్ అడ్మిన్',l1d:'జిల్లాలు, మండలాలు, గ్రామాల మాస్టర్ డేటా; అడ్మిన్ల నియామకం; వర్గాలు, భాషలు, ఎస్కలేషన్ సమయం వంటి సెట్టింగ్‌లు. ఏ నిర్ణయాన్నైనా సమీక్షించగలరు.',l2:'జిల్లా',l2e:'ఉదా: గుంటూరు',l2r:'జిల్లా అడ్మిన్',l2d:'జిల్లా మొత్తానికి ప్రకటనలు (వైద్య శిబిరాలు, పథకాల గడువులు). మండల అడ్మిన్లను నిర్వహిస్తారు; ఎస్కలేట్ అయిన పోస్టులను సమీక్షిస్తారు.',l3:'మండలం',l3e:'ఉదా: తెనాలి, మంగళగిరి',l3r:'మండల అడ్మిన్',l3d:'మండల స్థాయి సమాచారం (పంటల బీమా, బస్సు సమయాలు). గ్రామ అడ్మిన్లను, పంచాయతీ సభ్యులను నిర్వహిస్తారు.',l4:'గ్రామం',l4e:'ఉదా: కొలకలూరు, నందివెలుగు, పెదరావూరు',l4r:'గ్రామ అడ్మిన్ & పంచాయతీ సభ్యులు',l4d:'పంచాయతీ సభ్యులు పోస్ట్ చేస్తారు; గ్రామ అడ్మిన్ 24 గంటల్లో సమీక్షించి ప్రచురిస్తారు. ఆలస్యమైతే మండల అడ్మిన్‌కు ఎస్కలేట్ అవుతుంది.',
      offTitle:'పంచాయతీ సభ్యులు, అడ్మిన్ల కోసం',offSub:'మీ గ్రామానికి సమాచారం చేరవేయడం ఇప్పుడు ఒక నిమిషం పని. ఎలా పోస్ట్ చేయాలో, ఎలా సమీక్షించాలో, లాగిన్ ఎలా పొందాలో ఇక్కడ తెలుసుకోండి.',
      o1:'పోస్ట్ చేయడం',o1a:'శీర్షిక, వివరణ, వర్గం ఎంచుకొని గరిష్టంగా 3 ఫోటోలు జోడించండి.',o1b:'పంచాయతీ సభ్యుల పోస్టులు “సమీక్ష కోసం పంపబడ్డాయి” అనే స్థితిలో ఉంటాయి.',o1c:'అడ్మిన్ పోస్టులు వెంటనే ప్రచురితమవుతాయి; మండల/జిల్లా అడ్మిన్లు లక్ష్య ప్రాంతాన్ని ఎంచుకోవచ్చు.',o2:'సమీక్షించడం',o2a:'ప్రచురించండి, వ్యాఖ్యతో మళ్ళీ తనిఖీకి పంపండి లేదా కారణంతో తిరస్కరించండి.',o2b:'మళ్ళీ తనిఖీకి వచ్చిన పోస్టును సభ్యుడు సవరించి తిరిగి సమర్పించవచ్చు.',o2c:'ప్రచురించిన పోస్టును ఎప్పుడైనా తొలగించవచ్చు; ప్రతి చర్య ఆడిట్ లాగ్‌లో నమోదవుతుంది.',o3:'లాగిన్ పొందడం',o3a:'పంచాయతీ సభ్యులు: మీ గ్రామ అడ్మిన్ లేదా మండల అడ్మిన్‌ను సంప్రదించండి.',o3b:'గ్రామ అడ్మిన్లు: మీ మండల అడ్మిన్ లేదా జిల్లా అడ్మిన్‌ను సంప్రదించండి.',o3c:'మీ అడ్మిన్ మీ ఈమెయిల్‌తో మిమ్మల్ని చేరుస్తారు. మీ యూజర్‌నేమ్, తాత్కాలిక పాస్‌వర్డ్ ఈమెయిల్‌లో వస్తాయి; మొదటి లాగిన్‌లో మీ సొంత పాస్‌వర్డ్ ఎంచుకోండి.',
      offLoginTitle:'లాగిన్ కావాలా? మీ మండల లేదా జిల్లా అడ్మిన్‌ను సంప్రదించండి.',offLoginBody:'ఎవరిని సంప్రదించాలో తెలియకపోతే, మా బృందం మీ గ్రామ అడ్మిన్‌తో మిమ్మల్ని కలుపుతుంది.',contactUs:'సంప్రదించండి',adminLogin:'అడ్మిన్ లాగిన్',
      faqTitle:'తరచుగా అడిగే ప్రశ్నలు',faqMore:'ఇంకా ప్రశ్నలు ఉన్నాయా?',
      q1:'యాప్ ఉచితమేనా?',ans1:'అవును. BVT Grama Connect పౌరులకు పూర్తిగా ఉచితం. ప్రకటనలు లేవు, చందా లేదు.',q2:'వార్తలు ధృవీకరించినవేనా?',ans2:'అవును. పంచాయతీ సభ్యుడు పోస్ట్ చేసిన ప్రతి సమాచారాన్ని గ్రామ, మండల లేదా జిల్లా అడ్మిన్ సమీక్షించిన తర్వాతే పౌరులకు కనిపిస్తుంది. అడ్మిన్లు ప్రచురించిన పోస్టులు వారి అధికారిక పాత్రతో నమోదవుతాయి.',q3:'పౌరులు లాగిన్ అవ్వాలా?',ans3:'అవసరం లేదు. యాప్ తెరిచి భాష, గ్రామం ఎంచుకుంటే చాలు. అధికారులు మాత్రమే యూజర్‌నేమ్, పాస్‌వర్డ్‌తో లాగిన్ అవుతారు.',q4:'ఏ భాషలు అందుబాటులో ఉన్నాయి?',ans4:'తెలుగు ప్రధాన భాష. హెడర్‌లోని టోగుల్‌తో ఇంగ్లీష్‌కు మారవచ్చు. పోస్టులు అడ్మిన్లు రాసిన భాషలో కనిపిస్తాయి.',q5:'నా గ్రామం యాప్‌లో లేకపోతే?',ans5:'సంప్రదించండి పేజీ ద్వారా మీ గ్రామం, మండలం తెలియజేయండి. మా బృందం చేర్చిన తర్వాత అది యాప్‌లోని గ్రామాల జాబితాలో కనిపిస్తుంది.',q6:'నోటిఫికేషన్లు ఎలా వస్తాయి?',ans6:'మీరు ఎంచుకున్న గ్రామానికి కొత్త పోస్ట్ ప్రచురితమైన వెంటనే పుష్ నోటిఫికేషన్ వస్తుంది. మండల, జిల్లా ప్రకటనలు కూడా అదే ఫీడ్‌లో కనిపిస్తాయి.',q7:'తక్కువ ధర ఫోన్లలో పనిచేస్తుందా?',ans7:'అవును. యాప్ 2GB RAM ఉన్న Android ఫోన్లలో, 2G/3G నెట్‌వర్క్‌లో కూడా పనిచేసేలా రూపొందించాం. ఫోటోలు తక్కువ డేటాలో లోడ్ అవుతాయి.',
      contactTitle:'మాతో మాట్లాడండి',contactSub:'మీ గ్రామాన్ని చేర్చాలా? లాగిన్ కావాలా? సమస్య నివేదించాలా? ఫారమ్ నింపండి – 2 పని దినాల్లో స్పందిస్తాము.',officeLabel:'కార్యాలయం',phoneLabel:'ఫోన్ & ఇమెయిల్',hours:'సోమ–శని 10:00–18:00',
      fName:'పేరు',fMobile:'మొబైల్ నంబర్',fVillage:'గ్రామం / మండలం',fVillagePh:'ఉదా: కొలకలూరు, తెనాలి',fMessage:'సందేశం',fSend:'పంపండి',fError:'దయచేసి పేరు, 10 అంకెల మొబైల్ నంబర్, సందేశం నింపండి.',sentTitle:'మీ సందేశం అందింది!',sentBody:'ధన్యవాదాలు',sendAnother:'మరో సందేశం పంపండి',
      adminBody:'ఈ లాగిన్ అధికారులకు మాత్రమే. పౌరులకు లాగిన్ అవసరం లేదు – యాప్ డౌన్‌లోడ్ చేసుకోండి.',adminLoginBtn:'లాగిన్ అవ్వండి',fUser:'యూజర్‌నేమ్',openConsole:'సూపర్ అడ్మిన్ కన్సోల్ తెరవండి',backSite:'వెబ్‌సైట్‌కు తిరిగి వెళ్ళండి',
      footPages:'పేజీలు',footGet:'యాప్ పొందండి',footPrivacy:'గోప్యతా విధానం',footTerms:'నిబంధనలు',toastStore:'యాప్ త్వరలో స్టోర్‌లలో విడుదల – డెమో లింక్',toastFail:'సందేశం పంపడం కుదరలేదు. మళ్ళీ ప్రయత్నించండి.',toastBusy:'చాలా సందేశాలు వచ్చాయి. కొద్దిసేపటి తర్వాత ప్రయత్నించండి.'},
    en:{taglineShort:'Our village – our services',getApp:'Get the app',nav_home:'Home',nav_how:'How It Works',nav_officials:'For Officials',nav_faq:'FAQ',nav_contact:'Contact',
      heroBadge:'For the villages of Andhra Pradesh',heroTitle:'Village announcements & government information – right on your mobile!',heroSub:'గ్రామ చాటింపు & ప్రభుత్వ సమాచారం – మీ మొబైల్‌లోనే! Verified by your Panchayat and local administration – in Telugu, free, no login needed.',free:'Completely free',verified:'Verified by officials',noLogin:'No login needed',
      servicesKicker:'Our services',servicesTitle:'Five services – one app',servicesSub:'Every important update from your village, mandal and district in one place.',
      f1:'Village announcements',f1d:'Notices, alerts and important information – even if you missed the drum announcement.',f2:'Govt schemes',f2d:'Schemes, eligibility and application deadlines, in time.',f3:'Village news & notices',f3d:'Road works, water supply, camps – the latest from your village.',f4:'Public updates',f4d:'Health camps, bus timings, weather warnings.',f5:'Village / Mandal / District info',f5d:'Only information relevant to your area – at three levels.',
      howKicker:'How it works',howTitle:'Verified news in three steps',s1:'Panchayat posts',s1d:'A Panchayat member submits an announcement or notice in the app, with photos.',s2:'Admin verifies',s2d:'The Village, Mandal or District Admin reviews it: publish, send back for recheck, or discard.',s3:'Citizens get verified news',s3d:'The moment it is published, everyone in the village gets a notification.',howMore:'See the full process',
      whoTitle:'Who is it for?',a1k:'Citizens',a1t:'For every family',a1d:'Download the app and pick your village. No login. You only ever see verified posts.',a1c:'Get the app',a2k:'Panchayat members',a2t:'The voice of your village',a2d:'Post announcements, notices and scheme information. After admin review it reaches every citizen.',a2c:'How to post',a3k:'Admins',a3t:'Village · Mandal · District',a3d:'Review posts in your area, manage users, and send announcements to your whole area.',a3c:'For officials',
      how2Title:'State → District → Mandal → Village: one responsibility at every level',how2Sub:'Information flows down; verification flows up. Each level sees only its own area.',
      l1:'State',l1e:'Andhra Pradesh',l1r:'Super Admin',l1d:'Master data for districts, mandals and villages; appointing admins; settings such as categories, languages and escalation time. Can review any decision.',l2:'District',l2e:'e.g. Guntur',l2r:'District Admin',l2d:'District-wide announcements (health camps, scheme deadlines). Manages Mandal Admins and reviews escalated posts.',l3:'Mandal',l3e:'e.g. Tenali, Mangalagiri',l3r:'Mandal Admin',l3d:'Mandal-level information (crop insurance, bus timings). Manages Village Admins and Panchayat members.',l4:'Village',l4e:'e.g. Kolakaluru, Nandivelugu, Pedaravuru',l4r:'Village Admin & Panchayat members',l4d:'Panchayat members post; the Village Admin reviews within 24 hours and publishes. If delayed, it escalates to the Mandal Admin.',
      offTitle:'For Panchayat members and admins',offSub:'Getting information to your village is now a one-minute job. Learn how to post, how to review, and how to get a login.',
      o1:'Posting',o1a:'Choose a title, description and category, and add up to 3 photos.',o1b:'Posts by Panchayat members are marked “Sent for review”.',o1c:'Admin posts publish immediately; Mandal and District admins can pick the target area.',o2:'Reviewing',o2a:'Publish, send back for recheck with a comment, or discard with a reason.',o2b:'A member can edit and resubmit a post sent for recheck.',o2c:'Published posts can be taken down at any time; every action is recorded in the audit log.',o3:'Getting a login',o3a:'Panchayat members: contact your Village Admin or Mandal Admin.',o3b:'Village Admins: contact your Mandal Admin or District Admin.',o3c:'Your admin adds you with your email. You get your username and a temporary password by email, and choose your own password at first login.',
      offLoginTitle:'Need a login? Contact your Mandal or District admin.',offLoginBody:'Not sure whom to contact? Our team will connect you with your area admin.',contactUs:'Contact us',adminLogin:'Admin Login',
      faqTitle:'Frequently asked questions',faqMore:'Still have questions?',
      q1:'Is the app free?',ans1:'Yes. BVT Grama Connect is completely free for citizens. No ads, no subscription.',q2:'Is the news verified?',ans2:'Yes. Everything a Panchayat member posts is reviewed by the Village, Mandal or District Admin before citizens see it. Posts by admins are recorded under their official role.',q3:'Do citizens need to log in?',ans3:'No. Open the app, choose your language and village, and you are done. Only officials log in, with a username and password.',q4:'Which languages are available?',ans4:'Telugu is the primary language. A toggle in the header switches to English. Posts appear in the language the admin wrote them in.',q5:'What if my village is not in the app?',ans5:'Tell us your village and mandal through the Contact page. Once our team adds it, it appears in the app\'s village list.',q6:'How do notifications work?',ans6:'As soon as a new post is published for your chosen village you get a push notification. Mandal and district announcements appear in the same feed.',q7:'Does it work on budget phones?',ans7:'Yes. The app is built for Android phones with 2 GB RAM and 2G/3G networks. Photos load in low-data mode.',
      contactTitle:'Talk to us',contactSub:'Want your village added? Need a login? Reporting a problem? Fill in the form – we respond within 2 working days.',officeLabel:'Office',phoneLabel:'Phone & email',hours:'Mon–Sat 10:00–18:00',
      fName:'Name',fMobile:'Mobile number',fVillage:'Village / Mandal',fVillagePh:'e.g. Kolakaluru, Tenali',fMessage:'Message',fSend:'Send message',fError:'Please fill in your name, a 10-digit mobile number and a message.',sentTitle:'Message received!',sentBody:'Thank you',sendAnother:'Send another message',
      adminBody:'This login is for officials only. Citizens do not need to log in – just download the app.',adminLoginBtn:'Log in',fUser:'Username',openConsole:'Open the Super Admin console',backSite:'Back to website',
      footPages:'Pages',footGet:'Get the app',footPrivacy:'Privacy policy',footTerms:'Terms',toastStore:'App coming soon to the stores – demo link',toastFail:'Could not send your message. Please try again.',toastBusy:'Too many messages. Please try again later.'}
  };
  static PAGES=['home','how','officials','faq','contact','admin'];
  static pageFromHash(){const h=(window.location.hash||'').replace(/^#/,'');return Component.PAGES.includes(h)?h:'home'}
  // Showcase category chips and labels; announce keeps the prototype's exact chip colours.
  static CAT={announce:{te:'గ్రామ చాటింపులు',en:'Announcements',bg:'#e4f4df',color:'#1d7a33'},schemes:{te:'ప్రభుత్వ పథకాలు',en:'Govt Schemes',bg:'#fff0dc',color:'#9a4a08'},news:{te:'వార్తలు & నోటీసులు',en:'News & Notices',bg:'#e3f0fb',color:'#0D3B7A'},updates:{te:'ప్రజా అప్‌డేట్లు',en:'Public Updates',bg:'#f1e6f7',color:'#6e3590'}};
  static MON_TE=['జన','ఫిబ్ర','మార్చి','ఏప్రి','మే','జూన్','జులై','ఆగ','సెప్టెం','అక్టో','నవం','డిసెం'];
  static MON_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  state={page:Component.pageFromHash(),showcase:{},lang:'te',menuOpen:false,w:1440,faqOpen:0,form:{name:'',mobile:'',village:'',message:''},sent:false,formError:false,toast:null,site:null,sending:false};
  componentDidMount(){this._loadSite();this._loadShowcase(this.state.lang);this._onHash=()=>this._syncHash();window.addEventListener('hashchange',this._onHash);window.addEventListener('popstate',this._onHash);if(this._el&&window.ResizeObserver){this._ro=new ResizeObserver(en=>{const w=en[0].contentRect.width;if(Math.abs(w-this.state.w)>2)this.setState({w})});this._ro.observe(this._el)}}
  componentWillUnmount(){this._dead=true;window.removeEventListener('hashchange',this._onHash);window.removeEventListener('popstate',this._onHash);if(this._ro)this._ro.disconnect();clearTimeout(this._tt)}
  _loadSite(){if(!GCApi)return;GCApi.get('/public/site-config/').then(site=>{if(!this._dead)this.setState({site})}).catch(()=>{})}
  _loadShowcase(L){if(!GCApi||this.state.showcase[L])return;GCApi.get('/public/showcase/',{lang:L}).then(d=>{if(!this._dead&&d&&d.featured)this.setState(st=>({showcase:{...st.showcase,[L]:d}}))}).catch(()=>{})}
  _syncHash(){const p=Component.pageFromHash();if(p!==this.state.page){this.setState({page:p,menuOpen:false});window.scrollTo({top:0})}}
  _day(iso,L){const d=new Date(iso);if(isNaN(d))return '';const m=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'numeric',timeZone:'Asia/Kolkata'}).formatToParts(d);const day=m.find(x=>x.type==='day').value,mon=Number(m.find(x=>x.type==='month').value)-1;return day+' '+(L==='te'?Component.MON_TE:Component.MON_EN)[mon]}
  _openStore(url,t){if(url){window.open(url,'_blank','noopener')}else{this.toast(t.toastStore)}}
  _send(f,L,t){if(this.state.sending)return;const hp=this._el&&this._el.querySelector('input[name=website]');if(!GCApi){this.setState({sent:true,formError:false});return}this.setState({sending:true});GCApi.post('/public/contact-messages/',{name:f.name.trim(),mobile:f.mobile,village_text:f.village.trim(),message:f.message.trim(),language:L,website:hp?hp.value:''},{lang:L}).then(()=>{if(!this._dead)this.setState({sent:true,formError:false,sending:false})}).catch(err=>{if(this._dead)return;this.setState({sending:false});if(err&&err.status===400){this.setState({formError:true})}else{this.toast(err&&err.status===429?t.toastBusy:t.toastFail)}})}
  go(p){if(p!==this.state.page){const url=p==='home'?window.location.pathname+window.location.search:'#'+p;try{window.history.pushState(null,'',url)}catch(e){}}this.setState({page:p,menuOpen:false});try{(this._el.closest('[style*="overflow"]')||window).scrollTo({top:0})}catch(e){}window.scrollTo({top:0})}
  toast(text){this.setState({toast:text});clearTimeout(this._tt);this._tt=setTimeout(()=>this.setState({toast:null}),2600)}
  renderVals(){
    const s=this.state,L=s.lang,t=Component.T[L];
    const vp=this.props.viewport||'auto';
    const frameW=vp==='mobile'?'390px':vp==='desktop'?'1440px':'100%';
    const mobile=vp==='mobile'||(vp==='auto'&&s.w<820);
    const pg={};pg[s.page]=true;
    const navItems=[['home','nav_home'],['how','nav_how'],['officials','nav_officials'],['faq','nav_faq'],['contact','nav_contact']].map(([k,lk])=>{const on=s.page===k;return {label:t[lk],bg:on?'#e3f0fb':'transparent',color:on?'#0D3B7A':'#17212e',go:()=>this.go(k)}});
    const icons={announce:'/assets/icon-announce.png',schemes:'/assets/icon-schemes.png',news:'/assets/icon-news.png',updates:'/assets/icon-updates.png',location:'/assets/icon-location.png'};
    const features=[['announce','f1'],['schemes','f2'],['news','f3'],['updates','f4'],['location','f5']].map(([i,k])=>({icon:icons[i],title:t[k],desc:t[k+'d']}));
    const steps=[['s1','#E9791E'],['s2','#0D3B7A'],['s3','#1F8A3B']].map(([k,bg],i)=>({n:i+1,title:t[k],desc:t[k+'d'],bg}));
    const audiences=[{k:'a1',bg:'#e4f4df',border:'#cfe9c7',accent:'#1F8A3B',go:()=>this._openStore((s.site||{}).play_store_url,t)},{k:'a2',bg:'#fff0dc',border:'#f6ddb8',accent:'#E9791E',go:()=>this.go('officials')},{k:'a3',bg:'#e3f0fb',border:'#c9dff5',accent:'#0D3B7A',go:()=>this.go('officials')}].map(a=>({kicker:t[a.k+'k'],title:t[a.k+'t'],desc:t[a.k+'d'],cta:t[a.k+'c'],bg:a.bg,border:a.border,accent:a.accent,go:a.go}));
    const levels=[['l1','S','#0A2550'],['l2','D','#0D3B7A'],['l3','M','#07818e'],['l4','V','#1F8A3B']].map(([k,short,bg],i)=>({name:t[k],example:t[k+'e'],role:t[k+'r'],desc:t[k+'d'],short,bg,indent:mobile?'0':(i*36)+'px'}));
    const offCards=['o1','o2','o3'].map(k=>({title:t[k],items:['a','b','c'].map(x=>({text:t[k+x]}))}));
    const faqs=[1,2,3,4,5,6,7].map((n,i)=>{const open=s.faqOpen===i;return {q:t['q'+n],a:t['ans'+n],open,iconBg:open?'#0D3B7A':'#eef2f6',iconColor:open?'#fff':'#0A2550',rot:open?'rotate(45deg)':'none',toggle:()=>this.setState({faqOpen:open?-1:i})}});
    const miniCards=[{icon:icons.schemes,title:L==='te'?'రేషన్ కార్డు శిబిరం – అక్టోబర్ 18':'Ration card camp – 18 Oct',sub:L==='te'?'ప్రభుత్వ పథకాలు · 13 అక్టో':'Govt Schemes · 13 Oct'},{icon:icons.news,title:L==='te'?'రోడ్డు మరమ్మతు నోటీసు':'Road repair notice',sub:L==='te'?'వార్తలు & నోటీసులు · 14 అక్టో':'News & Notices · 14 Oct'}];
    const sc=s.showcase[L];let phone={place:'కొలకలూరు · తెనాలి · గుంటూరు',img:'/assets/village-landscape.jpg',chip:'గ్రామ చాటింపులు',chipBg:'#e4f4df',chipColor:'#1d7a33',title:'తాగునీటి సరఫరా సమయం మార్పు',meta:'14 అక్టో · కొలకలూరు'};
    let minis=miniCards;
    if(sc&&sc.featured){const fp=sc.featured,cat=Component.CAT[fp.category]||Component.CAT.updates;phone={place:(sc.location&&(sc.location.path||sc.location.name))||phone.place,img:fp.thumbnail_url||'/assets/village-landscape.jpg',chip:cat[L],chipBg:cat.bg,chipColor:cat.color,title:fp.title,meta:this._day(fp.published_at,L)+' · '+((fp.area&&fp.area.name)||'')};
      minis=(sc.items||[]).slice(0,2).map(it=>{const c=Component.CAT[it.category]||Component.CAT.updates;return {icon:icons[it.category]||icons.updates,title:it.title,sub:c[L]+' · '+this._day(it.published_at,L)}})}
    const f=s.form;
    const site=s.site||{};
    const addr=(site['office_address_'+L]||'BVT Grama Connect, 2nd Floor, Collectorate Road,\nGuntur – 522004, Andhra Pradesh').split('\n');
    const contact={addr1:addr[0]||'',addr2:addr.slice(1).join(' '),phone:site.phone||'+91 863 223 4567',hours:site['hours_'+L]||t.hours,email:site.email||'help@bvtgramaconnect.in'};
    const consoleUrl=config.consoleUrl||'/console/';
    return {page:s.page,rootRef:el=>{this._el=el},frameW,desktop:!mobile,mobile,menuOpen:mobile&&s.menuOpen,menuIcon:s.menuOpen?'M18 6L6 18M6 6l12 12':'M4 7h16M4 12h16M4 17h16',langMargin:mobile?'auto':'0',
      t,pg,navItems,langLabel:L==='te'?'EN':'తెలుగు',toggleLang:()=>{const nl=L==='te'?'en':'te';this.setState({lang:nl});this._loadShowcase(nl)},toggleMenu:()=>this.setState(st=>({menuOpen:!st.menuOpen})),
      goHome:()=>this.go('home'),goHow:()=>this.go('how'),goContact:()=>this.go('contact'),goAdmin:()=>this.go('admin'),playClick:()=>this._openStore(site.play_store_url,t),appClick:()=>this._openStore(site.app_store_url,t),adminOtp:()=>{window.location.href=consoleUrl},contact,consoleUrl,
      features,steps,audiences,levels,offCards,faqs,miniCards:minis,phone,showFooter:s.page!=='admin',
      form:f,onField:e=>{const {name,value}=e.target;this.setState(st=>({form:{...st.form,[name]:name==='mobile'?value.replace(/\D/g,'').slice(0,10):value},formError:false}))},
      submitForm:()=>{if(!f.name.trim()||f.mobile.length<10||!f.message.trim()){this.setState({formError:true});return}this._send(f,L,t)},resetForm:()=>this.setState({sent:false,form:{name:'',mobile:'',village:'',message:''}}),sent:s.sent,notSent:!s.sent,formError:s.formError,
      toast:{show:!!s.toast,text:s.toast||''}};
  }

  render() {
    const v = this.renderVals();
    return (
      <div style={{minHeight: "100vh", display: "flex", justifyContent: "center"}}>
        <div ref={v.rootRef} data-screen-label={v.page} style={css(`width:100%;background:#F6F8F3;font-family:'Nunito Sans','Noto Sans Telugu',sans-serif;color:#17212e;display:flex;flex-direction:column;min-height:100vh;position:relative;overflow:hidden;max-width: ${v.frameW ?? ""}`)}>
          {/* HEADER */}
          <header style={{position: "sticky", top: "0", zIndex: "30", background: "rgba(246,248,243,.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #e3e8df"}}>
            {" "}
            <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", height: "72px", display: "flex", alignItems: "center", gap: "16px"}}>
              <button onClick={v.goHome} style={{display: "flex", alignItems: "center", gap: "10px", background: "none", border: "0", padding: "0", cursor: "pointer", textAlign: "left"}}>
                <img src="/assets/logo-mark.png" alt="BVT Grama Connect" style={{width: "44px", height: "44px", borderRadius: "18.5%"}} />
                <span>
                  <span style={{display: "block", fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "15px", color: "#0A2550", letterSpacing: ".03em", lineHeight: "1.1"}}>BVT GRAMA CONNECT</span>
                  <span style={{display: "block", fontSize: "11px", color: "#1F8A3B", fontWeight: "700"}}>{I(v.t?.taglineShort)}</span>
                </span>
              </button>
              {v.desktop ? <nav style={{display: "flex", gap: "4px", marginLeft: "auto"}}>
                  {list(v.navItems).map((_n, _i1) => (
                    <React.Fragment key={_i1}>
                      <button onClick={_n?.go} style={css(`height:40px;padding:0 14px;border:0;border-radius:999px;cursor:pointer;font-size:14px;font-weight:700;background: ${_n?.bg ?? ""};color: ${_n?.color ?? ""}`)}>{I(_n?.label)}</button>
                    </React.Fragment>
                  ))}
                </nav> : null}
              <button onClick={v.toggleLang} style={css(`margin-left: ${v.langMargin ?? ""};height:36px;padding:0 12px;border:1.5px solid #0D3B7A;border-radius:999px;background:#fff;color:#0D3B7A;font-weight:700;font-size:13px;cursor:pointer;font-family:'Rubik','Noto Sans Telugu',sans-serif`)}>{I(v.langLabel)}</button>
              {v.desktop ? <button onClick={v.goContact} style={{height: "40px", padding: "0 18px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer"}}>{I(v.t?.getApp)}{" ›"}</button> : null}
              {v.mobile ? <button onClick={v.toggleMenu} aria-label="Menu" style={{width: "44px", height: "44px", border: "0", background: "none", cursor: "pointer", color: "#0A2550", display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d={v.menuIcon} /></svg>
                </button> : null}
            </div>
            {" "}
            {v.menuOpen ? <>
              {" "}
              <nav style={{display: "flex", flexDirection: "column", padding: "8px 16px 16px", gap: "4px", borderTop: "1px solid #e3e8df", background: "#F6F8F3", animation: "mk-fade .15s ease-out"}}>
                {list(v.navItems).map((_n, _i1) => (
                  <React.Fragment key={_i1}>
                    <button onClick={_n?.go} style={css(`height:48px;padding:0 14px;border:0;border-radius:12px;cursor:pointer;font-size:16px;font-weight:700;text-align:left;background: ${_n?.bg ?? ""};color: ${_n?.color ?? ""}`)}>{I(_n?.label)}</button>
                  </React.Fragment>
                ))}
                <button onClick={v.goContact} style={{height: "48px", marginTop: "6px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: "pointer"}}>{I(v.t?.getApp)}{" ›"}</button>
              </nav>
              {" "}
            </> : null}
            {" "}
          </header>
          <main style={{flex: "1", display: "flex", flexDirection: "column"}}>
            {/* HOME */}
            {v.pg?.home ? <>
              <section style={{position: "relative", overflow: "hidden", background: "#fff"}}>
                {" "}
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "clamp(32px,6vw,72px) clamp(16px,4vw,40px) 0", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(24px,4vw,56px)"}}>
                  <div style={{flex: "1 1 420px", minWidth: "0", display: "flex", flexDirection: "column", gap: "18px", animation: "mk-fade .3s ease-out"}}>
                    <span style={{display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", padding: "6px 12px 6px 8px", borderRadius: "999px", background: "#e4f4df", color: "#1d7a33", fontSize: "13px", fontWeight: "700"}}>
                      <span style={{display: "flex", height: "10px", width: "30px", borderRadius: "2px", overflow: "hidden"}}>
                        <span style={{flex: "1", background: "#E9791E"}} />
                        <span style={{flex: "1", background: "#fff"}} />
                        <span style={{flex: "1", background: "#1F8A3B"}} />
                      </span>
                      {I(v.t?.heroBadge)}
                    </span>
                    <h1 style={{margin: "0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "800", fontSize: "clamp(28px,4.2vw,50px)", lineHeight: "1.2", color: "#0A2550", textWrap: "pretty"}}>{I(v.t?.heroTitle)}</h1>
                    <p style={{margin: "0", fontSize: "clamp(16px,1.4vw,19px)", lineHeight: "1.6", color: "#3b4a5c", maxWidth: "560px", textWrap: "pretty"}}>{I(v.t?.heroSub)}</p>
                    <div style={{display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px"}}>
                      <button onClick={v.playClick} style={{height: "54px", padding: "0 18px 0 14px", border: "0", borderRadius: "12px", background: "#0A2550", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", textAlign: "left"}}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                          <path d="M4 3.5v17c0 .4.4.6.7.4l9.6-8.5a.5.5 0 0 0 0-.8L4.7 3.1c-.3-.2-.7 0-.7.4zM14.9 11.3l2.6-2.3 2.9 1.6c.7.4.7 1.4 0 1.8l-2.9 1.6-2.6-2.3a.3.3 0 0 1 0-.4z" opacity=".9" />
                        </svg>
                        <span>
                          <span style={{display: "block", fontSize: "10px", opacity: ".8", letterSpacing: ".04em", textTransform: "uppercase"}}>Get it on</span>
                          <span style={{display: "block", fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "17px", lineHeight: "1.1"}}>Google Play</span>
                        </span>
                      </button>
                      <button onClick={v.appClick} style={{height: "54px", padding: "0 18px 0 14px", border: "0", borderRadius: "12px", background: "#0A2550", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px", textAlign: "left"}}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                          <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8 2.2-1.2 3-2.4c.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.7-1-2.7-3.9zM14 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.9-1 2.9 1.1.1 2.2-.6 2.8-1.4z" />
                        </svg>
                        <span>
                          <span style={{display: "block", fontSize: "10px", opacity: ".8", letterSpacing: ".04em", textTransform: "uppercase"}}>Download on the</span>
                          <span style={{display: "block", fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "17px", lineHeight: "1.1"}}>App Store</span>
                        </span>
                      </button>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", gap: "18px", fontSize: "13px", color: "#6b7a8c", marginTop: "4px"}}><span>{"✓ "}{I(v.t?.free)}</span><span>{"✓ "}{I(v.t?.verified)}</span><span>{"✓ "}{I(v.t?.noLogin)}</span></div>
                  </div>
                  <div style={{flex: "1 1 320px", minWidth: "0", display: "flex", justifyContent: "center", alignItems: "flex-end", alignSelf: "stretch", position: "relative", minHeight: "380px"}}>
                    <div style={{position: "absolute", inset: "auto 0 0 0", height: "78%", borderRadius: "32px 32px 0 0", overflow: "hidden"}}>
                      <img src="/assets/village-landscape.jpg" alt="" style={{width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 70%"}} />
                      <div style={{position: "absolute", inset: "0", background: "linear-gradient(180deg,rgba(255,255,255,.1),rgba(10,37,80,.35))"}} />
                    </div>
                    <div style={{position: "relative", width: "250px", height: "500px", background: "#0A2550", borderRadius: "36px", padding: "10px", boxShadow: "0 30px 60px rgba(10,37,80,.35)", marginBottom: "-60px"}}>
                      {" "}
                      <div style={{width: "100%", height: "100%", background: "#F6F8F3", borderRadius: "28px", overflow: "hidden", display: "flex", flexDirection: "column"}}>
                        <div style={{background: "#0D3B7A", color: "#fff", padding: "26px 14px 10px", display: "flex", alignItems: "center", gap: "8px"}}>
                          <img src="/assets/logo-mark.png" alt="" style={{width: "24px", height: "24px", borderRadius: "18.5%"}} />
                          <span style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "10px", letterSpacing: ".03em", flex: "1"}}>BVT GRAMA CONNECT</span>
                          <span style={{fontSize: "9px", border: "1px solid rgba(255,255,255,.6)", borderRadius: "999px", padding: "2px 6px"}}>EN</span>
                        </div>
                        <div style={{padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px"}}>
                          <div style={{display: "flex", alignItems: "center", gap: "6px", padding: "7px 10px", borderRadius: "999px", background: "#fff", border: "1px solid #eef2f6", fontSize: "10px", color: "#0A2550", fontWeight: "600"}}><span style={{width: "8px", height: "8px", borderRadius: "50%", background: "#1F8A3B"}} />{I(v.phone?.place)}</div>
                          <div style={{background: "#fff", borderRadius: "12px", overflow: "hidden", border: "1px solid #eef2f6"}}>
                            <img src={v.phone?.img} alt="" style={{width: "100%", height: "84px", objectFit: "cover", display: "block"}} />
                            <div style={{padding: "9px 10px"}}>
                              <span style={css(`display:inline-block;padding:2px 7px;border-radius:999px;background: ${v.phone?.chipBg ?? ""};color: ${v.phone?.chipColor ?? ""};font-size:8px;font-weight:700`)}>{I(v.phone?.chip)}</span>
                              <div style={{fontWeight: "700", fontSize: "11px", color: "#0A2550", marginTop: "5px", lineHeight: "1.3"}}>{I(v.phone?.title)}</div>
                              <div style={{fontSize: "9px", color: "#6b7a8c", marginTop: "3px"}}>{I(v.phone?.meta)}</div>
                            </div>
                          </div>
                          {list(v.miniCards).map((_c, _i1) => (
                            <React.Fragment key={_i1}>
                              <div style={{display: "flex", gap: "8px", alignItems: "center", background: "#fff", borderRadius: "12px", padding: "8px 10px", border: "1px solid #eef2f6"}}>
                                <img src={_c?.icon} alt="" style={{width: "28px", height: "28px", borderRadius: "50%"}} />
                                <span style={{flex: "1", minWidth: "0"}}>
                                  <span style={{display: "block", fontWeight: "700", fontSize: "10px", color: "#0A2550", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{I(_c?.title)}</span>
                                  <span style={{display: "block", fontSize: "8.5px", color: "#6b7a8c"}}>{I(_c?.sub)}</span>
                                </span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                        <div style={{marginTop: "auto", display: "flex", justifyContent: "space-around", padding: "8px 6px 12px", background: "#fff", borderTop: "1px solid #eef2f6", fontSize: "8px", color: "#6b7a8c", fontWeight: "700"}}><span style={{color: "#0D3B7A"}}>Home</span><span>News</span><span>Notices</span><span>Profile</span></div>
                      </div>
                      {" "}
                    </div>
                  </div>
                </div>
                {" "}
                <div style={{height: "60px", background: "#0A2550"}} />
                {" "}
              </section>
              <section style={{background: "#0A2550", color: "#fff", padding: "0 0 clamp(40px,6vw,72px)"}}>
                {" "}
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "flex", flexDirection: "column", gap: "28px"}}>
                  <div style={{display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "12px"}}>
                    <div>
                      <div style={{fontSize: "13px", fontWeight: "700", color: "#f2dd3d", letterSpacing: ".06em", textTransform: "uppercase"}}>{I(v.t?.servicesKicker)}</div>
                      <h2 style={{margin: "6px 0 0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: "700", lineHeight: "1.25"}}>{I(v.t?.servicesTitle)}</h2>
                    </div>
                    <div style={{fontSize: "15px", opacity: ".85", maxWidth: "420px", lineHeight: "1.5"}}>{I(v.t?.servicesSub)}</div>
                  </div>
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "16px"}}>
                    {list(v.features).map((_f, _i1) => (
                      <React.Fragment key={_i1}>
                        <div style={{background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "16px", padding: "22px 20px", display: "flex", flexDirection: "column", gap: "12px", minHeight: "200px"}}>
                          <img src={_f?.icon} alt="" style={{width: "56px", height: "56px", borderRadius: "50%"}} />
                          <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "18px", lineHeight: "1.3"}}>{I(_f?.title)}</div>
                          <div style={{fontSize: "14px", lineHeight: "1.55", opacity: ".85"}}>{I(_f?.desc)}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {" "}
              </section>
              <section style={{padding: "clamp(40px,6vw,80px) 0", background: "#F6F8F3"}}>
                {" "}
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "flex", flexDirection: "column", gap: "32px"}}>
                  <div style={{textAlign: "center", maxWidth: "640px", margin: "0 auto"}}>
                    <div style={{fontSize: "13px", fontWeight: "700", color: "#1F8A3B", letterSpacing: ".06em", textTransform: "uppercase"}}>{I(v.t?.howKicker)}</div>
                    <h2 style={{margin: "6px 0 0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: "700", color: "#0A2550", lineHeight: "1.25"}}>{I(v.t?.howTitle)}</h2>
                  </div>
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px"}}>
                    {list(v.steps).map((_s, _i1) => (
                      <React.Fragment key={_i1}>
                        <div style={{background: "#fff", border: "1px solid #e3e8df", borderRadius: "18px", padding: "26px 24px", display: "flex", flexDirection: "column", gap: "12px", boxShadow: "0 2px 8px rgba(0,64,126,.06)", position: "relative"}}>
                          <span style={css(`width:44px;height:44px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Rubik',sans-serif;font-weight:700;font-size:18px;background: ${_s?.bg ?? ""}`)}>{I(_s?.n)}</span>
                          <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "20px", color: "#0A2550", lineHeight: "1.3"}}>{I(_s?.title)}</div>
                          <div style={{fontSize: "15px", lineHeight: "1.6", color: "#3b4a5c"}}>{I(_s?.desc)}</div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{textAlign: "center"}}>
                    <button onClick={v.goHow} style={{height: "46px", padding: "0 22px", border: "1.5px solid #0D3B7A", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", fontSize: "15px", cursor: "pointer"}}>{I(v.t?.howMore)}{" ›"}</button>
                  </div>
                </div>
                {" "}
              </section>
              <section style={{padding: "0 0 clamp(40px,6vw,80px)", background: "#F6F8F3"}}>
                {" "}
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "flex", flexDirection: "column", gap: "28px"}}>
                  <h2 style={{margin: "0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: "700", color: "#0A2550", lineHeight: "1.25", textAlign: "center"}}>{I(v.t?.whoTitle)}</h2>
                  <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px"}}>
                    {list(v.audiences).map((_a, _i1) => (
                      <React.Fragment key={_i1}>
                        <div style={css(`border-radius:18px;padding:26px 24px;display:flex;flex-direction:column;gap:12px;background: ${_a?.bg ?? ""};border:1px solid ${_a?.border ?? ""}`)}>
                          <div style={css(`font-size:12px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color: ${_a?.accent ?? ""}`)}>{I(_a?.kicker)}</div>
                          <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "22px", color: "#0A2550"}}>{I(_a?.title)}</div>
                          <div style={{fontSize: "15px", lineHeight: "1.6", color: "#3b4a5c", flex: "1"}}>{I(_a?.desc)}</div>
                          <button onClick={_a?.go} style={css(`align-self:flex-start;height:40px;padding:0 16px;border:0;border-radius:999px;color:#fff;font-weight:700;font-size:14px;cursor:pointer;background: ${_a?.accent ?? ""}`)}>{I(_a?.cta)}{" ›"}</button>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                {" "}
              </section>
            </> : null}
            {/* HOW IT WORKS */}
            {v.pg?.how ? <>
              <section style={{background: "#fff", borderBottom: "1px solid #e3e8df"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(16px,4vw,40px)", display: "flex", flexDirection: "column", gap: "12px", animation: "mk-fade .25s ease-out"}}>
                  <div style={{fontSize: "13px", fontWeight: "700", color: "#1F8A3B", letterSpacing: ".06em", textTransform: "uppercase"}}>{I(v.t?.nav_how)}</div>
                  <h1 style={{margin: "0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "clamp(28px,3.6vw,44px)", fontWeight: "800", color: "#0A2550", lineHeight: "1.2", maxWidth: "820px", textWrap: "pretty"}}>{I(v.t?.how2Title)}</h1>
                  <p style={{margin: "0", fontSize: "17px", lineHeight: "1.6", color: "#3b4a5c", maxWidth: "720px"}}>{I(v.t?.how2Sub)}</p>
                </div>
              </section>
              <section style={{padding: "clamp(32px,5vw,64px) 0"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "flex", flexDirection: "column", gap: "14px"}}>
                  {list(v.levels).map((_l, _i1) => (
                    <React.Fragment key={_i1}>
                      <div style={css(`display:flex;flex-wrap:wrap;gap:18px;align-items:flex-start;background:#fff;border:1px solid #e3e8df;border-radius:18px;padding:22px 24px;margin-left: ${_l?.indent ?? ""}`)}>
                        <div style={{display: "flex", alignItems: "center", gap: "12px", flex: "0 0 240px"}}>
                          <span style={css(`width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Rubik',sans-serif;font-weight:700;font-size:16px;background: ${_l?.bg ?? ""}`)}>{I(_l?.short)}</span>
                          <span>
                            <span style={{display: "block", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "20px", color: "#0A2550"}}>{I(_l?.name)}</span>
                            <span style={{display: "block", fontSize: "13px", color: "#6b7a8c"}}>{I(_l?.example)}</span>
                          </span>
                        </div>
                        <div style={{flex: "1 1 300px", minWidth: "0"}}>
                          <div style={{fontWeight: "700", color: "#0A2550", marginBottom: "4px"}}>{I(_l?.role)}</div>
                          <div style={{fontSize: "15px", lineHeight: "1.6", color: "#3b4a5c"}}>{I(_l?.desc)}</div>
                        </div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>
              <section style={{padding: "0 0 clamp(40px,6vw,80px)"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px"}}>
                  {list(v.steps).map((_s, _i1) => (
                    <React.Fragment key={_i1}>
                      <div style={{background: "#0A2550", color: "#fff", borderRadius: "18px", padding: "24px", display: "flex", flexDirection: "column", gap: "10px"}}>
                        <span style={css(`width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-family:'Rubik',sans-serif;font-weight:700;background: ${_s?.bg ?? ""}`)}>{I(_s?.n)}</span>
                        <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "19px"}}>{I(_s?.title)}</div>
                        <div style={{fontSize: "14px", lineHeight: "1.6", opacity: ".85"}}>{I(_s?.desc)}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>
            </> : null}
            {/* FOR OFFICIALS */}
            {v.pg?.officials ? <>
              <section style={{background: "#fff", borderBottom: "1px solid #e3e8df"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(16px,4vw,40px)", display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "center", animation: "mk-fade .25s ease-out"}}>
                  <div style={{flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "12px"}}>
                    <div style={{fontSize: "13px", fontWeight: "700", color: "#E9791E", letterSpacing: ".06em", textTransform: "uppercase"}}>{I(v.t?.nav_officials)}</div>
                    <h1 style={{margin: "0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "clamp(28px,3.6vw,44px)", fontWeight: "800", color: "#0A2550", lineHeight: "1.2", textWrap: "pretty"}}>{I(v.t?.offTitle)}</h1>
                    <p style={{margin: "0", fontSize: "17px", lineHeight: "1.6", color: "#3b4a5c"}}>{I(v.t?.offSub)}</p>
                  </div>
                  <div style={{flex: "1 1 300px", borderRadius: "20px", overflow: "hidden", minHeight: "240px"}}>
                    <img src="/assets/village-landscape.jpg" alt="" style={{width: "100%", height: "100%", minHeight: "240px", objectFit: "cover", display: "block"}} />
                  </div>
                </div>
              </section>
              <section style={{padding: "clamp(32px,5vw,64px) 0"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "20px"}}>
                  {list(v.offCards).map((_c, _i1) => (
                    <React.Fragment key={_i1}>
                      <div style={{background: "#fff", border: "1px solid #e3e8df", borderRadius: "18px", padding: "26px 24px", display: "flex", flexDirection: "column", gap: "14px"}}>
                        <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "21px", color: "#0A2550"}}>{I(_c?.title)}</div>
                        {list(_c?.items).map((_i, _i2) => (
                          <React.Fragment key={_i2}>
                            <div style={{display: "flex", gap: "10px", fontSize: "15px", lineHeight: "1.55", color: "#3b4a5c"}}>
                              <span style={{width: "22px", height: "22px", borderRadius: "50%", background: "#e4f4df", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: "0", marginTop: "1px"}}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1F8A3B" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                              </span>
                              <span>{I(_i?.text)}</span>
                            </div>
                          </React.Fragment>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </section>
              <section style={{padding: "0 0 clamp(40px,6vw,80px)"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)"}}>
                  <div style={{background: "#0D3B7A", color: "#fff", borderRadius: "22px", padding: "clamp(24px,4vw,40px)", display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "center"}}>
                    <div style={{flex: "1 1 360px"}}>
                      <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "clamp(20px,2.4vw,28px)", lineHeight: "1.3"}}>{I(v.t?.offLoginTitle)}</div>
                      <div style={{marginTop: "8px", fontSize: "15px", lineHeight: "1.6", opacity: ".9"}}>{I(v.t?.offLoginBody)}</div>
                    </div>
                    <div style={{display: "flex", flexWrap: "wrap", gap: "10px"}}>
                      <button onClick={v.goContact} style={{height: "48px", padding: "0 20px", border: "0", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", fontSize: "15px", cursor: "pointer"}}>{I(v.t?.contactUs)}{" ›"}</button>
                      <button onClick={v.goAdmin} style={{height: "48px", padding: "0 20px", border: "1.5px solid rgba(255,255,255,.7)", borderRadius: "999px", background: "transparent", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: "pointer"}}>{I(v.t?.adminLogin)}</button>
                    </div>
                  </div>
                </div>
              </section>
            </> : null}
            {/* FAQ */}
            {v.pg?.faq ? <>
              <section style={{background: "#fff", borderBottom: "1px solid #e3e8df"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(16px,4vw,40px)", animation: "mk-fade .25s ease-out"}}>
                  <div style={{fontSize: "13px", fontWeight: "700", color: "#1F8A3B", letterSpacing: ".06em", textTransform: "uppercase"}}>FAQ</div>
                  <h1 style={{margin: "6px 0 0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "clamp(28px,3.6vw,44px)", fontWeight: "800", color: "#0A2550", lineHeight: "1.2"}}>{I(v.t?.faqTitle)}</h1>
                </div>
              </section>
              <section style={{padding: "clamp(32px,5vw,64px) 0 clamp(40px,6vw,80px)"}}>
                <div style={{maxWidth: "860px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "flex", flexDirection: "column", gap: "10px"}}>
                  {list(v.faqs).map((_f, _i1) => (
                    <React.Fragment key={_i1}>
                      <div style={{background: "#fff", border: "1px solid #e3e8df", borderRadius: "14px", overflow: "hidden"}}>
                        {" "}
                        <button onClick={_f?.toggle} style={{display: "flex", alignItems: "center", gap: "14px", width: "100%", minHeight: "60px", padding: "14px 20px", border: "0", background: "#fff", cursor: "pointer", textAlign: "left"}}>
                          <span style={{flex: "1", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "17px", color: "#0A2550", lineHeight: "1.35"}}>{I(_f?.q)}</span>
                          <span style={css(`width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s;background: ${_f?.iconBg ?? ""};color: ${_f?.iconColor ?? ""};transform: ${_f?.rot ?? ""}`)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
                          </span>
                        </button>
                        {" "}
                        {_f?.open ? <div style={{padding: "0 20px 18px", fontSize: "15px", lineHeight: "1.65", color: "#3b4a5c", animation: "mk-fade .2s ease-out"}}>{I(_f?.a)}</div> : null}
                        {" "}
                      </div>
                    </React.Fragment>
                  ))}
                  <div style={{marginTop: "20px", textAlign: "center", color: "#6b7a8c", fontSize: "15px"}}>
                    {I(v.t?.faqMore)}{" "}
                    <button onClick={v.goContact} style={{background: "none", border: "0", color: "#0D3B7A", fontWeight: "700", cursor: "pointer", fontSize: "15px", padding: "0"}}>{I(v.t?.contactUs)}{" ›"}</button>
                  </div>
                </div>
              </section>
            </> : null}
            {/* CONTACT */}
            {v.pg?.contact ? <section style={{padding: "clamp(32px,5vw,64px) 0 clamp(40px,6vw,80px)"}}>
                <div style={{maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)", display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "flex-start", animation: "mk-fade .25s ease-out"}}>
                  <div style={{flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "18px"}}>
                    <h1 style={{margin: "0", fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontSize: "clamp(28px,3.6vw,44px)", fontWeight: "800", color: "#0A2550", lineHeight: "1.2"}}>{I(v.t?.contactTitle)}</h1>
                    <p style={{margin: "0", fontSize: "16px", lineHeight: "1.6", color: "#3b4a5c"}}>{I(v.t?.contactSub)}</p>
                    <div style={{background: "#fff", border: "1px solid #e3e8df", borderRadius: "16px", padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px"}}>
                      <div style={{display: "flex", gap: "12px"}}>
                        <span style={{width: "38px", height: "38px", borderRadius: "50%", background: "#e3f0fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0D3B7A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                        </span>
                        <span style={{fontSize: "15px", lineHeight: "1.55", color: "#3b4a5c"}}><b style={{color: "#0A2550"}}>{I(v.t?.officeLabel)}</b><br />{I(v.contact?.addr1)}<br />{I(v.contact?.addr2)}</span>
                      </div>
                      <div style={{display: "flex", gap: "12px"}}>
                        <span style={{width: "38px", height: "38px", borderRadius: "50%", background: "#e4f4df", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0"}}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1F8A3B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z" />
                          </svg>
                        </span>
                        <span style={{fontSize: "15px", lineHeight: "1.55", color: "#3b4a5c"}}>
                          <b style={{color: "#0A2550"}}>{I(v.t?.phoneLabel)}</b>
                          <br />
                          {I(v.contact?.phone)}{" · "}{I(v.contact?.hours)}
                          <br />
                          {I(v.contact?.email)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div style={{flex: "1 1 380px", background: "#fff", border: "1px solid #e3e8df", borderRadius: "18px", padding: "clamp(20px,3vw,32px)", boxShadow: "0 2px 8px rgba(0,64,126,.06)"}}>
                    {" "}
                    {v.sent ? <>
                      {" "}
                      <div style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", padding: "24px 0", animation: "mk-fade .25s ease-out"}}>
                        <span style={{width: "64px", height: "64px", borderRadius: "50%", background: "#1F8A3B", display: "flex", alignItems: "center", justifyContent: "center"}}>
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        </span>
                        <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "24px", color: "#0A2550"}}>{I(v.t?.sentTitle)}</div>
                        <div style={{fontSize: "15px", lineHeight: "1.6", color: "#3b4a5c", maxWidth: "360px"}}>{I(v.t?.sentBody)}{" "}<b>{I(v.form?.name)}</b>{", +91 "}{I(v.form?.mobile)}</div>
                        <button onClick={v.resetForm} style={{marginTop: "8px", height: "44px", padding: "0 20px", border: "1.5px solid #0D3B7A", borderRadius: "999px", background: "#fff", color: "#0D3B7A", fontWeight: "700", cursor: "pointer"}}>{I(v.t?.sendAnother)}</button>
                      </div>
                      {" "}
                    </> : null}
                    {" "}
                    {v.notSent ? <>
                      {" "}
                      <div style={{display: "flex", flexDirection: "column", gap: "14px"}}>
                        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>{I(v.t?.fName)}</span>
                          <input name="name" value={val(v.form?.name, "")} onChange={v.onField} style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
                        </label>
                        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>{I(v.t?.fMobile)}</span>
                          <input name="mobile" type="tel" maxLength="10" value={val(v.form?.mobile, "")} onChange={v.onField} placeholder="98765 43210" style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
                        </label>
                        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>{I(v.t?.fVillage)}</span>
                          <input name="village" value={val(v.form?.village, "")} onChange={v.onField} placeholder={v.t?.fVillagePh} style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "15px", outlineColor: "#0D3B7A"}} />
                        </label>
                        <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                          <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>{I(v.t?.fMessage)}</span>
                          <textarea name="message" rows="4" value={val(v.form?.message, "")} onChange={v.onField} style={{padding: "12px 14px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "15px", lineHeight: "1.5", resize: "vertical", outlineColor: "#0D3B7A"}} />
                        </label>
                        <input name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{position: "absolute", left: "-10000px", width: "1px", height: "1px", opacity: "0"}} />
                        {v.formError ? <div style={{fontSize: "13px", color: "#b3261e", fontWeight: "700"}}>{I(v.t?.fError)}</div> : null}
                        <button onClick={v.submitForm} style={{height: "50px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", fontSize: "16px", cursor: "pointer"}}>{I(v.t?.fSend)}{" ›"}</button>
                      </div>
                      {" "}
                    </> : null}
                    {" "}
                  </div>
                </div>
              </section> : null}
            {/* ADMIN LOGIN PLACEHOLDER */}
            {v.pg?.admin ? <section style={{flex: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(32px,5vw,64px) clamp(16px,4vw,40px)", background: "#0A2550", position: "relative", overflow: "hidden"}}>
                <img src="/assets/village-landscape.jpg" alt="" style={{position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", opacity: ".25"}} />
                <div style={{position: "relative", width: "100%", maxWidth: "420px", background: "#fff", borderRadius: "20px", padding: "clamp(24px,4vw,36px)", display: "flex", flexDirection: "column", gap: "14px", boxShadow: "0 20px 60px rgba(0,0,0,.3)", animation: "mk-fade .25s ease-out"}}>
                  <img src="/assets/logo-mark.png" alt="" style={{width: "56px", height: "56px", borderRadius: "18.5%"}} />
                  <div style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "24px", color: "#0A2550"}}>{I(v.t?.adminLogin)}</div>
                  <div style={{fontSize: "14px", color: "#6b7a8c", lineHeight: "1.55"}}>{I(v.t?.adminBody)}</div>
                  <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                    <span style={{fontSize: "13px", fontWeight: "700", color: "#0A2550"}}>{I(v.t?.fUser)}</span>
                    <input type="text" style={{height: "48px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "15px"}} />
                  </label>
                  <button onClick={v.adminOtp} style={{height: "48px", border: "0", borderRadius: "999px", background: "#0D3B7A", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: "pointer"}}>{I(v.t?.adminLoginBtn)}{" ›"}</button>
                  <a href={v.consoleUrl} style={{textAlign: "center", fontWeight: "700", fontSize: "14px", color: "#0D3B7A", textDecoration: "none", padding: "8px"}}>{I(v.t?.openConsole)}{" ›"}</a>
                  <button onClick={v.goHome} style={{background: "none", border: "0", color: "#6b7a8c", fontWeight: "700", cursor: "pointer", fontSize: "13px"}}>{"‹ "}{I(v.t?.backSite)}</button>
                </div>
              </section> : null}
          </main>
          {/* FOOTER */}
          {v.showFooter ? <footer style={{background: "#0A2550", color: "#fff"}}>
              {" "}
              <div style={{height: "6px", display: "flex"}}>
                <span style={{flex: "1", background: "#E9791E"}} />
                <span style={{flex: "1", background: "#fff"}} />
                <span style={{flex: "1", background: "#1F8A3B"}} />
              </div>
              {" "}
              <div style={{maxWidth: "1180px", margin: "0 auto", padding: "clamp(32px,5vw,56px) clamp(16px,4vw,40px) 24px", display: "flex", flexDirection: "column", gap: "32px"}}>
                <div style={{display: "flex", flexWrap: "wrap", gap: "32px", justifyContent: "space-between"}}>
                  <div style={{flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "12px"}}>
                    <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                      <img src="/assets/logo-mark.png" alt="" style={{width: "44px", height: "44px", borderRadius: "18.5%"}} />
                      <span style={{fontFamily: "'Rubik',sans-serif", fontWeight: "700", fontSize: "16px", letterSpacing: ".03em"}}>BVT GRAMA CONNECT</span>
                    </div>
                    <div style={{fontFamily: "'Rubik','Noto Sans Telugu',sans-serif", fontWeight: "700", fontSize: "20px", color: "#f2dd3d", lineHeight: "1.4"}}>ప్రతి గ్రామం... ప్రతి కుటుంబం... మన లక్ష్యం!</div>
                    <div style={{fontSize: "14px", opacity: ".85"}}>మన గ్రామం – మన సేవలు – మన అభివృద్ధి · Connecting Villages, Empowering India</div>
                  </div>
                  <div style={{display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px"}}>
                    <div style={{fontSize: "12px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", opacity: ".7"}}>{I(v.t?.footPages)}</div>
                    {list(v.navItems).map((_n, _i1) => (
                      <React.Fragment key={_i1}>
                        <button onClick={_n?.go} style={{background: "none", border: "0", padding: "0", color: "#fff", fontSize: "15px", cursor: "pointer", textAlign: "left", opacity: ".9"}}>{I(_n?.label)}</button>
                      </React.Fragment>
                    ))}
                  </div>
                  <div style={{display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px"}}>
                    <div style={{fontSize: "12px", fontWeight: "700", letterSpacing: ".06em", textTransform: "uppercase", opacity: ".7"}}>{I(v.t?.footGet)}</div>
                    <button onClick={v.playClick} style={{background: "none", border: "0", padding: "0", color: "#fff", fontSize: "15px", cursor: "pointer", textAlign: "left", opacity: ".9"}}>Google Play</button>
                    <button onClick={v.appClick} style={{background: "none", border: "0", padding: "0", color: "#fff", fontSize: "15px", cursor: "pointer", textAlign: "left", opacity: ".9"}}>App Store</button>
                    <button onClick={v.goAdmin} style={{marginTop: "8px", alignSelf: "flex-start", height: "38px", padding: "0 14px", border: "1.5px solid rgba(255,255,255,.6)", borderRadius: "999px", background: "transparent", color: "#fff", fontWeight: "700", fontSize: "13px", cursor: "pointer"}}>{I(v.t?.adminLogin)}{" ›"}</button>
                  </div>
                </div>
                <div style={{borderTop: "1px solid rgba(255,255,255,.15)", paddingTop: "18px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "10px", fontSize: "13px", opacity: ".75"}}><span>© 2026 BVT Grama Connect · Andhra Pradesh</span><span>{I(v.t?.footPrivacy)}{" · "}{I(v.t?.footTerms)}</span></div>
              </div>
              {" "}
            </footer> : null}
          {v.toast?.show ? <div style={{position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", background: "#0A2550", color: "#fff", padding: "12px 20px", borderRadius: "999px", fontSize: "14px", fontWeight: "700", boxShadow: "0 8px 24px rgba(0,64,126,.3)", zIndex: "50", animation: "mk-fade .2s ease-out", whiteSpace: "nowrap"}}>{I(v.toast?.text)}</div> : null}
        </div>
      </div>
    );
  }
}
