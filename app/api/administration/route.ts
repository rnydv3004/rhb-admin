import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "100"); // Default high limit as admin lists aren't huge usually
        const offset = (page - 1) * limit;

        const members = await query(
            "SELECT * FROM royal_administration ORDER BY display_order ASC, created_at DESC LIMIT ? OFFSET ?",
            [limit.toString(), offset.toString()]
        );

        return NextResponse.json(members);
    } catch (error) {
        console.error("Administration GET Error:", error);
        return NextResponse.json({ message: "Failed to fetch administration members" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            name, 
            role_title, 
            category, 
            display_order, 
            is_active, 
            bio, 
            image_url 
        } = body;

        if (!role_title || !category) {
            return NextResponse.json({ message: "Role Title and Category are required" }, { status: 400 });
        }

        // Validation for Chancellor/Vice-Chancellor image requirement
        const lowerTitle = role_title.toLowerCase();
        if ((lowerTitle.includes("chancellor") || lowerTitle.includes("vice-chancellor")) && !image_url) {
            return NextResponse.json({ message: "Image is mandatory for Chancellor and Vice-Chancellor" }, { status: 400 });
        }

        const result = await query<any>(
            `INSERT INTO royal_administration 
            (name, role_title, category, display_order, is_active, bio, image_url, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                name || null, 
                role_title, 
                category, 
                display_order || 0, 
                is_active !== undefined ? is_active : 1, 
                bio || null, 
                image_url || null
            ]
        );

        return NextResponse.json({ message: "Member added successfully", id: result.insertId });
    } catch (error) {
        console.error("Administration POST Error:", error);
        return NextResponse.json({ message: "Failed to add member" }, { status: 500 });
    }
}
