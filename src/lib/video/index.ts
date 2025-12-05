import config from '@/lib/config';
import type { AvatarProfile, VideoGenerationOptions } from '@/types';

/**
 * Video Provider Interface
 */
export interface VideoProvider {
    generateVideo(options: VideoGenerationOptions): Promise<Blob>;
    createAvatar(image: Blob): Promise<AvatarProfile>;
    listAvatars(): Promise<AvatarProfile[]>;
}

/**
 * HeyGen Provider (Cloud)
 */
export class HeyGenProvider implements VideoProvider {
    private apiKey: string;
    private baseUrl = 'https://api.heygen.com';

    constructor(apiKey?: string) {
        this.apiKey = apiKey || config.video.cloud.apiKey || '';
    }

    async generateVideo(options: VideoGenerationOptions): Promise<Blob> {
        // HeyGen API requires uploading audio first, then generating video
        const audioBlob = options.audio instanceof Blob
            ? options.audio
            : new Blob([options.audio], { type: 'audio/mpeg' });

        // Upload audio
        const formData = new FormData();
        formData.append('file', audioBlob, 'audio.mp3');

        const uploadResponse = await fetch(`${this.baseUrl}/v1/audio/upload`, {
            method: 'POST',
            headers: { 'x-api-key': this.apiKey },
            body: formData,
        });

        if (!uploadResponse.ok) {
            throw new Error(`HeyGen upload error: ${uploadResponse.statusText}`);
        }

        const { audio_id } = await uploadResponse.json();

        // Generate video
        const videoResponse = await fetch(`${this.baseUrl}/v2/video/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
            },
            body: JSON.stringify({
                avatar_id: options.avatarId,
                audio_id,
                quality: options.quality || 'medium',
            }),
        });

        if (!videoResponse.ok) {
            throw new Error(`HeyGen generate error: ${videoResponse.statusText}`);
        }

        const { video_id } = await videoResponse.json();

        // Poll for completion and download
        return this.pollAndDownload(video_id);
    }

    private async pollAndDownload(videoId: string, maxAttempts = 60): Promise<Blob> {
        for (let i = 0; i < maxAttempts; i++) {
            const response = await fetch(`${this.baseUrl}/v1/video/${videoId}`, {
                headers: { 'x-api-key': this.apiKey },
            });

            const data = await response.json();

            if (data.status === 'completed' && data.video_url) {
                const videoResponse = await fetch(data.video_url);
                return videoResponse.blob();
            }

            if (data.status === 'failed') {
                throw new Error('HeyGen video generation failed');
            }

            // Wait 2 seconds before next poll
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        throw new Error('HeyGen video generation timed out');
    }

    async createAvatar(image: Blob): Promise<AvatarProfile> {
        const formData = new FormData();
        formData.append('file', image, 'avatar.jpg');

        const response = await fetch(`${this.baseUrl}/v1/avatar/upload`, {
            method: 'POST',
            headers: { 'x-api-key': this.apiKey },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HeyGen avatar error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            id: data.avatar_id,
            name: data.name || 'Custom Avatar',
            imageUrl: data.image_url,
            createdAt: new Date(),
        };
    }

    async listAvatars(): Promise<AvatarProfile[]> {
        const response = await fetch(`${this.baseUrl}/v1/avatars`, {
            headers: { 'x-api-key': this.apiKey },
        });

        if (!response.ok) {
            throw new Error(`HeyGen list error: ${response.statusText}`);
        }

        const data = await response.json();
        return (data.avatars || []).map((a: { avatar_id: string; name: string; image_url: string }) => ({
            id: a.avatar_id,
            name: a.name,
            imageUrl: a.image_url,
            createdAt: new Date(),
        }));
    }
}

/**
 * LivePortrait Provider (Local)
 * 
 * Note: LivePortrait requires a Python backend running locally.
 * This provider communicates with the local server.
 */
export class LivePortraitProvider implements VideoProvider {
    private baseUrl = 'http://localhost:8002';

    async generateVideo(options: VideoGenerationOptions): Promise<Blob> {
        const audioBlob = options.audio instanceof Blob
            ? options.audio
            : new Blob([options.audio], { type: 'audio/mpeg' });

        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.mp3');
        formData.append('avatar_id', options.avatarId);
        formData.append('quality', options.quality || 'medium');

        const response = await fetch(`${this.baseUrl}/generate`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`LivePortrait error: ${response.statusText}`);
        }

        return response.blob();
    }

    async createAvatar(image: Blob): Promise<AvatarProfile> {
        const formData = new FormData();
        formData.append('image', image, 'avatar.jpg');

        const response = await fetch(`${this.baseUrl}/avatar/create`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`LivePortrait avatar error: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            id: data.avatar_id,
            name: data.name || 'Local Avatar',
            imageUrl: data.image_url,
            createdAt: new Date(),
        };
    }

    async listAvatars(): Promise<AvatarProfile[]> {
        try {
            const response = await fetch(`${this.baseUrl}/avatars`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.avatars || [];
        } catch {
            return []; // Server not available
        }
    }
}

/**
 * Get the appropriate video provider based on config
 */
export function getVideoProvider(): VideoProvider {
    if (config.mode === 'LOCAL') {
        return new LivePortraitProvider();
    }
    return new HeyGenProvider();
}

/**
 * Generate a talking head video from audio and avatar
 */
export async function generateVideo(
    options: VideoGenerationOptions
): Promise<Blob> {
    const provider = getVideoProvider();
    return provider.generateVideo(options);
}

/**
 * Create an avatar from a face image
 */
export async function createAvatar(image: Blob): Promise<AvatarProfile> {
    const provider = getVideoProvider();
    return provider.createAvatar(image);
}
