# Phase 6: Dashboard & Polish

## Overview

Final polish, practice mode, and deployment setup.

## Features

### Live Dashboard
- Real-time transcription display
- AI response preview
- Latency monitoring per component
- Emergency pause/mute controls

### Practice Mode
- Question bank (behavioral, technical, situational)
- Record and review sessions
- Performance scoring
- Export recordings

### Deployment
- Docker Compose for full stack
- Vercel (frontend)
- Railway (backend orchestration)

## TODO

- [ ] Create practice question bank
- [ ] Implement session recording
- [ ] Add performance scoring
- [ ] Create Docker Compose setup
- [ ] Add Vercel deployment config
- [ ] Write deployment guide
- [ ] Create demo video

## Question Bank

### Behavioral (25 questions)
- "Tell me about a time you led a team through a difficult project"
- "Describe a conflict with a coworker and how you resolved it"
- ...

### Technical (15 questions)
- "Explain React's reconciliation algorithm"
- "How would you optimize a slow Next.js page?"
- ...

### Situational (10 questions)
- "How would you handle a stakeholder pushing for unrealistic deadlines?"
- "What would you do if you disagreed with a technical decision?"
- ...

## Docker Setup

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - INTERVIEW_MODE=LOCAL
    depends_on:
      - ollama
      - openvoice
      - liveportrait
      
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
      
  # ... more services
```

## Success Metrics

| Metric | Target |
|--------|--------|
| End-to-end latency | <4s |
| RAG accuracy | >95% |
| Voice naturalness | Passes human test |
| Video quality | Webcam-like |
