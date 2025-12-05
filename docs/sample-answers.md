# Sample Interview Answers for RAG Testing

Use these sample answers to test the RAG pipeline. Upload this file at `/setup/rag`.

---

## Leadership & Team Management

### Tell me about a time you led a team through a difficult project.

I led the frontend team during our migration from a legacy jQuery/Backbone codebase to React. The challenge was that we had to maintain feature velocity for the business while rewriting core infrastructure. 

I implemented a strangler fig pattern where we gradually wrapped legacy components in React. I created a shared component library to ensure consistency, set up weekly architecture reviews, and paired with junior developers to upskill them on React patterns.

The migration took 8 months. We reduced our bundle size by 45%, improved page load times by 60%, and saw a 40% decrease in production bugs related to UI state management.

### How do you handle conflict within your team?

Recently, two senior engineers on my team had opposing views on our state management approach—one advocated for Redux, the other for React Query. The debate was becoming unproductive.

I facilitated a structured discussion where each engineer had to present the other's position's merits before critiquing it. This forced genuine understanding. We then evaluated both options against our specific requirements: data freshness needs, offline support, and team familiarity.

We ended up with a hybrid approach—React Query for server state and Zustand for client state. Both engineers felt heard, and the solution was better than either original proposal.

---

## Technical Expertise

### How would you optimize a slow Next.js application?

I'd start with measurement—you can't improve what you can't measure. I'd use Lighthouse, Web Vitals, and custom performance marks to identify bottlenecks.

Common issues I've found:
1. **Over-fetching on initial load**: Move to Server Components and fetch only what's needed for above-the-fold content
2. **Large JavaScript bundles**: Analyze with @next/bundle-analyzer, implement dynamic imports for heavy libraries
3. **Unoptimized images**: Use next/image with proper sizing and formats
4. **Missing caching**: Add stale-while-revalidate headers, consider Redis for expensive computations

In my last optimization project, we reduced LCP from 4.2s to 1.1s by implementing ISR with on-demand revalidation and lazy-loading below-fold content.

### Explain React's reconciliation process.

React's reconciliation is how it efficiently updates the DOM when state changes. Instead of re-rendering the entire tree, React uses a diffing algorithm.

When state changes, React creates a new virtual DOM tree. It then compares this with the previous tree using these heuristics:
1. Elements of different types produce different trees—it tears down the old tree completely
2. Elements of the same type compare attributes and update only what changed
3. Keys on lists help React identify which items moved, were added, or removed

The fiber architecture introduced in React 16 made this interruptible—React can pause work, handle browser events, then resume. This prevents long renders from blocking user interaction.

Understanding this helps me write performant code—like using stable keys, avoiding inline object creation in props, and properly memoizing expensive components.

---

## Situational Questions

### How would you handle a stakeholder pushing for unrealistic deadlines?

First, I'd understand their perspective—usually there's a business driver like a marketing launch or competitive pressure. I'd ask questions to understand what's truly flexible versus fixed.

Then I'd present options with clear tradeoffs:
1. Reduced scope to hit the date
2. Full scope with a later date
3. Phased release—MVP now, full features later

I'd back these with data—past velocity, risk assessment, and concrete examples of what cutting corners has cost us before. I'd also propose mitigation strategies if we go with a tight timeline.

The goal isn't to say "no" but to help the stakeholder make an informed decision. They may have context I don't, and the tight deadline might actually be the right call.

### What would you do if you disagreed with a technical decision from leadership?

I'd start by assuming good intent and trying to understand the full context. Leadership often has constraints or information I'm not aware of—budget, timeline, strategic direction.

If I still disagreed after understanding their reasoning, I'd document my concerns clearly with specific risks and alternatives. I'd propose a time-boxed experiment if possible—"Can we try my approach for two weeks and measure the results?"

But ultimately, if the decision stands, I'd commit fully to making it work. Nothing is worse than a team member undermining a decision while implementing it. If it fails, we learn together. If it succeeds, great—I learned something.

---

## Career & Motivations

### Tell me about yourself.

I'm a Senior Frontend Lead with 8 years of experience building web applications at scale. I started as a backend Python developer, which gives me a strong foundation in systems thinking and API design.

For the past 5 years, I've focused on frontend—specifically React, TypeScript, and Next.js. What drives me is the intersection of engineering excellence and user experience. I believe great frontend engineering is invisible to users—fast, accessible, and intuitive.

I've led teams of 5-10 engineers, architected systems serving millions of users, and I'm passionate about mentoring developers earlier in their careers. I'm particularly interested in the AI/ML space and how we can build better developer experiences.

### Why are you looking to leave your current role?

I've accomplished what I set out to do at my current company—we rebuilt the frontend from scratch, grew the team from 3 to 12, and established engineering practices that will scale. I'm proud of that work.

Now I'm looking for a new challenge. I'm particularly excited about roles where I can combine my frontend expertise with emerging technologies like AI. I want to be at a company where I'm learning as much as I'm contributing.
