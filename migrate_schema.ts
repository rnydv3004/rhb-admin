import { query } from "./lib/db";

async function runMigration() {
    try {
        console.log("Altering media_files table...");
        // Assuming MySQL syntax
        await query("ALTER TABLE media_files MODIFY update_id BIGINT NULL");
        console.log("Migration successful: update_id is now nullable.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
