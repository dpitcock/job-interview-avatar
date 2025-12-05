# Phase 3: Voice Pipeline

## Overview

Voice cloning and synthesis for natural-sounding interview responses.

## Providers

| Provider | Mode | Latency | Features |
|----------|------|---------|----------|
| ElevenLabs | CLOUD | <500ms | Voice cloning, streaming, emotions |
| OpenVoice | LOCAL | ~1s | Free, emotion control, runs on M4 |

## Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  30s Voice  │ ──→ │   Cloning   │ ──→ │ Voice Model │
│   Sample    │     │   Process   │     │   (ID)      │
└─────────────┘     └─────────────┘     └─────────────┘
                           ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  LLM Text   │ ──→ │   Synth     │ ──→ │   Audio     │
│  Response   │     │   Engine    │     │   Stream    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## TODO

- [ ] Implement ElevenLabs voice cloning API
- [ ] Set up OpenVoice Python server
- [ ] Add audio streaming to frontend
- [ ] Implement voice sample validation
- [ ] Add emotion control (neutral, confident, friendly)

## Setup

### ElevenLabs (Cloud)
```env
ELEVENLABS_API_KEY=your_key_here
```

### OpenVoice (Local)
```bash
# Clone OpenVoice repo
git clone https://github.com/myshell-ai/OpenVoice.git

# Install dependencies
pip install -e .

# Start server (will add script)
python server.py --port 8001
```

## API

```typescript
// Clone voice
const profile = await cloneVoice(audioBlob);

// Synthesize speech
const audio = await synthesizeSpeech(text, {
  voiceId: profile.id,
  emotion: 'confident',
  speed: 1.0
});
```
