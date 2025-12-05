# Phase 3 Complete: Voice Synthesis

## What's New

### Voice API Routes
- `/api/voice/synthesize` - Generate speech from text (returns audio file)
- `/api/voice/stream` - Stream speech synthesis for lower latency
- `/api/voice/list` - List available ElevenLabs voices

### Practice Mode Updates
- **Speak Response** button - Converts AI text to speech
- **Auto-Speak** toggle - Automatically speaks responses after generation
- Audio playback controls (play/stop)
- Loading states for audio synthesis

### Audio Player Hook
- `useAudioPlayer` - React hook for audio playback
- Supports both Blob and URL audio sources
- Web Audio API integration

## Testing Voice Synthesis

### Prerequisites
You need an ElevenLabs API key in `.env.local`:
```bash
ELEVENLABS_API_KEY=your_key_here
```

### Test in Practice Mode

1. **Start the dev server** (if not running):
   ```bash
   cd ~/Code/job-interview-avatar
   npm run dev
   ```

2. **Open Practice Mode**:
   - Go to `http://localhost:3001/practice`
   - Select any question
   - Click "Generate AI Response"
   - Wait for the text response to complete

3. **Test Voice Synthesis**:
   - Click "Speak Response" button
   - Audio should load and play automatically
   - Click "Stop Speaking" to interrupt

4. **Test Auto-Speak**:
   - Toggle "Auto-Speak On" in the header
   - Generate a new response
   - Audio should play automatically when text generation completes

### Test via API

```bash
# Synthesize speech
curl -X POST http://localhost:3001/api/voice/synthesize \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test of voice synthesis."}' \
  --output test.mp3

# Play the audio
open test.mp3  # macOS
# or
mpv test.mp3  # Linux with mpv installed
```

### List Available Voices

```bash
curl http://localhost:3001/api/voice/list | jq
```

Expected response:
```json
{
  "voices": [
    {
      "id": "EXAVITQu4vr4xnSDxMaL",
      "name": "Sarah (Default)",
      "category": "premade"
    },
    // ... more voices
  ],
  "hasApiKey": true
}
```

## Performance

Target latencies:
- **Synthesis**: <2s for ~100 words
- **Streaming**: First audio chunk <500ms
- **Total (Text + Voice)**: <5s for complete response

## Troubleshooting

### "ELEVENLABS_API_KEY not configured"
Add your API key to `.env.local` and restart the dev server.

### Audio doesn't play
- Check browser console for errors
- Ensure you're using HTTPS or localhost (required for Web Audio API)
- Try clicking the page first (browsers require user interaction for audio)

### Synthesis is slow
- Use `/api/voice/stream` instead of `/api/voice/synthesize`
- Consider shorter responses
- Check your ElevenLabs quota

## Next Steps

Phase 4 will add:
- Video avatar generation with HeyGen/LivePortrait
- Lip-sync between audio and video
- Combined text + voice + video pipeline
