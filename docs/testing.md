# Testing Guide

This guide covers how to test InterviewAvatar at each phase.

---

## Quick Start Testing

```bash
# 1. Start the dev server
npm run dev

# 2. Open in browser
open http://localhost:3000
```

---

## Phase 1: Foundation Testing

### Dashboard
1. Go to `http://localhost:3000`
2. Verify the dashboard loads with:
   - Header with logo and settings gear
   - Mode toggle (LOCAL/CLOUD)
   - 4 status cards (LLM, Voice, Avatar, RAG)
   - Start Interview and Practice Mode cards

### Settings Page
1. Click the ⚙️ gear icon or go to `/settings`
2. Test LLM provider selection (Ollama, OpenAI, Anthropic)
3. Test model selection within each provider
4. Click "Save Settings" and verify the toast appears

### Setup Pages
- `/setup/llm` - LLM configuration
- `/setup/rag` - Document upload (drag & drop)
- `/setup/voice` - Audio recording UI
- `/setup/avatar` - Image upload UI

---

## Phase 2: Text Generation Testing

### Option A: Local with Ollama (Free)

```bash
# 1. Install Ollama
brew install ollama

# 2. Start Ollama
ollama serve

# 3. Pull a model (in another terminal)
ollama pull deepseek-r1:latest

# 4. Verify it's running
curl http://localhost:11434/api/tags
```

Then:
1. Go to Settings → Select "Local (Ollama)" → DeepSeek R1
2. Click "Test Connection" - should show success
3. Go to Practice → Select a question → Click "Generate AI Response"
4. Watch the streaming response appear

### Option B: Cloud with OpenAI

```bash
# 1. Add to .env.local
echo "OPENAI_API_KEY=sk-your-key-here" >> .env.local

# 2. Restart dev server
npm run dev
```

Then:
1. Go to Settings → Select "OpenAI" → GPT-4o
2. Click "Test Connection"
3. Go to Practice → Generate a response

### Option C: Cloud with Anthropic (Claude)

```bash
# 1. Add to .env.local
echo "ANTHROPIC_API_KEY=sk-ant-your-key" >> .env.local

# 2. Restart dev server
npm run dev
```

Then:
1. Settings → "Anthropic (Claude)" → Claude 3.5 Sonnet
2. Test Connection → Practice → Generate

---

## API Testing with curl

### Check Status
```bash
curl http://localhost:3000/api/status | jq
```

Expected:
```json
{
  "mode": "LOCAL",
  "llm": { "ready": true, "provider": "DeepSeek R1" },
  "voice": { "ready": false },
  "avatar": { "ready": false },
  "rag": { "ready": false, "count": 0 }
}
```

### Test LLM Generation
```bash
curl -X POST http://localhost:3000/api/llm/generate \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Tell me about yourself"}],
    "useRag": false,
    "provider": "ollama",
    "model": "deepseek-r1:latest"
  }' | jq
```

### Test Streaming
```bash
curl -X POST http://localhost:3000/api/llm/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Say hello in one sentence"}],
    "provider": "ollama",
    "model": "deepseek-r1:latest"
  }'
```

### Add RAG Documents
```bash
curl -X POST http://localhost:3000/api/rag \
  -H "Content-Type: application/json" \
  -d '{
    "content": "I led a team of 5 engineers to migrate our React app to Next.js, reducing page load times by 60%.",
    "metadata": { "type": "behavioral", "title": "Next.js Migration" }
  }'
```

### Query RAG
```bash
curl "http://localhost:3000/api/rag?query=migration&topK=3" | jq
```

---

## Testing RAG Pipeline

1. Go to `/setup/rag`
2. Create a test file `test-answers.txt`:

```text
## Leadership Example
Tell me about a time you led a team through a difficult project.

I led the frontend team during our migration from a legacy jQuery codebase to React. 
The challenge was doing this while maintaining feature velocity. I implemented a 
strangler fig pattern, created a component library, and mentored junior devs on React.
Result: 40% faster feature delivery, 60% fewer production bugs.

## Technical Challenge
Describe a complex technical problem you solved.

Our Next.js app had 8-second page loads. I profiled and found the issue: we were 
fetching all product data client-side. I implemented ISR with stale-while-revalidate,
added Redis caching, and lazy-loaded below-fold content. Result: 1.2s load times.
```

3. Drag the file to the upload zone
4. Go to Practice → Select a leadership question → Generate
5. The response should reference your uploaded context

---

## Troubleshooting

### "Ollama connection failed"
```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Start it
ollama serve
```

### "Model not found"
```bash
# List available models
ollama list

# Pull the model you need
ollama pull deepseek-r1:latest
```

### "API key not configured"
```bash
# Check .env.local exists and has the key
cat .env.local | grep API_KEY

# Restart dev server after adding keys
npm run dev
```

### Streaming not working
- Check browser console for errors
- Ensure you're not behind a proxy that buffers responses
- Try a non-streaming request first to verify the API works

---

## Performance Benchmarks

Target latencies for a complete interview response:

| Component | Target | Acceptable |
|-----------|--------|------------|
| LLM (local) | <3s | <5s |
| LLM (cloud) | <2s | <3s |
| RAG query | <200ms | <500ms |
| First token | <500ms | <1s |

Test with:
```bash
time curl -X POST http://localhost:3000/api/llm/generate \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}], "useRag": false}'
```
