// LLM Types
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    latencyMs: number;
}

export interface RAGContext {
    documents: RAGDocument[];
    query: string;
}

export interface RAGDocument {
    id: string;
    content: string;
    metadata: Record<string, unknown>;
    score?: number;
}

// Voice Types
export interface VoiceProfile {
    id: string;
    name: string;
    sampleUrl?: string;
    createdAt: Date;
}

export interface VoiceSynthesisOptions {
    voiceId: string;
    speed?: number;
    pitch?: number;
    emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised';
}

// Video Types
export interface AvatarProfile {
    id: string;
    name: string;
    imageUrl: string;
    createdAt: Date;
}

export interface VideoGenerationOptions {
    avatarId: string;
    audio: Blob | ArrayBuffer;
    quality?: 'low' | 'medium' | 'high';
}

// Interview Types
export interface InterviewSession {
    id: string;
    status: 'idle' | 'preparing' | 'active' | 'paused' | 'ended';
    startedAt?: Date;
    endedAt?: Date;
    transcripts: TranscriptEntry[];
    responses: InterviewResponse[];
}

export interface TranscriptEntry {
    id: string;
    speaker: 'interviewer' | 'candidate';
    text: string;
    timestamp: Date;
    confidence?: number;
}

export interface InterviewResponse {
    id: string;
    questionId: string;
    question: string;
    answer: string;
    audioUrl?: string;
    videoUrl?: string;
    latency: ResponseLatency;
    timestamp: Date;
}

export interface ResponseLatency {
    transcription: number;
    rag: number;
    llm: number;
    voice: number;
    video: number;
    total: number;
}

// Dashboard Types
export interface DashboardState {
    mode: 'LOCAL' | 'CLOUD';
    session: InterviewSession | null;
    setupStatus: SetupStatus;
    latency: LatencyMetrics;
}

export interface SetupStatus {
    voice: { ready: boolean; profileId?: string };
    avatar: { ready: boolean; profileId?: string };
    rag: { ready: boolean; documentCount: number };
    llm: { ready: boolean; provider: string };
}

export interface LatencyMetrics {
    current: ResponseLatency | null;
    average: ResponseLatency | null;
    history: ResponseLatency[];
}

// Practice Mode Types
export interface PracticeQuestion {
    id: string;
    category: 'behavioral' | 'technical' | 'situational' | 'general';
    question: string;
    hints?: string[];
    expectedTopics?: string[];
}

export interface PracticeSession {
    id: string;
    questions: PracticeQuestion[];
    currentIndex: number;
    responses: PracticeResponse[];
    score?: number;
}

export interface PracticeResponse {
    questionId: string;
    answer: string;
    audioUrl?: string;
    feedback?: string;
    score?: number;
}
