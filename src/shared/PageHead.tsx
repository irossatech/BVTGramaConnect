// <head> for one page: the design-system stylesheets, Google Fonts and the page's own global CSS
// (the prototype's <helmet>). Each page keeps its own, so the website and console CSS never meet.
// title, description and robots go into the exported HTML, so search engines and link previews
// (WhatsApp, Facebook) read them without running the page's JavaScript.
import Head from "next/head";
import config from "./config";

const DS = "/_ds/bvt-grama-connect-design-system-3ef6e40d-8ee6-48d5-96b2-aa4e7390341d/";

interface PageHeadProps {
  /** Google Fonts query, e.g. "family=Rubik:wght@500;700&family=Nunito+Sans:wght@400". */
  fonts: string;
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

export default function PageHead({ fonts, css, title, description, robots, path = "/", jsonLd }: PageHeadProps) {
  const site = config.siteUrl;
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
        <meta property="og:site_name" content="BVT Grama Connect" />
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
        <meta property="og:image:alt" content="BVT Grama Connect: verified village news for Andhra Pradesh, in Telugu" />
        <meta name="twitter:card" content="summary_large_image" />
        {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}
      </> : null}
      {["tokens/fonts.css", "tokens/colors.css", "tokens/typography.css", "tokens/spacing.css", "styles.css"].map((f) => (
        <link key={f} rel="stylesheet" href={DS + f} />
      ))}
      <link rel="stylesheet" href={"https://fonts.googleapis.com/css2?" + fonts + "&display=swap"} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </Head>
  );
}
