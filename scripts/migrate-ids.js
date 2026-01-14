const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'interview.db');

function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

function generateShortId(length = 4) {
    const alphabet = '23456789abcdefghjkmnpqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return result;
}

function migrate() {
    console.log('Starting ID migration...');
    const db = new Database(DB_PATH);
    db.pragma('foreign_keys = OFF'); // Disable during migration to allow ID changes

    const users = db.prepare('SELECT id, name FROM users').all();

    db.transaction(() => {
        for (const user of users) {
            if (user.id.length < 20) {
                console.log(`Skipping user ${user.name} (ID already short: ${user.id})`);
                continue;
            }

            const newId = slugify(user.name) + '-' + generateShortId(4);
            console.log(`Migrating user ${user.name}: ${user.id} -> ${newId}`);

            // Update user ID
            db.prepare('UPDATE users SET id = ? WHERE id = ?').run(newId, user.id);

            // Update RAG files
            db.prepare('UPDATE rag_files SET user_id = ? WHERE user_id = ?').run(newId, user.id);

            // Update interview sessions
            db.prepare('UPDATE interview_sessions SET user_id = ? WHERE user_id = ?').run(newId, user.id);
        }
    })();

    db.pragma('foreign_keys = ON');
    console.log('Migration completed successfully.');
}

try {
    migrate();
} catch (e) {
    console.error('Migration failed:', e);
}
