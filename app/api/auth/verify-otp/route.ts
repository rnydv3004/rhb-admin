import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_key_change_me");

export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ message: "Email and OTP are required" }, { status: 400 });
        }

        // 1. Verify OTP in DB
        const users = await query<any[]>(
            "SELECT id, otp, otp_expiry FROM users WHERE email = ? AND otp = ?",
            [email, otp]
        );

        if (users.length === 0) {
            return NextResponse.json({ message: "Invalid OTP" }, { status: 401 });
        }

        const user = users[0];

        // Check expiry
        if (new Date(user.otp_expiry) < new Date()) {
            return NextResponse.json({ message: "OTP has expired" }, { status: 401 });
        }

        // 2. Clear OTP
        await query("UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?", [user.id]);

        // 3. Generate JWT
        const token = await new SignJWT({ sub: user.id.toString(), email })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("24h")
            .sign(SECRET_KEY);

        // 4. Set Cookie
        (await cookies()).set("session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return NextResponse.json({ message: "Login successful" });
    } catch (error) {
        console.error("Verify OTP Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
