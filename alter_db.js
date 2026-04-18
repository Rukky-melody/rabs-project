const db = require('./src/config/db');

async function alterTable() {
    try {
        await db.query('ALTER TABLE results ADD COLUMN student_fullname VARCHAR(255)');
        console.log('Added student_fullname column');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('student_fullname already exists');
        else console.error('Error adding student_fullname:', e);
    }
    
    try {
        await db.query('ALTER TABLE results ADD COLUMN average_score DECIMAL(5,2)');
        console.log('Added average_score column');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('average_score already exists');
        else console.error('Error adding average_score:', e);
    }
    
    process.exit(0);
}

alterTable();
