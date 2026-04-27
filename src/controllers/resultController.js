const db = require('../config/db');

// TEACHER ACTION: Uploading/Posting scores for a student
exports.uploadScore = async (req, res) => {
    const { studentId, studentFullName, term, scores, subject, caScore, firstTest, secondTest, examScore, metadata } = req.body;

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
                sex, studentClass,
                session, timesSchoolOpened, daysPresent, daysAbsent,
                teacherComment, principalComment, uploadedBy, uploadedById, affectiveTraits, psychomotorTraits,
                crecheEvaluations
            } = metadata;

            // Upsert metadata
            const [existingMeta] = await db.query(
                'SELECT id FROM report_metadata WHERE student_id = ? AND term = ?',
                [studentId, term]
            );

            if (existingMeta.length > 0) {
                await db.query(
                    `UPDATE report_metadata SET 
                        sex = ?, class_name = ?,
                        session = ?, times_school_opened = ?, days_present = ?, days_absent = ?, 
                        teacher_comment = ?, principal_comment = ?, uploaded_by = ?, uploaded_by_id = ?, affective_traits = ?, psychomotor_traits = ?, creche_evaluations = ?
                    WHERE id = ?`,
                    [sex || null, studentClass || null, session, timesSchoolOpened, daysPresent, daysAbsent, teacherComment, principalComment, uploadedBy || null, uploadedById || null, JSON.stringify(affectiveTraits || {}), JSON.stringify(psychomotorTraits || {}), JSON.stringify(crecheEvaluations || null), existingMeta[0].id]
                );
            } else {
                await db.query(
                    `INSERT INTO report_metadata 
                        (student_id, term, sex, class_name, session, times_school_opened, days_present, days_absent, teacher_comment, principal_comment, uploaded_by, uploaded_by_id, affective_traits, psychomotor_traits, creche_evaluations) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [studentId, term, sex || null, studentClass || null, session, timesSchoolOpened, daysPresent, daysAbsent, teacherComment, principalComment, uploadedBy || null, uploadedById || null, JSON.stringify(affectiveTraits || {}), JSON.stringify(psychomotorTraits || {}), JSON.stringify(crecheEvaluations || null)]
                );
            }
        }

        // Insert the scores into the results table
        const query = `
            INSERT INTO results (student_id, student_fullname, subject, ca_score, first_test, second_test, exam_score, term) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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
                        'UPDATE results SET ca_score = ?, first_test = ?, second_test = ?, exam_score = ? WHERE id = ?',
                        [score.caScore || 0, score.firstTest || 0, score.secondTest || 0, score.examScore || 0, existing[0].id]
                    );
                } else {
                    await db.query(query, [studentId, studentFullName, score.subject, score.caScore || 0, score.firstTest || 0, score.secondTest || 0, score.examScore || 0, term]);
                }
            }
        } else if (subject) {
            // Fallback
            const [existing] = await db.query(
                'SELECT id FROM results WHERE student_id = ? AND subject = ? AND term = ?',
                [studentId, subject, term]
            );

            if (existing.length > 0) {
                await db.query(
                    'UPDATE results SET ca_score = ?, first_test = ?, second_test = ?, exam_score = ? WHERE id = ?',
                    [caScore || 0, firstTest || 0, secondTest || 0, examScore || 0, existing[0].id]
                );
            } else {
                await db.query(query, [studentId, studentFullName, subject, caScore || 0, firstTest || 0, secondTest || 0, examScore || 0, term]);
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
        const [meta] = await db.query(
            'SELECT * FROM report_metadata WHERE student_id = ? AND term = ?',
            [studentId, term]
        );
        res.status(200).json({ success: true, results: rows, metadata: meta });
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
        const [meta] = await db.query(
            'DELETE FROM report_metadata WHERE student_id = ? AND term = ?',
            [studentId, term]
        );
        if (result.affectedRows === 0 && meta.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "No results found for this student and term." });
        }
        res.status(200).json({ success: true, message: `All ${term} results deleted successfully.` });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not delete term results." });
    }
};