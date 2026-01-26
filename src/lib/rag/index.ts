import type { RAGDocument } from '@/types';

/**
 * Enhanced RAG Pipeline with improved matching and user isolation
 */

interface DocumentMetadata {
    type: 'behavioral' | 'technical' | 'project' | 'general';
    title?: string;
    tags?: string[];
    source?: string;
    addedAt?: string;
}

interface StoredDocument {
    id: string;
    content: string;
    metadata: DocumentMetadata;
    tokens: string[]; // Tokenized for better matching
}

// Default user ID for backward compatibility
const DEFAULT_USER_ID = '__global__';

// In-memory store: Map<candidateId, Map<docId, StoredDocument>>
const candidateDocumentStores: Map<string, Map<string, StoredDocument>> = new Map();

/**
 * Get or create document store for a candidate
 */
function getCandidateStore(candidateId?: string): Map<string, StoredDocument> {
    const cid = candidateId || DEFAULT_USER_ID;
    if (!candidateDocumentStores.has(cid)) {
        candidateDocumentStores.set(cid, new Map());
    }
    return candidateDocumentStores.get(cid)!;
}

// Common stop words to ignore
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on', 'with',
    'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after',
    'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'just', 'i', 'me', 'my', 'myself', 'we', 'our',
    'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them',
    'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am',
]);

/**
 * Tokenize text into meaningful terms
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

/**
 * Calculate TF-IDF-like score for a document against a query
 */
function calculateScore(queryTokens: string[], doc: StoredDocument): number {
    const docTokens = new Set(doc.tokens);
    let score = 0;

    for (const token of queryTokens) {
        if (docTokens.has(token)) {
            // Base match
            score += 1;

            // Boost for title matches
            if (doc.metadata.title?.toLowerCase().includes(token)) {
                score += 2;
            }

            // Boost for tag matches
            if (doc.metadata.tags?.some(tag => tag.toLowerCase().includes(token))) {
                score += 1.5;
            }
        }

        // Partial match (prefix)
        for (const docToken of doc.tokens) {
            if (docToken.startsWith(token) || token.startsWith(docToken)) {
                score += 0.5;
            }
        }
    }

    // Normalize by document length (prefer concise, relevant docs)
    const lengthPenalty = Math.log(doc.tokens.length + 10) / 10;

    return score / lengthPenalty;
}

/**
 * Add a document to the store for a specific user
 */
export async function addDocument(
    content: string,
    metadata: DocumentMetadata,
    candidateId?: string
): Promise<string> {
    const id = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const store = getCandidateStore(candidateId);

    store.set(id, {
        id,
        content,
        metadata: {
            ...metadata,
            addedAt: new Date().toISOString(),
        },
        tokens: tokenize(content),
    });

    return id;
}

/**
 * Add multiple documents for a specific user
 */
export async function indexDocuments(
    documents: Array<{ content: string; metadata: DocumentMetadata }>,
    candidateId?: string,
    source?: string
): Promise<string[]> {
    const ids: string[] = [];

    // If source provided, clear previous documents from this source to avoid duplicates
    if (source) {
        deleteBySource(source, candidateId);
    }

    for (const doc of documents) {
        const id = await addDocument(
            doc.content,
            { ...doc.metadata, source: source || doc.metadata.source },
            candidateId
        );
        ids.push(id);
    }

    return ids;
}

/**
 * Query documents with improved matching for a specific user
 */
export async function queryDocuments(
    query: string,
    options?: {
        topK?: number;
        type?: DocumentMetadata['type'];
        minScore?: number;
        candidateId?: string;
    }
): Promise<RAGDocument[]> {
    const { topK = 5, type, minScore = 0.5, candidateId } = options || {};
    const store = getCandidateStore(candidateId);

    // If store is empty, try to rebuild from DB
    if (store.size === 0 && candidateId && candidateId !== DEFAULT_USER_ID) {
        await rebuildIndexFromDb(candidateId);
    }

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) return [];

    const results: Array<{ doc: StoredDocument; score: number }> = [];

    for (const doc of store.values()) {
        // Filter by type if specified
        if (type && doc.metadata.type !== type) continue;

        const score = calculateScore(queryTokens, doc);

        if (score >= minScore) {
            results.push({ doc, score });
        }
    }

    // Sort by score and return top K
    return results
        .sort((a, b) => b.score - a.score)
        .slice(0, topK)
        .map(({ doc, score }) => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata as unknown as Record<string, unknown>,
            score,
        }));
}

