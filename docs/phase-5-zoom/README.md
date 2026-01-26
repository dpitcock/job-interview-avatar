# Phase 5: OBS & Zoom Integration

## Overview

Phase 5 connects Twinterview Agent to Zoom using OBS Studio as a virtual camera.

## What's Included

### OBS WebSocket Integration
- Programmatic control of OBS
- Auto-start virtual camera
- Scene switching
- Recording control

### Audio Routing
- BlackHole (macOS) for virtual audio device
- Route AI voice to Zoom microphone input
- Maintain ability to hear interviewer

### Setup Guides
- [OBS Setup](./obs-setup.md) - Configure OBS virtual camera
- [Audio Setup](./audio-setup.md) - Route audio to Zoom

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Twinterview Agent                          │
│  http://localhost:3001/live                                 │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐                │
│  │   LLM    │──→│  Voice   │──→│  Avatar  │                │
│  │ Response │   │ Synthesis│   │  Video   │                │
│  └──────────┘   └──────────┘   └──────────┘                │
│                       │              │                       │
└───────────────────────┼──────────────┼───────────────────────┘
                        │              │
                   Audio Out      Video Out
                        │              │
                        ↓              ↓
                ┌────────────────────────────┐
                │       OBS Studio           │
                │                            │
                │  Browser Source (Video)    │
                │  + BlackHole (Audio)       │
                │                            │
                │  → Virtual Camera          │
                └────────────────────────────┘
                        │
                        ↓
                ┌────────────────────────────┐
                │       Zoom Meeting         │
                │                            │
                │  Camera: OBS Virtual Cam   │
                │  Mic: BlackHole 2ch        │
                └────────────────────────────┘
```

## Quick Start

### 1. Install OBS
```bash
brew install --cask obs
```

### 2. Enable OBS WebSocket
- Open OBS → Tools → WebSocket Server Settings
- Enable WebSocket server
- Port: 4455
- Optional: Set password

### 3. Add Browser Source
- In OBS, add Browser source
- URL: `http://localhost:3001/live?obs=true`
- Size: 1920x1080
- FPS: 30

### 4. Start Virtual Camera
- Click "Start Virtual Camera" in OBS

### 5. Configure Zoom
- Zoom → Settings → Video
- Camera: "OBS Virtual Camera"

### 6. Set Up Audio (macOS)
```bash
brew install blackhole-2ch
```
Then follow [Audio Setup Guide](./audio-setup.md)

## OBS WebSocket Control

Add to `.env.local`:
```bash
NEXT_PUBLIC_OBS_WEBSOCKET_URL=ws://localhost:4455
NEXT_PUBLIC_OBS_WEBSOCKET_PASSWORD=your_password
```

### Features
- Auto-start virtual camera when interview starts
- Switch scenes programmatically
- Start/stop recording
- Monitor connection status

## Testing the Full Pipeline

### Test 1: Video Only
1. Start OBS with browser source
2. Start virtual camera
3. Open Zoom
4. Select "OBS Virtual Camera"
5. You should see the avatar in Zoom

### Test 2: Audio Only
1. Set up BlackHole
2. Configure system audio output
3. Play audio in browser
4. Join Zoom meeting
5. Participants should hear the audio

### Test 3: Full Pipeline
1. Start Twinterview Agent at `/live`
2. Start OBS virtual camera
3. Join Zoom meeting
4. Generate a response
5. Avatar should speak in Zoom with lip-sync

## Performance Optimization

### OBS Settings
- **Encoder**: Hardware (Apple VT H264 / NVENC)
- **Canvas Resolution**: 1280x720 (lower for better performance)
- **FPS**: 25-30
- **Bitrate**: 2500 Kbps

### Browser Source
- **Resolution**: Match OBS canvas
- **FPS**: 25-30
- **Hardware Acceleration**: Enabled in Chrome

### System
- Close unnecessary applications
- Use wired internet connection
- Monitor CPU usage in OBS Stats

## Troubleshooting

### Video Issues
- **Black screen in OBS**: Check browser source URL, refresh source
- **Laggy video**: Lower resolution/FPS, close other apps
- **Not showing in Zoom**: Restart OBS virtual camera, restart Zoom

### Audio Issues
- **No audio in Zoom**: Check BlackHole is selected as Zoom mic
- **Can't hear AI**: Ensure Multi-Output includes your speakers
- **Echo/feedback**: Use headphones or mute mic when AI speaks

### OBS WebSocket
- **Can't connect**: Verify OBS is running, WebSocket enabled
- **Connection refused**: Check port 4455 is not blocked
- **Authentication failed**: Verify password in `.env.local`

## Advanced Features

### Auto-Start Virtual Camera
```typescript
import { useOBS } from '@/hooks/useOBS';

const { connect, startVirtualCamera } = useOBS();

// On interview start
await connect();
await startVirtualCamera();
```

### Scene Switching
```typescript
const { setScene } = useOBS();

// Switch to avatar scene
await setScene('Twinterview Agent');

// Switch to screen share
await setScene('ScreenShare');
```

### Recording
```typescript
const { startRecording, stopRecording } = useOBS();

// Record the interview
await startRecording();
// ... interview happens ...
await stopRecording();
```

## Next Steps

**Phase 6: Polish & Deployment**
- Docker Compose for full stack
- Practice mode enhancements
- Performance monitoring
- Deployment guides
- Demo video

## Current Status

✅ **Phase 1**: Foundation (Next.js, UI, Config)
✅ **Phase 2**: Text Generation (LLM + RAG)
✅ **Phase 3**: Voice Synthesis (ElevenLabs)
✅ **Phase 4**: Video Avatar (HeyGen)
✅ **Phase 5**: OBS Integration (Virtual Camera)
🚧 **Phase 6**: Polish & Deploy (Next)
