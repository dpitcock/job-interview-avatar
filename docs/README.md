# 📚 Twinterview Agent Documentation

Welcome to the Twinterview Agent documentation. This directory contains detailed guides for each phase of the project.

## Documentation Structure

| Phase | Description | Status |
|-------|-------------|--------|
| [Phase 1: Foundation](./phase-1-foundation/) | Project setup, config, and UI | ✅ Complete |
| [Phase 2: Text Generation](./phase-2-text-generation/) | LLM + RAG pipeline | 🚧 In Progress |
| [Phase 3: Voice Pipeline](./phase-3-voice/) | Voice cloning & synthesis | ⏳ Planned |
| [Phase 4: Video Animation](./phase-4-video/) | Face avatar generation | ⏳ Planned |
| [Phase 5: Zoom Integration](./phase-5-zoom/) | Virtual camera & audio | ⏳ Planned |
| [Phase 6: Dashboard](./phase-6-dashboard/) | Polish & deployment | ⏳ Planned |

## Quick Links

- [Main README](../README.md) - Project overview and quickstart
- [Testing Guide](./testing.md) - How to test each component
- [Sample Answers](./sample-answers.md) - Example RAG documents
- [Configuration Guide](./configuration.md) - Environment setup
- [API Reference](./api-reference.md) - REST API documentation
- [Contributing](./contributing.md) - How to contribute

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Dashboard                             │
│  (Next.js 16 + TypeScript + Tailwind)                       │
├─────────────────────────────────────────────────────────────┤
│                      Mode Switcher                          │
│                   LOCAL ←────→ CLOUD                        │
├──────────────┬──────────────┬──────────────┬───────────────┤
│     LLM      │    Voice     │    Video     │     RAG       │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ Ollama       │ OpenVoice    │ LivePortrait │ ChromaDB      │
│ DeepSeek R1  │              │              │ (local)       │
├──────────────┼──────────────┼──────────────┼───────────────┤
│ Claude 3.5   │ ElevenLabs   │ HeyGen       │ Pinecone      │
│ GPT-4o       │              │              │ (cloud)       │
└──────────────┴──────────────┴──────────────┴───────────────┘
```
