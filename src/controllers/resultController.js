const db = require('../config/db');

// TEACHER ACTION: Uploading/Posting scores for a student
exports.uploadScore = async (req, res) => {
    const { studentId, studentFullName, term, scores, subject, caScore, examScore } = req.body;

    try {
        // First, check if the student ID exists to prevent ghost results
        const [studentCheck] = await db.query(
            'SELECT * FROM students WHERE generated_id = ?', 
            [studentId]
        );

        if (studentCheck.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Student ID not found. Verify the ID and try again." 
            });
        }

        // Insert the scores into the results table
        const query = `
            INSERT INTO results (student_id, student_fullname, subject, ca_score, exam_score, term) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        if (scores && Array.isArray(scores)) {
            for (const score of scores) {
                // Check if result already exists
                const [existing] = await db.query(
                    'SELECT id FROM results WHERE student_id = ? AND subject = ? AND term = ?',
                    [studentId, score.subject, term]
                );

                if (existing.length > 0) {
                    await db.query(
                        'UPDATE results SET ca_score = ?, exam_score = ? WHERE id = ?',
                        [score.caScore, score.examScore, existing[0].id]
                    );
                } else {
                    await db.query(query, [studentId, studentFullName, score.subject, score.caScore, score.examScore, term]);
                }
            }
        } else {
            // Fallback
            const [existing] = await db.query(
                'SELECT id FROM results WHERE student_id = ? AND subject = ? AND term = ?',
                [studentId, subject, term]
            );

            if (existing.length > 0) {
                await db.query(
                    'UPDATE results SET ca_score = ?, exam_score = ? WHERE id = ?',
                    [caScore, examScore, existing[0].id]
                );
            } else {
                await db.query(query, [studentId, studentFullName, subject, caScore, examScore, term]);
            }
        }

        res.status(200).json({ 
            success: true, 
            message: "Results posted successfully to the student portal." 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Error uploading scores. Please check database connection." 
        });
    }
};

// STUDENT ACTION: Fetching results for the dashboard
exports.getStudentResults = async (req, res) => {
    const { studentId } = req.params;

    try {
        const query = 'SELECT * FROM results WHERE student_id = ? ORDER BY term ASC';
        const [rows] = await db.query(query, [studentId]);

        res.status(200).json({ 
            success: true, 
            results: rows 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Could not retrieve results." 
        });
    }
};