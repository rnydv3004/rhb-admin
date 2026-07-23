import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const rows = await query<any[]>("SELECT * FROM site_settings");
        // Convert to key-value object
        const settings = rows.reduce((acc, row) => {
            acc[row.setting_key] = row.setting_value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Settings GET Error:", error);
        return NextResponse.json({ message: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { family_tree_photo } = body;

        if (family_tree_photo === undefined) {
            return NextResponse.json({ message: "family_tree_photo is required" }, { status: 400 });
        }

        await query(
            `INSERT INTO site_settings (setting_key, setting_value) 
             VALUES ('family_tree_photo', ?) 
             ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = NOW()`,
            [family_tree_photo, family_tree_photo]
        );

        return NextResponse.json({ message: "Settings updated successfully" });
    } catch (error) {
        console.error("Settings PUT Error:", error);
        return NextResponse.json({ message: "Failed to update settings" }, { status: 500 });
    }
}
