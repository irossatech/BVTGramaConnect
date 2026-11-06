// Privacy policy and Terms for the public website (/privacy/, /terms/), in Telugu and English.
// Written from what the app, website and API actually collect (backend models: citizens, service_requests,
// web_public, notifications, accounts, share, audit). Section bodies: a string is a paragraph, an array is a bullet list.
// {email} and {phone} are filled from the site settings. Have it reviewed before launch, and update `updated`
// whenever the wording changes.

/** One section: a heading and its body, where a string is a paragraph and an array is a bullet list. */
export interface LegalSection {
  h: string;
  body: (string | string[])[];
}

export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

export type Lang = "te" | "en";

const LEGAL: Record<Lang, { note: string; privacy: LegalDoc; terms: LegalDoc }> = {
  te: {
    note: "తెలుగు, ఇంగ్లీష్ పాఠాల్లో తేడా ఉంటే ఇంగ్లీష్ పాఠమే చెల్లుతుంది.",
    privacy: {
      title: "గోప్యతా విధానం",
      updated: "చివరిగా నవీకరించినది: 6 నవంబర్ 2026",
      intro: "Grama Connect యాప్, ఈ వెబ్‌సైట్ మీ గురించి ఏ సమాచారం సేకరిస్తాయి, ఎందుకు, ఎవరు చూడగలరు, దాని గురించి మీరు ఏం చేయవచ్చో ఈ పేజీ సులభమైన మాటల్లో చెబుతుంది. పౌరులు ఖాతా లేకుండానే యాప్ వాడవచ్చు.",
      sections: [
        { h: "మేము ఎవరం", body: ["Grama Connect ను BVT నిర్వహిస్తుంది. ఇది ప్రభుత్వ యాప్ కాదు, ఏ ప్రభుత్వ శాఖతోనూ అనుబంధం లేదు. పోస్టులను పంచాయతీ సభ్యులు, అధికారులు రాస్తారు; ప్రచురించే ముందు అధికారులు సరిచూస్తారు."] },
        { h: "మేము సేకరించేవి", body: [[
          "వార్తలు చదవడం: మిమ్మల్ని గుర్తించే సమాచారం ఏదీ లేదు. మీ భాష, గ్రామం, సేవ్ చేసిన పోస్టులు, అక్షరాల పరిమాణం మీ ఫోన్‌లోనే ఉంటాయి.",
          "లొకేషన్ (ఐచ్ఛికం): మీరు “నా లొకేషన్ వాడండి” నొక్కి అనుమతిస్తే, మీకు దగ్గరలోని గ్రామం కనుగొనడానికి మాత్రమే యాప్ మీ స్థానాన్ని ఒక్కసారి పంపుతుంది. దాన్ని మేము దాచుకోము, ఇతరులకు చూపము.",
          "సేవల అభ్యర్థనలు: మీ పేరు, మొబైల్ నంబర్, ఐచ్ఛికంగా ఈమెయిల్, చిరునామా, సేవ, మీరు రాసిన వివరాలు, మీ గ్రామం.",
          "ఈ వెబ్‌సైట్‌లోని సంప్రదింపు ఫారం: మీ పేరు, మొబైల్ నంబర్, గ్రామం లేదా మండలం, మీ సందేశం, స్పామ్ ఆపడానికి మీ ఇంటర్నెట్ (IP) చిరునామా.",
          "యాప్ నుంచి పోస్ట్ చేయడం: ఒక ఫోన్ మొదటిసారి పోస్ట్ చేసినప్పుడు, Google Play Integrity తనిఖీ తర్వాత దానికి ఒక ప్రైవేట్ పోస్టింగ్ కీ ఇస్తాం. ఆ కీ, పరికర ID, IP చిరునామాలను మార్చిన (హ్యాష్ చేసిన) రూపంలో మాత్రమే, మీ గ్రామం, భాష, యాప్ వెర్షన్, మీరు పంపిన పోస్టులు, ఫోటోలు, వీడియోలతో పాటు ఉంచుతాం.",
          "నోటిఫికేషన్లు: మీరు అనుమతిస్తే, మీ గ్రామ వార్తలు, మీ పోస్ట్ లేదా అభ్యర్థన ఫలితం తెలియజేయడానికి ఒక నోటిఫికేషన్ టోకెన్.",
          "అధికారులు (పంచాయతీ సభ్యులు, అడ్మిన్లు): యూజర్‌నేమ్, పేరు, మొబైల్ నంబర్, ఐచ్ఛికంగా ఈమెయిల్, పాత్ర, ప్రాంతం. ఈ ఖాతాలను వారి అడ్మిన్లు మాత్రమే తెరుస్తారు. పాస్‌వర్డ్‌లు హ్యాష్ రూపంలో మాత్రమే ఉంటాయి. ప్రతి సమీక్ష చర్య ఆడిట్ లాగ్‌లో నమోదవుతుంది.",
        ]] },
        { h: "ఎందుకు వాడతాం", body: [[
          "మీ గ్రామ వార్తలు చూపడానికి, నోటిఫికేషన్లు పంపడానికి.",
          "మీ సేవల అభ్యర్థనను మీ గ్రామ అధికారులకు చేర్చడానికి, వారు మిమ్మల్ని సంప్రదించడానికి.",
          "మీ సందేశానికి జవాబివ్వడానికి.",
          "సేవను సురక్షితంగా ఉంచడానికి: స్పామ్ ఆపడం, దుర్వినియోగాన్ని కొంతకాలం నిరోధించడం, అధికారుల చర్యల రికార్డు ఉంచడం.",
        ], "మీ సమాచారాన్ని మేము అమ్మము, ప్రకటనల ప్రొఫైల్స్ కోసం వాడము. యాప్‌లో కనిపించే ప్రాయోజిత బ్యానర్లను అడ్మిన్లు పెడతారు; అవి మిమ్మల్ని ట్రాక్ చేయవు."] },
        { h: "ఎవరు చూడగలరు", body: [[
          "సేవల అభ్యర్థనలు: మీ గ్రామ అధికారులు, అభ్యర్థనలు చూసే పై స్థాయి అడ్మిన్లు.",
          "సంప్రదింపు సందేశాలు: మా సహాయ బృందం.",
          "ప్రచురించిన పోస్టులు ఆ ప్రాంతాన్ని ఎంచుకున్న అందరికీ కనిపిస్తాయి. షేర్ చేసిన పోస్ట్ లింక్ ఎవరైనా తెరవగల పేజీలో పోస్టును చూపుతుంది. పౌరుల పోస్టుల్లో రాసినవారి పేరు, ఫోన్ చూపము; “పౌరుడు” అని మాత్రమే ఉంటుంది.",
          "మేము ఆధారపడే సేవా సంస్థలు: మా హోస్టింగ్ సంస్థ, Google (నోటిఫికేషన్లకు Firebase Cloud Messaging, Play Integrity తనిఖీ, Google Play లో యాప్ పంపిణీ). ఆ సేవకు అవసరమైనంత మాత్రమే వారికి అందుతుంది.",
          "చట్టం కోరినప్పుడు సంబంధిత అధికార సంస్థలు.",
        ]] },
        { h: "మీ ఫోన్‌లో, బ్రౌజర్‌లో", body: [[
          "“వినండి” (చదివి వినిపించడం) మీ ఫోన్ లేదా బ్రౌజర్ సొంత వాయిస్‌తో జరుగుతుంది; ఆ పాఠం మాకు రాదు.",
          "పోస్ట్ షేర్ చేయడం మీరు ఎంచుకున్న యాప్ (ఉదా: వాట్సాప్) ద్వారా జరుగుతుంది.",
          "ఈ వెబ్‌సైట్ ట్రాకింగ్ కుకీలు పెట్టదు, బయటి ఫాంట్లు లేదా ట్రాకర్లు వాడదు. కన్సోల్‌లో లాగిన్ అయ్యే అధికారులకు మాత్రమే లాగిన్ (సెషన్) కుకీ ఉంటుంది; 30 నిమిషాలు వాడకపోతే అది ముగుస్తుంది.",
        ]] },
        { h: "ఎంతకాలం ఉంచుతాం", body: ["పైన చెప్పిన పనికి అవసరమైనంత కాలం మాత్రమే: అభ్యర్థనలు, సందేశాలు పరిష్కారమయ్యే వరకు, ఆ తర్వాత రికార్డుల కోసం తగిన కాలం; అధికారుల ఖాతాలు ఆ పదవిలో ఉన్నంత కాలం. ఫోన్‌పై నిరోధం దానంతట అదే ముగుస్తుంది."] },
        { h: "మీ హక్కులు, తొలగింపు", body: ["భారత డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టం, 2023 ప్రకారం, మీ వ్యక్తిగత డేటాను చూడమని, సరిచేయమని, తొలగించమని అడగవచ్చు; ఇచ్చిన అనుమతిని వెనక్కి తీసుకోవచ్చు. పౌరులకు ఖాతా ఉండదు, అధికారుల ఖాతాలను అడ్మిన్లు తెరుస్తారు; కాబట్టి తొలగింపు కోసం {email} కు రాయండి లేదా సంప్రదించండి పేజీ వాడండి. 2 పని దినాల్లో మీ అభ్యర్థన అందినట్లు తెలియజేస్తాం; ఆ తర్వాత ఖాతాను నిలిపివేసి మీ వ్యక్తిగత వివరాలను తొలగిస్తాం (చట్టం కోరే రికార్డులు తప్ప)."] },
        { h: "భద్రత", body: ["వెబ్‌సైట్, యాప్ సురక్షిత (HTTPS) కనెక్షన్ మాత్రమే వాడతాయి. అనుమతి ఉన్న అధికారులు మాత్రమే ఈ సమాచారం చూడగలరు. పాస్‌వర్డ్‌లు, పరికర వివరాలు హ్యాష్ రూపంలో ఉంటాయి. అప్‌లోడ్ చేసిన ఫోటోలు, వీడియోల్లో దాగి ఉండే లొకేషన్, ఫోన్ వివరాలను తొలగిస్తాం. ప్రతి అధికారిక చర్య నమోదవుతుంది."] },
        { h: "పిల్లలు", body: ["యాప్ పెద్దల కోసం. 18 ఏళ్ల లోపు పిల్లల సమాచారాన్ని మేము తెలిసి సేకరించము."] },
        { h: "మార్పులు", body: ["ఈ విధానాన్ని మార్చితే, ఈ పేజీని, పైన ఉన్న తేదీని నవీకరిస్తాం."] },
        { h: "సంప్రదించండి", body: ["గోప్యత గురించి ప్రశ్నలు లేదా ఫిర్యాదులు: {email} · {phone} · లేదా సంప్రదించండి పేజీ."] },
      ],
    },
    terms: {
      title: "వినియోగ నిబంధనలు",
      updated: "చివరిగా నవీకరించినది: 6 నవంబర్ 2026",
      intro: "Grama Connect యాప్ లేదా ఈ వెబ్‌సైట్ వాడినప్పుడు ఈ నిబంధనలు వర్తిస్తాయి. వాడటం ద్వారా మీరు వీటికి అంగీకరిస్తున్నారు.",
      sections: [
        { h: "సేవ, నిర్వహించేది", body: ["మీ పంచాయతీ, మండల, జిల్లా స్థాయి నుంచి ప్రకటనలు, పథకాల సమాచారం, నోటీసులను మీ ఫోన్‌కు చేర్చే ఉచిత సేవ. పౌరులకు ఖాతా అవసరం లేదు. Grama Connect ను BVT నిర్వహిస్తుంది; ఇది ప్రభుత్వ యాప్ కాదు, ఏ ప్రభుత్వ శాఖతోనూ అనుబంధం లేదు."] },
        { h: "సమాచారం గురించి", body: [[
          "పోస్టులను పంచాయతీ సభ్యులు, అధికారులు రాస్తారు; ప్రచురించే ముందు అధికారులు సరిచూస్తారు. అయినా తేదీలు, అర్హతలు వంటి వివరాలు మారవచ్చు; ముఖ్యమైన విషయాల కోసం మీ పంచాయతీ లేదా పోస్ట్‌లో చెప్పిన కార్యాలయంతో నిర్ధారించుకోండి.",
          "అత్యవసర సమయంలో యాప్‌పై ఆధారపడకండి: 112 (అత్యవసరం) లేదా 108 (అంబులెన్స్)కు కాల్ చేయండి.",
        ]] },
        { h: "బాధ్యతగా వాడండి", body: [[
          "మీ గ్రామానికి నిజమైన, ఉపయోగకరమైన సమాచారం మాత్రమే పోస్ట్ చేయండి.",
          "దూషణ, ద్వేషం, తప్పుదారి పట్టించే లేదా చట్టవిరుద్ధమైన విషయాలు వద్దు; ఇతరుల వ్యక్తిగత వివరాలు లేదా అనుమతి లేని ఫోటోలు పంచుకోవద్దు.",
          "సేవను పాడుచేయడానికి, అధిక భారం వేయడానికి లేదా దుర్వినియోగం చేయడానికి ప్రయత్నించవద్దు.",
        ], "అధికారులు పోస్టులను తిరస్కరించవచ్చు, వెనక్కి పంపవచ్చు లేదా తొలగించవచ్చు; దుర్వినియోగం చేసే ఫోన్‌ను కొంతకాలం నిరోధించవచ్చు."] },
        { h: "అధికారుల ఖాతాలు", body: ["లాగిన్‌లు వారి అడ్మిన్లు మాత్రమే ఇస్తారు; యాప్‌లో సైన్-అప్ లేదు. మీ పాస్‌వర్డ్‌ను రహస్యంగా ఉంచండి; మొదటి లాగిన్‌లో తాత్కాలిక పాస్‌వర్డ్ మార్చండి. మీ ఖాతా నుంచి పోస్ట్ చేసిన లేదా ఆమోదించిన వాటికి మీదే బాధ్యత; ప్రతి చర్య నమోదవుతుంది. అడ్మిన్లు ఖాతాను నిలిపివేయవచ్చు."] },
        { h: "సేవల అభ్యర్థనలు", body: ["అభ్యర్థన మీ వివరాలను మీ గ్రామ అధికారులకు చేరుస్తుంది. అభ్యర్థన పంపినంత మాత్రాన సేవ లభిస్తుందని హామీ కాదు; తదుపరి దశల గురించి అధికారులు మిమ్మల్ని సంప్రదిస్తారు."] },
        { h: "షేర్ లింకులు, బ్యానర్లు", body: ["షేర్ చేసిన పోస్ట్ లింక్ ఎవరైనా తెరవగల పేజీని తెరుస్తుంది; పోస్ట్ తొలగిస్తే ఆ లింక్ పనిచేయదు. ప్రాయోజిత బ్యానర్లను అడ్మిన్లు పెడతారు. లింకులు ఇతర వెబ్‌సైట్లు లేదా యాప్‌లను తెరవవచ్చు; వాటికి వాటి సొంత నిబంధనలు ఉంటాయి, వాటికి మేము బాధ్యులం కాదు."] },
        { h: "లభ్యత, బాధ్యత", body: ["సేవ సక్రమంగా, ఖచ్చితంగా ఉండేలా ప్రయత్నిస్తాం, కానీ ఎలాంటి హామీ లేకుండా “ఉన్నది ఉన్నట్లు” అందిస్తాం. చట్టం అనుమతించినంత వరకు, పోస్ట్‌పై ఆధారపడటం, ఆలస్యాలు లేదా సేవ అందుబాటులో లేకపోవడం వల్ల కలిగే నష్టానికి మేము బాధ్యులం కాదు."] },
        { h: "కంటెంట్, పేరు", body: ["యాప్ డిజైన్, పేరు, లోగో Grama Connect కు చెందినవి. పోస్టులకు వాటిని రాసిన అధికారి లేదా సభ్యుడే బాధ్యులు."] },
        { h: "మార్పులు", body: ["ఈ నిబంధనలను నవీకరించవచ్చు; పైన ఉన్న తేదీ తాజా వెర్షన్‌ను చూపుతుంది. సేవను వాడటం కొనసాగిస్తే మార్పులను అంగీకరించినట్లే."] },
        { h: "చట్టం", body: ["ఈ నిబంధనలకు భారత చట్టాలు వర్తిస్తాయి."] },
        { h: "సంప్రదించండి", body: ["{email} · {phone} · లేదా సంప్రదించండి పేజీ."] },
      ],
    },
  },
  en: {
    note: "",
    privacy: {
      title: "Privacy policy",
      updated: "Last updated: 6 November 2026",
      intro: "This page explains, in plain words, what information the Grama Connect app and this website collect about you, why, who can see it, and what you can do about it. Citizens can use the app without an account.",
      sections: [
        { h: "Who we are", body: ["Grama Connect is run by BVT. It is not a government app and is not affiliated with any government department. Posts are written by Panchayat members and officials, and checked by officials before they are published."] },
        { h: "What we collect", body: [[
          "Reading news: nothing that identifies you. Your language, village, saved posts and text size are stored only on your phone.",
          "Location (optional): if you tap “Use my location” and allow it, the app sends your position once, only to find your nearest village. We do not save it or show it to anyone.",
          "Service requests: your name, mobile number, optional email, address, the service and your note, and your village.",
          "Contact form on this website: your name, mobile number, village or mandal, your message, and your internet (IP) address, which we use to stop spam.",
          "Posting from the app: when a phone first posts, it gets a private posting key after a Google Play Integrity check. We keep that key, the device ID and the IP address only in scrambled (hashed) form, together with your village, language, app version and the posts, photos and videos you send.",
          "Notifications: if you allow them, a notification token so we can tell you about your village's news and the result of your post or request.",
          "Officials (Panchayat members and admins): username, name, mobile number, optional email, role and area. These accounts are opened only by their admins. Passwords are stored only in hashed form. Every review action is recorded in an audit log.",
        ]] },
        { h: "How we use it", body: [[
          "To show news for your village and send notifications.",
          "To pass your service request to the officials of your village so they can contact you.",
          "To reply to your message.",
          "To keep the service safe: stop spam, block misuse for a limited time, and keep a record of official actions.",
        ], "We do not sell your information or use it for advertising profiles. The sponsored banners in the app are placed by administrators and do not track you."] },
        { h: "Who can see it", body: [[
          "Service requests: the officials of your village, and the admins above them who handle requests.",
          "Contact messages: our support team.",
          "Published posts are visible to everyone who picks that area. A shared post link opens a page with the post that anyone can open. Citizens' posts never show the writer's name or phone; they show only “Citizen”.",
          "Service providers we rely on: our hosting provider, and Google (Firebase Cloud Messaging for notifications, Play Integrity checks, and app delivery on Google Play). They receive only what they need to provide that service.",
          "Authorities, when the law requires it.",
        ]] },
        { h: "On your phone and in your browser", body: [[
          "Listen (read aloud) uses your phone’s or browser’s own voice; the text is not sent to us.",
          "Sharing a post uses the app you choose, such as WhatsApp.",
          "This website sets no tracking cookies and loads no outside fonts or trackers. Only officials who log in to the console get a login (session) cookie, which ends after 30 minutes of inactivity.",
        ]] },
        { h: "How long we keep it", body: ["Only as long as needed for the purposes above: requests and messages until they are handled, and for a reasonable period after for our records; official accounts while the person holds the role. A block on a phone ends by itself."] },
        { h: "Your rights and deleting your data", body: ["Under India’s Digital Personal Data Protection Act, 2023, you can ask to see, correct or delete your personal data, and withdraw your consent. Citizens have no account, and officials' accounts are opened by their admins, so to ask for deletion write to {email} or use the Contact page. We will acknowledge your request within 2 working days, then switch off the account and remove your personal details, except records the law requires us to keep."] },
        { h: "Security", body: ["The website and the app use secure (HTTPS) connections only. Only authorised officials can see this information. Passwords and device details are stored in hashed form. Hidden location and phone details inside uploaded photos and videos are removed. Every official action is recorded."] },
        { h: "Children", body: ["The app is meant for adults. We do not knowingly collect information from children under 18."] },
        { h: "Changes", body: ["If we change this policy, we will update this page and the date above."] },
        { h: "Contact", body: ["Questions or complaints about privacy: {email} · {phone} · or the Contact page."] },
      ],
    },
    terms: {
      title: "Terms of use",
      updated: "Last updated: 6 November 2026",
      intro: "These terms apply when you use the Grama Connect app or this website. By using them, you agree to these terms.",
      sections: [
        { h: "The service and who runs it", body: ["A free service that brings announcements, scheme information and notices from your Panchayat, Mandal and District level to your phone. Citizens do not need an account. Grama Connect is run by BVT; it is not a government app and is not affiliated with any government department."] },
        { h: "About the information", body: [[
          "Posts are written by Panchayat members and officials, and checked by officials before they are published. Even so, details such as dates and eligibility can change; for anything important, confirm with your Panchayat or the office named in the post.",
          "In an emergency, do not rely on the app: call 112 (emergency) or 108 (ambulance).",
        ]] },
        { h: "Using the app responsibly", body: [[
          "Post only true, useful information for your village.",
          "No abusive, hateful, misleading or illegal content, and nothing that shares other people’s private details or photos without their consent.",
          "Do not try to break, overload or misuse the service.",
        ], "Officials may decline, send back or take down posts, and may temporarily block a phone that misuses the service."] },
        { h: "Official accounts", body: ["Logins are given only by the official's admin; there is no sign-up in the app. Keep your password private and change the temporary password at your first login. You are responsible for what is posted or approved from your account; every action is recorded. Admins may switch an account off."] },
        { h: "Service requests", body: ["A request passes your details to your village officials. Sending one does not guarantee the service; the officials will contact you about next steps."] },
        { h: "Shared links and banners", body: ["A shared post link opens a page that anyone can open; when the post is taken down, the link stops working. Sponsored banners are placed by administrators. Links may open other websites or apps that have their own terms; we are not responsible for them."] },
        { h: "Availability and liability", body: ["We work to keep the service running and accurate, but provide it “as is”, without guarantees. To the extent the law allows, we are not liable for loss caused by relying on a post, by delays, or by the service being unavailable."] },
        { h: "Content and names", body: ["The app’s design, name and logo belong to Grama Connect. Each post is the responsibility of the official or member who wrote it."] },
        { h: "Changes", body: ["We may update these terms; the date above shows the latest version. Continuing to use the service means you accept the changes."] },
        { h: "Law", body: ["These terms are governed by the laws of India."] },
        { h: "Contact", body: ["{email} · {phone} · or the Contact page."] },
      ],
    },
  },
};

export default LEGAL;
