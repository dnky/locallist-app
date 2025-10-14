import { NextResponse } from 'next/server';

export function middleware(req) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get('host');

  // --- THIS IS THE CRUCIAL FIX ---
  // Prevent middleware from running on static assets, API routes, and internal Next.js files.
  if (
    pathname.startsWith('/_next') ||      // Exclude Next.js internal files
    pathname.startsWith('/api') ||       // Exclude API routes
    pathname.startsWith('/static') ||    // Exclude static files if you have them
    /\.(.*)$/.test(pathname)             // Exclude files with extensions (e.g., .ico, .jpg, .png)
  ) {
    // If it's an asset, do nothing and let the request proceed normally.
    return NextResponse.next();
  }
  // --- END OF FIX ---


  // The rest of your logic remains the same.
  const mainDomain = 'locallist.uk';

  // If the request is for the main domain, show the landing page.
  if (hostname === mainDomain || hostname === 'localhost:3000' || hostname.endsWith('.vercel.app')) {
    url.pathname = '/landing';
    return NextResponse.rewrite(url);
  }

  // Otherwise, let the request proceed to pages/index.js for tenant logic.
  return NextResponse.next();
}