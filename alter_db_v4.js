const db = require('./src/config/db');

async function addMissingIndexes() {
    console.log("Starting database index optimization (v4)...");

    const indexes = [
        {
            table: 'report_metadata',
            name: 'idx_report_class_term',
            query: 'CREATE INDEX idx_report_class_term ON report_metadata (class_name, term)'
        },
        {
            table: 'results',
            name: 'idx_results_student_term_subject',
            query: 'CREATE INDEX idx_results_student_term_subject ON results (student_id, term, subject)'
        },
        {
            table: 'students',
            name: 'idx_student_name',
            query: 'CREATE INDEX idx_student_name ON students (student_name)'
        }
    ];

    for (const idx of indexes) {
        try {
            console.log(`Adding index ${idx.name} to ${idx.table}...`);
            await db.query(idx.query);
            console.log(`✅ Index ${idx.name} added successfully.`);
        } catch (e) {
            // Error code ER_DUP_KEYNAME (1061) means the index already exists.
            if (e.code === 'ER_DUP_KEYNAME' || e.errno === 1061) {
                console.log(`ℹ️ Index ${idx.name} already exists in ${idx.table}. Skipping.`);
            } else {
                console.error(`❌ Error adding index ${idx.name}:`, e.message);
            }
        }
    }

    console.log("Optimization complete.");
    process.exit(0);
}

addMissingIndexes();
