import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

let liveCache = { val: false, exp: 0 };
async function isSiteLive(): Promise<boolean> {
  if (Date.now() < liveCache.exp) return liveCache.val;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
    const res = await fetch(`${url}/rest/v1/settings?id=eq.1&select=site_live`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const data = await res.json();
    const val = !!(Array.isArray(data) && data[0] && data[0].site_live);
    liveCache = { val, exp: Date.now() + 6000 };
    return val;
  } catch {
    return liveCache.exp ? liveCache.val : false;
  }
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  const bypass =
    path.startsWith("/admin") ||
    path.startsWith("/login") ||
    path.startsWith("/api") ||
    path.startsWith("/coming-soon") ||
    path === "/robots.txt" ||
    path === "/sitemap.xml";

  if (!bypass && !user) {
    const live = await isSiteLive();
    if (!live) {
      const url = request.nextUrl.clone();
      url.pathname = "/coming-soon";
      return NextResponse.rewrite(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
