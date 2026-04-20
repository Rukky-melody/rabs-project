const db = require('../config/db');

// TEACHER ACTION: Uploading/Posting scores for a student
exports.uploadScore = async (req, res) => {
    const { studentId, studentFullName, term, scores, subject, caScore, examScore, metadata } = req.body;

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

        // Handle Metadata
        if (metadata) {
            const {
                session, timesSchoolOpened, daysPresent, daysAbsent,
                teacherComment, principalComment, affectiveTraits, psychomotorTraits
            } = metadata;

            // Upsert metadata
            const [existingMeta] = await db.query(
                'SELECT id FROM report_metadata WHERE student_id = ? AND term = ?',
                [studentId, term]
            );

            if (existingMeta.length > 0) {
                await db.query(
                    `UPDATE report_metadata SET 
                        session = ?, times_school_opened = ?, days_present = ?, days_absent = ?, 
                        teacher_comment = ?, principal_comment = ?, affective_traits = ?, psychomotor_traits = ?
                    WHERE id = ?`,
                    [session, timesSchoolOpened, daysPresent, daysAbsent, teacherComment, principalComment, JSON.stringify(affectiveTraits), JSON.stringify(psychomotorTraits), existingMeta[0].id]
                );
            } else {
                await db.query(
                    `INSERT INTO report_metadata 
                        (student_id, term, session, times_school_opened, days_present, days_absent, teacher_comment, principal_comment, affective_traits, psychomotor_traits) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [studentId, term, session, timesSchoolOpened, daysPresent, daysAbsent, teacherComment, principalComment, JSON.stringify(affectiveTraits), JSON.stringify(psychomotorTraits)]
                );
            }
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
            message: "Results and metadata posted successfully to the student portal." 
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

        const [metaRows] = await db.query('SELECT * FROM report_metadata WHERE student_id = ?', [studentId]);

        res.status(200).json({ 
            success: true, 
            results: rows,
            metadata: metaRows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Could not retrieve results." 
        });
    }
};

// TEACHER ACTION: Get results for a specific student + term (for manage panel)
exports.getResultsByTerm = async (req, res) => {
    const { studentId, term } = req.params;
    try {
        const [rows] = await db.query(
            'SELECT * FROM results WHERE student_id = ? AND term = ? ORDER BY subject ASC',
            [studentId, term]
        );
        res.status(200).json({ success: true, results: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not retrieve results." });
    }
};

// TEACHER ACTION: Delete a single result row by ID
exports.deleteResult = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('DELETE FROM results WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Result not found." });
        }
        res.status(200).json({ success: true, message: "Result deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete result." });
    }
};

// TEACHER ACTION: Delete all results for a student for a whole term
exports.deleteTerm = async (req, res) => {
    const { studentId, term } = req.params;
    try {
        const [result] = await db.query(
            'DELETE FROM results WHERE student_id = ? AND term = ?',
            [studentId, term]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No results found for this student and term." });
        }
        res.status(200).json({ success: true, message: `All ${term} results deleted successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete term results." });
    }
};