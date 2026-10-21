# BVT Grama Connect Design System

## Context
BVT Grama Connect is a Telugu-language mobile app that delivers village-level information to citizens: village announcements (గ్రామ చాటింపులు), government schemes (ప్రభుత్వ పథకాలు), village news & notices (గ్రామ వార్తలు & నోటీసులు), useful public updates (ప్రజలకు ఉపయోగకరమైన అప్‌డేట్లు), and village / mandal / district level information management (గ్రామం / మండలం / జిల్లా). Tagline: **మన గ్రామం – మన సేవలు – మన అభివృద్ధి** / **Connecting Villages, Empowering India**. Secondary line: ప్రతి గ్రామం… ప్రతి కుటుంబం… మన లక్ష్యం!

Products represented: **one mobile app** (home screen with location selector, five service cards, 4-tab bottom nav: Home / News / Notices / Profile). A promotional poster is the only source.

## Sources
- `uploads/WhatsApp Image 2026-10-13 at 5.23.10 PM.jpeg` — single promotional poster (1024×1536) showing the logo, tagline, five services, and a phone mockup of the app home screen. No code, Figma, or font files were provided. Everything here is inferred from that one image.

## Content fundamentals
- **Language**: Telugu first, English second. Telugu headlines and labels; English appears only in the brand name (BVT GRAMA CONNECT), the English tagline, bottom-nav labels (Home, News, Notices, Profile) and the status bar.
- **Tone**: civic, warm, collective. "మన" (our) is the keyword: our village, our services, our development. Speaks as a community, never "I"; addresses the reader as "మీ" (your) — "మీ మొబైల్‌లోనే!", "మీ గ్రామం / మండలం / జిల్లా".
- **Structure**: each service = bold Telugu title + one short grey description line listing 2–3 nouns separated by commas ("ప్రకటనలు, నోటీసులు, ముఖ్యమైన సమాచారం."). CTA is short imperative: "వివరాలు చూడండి ›".
- **Casing**: English brand name in ALL CAPS; English tagline in Title Case; nav labels Title Case. Em-dash separators between tagline phrases.
- **Emoji**: none. Exclamation marks used sparingly for enthusiasm in headlines.

## Visual foundations
- **Palette**: deep brand blue (#00407e) and leaf green (#359227) carry the identity; the saffron–white–green tricolour (orange #ff8401 / green) is echoed in the tagline divider. Each service has its own hue: green (announcements), orange (schemes), blue (news), purple (updates), teal (location). Yellow (#f2dd3d) is used only as highlight text on blue.
- **Type**: Bold geometric Latin for the wordmark (substituted with **Poppins**); Telugu set in a bold modern sans (substituted with **Noto Sans Telugu**). Headlines heavy (700–800), body 400–500, descriptions in muted grey.
- **Backgrounds**: white/very light sky with soft cloud photo; full-bleed village + city photography at the bottom; brush-stroke colour blocks (blue, green) behind headline text; wave-shaped colour bands (green over blue) along edges. Leaf motifs at corners.
- **Imagery**: bright, saturated, sunlit, warm-green rural landscape merging into a city skyline; no grain, no B&W.
- **Cards**: white or light-tinted (category tint) with 14–16px radius, 1px subtle border, very soft blue-tinted shadow; chevron on the right. Hero card has a photo background with white overlay panel.
- **Icon badges**: solid circular discs (48–72px) in category colour with white glyph.
- **Buttons**: pill, solid blue, white text, trailing chevron.
- **Radii**: pills for chips/buttons, 14px cards, full circles for icon badges.
- **Shadows**: single soft outer shadow, blue-tinted; no inner shadows.
- **Motion**: none evident; recommend 200ms ease-out fades and 120ms press scale (0.98). Hover: slight darken; press: scale 0.98.
- **Layout**: mobile 390px, 16px gutters, 12px between cards, fixed bottom nav with 4 items, location selector pill directly under the header.
- **Transparency/blur**: translucent white panels over photos (hero card); no blur.

## Iconography
- Icons are solid white glyphs on coloured circular discs (megaphone, bank/building, newspaper, people group, map pin). Bottom nav uses outline icons with active fill in brand blue.
- No icon font in the source. Cropped discs from the poster live in `assets/icon-*.png`. For additional glyphs, **Lucide** (CDN) is the substitute — 2px stroke, matching the outline nav icons. Flagged as a substitution.
- No emoji, no unicode glyph icons (except › chevrons).

## Assets
- `assets/logo-lockup.png` — full logo with Telugu + English taglines (cropped from poster, JPEG artefacts).
- `assets/logo-mark.png` — circular mark.
- `assets/icon-announce|schemes|news|updates|location.png` — category discs.
- `assets/village-landscape.jpg`, `assets/footer-wave.jpg` — imagery.

## Index
- `styles.css` → `tokens/{fonts,colors,typography,spacing}.css`
- `guidelines/` — foundation cards (Colors, Type, Spacing, Brand)
- `components/core/` — Button, ServiceCard, HeroCard, IconBadge, LocationSelector, BottomNav, Badge
- `ui_kits/app/` — Grama Connect mobile home screen
- `SKILL.md`

## Intentional additions
- Badge (status chip) — not in poster, needed for notices lists.
- Lucide icon CDN — substitute for missing icon set.

## Caveats
- Fonts are Google substitutes; original wordmark font unknown.
- Logo is a raster crop from a compressed JPEG; a vector logo is needed.
