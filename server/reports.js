import db from './db.js';

export function getRemoteSwitchCount() {
    try {
        // FIX: Use single quotes for 'remote_switch' string literal
        const query = "SELECT COUNT(*) as count FROM analytics WHERE action = 'remote_switch'";
        const result = db.prepare(query).get();
        return result.count;
    } catch (error) {
        console.error("Database access error:", error.message);
        return 0;
    }
}

// To use it:
const totalSwitches = getRemoteSwitchCount();
console.log(`Total Remote Switches: ${totalSwitches}`);