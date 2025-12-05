# Phase 1: Foundation

## Overview

This phase establishes the core project structure, configuration system, and base UI for InterviewAvatar.

## What's Included

### Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Main dashboard
│   ├── globals.css        # Design system
│   ├── api/               # REST API routes
│   └── setup/             # Configuration pages
├── lib/                   # Core libraries
│   ├── config.ts          # Mode switching
│   ├── llm/               # LLM providers
│   ├── rag/               # Vector search
│   ├── voice/             # Voice synthesis
│   └── video/             # Video generation
└── types/                 # TypeScript types
```

### Configuration System

The project uses a dual-mode configuration:

```typescript
// src/lib/config.ts
export type Mode = 'LOCAL' | 'CLOUD';

export const config = {
  mode: getMode(),
  llm: {
    local: { provider: 'ollama', model: 'deepseek-r1:latest' },
    cloud: { provider: 'anthropic', model: 'claude-3-5-sonnet' }
  },
  // ...
};
```

Set via environment variable:
```env
INTERVIEW_MODE=LOCAL  # or CLOUD
```

### UI Design System

Dark theme with glassmorphism effects:

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#0a0a0f` | Page background |
| `--card` | `#12121a` | Card backgrounds |
| `--primary` | `#6366f1` | Accent color (indigo) |
| `--success` | `#22c55e` | Ready states |
| `--warning` | `#f59e0b` | Pending states |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/status` | GET | Check service readiness |
| `/api/llm/generate` | POST | Generate LLM response |
| `/api/rag` | GET/POST/DELETE | Manage RAG documents |

## Running Phase 1

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open dashboard
open http://localhost:3000
```

## Verification

Build should pass with no errors:
```bash
npm run build
# ✓ Compiled successfully
```

## Next Steps

→ [Phase 2: Text Generation](../phase-2-text-generation/) - Wire up LLM and enhance RAG
