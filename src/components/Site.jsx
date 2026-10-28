// Public website, ported from the approved prototype "Public Website.dc.html".
// The logic class is the prototype's, unchanged; render() is its template as JSX.
// Data enters only through state and renderVals(); every string has a Telugu and an English entry in Component.T.
import React from "react";
import { I, css, list, val } from "../lib/dc";
import GCApi from "../lib/site-api";
import LEGAL from "./legal";
import config from "../lib/config";

export default class Component extends React.Component {
  static T={
    te:{taglineShort:'మన గ్రామం – మన సేవలు',getApp:'యాప్ పొందండి',nav_home:'హోమ్',nav_how:'ఎలా పనిచేస్తుంది',nav_officials:'అధికారులకు',nav_faq:'ప్రశ్నలు',nav_contact:'సంప్రదించండి',
      heroBadge:'ఆంధ్రప్రదేశ్ గ్రామాల కోసం తయారైంది',heroTitle:'మీ ఊరి ప్రతి వార్త, ఇక మీ ఫోన్‌లోనే.',heroSub:'పంచాయతీ నోటీసులు, పథకాల గడువులు, నీరు–కరెంటు సమాచారం — మీ స్థానిక అధికారులు సరిచూసి నేరుగా మీ ఫోన్‌కు పంపుతారు. తెలుగులో, ఉచితంగా, ఏ రిజిస్ట్రేషన్ లేకుండా.',free:'ప్రతి కుటుంబానికి ఉచితం',verified:'అధికారులు సరిచూసినవి',noLogin:'రిజిస్ట్రేషన్ అవసరం లేదు',
      servicesKicker:'యాప్‌లో మీకు దొరికేవి',servicesTitle:'మీ ఊరి సమాచారం అంతా ఒకే చోట',servicesSub:'వినలేకపోయిన చాటింపు నుంచి వచ్చే వారం పథకం గడువు వరకు — మీ గ్రామం, మండలం, జిల్లా సమాచారం ఒకే ఫీడ్‌లో.',
      f1:'గ్రామ చాటింపులు',f1d:'చాటింపు వినలేకపోయారా? యాప్‌లో మీ కోసం ఎదురుచూస్తుంది.',f2:'ప్రభుత్వ పథకాలు',f2d:'ఏ పథకాలకు దరఖాస్తు చేయొచ్చు, చివరి తేదీ ఎప్పుడు — ఆలస్యం కాకముందే.',f3:'గ్రామ వార్తలు & నోటీసులు',f3d:'రోడ్డు పనులు, నీటి సరఫరా, వైద్య శిబిరాలు — మీ దగ్గర ఏం మారుతోందో.',f4:'ప్రజలకు ఉపయోగకరమైన అప్‌డేట్లు',f4d:'బస్సు సమయాలు, వాతావరణ హెచ్చరికలు, రోజువారీ అప్‌డేట్లు.',f5:'గ్రామం / మండలం / జిల్లా సమాచారం',f5d:'మీ ప్రాంతానికి సంబంధించినవి మాత్రమే — అనవసరమైనవి రావు.',
      howKicker:'ఇది ఎలా పనిచేస్తుంది',howTitle:'పంచాయతీ నుంచి మీ ఫోన్ వరకు — మధ్యలో సరిచూసి',s1:'మీ పంచాయతీ రాస్తుంది',s1d:'పంచాయతీ సభ్యుడు నోటీసును యాప్‌లో పోస్ట్ చేస్తారు — ఫోటోలు ఉంటే అవి కూడా.',s2:'అధికారి సరిచూస్తారు',s2d:'గ్రామ, మండల లేదా జిల్లా అడ్మిన్ ముందుగా చదువుతారు. ఏదైనా తప్పు ఉంటే సరిచేయడానికి వెనక్కి పంపుతారు.',s3:'మీకు వెంటనే తెలుస్తుంది',s3d:'ఆమోదం పొందగానే ఊరిలో అందరి ఫోన్‌కు నోటిఫికేషన్ వస్తుంది.',howMore:'ఎలా పనిచేస్తుందో చూడండి',
      whoTitle:'ఇది ఎవరి కోసం?',a1k:'పౌరులు',a1t:'ప్రతి కుటుంబానికి',a1d:'యాప్ డౌన్‌లోడ్ చేసి మీ గ్రామం ఎంచుకోండి — అంతే. ఖాతా లేదు, పాస్‌వర్డ్ లేదు. సరిచూసిన వార్తలు మాత్రమే.',a1c:'యాప్ పొందండి',a2k:'పంచాయతీ సభ్యులు',a2t:'మీ గ్రామ గొంతుక',a2d:'నోటీసులు, పథకాల సమాచారం, ప్రకటనలు పంచుకోండి. అడ్మిన్ ఆమోదించగానే ఊరంతా చూస్తుంది.',a2c:'ఎలా పోస్ట్ చేయాలి',a3k:'అడ్మిన్లు',a3t:'గ్రామం · మండలం · జిల్లా',a3d:'మీ ప్రాంత పోస్టులను సమీక్షించండి, మీ బృందాన్ని చూసుకోండి, ఒక్క ప్రకటనతో అందరినీ చేరండి.',a3c:'అధికారుల కోసం',
      how2Title:'రాష్ట్రం → జిల్లా → మండలం → గ్రామం: ప్రతి స్థాయికి ఒక బాధ్యత',how2Sub:'సమాచారం పైనుంచి కిందకు ప్రవహిస్తుంది; ధృవీకరణ కిందనుంచి పైకి. ప్రతి స్థాయి తన పరిధిని మాత్రమే చూస్తుంది.',
      l1:'రాష్ట్రం',l1e:'ఆంధ్రప్రదేశ్',l1r:'సూపర్ అడ్మిన్',l1d:'జిల్లాలు, మండలాలు, గ్రామాల మాస్టర్ డేటా; అడ్మిన్ల నియామకం; వర్గాలు, భాషలు, ఎస్కలేషన్ సమయం వంటి సెట్టింగ్‌లు. ఏ నిర్ణయాన్నైనా సమీక్షించగలరు.',l2:'జిల్లా',l2e:'ఉదా: గుంటూరు',l2r:'జిల్లా అడ్మిన్',l2d:'జిల్లా మొత్తానికి ప్రకటనలు (వైద్య శిబిరాలు, పథకాల గడువులు). మండల అడ్మిన్లను నిర్వహిస్తారు; ఎస్కలేట్ అయిన పోస్టులను సమీక్షిస్తారు.',l3:'మండలం',l3e:'ఉదా: తెనాలి, మంగళగిరి',l3r:'మండల అడ్మిన్',l3d:'మండల స్థాయి సమాచారం (పంటల బీమా, బస్సు సమయాలు). గ్రామ అడ్మిన్లను, పంచాయతీ సభ్యులను నిర్వహిస్తారు.',l4:'గ్రామం',l4e:'ఉదా: కొలకలూరు, నందివెలుగు, పెదరావూరు',l4r:'గ్రామ అడ్మిన్ & పంచాయతీ సభ్యులు',l4d:'పంచాయతీ సభ్యులు పోస్ట్ చేస్తారు; గ్రామ అడ్మిన్ 24 గంటల్లో సమీక్షించి ప్రచురిస్తారు. ఆలస్యమైతే మండల అడ్మిన్‌కు ఎస్కలేట్ అవుతుంది.',
      offTitle:'పంచాయతీ సభ్యులు, అడ్మిన్ల కోసం',offSub:'మీ ఊరికి సమాచారం చేరవేయడం ఇప్పుడు ఒక నిమిషం పని. పోస్ట్ చేయడం, సమీక్షించడం, లాగిన్ పొందడం ఎలాగో ఇక్కడ చూడండి.',
      o1:'పోస్ట్ చేయడం',o1a:'శీర్షిక, వివరణ, వర్గం ఎంచుకొని గరిష్టంగా 3 ఫోటోలు జోడించండి.',o1b:'పంచాయతీ సభ్యుల పోస్టులు “సమీక్ష కోసం పంపబడ్డాయి” అనే స్థితిలో ఉంటాయి.',o1c:'అడ్మిన్ పోస్టులు వెంటనే ప్రచురితమవుతాయి; మండల/జిల్లా అడ్మిన్లు లక్ష్య ప్రాంతాన్ని ఎంచుకోవచ్చు.',o2:'సమీక్షించడం',o2a:'ప్రచురించండి, వ్యాఖ్యతో మళ్ళీ తనిఖీకి పంపండి లేదా కారణంతో తిరస్కరించండి.',o2b:'మళ్ళీ తనిఖీకి వచ్చిన పోస్టును సభ్యుడు సవరించి తిరిగి సమర్పించవచ్చు.',o2c:'ప్రచురించిన పోస్టును ఎప్పుడైనా తొలగించవచ్చు; ప్రతి చర్య ఆడిట్ లాగ్‌లో నమోదవుతుంది.',o3:'లాగిన్ పొందడం',o3a:'పంచాయతీ సభ్యులు: మీ గ్రామ అడ్మిన్ లేదా మండల అడ్మిన్‌ను సంప్రదించండి.',o3b:'గ్రామ అడ్మిన్లు: మీ మండల అడ్మిన్ లేదా జిల్లా అడ్మిన్‌ను సంప్రదించండి.',o3c:'మీ అడ్మిన్ మిమ్మల్ని చేర్చి యూజర్‌నేమ్, తాత్కాలిక పాస్‌వర్డ్ ఇస్తారు. మొదటి లాగిన్‌లో మీ సొంత పాస్‌వర్డ్ ఎంచుకోండి.',
      offLoginTitle:'లాగిన్ కావాలా? మీ మండల లేదా జిల్లా అడ్మిన్ ఏర్పాటు చేస్తారు.',offLoginBody:'వారెవరో తెలియదా? మాకు సందేశం పంపండి, మేం కలుపుతాం.',contactUs:'సంప్రదించండి',adminLogin:'అడ్మిన్ లాగిన్',
      faqTitle:'తరచుగా అడిగే ప్రశ్నలు',faqMore:'మీ ప్రశ్నకు జవాబు దొరకలేదా?',
      q1:'యాప్ ఉచితమేనా?',ans1:'అవును, పూర్తిగా ఉచితం. చందా లేదు, ఏమీ చెల్లించనక్కర్లేదు.',q2:'వార్తలు ధృవీకరించినవేనా?',ans2:'అవును. పంచాయతీ సభ్యుడు పోస్ట్ చేసిన ప్రతి సమాచారాన్ని గ్రామ, మండల లేదా జిల్లా అడ్మిన్ సమీక్షించిన తర్వాతే పౌరులకు కనిపిస్తుంది. అడ్మిన్లు ప్రచురించిన పోస్టులు వారి అధికారిక పాత్రతో నమోదవుతాయి.',q3:'పౌరులు లాగిన్ అవ్వాలా?',ans3:'అవసరం లేదు. యాప్ తెరిచి భాష, గ్రామం ఎంచుకుంటే చాలు. అధికారులు మాత్రమే యూజర్‌నేమ్, పాస్‌వర్డ్‌తో లాగిన్ అవుతారు.',q4:'ఏ భాషలు అందుబాటులో ఉన్నాయి?',ans4:'తెలుగు ప్రధాన భాష. హెడర్‌లోని టోగుల్‌తో ఇంగ్లీష్‌కు మారవచ్చు. పోస్టులు అడ్మిన్లు రాసిన భాషలో కనిపిస్తాయి.',q5:'నా గ్రామం యాప్‌లో లేకపోతే?',ans5:'సంప్రదించండి పేజీ ద్వారా మీ గ్రామం, మండలం తెలియజేయండి. మా బృందం చేర్చిన తర్వాత అది యాప్‌లోని గ్రామాల జాబితాలో కనిపిస్తుంది.',q6:'నోటిఫికేషన్లు ఎలా వస్తాయి?',ans6:'మీరు ఎంచుకున్న గ్రామానికి కొత్త పోస్ట్ ప్రచురితమైన వెంటనే పుష్ నోటిఫికేషన్ వస్తుంది. మండల, జిల్లా ప్రకటనలు కూడా అదే ఫీడ్‌లో కనిపిస్తాయి.',q7:'తక్కువ ధర ఫోన్లలో పనిచేస్తుందా?',ans7:'అవును. యాప్ 2GB RAM ఉన్న Android ఫోన్లలో, నెమ్మదైన 2G/3G నెట్‌వర్క్‌లో కూడా పనిచేసేలా రూపొందించాం.',
      contactTitle:'మీ మాట వినడానికి సిద్ధంగా ఉన్నాం',contactSub:'మీ గ్రామాన్ని చేర్చాలా, లాగిన్ కావాలా, లేదా ఏదైనా సరిగ్గా పనిచేయడం లేదా? కింద చెప్పండి — సాధారణంగా 2 పని దినాల్లో జవాబిస్తాం.',officeLabel:'కార్యాలయం',phoneLabel:'ఫోన్ & ఇమెయిల్',hours:'సోమ–శని 10:00–18:00',
      fName:'పేరు',fMobile:'మొబైల్ నంబర్',fVillage:'గ్రామం / మండలం',fVillagePh:'ఉదా: కొలకలూరు, తెనాలి',fMessage:'సందేశం',fSend:'పంపండి',fError:'దయచేసి మీ పేరు, 10 అంకెల మొబైల్ నంబర్, చిన్న సందేశం రాయండి.',sentTitle:'ధన్యవాదాలు — మీ సందేశం అందింది',sentBody:'త్వరలో మిమ్మల్ని సంప్రదిస్తాం,',sendAnother:'మరో సందేశం పంపండి',
      adminBody:'ఈ లాగిన్ అధికారులకు మాత్రమే. పౌరులకు లాగిన్ అవసరం లేదు – యాప్ డౌన్‌లోడ్ చేసుకోండి.',openConsole:'సూపర్ అడ్మిన్ కన్సోల్ తెరవండి',backSite:'వెబ్‌సైట్‌కు తిరిగి వెళ్ళండి',
      tickerLabel:'చాటింపు',listen:'వార్తలు వినండి',stopListen:'వినడం ఆపండి',noVoice:'ఈ బ్రౌజర్‌లో తెలుగు వాయిస్ లేదు. Microsoft Edge లేదా Android ఫోన్‌లో తెరిస్తే తెలుగులో వినిపిస్తుంది; లేదా EN నొక్కి ఇంగ్లీష్‌లో వినండి.',wordPre:'మీ ఊరి',wordPost:'ఇక మిస్ అవ్వవు.',
      appKicker:'యాప్‌లో కొత్తగా',appTitle:'వార్తలకు మించి — మీ రోజువారీ పనులకూ తోడు',appSub:'మొబైల్ యాప్‌లో ఇటీవల చేర్చినవి. అన్నీ ఉచితం, లాగిన్ అవసరం లేదు.',newTag:'కొత్తది',x1:'సేవలు & అభ్యర్థనలు',x1d:'ఆధార్, భూమి రికార్డులు లేదా సర్టిఫికెట్‌తో సహాయం కావాలా? అభ్యర్థన పంపండి — మీ గ్రామ అధికారులు మీకు కాల్ చేస్తారు.',x2:'సహాయ నంబర్లు',x2d:'పోలీసు, అంబులెన్స్, హెల్ప్‌లైన్లు, మీ స్థానిక అధికారులు — ఒక్క తాకుతో కాల్ చేయండి.',x3:'60 సెకన్ల వీడియోలు',x3d:'మీ ఊరి నుంచి చిన్న, ఉపయోగకరమైన వీడియోలు — ఒక నిమిషంలోపే.',x4:'వార్తలు వినండి',x4d:'చదవడానికి సమయం లేదా? “వినండి” నొక్కితే యాప్ నేటి వార్తలను చదివి వినిపిస్తుంది.',x5:'గడువులు మిస్ కాకండి',x5d:'పథకాల చివరి తేదీలు, రాబోయే శిబిరాలు — ఇంకా ఎన్ని రోజులో కనిపిస్తుంది.',x6:'సేవ్ & షేర్',x6d:'పోస్ట్‌ను తర్వాత చదవడానికి సేవ్ చేయండి, లేదా చిత్రంగా వాట్సాప్‌లో పంచుకోండి.',appMore:'ఇంకా: వార్తల శోధన, పెద్ద అక్షరాలు, అత్యవసర హెచ్చరికలు, కొత్త పోస్టులకు నోటిఫికేషన్లు.',q8:'యాప్ ద్వారా అధికారుల సహాయం అడగవచ్చా?',ans8:'అవును. హోమ్‌లోని “సేవలు” తెరిచి సేవను ఎంచుకుని మీ పేరు, మొబైల్ నంబర్ ఇవ్వండి. అభ్యర్థన మీ గ్రామ అధికారులకు చేరుతుంది; వారు మిమ్మల్ని సంప్రదిస్తారు.',
      formNote:'మీ వివరాలను మీకు జవాబివ్వడానికి మాత్రమే వాడతాం.',
      ctaTitle:'మీ ఊరు, మీ జేబులో.',ctaSub:'ప్రతి కుటుంబానికి ఉచితం. రిజిస్ట్రేషన్ అవసరం లేదు. నెట్ నెమ్మదిగా ఉన్నా పనిచేస్తుంది.',
      footPages:'పేజీలు',footGet:'యాప్ పొందండి',footPrivacy:'గోప్యతా విధానం',footTerms:'నిబంధనలు',toastStore:'యాప్ త్వరలో స్టోర్‌లలోకి వస్తోంది!',toastFail:'సందేశం వెళ్లలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.',toastBusy:'ఇప్పుడు చాలా సందేశాలు వస్తున్నాయి. కొన్ని నిమిషాల తర్వాత ప్రయత్నించండి.'},
    en:{taglineShort:'Our village – our services',getApp:'Get the app',nav_home:'Home',nav_how:'How It Works',nav_officials:'For Officials',nav_faq:'FAQ',nav_contact:'Contact',
      heroBadge:'Made for the villages of Andhra Pradesh',heroTitle:'Never miss what’s happening in your village.',heroSub:'Panchayat notices, scheme deadlines, water and power updates — checked by your local officials and sent straight to your phone. In Telugu, free, and no sign-up.',free:'Free for every family',verified:'Checked by officials',noLogin:'No sign-up needed',
      servicesKicker:'What you’ll find',servicesTitle:'Everything your village shares, in one place',servicesSub:'From the drum announcement you missed to next week’s scheme deadline — your village, mandal and district in one feed.',
      f1:'Village announcements',f1d:'Missed the drum? It’s waiting for you in the app.',f2:'Govt schemes',f2d:'Which schemes you can apply for, and the last date — before it’s too late.',f3:'Village news & notices',f3d:'Road works, water supply, health camps — what’s changing near you.',f4:'Public updates',f4d:'Bus timings, weather warnings and other everyday updates.',f5:'Village / Mandal / District info',f5d:'Only what matters to your area — nothing from places you don’t live.',
      howKicker:'How it works',howTitle:'From your Panchayat to your phone, checked on the way',s1:'Your Panchayat writes it',s1d:'A Panchayat member posts the notice in the app, with photos if there are any.',s2:'An official checks it',s2d:'Your Village, Mandal or District admin reads it first. If something’s wrong, it goes back for a fix.',s3:'You hear about it',s3d:'Once it’s approved, everyone in the village gets a notification on their phone.',howMore:'See how it works',
      whoTitle:'Who is it for?',a1k:'Citizens',a1t:'For every family',a1d:'Download the app, pick your village, and you’re set. No account, no password — only news that’s been checked.',a1c:'Get the app',a2k:'Panchayat members',a2t:'The voice of your village',a2d:'Share notices, scheme news and announcements. Once your admin approves, the whole village sees it.',a2c:'How to post',a3k:'Admins',a3t:'Village · Mandal · District',a3d:'Review posts from your area, look after your team, and reach everyone with one announcement.',a3c:'For officials',
      how2Title:'State → District → Mandal → Village: one responsibility at every level',how2Sub:'Information flows down; verification flows up. Each level sees only its own area.',
      l1:'State',l1e:'Andhra Pradesh',l1r:'Super Admin',l1d:'Master data for districts, mandals and villages; appointing admins; settings such as categories, languages and escalation time. Can review any decision.',l2:'District',l2e:'e.g. Guntur',l2r:'District Admin',l2d:'District-wide announcements (health camps, scheme deadlines). Manages Mandal Admins and reviews escalated posts.',l3:'Mandal',l3e:'e.g. Tenali, Mangalagiri',l3r:'Mandal Admin',l3d:'Mandal-level information (crop insurance, bus timings). Manages Village Admins and Panchayat members.',l4:'Village',l4e:'e.g. Kolakaluru, Nandivelugu, Pedaravuru',l4r:'Village Admin & Panchayat members',l4d:'Panchayat members post; the Village Admin reviews within 24 hours and publishes. If delayed, it escalates to the Mandal Admin.',
      offTitle:'For Panchayat members and admins',offSub:'Sharing news with your village now takes about a minute. Here’s how posting, reviewing and getting a login work.',
      o1:'Posting',o1a:'Choose a title, description and category, and add up to 3 photos.',o1b:'Posts by Panchayat members are marked “Sent for review”.',o1c:'Admin posts publish immediately; Mandal and District admins can pick the target area.',o2:'Reviewing',o2a:'Publish, send back for recheck with a comment, or discard with a reason.',o2b:'A member can edit and resubmit a post sent for recheck.',o2c:'Published posts can be taken down at any time; every action is recorded in the audit log.',o3:'Getting a login',o3a:'Panchayat members: contact your Village Admin or Mandal Admin.',o3b:'Village Admins: contact your Mandal Admin or District Admin.',o3c:'Your admin adds you and gives you a username and a temporary password. You choose your own password the first time you log in.',
      offLoginTitle:'Need a login? Your Mandal or District admin can set you up.',offLoginBody:'Not sure who that is? Send us a message and we’ll connect you.',contactUs:'Contact us',adminLogin:'Admin Login',
      faqTitle:'Frequently asked questions',faqMore:'Didn’t find your answer?',
      q1:'Is the app free?',ans1:'Yes, completely free. No subscription, nothing to pay.',q2:'Is the news verified?',ans2:'Yes. Everything a Panchayat member posts is reviewed by the Village, Mandal or District Admin before citizens see it. Posts by admins are recorded under their official role.',q3:'Do citizens need to log in?',ans3:'No. Open the app, choose your language and village, and you are done. Only officials log in, with a username and password.',q4:'Which languages are available?',ans4:'Telugu is the primary language. A toggle in the header switches to English. Posts appear in the language the admin wrote them in.',q5:'What if my village is not in the app?',ans5:'Tell us your village and mandal through the Contact page. Once our team adds it, it appears in the app\'s village list.',q6:'How do notifications work?',ans6:'As soon as a new post is published for your chosen village you get a push notification. Mandal and district announcements appear in the same feed.',q7:'Does it work on budget phones?',ans7:'Yes. The app is built for Android phones with 2 GB RAM and slow 2G/3G networks.',
      contactTitle:'We’d love to hear from you',contactSub:'Want your village added, need a login, or something isn’t working? Tell us below — we usually reply within 2 working days.',officeLabel:'Office',phoneLabel:'Phone & email',hours:'Mon–Sat 10:00–18:00',
      fName:'Name',fMobile:'Mobile number',fVillage:'Village / Mandal',fVillagePh:'e.g. Kolakaluru, Tenali',fMessage:'Message',fSend:'Send message',fError:'Please add your name, a 10-digit mobile number and a short message.',sentTitle:'Thanks — we’ve got your message',sentBody:'We’ll be in touch soon,',sendAnother:'Send another message',
      adminBody:'This login is for officials only. Citizens do not need to log in – just download the app.',openConsole:'Open the Super Admin console',backSite:'Back to website',
      tickerLabel:'Chatimpu',listen:'Listen to the news',stopListen:'Stop listening',noVoice:'Read-aloud isn’t available in this browser.',wordPre:'Never miss your village’s',wordPost:'',
      appKicker:'New in the app',appTitle:'More than news — help with everyday things',appSub:'Recently added to the mobile app. All free, and still no login.',newTag:'New',x1:'Services & requests',x1d:'Need help with Aadhaar, land records or a certificate? Send a request and your village officials will call you.',x2:'Help numbers',x2d:'Police, ambulance, helplines and your local officials — one tap to call.',x3:'60-second videos',x3d:'Short, useful videos from your village — a minute or less.',x4:'Listen to the news',x4d:'No time to read? Tap Listen and the app reads today’s news aloud.',x5:'Never miss a deadline',x5d:'Scheme last dates and upcoming camps, with a countdown of the days left.',x6:'Save & share',x6d:'Keep a post to read later, or share it on WhatsApp as a picture.',appMore:'Plus: news search, bigger text, urgent alerts, and notifications for new posts.',q8:'Can I ask officials for help through the app?',ans8:'Yes. Open Services on the Home screen, pick the service, and leave your name and mobile number. The request goes to your village officials, who will get in touch.',
      formNote:'We use your details only to reply to you.',
      ctaTitle:'Your village, in your pocket.',ctaSub:'Free for every family. No sign-up. Works in Telugu and English, even on a slow network.',
      footPages:'Pages',footGet:'Get the app',footPrivacy:'Privacy policy',footTerms:'Terms',toastStore:'The app is on its way to the stores — almost there!',toastFail:'That didn’t go through. Please try again.',toastBusy:'We’re getting a lot of messages right now. Please try again in a few minutes.'}
  };
  static PAGES=['home','how','officials','faq','contact','admin','privacy','terms'];
  static pageFromHash(){const h=(window.location.hash||'').replace(/^#/,'');return Component.PAGES.includes(h)?h:'home'}
  // Showcase category chips and labels; announce keeps the prototype's exact chip colours.
  static CAT={announce:{te:'గ్రామ చాటింపులు',en:'Announcements',bg:'#e4f4df',color:'#1d7a33'},schemes:{te:'ప్రభుత్వ పథకాలు',en:'Govt Schemes',bg:'#fff0dc',color:'#9a4a08'},news:{te:'వార్తలు & నోటీసులు',en:'News & Notices',bg:'#e3f0fb',color:'#0D3B7A'},updates:{te:'ప్రజా అప్‌డేట్లు',en:'Public Updates',bg:'#f1e6f7',color:'#6e3590'}};
  static MON_TE=['జన','ఫిబ్ర','మార్చి','ఏప్రి','మే','జూన్','జులై','ఆగ','సెప్టెం','అక్టో','నవం','డిసెం'];
  static MON_EN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  state={page:Component.pageFromHash(),tick:0,showcase:{},lang:'te',menuOpen:false,w:1440,faqOpen:0,form:{name:'',mobile:'',village:'',message:''},sent:false,formError:false,toast:null,site:null,sending:false};
  componentDidMount(){this._reveal();this._loadSite();this._loadShowcase(this.state.lang);this._onHash=()=>this._syncHash();this._rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;this._onScroll=()=>{if(!this._tick)this._tick=requestAnimationFrame(()=>{this._tick=0;this._scrollFx()})};this._scrollFx();this._iv=setInterval(()=>{const st=this.state;if(this._rm||document.hidden||st.page!=='home')return;this.setState({tick:st.tick+1})},3200);window.addEventListener('scroll',this._onScroll,{passive:true});window.addEventListener('hashchange',this._onHash);window.addEventListener('popstate',this._onHash);if(this._el&&window.ResizeObserver){this._ro=new ResizeObserver(en=>{const w=en[0].contentRect.width;if(Math.abs(w-this.state.w)>2)this.setState({w})});this._ro.observe(this._el)}}
  // The header floats once the page has scrolled (rAF-throttled).
  _scrollFx(){const sc=window.scrollY>8;if(sc!==!!this.state.scrolled)this.setState({scrolled:sc});
    // version D's timeline: the line fills as the day scrolls past the middle of the screen
    if(this._tl&&this._tlFill){const r=this._tl.getBoundingClientRect(),p=(window.innerHeight*0.6-r.top)/r.height;this._tlFill.style.transform='scaleY('+Math.min(1,Math.max(0,p))+')'}}
  // Sections animate every time they enter the viewport, from below when scrolling down and from above when
  // scrolling back up (CSS: .gc-reveal / .is-in and --from in pages/index.jsx).
  componentDidUpdate(){this._reveal()}
  _reveal(){if(!this._el)return;const els=this._el.querySelectorAll('.gc-reveal:not([data-watch])');if(!els.length)return;if(!window.IntersectionObserver){els.forEach(e=>e.classList.add('is-in'));return}
    if(!this._io)this._io=new IntersectionObserver(es=>es.forEach(e=>{const t=e.target;if(e.isIntersecting){t.classList.add('is-in')}else{t.style.setProperty('--from',e.boundingClientRect.top<0?'-28px':'28px');t.classList.remove('is-in')}}),{rootMargin:'0px 0px -8% 0px'});
    els.forEach(e=>{e.setAttribute('data-watch','');this._io.observe(e)})}
  componentWillUnmount(){this._dead=true;try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}clearInterval(this._iv);cancelAnimationFrame(this._tick);if(this._io)this._io.disconnect();window.removeEventListener('scroll',this._onScroll);window.removeEventListener('hashchange',this._onHash);window.removeEventListener('popstate',this._onHash);if(this._ro)this._ro.disconnect();clearTimeout(this._tt)}
  _loadSite(){if(!GCApi)return;GCApi.get('/public/site-config/').then(site=>{if(!this._dead)this.setState({site})}).catch(()=>{})}
  _loadShowcase(L){if(!GCApi||this.state.showcase[L])return;GCApi.get('/public/showcase/',{lang:L}).then(d=>{if(!this._dead&&d&&d.featured)this.setState(st=>({showcase:{...st.showcase,[L]:d}}))}).catch(()=>{})}
  // Read-aloud, like the app's Listen: today's posts in the chosen language, through the browser's own speech voices.
  static pickVoice(voices,L){const code=L==='te'?'te':'en',lang=x=>(x.lang||'').toLowerCase().replace('_','-');
    const ok=voices.filter(x=>lang(x).startsWith(code)||(L==='te'&&/telugu/i.test(x.name)));
    const rank=x=>(lang(x)===code+'-in'?2:0)+(/natural|online|google/i.test(x.name)?1:0);
    return ok.sort((a,b)=>rank(b)-rank(a))[0]||null}
  _listen(L,t,items,retry){const sp=window.speechSynthesis;if(!sp||!window.SpeechSynthesisUtterance){this.toast(t.noVoice,6000);return}
    if(this.state.speaking&&!retry){this._hush();return}
    const voices=sp.getVoices();
    if(!voices.length&&!retry){let done=false;const go=()=>{if(done)return;done=true;sp.removeEventListener('voiceschanged',go);this._listen(L,t,items,true)};sp.addEventListener('voiceschanged',go);setTimeout(go,1200);return}
    const voice=Component.pickVoice(voices,L);
    if(L==='te'&&!voice){this.toast(t.noVoice,6000);return}
    sp.cancel();const parts=items.map(p=>p.chip+'. '+p.title+'.');
    parts.forEach((txt,i)=>{const u=new SpeechSynthesisUtterance(txt);u.lang=L==='te'?'te-IN':'en-IN';if(voice)u.voice=voice;u.rate=0.95;if(i===parts.length-1){u.onend=()=>{if(!this._dead)this.setState({speaking:false})}}u.onerror=()=>{if(!this._dead)this.setState({speaking:false})};sp.speak(u)});
    this.setState({speaking:true})}
  _hush(){try{window.speechSynthesis&&window.speechSynthesis.cancel()}catch(e){}if(this.state.speaking)this.setState({speaking:false})}
  _syncHash(){this._hush();const p=Component.pageFromHash();if(p!==this.state.page){this.setState({page:p,menuOpen:false});window.scrollTo({top:0})}}
  _day(iso,L){const d=new Date(iso);if(isNaN(d))return '';const m=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'numeric',timeZone:'Asia/Kolkata'}).formatToParts(d);const day=m.find(x=>x.type==='day').value,mon=Number(m.find(x=>x.type==='month').value)-1;return day+' '+(L==='te'?Component.MON_TE:Component.MON_EN)[mon]}
  _openStore(url,t){if(url){window.open(url,'_blank','noopener')}else{this.toast(t.toastStore)}}
  _send(f,L,t){if(this.state.sending)return;const hp=this._el&&this._el.querySelector('input[name=website]');if(!GCApi){this.setState({sent:true,formError:false});return}this.setState({sending:true});GCApi.post('/public/contact-messages/',{name:f.name.trim(),mobile:f.mobile,village_text:f.village.trim(),message:f.message.trim(),language:L,website:hp?hp.value:''},{lang:L}).then(()=>{if(!this._dead)this.setState({sent:true,formError:false,sending:false})}).catch(err=>{if(this._dead)return;this.setState({sending:false});if(err&&err.status===400){this.setState({formError:true})}else{this.toast(err&&err.status===429?t.toastBusy:t.toastFail)}})}
  go(p){this._hush();if(p!==this.state.page){const url=p==='home'?window.location.pathname+window.location.search:'#'+p;try{window.history.pushState(null,'',url)}catch(e){}}this.setState({page:p,menuOpen:false});try{(this._el.closest('[style*="overflow"]')||window).scrollTo({top:0})}catch(e){}window.scrollTo({top:0})}
  toast(text,ms){this.setState({toast:text});clearTimeout(this._tt);this._tt=setTimeout(()=>this.setState({toast:null}),ms||2600)}
  renderVals(){
    const s=this.state,L=s.lang,t=Component.T[L];
    const vp=this.props.viewport||'auto';
    const frameW=vp==='mobile'?'390px':vp==='desktop'?'1440px':'100%';
    const mobile=vp==='mobile'||(vp==='auto'&&s.w<820);
    const pg={};pg[s.page]=true;
    const navItems=[['home','nav_home'],['how','nav_how'],['officials','nav_officials'],['faq','nav_faq'],['contact','nav_contact']].map(([k,lk])=>{const on=s.page===k;return {label:t[lk],on,bg:on?'#e3f0fb':'transparent',color:on?'#0D3B7A':'#17212e',go:()=>this.go(k)}});
    const icons={announce:'/assets/icon-announce.png',schemes:'/assets/icon-schemes.png',news:'/assets/icon-news.png',updates:'/assets/icon-updates.png',location:'/assets/icon-location.png'};
    const features=[['announce','f1'],['schemes','f2'],['news','f3'],['updates','f4'],['location','f5']].map(([i,k])=>({icon:icons[i],title:t[k],desc:t[k+'d']}));
    const steps=[['s1','#fff0dc','#E9791E'],['s2','#e3f0fb','#0D3B7A'],['s3','#e4f4df','#1F8A3B']].map(([k,bg,dot],i)=>({n:i+1,title:t[k],desc:t[k+'d'],bg,dot}));
    const audiences=[{k:'a1',bg:'#e4f4df',border:'#cfe9c7',accent:'#1F8A3B',go:()=>this._openStore((s.site||{}).play_store_url,t)},{k:'a2',bg:'#fff0dc',border:'#f6ddb8',accent:'#E9791E',go:()=>this.go('officials')},{k:'a3',bg:'#e3f0fb',border:'#c9dff5',accent:'#0D3B7A',go:()=>this.go('officials')}].map(a=>({kicker:t[a.k+'k'],title:t[a.k+'t'],desc:t[a.k+'d'],cta:t[a.k+'c'],bg:a.bg,border:a.border,accent:a.accent,go:a.go}));
    const levels=[['l1','S','#0A2550'],['l2','D','#0D3B7A'],['l3','M','#07818e'],['l4','V','#1F8A3B']].map(([k,short,bg],i)=>({name:t[k],example:t[k+'e'],role:t[k+'r'],desc:t[k+'d'],short,bg,indent:mobile?'0':(i*36)+'px'}));
    const offCards=['o1','o2','o3'].map(k=>({title:t[k],items:['a','b','c'].map(x=>({text:t[k+x]}))}));
    // Newer mobile-app features (citizen side), shown in "New in the app". Icons are simple line drawings.
    const appFeatures=[['x1','#e3f0fb','#0D3B7A',true,'M9 12h6M9 16h4M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 8h6'],
      ['x2','#e4f4df','#1F8A3B',true,'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2z'],
      ['x3','#fff0dc','#E9791E',true,'M10 8.5v7l6-3.5-6-3.5zM5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z'],
      ['x4','#f1e6f7','#6e3590',false,'M11 5 6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14'],
      ['x5','#fde8e6','#b3261e',false,'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM12 14v3'],
      ['x6','#e3f0fb','#0D3B7A',false,'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z']
    ].map(([k,bg,color,fresh,icon])=>({title:t[k],desc:t[k+'d'],bg,color,fresh,icon}));
    const faqs=[1,2,3,4,5,6,7,8].map((n,i)=>{const open=s.faqOpen===i;return {q:t['q'+n],a:t['ans'+n],open,iconBg:open?'#0D3B7A':'#eef2f6',iconColor:open?'#fff':'#0A2550',rot:open?'rotate(45deg)':'none',toggle:()=>this.setState({faqOpen:open?-1:i})}});
    // Hero ticker: the newest published posts (showcase API); without data, three sample notices.
    const card=p=>{const c=Component.CAT[p.category]||Component.CAT.updates;return {chip:c[L],title:p.title,meta:[this._day(p.published_at,L),p.area&&p.area.name].filter(Boolean).join(' · ')}};
    const sc=s.showcase[L];
    const sample=L==='te'?[{category:'announce',title:'తాగునీటి సరఫరా సమయం మార్పు',published_at:'2026-10-14',area:{name:'కొలకలూరు'}},{category:'schemes',title:'రేషన్ కార్డు శిబిరం – అక్టోబర్ 18',published_at:'2026-10-13',area:{name:'తెనాలి'}},{category:'news',title:'రోడ్డు మరమ్మతు నోటీసు',published_at:'2026-10-12',area:{name:'గుంటూరు'}}]
      :[{category:'announce',title:'Drinking water timing change',published_at:'2026-10-14',area:{name:'Kolakaluru'}},{category:'schemes',title:'Ration card camp – 18 Oct',published_at:'2026-10-13',area:{name:'Tenali'}},{category:'news',title:'Road repair notice',published_at:'2026-10-12',area:{name:'Guntur'}}];
    const feed=sc&&sc.featured?[sc.featured].concat(sc.items||[]).slice(0,3).map(card):sample.map(card);
    const f=s.form;
    const site=s.site||{};
    const addr=(site['office_address_'+L]||'BVT Grama Connect, 2nd Floor, Collectorate Road,\nGuntur – 522004, Andhra Pradesh').split('\n');
    const contact={addr1:addr[0]||'',addr2:addr.slice(1).join(' '),phone:site.phone||'+91 863 223 4567',hours:site['hours_'+L]||t.hours,email:site.email||'help@bvtgramaconnect.in'};
    const consoleUrl=config.consoleUrl||'/console/';
    // Hero: the word that changes every few seconds, and the brand line around the photo.
    const WORD={te:{announce:'చాటింపులు',schemes:'ప్రభుత్వ పథకాలు',news:'వార్తలు & నోటీసులు',updates:'ప్రజా అప్‌డేట్లు'},en:{announce:'announcements',schemes:'govt schemes',news:'news & notices',updates:'public updates'}};
    const words=['announce','schemes','news','updates'].map(k=>({text:WORD[L][k],color:Component.CAT[k].color,icon:icons[k]}));
    const ring='BVT GRAMA CONNECT  •  CONNECTING VILLAGES  •  EMPOWERING INDIA  •  ';
        // version D: one day in the village, each moment tied to a feature (index into appFeatures)
    const DAY=L==='te'?{title:'ఊరిలో ఒక రోజు — యాప్‌తో',m:[[3,'ఉ. 6:30','ఉదయం టీ తాగుతూనే — నేటి వార్తలను యాప్ చదివి వినిపిస్తుంది.'],[0,'ఉ. 10:00','ఆధార్, భూమి రికార్డులు, సర్టిఫికెట్లు — ఏ సేవ కావాలన్నా అభ్యర్థన పంపండి; అధికారులే మీకు కాల్ చేస్తారు.'],[2,'మ. 1:00','విరామంలో 60 సెకన్ల వీడియోలు చూడండి — ఆరోగ్యం, భద్రత, గ్రామ సభపై ఉపయోగకరమైన చిట్కాలు.'],[4,'సా. 4:00','పథకాల చివరి తేదీలు, రాబోయే శిబిరాలు — ఇంకా ఎన్ని రోజులో యాప్ గుర్తుచేస్తుంది, ఏ గడువూ మిస్ అవ్వదు.'],[5,'రా. 7:00','నచ్చిన పోస్టును సేవ్ చేయండి, లేదా కుటుంబం, ఇరుగుపొరుగుతో వాట్సాప్‌లో పంచుకోండి.'],[1,'ఎప్పుడైనా','అవసరమైనప్పుడు — పోలీసు, అంబులెన్స్, హెల్ప్‌లైన్లు, మీ అధికారులు ఒక్క తాకుతో.']]}
      :{title:'A day in the village, with the app',m:[[3,'6:30 am','Over morning tea, the app reads today’s news aloud.'],[0,'10:00 am','Aadhaar, land records, certificates — whatever you need, send a request and the officials call you back.'],[2,'1:00 pm','Take a break with 60-second videos — useful tips on health, safety and your Gram Sabha.'],[4,'4:00 pm','Scheme last dates and upcoming camps — the app counts down the days, so no deadline slips by.'],[5,'7:00 pm','Save a post for later, or share it with family and neighbours on WhatsApp.'],[1,'Any time','When it matters — police, ambulance, helplines and your officials, one tap away.']]};
    return {page:s.page,te:L==='te',day:{title:DAY.title,ref:el=>{this._tl=el;if(el)this._scrollFx()},fillRef:el=>{this._tlFill=el},items:DAY.m.map(([k,time,story])=>({...appFeatures[k],time,story}))},
speaking:!!s.speaking,listen:()=>this._listen(L,t,feed),wordIdx:s.tick,word:words[s.tick%words.length],ringText:ring,scrolled:!!s.scrolled,rootRef:el=>{this._el=el},frameW,headLh:L==='te'?'1.4':'1.15',desktop:!mobile,mobile,menuOpen:mobile&&s.menuOpen,menuIcon:s.menuOpen?'M18 6L6 18M6 6l12 12':'M4 7h16M4 12h16M4 17h16',langMargin:mobile?'auto':'0',
      t,pg,navItems,langLabel:L==='te'?'EN':'తెలుగు',toggleLang:()=>{this._hush();const nl=L==='te'?'en':'te';this.setState({lang:nl});this._loadShowcase(nl)},toggleMenu:()=>this.setState(st=>({menuOpen:!st.menuOpen})),
      goHome:()=>this.go('home'),goHow:()=>this.go('how'),goContact:()=>this.go('contact'),goAdmin:()=>this.go('admin'),goGetApp:()=>{this.go('home');setTimeout(()=>{const el=document.getElementById('get-app');if(el)el.scrollIntoView({behavior:'smooth',block:'center'})},80)},goPrivacy:()=>this.go('privacy'),goTerms:()=>this.go('terms'),
      legal:(s.page==='privacy'||s.page==='terms')?(()=>{const doc=LEGAL[L][s.page],fill=x=>x.replace('{email}',contact.email).replace('{phone}',contact.phone);
        return {title:doc.title,updated:doc.updated,intro:doc.intro,note:LEGAL[L].note,sections:doc.sections.map(x=>({h:x.h,body:x.body.map(b=>Array.isArray(b)?{list:b.map(fill)}:{text:fill(b)})}))}})():null,playClick:()=>this._openStore(site.play_store_url,t),appClick:()=>this._openStore(site.app_store_url,t),adminOtp:()=>{window.location.href=consoleUrl},contact,consoleUrl,
      features,appFeatures,steps,audiences,levels,offCards,faqs,feed,showFooter:s.page!=='admin',
      form:f,onField:e=>{const {name,value}=e.target;this.setState(st=>({form:{...st.form,[name]:name==='mobile'?value.replace(/\D/g,'').slice(0,10):value},formError:false}))},
      submitForm:()=>{if(!f.name.trim()||f.mobile.length<10||!f.message.trim()){this.setState({formError:true});return}this._send(f,L,t)},resetForm:()=>this.setState({sent:false,form:{name:'',mobile:'',village:'',message:''}}),sent:s.sent,notSent:!s.sent,formError:s.formError,
      toast:{show:!!s.toast,text:s.toast||''}};
  }

  render() {
    const v = this.renderVals();
    // Shared look, in the app's own colours: navy headings, blue actions, green/orange/yellow accents.
    const ink = "#0A2550", blue = "#0D3B7A", green = "#1F8A3B", muted = "#4A5868", line = "#E3E8DF", cream = "#F6F8F3";
    const display = "'Rubik','Telugu UI','Noto Sans Telugu',sans-serif";
    // Type scale. Telugu sits one step below English at every size (the Telugu UI face already runs small and dense).
    const fs = v.te ? {xs: "11.5px", sm: "12px", base: "14px", md: "16px", lg: "18px", xl: "20px"} : {xs: "12px", sm: "13px", base: "15px", md: "17px", lg: "19px", xl: "22px"};
    const wrap = {maxWidth: "1180px", margin: "0 auto", padding: "0 clamp(16px,4vw,40px)"};
    const h2 = {margin: "0", fontFamily: display, fontWeight: "700", fontSize: v.te ? "clamp(22px,2.3vw,30px)" : "clamp(24px,2.6vw,34px)", lineHeight: v.headLh, letterSpacing: v.te ? "0" : "-0.01em", color: ink, textWrap: "balance"};
    const h1 = {...h2, fontSize: v.te ? "clamp(26px,3vw,38px)" : "clamp(28px,3.4vw,44px)"};
    const kicker = {fontSize: fs.xs, fontWeight: "700", letterSpacing: v.te ? "0" : ".08em", textTransform: "uppercase", color: green};
    const lead = {margin: "0", fontSize: v.te ? "clamp(14px,1.1vw,16px)" : "clamp(15px,1.2vw,17px)", lineHeight: v.te ? "1.75" : "1.6", color: muted, maxWidth: "620px", textWrap: "pretty"};
    const pill = {height: "46px", padding: "0 20px", borderRadius: "999px", fontWeight: "700", fontSize: v.te ? "13px" : "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px"};
    const pillDark = {...pill, border: "1.5px solid " + blue, background: blue, color: "#fff"};
    const pillLight = {...pill, border: "1.5px solid " + blue, background: "#fff", color: blue};
    const appHead = (id, title, dark, center) => <div style={{display: "flex", flexDirection: "column", gap: "10px", maxWidth: "680px", alignItems: center ? "center" : "flex-start"}}><div style={kicker}>{I(v.t?.appKicker)}</div><h2 id={id} style={{...h2, color: dark ? "#fff" : ink}}>{I(title)}</h2><p style={{...lead, color: dark ? "rgba(255,255,255,.78)" : muted}}>{I(v.t?.appSub)}</p></div>;
    const tricolour = <span aria-hidden="true" style={{display: "flex", height: "10px", width: "30px", borderRadius: "2px", overflow: "hidden", border: "1px solid rgba(0,0,0,.06)"}}><span style={{flex: "1", background: "#E9791E"}} /><span style={{flex: "1", background: "#fff"}} /><span style={{flex: "1", background: green}} /></span>;
    const badgeLight = {display: "inline-flex", alignItems: "center", gap: "8px", alignSelf: "flex-start", padding: "6px 12px 6px 8px", borderRadius: "999px", background: "#e4f4df", color: "#1d7a33", fontSize: fs.xs, fontWeight: "700"};
    const ticks = (color, tick, justify) => <div style={{display: "flex", flexWrap: "wrap", justifyContent: justify, gap: "6px 18px", fontSize: fs.sm, fontWeight: "600", color}}>{[v.t?.free, v.t?.verified, v.t?.noLogin].map((x, i) => <span key={i} style={{display: "inline-flex", alignItems: "center", gap: "6px"}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={tick} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>{I(x)}</span>)}</div>;
    const textBtn = {background: "none", border: "0", padding: "0", color: blue, fontWeight: "700", fontSize: v.te ? "13px" : "14px", cursor: "pointer"};
    const field = {height: "46px", padding: "0 14px", border: "1px solid #cfd8e3", borderRadius: "12px", fontSize: "15px", background: "#fff", color: "#17212e", outlineColor: blue};
    const playIcon = <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#32BBFF" d="M3.6 1.9 13.7 12 3.6 22.1c-.4-.2-.6-.6-.6-1.1V3c0-.5.2-.9.6-1.1z" /><path fill="#00D86E" d="M3.6 1.9c.3-.2.8-.2 1.2 0l11.9 6.9-3 3.2z" /><path fill="#FFC700" d="m16.7 8.8 3.6 2.1c.8.5.8 1.7 0 2.2l-3.6 2.1-3-3.2z" /><path fill="#FF3A44" d="m13.7 12 3 3.2-11.9 6.9c-.4.2-.9.2-1.2 0z" /></svg>;
    const appleIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" /></svg>;
    const storeLabelFn = (cap, name) => <span style={{display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: "1.1", textAlign: "left"}}><span style={{fontSize: "10px", fontWeight: "600", letterSpacing: ".04em", opacity: ".75"}}>{cap}</span><span style={{fontSize: "16px", fontWeight: "700", letterSpacing: "-.01em"}}>{name}</span></span>;
    const storeOnLight = (
      <div style={{display: "flex", flexWrap: "wrap", gap: "12px"}}>
        <button className="gc-pill" onClick={v.playClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid " + ink, background: ink, color: "#fff"}}>{playIcon}{storeLabelFn("GET IT ON", "Google Play")}</button>
        <button className="gc-pill" onClick={v.appClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid " + ink, background: "#fff", color: ink}}>{appleIcon}{storeLabelFn("Download on the", "App Store")}</button>
      </div>
    );
    // The three steps, as coloured columns joined by thin rules (home and How it works).
    const stepsGrid = (
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "1px", background: "#cfd8e3", border: "1px solid #cfd8e3", borderRadius: "20px", overflow: "hidden"}}>
        {list(v.steps).map((_s, _i1) => (
          <div key={_i1} className="gc-step gc-reveal" style={{"--d": _i1 * 80 + "ms", background: _s?.bg, padding: "clamp(20px,2.2vw,26px)", display: "flex", flexDirection: "column", gap: "10px", minHeight: "190px"}}>
            <span className="gc-dot" style={{width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: _s?.dot, color: "#fff", fontFamily: display, fontWeight: "700", fontSize: "15px"}}>{I(_s?.n)}</span>
            <div style={{fontFamily: display, fontWeight: "700", fontSize: "clamp(18px,1.6vw,21px)", lineHeight: v.headLh, color: ink}}>{I(_s?.title)}</div>
            <div style={{fontSize: fs.base, lineHeight: v.te ? "1.7" : "1.6", color: muted}}>{I(_s?.desc)}</div>
          </div>
        ))}
      </div>
    );
    return (
      <div ref={v.rootRef} className="gc-site" data-screen-label={v.page} style={{width: "100%", maxWidth: v.frameW, margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflowX: "clip", background: cream, color: "#17212e", fontFamily: "'Nunito Sans','Telugu UI','Noto Sans Telugu',sans-serif"}}>
        {/* HEADER */}
        <header style={{position: "sticky", top: "0", zIndex: "30", padding: v.scrolled ? "12px clamp(10px,2vw,24px) 0" : "0", transition: "padding .35s var(--ease-out)"}}>
          <div style={{position: "relative", overflow: "hidden", maxWidth: v.scrolled ? "1140px" : "100%", margin: "0 auto", background: v.scrolled ? "rgba(255,255,255,.82)" : "#fff", backdropFilter: "saturate(180%) blur(16px)", WebkitBackdropFilter: "saturate(180%) blur(16px)", border: "1px solid " + (v.scrolled ? "rgba(10,37,80,.07)" : "transparent"), borderBottomColor: v.scrolled ? "rgba(10,37,80,.07)" : line, borderRadius: v.scrolled ? "16px" : "0", boxShadow: v.scrolled ? "0 1px 2px rgba(10,37,80,.05), 0 10px 30px -12px rgba(10,37,80,.22)" : "none", transition: "max-width .4s var(--ease-out), border-radius .35s var(--ease-out), box-shadow .35s ease, background-color .35s ease"}}>
          <div style={{...wrap, padding: v.scrolled ? "0 14px 0 18px" : wrap.padding, height: v.scrolled ? "60px" : "72px", display: "flex", alignItems: "center", gap: "14px", transition: "height .3s var(--ease-out)"}}>
            <button onClick={v.goHome} style={{display: "flex", alignItems: "center", gap: "10px", background: "none", border: "0", padding: "0", cursor: "pointer", color: ink}}>
              <img src="/assets/logo-mark.png" alt="" style={{width: "40px", height: "40px", borderRadius: "18.5%"}} />
              <span style={{textAlign: "left"}}>
                <span style={{display: "block", fontFamily: display, fontWeight: "700", fontSize: fs.base, letterSpacing: ".03em", lineHeight: "1.15", whiteSpace: "nowrap"}}>BVT GRAMA CONNECT</span>
                <span style={{display: "block", fontSize: fs.xs, fontWeight: "700", color: green}}>{I(v.t?.taglineShort)}</span>
              </span>
            </button>
            {v.desktop ? <nav aria-label="Main" style={{display: "flex", gap: "2px", marginLeft: "auto"}}>
                {list(v.navItems).map((_n, _i1) => (
                  <button key={_i1} className="gc-nav" onClick={_n?.go} aria-current={_n?.on ? "page" : undefined} style={{height: "38px", padding: "0 12px", border: "0", borderRadius: "999px", cursor: "pointer", fontSize: fs.base, fontWeight: "700", background: _n?.bg, color: _n?.color}}>{I(_n?.label)}</button>
                ))}
              </nav> : null}
            <button className="gc-lang" onClick={v.toggleLang} aria-label={v.te ? "Switch to English" : "తెలుగుకు మార్చండి"} style={{marginLeft: v.langMargin, height: "36px", padding: "0 12px 0 10px", border: "1.5px solid " + blue, borderRadius: "999px", background: "#fff", color: blue, fontWeight: "700", fontSize: fs.sm, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px"}}>
              <svg className="gc-globe" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M2.5 12h19M12 2.5c2.6 2.6 4 6 4 9.5s-1.4 6.9-4 9.5c-2.6-2.6-4-6-4-9.5s1.4-6.9 4-9.5z" /></svg>
              {I(v.langLabel)}
            </button>
            {v.desktop ? <button className="gc-pill" onClick={v.goGetApp} style={{...pillDark, height: "40px", padding: "0 18px", fontSize: fs.base}}>{I(v.t?.getApp)}</button> : null}
            {v.mobile ? <button onClick={v.toggleMenu} aria-label="Menu" aria-expanded={v.menuOpen} style={{width: "44px", height: "44px", border: "0", background: "none", cursor: "pointer", color: ink, display: "flex", alignItems: "center", justifyContent: "center"}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={v.menuIcon} /></svg>
              </button> : null}
          </div>
          {v.menuOpen ? <nav aria-label="Main" style={{display: "flex", flexDirection: "column", padding: "8px 16px 16px", gap: "2px", borderTop: "1px solid " + line, animation: "mk-fade .15s ease-out"}}>
              {list(v.navItems).map((_n, _i1) => (
                <button key={_i1} className="gc-nav" onClick={_n?.go} aria-current={_n?.on ? "page" : undefined} style={{height: "48px", padding: "0 14px", border: "0", borderRadius: "12px", cursor: "pointer", fontSize: fs.base, fontWeight: "700", textAlign: "left", background: _n?.bg, color: _n?.color}}>{I(_n?.label)}</button>
              ))}
              <button className="gc-pill" onClick={v.goGetApp} style={{...pillDark, marginTop: "8px"}}>{I(v.t?.getApp)}</button>
            </nav> : null}
          </div>
        </header>
        <main style={{flex: "1", display: "flex", flexDirection: "column"}}>
          {/* HOME */}
          {v.pg?.home ? <>
            {/* Hero: a rotating word, the village photo ringed by turning text, and a chatimpu ticker of the newest posts */}
            <section style={{position: "relative", overflow: "hidden", background: cream}}>
                <div style={{...wrap, padding: "clamp(40px,6vw,88px) clamp(16px,4vw,40px) clamp(40px,6vw,72px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(32px,5vw,64px)"}}>
                  <div style={{flex: "1 1 520px", minWidth: "0", display: "flex", flexDirection: "column", gap: "20px"}}>
                    <span className="gc-reveal" style={{...badgeLight, "--d": "0ms"}}>{tricolour}{I(v.t?.heroBadge)}</span>
                    <h1 className="gc-reveal" style={{"--d": "90ms", ...h2, fontWeight: v.te ? "700" : "800", fontSize: v.te ? "clamp(30px,4vw,52px)" : "clamp(36px,4.8vw,64px)", lineHeight: v.headLh}}>
                      {I(v.t?.wordPre)}{" "}
                      <span style={{display: "inline-block", verticalAlign: "bottom", overflow: "hidden", paddingBottom: ".06em"}}>
                        <span key={v.wordIdx} className="gc-word" style={{display: "inline-flex", alignItems: "center", gap: ".25em", color: v.word.color}}><img src={v.word.icon} alt="" style={{width: ".85em", height: ".85em", borderRadius: "50%", flexShrink: "0"}} />{I(v.word.text)}</span>
                      </span>
                      {v.t?.wordPost ? <>{" "}{I(v.t.wordPost)}</> : null}
                    </h1>
                    <p className="gc-reveal" style={{"--d": "180ms", ...lead}}>{I(v.t?.heroSub)}</p>
                    <div className="gc-reveal" style={{"--d": "270ms"}}>{storeOnLight}</div>
                    <div className="gc-reveal" style={{"--d": "360ms"}}>{ticks(muted, green, "flex-start")}</div>
                  </div>
                  <div className="gc-reveal" style={{"--d": "200ms", flex: "0 1 400px", minWidth: "0", margin: "0 auto", position: "relative", width: "min(100%,400px)", aspectRatio: "1"}}>
                    <svg className="gc-spin" viewBox="0 0 400 400" aria-hidden="true" style={{position: "absolute", inset: "0", width: "100%", height: "100%"}}>
                      <defs><path id="gc-ring" d="M200 200 m-182 0 a182 182 0 1 1 364 0 a182 182 0 1 1 -364 0" /></defs>
                      <text style={{fontFamily: display, fontWeight: "700", fontSize: fs.base, letterSpacing: "3px", fill: ink}}><textPath href="#gc-ring" textLength="1140" lengthAdjust="spacing">{v.ringText}</textPath></text>
                    </svg>
                    <div style={{position: "absolute", inset: "13%", borderRadius: "50%", overflow: "hidden", boxShadow: "0 30px 60px -30px rgba(10,37,80,.5)"}}>
                      <img src="/assets/village-square.jpg" alt="" width="632" height="632" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                    </div>
                    <button className={"gc-speak" + (v.speaking ? " is-on" : "")} onClick={v.listen} aria-pressed={v.speaking} aria-label={v.speaking ? v.t?.stopListen : v.t?.listen} title={v.speaking ? v.t?.stopListen : v.t?.listen} style={{position: "absolute", right: "15%", bottom: "15%", width: "72px", height: "72px", padding: "0", border: "0", borderRadius: "50%", background: v.speaking ? ink : "#f2dd3d", color: v.speaking ? "#f2dd3d" : ink, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 12px 24px -10px rgba(10,37,80,.4)"}}>
                      {v.speaking ? <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2.5" /></svg>
                        : <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>}
                    </button>
                  </div>
                </div>
                {/* chatimpu ticker: the newest titles, scrolling; pauses on hover */}
                <div style={{background: ink, color: "#fff", display: "flex", alignItems: "stretch", overflow: "hidden"}}>
                  <span style={{flexShrink: "0", display: "flex", alignItems: "center", gap: "8px", padding: "0 18px", background: "#E9791E", fontWeight: "700", fontSize: fs.sm, position: "relative", zIndex: "1"}}>
                    <span aria-hidden="true" className="gc-live" style={{width: "8px", height: "8px", borderRadius: "50%", background: "#fff"}} />{I(v.t?.tickerLabel)}
                  </span>
                  <div className="gc-ticker" style={{flex: "1", overflow: "hidden", padding: "14px 0"}}>
                    <div className="gc-ticker-track" style={{display: "flex", width: "max-content"}}>
                      {[0, 1].map(copy => (
                        <div key={copy} aria-hidden={copy === 1} style={{display: "flex", gap: "40px", paddingRight: "40px", whiteSpace: "nowrap", fontSize: fs.base}}>
                          {list(v.feed).map((_p, _i1) => <span key={_i1}><b style={{color: "#f2dd3d", fontWeight: "700"}}>{I(_p?.chip)}</b>{" · "}{I(_p?.title)}{_p?.meta ? <span style={{opacity: ".65"}}>{" · " + _p.meta}</span> : null}</span>)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

            {/* Services: a ruled list */}
            <section style={{background: "#fff", borderTop: "1px solid " + line, borderBottom: "1px solid " + line, padding: "clamp(48px,7vw,88px) 0"}}>
              <div style={{...wrap, display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,64px)"}}>
                <div className="gc-reveal" style={{flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "12px"}}>
                  <div style={kicker}>{I(v.t?.servicesKicker)}</div>
                  <h2 style={h2}>{I(v.t?.servicesTitle)}</h2>
                  <p style={lead}>{I(v.t?.servicesSub)}</p>
                </div>
                <div style={{flex: "1 1 520px", minWidth: "0", borderBottom: "1px solid " + line}}>
                  {list(v.features).map((_f, _i1) => (
                    <div key={_i1} className="gc-row gc-reveal" style={{"--d": _i1 * 60 + "ms", display: "flex", gap: "16px", alignItems: "flex-start", padding: "16px 0", borderTop: "1px solid " + line}}>
                      <img src={_f?.icon} alt="" style={{width: "38px", height: "38px", borderRadius: "50%", flexShrink: "0"}} />
                      <div>
                        <div style={{fontFamily: display, fontWeight: "600", fontSize: fs.md, lineHeight: "1.4", color: ink}}>{I(_f?.title)}</div>
                        <div style={{marginTop: "3px", fontSize: fs.base, lineHeight: v.te ? "1.7" : "1.55", color: muted}}>{I(_f?.desc)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* New in the app: a day in the village. Each moment is one app feature; the line fills as you scroll */}
            <section aria-labelledby="app-title-d" style={{padding: "clamp(48px,7vw,88px) 0 0"}}>
                <div style={{...wrap, display: "flex", flexDirection: "column", gap: "clamp(28px,4vw,48px)"}}>
                  <div className="gc-reveal" style={{textAlign: v.mobile ? "left" : "center", display: "flex", justifyContent: v.mobile ? "flex-start" : "center"}}>{appHead("app-title-d", v.day.title, false, !v.mobile)}</div>
                  <div ref={v.day.ref} style={{position: "relative", display: "flex", flexDirection: "column", gap: v.mobile ? "16px" : "6px"}}>
                    <span aria-hidden="true" style={{position: "absolute", top: "8px", bottom: "8px", left: v.mobile ? "19px" : "50%", width: "2px", marginLeft: "-1px", background: line}}><span ref={v.day.fillRef} style={{display: "block", height: "100%", background: green, transform: "scaleY(0)", transformOrigin: "50% 0"}} /></span>
                    {list(v.day.items).map((_d, _i1) => {
                      const right = !v.mobile && _i1 % 2 === 1;
                      return (
                        <div key={_i1} className="gc-reveal gc-moment" style={{"--from": "28px", position: "relative", display: "flex", justifyContent: right ? "flex-end" : "flex-start", paddingLeft: v.mobile ? "48px" : "0", color: _d?.color}}>
                          <span className="gc-tl-dot" aria-hidden="true" style={{position: "absolute", top: "24px", left: v.mobile ? "12px" : "calc(50% - 8px)", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", border: "3px solid currentColor", boxSizing: "border-box"}} />
                          <div className="gc-moment-card" style={{boxSizing: "border-box", width: v.mobile ? "100%" : "calc(50% - 44px)", background: "#fff", color: ink, border: "1px solid " + line, borderRadius: "20px", padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px"}}>
                            <span style={{display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap"}}>
                              <span style={{padding: "4px 10px", borderRadius: "999px", background: _d?.bg, color: _d?.color, fontSize: fs.xs, fontWeight: "800"}}>{I(_d?.time)}</span>
                              <span style={{display: "inline-flex", alignItems: "center", gap: "6px", fontSize: fs.sm, fontWeight: "700", color: _d?.color}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={_d?.icon} /></svg>{I(_d?.title)}</span>
                            </span>
                            <span style={{fontFamily: display, fontWeight: "600", fontSize: fs.md, lineHeight: v.headLh, color: ink}}>{I(_d?.story)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="gc-reveal" style={{...lead, fontSize: fs.base, maxWidth: "none", textAlign: v.mobile ? "left" : "center"}}>{I(v.t?.appMore)}</p>
                </div>
              </section>

            {/* How it works: three coloured columns in a white panel */}
            <section style={{padding: "clamp(48px,7vw,88px) 0"}}>
              <div style={{...wrap, display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,32px)"}}>
                <div style={{display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "12px"}}>
                  <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
                    <div style={kicker}>{I(v.t?.howKicker)}</div>
                    <h2 className="gc-reveal" style={h2}>{I(v.t?.howTitle)}</h2>
                  </div>
                  <button className="gc-pill" onClick={v.goHow} style={pillLight}>{I(v.t?.howMore)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
                </div>
                {stepsGrid}
                <p style={{...lead, fontSize: fs.base, maxWidth: "none"}}>{I(v.t?.how2Sub)}</p>
              </div>
            </section>
            {/* Who it is for: each audience marked by its brand accent */}
            <section style={{background: "#fff", borderTop: "1px solid " + line, borderBottom: "1px solid " + line, padding: "clamp(48px,7vw,88px) 0"}}>
              <div style={{...wrap, display: "flex", flexDirection: "column", gap: "clamp(20px,3vw,32px)"}}>
                <h2 className="gc-reveal" style={h2}>{I(v.t?.whoTitle)}</h2>
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(20px,3vw,36px)"}}>
                  {list(v.audiences).map((_a, _i1) => (
                    <div key={_i1} className="gc-reveal" style={{"--d": _i1 * 90 + "ms", borderTop: "3px solid " + _a?.accent, paddingTop: "18px", display: "flex", flexDirection: "column", gap: "8px"}}>
                      <div style={{...kicker, color: _a?.accent}}>{I(_a?.kicker)}</div>
                      <div style={{fontFamily: display, fontWeight: "700", fontSize: fs.lg, lineHeight: v.headLh, color: ink}}>{I(_a?.title)}</div>
                      <div style={{fontSize: fs.base, lineHeight: v.te ? "1.7" : "1.6", color: muted, flex: "1"}}>{I(_a?.desc)}</div>
                      <button onClick={_a?.go} style={{...textBtn, color: _a?.accent, alignSelf: "flex-start", marginTop: "6px"}}>{I(_a?.cta)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            {/* Download: a green panel on the page, so it never runs into the footer's tricolour strip */}
            <section id="get-app" style={{padding: "clamp(40px,6vw,72px) 0"}}>
              <div style={{...wrap}}>
                <div className="gc-reveal" style={{position: "relative", overflow: "hidden", borderRadius: "24px", background: green, color: "#fff", padding: "clamp(28px,4vw,48px)", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "24px 40px", boxShadow: "0 20px 44px -24px rgba(31,138,59,.6)"}}>
                  {/* Announcement waves: a drum's sound spreading out, the app's own idea of "chatimpu" */}
                  <svg aria-hidden="true" width="480" height="480" viewBox="0 0 480 480" fill="none" style={{position: "absolute", right: "-240px", bottom: "-240px", pointerEvents: "none"}}>
                    {[70, 120, 170, 220].map((r, i) => <circle key={r} cx="240" cy="240" r={r} stroke="#fff" strokeOpacity={0.18 - i * 0.035} strokeWidth="1.5" />)}
                    <circle cx="240" cy="240" r="34" fill="#f2dd3d" fillOpacity=".9" />
                  </svg>
                  <div style={{position: "relative", display: "flex", alignItems: "center", gap: "18px", flex: "1 1 420px", minWidth: "0"}}>
                    <span style={{flexShrink: "0", width: "64px", height: "64px", borderRadius: "20px", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px -8px rgba(0,0,0,.3)"}}>
                      <img src="/assets/logo-mark.png" alt="" style={{width: "48px", height: "48px", borderRadius: "18.5%"}} />
                    </span>
                    <div style={{display: "flex", flexDirection: "column", gap: "6px", minWidth: "0"}}>
                      <h2 style={{...h2, color: "#fff", fontSize: "clamp(22px,2.4vw,30px)"}}>{I(v.t?.ctaTitle)}</h2>
                      <p style={{...lead, fontSize: fs.base, color: "rgba(255,255,255,.9)"}}>{I(v.t?.ctaSub)}</p>
                    </div>
                  </div>
                  <div style={{position: "relative", display: "flex", flexWrap: "wrap", gap: "12px"}}>
                    <button className="gc-pill" onClick={v.playClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid #fff", background: "#fff", color: ink}}>{playIcon}{storeLabelFn("GET IT ON", "Google Play")}</button>
                    <button className="gc-pill" onClick={v.appClick} style={{...pill, height: "54px", padding: "0 22px 0 16px", gap: "10px", borderRadius: "14px", border: "1.5px solid rgba(255,255,255,.75)", background: "rgba(255,255,255,.08)", color: "#fff"}}>{appleIcon}{storeLabelFn("Download on the", "App Store")}</button>
                  </div>
                </div>
              </div>
            </section>
          </> : null}
          {/* HOW IT WORKS */}
          {v.pg?.how ? <>
            <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(24px,4vw,48px)"}}>
              <div style={{...wrap, display: "flex", flexDirection: "column", gap: "16px", animation: "mk-fade .25s ease-out"}}>
                <div style={kicker}>{I(v.t?.nav_how)}</div>
                <h1 style={{...h1, maxWidth: "900px"}}>{I(v.t?.how2Title)}</h1>
                <p style={lead}>{I(v.t?.how2Sub)}</p>
              </div>
            </section>
            <section style={{padding: "0 0 clamp(40px,6vw,72px)"}}>
              <div style={{...wrap}}>
                <div style={{borderBottom: "1px solid " + line}}>
                  {list(v.levels).map((_l, _i1) => (
                    <div key={_i1} className="gc-reveal" style={{"--d": _i1 * 70 + "ms", display: "flex", flexWrap: "wrap", gap: "16px 32px", padding: "28px 0", borderTop: "1px solid " + line}}>
                      <div style={{display: "flex", alignItems: "center", gap: "14px", flex: "0 0 260px"}}>
                        <span style={{width: "44px", height: "44px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: fs.base, background: _l?.bg, color: "#fff"}}>{I(_l?.short)}</span>
                        <span>
                          <span style={{display: "block", fontFamily: display, fontWeight: "700", fontSize: fs.lg, color: ink}}>{I(_l?.name)}</span>
                          <span style={{display: "block", fontSize: fs.sm, color: muted}}>{I(_l?.example)}</span>
                        </span>
                      </div>
                      <div style={{flex: "1 1 320px", minWidth: "0"}}>
                        <div style={{fontWeight: "700", fontSize: fs.base, color: ink, marginBottom: "4px"}}>{I(_l?.role)}</div>
                        <div style={{fontSize: fs.base, lineHeight: "1.6", color: muted}}>{I(_l?.desc)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <section style={{padding: "0 0 clamp(56px,8vw,112px)"}}>
              <div style={{...wrap}}>{stepsGrid}</div>
            </section>
          </> : null}
          {/* FOR OFFICIALS */}
          {v.pg?.officials ? <>
            <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(32px,5vw,64px)"}}>
              <div style={{...wrap, display: "flex", flexWrap: "wrap", gap: "clamp(28px,4vw,56px)", alignItems: "center", animation: "mk-fade .25s ease-out"}}>
                <div style={{flex: "1 1 420px", display: "flex", flexDirection: "column", gap: "16px"}}>
                  <div style={kicker}>{I(v.t?.nav_officials)}</div>
                  <h1 style={h1}>{I(v.t?.offTitle)}</h1>
                  <p style={lead}>{I(v.t?.offSub)}</p>
                </div>
                <div style={{flex: "1 1 320px", borderRadius: "24px", overflow: "hidden"}}>
                  <img src="/assets/village-wide.jpg" alt="" width="774" height="482" loading="lazy" style={{width: "100%", height: "320px", objectFit: "cover", objectPosition: "center 60%", display: "block"}} />
                </div>
              </div>
            </section>
            <section style={{padding: "0 0 clamp(40px,6vw,72px)"}}>
              <div style={{...wrap, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(24px,3vw,40px)"}}>
                {list(v.offCards).map((_c, _i1) => (
                  <div key={_i1} className="gc-reveal" style={{"--d": _i1 * 90 + "ms", borderTop: "3px solid " + blue, paddingTop: "18px", display: "flex", flexDirection: "column", gap: "14px"}}>
                    <div style={{fontFamily: display, fontWeight: "700", fontSize: fs.lg, color: ink}}>{I(_c?.title)}</div>
                    {list(_c?.items).map((_i, _i2) => (
                      <div key={_i2} style={{display: "flex", gap: "10px", fontSize: fs.base, lineHeight: "1.55", color: muted}}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F8A3B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{flexShrink: "0", marginTop: "3px"}}><path d="M20 6L9 17l-5-5" /></svg>
                        <span>{I(_i?.text)}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </section>
            <section style={{padding: "0 0 clamp(56px,8vw,112px)"}}>
              <div style={{...wrap}}>
                <div style={{background: blue, color: "#fff", borderRadius: "24px", padding: "clamp(28px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center"}}>
                  <div style={{flex: "1 1 380px"}}>
                    <div style={{fontFamily: display, fontWeight: "700", fontSize: "clamp(19px,2vw,24px)", lineHeight: v.headLh}}>{I(v.t?.offLoginTitle)}</div>
                    <div style={{marginTop: "10px", fontSize: fs.base, lineHeight: "1.6", color: "rgba(255,255,255,.85)"}}>{I(v.t?.offLoginBody)}</div>
                  </div>
                  <div style={{display: "flex", flexWrap: "wrap", gap: "10px"}}>
                    <button className="gc-pill" onClick={v.goContact} style={{...pill, border: "1.5px solid #fff", background: "#fff", color: blue}}>{I(v.t?.contactUs)}</button>
                    <button className="gc-pill" onClick={v.goAdmin} style={{...pill, border: "1.5px solid rgba(255,255,255,.7)", background: "transparent", color: "#fff"}}>{I(v.t?.adminLogin)}</button>
                  </div>
                </div>
              </div>
            </section>
          </> : null}
          {/* FAQ */}
          {v.pg?.faq ? <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
              <div style={{...wrap, maxWidth: "900px", display: "flex", flexDirection: "column", gap: "clamp(24px,4vw,48px)", animation: "mk-fade .25s ease-out"}}>
                <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                  <div style={kicker}>FAQ</div>
                  <h1 style={h1}>{I(v.t?.faqTitle)}</h1>
                </div>
                <div style={{borderBottom: "1px solid " + line}}>
                  {list(v.faqs).map((_f, _i1) => (
                    <div key={_i1} style={{borderTop: "1px solid " + line}}>
                      <button className="gc-faq" onClick={_f?.toggle} aria-expanded={_f?.open} style={{display: "flex", alignItems: "center", gap: "16px", width: "100%", minHeight: "60px", padding: "16px 0", border: "0", background: "none", cursor: "pointer", textAlign: "left", color: ink}}>
                        <span style={{flex: "1", fontFamily: display, fontWeight: "600", fontSize: fs.md, lineHeight: "1.4"}}>{I(_f?.q)}</span>
                        <span style={{width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", transition: "transform .2s ease-out, background-color .2s", background: _f?.iconBg, color: _f?.iconColor, transform: _f?.rot}}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
                        </span>
                      </button>
                      {_f?.open ? <div style={{padding: "0 48px 22px 0", fontSize: fs.base, lineHeight: "1.65", color: muted, animation: "mk-fade .2s ease-out"}}>{I(_f?.a)}</div> : null}
                    </div>
                  ))}
                </div>
                <div style={{fontSize: fs.base, color: muted}}>
                  {I(v.t?.faqMore)}{" "}
                  <button onClick={v.goContact} style={textBtn}>{I(v.t?.contactUs)}{" "}<span className="gc-arrow" aria-hidden="true">→</span></button>
                </div>
              </div>
            </section> : null}
          {/* CONTACT */}
          {v.pg?.contact ? <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
              <div style={{...wrap, display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,72px)", alignItems: "flex-start", animation: "mk-fade .25s ease-out"}}>
                <div style={{flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "18px"}}>
                  <h1 style={h1}>{I(v.t?.contactTitle)}</h1>
                  <p style={lead}>{I(v.t?.contactSub)}</p>
                  <div style={{marginTop: "8px", borderBottom: "1px solid " + line}}>
                    <div style={{padding: "18px 0", borderTop: "1px solid " + line, fontSize: fs.base, lineHeight: "1.6", color: muted}}>
                      <div style={{...kicker, marginBottom: "6px"}}>{I(v.t?.officeLabel)}</div>
                      {I(v.contact?.addr1)}<br />{I(v.contact?.addr2)}
                    </div>
                    <div style={{padding: "18px 0", borderTop: "1px solid " + line, fontSize: fs.base, lineHeight: "1.6", color: muted}}>
                      <div style={{...kicker, marginBottom: "6px"}}>{I(v.t?.phoneLabel)}</div>
                      <span style={{color: ink, fontWeight: "500"}}>{I(v.contact?.phone)}</span>{" · "}{I(v.contact?.hours)}<br />{I(v.contact?.email)}
                    </div>
                  </div>
                </div>
                <div style={{flex: "1 1 420px", background: "#fff", borderRadius: "24px", padding: "clamp(24px,3vw,40px)", boxShadow: "0 1px 2px rgba(17,17,17,.04), 0 12px 32px -12px rgba(17,17,17,.08)"}}>
                  {v.sent ? <div role="status" style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "12px", padding: "24px 0", animation: "mk-fade .25s ease-out"}}>
                      <span style={{width: "56px", height: "56px", borderRadius: "50%", background: green, display: "flex", alignItems: "center", justifyContent: "center"}}>
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>
                      </span>
                      <div style={{fontFamily: display, fontWeight: "700", fontSize: fs.xl, color: ink}}>{I(v.t?.sentTitle)}</div>
                      <div style={{fontSize: fs.base, lineHeight: "1.6", color: muted, maxWidth: "360px"}}>{I(v.t?.sentBody)}{" "}<b style={{color: ink}}>{I(v.form?.name)}</b>{", +91 "}{I(v.form?.mobile)}</div>
                      <button className="gc-pill" onClick={v.resetForm} style={{...pillLight, marginTop: "8px"}}>{I(v.t?.sendAnother)}</button>
                    </div> : null}
                  {v.notSent ? <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
                      <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                        <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fName)}</span>
                        <input name="name" autoComplete="name" value={val(v.form?.name, "")} onChange={v.onField} style={field} />
                      </label>
                      <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                        <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fMobile)}</span>
                        <input name="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength="10" value={val(v.form?.mobile, "")} onChange={v.onField} placeholder="98765 43210" style={field} />
                      </label>
                      <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                        <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fVillage)}</span>
                        <input name="village" value={val(v.form?.village, "")} onChange={v.onField} placeholder={v.t?.fVillagePh} style={field} />
                      </label>
                      <label style={{display: "flex", flexDirection: "column", gap: "6px"}}>
                        <span style={{fontSize: fs.sm, fontWeight: "700", color: ink}}>{I(v.t?.fMessage)}</span>
                        <textarea name="message" rows="4" value={val(v.form?.message, "")} onChange={v.onField} style={{...field, height: "auto", padding: "12px 14px", lineHeight: "1.5", resize: "vertical"}} />
                      </label>
                      <input name="website" tabIndex="-1" autoComplete="off" aria-hidden="true" style={{position: "absolute", left: "-10000px", width: "1px", height: "1px", opacity: "0"}} />
                      {v.formError ? <div role="alert" style={{fontSize: fs.base, color: "#b3261e", fontWeight: "500"}}>{I(v.t?.fError)}</div> : null}
                      <button className="gc-pill" onClick={v.submitForm} style={{...pillDark, height: "48px", fontSize: fs.base, marginTop: "4px"}}>{I(v.t?.fSend)}</button>
                      <p style={{margin: "0", fontSize: fs.sm, lineHeight: "1.5", color: muted, textAlign: "center"}}>{I(v.t?.formNote)}{" "}<button onClick={v.goPrivacy} style={{...textBtn, fontSize: fs.sm, textDecoration: "underline", textUnderlineOffset: "3px"}}>{I(v.t?.footPrivacy)}</button></p>
                    </div> : null}
                </div>
              </div>
            </section> : null}
          {/* PRIVACY POLICY / TERMS: one document layout */}
          {v.legal ? <section style={{padding: "clamp(48px,7vw,96px) 0 clamp(56px,8vw,112px)"}}>
              <article style={{...wrap, maxWidth: "800px", display: "flex", flexDirection: "column", gap: "clamp(24px,3vw,32px)", animation: "mk-fade .25s ease-out"}}>
                <header style={{display: "flex", flexDirection: "column", gap: "12px"}}>
                  <h1 style={h1}>{I(v.legal.title)}</h1>
                  <div style={{fontSize: fs.sm, fontWeight: "600", color: muted}}>{I(v.legal.updated)}</div>
                  <p style={{...lead, maxWidth: "none"}}>{I(v.legal.intro)}</p>
                  {v.legal.note ? <p style={{margin: "0", fontSize: fs.sm, color: muted}}>{I(v.legal.note)}</p> : null}
                </header>
                {v.legal.sections.map((sec, i) => (
                  <section key={i} className="gc-reveal" style={{borderTop: "1px solid " + line, paddingTop: "22px", display: "flex", flexDirection: "column", gap: "10px"}}>
                    <h2 style={{...h2, fontSize: "clamp(18px,1.8vw,21px)"}}><span style={{color: green, marginRight: "8px"}}>{i + 1}.</span>{I(sec.h)}</h2>
                    {sec.body.map((b, j) => b.list
                      ? <ul key={j} style={{margin: "0", paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: fs.base, lineHeight: v.te ? "1.75" : "1.65", color: muted}}>{b.list.map((li, k) => <li key={k}>{I(li)}</li>)}</ul>
                      : <p key={j} style={{margin: "0", fontSize: fs.base, lineHeight: v.te ? "1.75" : "1.65", color: muted}}>{I(b.text)}</p>)}
                  </section>
                ))}
                <div style={{borderTop: "1px solid " + line, paddingTop: "22px", display: "flex", flexWrap: "wrap", gap: "12px"}}>
                  <button className="gc-pill" onClick={v.goContact} style={pillDark}>{I(v.t?.contactUs)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
                  <button className="gc-pill" onClick={v.page === "privacy" ? v.goTerms : v.goPrivacy} style={pillLight}>{I(v.page === "privacy" ? v.t?.footTerms : v.t?.footPrivacy)}</button>
                </div>
              </article>
            </section> : null}
          {/* ADMIN LOGIN */}
          {v.pg?.admin ? <section style={{flex: "1", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(32px,5vw,64px) clamp(16px,4vw,40px)"}}>
              <div style={{width: "100%", maxWidth: "420px", background: "#fff", borderRadius: "24px", padding: "clamp(24px,4vw,40px)", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "0 1px 2px rgba(17,17,17,.04), 0 12px 32px -12px rgba(17,17,17,.12)", animation: "mk-fade .25s ease-out"}}>
                <img src="/assets/logo-mark.png" alt="" style={{width: "48px", height: "48px", borderRadius: "18.5%"}} />
                <h1 style={{...h2, fontSize: fs.xl}}>{I(v.t?.adminLogin)}</h1>
                <div style={{fontSize: fs.base, color: muted, lineHeight: "1.55"}}>{I(v.t?.adminBody)}</div>
<button className="gc-pill" onClick={v.adminOtp} style={pillDark}>{I(v.t?.openConsole)}{" "}<span className="gc-arrow" aria-hidden="true">›</span></button>
                <button onClick={v.goHome} style={{background: "none", border: "0", color: muted, fontWeight: "500", cursor: "pointer", fontSize: fs.base}}>{"← "}{I(v.t?.backSite)}</button>
              </div>
            </section> : null}
        </main>
        {/* FOOTER */}
        {v.showFooter ? <footer style={{background: ink, color: "#fff"}}>
            <div aria-hidden="true" style={{height: "5px", display: "flex"}}><span style={{flex: "1", background: "#E9791E"}} /><span style={{flex: "1", background: "#fff"}} /><span style={{flex: "1", background: green}} /></div>
            <div style={{...wrap, padding: "clamp(32px,5vw,48px) clamp(16px,4vw,40px) 24px", display: "flex", flexDirection: "column", gap: "28px"}}>
              <div style={{display: "flex", flexWrap: "wrap", gap: "24px 40px", justifyContent: "space-between", alignItems: "flex-start"}}>
                <div style={{display: "flex", flexDirection: "column", gap: "10px", flex: "1 1 280px"}}>
                  <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                    <img src="/assets/logo-mark.png" alt="" style={{width: "36px", height: "36px", borderRadius: "18.5%"}} />
                    <span style={{fontFamily: display, fontWeight: "700", fontSize: fs.base, letterSpacing: ".03em"}}>BVT GRAMA CONNECT</span>
                  </div>
                  <div style={{fontFamily: display, fontWeight: "700", fontSize: fs.md, color: "#f2dd3d"}}>ప్రతి గ్రామం... ప్రతి కుటుంబం... మన లక్ష్యం!</div>
                </div>
                <nav aria-label="Footer" style={{display: "flex", flexWrap: "wrap", gap: "8px 20px", alignItems: "center"}}>
                  {list(v.navItems).map((_n, _i1) => (
                    <button key={_i1} onClick={_n?.go} style={{background: "none", border: "0", padding: "6px 0", color: "rgba(255,255,255,.9)", fontSize: fs.base, cursor: "pointer"}}>{I(_n?.label)}</button>
                  ))}
                </nav>
              </div>
              <div style={{borderTop: "1px solid rgba(255,255,255,.15)", paddingTop: "18px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "10px", fontSize: fs.sm, color: "rgba(255,255,255,.7)"}}>
                <span>© 2026 BVT Grama Connect · Andhra Pradesh · Connecting Villages, Empowering India</span>
                <span style={{display: "flex", gap: "16px"}}><button onClick={v.goPrivacy} style={{background: "none", border: "0", padding: "0", color: "inherit", fontSize: fs.sm, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px"}}>{I(v.t?.footPrivacy)}</button><button onClick={v.goTerms} style={{background: "none", border: "0", padding: "0", color: "inherit", fontSize: fs.sm, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: "3px"}}>{I(v.t?.footTerms)}</button></span>
              </div>
            </div>
          </footer> : null}
        {v.toast?.show ? <div role="status" style={{position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", background: ink, color: "#fff", padding: "12px 20px", borderRadius: "999px", fontSize: fs.base, fontWeight: "700", boxShadow: "0 8px 24px rgba(0,64,126,.3)", zIndex: "50", animation: "mk-fade .2s ease-out", maxWidth: "calc(100vw - 32px)", textAlign: "center"}}>{I(v.toast?.text)}</div> : null}
      </div>
    );
  }
}
