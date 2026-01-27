import path from 'path';
import fs from 'fs';

import { IS_VERCEL } from './env';

let db: any;

if (IS_VERCEL) {
    console.log('Running on Vercel: Using mock/read-only mode');
    let fallbackData: { users: any[] } = { users: [] };
    try {
        const fallbackPath = path.join(process.cwd(), 'src', 'data', 'users-fallback.json');
        if (fs.existsSync(fallbackPath)) {
            fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
        }
    } catch (e) {
        console.error('Failed to load fallback data:', e);
    }

    db = {
        prepare: (query: string) => ({
            all: (id?: string) => {
                if (query.includes('FROM candidates')) return fallbackData.users;
                if (query.includes('FROM rag_files')) {
                    const candidate = fallbackData.users.find((u: any) => u.id === id);
                    return candidate?.files || [];
                }
                return [];
            },
            get: (id: string) => {
                if (query.includes('FROM candidates WHERE id = ?')) {
                    return fallbackData.users.find((u: any) => u.id === id) || null;
                }
                if (query.includes('SELECT COUNT(*) as count FROM rag_files')) {
                    const candidate = fallbackData.users.find((u: any) => u.id === id);
                    return { count: candidate?.files?.length || 0 };
                }
                return null;
            },
            run: () => ({ changes: 0 }),
        }),
        exec: () => { },
        pragma: () => { },
    };
} else {
    try {
        const Database = require('better-sqlite3');
        const DB_PATH = path.join(process.cwd(), 'data', 'interview.db');

        const dataDir = path.dirname(DB_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        db = new Database(DB_PATH);
        db.pragma('foreign_keys = ON');

        // Migration logic for existing databases (Run BEFORE CREATE TABLE)
        try {
            const tableInfo = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
            if (tableInfo) {
                console.log('Migrating users table to candidates...');
                db.exec(`
                    ALTER TABLE users RENAME TO candidates;
                    ALTER TABLE rag_files RENAME COLUMN user_id TO candidate_id;
                    ALTER TABLE interview_sessions RENAME COLUMN user_id TO candidate_id;
                `);
            }
        } catch (e) {
            console.error('Migration failed or already completed:', e);
        }

        // Schema Fix: Ensure Foreign Keys point to candidates, not users
        try {
            const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='interview_sessions'").get();
            if (schema && schema.sql.includes('REFERENCES users')) {
                console.log('Fixing interview_sessions foreign key...');
                db.exec(`
                    CREATE TABLE interview_sessions_new (
                        id TEXT PRIMARY KEY,
                        candidate_id TEXT NOT NULL,
                        title TEXT,
                        status TEXT DEFAULT 'active',
                        created_at TEXT DEFAULT (datetime('now')),
                        FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
                    );
                    INSERT INTO interview_sessions_new SELECT * FROM interview_sessions;
                    DROP TABLE interview_sessions;
                    ALTER TABLE interview_sessions_new RENAME TO interview_sessions;
                `);
            }

            const ragSchema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='rag_files'").get();
            if (ragSchema && ragSchema.sql.includes('REFERENCES users')) {
                console.log('Fixing rag_files foreign key...');
                db.exec(`
                    CREATE TABLE rag_files_new (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        candidate_id TEXT NOT NULL,
                        filename TEXT NOT NULL,
                        file_type TEXT,
                        content TEXT,
                        created_at TEXT DEFAULT (datetime('now')),
                        FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
                    );
                    INSERT INTO rag_files_new SELECT * FROM rag_files;
                    DROP TABLE rag_files;
                    ALTER TABLE rag_files_new RENAME TO rag_files;
                `);
            }
        } catch (e) {
            console.error('Schema fix failed:', e);
        }

        db.exec(`
            CREATE TABLE IF NOT EXISTS candidates (
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

            CREATE TABLE IF NOT EXISTS system_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );

            INSERT OR IGNORE INTO system_settings (key, value) VALUES ('llm_mode', 'LOCAL');
            INSERT OR IGNORE INTO system_settings (key, value) VALUES ('llm_local_model', 'gemma3:latest');
            INSERT OR IGNORE INTO system_settings (key, value) VALUES ('llm_cloud_model', 'gpt-4o');

            CREATE TABLE IF NOT EXISTS rag_files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                candidate_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                file_type TEXT,
                content TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS interview_sessions (
                id TEXT PRIMARY KEY,
                candidate_id TEXT NOT NULL,
                title TEXT,
                status TEXT DEFAULT 'active',
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (candidate_id) REFERENCES candidates (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS interview_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
            );
        `);
    } catch (e) {
        console.error('Failed to initialize SQLite, falling back to mock:', e);
        db = {
            prepare: () => ({
                all: () => [],
                get: () => null,
                run: () => ({ changes: 0 }),
            }),
            exec: () => { },
            pragma: () => { },
        };
    }
}


export default db;

export interface CandidateDbRecord {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    situation?: string;
    avatar_configured: number;
    avatar_name?: string;
    avatar_image_url?: string;
    voice_configured: number;
    voice_id?: string;
    voice_sample_url?: string;
    llm_local_model: string;
    llm_cloud_provider: string;
    llm_cloud_model: string;
    llm_preferred_mode: 'LOCAL' | 'CLOUD';
    is_demo: number;
    created_at: string;
    updated_at: string;
}

export interface RagFileDbRecord {
    id: number;
    candidate_id: string;
    filename: string;
    file_type?: string;
    content?: string;
    created_at: string;
}
