# Prompt for Twinterview App Page Structure & Layout

**You are a developer building Twinterview, an open-source AI avatar app for developers to automate early job interviews. Generate complete React components with Tailwind CSS for a multi-page app with clear separation between marketing (index) and user action (dashboard+) pages.**

## Core Terminology (MANDATORY - Repeat in ALL outputs)
- **USER** = website visitor (the developer installing the package)
- **CANDIDATE** = the AI avatar being created/managed (the "twin" that takes interviews)
- "One USER manages multiple CANDIDATES. Each CANDIDATE has its own dashboard."

## Page Structure Requirements

### 1. Index Page (Marketing/Value Prop - NO dashboard elements)

This exists already. Updated needed to terminology and replace the buttons to change candidates, navigate to settings, or view the mode selection to just a single button to "See Dashboard". Then consider the following and keep in mind this functionaly already exists in the UI so it will be mostly moved around. 

```
Path: /
Purpose: Pure marketing + install CTA
Content: 
- Hero with value props (concurrent interviews, skip early screens)
- Demo video/GIF  
- npm install buttons
- "See Dashboard" button → /dashboard  (in toolbar but also somewhere in the CTA area)
- NO sidenav, NO candidate selection, NO user actions
```

### 2. Dashboard Layout (ALL non-index pages use this layout)
```
Path: /dashboard/*
Layout: Persistent sidenav + persistent toolbar (candidate selector, mode selector (local vs cloud), setting icon to /dashboard/settings.) + persistent subheader (showing the LLM being used, Voice being used, Avatar being used Rag documents - each is also a link to /dashboard/settings) + main content area
Sidenav items (exact names/links):
├── Start Interview (/dashboard/start)
├── Practice Mode (/dashboard/practice) 
├── Mock Interviews (/dashboard/mock)
├── Interview Chatbot (/dashboard/chatbot)
├── Context (/dashboard/context)
└── Dashboard Home (/dashboard)

Main content: Dynamic based on route
```

### 3. Dashboard Home (/dashboard) - TWO STATES

**State A: NO candidate selected**
```
Top container (full width, prominent):
"Add Your First Candidate 👤"
[Big blue "Create Candidate" button]
Subtitle: "Upload 2-min selfie video → Get AI twin for interviews"

Lower section: Recent activity or quick stats (empty state friendly)
```

**State B: Candidate SELECTED** (via click OR shared URL params like `/dashboard?candidate=john-doe`)
```
Hero welcome: "Welcome back, John Doe 👋"
"Next steps: [Practice Mode] → [Mock Interviews] → [Start Interview]"
Status chips: "Ready for LeetCode screens" | "Voice trained" | "RAG loaded"

Quick action buttons:
[Start Interview] [Practice Session] [Upload Resume Context]
```

## Component Requirements

**Generate these COMPLETE working components:**

1. `pages/index.tsx` - Pure marketing page
2. `components/DashboardLayout.tsx` - Sidenav wrapper for ALL /dashboard/* pages  
3. `pages/dashboard/index.tsx` - Dashboard home with candidate logic
4. `pages/dashboard/[...page].tsx` - Catch-all for other dashboard pages

**Key Logic:**
```typescript
// In dashboard pages
const { candidateId } = router.query;
const hasCandidate = !!candidateId || !!selectedCandidate;

if (!hasCandidate) {
  return <AddCandidateCTA />
}
return <CandidateDashboard candidateId={candidateId} />
```

## Design System
- Tailwind CSS only
- Dark mode ready (`dark:bg-gray-900`)
- Mobile-responsive sidenav (hamburger → slideout)
- Candidate avatar/image in header when selected
- Consistent blue (#3B82F6) for CTAs
- Berlin dev aesthetic: Clean, monospace fonts, subtle gradients

## Shared Link Support
URLs like `/dashboard?candidate=john-doe-avatar-123` should auto-load that candidate's dashboard with welcome message.

## Output Format
```
1. Complete file contents for each component
2. TypeScript interfaces for props
3. Responsive breakpoints (sm/md/lg)
4. Next.js 14+ App Router compatible
5. Copy/paste ready - zero additional setup needed
```

**Generate the COMPLETE code now. Focus on the conditional logic for candidate selection and dashboard layout first.**

