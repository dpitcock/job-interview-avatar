# Storage & RAG Architecture

This document explains how Twinterview Agent stores candidate profiles, handles document context, and implements Retrieval Augmented Generation (RAG).

## Overview

Twinterview uses a hybrid storage model designed for simplicity, ease of local installation, and high-performance real-time response generation.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Persistent Metadata** | SQLite (`data/interview.db`) | Candidate profiles, session history, file records |
| **Context Retrieval** | In-Memory Search Engine | Fast, relevant snippet extraction for AI prompts |
| **Demo Mode** | Static JSON/Markdown | Read-only fallback for Vercel/Web deployment |

---

## 1. Persistent Storage: SQLite

When running the application locally, all primary data is stored in a single database file at the root of the project: `data/interview.db`.

### Key Tables
*   **`candidates`**: Stores profile identity (name, role), avatar/voice configuration IDs, and individual LLM settings (local vs cloud).
*   **`rag_files`**: Stores the full text content of uploaded documents linked to a specific candidate ID.
*   **`interview_sessions`**: Tracks the history of mock and live interviews.
*   **`interview_messages`**: Stores the dialogue for each session to maintain conversation memory.

**File Location:** `src/lib/db.ts` handles the initialization and migrations of this database.

---

## 2. Context & RAG Pipeline

The RAG (Retrieval Augmented Generation) system is what allows the AI to "know" your experience. 

### How Documents are Indexed
1.  **Parsing**: When a document is uploaded, it is parsed for meaningful sections (ignoring headers, short fragments, and boilerplate).
2.  **Tokenization**: Text is converted to lower-case, symbols are removed, and "stop words" (a, the, is, etc.) are filtered out.
3.  **In-Memory Storage**: The processed text segments are stored in a specialized JavaScript `Map` (`candidateDocumentStores`). This map is indexed by `candidate_id`, ensuring complete data isolation.

### The Retrieval Process (Real-time)
When a question is asked during an interview:
1.  **Query Analysis**: The user's question is tokenized using the same algorithm as the documents.
2.  **Scoring**: The system runs a **TF-IDF-like scoring algorithm** against the active candidate's in-memory segments.
3.  **Ranking**: Segments are ranked by relevance. Title matches and tag matches are given higher weights.
4.  **Prompt Injection**: The top relevant snippets (Top-K) are injected directly into the LLM system prompt as "Expert Context."

**Logic Location:** `src/lib/rag/index.ts` contains the matching algorithm and memory management.

---

## 3. Data Isolation

The system is multi-tenant by design. Because every storage call (both SQLite and In-Memory) requires a `candidateId`, one candidate's resume will never leak into another candidate's interview session.

### Rebuilding the Index
The Vector Store is in-memory for speed. When the server restarts:
1.  The system identifies that the in-memory store is empty.
2.  It queries the SQLite `rag_files` table for all text associated with current candidates.
3.  It automatically re-indexes the text so the AI is immediately ready with your context.

---

## 4. Local vs. Cloud Mode

### Local Development (macOS)
*   Uses `better-sqlite3`.
*   Requires a local `data/` folder.
*   Supports full CRUD (Create, Read, Update, Delete) for candidates and documents.

### Web Demo (Vercel)
*   **Read-Only**: Since Vercel is serverless/ephemeral, SQLite is disabled.
*   **Static Fallback**: Profiles are loaded from `src/data/candidates-fallback.json`.
*   **Mock Context**: Context is loaded from pre-defined markdown files in the `docs/` folder to demonstrate RAG capabilities without a database.

---

## Technical Maintenance

*   **To clear all data**: Simply delete the `data/` folder. The system will recreate an empty database on the next start.
*   **To backup**: Copy the `data/interview.db` file.
