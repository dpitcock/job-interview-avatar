# Configuration Guide

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

## Mode Selection

```env
# LOCAL = Uses Ollama, OpenVoice, LivePortrait (free, private)
# CLOUD = Uses Claude, ElevenLabs, HeyGen (API costs)
INTERVIEW_MODE=LOCAL
```

## API Keys

### Required for CLOUD Mode

| Service | Variable | Get Key |
|---------|----------|---------|
| Anthropic | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| ElevenLabs | `ELEVENLABS_API_KEY` | [elevenlabs.io](https://elevenlabs.io) |
| HeyGen | `HEYGEN_API_KEY` | [heygen.com](https://heygen.com) |
| Deepgram | `DEEPGRAM_API_KEY` | [deepgram.com](https://deepgram.com) |

### Local Mode Configuration

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:latest
CHROMA_DB_PATH=./data/chroma
```

## Full Example

```env
# Mode
INTERVIEW_MODE=LOCAL

# Cloud LLM (fallback)
ANTHROPIC_API_KEY=sk-ant-api03-xxxx
OPENAI_API_KEY=sk-xxxx

# Voice
ELEVENLABS_API_KEY=xxxx

# Video
HEYGEN_API_KEY=xxxx

# Transcription
DEEPGRAM_API_KEY=xxxx

# Local
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:latest
CHROMA_DB_PATH=./data/chroma
```
