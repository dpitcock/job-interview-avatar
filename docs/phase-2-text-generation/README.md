# Phase 2: Text Generation Layer

## Overview

This phase focuses on the LLM pipeline with RAG integration for intelligent interview responses.

## Components

### LLM Providers

| Provider | Mode | Model | Latency |
|----------|------|-------|---------|
| Ollama | LOCAL | DeepSeek R1 | ~2-3s |
| Anthropic | CLOUD | Claude 3.5 Sonnet | ~1-2s |
| OpenAI | CLOUD | GPT-4o | ~1-2s |

### RAG Pipeline

**Current Implementation**: In-memory keyword matching (MVP)

**Planned**: ChromaDB with vector embeddings

```typescript
// Query documents
const docs = await queryDocuments("Tell me about a leadership challenge", {
  topK: 3,
  type: 'behavioral'
});

// Inject into LLM context
const response = await generateResponse(messages, { documents: docs });
```

### System Prompts

The LLM is configured as a Senior Frontend Lead with expertise in:
- React, Next.js, TypeScript
- Team leadership and mentoring
- Technical architecture decisions
- STAR method responses

## TODO

- [ ] Integrate ChromaDB for vector similarity search
- [ ] Add embedding generation (OpenAI or local)
- [ ] Implement streaming responses
- [ ] Add response caching
- [ ] Create prompt templates for different question types

## API Usage

```bash
# Query RAG
curl "http://localhost:3000/api/rag?query=leadership&topK=3"

# Generate response
curl -X POST http://localhost:3000/api/llm/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Tell me about yourself"}],
    "useRag": true
  }'
```

## Prerequisites

### Local Mode (Ollama)
```bash
# Install Ollama
brew install ollama

# Pull model
ollama pull deepseek-r1:latest

# Verify
ollama list
```

### Cloud Mode
Add to `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-...
# or
OPENAI_API_KEY=sk-...
```
