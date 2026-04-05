import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const members = await query(
            "SELECT * FROM royal_family ORDER BY display_order ASC, created_at DESC"
        );
        return NextResponse.json(members);
    } catch (error) {
        console.error("Royal Family GET Error:", error);
        return NextResponse.json({ message: "Failed to fetch royal family members" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            member_type,
            full_name,
            title_main,
            title_highlight,
            section_subtitle,
            description,
            image_url,
            image_caption,
            role_bottom,
            is_visible,
            display_order
        } = body;

        if (!full_name || !member_type) {
            return NextResponse.json({ message: "Full Name and Member Type are required" }, { status: 400 });
        }

        const result = await query<any>(
            `INSERT INTO royal_family 
            (member_type, full_name, title_main, title_highlight, section_subtitle, description, image_url, image_caption, role_bottom, is_visible, display_order, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                member_type,
                full_name,
                title_main || null,
                title_highlight || null,
                section_subtitle || null,
                description || null,
                image_url || null,
                image_caption || null,
                role_bottom || null,
                is_visible !== undefined ? is_visible : 1,
                display_order || 0
            ]
        );

        return NextResponse.json({ message: "Family member added successfully", id: result.insertId });
    } catch (error) {
        console.error("Royal Family POST Error:", error);
        return NextResponse.json({ message: "Failed to add family member" }, { status: 500 });
    }
}
