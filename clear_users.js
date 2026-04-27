const db = require('./src/config/db');

async function clearUsers() {
    try {
        console.log("Starting database cleanup...");

        // 1. Delete all students. 
        // Note: Because of ON DELETE CASCADE in setup-db.js, 
        // this will also automatically delete all their results and report metadata!
        const [studentResult] = await db.query("DELETE FROM students");
        console.log(`✅ Deleted ${studentResult.affectedRows} student(s) and their associated results.`);

        // 2. Delete all non-admin staff (teachers)
        const [staffResult] = await db.query("DELETE FROM staff WHERE role != 'admin'");
        console.log(`✅ Deleted ${staffResult.affectedRows} teacher(s).`);

        console.log("Cleanup complete! Only Admin users remain.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during cleanup:", error);
        process.exit(1);
    }
}

clearUsers();
