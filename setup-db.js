const db = require('./src/config/db');

async function setupDatabase() {
    console.log("Connecting to the database to create tables...");

    try {
        // 1. Create Staff Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS staff (
                id INT AUTO_INCREMENT PRIMARY KEY,
                staff_id VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Staff table created successfully.");

        // 2. Create Students Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS students (
                id INT AUTO_INCREMENT PRIMARY KEY,
                generated_id VARCHAR(255) UNIQUE NOT NULL,
                student_name VARCHAR(255) NOT NULL,
                dob VARCHAR(255) NOT NULL,
                class_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ Students table created successfully.");

        // 3. Create Results Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS results (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(255) NOT NULL,
                student_fullname VARCHAR(255),
                subject VARCHAR(255) NOT NULL,
                ca_score DECIMAL(5,2) NOT NULL,
                exam_score DECIMAL(5,2) NOT NULL,
                average_score DECIMAL(5,2),
                term VARCHAR(100) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (student_id) REFERENCES students(generated_id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Results table created successfully.");

        // 4. Create Report Metadata Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS report_metadata (
                id INT AUTO_INCREMENT PRIMARY KEY,
                student_id VARCHAR(255) NOT NULL,
                term VARCHAR(100) NOT NULL,
                session VARCHAR(100),
                times_school_opened INT,
                days_present INT,
                days_absent INT,
                teacher_comment TEXT,
                principal_comment TEXT,
                affective_traits JSON,
                psychomotor_traits JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_student_term (student_id, term),
                FOREIGN KEY (student_id) REFERENCES students(generated_id) ON DELETE CASCADE
            )
        `);
        console.log("✅ Report Metadata table created successfully.");

        console.log("🎉 Database setup is completely finished! You can now use the application.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error setting up database:", error);
        process.exit(1);
    }
}

setupDatabase();
