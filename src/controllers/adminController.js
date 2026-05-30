const db = require('../config/db');

// Get all staff members (excluding passwords)
exports.getStaffs = async (req, res) => {
    try {
        const [staffs] = await db.query(
            'SELECT id, staff_id, staff_name, role, assigned_class, created_at FROM staff ORDER BY created_at DESC'
        );
        res.status(200).json({ success: true, staffs });
    } catch (error) {
        console.error("Error fetching staffs:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve staff data." });
    }
};

// Get all registered students grouped/sorted by class
exports.getStudentsByClass = async (req, res) => {
    try {
        const [students] = await db.query(
            'SELECT generated_id, student_name, class_name, dob, created_at FROM students ORDER BY class_name ASC, student_name ASC'
        );
        
        // Group students by class locally for a cleaner API response
        const groupedStudents = students.reduce((acc, student) => {
            const className = student.class_name || 'Unassigned';
            if (!acc[className]) {
                acc[className] = [];
            }
            acc[className].push(student);
            return acc;
        }, {});

        res.status(200).json({ success: true, classes: groupedStudents });
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ success: false, message: "Failed to retrieve student data." });
    }
};

// Search for published results by student name, id, or class
exports.searchPublishedResults = async (req, res) => {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
        return res.status(400).json({ success: false, message: "Search query is required." });
    }

    const searchTerm = `%${query.trim()}%`;

    try {
        // Search report_metadata joined with students
        const [results] = await db.query(
            `SELECT m.id, m.student_id, m.term, m.class_name, m.created_at, 
                    s.student_name 
             FROM report_metadata m
             JOIN students s ON m.student_id = s.generated_id
             WHERE s.student_name LIKE ? 
                OR s.generated_id LIKE ? 
                OR m.class_name LIKE ?
             ORDER BY m.created_at DESC LIMIT 50`,
            [searchTerm, searchTerm, searchTerm]
        );

        res.status(200).json({ success: true, results });
    } catch (error) {
        console.error("Error searching results:", error);
        res.status(500).json({ success: false, message: "Failed to search results." });
    }
};

// Delete a student and all their associated results (cascades)
exports.deleteStudent = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM students WHERE generated_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Student not found." });
        }
        res.status(200).json({ success: true, message: "Student and all records deleted successfully." });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ success: false, message: "Failed to delete student." });
    }
};

// Delete a staff member
exports.deleteStaff = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM staff WHERE staff_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Staff not found." });
        }
        res.status(200).json({ success: true, message: "Staff member deleted successfully." });
    } catch (error) {
        console.error("Error deleting staff:", error);
        res.status(500).json({ success: false, message: "Failed to delete staff." });
    }
};
