import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const updates = await query("SELECT * FROM app_updates WHERE id = ?", [id]);

        if (!updates || updates.length === 0) {
            return NextResponse.json({ message: "Update not found" }, { status: 404 });
        }

        return NextResponse.json(updates[0]);
    } catch (error) {
        console.error("Update GET Error:", error);
        return NextResponse.json({ message: "Failed to fetch update" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const {
            type,
            title,
            content,
            is_active,
            action_link,
            action_text
        } = body;

        if (!title || !type) {
            return NextResponse.json({ message: "Title and Type required" }, { status: 400 });
        }

        await query(
            `UPDATE app_updates SET 
            type = ?, 
            title = ?, 
            content = ?, 
            is_active = ?, 
            action_link = ?, 
            action_text = ? 
            WHERE id = ?`,
            [
                type,
                title,
                content,
                is_active ? 1 : 0,
                action_link || null,
                action_text || null,
                id
            ]
        );

        return NextResponse.json({ message: "Update updated successfully" });
    } catch (error) {
        console.error("Update PUT Error:", error);
        return NextResponse.json({ message: "Failed to update member" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Optional: Delete associated media first
        await query("DELETE FROM media_files WHERE update_id = ?", [id]);

        // Delete the update
        await query("DELETE FROM app_updates WHERE id = ?", [id]);

        return NextResponse.json({ message: "Update deleted successfully" });
    } catch (error) {
        console.error("Update DELETE Error:", error);
        return NextResponse.json({ message: "Failed to delete update" }, { status: 500 });
    }
}
