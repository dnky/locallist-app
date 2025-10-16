import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl; // Get the path of the request (e.g., "/", "/thank-you")
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

  // --- THIS IS THE CRUCIAL LOGIC CHANGE ---
  // Check BOTH the hostname AND if the user is at the root homepage.
  if (
    (hostname === mainDomain || hostname === 'localhost:3000' || hostname.endsWith('.vercel.app')) &&
    pathname === '/' // Only rewrite if the path is the homepage
  ) {
    url.pathname = '/landing';
    return NextResponse.rewrite(url);
  }

  // For all other requests (like /thank-you on the main domain, or any request on a tenant domain),
  // let them proceed to their intended destination.
  return NextResponse.next();
}