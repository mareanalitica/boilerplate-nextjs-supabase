/**
 * Middleware
 * Protect routes and handle redirects
 */

import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

export async function middleware(request: NextRequest) {
  // Update session
  const response = await updateSession(request)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/protected', '/onboarding']
  const authRoutes = ['/auth/login', '/auth/sign-up']

  const pathname = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Get auth status from cookies
  const authToken = request.cookies.get('sb-access-token')
  const isAuthenticated = !!authToken

  // If accessing protected routes without auth, redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    return Response.redirect(new URL('/auth/login', request.url))
  }

  // If accessing auth routes while authenticated, redirect to dashboard/onboarding
  if (isAuthRoute && isAuthenticated) {
    // Check if onboarding is needed (this would require checking the onboarding_state table)
    // For now, redirect to dashboard
    return Response.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
