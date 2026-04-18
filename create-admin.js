const db = require('./src/config/db');

async function createDefaultAdmin() {
    try {
        console.log("Checking for existing admin accounts...");
        const [rows] = await db.query("SELECT * FROM staff WHERE role = 'admin'");
        
        if (rows.length === 0) {
            console.log("No admin found. Creating default admin account...");
            await db.query(
                "INSERT INTO staff (staff_id, password, role) VALUES (?, ?, ?)",
                ['admin', 'admin123', 'admin']
            );
            console.log("✅ Default admin created successfully!");
            console.log("ID: admin");
            console.log("Password: admin123");
        } else {
            console.log("An admin account already exists. Skipping default creation.");
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating default admin:", error);
        process.exit(1);
    }
}

createDefaultAdmin();
