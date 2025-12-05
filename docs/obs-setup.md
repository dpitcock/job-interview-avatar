# OBS Setup Guide for InterviewAvatar

This guide shows you how to set up OBS to route your AI avatar to Zoom.

## Prerequisites

- **OBS Studio** installed ([download here](https://obsproject.com/))
- **OBS WebSocket Plugin** (built-in for OBS 28+)
- InterviewAvatar running on `http://localhost:3001`

## Step 1: Install OBS

```bash
# macOS
brew install --cask obs

# Or download from https://obsproject.com/
```

## Step 2: Enable OBS WebSocket

1. Open OBS Studio
2. Go to **Tools** → **WebSocket Server Settings**
3. Check **"Enable WebSocket server"**
4. Set port to `4455` (default)
5. **Optional**: Set a password (add to `.env.local` as `OBS_WEBSOCKET_PASSWORD`)
6. Click **OK**

## Step 3: Create Avatar Scene

### Option A: Browser Source (Recommended)

1. In OBS, click **+** under **Sources**
2. Select **Browser**
3. Name it "InterviewAvatar"
4. Settings:
   - **URL**: `http://localhost:3001/live?obs=true`
   - **Width**: `1920`
   - **Height**: `1080`
   - **FPS**: `30`
   - Check **"Shutdown source when not visible"**: OFF
   - Check **"Refresh browser when scene becomes active"**: ON
5. Click **OK**

### Option B: Window Capture (Fallback)

1. Open `http://localhost:3001/live` in Chrome
2. Press **F11** for fullscreen
3. In OBS, add **Window Capture** source
4. Select your Chrome window

## Step 4: Configure Scene

1. **Resize** the browser source to fill the canvas
2. **Right-click** → **Transform** → **Fit to Screen**
3. **Optional**: Add background, overlays, or lower thirds

## Step 5: Start Virtual Camera

1. In OBS, click **Start Virtual Camera** (bottom right)
2. The virtual camera is now available as "OBS Virtual Camera"

## Step 6: Use in Zoom

1. Open Zoom
2. Go to **Settings** → **Video**
3. Select **Camera**: "OBS Virtual Camera"
4. Your AI avatar should now appear in Zoom!

## Advanced: Automated OBS Control

InterviewAvatar can control OBS automatically via WebSocket.

### Add to `.env.local`:
```bash
OBS_WEBSOCKET_URL=ws://localhost:4455
OBS_WEBSOCKET_PASSWORD=your_password_here  # Optional
```

### Features:
- Auto-start virtual camera when interview starts
- Switch scenes programmatically
- Toggle mute/unmute
- Start/stop recording

## Troubleshooting

### "OBS Virtual Camera not showing in Zoom"
- Ensure OBS Virtual Camera is started (green button in OBS)
- Restart Zoom
- On macOS: Grant camera permissions to OBS in System Settings

### "Browser source is black"
- Check the URL is correct: `http://localhost:3001/live?obs=true`
- Ensure dev server is running
- Try refreshing the browser source (right-click → Refresh)

### "Avatar video is laggy"
- Lower the browser source resolution (try 1280x720)
- Reduce FPS to 25
- Close other applications
- Check CPU usage in OBS Stats

### "Can't connect to OBS WebSocket"
- Verify OBS is running
- Check WebSocket is enabled in OBS settings
- Verify port 4455 is not blocked
- Check password matches `.env.local`

## Audio Routing

For audio, see [Audio Setup Guide](./audio-setup.md) which covers:
- BlackHole for macOS
- Virtual Audio Cable for Windows
- Routing AI voice to Zoom

## Performance Tips

1. **Use Hardware Encoding** (OBS Settings → Output → Encoder)
   - macOS: Apple VT H264 Hardware Encoder
   - Windows: NVENC (NVIDIA) or QuickSync (Intel)

2. **Lower Canvas Resolution**
   - OBS Settings → Video → Base Resolution: 1280x720

3. **Reduce Browser Source FPS**
   - 25 FPS is usually sufficient for interviews

4. **Close Unnecessary Scenes**
   - Only keep the avatar scene active

## Next Steps

Once OBS is set up:
1. Test the virtual camera in Zoom
2. Set up audio routing (see audio-setup.md)
3. Try a practice interview with the full pipeline
