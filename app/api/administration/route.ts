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

        // 1. Image Validation
        if ((lowerTitle.includes("chancellor") || lowerTitle.includes("vice-chancellor")) && !image_url) {
            return NextResponse.json({ message: "Image is mandatory for Chancellor and Vice-Chancellor" }, { status: 400 });
        }

        // 2. Uniqueness Validation
        // Only enforce singular "Chancellor" and "Vice-Chancellor" if exact match (case-insensitive)
        if (lowerTitle === "chancellor" || lowerTitle === "vice-chancellor") {
            const existing = await query<any[]>(
                "SELECT id FROM royal_administration WHERE role_title = ?",
                [role_title] // Check exact or case-insensitive depend on DB collation. Usually CI default.
            );

            // To be stricter, let's just check lower case comparison in SQL or JS filter if needed, 
            // but standard MySQL is CI.
            if (existing.length > 0) {
                return NextResponse.json({
                    message: `A ${role_title} already exists. Only one is allowed.`
                }, { status: 400 });
            }
        }

        // 3. Clear Image if not High Council (Strict enforcement)
        let finalImageUrl = image_url;
        if (!lowerTitle.includes("chancellor") && !lowerTitle.includes("vice-chancellor")) {
            finalImageUrl = null;
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
                finalImageUrl || null
            ]
        );

        return NextResponse.json({ message: "Member added successfully", id: result.insertId });
    } catch (error) {
        console.error("Administration POST Error:", error);
        return NextResponse.json({ message: "Failed to add member" }, { status: 500 });
    }
}
