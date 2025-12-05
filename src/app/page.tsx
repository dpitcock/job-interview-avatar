'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Mode = 'LOCAL' | 'CLOUD';

interface SetupStatus {
  voice: { ready: boolean; name?: string };
  avatar: { ready: boolean; name?: string };
  rag: { ready: boolean; count: number };
  llm: { ready: boolean; provider: string };
}

export default function Dashboard() {
  const [mode, setMode] = useState<Mode>('LOCAL');
  const [status, setStatus] = useState<SetupStatus>({
    voice: { ready: false },
    avatar: { ready: false },
    rag: { ready: false, count: 0 },
    llm: { ready: true, provider: 'DeepSeek R1' },
  });
  const [isLive, setIsLive] = useState(false);

  // Check setup status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
        setMode(data.mode || 'LOCAL');
      }
    } catch {
      // API not ready yet, use defaults
    }
  };

  const toggleMode = async () => {
    const newMode = mode === 'LOCAL' ? 'CLOUD' : 'LOCAL';
    setMode(newMode);
    // In a real implementation, this would persist the mode
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">InterviewAvatar</h1>
              <p className="text-xs text-muted">AI Interview Agent</p>
            </div>
          </div>

          {/* Settings & Mode Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 rounded-full glass hover:glow-primary transition-all"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            <button
              onClick={toggleMode}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass hover:glow-primary transition-all"
            >
              <span className={`w-2 h-2 rounded-full ${mode === 'LOCAL' ? 'bg-success' : 'bg-primary'}`} />
              <span className="text-sm font-medium">{mode}</span>
              <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your <span className="gradient-text">AI Clone</span> for Interviews
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Let your digital avatar handle job interviews using your voice, face, and expertise.
            Powered by {mode === 'LOCAL' ? 'DeepSeek + OpenVoice + LivePortrait' : 'Claude + ElevenLabs + HeyGen'}.
          </p>
        </section>

        {/* Setup Status Cards */}
        <section className="grid md:grid-cols-4 gap-4 mb-8">
          <StatusCard
            title="LLM"
            icon="🧠"
            ready={status.llm.ready}
            detail={mode === 'LOCAL' ? 'DeepSeek R1' : 'Claude 3.5'}
            href="/setup/llm"
          />
          <StatusCard
            title="Voice"
            icon="🎤"
            ready={status.voice.ready}
            detail={status.voice.name || 'Not configured'}
            href="/setup/voice"
          />
          <StatusCard
            title="Avatar"
            icon="👤"
            ready={status.avatar.ready}
            detail={status.avatar.name || 'Not configured'}
            href="/setup/avatar"
          />
          <StatusCard
            title="RAG"
            icon="📚"
            ready={status.rag.ready}
            detail={status.rag.count > 0 ? `${status.rag.count} docs` : 'No documents'}
            href="/setup/rag"
          />
        </section>

        {/* Main Actions */}
        <section className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Start Interview */}
          <div className="glass rounded-2xl p-8 card-interactive">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Start Interview</h3>
                <p className="text-muted">
                  Launch your AI avatar for a live Zoom interview session.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-3xl">
                🎬
              </div>
            </div>

            <div className="flex items-center gap-2 mb-6 text-sm">
              <span className={`w-2 h-2 rounded-full ${allReady(status) ? 'bg-success animate-pulse-slow' : 'bg-warning'}`} />
              <span className={allReady(status) ? 'text-success' : 'text-warning'}>
                {allReady(status) ? 'Ready to go' : 'Complete setup first'}
              </span>
            </div>

            <Link
              href={allReady(status) ? '/live' : '#'}
              className={`btn w-full ${allReady(status) ? 'btn-primary glow-primary' : 'btn-secondary opacity-50 cursor-not-allowed pointer-events-none'}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
              {isLive ? 'Interview Active' : 'Start Interview'}
            </Link>
          </div>

          {/* Practice Mode */}
          <div className="glass rounded-2xl p-8 card-interactive">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Practice Mode</h3>
                <p className="text-muted">
                  Mock interviews with common questions to refine your responses.
                </p>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center text-3xl">
                🎯
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6 text-center text-sm">
              <div className="p-3 rounded-xl bg-card">
                <div className="text-xl font-bold">25</div>
                <div className="text-muted">Behavioral</div>
              </div>
              <div className="p-3 rounded-xl bg-card">
                <div className="text-xl font-bold">15</div>
                <div className="text-muted">Technical</div>
              </div>
              <div className="p-3 rounded-xl bg-card">
                <div className="text-xl font-bold">10</div>
                <div className="text-muted">Situational</div>
              </div>
            </div>

            <Link href="/practice" className="btn btn-secondary w-full">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 013.7-3.7 48.678 48.678 0 017.324 0 4.006 4.006 0 013.7 3.7c.017.22.032.441.046.662M4.5 12l-3-3m3 3l-3 3M4.5 12h15" />
              </svg>
              Start Practice
            </Link>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="glass rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <MetricCard label="Avg Response Time" value="2.3s" target="<4s" isGood />
            <MetricCard label="RAG Accuracy" value="94%" target=">90%" isGood />
            <MetricCard label="Voice Latency" value="380ms" target="<500ms" isGood />
            <MetricCard label="Sessions Today" value="0" target="-" isGood />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-muted text-sm">
        <p>
          InterviewAvatar — Open source AI for democratizing interviews.{' '}
          <a href="https://github.com" className="text-primary hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

function StatusCard({ title, icon, ready, detail, href }: {
  title: string;
  icon: string;
  ready: boolean;
  detail: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="glass rounded-xl p-4 card-interactive flex items-center gap-4"
    >
      <div className="text-2xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
          <span className={`w-2 h-2 rounded-full ${ready ? 'bg-success' : 'bg-warning'}`} />
        </div>
        <div className="text-sm text-muted truncate">{detail}</div>
      </div>
      <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>
    </Link>
  );
}

function MetricCard({ label, value, target, isGood }: {
  label: string;
  value: string;
  target: string;
  isGood: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${isGood ? 'text-success' : 'text-warning'}`}>
        {value}
      </div>
      <div className="text-sm text-muted">{label}</div>
      <div className="text-xs text-muted/50">Target: {target}</div>
    </div>
  );
}

function allReady(status: SetupStatus): boolean {
  return status.llm.ready && status.voice.ready && status.avatar.ready && status.rag.ready;
}
