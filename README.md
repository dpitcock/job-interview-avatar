# InterviewAvatar

An open-source AI-powered interview agent that acts as your digital clone for Zoom job interviews. Uses your voice, face, and expertise to answer questions in real-time.

![InterviewAvatar Demo](docs/demo.gif)

## Features

- 🧠 **Multi-LLM Support**: Ollama (local), OpenAI, Claude
- 📚 **RAG Pipeline**: Upload your resume/experience for context-aware answers
- 🎤 **Voice Cloning**: ElevenLabs integration for natural speech
- 👤 **Live Avatar**: HeyGen streaming for real-time video
- 🎥 **Zoom Integration**: OBS virtual camera + audio routing
- ⚡ **Real-time**: <5s end-to-end latency (question → video response)

## Quick Start

### Prerequisites
- Node.js 18+
- (Optional) Ollama for local LLM
- (Optional) OBS Studio for Zoom integration

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/interview-avatar.git
cd interview-avatar

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Access at http://localhost:3000
```

## Usage

### 1. Configure LLM
- Go to Settings → Select your LLM provider
- **Local**: Install Ollama + DeepSeek R1
- **Cloud**: Add OpenAI or Anthropic API key

### 2. Upload Your Experience
- Go to Setup → RAG
- Upload resume, past interview answers, project descriptions
- System will use this context for answers

### 3. Practice Mode
- Go to Practice
- Select a question
- Generate AI response
- Click "Speak Response" to hear it

### 4. Live Interview Mode
- Go to Live
- Start avatar session
- Type or generate responses
- Avatar speaks with lip-sync

### 5. Zoom Integration
- Install OBS Studio
- Follow [OBS Setup Guide](docs/obs-setup.md)
- Configure audio routing (see [Audio Setup](docs/audio-setup.md))
- Use OBS Virtual Camera in Zoom

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Question                            │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  LLM (Ollama/OpenAI/Claude) + RAG                           │
│  → Generates contextual answer                              │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  Voice Synthesis (ElevenLabs)                               │
│  → Converts text to speech                                  │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  Video Avatar (HeyGen Streaming)                            │
│  → Lip-synced video via WebRTC                              │
└─────────────────────┬───────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────────────────┐
│  OBS Virtual Camera → Zoom                                  │
│  → Appears as your camera in meetings                       │
└─────────────────────────────────────────────────────────────┘
```

## Documentation

- [Testing Guide](docs/testing.md) - How to test each component
- [OBS Setup](docs/obs-setup.md) - Configure virtual camera
- [Audio Setup](docs/audio-setup.md) - Route audio to Zoom
- [Deployment](docs/deployment.md) - Production deployment
- [API Reference](docs/api-reference.md) - REST API documentation
- [Configuration](docs/configuration.md) - Environment variables

## Tech Stack

- **Frontend**: Next.js 16, TypeScript, Tailwind CSS
- **LLM**: Ollama (DeepSeek R1), OpenAI, Anthropic
- **Voice**: ElevenLabs
- **Video**: HeyGen Streaming API
- **RAG**: In-memory (ChromaDB planned)
- **Integration**: OBS WebSocket, BlackHole (audio)

## Performance

Target latencies:
- LLM Response: <3s
- Voice Synthesis: <2s
- Video Streaming: <1s
- **Total**: <5s (question → video)

## Roadmap

- [x] Phase 1: Foundation (Next.js, UI, Config)
- [x] Phase 2: Text Generation (LLM + RAG)
- [x] Phase 3: Voice Synthesis
- [x] Phase 4: Video Avatar
- [x] Phase 5: OBS Integration
- [x] Phase 6: Deployment & Polish
- [ ] ChromaDB integration
- [ ] Local voice (OpenVoice)
- [ ] Local video (LivePortrait)
- [ ] Real-time transcription (Whisper)
- [ ] Session recording & playback
- [ ] Performance analytics

## Contributing

Contributions welcome! See [CONTRIBUTING.md](docs/contributing.md)

## License

MIT License - see [LICENSE](LICENSE)

## Disclaimer

This tool is for educational and practice purposes. Always disclose the use of AI assistance in actual job interviews where required by the employer.

## Support

- 📧 Email: your@email.com
- 💬 Discord: [Join our community](https://discord.gg/yourlink)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/interview-avatar/issues)

## Acknowledgments

- [HeyGen](https://heygen.com) - Streaming avatar API
- [ElevenLabs](https://elevenlabs.io) - Voice synthesis
- [Ollama](https://ollama.ai) - Local LLM runtime
- [OBS Studio](https://obsproject.com) - Virtual camera

---

**Star ⭐ this repo if you find it useful!**
