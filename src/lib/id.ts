export const ID_ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz'; // Removed ambiguous characters like 0, 1, l, o, i

export function generateShortId(length = 8): string {
    let result = '';
    const alphabetLength = ID_ALPHABET.length;
    for (let i = 0; i < length; i++) {
        result += ID_ALPHABET.charAt(Math.floor(Math.random() * alphabetLength));
    }
    return result;
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-');   // Replace multiple - with single -
}
