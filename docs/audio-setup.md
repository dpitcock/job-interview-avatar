# Audio Routing Setup

Route AI-generated voice to Zoom while hearing the interviewer.

## macOS Setup (BlackHole)

### 1. Install BlackHole

```bash
brew install blackhole-2ch
```

Or download from: https://existential.audio/blackhole/

### 2. Create Multi-Output Device

1. Open **Audio MIDI Setup** (Cmd+Space → "Audio MIDI Setup")
2. Click **+** (bottom left) → **Create Multi-Output Device**
3. Name it "Twinterview Agent Output"
4. Check both:
   - ✅ **BlackHole 2ch**
   - ✅ **Your Speakers/Headphones** (so you can hear)
5. Close Audio MIDI Setup

### 3. Create Aggregate Device (for Input)

1. In **Audio MIDI Setup**, click **+** → **Create Aggregate Device**
2. Name it "Twinterview Agent Input"
3. Check both:
   - ✅ **BlackHole 2ch**
   - ✅ **Your Microphone** (if you want to speak too)
4. Close Audio MIDI Setup

### 4. Configure System Audio

1. Go to **System Settings** → **Sound**
2. **Output**: Select "Twinterview Agent Output"
3. **Input**: Select "Twinterview Agent Input" (or keep your mic)

### 5. Configure Zoom

1. Open Zoom → **Settings** → **Audio**
2. **Microphone**: Select "BlackHole 2ch"
3. **Speaker**: Select your actual speakers/headphones
4. **Automatically adjust microphone volume**: OFF
5. Test by playing audio - Zoom should pick it up

### 6. Test the Setup

1. Start Twinterview Agent at `http://localhost:3001/live`
2. Generate a response with voice
3. Join a Zoom meeting
4. The AI voice should be transmitted to Zoom participants

## Windows Setup (VB-Audio Cable)

### 1. Install VB-Audio Cable

Download from: https://vb-audio.com/Cable/

### 2. Configure Windows Sound

1. Right-click **Speaker icon** → **Sound settings**
2. **Output device**: Select "CABLE Input"
3. **Input device**: Keep your microphone

### 3. Configure Zoom

1. Open Zoom → **Settings** → **Audio**
2. **Microphone**: Select "CABLE Output"
3. **Speaker**: Select your actual speakers
4. Test audio

## Troubleshooting

### "I can't hear the AI voice"
- Ensure "Twinterview Agent Output" includes your speakers
- Check system volume is not muted
- Verify browser audio is playing (check browser tab icon)

### "Zoom participants can't hear the AI"
- Verify Zoom microphone is set to "BlackHole 2ch" (macOS) or "CABLE Output" (Windows)
- Check Zoom is not muted
- Test with "Test Speaker & Microphone" in Zoom settings

### "I hear echo/feedback"
- This is normal if you have speakers + mic in the same room
- Use headphones
- Or mute your mic when AI is speaking

### "Audio is choppy/laggy"
- Close other audio applications
- Increase buffer size in Audio MIDI Setup
- Check CPU usage

## Advanced: Loopback Audio (macOS)

For more control, use **Loopback** by Rogue Amoeba ($99):
- https://rogueamoeba.com/loopback/

Loopback provides a GUI for routing audio and is more reliable than BlackHole for complex setups.

## Testing Audio Pipeline

```bash
# Test 1: Generate voice in browser
# Go to http://localhost:3001/practice
# Generate a response with "Speak Response"
# You should hear it in your speakers

# Test 2: Check Zoom picks it up
# Join a Zoom meeting
# Speak or play audio
# Ask another participant if they can hear it

# Test 3: Full pipeline
# Go to http://localhost:3001/live
# Generate & speak a response
# Verify it appears in Zoom
```

## Next Steps

Once audio is working:
1. Test full pipeline: Question → LLM → Voice → Zoom
2. Practice with a friend on Zoom
3. Adjust volume levels for best quality
