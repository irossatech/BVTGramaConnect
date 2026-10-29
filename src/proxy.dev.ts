// `npm run dev` only (see next.config.ts): forwards /api/ and /media/ to GC_DEV_API (set in .env),
// so both apps run on that server's data while staying same-origin as in production.
// The Origin header is rewritten to the target so Django's CSRF origin check accepts logins and
// other writes; the browser still sends the csrftoken cookie and X-CSRFToken header.
import { NextResponse, type NextRequest } from "next/server";

const target = (process.env.GC_DEV_API || "").replace(/\/+$/, "");

export function proxy(request: NextRequest) {
  if (!target) {
    return NextResponse.json(
      { error: { code: "dev_api_not_set", message: "Set GC_DEV_API in .env (see .env.example), then restart npm run dev." } },
      { status: 503 },
    );
  }
  const { pathname, search } = request.nextUrl;
  const headers = new Headers(request.headers);
  if (headers.has("origin")) headers.set("origin", target);
  return NextResponse.rewrite(new URL(target + pathname + search), { request: { headers } });
}

export const config = { matcher: ["/api/:path*", "/media/:path*"] };
