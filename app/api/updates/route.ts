import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        const updates = await query(
            "SELECT * FROM app_updates ORDER BY published_at DESC LIMIT ? OFFSET ?",
            [limit.toString(), offset.toString()] // Strings for mysql2 limit handling usually safer, or numbers
        );

        // Convert numbers back if needed, mysql2 handles parameterized limits tricky sometimes, but usually numbers work.
        // For safer parameterized LIMIT in some versions, simple concat validation is utilized if strict mode issues arise,
        // but standard mysql2 pool usually handles integers fine.

        // Also fetch media for these updates? For listing, maybe just primary image?
        // Let's do a quick loop or JOIN. A simple approach is fetching all primary media.
        // Optimization: separate query or subquery. For now, strict CRUD.

        return NextResponse.json(updates);
    } catch (error) {
        console.error("Updates GET Error:", error);
        return NextResponse.json({ message: "Failed to fetch updates" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, title, content, is_active, action_link, action_text, media } = body;
        // media is array of { file_url, file_type, ... } already uploaded via separate upload API

        if (!title || !type) {
            return NextResponse.json({ message: "Title and Type required" }, { status: 400 });
        }

        // 1. Insert Update
        const result = await query<any>(
            `INSERT INTO app_updates (type, title, content, is_active, action_link, action_text, published_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [type, title, content, is_active ? 1 : 0, action_link, action_text]
        );

        const updateId = result.insertId;

        // 2. Insert Media Linked to Update
        if (media && Array.isArray(media) && media.length > 0) {
            for (const file of media) {
                await query(
                    `INSERT INTO media_files (update_id, file_type, file_url, is_primary, title, description)
           VALUES (?, ?, ?, ?, ?, ?)`,
                    [updateId, file.file_type || 'IMAGE', file.file_url, file.is_primary ? 1 : 0, file.title || '', file.description || '']
                );
            }
        }

        return NextResponse.json({ message: "Update created successfully", id: updateId });
    } catch (error) {
        console.error("Update POST Error:", error);
        return NextResponse.json({ message: "Failed to create update" }, { status: 500 });
    }
}
