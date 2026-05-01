const db = require('./src/config/db');

async function alterTable() {
    console.log("Starting database alteration v3...");
    const cols = [
        { table: 'report_metadata', name: 'area_improvement', type: 'VARCHAR(500)' },
    ];
    for (const col of cols) {
        try {
            await db.query(`ALTER TABLE ${col.table} ADD COLUMN ${col.name} ${col.type}`);
            console.log(`✅ Added ${col.name} to ${col.table}`);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log(`ℹ️ ${col.name} already exists in ${col.table}`);
            else console.error(`❌ Error:`, e.message);
        }
    }
    console.log("Done.");
    process.exit(0);
}
alterTable();
