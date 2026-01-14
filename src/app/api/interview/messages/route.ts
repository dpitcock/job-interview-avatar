import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
        return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    try {
        const messages = db.prepare(
            'SELECT * FROM interview_messages WHERE session_id = ? ORDER BY created_at ASC'
        ).all(sessionId);
        return NextResponse.json({ messages });
    } catch (e) {
        console.error('Failed to fetch messages:', e);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { sessionId, role, content } = await req.json();

        if (!sessionId || !role || !content) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        db.prepare(
            'INSERT INTO interview_messages (session_id, role, content) VALUES (?, ?, ?)'
        ).run(sessionId, role, content);

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Failed to save message:', e);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
