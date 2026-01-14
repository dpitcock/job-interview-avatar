import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
    try {
        const rows = db.prepare('SELECT key, value FROM system_settings').all();
        const settings = rows.reduce((acc: any, row: any) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        return NextResponse.json({ settings });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { llm_mode, llm_local_model, llm_cloud_model } = body;

        const updateStmt = db.prepare('UPDATE system_settings SET value = ? WHERE key = ?');

        if (llm_mode) updateStmt.run(llm_mode, 'llm_mode');
        if (llm_local_model) updateStmt.run(llm_local_model, 'llm_local_model');
        if (llm_cloud_model) updateStmt.run(llm_cloud_model, 'llm_cloud_model');

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
