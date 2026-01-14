export const IS_VERCEL = process.env.VERCEL === '1' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV !== undefined ||
    process.env.NEXT_PUBLIC_VERCEL === '1';

export const isReadOnly = IS_VERCEL;
