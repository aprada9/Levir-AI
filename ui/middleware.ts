import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check if the request is for an auth page
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                      req.nextUrl.pathname.startsWith('/register')

    // If user is signed in and trying to access auth pages, redirect to search
    if (session && isAuthPage) {
      return NextResponse.redirect(new URL('/search', req.url))
    }

    // If user is not signed in and trying to access protected pages, redirect to login
    if (!session && !isAuthPage) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 