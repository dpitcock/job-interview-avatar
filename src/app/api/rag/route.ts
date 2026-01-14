import { NextRequest, NextResponse } from 'next/server';
import { addDocument, indexDocuments, queryDocuments, getDocumentCount, clearDocuments, parseBehavioralAnswers } from '@/lib/rag';
import { extractTextFromFile } from '@/lib/rag/parser';
import db from '@/lib/db';

// GET - Query documents or get status
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') as 'behavioral' | 'technical' | 'project' | 'general' | null;
    const userId = searchParams.get('userId') || undefined;

    if (query) {
        const documents = await queryDocuments(query, {
            topK: parseInt(searchParams.get('topK') || '5'),
            type: type || undefined,
            userId,
        });
        return NextResponse.json({ documents, count: documents.length });
    }

    // Return status for specific user
    const files = userId
        ? (db.prepare('SELECT filename, created_at FROM rag_files WHERE user_id = ?').all(userId) || [])
        : [];

    const count = userId ? files.length : getDocumentCount();

    return NextResponse.json({
        count,
        files: files.map((f: any) => ({
            id: f.filename, // Using filename as ID for simplicity in list
            title: f.filename,
            createdAt: f.created_at
        }))
    });
}

// POST - Add documents
export async function POST(request: NextRequest) {
    try {
        const contentType = request.headers.get('content-type');

        if (contentType?.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            const userId = formData.get('userId') as string | null;

            if (!file) {
                return NextResponse.json(
                    { error: 'No file provided' },
                    { status: 400 }
                );
            }

            const text = await extractTextFromFile(file);
            const documents = parseBehavioralAnswers(text);
            const ids = await indexDocuments(documents, userId || undefined, file.name);

            // Record file metadata in DB
            if (userId) {
                // Check if already exists to avoid duplicates in DB
                const existing = db.prepare('SELECT id FROM rag_files WHERE user_id = ? AND filename = ?').get(userId, file.name);
                if (!existing) {
                    db.prepare(`
                        INSERT INTO rag_files (user_id, filename, file_type, content)
                        VALUES (?, ?, ?, ?)
                    `).run(userId, file.name, file.type, text);
                } else {
                    // Update content if it re-uploaded
                    db.prepare('UPDATE rag_files SET content = ? WHERE id = ?').run(text, existing.id);
                }
            }

            return NextResponse.json({
                success: true,
                count: ids.length,
                ids,
                filename: file.name
            });
        } else {
            // Handle JSON body
            const body = await request.json();
            const userId = body.userId as string | undefined;

            if (Array.isArray(body.documents)) {
                const ids = await indexDocuments(body.documents, userId, body.source);
                return NextResponse.json({
                    success: true,
                    count: ids.length,
                    ids,
                });
            } else if (body.content) {
                const id = await addDocument(body.content, body.metadata || { type: 'general' }, userId);
                return NextResponse.json({
                    success: true,
                    id,
                });
            } else {
                return NextResponse.json(
                    { error: 'Invalid request body' },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        console.error('RAG add error:', error);
        return NextResponse.json(
            { error: 'Failed to add documents' },
            { status: 500 }
        );
    }
}

// DELETE - Clear documents for a user
export async function DELETE(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const filename = searchParams.get('filename');

    if (!userId) {
        return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    if (filename) {
        // Delete specific file
        const { deleteBySource } = await import('@/lib/rag');
        deleteBySource(filename, userId);

        db.prepare('DELETE FROM rag_files WHERE user_id = ? AND filename = ?').run(userId, filename);
        return NextResponse.json({ success: true, message: `Deleted ${filename}` });
    } else {
        // Clear all for user
        clearDocuments(userId);
        db.prepare('DELETE FROM rag_files WHERE user_id = ?').run(userId);
        return NextResponse.json({ success: true, message: 'Cleared all documents' });
    }
}
