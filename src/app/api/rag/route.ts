import { NextRequest, NextResponse } from 'next/server';
import { addDocument, indexDocuments, queryDocuments, getDocumentCount, clearDocuments, parseBehavioralAnswers } from '@/lib/rag';

// GET - Query documents or get status
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const type = searchParams.get('type') as 'behavioral' | 'technical' | 'project' | 'general' | null;

    if (query) {
        const documents = await queryDocuments(query, {
            topK: parseInt(searchParams.get('topK') || '5'),
            type: type || undefined,
        });
        return NextResponse.json({ documents, count: documents.length });
    }

    // Return status
    return NextResponse.json({
        count: getDocumentCount(),
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

            if (!file) {
                return NextResponse.json(
                    { error: 'No file provided' },
                    { status: 400 }
                );
            }

            const text = await file.text();
            const documents = parseBehavioralAnswers(text);
            const ids = await indexDocuments(documents);

            return NextResponse.json({
                success: true,
                count: ids.length,
                ids,
            });
        } else {
            // Handle JSON body
            const body = await request.json();

            if (Array.isArray(body.documents)) {
                const ids = await indexDocuments(body.documents);
                return NextResponse.json({
                    success: true,
                    count: ids.length,
                    ids,
                });
            } else if (body.content) {
                const id = await addDocument(body.content, body.metadata || { type: 'general' });
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

// DELETE - Clear all documents
export async function DELETE() {
    clearDocuments();
    return NextResponse.json({ success: true });
}
