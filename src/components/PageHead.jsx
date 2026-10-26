// <head> for one page: the design-system stylesheets, Google Fonts and the page's own global CSS
// (the prototype's <helmet>). Each page keeps its own, so the website and console CSS never meet.
import Head from "next/head";

const DS = "/_ds/bvt-grama-connect-design-system-3ef6e40d-8ee6-48d5-96b2-aa4e7390341d/";

export default function PageHead({ fonts, css }) {
  return (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" key="viewport" />
      {["tokens/fonts.css", "tokens/colors.css", "tokens/typography.css", "tokens/spacing.css", "styles.css"].map((f) => (
        <link key={f} rel="stylesheet" href={DS + f} />
      ))}
      <link rel="stylesheet" href={"https://fonts.googleapis.com/css2?" + fonts + "&display=swap"} />
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </Head>
  );
}
