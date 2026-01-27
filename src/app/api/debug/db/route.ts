
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const sql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='interview_sessions'").get();
        const fkList = db.prepare("PRAGMA foreign_key_list(interview_sessions)").all();
        return NextResponse.json({ sql, fkList });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
