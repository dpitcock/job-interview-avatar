# Phase 4: Video/Face Animation

## Overview

Generate talking head videos from a single photo and audio input.

## Providers

| Provider | Mode | FPS | Quality |
|----------|------|-----|---------|
| HeyGen | CLOUD | 30 | Professional |
| LivePortrait | LOCAL | 25-30 | Good |

## Workflow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Face Photo │ ──→ │   Avatar    │ ──→ │ Avatar Model│
│  (512x512)  │     │  Generator  │     │    (ID)     │
└─────────────┘     └─────────────┘     └─────────────┘
                           ↓
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Audio     │ ──→ │  Lip Sync   │ ──→ │   Video     │
│   Stream    │     │   Engine    │     │   Stream    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## TODO

- [ ] Implement HeyGen Live Avatar API
- [ ] Set up LivePortrait Python server
- [ ] Add real-time video streaming
- [ ] Implement natural head movements
- [ ] Add blinking and micro-expressions

## Setup

### HeyGen (Cloud)
```env
HEYGEN_API_KEY=your_key_here
```

### LivePortrait (Local)
```bash
# Clone LivePortrait
git clone https://github.com/KwaiVGI/LivePortrait.git

# Install dependencies
pip install -r requirements.txt

# Download models
python download_models.py

# Start server (will add script)
python server.py --port 8002
```

## Requirements

- **Photo**: 512x512+, front-facing, neutral expression
- **Audio**: 16kHz+ sample rate, clear speech
- **Output**: 30fps video, 720p minimum
