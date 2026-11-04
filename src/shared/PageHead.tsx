// <head> for one page: the design-system stylesheets, Google Fonts and the page's own global CSS
// (the prototype's <helmet>). The stylesheets are @imports at the top of the page's <style>, not
// <link> tags: Next.js warns about stylesheet links in next/head, and this keeps the page CSS
// after the design system so its rules still win. Each page keeps its own, so the website and console CSS never meet.
// title, description and robots go into the exported HTML, so search engines and link previews
// (WhatsApp, Facebook) read them without running the page's JavaScript.
import Head from "next/head";
import config from "./config";

const DS = "/_ds/grama-connect/";
// The design system's tokens, one by one (its styles.css only @imports these, and its tokens/fonts.css
// loads Google Fonts). The fonts come from this site (public/fonts/), so the pages never call Google.
const DS_FILES = ["tokens/colors.css", "tokens/typography.css", "tokens/spacing.css"];

interface PageHeadProps {
  /** The page's own global CSS. */
  css: string;
  title: string;
  description?: string;
  robots?: string;
  /** The page's path on the site, for its canonical address. */
  path?: string;
  /** Structured data (schema.org JSON-LD). */
  jsonLd?: object;
}

export default function PageHead({ css, title, description, robots, path = "/", jsonLd }: PageHeadProps) {
  const site = config.siteUrl;
  const imports = DS_FILES.map((f) => `@import url("${DS + f}");`).join("") + `@import url("/fonts/fonts.css");`;
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
      {title ? <title>{title}</title> : null}
      <link rel="icon" type="image/png" href="/assets/logo-mark.png" />
      <link rel="apple-touch-icon" href="/assets/logo-mark.png" />
      <meta name="theme-color" content="#0D3B7A" />
      {robots ? <meta name="robots" content={robots} /> : null}
      {description ? <>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Grama Connect" />
        <meta property="og:locale" content="te_IN" />
        <meta property="og:locale:alternate" content="en_IN" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
      </> : null}
      {description && site ? <>
        {robots ? null : <link rel="canonical" href={site + path} />}
        <meta property="og:url" content={site + path} />
        <meta property="og:image" content={site + "/assets/og-image.jpg"} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Grama Connect: verified village news for Andhra Pradesh, in Telugu" />
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      </> : null}
      <style dangerouslySetInnerHTML={{ __html: imports + css }} />
    </Head>
  );
}
