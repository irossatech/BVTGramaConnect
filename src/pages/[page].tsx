// The website's other pages, each at its own readable address (/howitworks/, /officials/, /faq/,
// /contact/, /privacy/, /terms/: website/routes.ts), exported as static HTML at build time.
import type { GetStaticPaths, GetStaticProps } from "next";
import SitePage from "../website/SitePage";
import { pageFromSlug, subpageSlugs, type Page } from "../website/routes";

interface Props {
  page: Page;
}

export const getStaticPaths: GetStaticPaths = () => ({
  paths: subpageSlugs().map((page) => ({ params: { page } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<Props, { page: string }> = ({ params }) => {
  const page = params ? pageFromSlug(params.page) : null;
  return page ? { props: { page } } : { notFound: true };
};

export default function WebsitePage({ page }: Props) {
  return <SitePage page={page} />;
}
