# API Reference

## Status

### GET /api/status

Check readiness of all services.

**Response:**
```json
{
  "mode": "LOCAL",
  "llm": { "ready": true, "provider": "DeepSeek R1" },
  "voice": { "ready": false, "name": null },
  "avatar": { "ready": false, "name": null },
  "rag": { "ready": true, "count": 5 }
}
```

---

## LLM

### POST /api/llm/generate

Generate a response using the LLM with optional RAG context.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "Tell me about yourself" }
  ],
  "useRag": true
}
```

**Response:**
```json
{
  "content": "I'm a Senior Frontend Lead with 8 years of experience...",
  "usage": {
    "promptTokens": 150,
    "completionTokens": 280,
    "totalTokens": 430
  },
  "latencyMs": 1850
}
```

---

## RAG

### GET /api/rag

Get RAG status or query documents.

**Query Parameters:**
- `query` - Search query (optional)
- `topK` - Number of results (default: 5)
- `type` - Filter by type: behavioral, technical, project, general

**Response (status):**
```json
{ "count": 12 }
```

**Response (query):**
```json
{
  "documents": [
    {
      "id": "doc_123",
      "content": "When I led the frontend migration...",
      "metadata": { "type": "behavioral" },
      "score": 0.85
    }
  ],
  "count": 1
}
```

### POST /api/rag

Add documents to the RAG store.

**Request (JSON):**
```json
{
  "content": "My experience with React...",
  "metadata": { "type": "technical" }
}
```

**Request (File Upload):**
```
Content-Type: multipart/form-data
file: behavioral-answers.txt
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "ids": ["doc_1", "doc_2", "doc_3", "doc_4", "doc_5"]
}
```

### DELETE /api/rag

Clear all documents.

**Response:**
```json
{ "success": true }
```
