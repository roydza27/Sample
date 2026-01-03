import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize the database connection
const db = new Database(path.join(__dirname, '../repo_sense.db'), { verbose: console.log });

// Export it so other files can use it
export default db;