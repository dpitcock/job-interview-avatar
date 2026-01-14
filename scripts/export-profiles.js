const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'interview.db');
const EXPORT_PATH = path.join(__dirname, '..', 'src', 'data', 'users-fallback.json');

function exportProfiles() {
    if (!fs.existsSync(DB_PATH)) {
        console.log('No database found at', DB_PATH, 'skipping export.');
        return;
    }

    const db = new Database(DB_PATH);
    const users = db.prepare('SELECT * FROM users').all();

    // Map to UserProfile format for consistency
    const formattedUsers = users.map((u) => {
        const files = db.prepare('SELECT filename, content, created_at FROM rag_files WHERE user_id = ?').all(u.id);

        return {
            id: u.id,
            name: u.name,
            email: u.email || undefined,
            phone: u.phone || undefined,
            avatar: {
                configured: !!u.avatar_configured,
                imageUrl: u.avatar_image_url || undefined,
                avatarName: u.avatar_name || undefined,
            },
            voice: {
                configured: !!u.voice_configured,
                voiceId: u.voice_id || undefined,
                sampleUrl: u.voice_sample_url || undefined,
            },
            llm: {
                localModel: u.llm_local_model,
                cloudProvider: u.llm_cloud_provider,
                cloudModel: u.llm_cloud_model,
            },
            files: files, // Include RAG file metadata
            createdAt: u.created_at,
            updatedAt: u.updated_at,
        };
    });

    const output = {
        users: formattedUsers,
        exportedAt: new Date().toISOString(),
    };

    const dir = path.dirname(EXPORT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(EXPORT_PATH, JSON.stringify(output, null, 2));
    console.log(`Successfully exported ${formattedUsers.length} profiles to ${EXPORT_PATH}`);
}

try {
    exportProfiles();
} catch (e) {
    console.error('Export failed:', e);
}
