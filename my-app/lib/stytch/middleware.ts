import { NextResponse, type NextRequest } from "next/server";
import { createStytchServerClient } from "./server";

export async function updateSession(request: NextRequest) {
  const stytch = createStytchServerClient();

  // Get the session token from cookies
  const sessionToken = request.cookies.get('stytch_session')?.value;

  // If there's no session token and the user is trying to access protected routes
  if (!sessionToken &&
      request.nextUrl.pathname !== "/" &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/authenticate")) {
    const url = request.nextUrl.clone();
    url.pathname = "/authenticate";
    return NextResponse.redirect(url);
  }

  // If there's a session token, validate it
  if (sessionToken) {
    try {
      await stytch.sessions.authenticate({
        session_token: sessionToken,
      });
    } catch (error) {
      // If session is invalid and user is trying to access protected routes
      if (request.nextUrl.pathname !== "/" &&
          !request.nextUrl.pathname.startsWith("/auth") &&
          !request.nextUrl.pathname.startsWith("/authenticate")) {
        const url = request.nextUrl.clone();
        url.pathname = "/authenticate";
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}