import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type");

        let sql = "SELECT * FROM media_files";
        const values = [];

        if (type) {
            if (type === 'FEATURED') {
                sql += " WHERE file_type IN ('FIMG', 'FVID')";
            } else {
                sql += " WHERE file_type = ?";
                values.push(type);
            }
        }

        sql += " ORDER BY id DESC";

        const media = await query(sql, values);
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch media" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { file_url, file_type, title, subTitle, description } = body;

        if (!file_url) return NextResponse.json({ message: "URL required" }, { status: 400 });

        await query(
            "INSERT INTO media_files (file_url, file_type, is_primary, title, subTitle, description) VALUES (?, ?, 0, ?, ?, ?)",
            [file_url, file_type || 'IMAGE', title || '', subTitle || '', description || '']
        );

        return NextResponse.json({ message: "Media added" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Failed to add media" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { id, file_type, title, subTitle, description, file_url } = await req.json();

        if (!id || !file_type) {
            return NextResponse.json({ message: "ID and Type required" }, { status: 400 });
        }

        // Check limits if changing to featured type
        if (file_type === 'FIMG') {
            const count = await query<any[]>("SELECT COUNT(*) as c FROM media_files WHERE file_type = 'FIMG' AND id != ?", [id]);
            if (count[0].c >= 4) {
                return NextResponse.json({ message: "Limit reached: Maximum 4 Featured Images allowed." }, { status: 400 });
            }
        }

        if (file_type === 'FVID') {
            const count = await query<any[]>("SELECT COUNT(*) as c FROM media_files WHERE file_type = 'FVID' AND id != ?", [id]);
            if (count[0].c >= 1) {
                return NextResponse.json({ message: "Limit reached: Maximum 1 Featured Video allowed." }, { status: 400 });
            }
        }

        await query(
            "UPDATE media_files SET file_type = ?, title = ?, subTitle = ?, description = ?, file_url = ? WHERE id = ?",
            [file_type, title || '', subTitle || '', description || '', file_url || '', id]
        );
        return NextResponse.json({ message: "Media updated successfully" });

    } catch (error) {
        return NextResponse.json({ message: "Update failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

        await query("DELETE FROM media_files WHERE id = ?", [id]);
        return NextResponse.json({ message: "Media deleted" });
    } catch (e) {
        return NextResponse.json({ message: "Delete failed" }, { status: 500 });
    }
}
