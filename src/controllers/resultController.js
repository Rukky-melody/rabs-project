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
                crecheEvaluations,
                age, numberInClass, position, status, endOfTerm, nextTermBegins
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
                        teacher_comment = ?, principal_comment = ?, uploaded_by = ?, uploaded_by_id = ?, affective_traits = ?, psychomotor_traits = ?, creche_evaluations = ?,
                        age = ?, number_in_class = ?, position = ?, status = ?, end_of_term = ?, next_term_begins = ?
                    WHERE id = ?`,
                    [
                        sex || null, studentClass || null, session, timesSchoolOpened, daysPresent, daysAbsent, 
                        teacherComment, principalComment, uploadedBy || null, uploadedById || null, 
                        JSON.stringify(affectiveTraits || {}), JSON.stringify(psychomotorTraits || {}), JSON.stringify(crecheEvaluations || null),
                        age || null, numberInClass || null, position || null, status || null, endOfTerm || null, nextTermBegins || null,
                        existingMeta[0].id
                    ]
                );
            } else {
                await db.query(
                    `INSERT INTO report_metadata 
                        (student_id, term, sex, class_name, session, times_school_opened, days_present, days_absent, teacher_comment, principal_comment, uploaded_by, uploaded_by_id, affective_traits, psychomotor_traits, creche_evaluations, age, number_in_class, position, status, end_of_term, next_term_begins) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        studentId, term, sex || null, studentClass || null, session, timesSchoolOpened, daysPresent, daysAbsent, 
                        teacherComment, principalComment, uploadedBy || null, uploadedById || null, 
                        JSON.stringify(affectiveTraits || {}), JSON.stringify(psychomotorTraits || {}), JSON.stringify(crecheEvaluations || null),
                        age || null, numberInClass || null, position || null, status || null, endOfTerm || null, nextTermBegins || null
                    ]
                );
            }
        }

        // Insert the scores into the results table
        const query = `
            INSERT INTO results (student_id, student_fullname, subject, ca_score, first_test, second_test, exam_score, term, remark) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                        'UPDATE results SET ca_score = ?, first_test = ?, second_test = ?, exam_score = ?, remark = ? WHERE id = ?',
                        [score.caScore || 0, score.firstTest || 0, score.secondTest || 0, score.examScore || 0, score.remark || '', existing[0].id]
                    );
                } else {
                    await db.query(query, [studentId, studentFullName, score.subject, score.caScore || 0, score.firstTest || 0, score.secondTest || 0, score.examScore || 0, term, score.remark || '']);
                }
            }
        } else if (subject) {
            // Fallback (for single subject upload if used)
            const [existing] = await db.query(
                'SELECT id FROM results WHERE student_id = ? AND subject = ? AND term = ?',
                [studentId, subject, term]
            );

            if (existing.length > 0) {
                await db.query(
                    'UPDATE results SET ca_score = ?, first_test = ?, second_test = ?, exam_score = ?, remark = ? WHERE id = ?',
                    [caScore || 0, firstTest || 0, secondTest || 0, examScore || 0, req.body.remark || '', existing[0].id]
                );
            } else {
                await db.query(query, [studentId, studentFullName, subject, caScore || 0, firstTest || 0, secondTest || 0, examScore || 0, term, req.body.remark || '']);
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

// Helper: ordinal suffix (1 → "1st", 2 → "2nd", 12 → "12th")
function getOrdinal(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// STUDENT ACTION: Fetching results for the dashboard
exports.getStudentResults = async (req, res) => {
    const { studentId } = req.params;

    try {
        const [rows] = await db.query(
            'SELECT * FROM results WHERE student_id = ? ORDER BY term ASC',
            [studentId]
        );

        const [metaRows] = await db.query(
            'SELECT * FROM report_metadata WHERE student_id = ?',
            [studentId]
        );

        // ── Auto-calculate Position & Number in Class per term ──
        // Build a map: term → { calculatedPosition, numberOfStudents }
        const classRankMap = {};

        for (const meta of metaRows) {
            const { term, class_name } = meta;
            if (!class_name || !term) continue;

            // Find all students in the same class + term
            const [classMates] = await db.query(
                'SELECT student_id FROM report_metadata WHERE class_name = ? AND term = ?',
                [class_name, term]
            );

            const isPrenursery = class_name.toUpperCase().trim() === 'PRE-NURSERY';

            // Calculate aggregate for every classmate
            const aggregates = [];
            for (const { student_id } of classMates) {
                const [subjectRows] = await db.query(
                    'SELECT first_test, second_test, exam_score FROM results WHERE student_id = ? AND term = ?',
                    [student_id, term]
                );
                const aggregate = subjectRows.reduce((sum, r) => {
                    if (isPrenursery) {
                        return sum + (parseFloat(r.first_test) || 0);
                    }
                    return sum + (parseFloat(r.first_test) || 0)
                                + (parseFloat(r.second_test) || 0)
                                + (parseFloat(r.exam_score) || 0);
                }, 0);
                aggregates.push({ student_id, aggregate });
            }

            // Sort descending (highest aggregate = 1st)
            aggregates.sort((a, b) => b.aggregate - a.aggregate);

            const numberOfStudents = aggregates.length;
            const rankIndex = aggregates.findIndex(a => a.student_id === studentId);
            const position = rankIndex >= 0 ? getOrdinal(rankIndex + 1) : '--';

            classRankMap[term] = { calculatedPosition: position, numberOfStudents };
        }

        res.status(200).json({ 
            success: true, 
            results: rows,
            metadata: metaRows,
            classRankMap   // e.g. { "First Term": { calculatedPosition: "1st", numberOfStudents: 20 } }
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