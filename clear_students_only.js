const db = require('./src/config/db');

async function clearStudents() {
    try {
        console.log("Starting student database cleanup...");

        // Delete all students. 
        // Because of ON DELETE CASCADE, this automatically deletes all results and metadata.
        const [result] = await db.query("DELETE FROM students");
        
        console.log(`✅ Success! Deleted ${result.affectedRows} student(s) and all their associated records.`);
        console.log("Staff (Teachers and Admins) have been left untouched.");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during cleanup:", error);
        process.exit(1);
    }
}

clearStudents();
