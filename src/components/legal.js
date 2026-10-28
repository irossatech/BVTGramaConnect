// Privacy policy and Terms for the public website (#privacy, #terms), in Telugu and English.
// Written from what the app, website and API actually collect (backend models: citizens, service_requests,
// web_public, notifications, accounts, audit). Section bodies: a string is a paragraph, an array is a bullet list.
// {email} and {phone} are filled from the site settings. Have it reviewed before launch, and update `updated`
// whenever the wording changes.

const LEGAL = {
  te: {
    note: "తెలుగు, ఇంగ్లీష్ పాఠాల్లో తేడా ఉంటే ఇంగ్లీష్ పాఠమే చెల్లుతుంది.",
    privacy: {
      title: "గోప్యతా విధానం",
      updated: "చివరిగా నవీకరించినది: 28 అక్టోబర్ 2026",
      intro: "BVT Grama Connect మీ పంచాయతీ, స్థానిక పరిపాలన ధృవీకరించిన గ్రామ ప్రకటనలను మీ ఫోన్‌కు అందిస్తుంది. మేము ఏ సమాచారం సేకరిస్తాం, ఎందుకు, దాని గురించి మీరు ఏం చేయవచ్చో ఈ పేజీ సులభమైన మాటల్లో చెబుతుంది. పౌరులు ఖాతా లేకుండానే యాప్ వాడవచ్చు.",
      sections: [
        { h: "మేము సేకరించేవి", body: [[
          "వార్తలు చదవడం: మిమ్మల్ని గుర్తించే సమాచారం ఏదీ లేదు. మీ భాష, గ్రామం, సేవ్ చేసిన పోస్టులు, అక్షరాల పరిమాణం మీ ఫోన్‌లోనే ఉంటాయి.",
          "లొకేషన్ (ఐచ్ఛికం): మీరు అనుమతిస్తే, మీకు దగ్గరలోని గ్రామం కనుగొనడానికి యాప్ మీ స్థానాన్ని ఒక్కసారి పంపుతుంది. దాన్ని మేము దాచుకోము.",
          "సేవల అభ్యర్థనలు: మీ పేరు, మొబైల్ నంబర్, ఐచ్ఛికంగా ఈమెయిల్, సేవ, మీరు రాసిన వివరాలు, మీ గ్రామం.",
          "ఈ వెబ్‌సైట్‌లోని సంప్రదింపు ఫారం: మీ పేరు, మొబైల్ నంబర్, గ్రామం లేదా మండలం, మీ సందేశం, స్పామ్ ఆపడానికి మీ ఇంటర్నెట్ (IP) చిరునామా.",
          "యాప్ నుంచి పోస్ట్ చేయడం: ఒక ఫోన్ మొదటిసారి పోస్ట్ చేసినప్పుడు, Google Play Integrity తనిఖీ తర్వాత దానికి ఒక ప్రైవేట్ పోస్టింగ్ కీ ఇస్తాం. ఆ కీ, పరికర ID, IP చిరునామాలను మార్చిన (హ్యాష్ చేసిన) రూపంలో మాత్రమే, మీ గ్రామం, భాష, యాప్ వెర్షన్, మీరు రాసిన పోస్టులతో పాటు ఉంచుతాం.",
          "నోటిఫికేషన్లు: మీరు ఆన్ చేస్తే, పోస్ట్ ప్రచురితమైనప్పుడు తెలియజేయడానికి ఒక నోటిఫికేషన్ టోకెన్.",
          "అధికారులు (పంచాయతీ సభ్యులు, అడ్మిన్లు): యూజర్‌నేమ్, పేరు, మొబైల్ నంబర్, ఐచ్ఛికంగా ఈమెయిల్, పాత్ర, ప్రాంతం. పాస్‌వర్డ్‌లు హ్యాష్ రూపంలో మాత్రమే ఉంటాయి. ప్రతి సమీక్ష చర్య ఆడిట్ లాగ్‌లో నమోదవుతుంది.",
        ]] },
        { h: "ఎందుకు వాడతాం", body: [[
          "మీ గ్రామ వార్తలు చూపడానికి, నోటిఫికేషన్లు పంపడానికి.",
          "మీ సేవల అభ్యర్థనను మీ గ్రామ అధికారులకు చేర్చడానికి, వారు మిమ్మల్ని సంప్రదించడానికి.",
          "మీ సందేశానికి జవాబివ్వడానికి.",
          "సేవను సురక్షితంగా ఉంచడానికి: స్పామ్ ఆపడం, దుర్వినియోగాన్ని కొంతకాలం నిరోధించడం, అధికారుల చర్యల రికార్డు ఉంచడం.",
        ], "మీ సమాచారాన్ని మేము అమ్మము, ప్రకటనల ప్రొఫైల్స్ కోసం వాడము. యాప్‌లో కనిపించే బ్యానర్లను అడ్మిన్లు పెడతారు; అవి మిమ్మల్ని ట్రాక్ చేయవు."] },
        { h: "ఎవరు చూడగలరు", body: [[
          "సేవల అభ్యర్థనలు: మీ గ్రామ అధికారులు, అభ్యర్థనలు చూసే పై స్థాయి అడ్మిన్లు.",
          "సంప్రదింపు సందేశాలు: మా సహాయ బృందం.",
          "ప్రచురించిన పోస్టులు ఆ గ్రామాన్ని ఎంచుకున్న అందరికీ కనిపిస్తాయి.",
          "మేము ఆధారపడే సేవా సంస్థలు: మా హోస్టింగ్ సంస్థ, Google (Play Integrity తనిఖీ, యాప్ పంపిణీ, ఈ వెబ్‌సైట్ ఫాంట్లు). ఆ సేవకు అవసరమైనంత మాత్రమే వారికి అందుతుంది.",
          "చట్టం కోరినప్పుడు సంబంధిత అధికార సంస్థలు.",
        ]] },
        { h: "మీ ఫోన్‌లో, బ్రౌజర్‌లో", body: [[
          "“వినండి” (చదివి వినిపించడం) మీ ఫోన్ లేదా బ్రౌజర్ సొంత వాయిస్‌తో జరుగుతుంది; ఆ పాఠం మాకు రాదు.",
          "పోస్ట్ షేర్ చేయడం మీరు ఎంచుకున్న యాప్ (ఉదా: వాట్సాప్) ద్వారా జరుగుతుంది.",
          "ఈ వెబ్‌సైట్ ట్రాకింగ్ కుకీలు పెట్టదు. కన్సోల్‌లో లాగిన్ అయ్యే అధికారులకు మాత్రమే లాగిన్ (సెషన్) కుకీ ఉంటుంది; 30 నిమిషాలు వాడకపోతే అది ముగుస్తుంది.",
        ]] },
        { h: "ఎంతకాలం ఉంచుతాం", body: ["పైన చెప్పిన పనికి అవసరమైనంత కాలం మాత్రమే: అభ్యర్థనలు, సందేశాలు పరిష్కారమయ్యే వరకు, ఆ తర్వాత రికార్డుల కోసం తగిన కాలం; అధికారుల ఖాతాలు ఆ పదవిలో ఉన్నంత కాలం. ఫోన్‌పై నిరోధం దానంతట అదే ముగుస్తుంది. మీ సమాచారం తొలగించమని ఎప్పుడైనా అడగవచ్చు."] },
        { h: "మీ హక్కులు", body: ["భారత డిజిటల్ వ్యక్తిగత డేటా రక్షణ చట్టం, 2023 ప్రకారం, మీ వ్యక్తిగత డేటాను చూడమని, సరిచేయమని, తొలగించమని అడగవచ్చు; ఇచ్చిన అనుమతిని వెనక్కి తీసుకోవచ్చు. {email} కు రాయండి లేదా సంప్రదించండి పేజీ వాడండి. 2 పని దినాల్లో మీ అభ్యర్థన అందినట్లు తెలియజేస్తాం."] },
        { h: "భద్రత", body: ["అనుమతి ఉన్న అధికారులు మాత్రమే ఈ సమాచారం చూడగలరు. పాస్‌వర్డ్‌లు, పరికర వివరాలు హ్యాష్ రూపంలో ఉంటాయి. ప్రతి అధికారిక చర్య నమోదవుతుంది."] },
        { h: "మార్పులు", body: ["ఈ విధానాన్ని మార్చితే, ఈ పేజీని, పైన ఉన్న తేదీని నవీకరిస్తాం."] },
        { h: "సంప్రదించండి", body: ["గోప్యత గురించి ప్రశ్నలు లేదా ఫిర్యాదులు: {email} · {phone} · లేదా సంప్రదించండి పేజీ."] },
      ],
    },
    terms: {
      title: "నిబంధనలు",
      updated: "చివరిగా నవీకరించినది: 28 అక్టోబర్ 2026",
      intro: "BVT Grama Connect యాప్ లేదా ఈ వెబ్‌సైట్ వాడినప్పుడు ఈ నిబంధనలు వర్తిస్తాయి. వాడటం ద్వారా మీరు వీటికి అంగీకరిస్తున్నారు.",
      sections: [
        { h: "సేవ", body: ["మీ పంచాయతీ, మండల, జిల్లా పరిపాలన నుంచి ప్రకటనలు, పథకాల సమాచారం, నోటీసులను మీ ఫోన్‌కు చేర్చే ఉచిత సేవ. పౌరులకు ఖాతా అవసరం లేదు."] },
        { h: "సమాచారం గురించి", body: [[
          "పోస్టులను పంచాయతీ సభ్యులు రాస్తారు, ప్రచురించే ముందు అధికారులు సరిచూస్తారు. అయినా తేదీలు, అర్హతలు వంటి వివరాలు మారవచ్చు; ముఖ్యమైన విషయాల కోసం మీ పంచాయతీ లేదా పోస్ట్‌లో చెప్పిన కార్యాలయంతో నిర్ధారించుకోండి.",
          "అత్యవసర సమయంలో యాప్‌పై ఆధారపడకండి: 112 (అత్యవసరం) లేదా 108 (అంబులెన్స్)కు కాల్ చేయండి.",
        ]] },
        { h: "బాధ్యతగా వాడండి", body: [[
          "మీ గ్రామానికి నిజమైన, ఉపయోగకరమైన సమాచారం మాత్రమే పోస్ట్ చేయండి.",
          "దూషణ, ద్వేషం, తప్పుదారి పట్టించే లేదా చట్టవిరుద్ధమైన విషయాలు వద్దు; ఇతరుల వ్యక్తిగత వివరాలు పంచుకోవద్దు.",
          "సేవను పాడుచేయడానికి, అధిక భారం వేయడానికి లేదా దుర్వినియోగం చేయడానికి ప్రయత్నించవద్దు.",
        ], "అధికారులు పోస్టులను తిరస్కరించవచ్చు, వెనక్కి పంపవచ్చు లేదా తొలగించవచ్చు; దుర్వినియోగం చేసే ఫోన్‌ను కొంతకాలం నిరోధించవచ్చు."] },
        { h: "అధికారుల ఖాతాలు", body: ["లాగిన్‌లు పరిపాలన మాత్రమే ఇస్తుంది. మీ పాస్‌వర్డ్‌ను రహస్యంగా ఉంచండి; మొదటి లాగిన్‌లో తాత్కాలిక పాస్‌వర్డ్ మార్చండి. మీ ఖాతా నుంచి పోస్ట్ చేసిన లేదా ఆమోదించిన వాటికి మీదే బాధ్యత; ప్రతి చర్య నమోదవుతుంది."] },
        { h: "సేవల అభ్యర్థనలు", body: ["అభ్యర్థన మీ వివరాలను మీ గ్రామ అధికారులకు చేరుస్తుంది. అభ్యర్థన పంపినంత మాత్రాన సేవ లభిస్తుందని హామీ కాదు; తదుపరి దశల గురించి అధికారులు మిమ్మల్ని సంప్రదిస్తారు."] },
        { h: "బ్యానర్లు, లింకులు", body: ["బ్యానర్లను అడ్మిన్లు పెడతారు. లింకులు ఇతర వెబ్‌సైట్లు లేదా యాప్‌లను తెరవవచ్చు; వాటికి వాటి సొంత నిబంధనలు ఉంటాయి, వాటికి మేము బాధ్యులం కాదు."] },
        { h: "లభ్యత, బాధ్యత", body: ["సేవ సక్రమంగా, ఖచ్చితంగా ఉండేలా ప్రయత్నిస్తాం, కానీ ఎలాంటి హామీ లేకుండా “ఉన్నది ఉన్నట్లు” అందిస్తాం. చట్టం అనుమతించినంత వరకు, పోస్ట్‌పై ఆధారపడటం, ఆలస్యాలు లేదా సేవ అందుబాటులో లేకపోవడం వల్ల కలిగే నష్టానికి మేము బాధ్యులం కాదు."] },
        { h: "కంటెంట్, పేరు", body: ["యాప్ డిజైన్, పేరు, లోగో BVT Grama Connect కు చెందినవి. పోస్టులకు వాటిని రాసిన అధికారి లేదా సభ్యుడే బాధ్యులు."] },
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
      updated: "Last updated: 28 October 2026",
      intro: "BVT Grama Connect brings verified village announcements from your Panchayat and local administration to your phone. This page explains, in plain words, what information we collect, why, and what you can do about it. Citizens can use the app without an account.",
      sections: [
        { h: "What we collect", body: [[
          "Reading news: nothing that identifies you. Your language, village, saved posts and text size are stored only on your phone.",
          "Location (optional): if you allow it, the app sends your position once to find your nearest village. We do not save it.",
          "Service requests: your name, mobile number, optional email, the service and your note, and your village.",
          "Contact form on this website: your name, mobile number, village or mandal, your message, and your internet (IP) address, which we use to stop spam.",
          "Posting from the app: when a phone first posts, it gets a private posting key after a Google Play Integrity check. We keep that key, the device ID and the IP address only in scrambled (hashed) form, together with your village, language, app version and the posts you write.",
          "Notifications: if you turn them on, a notification token so we can tell you when a post is published.",
          "Officials (Panchayat members and admins): username, name, mobile number, optional email, role and area. Passwords are stored only in hashed form. Every review action is recorded in an audit log.",
        ]] },
        { h: "How we use it", body: [[
          "To show news for your village and send notifications.",
          "To pass your service request to the officials of your village so they can contact you.",
          "To reply to your message.",
          "To keep the service safe: stop spam, block misuse for a limited time, and keep a record of official actions.",
        ], "We do not sell your information or use it for advertising profiles. The banners in the app are placed by administrators and do not track you."] },
        { h: "Who can see it", body: [[
          "Service requests: the officials of your village, and the admins above them who handle requests.",
          "Contact messages: our support team.",
          "Published posts are public to everyone who picks that village.",
          "Service providers we rely on: our hosting provider, and Google (Play Integrity checks, app delivery and the fonts on this website). They receive only what they need to provide that service.",
          "Authorities, when the law requires it.",
        ]] },
        { h: "On your phone and in your browser", body: [[
          "Listen (read aloud) uses your phone’s or browser’s own voice; the text is not sent to us.",
          "Sharing a post uses the app you choose, such as WhatsApp.",
          "This website sets no tracking cookies. Only officials who log in to the console get a login (session) cookie, which ends after 30 minutes of inactivity.",
        ]] },
        { h: "How long we keep it", body: ["Only as long as needed for the purposes above: requests and messages until they are handled, and for a reasonable period after for our records; official accounts while the person holds the role. A block on a phone ends by itself. You can ask us to delete your information at any time."] },
        { h: "Your rights", body: ["Under India’s Digital Personal Data Protection Act, 2023, you can ask to see, correct or delete your personal data, and withdraw your consent. Write to {email} or use the Contact page. We will acknowledge your request within 2 working days."] },
        { h: "Security", body: ["Only authorised officials can see this information. Passwords and device details are stored in hashed form, and every official action is recorded."] },
        { h: "Changes", body: ["If we change this policy, we will update this page and the date above."] },
        { h: "Contact", body: ["Questions or complaints about privacy: {email} · {phone} · or the Contact page."] },
      ],
    },
    terms: {
      title: "Terms of use",
      updated: "Last updated: 28 October 2026",
      intro: "These terms apply when you use the BVT Grama Connect app or this website. By using them, you agree to these terms.",
      sections: [
        { h: "The service", body: ["A free service that brings announcements, scheme information and notices from your Panchayat, Mandal and District administration to your phone. Citizens do not need an account."] },
        { h: "About the information", body: [[
          "Posts are written by Panchayat members and checked by officials before they are published. Even so, details such as dates and eligibility can change; for anything important, confirm with your Panchayat or the office named in the post.",
          "In an emergency, do not rely on the app: call 112 (emergency) or 108 (ambulance).",
        ]] },
        { h: "Using the app responsibly", body: [[
          "Post only true, useful information for your village.",
          "No abusive, hateful, misleading or illegal content, and nothing that shares other people’s private details.",
          "Do not try to break, overload or misuse the service.",
        ], "Officials may decline, send back or take down posts, and may temporarily block a phone that misuses the service."] },
        { h: "Official accounts", body: ["Logins are given only by the administration. Keep your password private and change the temporary password at your first login. You are responsible for what is posted or approved from your account; every action is recorded."] },
        { h: "Service requests", body: ["A request passes your details to your village officials. Sending one does not guarantee the service; the officials will contact you about next steps."] },
        { h: "Banners and links", body: ["Banners are placed by administrators. Links may open other websites or apps that have their own terms; we are not responsible for them."] },
        { h: "Availability and liability", body: ["We work to keep the service running and accurate, but provide it “as is”, without guarantees. To the extent the law allows, we are not liable for loss caused by relying on a post, by delays, or by the service being unavailable."] },
        { h: "Content and names", body: ["The app’s design, name and logo belong to BVT Grama Connect. Each post is the responsibility of the official or member who wrote it."] },
        { h: "Changes", body: ["We may update these terms; the date above shows the latest version. Continuing to use the service means you accept the changes."] },
        { h: "Law", body: ["These terms are governed by the laws of India."] },
        { h: "Contact", body: ["{email} · {phone} · or the Contact page."] },
      ],
    },
  },
};

export default LEGAL;
