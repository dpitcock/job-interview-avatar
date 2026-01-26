const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, '..', 'data', 'interview.db');

function addSamuelYoon() {
    const db = new Database(DB_PATH);

    // Initialize schema
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            role TEXT,
            situation TEXT,
            avatar_configured BOOLEAN DEFAULT 0,
            avatar_name TEXT,
            avatar_image_url TEXT,
            voice_configured BOOLEAN DEFAULT 0,
            voice_id TEXT,
            voice_sample_url TEXT,
            llm_local_model TEXT DEFAULT 'gemma3:latest',
            llm_cloud_provider TEXT DEFAULT 'openai',
            llm_cloud_model TEXT DEFAULT 'gpt-4o',
            llm_preferred_mode TEXT DEFAULT 'LOCAL',
            is_demo BOOLEAN DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS rag_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            filename TEXT NOT NULL,
            file_type TEXT,
            content TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    `);

    // Prevent duplicates by deleting existing demo user with the same name
    db.prepare('DELETE FROM users WHERE name = ? AND is_demo = 1').run('Samuel Yoon');

    const id = 'samuel-yoon'; // Use readable ID for demo user
    const now = new Date().toISOString();

    const user = {
        id,
        name: 'Samuel Yoon',
        email: 'syoon@protonmail.com',
        phone: '',
        role: 'Senior Frontend Engineer',
        situation: 'Applying for a Senior Frontend role at a major tech company. The interview covers technical experience, leadership, and culture fit.',
        avatar_configured: 0,
        avatar_name: 'Wayne_20240711',
        avatar_image_url: 'https://files2.heygen.ai/avatar/v3/b66c9f3dabf74b03832ebe2dfadd935f_44330/preview_talk_1.webp',
        voice_configured: 0,
        voice_id: '',
        voice_sample_url: '',
        llm_local_model: 'gemma3:latest',
        llm_cloud_provider: 'anthropic',
        llm_cloud_model: 'claude-3-5-sonnet-20241022',
        llm_preferred_mode: 'CLOUD',
        is_demo: 1,
        created_at: now,
        updated_at: now
    };

    const stmt = db.prepare(`
        INSERT INTO users (
            id, name, email, phone, role, situation,
            avatar_configured, avatar_name, avatar_image_url,
            voice_configured, voice_id, voice_sample_url,
            llm_local_model, llm_cloud_provider, llm_cloud_model, llm_preferred_mode,
            is_demo,
            created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
        user.id, user.name, user.email, user.phone, user.role, user.situation,
        user.avatar_configured, user.avatar_name, user.avatar_image_url,
        user.voice_configured, user.voice_id, user.voice_sample_url,
        user.llm_local_model, user.llm_cloud_provider, user.llm_cloud_model,
        user.llm_preferred_mode,
        user.is_demo,
        user.created_at, user.updated_at
    );

    // Pre-load RAG files for the demo user
    const mockFilesDir = path.join(__dirname, '..', 'docs', 'mock-user-context-files', 'Samuel-Yoon');
    if (fs.existsSync(mockFilesDir)) {
        // Clear existing RAG files for this user to avoid duplicates
        db.prepare('DELETE FROM rag_files WHERE user_id = ?').run(user.id);

        const files = fs.readdirSync(mockFilesDir);
        const ragStmt = db.prepare(`
            INSERT INTO rag_files (user_id, filename, file_type, content, created_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const filename of files) {
            if (filename.endsWith('.md') || filename.endsWith('.txt')) {
                const filePath = path.join(mockFilesDir, filename);
                const content = fs.readFileSync(filePath, 'utf8');
                ragStmt.run(user.id, filename, 'text/markdown', content, now);
            }
        }
        console.log(`Pre-loaded RAG files for ${user.name}`);
    }

    console.log(`Successfully added user: ${user.name} (ID: ${user.id})`);
}

try {
    addSamuelYoon();
} catch (e) {
    console.error('Failed to add user:', e);
}
