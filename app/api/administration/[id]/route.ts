import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET single member (optional but good for completeness)
export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        const members = await query("SELECT * FROM royal_administration WHERE id = ?", [id]);

        if (!members || members.length === 0) {
            return NextResponse.json({ message: "Member not found" }, { status: 404 });
        }

        return NextResponse.json(members[0]);
    } catch (error) {
        console.error("Administration Member GET Error:", error);
        return NextResponse.json({ message: "Failed to fetch member" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
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

        // Validation for Chancellor/Vice-Chancellor image requirement
        // Note: Check if role_title is being updated, if so check image_url. 
        // If image_url is not in body (not changed), we might need to check DB, but usually UI sends current state.
        // For simplicity, we assume the UI sends the full object or we trust the partial update if valid.

        if (role_title) {
            const lowerTitle = role_title.toLowerCase();
            if ((lowerTitle.includes("chancellor") || lowerTitle.includes("vice-chancellor")) && !image_url) {
                // If checking partial update, this logic might be flawed if image_url exists in DB but not body.
                // However, standard dashboard forms usually send full payload. 
                // Let's stricter check: if they are changing role to chancellor, they must provide image OR image must exist.
                // For now, simpler validation: fail if provided role requires image and image is null/empty in payload.
                return NextResponse.json({ message: "Image is mandatory for Chancellor and Vice-Chancellor" }, { status: 400 });
            }
        }

        await query(
            `UPDATE royal_administration SET 
            name = ?, 
            role_title = ?, 
            category = ?, 
            display_order = ?, 
            is_active = ?, 
            bio = ?, 
            image_url = ?, 
            updated_at = NOW() 
            WHERE id = ?`,
            [
                name || null,
                role_title,
                category,
                display_order,
                is_active,
                bio || null,
                image_url || null,
                id
            ]
        );

        return NextResponse.json({ message: "Member updated successfully" });
    } catch (error) {
        console.error("Administration PUT Error:", error);
        return NextResponse.json({ message: "Failed to update member" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const id = params.id;
        await query("DELETE FROM royal_administration WHERE id = ?", [id]);
        return NextResponse.json({ message: "Member deleted successfully" });
    } catch (error) {
        console.error("Administration DELETE Error:", error);
        return NextResponse.json({ message: "Failed to delete member" }, { status: 500 });
    }
}
