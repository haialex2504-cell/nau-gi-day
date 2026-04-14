import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const locales = ['vi', 'en']
const defaultLocale = 'vi'

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') || ''
  for (const locale of locales) {
    if (acceptLanguage.includes(locale)) {
      return locale
    }
  }
  return defaultLocale
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    
    // Create redirect response but carry over cookies from Supabase
    const redirectResponse = NextResponse.redirect(request.nextUrl)
    // Copy cookies from our auth updated response to the new redirect response
    response.headers.forEach((value, key) => {
       if (key.toLowerCase() === 'set-cookie') {
          redirectResponse.headers.append(key, value);
       }
    });
    return redirectResponse
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next|api|icon-|default-|favicon\\.ico|manifest\\.webmanifest|sw\\.js|.*\\..*).*)',
  ],
}
