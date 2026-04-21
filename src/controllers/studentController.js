const db = require('../config/db');

// SELF-REGISTRATION: Student creates their own account (optional photo)
exports.registerStudent = async (req, res) => {
    const { name, dob, className } = req.body;
    const photoUrl = req.file ? req.file.path : null;

    try {
        // Generate Unique ID: RABS-2026-XXXX
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const generatedId = `RABS-${year}-${random}`;

        const query = 'INSERT INTO students (student_name, dob, class_name, generated_id, photo_url) VALUES (?, ?, ?, ?, ?)';
        await db.query(query, [name, dob, className, generatedId, photoUrl]);

        res.status(201).json({ 
            success: true, 
            studentId: generatedId,
            photoUrl
        });
    } catch (error) {
        console.error(error);
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

// UPLOAD PHOTO: Existing students — one time only
exports.uploadPhoto = async (req, res) => {
    const { studentId } = req.body;
    const photoUrl = req.file ? req.file.path : null;

    if (!photoUrl) {
        return res.status(400).json({ success: false, message: "No photo file received." });
    }

    try {
        // Check if student already has a photo
        const [rows] = await db.query(
            'SELECT photo_url FROM students WHERE generated_id = ?',
            [studentId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }

        if (rows[0].photo_url) {
            return res.status(403).json({ 
                success: false, 
                message: "Photo already set. Profile photo can only be uploaded once." 
            });
        }

        // Save the photo URL
        await db.query(
            'UPDATE students SET photo_url = ? WHERE generated_id = ?',
            [photoUrl, studentId]
        );

        res.status(200).json({ success: true, photoUrl });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Failed to upload photo." });
    }
};