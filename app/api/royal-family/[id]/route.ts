import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
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

        await query(
            `UPDATE royal_family 
            SET 
                member_type = ?,
                full_name = ?,
                title_main = ?,
                title_highlight = ?,
                section_subtitle = ?,
                description = ?,
                image_url = ?,
                image_caption = ?,
                role_bottom = ?,
                is_visible = ?,
                display_order = ?,
                updated_at = NOW()
            WHERE id = ?`,
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
                display_order || 0,
                id
            ]
        );

        return NextResponse.json({ message: "Family member updated successfully" });
    } catch (error) {
        console.error("Royal Family PUT Error:", error);
        return NextResponse.json({ message: "Failed to update family member" }, { status: 500 });
    }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await props.params;
        await query("DELETE FROM royal_family WHERE id = ?", [id]);
        return NextResponse.json({ message: "Family member deleted successfully" });
    } catch (error) {
        console.error("Royal Family DELETE Error:", error);
        return NextResponse.json({ message: "Failed to delete family member" }, { status: 500 });
    }
}
