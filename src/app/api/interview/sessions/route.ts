import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const sessions = db.prepare(
            'SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC'
        ).all(userId);
        return NextResponse.json({ sessions });
    } catch (e) {
        console.error('Failed to fetch sessions:', e);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, title } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const sessionId = uuidv4();

        db.prepare(
            'INSERT INTO interview_sessions (id, user_id, title) VALUES (?, ?, ?)'
        ).run(sessionId, userId, title || `Interview Session ${new Date().toLocaleDateString()}`);

        const session = db.prepare('SELECT * FROM interview_sessions WHERE id = ?').get(sessionId);
        return NextResponse.json({ session });
    } catch (e) {
        console.error('Failed to create session:', e);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
}
