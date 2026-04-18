const db = require('../config/db');

// SELF-REGISTRATION: Student creates their own account
exports.registerStudent = async (req, res) => {
    const { name, dob, className } = req.body;

    try {
        // Generate Unique ID: RABS-2026-XXXX
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const generatedId = `RABS-${year}-${random}`;

        const query = 'INSERT INTO students (student_name, dob, class_name, generated_id) VALUES (?, ?, ?, ?)';
        await db.query(query, [name, dob, className, generatedId]);

        res.status(201).json({ 
            success: true, 
            studentId: generatedId 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Registration failed." });
    }
};

// STUDENT LOGIN: ID-only access
exports.loginStudent = async (req, res) => {
    const { studentId } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM students WHERE generated_id = ?', [studentId]);
        
        if (rows.length > 0) {
            res.status(200).json({ success: true, student: rows[0] });
        } else {
            res.status(401).json({ success: false, message: "Invalid Student ID" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Database error." });
    }
};