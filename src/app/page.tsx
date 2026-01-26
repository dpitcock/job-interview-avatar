'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VercelBanner } from '@/components/VercelBanner';

// Pure marketing page
export default function MarketingPage() {
  const [mode, setMode] = useState<'LOCAL' | 'CLOUD'>('LOCAL');

  const toggleMode = () => {
    setMode(prev => prev === 'LOCAL' ? 'CLOUD' : 'LOCAL');
  };


  return (
    <div className="min-h-screen bg-background">
      <VercelBanner />

      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              T
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Twinterview Agent</h1>
              <p className="text-xs text-muted">
                AI Interview Assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="btn btn-primary glow-primary flex items-center gap-2 px-4 py-2 text-sm"
            >
              <span>Go to Dashboard</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">


        {/* Hero Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Parallelize Your <span className="gradient-text">Job Hunt</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-3xl mx-auto mb-6">
            Clone yourself for screening rounds. Your AI twin handles tedious early interviews 24/7 while you focus on high-value opportunities.
          </p>

          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="font-semibold">500+ Developers</span>
            </div>
            <div className="text-muted">•</div>
            <div className="flex items-center gap-2">
              <span className="font-semibold">2,000+ Interviews Automated</span>
            </div>
            <div className="text-muted">•</div>
            <div className="flex items-center gap-2">
              <span className="text-success font-bold">78%</span>
              <span>Screen Pass Rate</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <a
              href="https://github.com/dpitcock/job-interview-avatar#installation"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary glow-primary text-lg px-8 py-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Install Now
            </a>
            <Link
              href="/practice"
              className="btn btn-secondary text-lg px-8 py-4 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </Link>
          </div>

          {/* Mac Only Note */}
          <p className="text-sm text-warning flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Currently macOS only • Linux & Windows support coming soon
          </p>
        </section>

        {/* Key Benefits Section */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="glass rounded-2xl p-6 card-interactive">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3">Concurrent Interviews</h3>
            <p className="text-sm text-muted leading-relaxed">
              Run multiple screening rounds in parallel. No scheduling conflicts, no calendar juggling.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 card-interactive">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-bold mb-3">Skip Early Waste</h3>
            <p className="text-sm text-muted leading-relaxed">
              AI crushes basic screens (SQL, LeetCode easy)—you only interview when offers are on the table.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 card-interactive">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-3">AI vs AI Edge</h3>
            <p className="text-sm text-muted leading-relaxed">
              Train on real interview Q&A datasets. Preview how your twin answers before going live.
            </p>
          </div>

          <div className="glass rounded-2xl p-6 card-interactive">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-bold mb-3">Your Exact Clone</h3>
            <p className="text-sm text-muted leading-relaxed">
              Video/voice synthesis from a 2-minute selfie upload. Indistinguishable from you.
            </p>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="glass rounded-2xl p-8 mb-16 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <svg className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <blockquote className="text-2xl font-medium mb-4 italic">
              "Saved me 15 interviews last month. Landed FAANG onsite."
            </blockquote>
            <p className="text-muted">— Berlin Frontend Lead</p>
          </div>
        </section>

        {/* Tech Stack Comparison */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-4">Choose Your Stack</h2>
          <p className="text-center text-muted mb-8 max-w-2xl mx-auto">
            Toggle between premium cloud services for ultra-realistic performance or open-source local models for privacy and customization.
          </p>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Cloud Stack */}
            <div className={`glass p-6 rounded-2xl border-2 transition-all ${mode === 'CLOUD' ? 'border-primary bg-primary/5' : 'border-transparent'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">☁️</span> Cloud (Premium)
                </h3>
                {mode === 'CLOUD' && <span className="text-xs bg-primary px-2 py-1 rounded text-white uppercase font-bold tracking-wider">Active</span>}
              </div>
              <p className="text-sm text-muted mb-4">Ultra-realistic performance using elite cloud services.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card/50">
                  <span className="text-muted">Brain</span>
                  <span className="font-medium text-foreground">OpenAI / Anthropic</span>
                </div>
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card/50">
                  <span className="text-muted">Voice</span>
                  <span className="font-medium text-foreground">ElevenLabs</span>
                </div>
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card/50">
                  <span className="text-muted">Avatar</span>
                  <span className="font-medium text-foreground">HeyGen Streaming</span>
                </div>
              </div>
              <p className="text-xs text-muted mt-4 italic">Zero subscriptions—pay per render if you scale</p>
            </div>

            {/* Local Stack */}
            <div className={`glass p-6 rounded-2xl border-2 transition-all ${mode === 'LOCAL' ? 'border-success bg-success/5' : 'border-transparent'}`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-2xl">🏠</span> Local (Open Source)
                </h3>
                {mode === 'LOCAL' && <span className="text-xs bg-success px-2 py-1 rounded text-white uppercase font-bold tracking-wider">Active</span>}
              </div>
              <p className="text-sm text-muted mb-4">Private, model-agnostic, and runs completely offline.</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card/50">
                  <span className="text-muted">Brain</span>
                  <span className="font-medium text-foreground">Model Agnostic (Ollama)</span>
                </div>
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card/50">
                  <span className="text-muted">Voice</span>
                  <span className="font-medium text-foreground">OpenVoice / Coqui</span>
                </div>
                <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-card/50">
                  <span className="text-muted">Avatar</span>
                  <span className="font-medium text-foreground">LivePortrait (Local)</span>
                </div>
              </div>
              <p className="text-xs text-muted mt-4 italic">Use any Ollama model—DeepSeek, Llama, Mistral, etc.</p>
            </div>
          </div>

          <p className="mt-8 text-sm text-center text-muted italic">
            * Switch modes anytime in the header to toggle between premium fidelity and open-source privacy.
          </p>
        </section>

        {/* Setup Status Cards - Removed for Marketing Page */}

        {/* Main Actions - Removed for Marketing Page */}

        {/* Quick Stats - Removed for Marketing Page */}

        {/* GitHub CTA Section */}
        <section className="glass rounded-2xl p-12 text-center border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent mt-12">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Open Source & Free Forever
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Join the <span className="gradient-text">Community</span>
            </h2>
            <p className="text-lg text-muted mb-8">
              Star the repo, fork it, contribute, or just explore the code. Built by developers, for developers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://github.com/dpitcock/job-interview-avatar"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary glow-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                View on GitHub
              </a>
              <a
                href="https://github.com/dpitcock/job-interview-avatar/fork"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Fork & Customize
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-warning" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>MIT License</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                <span>TypeScript + Next.js</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>macOS Ready</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-muted text-sm">
        <p>
          Twinterview Agent — Open source AI for democratizing interviews.{' '}
          <a href="https://github.com/dpitcock/job-interview-avatar" className="text-primary hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}


