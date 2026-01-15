import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function middleware(req: NextRequest) {
    const session = req.cookies.get("session")?.value;
    const { pathname } = req.nextUrl;

    // 1. Protect Dashboard Routes
    if (pathname.startsWith("/dashboard")) {
        if (!session) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        try {
            await jwtVerify(session, SECRET_KEY);
            return NextResponse.next();
        } catch (error) {
            // Invalid token
            return NextResponse.redirect(new URL("/login", req.url));
        }
    }

    // 2. Redirect logged-in users away from /login
    if (pathname === "/login") {
        if (session) {
            try {
                await jwtVerify(session, SECRET_KEY);
                return NextResponse.redirect(new URL("/dashboard", req.url));
            } catch (error) {
                // Token invalid, let them login
                return NextResponse.next();
            }
        }
    }

    // 3. Redirect / to /dashboard (or /login if not auth, handled by above)
    if (pathname === "/") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
