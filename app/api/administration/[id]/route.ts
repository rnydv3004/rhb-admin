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

            // 1. Image Validation
            if ((lowerTitle.includes("chancellor") || lowerTitle.includes("vice-chancellor")) && !image_url) {
                return NextResponse.json({ message: "Image is mandatory for Chancellor and Vice-Chancellor" }, { status: 400 });
            }

            // 2. Uniqueness Validation
            if (lowerTitle === "chancellor" || lowerTitle === "vice-chancellor") {
                const existing = await query<any[]>(
                    "SELECT id FROM royal_administration WHERE role_title = ? AND id != ?",
                    [role_title, id]
                );

                if (existing.length > 0) {
                    return NextResponse.json({
                        message: `A ${role_title} already exists. Only one is allowed.`
                    }, { status: 400 });
                }
            }
        }

        // 3. Clear Image if not High Council (Strict enforcement)
        let finalImageUrl = image_url;
        if (role_title) {
            const lowerTitle = role_title.toLowerCase();
            if (!lowerTitle.includes("chancellor") && !lowerTitle.includes("vice-chancellor")) {
                finalImageUrl = null;
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
                finalImageUrl || null,
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
