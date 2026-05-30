const db = require('../config/db');
const jwt = require('jsonwebtoken');

// ADMIN ACTION: Registering Teachers/Staff
exports.registerStaff = async (req, res) => {
    const { staffId, password, role, staffName, assignedClass } = req.body;

    try {
        const query = 'INSERT INTO staff (staff_id, password, role, staff_name, assigned_class) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [staffId, password, role, staffName, assignedClass || null]);
        
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
            const user = rows[0];
            
            // Generate JWT Token
            const token = jwt.sign(
                { id: user.id, staffId: user.staff_id, role: user.role, name: user.staff_name },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );

            res.status(200).json({ 
                success: true, 
                token: token,
                role: user.role,
                staffName: user.staff_name,
                staffId: user.staff_id,
                assignedClass: user.assigned_class
            });
        } else {
            res.status(401).json({ success: false, message: "Invalid ID or Password" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error." });
    }
};