/**
 * Get a document by ID for a specific user
 */
export function getDocument(id: string, candidateId?: string): StoredDocument | undefined {
    const store = getCandidateStore(candidateId);
    return store.get(id);
}

/**
 * Delete a document for a specific candidate
 */
export function deleteDocument(id: string, candidateId?: string): boolean {
    const store = getCandidateStore(candidateId);
    return store.delete(id);
}

/**
 * Delete all documents associated with a source (filename)
 */
export function deleteBySource(source: string, candidateId?: string): number {
    const store = getCandidateStore(candidateId);
    let deletedCount = 0;

    for (const [id, doc] of store.entries()) {
        if (doc.metadata.source === source) {
            store.delete(id);
            deletedCount++;
        }
    }

    return deletedCount;
}

/**
 * Parse behavioral answers from text
 */
export function parseBehavioralAnswers(
    text: string
): Array<{ content: string; metadata: DocumentMetadata }> {
    // Split by common patterns
    const patterns = [
        /^#{1,3}\s+/gm,           // Markdown headers
        /^Q:\s*/gim,              // Q: prefix
        /^Question:\s*/gim,       // Question: prefix
        /^---+\s*$/gm,            // Horizontal rules
        /^\d+\.\s+/gm,            // Numbered lists
    ];

    let sections = [text];
    for (const pattern of patterns) {
        sections = sections.flatMap(s => s.split(pattern));
    }

    return sections
        .map(section => section.trim())
        .filter(section => section.length > 50) // Minimum meaningful content
        .map(section => {
            // Try to extract a title from the first line
            const lines = section.split('\n');
            const title = lines[0].slice(0, 100);

            // Detect type based on content
            const lowerContent = section.toLowerCase();
            let type: DocumentMetadata['type'] = 'general';

            if (
                lowerContent.includes('tell me about a time') ||
                lowerContent.includes('describe a situation') ||
                lowerContent.includes('star') ||
                lowerContent.includes('challenge')
            ) {
                type = 'behavioral';
            } else if (
                lowerContent.includes('react') ||
                lowerContent.includes('typescript') ||
                lowerContent.includes('javascript') ||
                lowerContent.includes('api') ||
                lowerContent.includes('database')
            ) {
                type = 'technical';
            } else if (lowerContent.includes('project')) {
                type = 'project';
            }

            return {
                content: section,
                metadata: { type, title },
            };
        });
}

/**
 * Get document count for a specific user
 */
export function getDocumentCount(candidateId?: string): number {
    const store = getCandidateStore(candidateId);
    return store.size;
}

/**
 * Get all documents for a specific candidate
 */
export function getAllDocuments(candidateId?: string): StoredDocument[] {
    const store = getCandidateStore(candidateId);
    return Array.from(store.values());
}

/**
 * Clear all documents for a specific candidate
 */
export function clearDocuments(candidateId?: string): void {
    const store = getCandidateStore(candidateId);
    store.clear();
}

/**
 * Search by metadata for a specific candidate
 */
export function searchByType(type: DocumentMetadata['type'], candidateId?: string): RAGDocument[] {
    const store = getCandidateStore(candidateId);
    return Array.from(store.values())
        .filter(doc => doc.metadata.type === type)
        .map(doc => ({
            id: doc.id,
            content: doc.content,
            metadata: doc.metadata as unknown as Record<string, unknown>,
        }));
}

/**
 * Rebuild the in-memory index from the database for a specific candidate
 */
export async function rebuildIndexFromDb(candidateId: string): Promise<void> {
    const { default: db } = await import('@/lib/db');

    // Get all files for this candidate from DB
    const files = db.prepare('SELECT filename, content, file_type FROM rag_files WHERE candidate_id = ?').all(candidateId) || [];

    // Clear current in-memory store for this candidate to avoid duplicates
    clearDocuments(candidateId);

    for (const file of files) {
        if (!file.content) continue;

        const documents = parseBehavioralAnswers(file.content);
        await indexDocuments(documents, candidateId, file.filename);
    }
}

// Export for backward compatibility (uses default candidate)
export { candidateDocumentStores as documentStore };
