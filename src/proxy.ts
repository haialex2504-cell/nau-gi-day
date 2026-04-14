import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const locales = ['vi', 'en']
const defaultLocale = 'vi'

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  // Simple locale detection from Accept-Language header
  for (const locale of locales) {
    if (acceptLanguage.includes(locale)) {
      return locale
    }
  }
  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if pathname already has a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) return

  // Redirect to locale-prefixed path
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: [
    // Skip internal paths, static files, images, icons, manifest, sw
    '/((?!_next|api|icon-|default-|favicon\\.ico|manifest\\.webmanifest|sw\\.js|.*\\..*).*)',
  ],
}
