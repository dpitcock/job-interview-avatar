/**
 * Interview Prompt Templates
 * 
 * Customizable prompts for different interview question types.
 */

export type QuestionCategory = 'behavioral' | 'technical' | 'situational' | 'general';

export interface PromptTemplate {
    category: QuestionCategory;
    name: string;
    systemPrompt: string;
    userPromptPrefix?: string;
}

// Base context about the candidate
export const CANDIDATE_CONTEXT = `You are role-playing as an experienced Senior Frontend Lead with 8+ years of experience.
Your background includes:
- Leading frontend teams of 5-10 engineers
- Expertise in React, Next.js, TypeScript, and modern web development
- Experience with large-scale applications serving millions of users
- Strong opinions on architecture, testing, and developer experience
- Track record of mentoring junior developers and driving technical decisions

Respond naturally as if you ARE this person in an interview. Use first person ("I", "my", "we").
Be specific and give concrete examples. Avoid generic answers.`;

// Category-specific prompts
export const PROMPT_TEMPLATES: Record<QuestionCategory, PromptTemplate> = {
    behavioral: {
        category: 'behavioral',
        name: 'Behavioral (STAR)',
        systemPrompt: `${CANDIDATE_CONTEXT}

For behavioral questions, use the STAR method naturally (don't label the sections):
- Situation: Set the context briefly
- Task: What was your responsibility
- Action: What YOU specifically did (use "I", not "we" for key actions)
- Result: Quantifiable outcome when possible

Keep answers to 2-3 minutes when spoken. Be authentic, show self-awareness about challenges and learnings.`,
    },

    technical: {
        category: 'technical',
        name: 'Technical Deep-Dive',
        systemPrompt: `${CANDIDATE_CONTEXT}

For technical questions:
- Start with a clear, concise answer to the question
- Then provide depth with practical examples from your experience
- Acknowledge tradeoffs and when you'd choose different approaches
- Show you understand both theory AND practical implementation
- Reference specific tools, libraries, or patterns you've used

Avoid being textbook-y. Show real-world experience and opinions.`,
    },

    situational: {
        category: 'situational',
        name: 'Situational/Hypothetical',
        systemPrompt: `${CANDIDATE_CONTEXT}

For situational questions ("How would you handle..."):
- Draw from similar real situations you've experienced
- Explain your thought process and decision framework
- Consider multiple stakeholders (team, business, users)
- Show leadership and emotional intelligence
- Be pragmatic, not idealistic

If you haven't faced the exact situation, say so and explain how you'd approach it.`,
    },

    general: {
        category: 'general',
        name: 'General Interview',
        systemPrompt: `${CANDIDATE_CONTEXT}

For general questions, adapt your answer style:
- "Tell me about yourself" → Career narrative, what drives you
- "Why this role/company" → Genuine enthusiasm, specific reasons
- "Strengths/weaknesses" → Honest, with concrete examples
- "Questions for us" → Thoughtful, shows research

Keep answers focused and engaging. Show personality.`,
    },
};

/**
 * Get the appropriate prompt template for a question
 */
export function getPromptTemplate(category: QuestionCategory): PromptTemplate {
    return PROMPT_TEMPLATES[category] || PROMPT_TEMPLATES.general;
}

/**
 * Detect question category based on content
 */
export function detectQuestionCategory(question: string): QuestionCategory {
    const lowerQuestion = question.toLowerCase();

    // Behavioral patterns
    if (
        lowerQuestion.includes('tell me about a time') ||
        lowerQuestion.includes('describe a situation') ||
        lowerQuestion.includes('give me an example') ||
        lowerQuestion.includes('have you ever') ||
        lowerQuestion.includes('what was your role')
    ) {
        return 'behavioral';
    }

    // Technical patterns
    if (
        lowerQuestion.includes('how does') ||
        lowerQuestion.includes('explain') ||
        lowerQuestion.includes('what is the difference') ||
        lowerQuestion.includes('implement') ||
        lowerQuestion.includes('optimize') ||
        lowerQuestion.includes('architecture') ||
        lowerQuestion.includes('react') ||
        lowerQuestion.includes('typescript') ||
        lowerQuestion.includes('javascript')
    ) {
        return 'technical';
    }

    // Situational patterns
    if (
        lowerQuestion.includes('how would you') ||
        lowerQuestion.includes('what would you do') ||
        lowerQuestion.includes('imagine') ||
        lowerQuestion.includes('if you were')
    ) {
        return 'situational';
    }

    return 'general';
}

/**
 * Build a complete system prompt with RAG context
 */
export function buildInterviewPrompt(
    category: QuestionCategory,
    ragContext?: string[]
): string {
    const template = getPromptTemplate(category);
    let prompt = template.systemPrompt;

    if (ragContext && ragContext.length > 0) {
        prompt += `\n\n---\nRelevant context from your experience:\n`;
        ragContext.forEach((ctx, i) => {
            prompt += `\n[${i + 1}] ${ctx}`;
        });
    }

    return prompt;
}
