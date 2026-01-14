'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserProfiles } from '@/hooks/useUserProfiles';
import { UserSelector } from '@/components/UserSelector';
import { VercelBanner } from '@/components/VercelBanner';

type Mode = 'LOCAL' | 'CLOUD';

interface SetupStatus {
  voice: { ready: boolean; name?: string };
  avatar: { ready: boolean; name?: string };
  rag: { ready: boolean; count: number };
  llm: { ready: boolean; provider: string };
  mode?: string;
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

  const {
    users,
    activeUser,
    activeUserId,
    isLoaded,
    canAddUser,
    setActiveUser,
  } = useUserProfiles();

  // Check setup status on mount and when activeUserId changes
  useEffect(() => {
    if (isLoaded) {
      checkStatus();
    }
  }, [isLoaded, activeUserId]);

  // Sync mode with status from server
  useEffect(() => {
    if (status.mode) {
      setMode(status.mode as Mode);
    }
  }, [status.mode]);

  const checkStatus = async () => {
    try {
      const url = activeUserId
        ? `/api/status?userId=${activeUserId}`
        : '/api/status';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStatus({
          voice: {
            ready: activeUser?.voice.configured || false,
            name: activeUser?.voice.voiceId || undefined,
          },
          avatar: {
            ready: activeUser?.avatar.configured || false,
            name: activeUser?.avatar.avatarName || undefined,
          },
          llm: data.llm,
          rag: data.rag,
          mode: data.mode, // Add mode to status type
        } as any);
      }
    } catch {
      // API not ready yet, use defaults
    }
  };

  const toggleMode = async () => {
    const newMode = mode === 'LOCAL' ? 'CLOUD' : 'LOCAL';
    setMode(newMode);

    if (activeUser) {
      try {
        await fetch(`/api/users/${activeUser.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            llm: {
              ...(activeUser.llm || {}),
              preferredMode: newMode,
            }
          }),
        });
        // Refresh status
        checkStatus();
      } catch (e) {
        console.error('Failed to persist mode:', e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <VercelBanner />
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center overflow-hidden">
              {activeUser?.avatar.imageUrl ? (
                <img
                  src={activeUser.avatar.imageUrl}
                  alt={activeUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">InterviewAvatar</h1>
              <p className="text-xs text-muted">
                {activeUser ? activeUser.name : 'AI Interview Agent'}
              </p>
            </div>
          </div>

          {/* User Selector, Settings & Mode Toggle */}
          <div className="flex items-center gap-3">
            <UserSelector
              users={users}
              activeUser={activeUser}
              onSelectUser={setActiveUser}
            />

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
        {/* No User Selected Warning */}
        {isLoaded && !activeUser && (
          <section className="glass rounded-2xl p-8 mb-8 border-2 border-warning text-center">
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-bold mb-2">Create Your First Profile</h2>
            <p className="text-muted mb-6 max-w-md mx-auto">
              Create a user profile to get started. Each profile has its own voice, avatar, and context.
            </p>
            <Link href="/users" className="btn btn-primary glow-primary">
              Create Profile
            </Link>
          </section>
        )}

        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your <span className="gradient-text">AI Clone</span> for Interviews
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Let your digital avatar handle job interviews using your voice, face, and expertise.
            {activeUser && (
              <span className="block mt-2 font-medium text-primary">
                Current Brain: {mode === 'LOCAL' ? activeUser.llm?.localModel : activeUser.llm?.cloudModel}
              </span>
            )}
            {!activeUser && (
              <span className="block mt-2">
                Powered by {mode === 'LOCAL' ? 'DeepSeek + OpenVoice + LivePortrait' : 'Claude + ElevenLabs + HeyGen'}.
              </span>
            )}
          </p>
        </section>

        {/* Setup Status Cards */}
        {activeUser && (
          <section className="grid md:grid-cols-4 gap-4 mb-8">
            <StatusCard
              title="LLM"
              icon="🧠"
              ready={status.llm.ready}
              detail={status.llm.provider}
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
        )}

        {/* Main Actions */}
        {activeUser && (
          <section className="grid md:grid-cols-3 gap-6 mb-12">
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
                  <div className="text-muted">Beh.</div>
                </div>
                <div className="p-3 rounded-xl bg-card">
                  <div className="text-xl font-bold">15</div>
                  <div className="text-muted">Tech.</div>
                </div>
                <div className="p-3 rounded-xl bg-card">
                  <div className="text-xl font-bold">10</div>
                  <div className="text-muted">Sit.</div>
                </div>
              </div>

              <Link href="/practice" className="btn btn-secondary w-full">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.5 12c0-1.232.046-2.453.138-3.662a4.006 4.006 0 013.7-3.7 48.678 48.678 0 017.324 0 4.006 4.006 0 013.7 3.7c.017.22.032.441.046.662M4.5 12l-3-3m3 3l-3 3M4.5 12h15" />
                </svg>
                Start Practice
              </Link>
            </div>

            {/* Interview Candidate (Role Reversal) */}
            <div className="glass rounded-2xl p-8 card-interactive">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Interview Candidate</h3>
                  <p className="text-muted">
                    Role reversal: YOU are the interviewer. Test your avatar's knowledge.
                  </p>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-warning/20 flex items-center justify-center text-3xl">
                  🎙️
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card mb-6 text-xs text-muted">
                <p>Perfect for:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Reviewing your candidate's persona</li>
                  <li>Testing RAG context accuracy</li>
                  <li>Saving transcripts back to context</li>
                </ul>
              </div>

              <Link href="/interview/candidate" className="btn btn-secondary w-full border-warning/30 hover:bg-warning/10">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Interview Candidate
              </Link>
            </div>
          </section>
        )}

        {/* Quick Stats */}
        {activeUser && (
          <section className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <MetricCard label="Avg Response Time" value="2.3s" target="<4s" isGood />
              <MetricCard label="RAG Accuracy" value="94%" target=">90%" isGood />
              <MetricCard label="Voice Latency" value="380ms" target="<500ms" isGood />
              <MetricCard label="Sessions Today" value="0" target="-" isGood />
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-muted text-sm">
        <p>
          InterviewAvatar — Open source AI for democratizing interviews.{' '}
          <a href="https://github.com/dpitcock/job-interview-avatar" className="text-primary hover:underline">
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
