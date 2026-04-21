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

    try {
        await db.query("ALTER TABLE report_metadata ADD COLUMN sex VARCHAR(10)");
        console.log('Added sex column to report_metadata');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('sex already exists in report_metadata');
        else console.error('Error adding sex:', e);
    }

    try {
        await db.query("ALTER TABLE report_metadata ADD COLUMN class_name VARCHAR(50)");
        console.log('Added class_name column to report_metadata');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('class_name already exists in report_metadata');
        else console.error('Error adding class_name:', e);
    }

    try {
        await db.query("ALTER TABLE students ADD COLUMN photo_url VARCHAR(500)");
        console.log('Added photo_url column to students');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('photo_url already exists in students');
        else console.error('Error adding photo_url:', e);
    }

    try {
        await db.query("ALTER TABLE staff ADD COLUMN staff_name VARCHAR(255)");
        console.log('Added staff_name column to staff');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('staff_name already exists in staff');
        else console.error('Error adding staff_name:', e);
    }

    try {
        await db.query("ALTER TABLE report_metadata ADD COLUMN uploaded_by VARCHAR(255)");
        console.log('Added uploaded_by column to report_metadata');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('uploaded_by already exists in report_metadata');
        else console.error('Error adding uploaded_by:', e);
    }

    try {
        await db.query("ALTER TABLE report_metadata ADD COLUMN uploaded_by_id VARCHAR(255)");
        console.log('Added uploaded_by_id column to report_metadata');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') console.log('uploaded_by_id already exists in report_metadata');
        else console.error('Error adding uploaded_by_id:', e);
    }
    
    process.exit(0);
}

alterTable();
