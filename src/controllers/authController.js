const db = require('../config/db');

// ADMIN ACTION: Registering Teachers/Staff
exports.registerStaff = async (req, res) => {
    const { staffId, password, role, staffName } = req.body;

    try {
        const query = 'INSERT INTO staff (staff_id, password, role, staff_name) VALUES (?, ?, ?, ?)';
        await db.query(query, [staffId, password, role, staffName]);
        
        res.status(201).json({ success: true, message: "Staff account created successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating staff account." });
    }
};

// STAFF LOGIN: ID + Password
exports.loginStaff = async (req, res) => {
    const { staffId, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM staff WHERE staff_id = ? AND password = ?', [staffId, password]);
        
        if (rows.length > 0) {
            res.status(200).json({ 
                success: true, 
                role: rows[0].role,
                staffName: rows[0].staff_name,
                staffId: rows[0].staff_id
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid ID or Password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};