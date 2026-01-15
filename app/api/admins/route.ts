import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const admins = await query("SELECT id, email, created_at FROM users ORDER BY created_at DESC");
        return NextResponse.json(admins);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch admins" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) return NextResponse.json({ message: "Email required" }, { status: 400 });

        await query("INSERT INTO users (email) VALUES (?)", [email]);
        return NextResponse.json({ message: "Admin added" });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            return NextResponse.json({ message: "Email already exists" }, { status: 409 });
        }
        return NextResponse.json({ message: "Failed to add admin" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        await query("DELETE FROM users WHERE id = ?", [id]);
        return NextResponse.json({ message: "Admin removed" });
    } catch (error) {
        return NextResponse.json({ message: "Failed to remove admin" }, { status: 500 });
    }
}
