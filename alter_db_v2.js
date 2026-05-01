const db = require('./src/config/db');

async function alterTable() {
    console.log("Starting database alteration...");

    const metaColumns = [
        { name: 'age', type: 'VARCHAR(50)' },
        { name: 'number_in_class', type: 'INT' },
        { name: 'position', type: 'VARCHAR(50)' },
        { name: 'status', type: 'VARCHAR(100)' },
        { name: 'end_of_term', type: 'VARCHAR(100)' },
        { name: 'next_term_begins', type: 'VARCHAR(100)' }
    ];

    for (const col of metaColumns) {
        try {
            await db.query(`ALTER TABLE report_metadata ADD COLUMN ${col.name} ${col.type}`);
            console.log(`✅ Added ${col.name} column to report_metadata`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ ${col.name} already exists in report_metadata`);
            else console.error(`❌ Error adding ${col.name}:`, e.message);
        }
    }

    try {
        await db.query(`ALTER TABLE results ADD COLUMN remark VARCHAR(255)`);
        console.log(`✅ Added remark column to results`);
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ remark already exists in results`);
        else console.error(`❌ Error adding remark:`, e.message);
    }

    console.log("Database alteration finished.");
    process.exit(0);
}

alterTable();
