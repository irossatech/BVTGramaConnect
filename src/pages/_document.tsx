// The <html lang> in the exported HTML: the website opens in Telugu, the console is in English.
// The website switches it as the visitor changes language (Site.jsx).
// The website has its own Telugu/English switch, so browsers must not offer to machine-translate it
// (Chrome's "Translate this page?"): translate="no" plus Google's notranslate tag.
import { Html, Head, Main, NextScript, type DocumentProps } from "next/document";

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  const site = !__NEXT_DATA__.page.startsWith("/console");
  return (
    <Html lang={site ? "te" : "en"} translate={site ? "no" : undefined}>
      <Head>{site ? <meta name="google" content="notranslate" /> : null}</Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
