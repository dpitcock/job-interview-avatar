export async function extractTextFromFile(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type;
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
        if (mimeType === 'application/pdf' || extension === 'pdf') {
            const pdf = require('pdf-parse');
            const data = await pdf(buffer);
            return data.text;
        }

        if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            extension === 'docx'
        ) {
            const mammoth = require('mammoth');
            const result = await mammoth.extractRawText({ buffer });
            return result.value;
        }

        // Default to text parsing for txt, md, etc.
        return await file.text();
    } catch (error) {
        console.error(`Error parsing file ${file.name}:`, error);
        // Fallback to text if possible, or throw
        try {
            return await file.text();
        } catch {
            throw new Error(`Failed to parse ${file.name} as ${extension || 'text'}`);
        }
    }
}
