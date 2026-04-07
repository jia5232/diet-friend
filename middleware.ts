import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 인증이 필요하지 않은 경로
const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 환경변수가 없으면 그냥 통과
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    // 공개 경로는 인증 체크 불필요
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

    // 로그인된 사용자가 인증 페이지 접근 시 홈으로 리다이렉트
    if (user && isPublicPath) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 로그인 안된 사용자가 보호된 페이지 접근 시 로그인으로 리다이렉트
    if (!user && !isPublicPath && pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return response;
  } catch (error) {
    // 에러 발생 시 그냥 통과
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.).*)',
  ],
};
