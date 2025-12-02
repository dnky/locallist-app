import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/admin') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const mainDomain = 'locallist.uk';
  const isMainDomain = hostname === mainDomain || hostname === 'localhost:3000' || hostname.endsWith('.vercel.app');

  // Rule 1: Rewrite main domain homepage
  if (isMainDomain && pathname === '/') {
    url.pathname = '/landing';
    return NextResponse.rewrite(url);
  }

  // Rule 2: Rewrite /signup
  if (pathname === '/signup') {
    url.pathname = `/${hostname}/signup`;
    return NextResponse.rewrite(url);
  }

  // Rule 3: Rewrite /thank-you-signup
  if (pathname === '/thank-you-signup') {
    url.pathname = `/${hostname}/thank-you-signup`;
    return NextResponse.rewrite(url);
  }
  
  // Rule 4 (Existing): Tenant Homepage
  if (pathname === '/') {
    url.pathname = `/${hostname}`;
    return NextResponse.rewrite(url);
  }

  // --- Rule 5 (NEW): Catch-all for Root Level slugs ---
  // If we are here, it's not a static file, not api, and not / or /signup.
  // We rewrite it to /hostname/path so [slug].js can catch it.
  url.pathname = `/${hostname}${pathname}`;
  return NextResponse.rewrite(url);
}