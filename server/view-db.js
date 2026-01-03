import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Using 'reposense.db' because it is the one with 24KB of data
const dbPath = path.resolve(__dirname, 'reposense.db'); 

const db = new Database(dbPath, { readonly: true });

console.log(`\n--- 📜 READING FROM: ${dbPath} ---`);

try {
    // We check if the table exists first to give a helpful message
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='commits'").get();
    
    if (!tableCheck) {
        console.log("❌ The table 'commits' does not exist in this database file.");
        const allTables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
        console.log("Available tables:", allTables.map(t => t.name).join(', '));
    } else {
        const commits = db.prepare("SELECT * FROM commits ORDER BY timestamp DESC").all();
        
        if (commits.length === 0) {
            console.log("Empty table: No commits recorded yet.");
        } else {
            console.table(commits);
            console.log(`\nTotal Records: ${commits.length}`);
        }
    }
} catch (err) {
    console.error("❌ Error:", err.message);
} finally {
    db.close();
}