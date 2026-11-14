// The website's 404 page (dist/404.html): the site's header and footer with a "page not found" message and a
// link home. Nginx serves it for any address that names no page (BackEnd deploy/templates/nginx-locations.conf,
// error_page 404). Without this file Next.js exported its bare English default.
import SitePage from "../website/SitePage";

export default function NotFoundPage() {
  return <SitePage page="home" notFound />;
}
