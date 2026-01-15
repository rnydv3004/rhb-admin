import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import nodemailer from "nodemailer";

// Helper to generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: "Email is required" }, { status: 400 });
        }

        // 1. Check if user exists (Strict: No registration)
        const users = await query<any[]>("SELECT id FROM users WHERE email = ?", [email]);

        if (users.length === 0) {
            return NextResponse.json({ message: "Access Denied: Email not recognized." }, { status: 403 });
        }

        // 2. Generate OTP
        const otp = generateOTP();
        const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // 3. Update User with OTP
        await query("UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?", [otp, expiry, email]);

        // Send OTP via Zoho Mail
        let transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",
            port: 465,
            secure: true,
            auth: {
                user: process.env.ZOHO_EMAIL,
                pass: process.env.ZOHO_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });


        try {
            await transporter.sendMail({
                from: `"MythVortex" <${process.env.ZOHO_EMAIL}>`,
                to: email,
                subject: "Your Royal Access Code",
                html: `
          <div style="font-family: serif; color: #1e3a8a; padding: 20px;">
            <h1 style="border-bottom: 2px solid #ca8a04; padding-bottom: 10px;">MythVortex</h1>
            <p>Your verification code is:</p>
            <h2 style="font-size: 32px; letter-spacing: 5px; color: #ca8a04;">${otp}</h2>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
            });
        } catch (emailError) {
            console.error("Zoho Mail Error:", emailError);
            return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
        }

        return NextResponse.json({ message: "OTP sent successfully" });
    } catch (error) {
        console.error("Send OTP Error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
