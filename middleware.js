import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');

  // This part is still important: ignore requests for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const mainDomain = 'locallist.uk';
  const isMainDomain = hostname === mainDomain || hostname === 'localhost:3000' || hostname.endsWith('.vercel.app');

  // --- Rule 1: Rewrite the main domain's homepage to /landing ---
  if (isMainDomain && pathname === '/') {
    url.pathname = '/landing';
    return NextResponse.rewrite(url);
  }

  // --- Rule 2 (NEW): Rewrite /signup on ANY domain to use the dynamic route ---
  // This is the key fix. It tells Next.js to render `pages/[domain]/signup.js`
  // using the current hostname as the `domain` parameter.
  if (pathname === '/signup') {
    // Rewrite to `/<hostname>/signup`
    url.pathname = `/${hostname}/signup`;
    return NextResponse.rewrite(url);
  }

  // --- Rule 3 (NEW): Rewrite /thank-you-signup similarly ---
  if (pathname === '/thank-you-signup') {
    url.pathname = `/${hostname}/thank-you-signup`;
    return NextResponse.rewrite(url);
  }

  // For all other requests (like a tenant's homepage `/` or details page `/details?id=...`),
  // let them proceed to their intended destination.
  return NextResponse.next();
}