import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { indexDocuments } from '@/lib/rag';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const sessionId = body.sessionId;
        const candidateId = body.candidateId || body.userId;

        if (!sessionId || !candidateId) {
            return NextResponse.json({ error: 'Session ID and Candidate ID are required' }, { status: 400 });
        }

        // 1. Fetch session and its messages
        const session = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(sessionId);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        const messages = db.prepare(
            'SELECT * FROM interview_messages WHERE session_id = ? ORDER BY created_at ASC'
        ).all(sessionId);

        if (messages.length === 0) {
            return NextResponse.json({ error: 'No messages to index' }, { status: 400 });
        }

        // 2. Format transcript
        const date = new Date(session.created_at).toLocaleDateString();
        const title = session.title || `Interview Transcript - ${date}`;
        const filename = `${title.replace(/\s+/g, '_')}.md`;

        let transcript = `# ${title}\n\n`;
        messages.forEach((msg: any) => {
            const roleName = msg.role === 'user' ? 'Interviewer' : 'Candidate';
            transcript += `**${roleName}**: ${msg.content}\n\n`;
        });

        // 3. Save to database rag_files table
        db.prepare(
            'INSERT INTO rag_files (candidate_id, filename, file_type, content) VALUES (?, ?, ?, ?)'
        ).run(candidateId, filename, 'markdown', transcript);

        // 4. Index to Vector Store (RAG)
        // Note: indexDocuments expects Array<{content, metadata}>
        await indexDocuments(
            [{ content: transcript, metadata: { type: 'general', title } }],
            candidateId,
            filename
        );

        // 5. Update session status
        db.prepare('UPDATE interview_sessions SET status = ? WHERE id = ?').run('promoted', sessionId);

        return NextResponse.json({ success: true, filename });
    } catch (e) {
        console.error('Failed to promote session to context:', e);
        return NextResponse.json({ error: 'Promotion failed' }, { status: 500 });
    }
}
