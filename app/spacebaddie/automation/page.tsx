'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

interface ConnectedAccount {
  provider: string
  name: string
  connectedAt: string
}

interface ProviderInfo {
  configured: boolean
  callbackUrl: string | null
}

interface ProviderStatus {
  providers: Record<string, ProviderInfo>
  siteUrl: string | null
  coreConfigured: boolean
  missingCore: string[]
  debug: {
    hasNextAuthSecret: boolean
    hasNextAuthUrl: boolean
    hasVercelUrl: boolean
    resolvedUrl: string | null
    nodeEnv: string
  }
}

const SOCIAL_PROVIDERS = [
  {
    id: 'google',
    name: 'YouTube',
    icon: '▶',
    color: 'from-red-500 to-red-700',
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-400',
    glowColor: 'shadow-red-500/25',
    description: 'Upload & manage videos, access analytics',
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    consoleUrl: 'https://console.cloud.google.com/apis/credentials',
    consoleName: 'Google Cloud Console',
    setupSteps: [
      'Go to Google Cloud Console → APIs & Services → Credentials',
      'Create an OAuth 2.0 Client ID (Web application type)',
      'Add the callback URL shown below under "Authorized redirect URIs"',
      'Enable the "YouTube Data API v3" under APIs & Services → Library',
      'Copy the Client ID and Client Secret into your environment variables',
    ],
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: '𝕏',
    color: 'from-sky-400 to-blue-600',
    borderColor: 'border-sky-500/40',
    bgColor: 'bg-sky-500/10',
    textColor: 'text-sky-400',
    glowColor: 'shadow-sky-500/25',
    description: 'Auto-post tweets, threads & media',
    envVars: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
    consoleUrl: 'https://developer.twitter.com/en/portal/projects-and-apps',
    consoleName: 'Twitter Developer Portal',
    setupSteps: [
      'Go to Twitter Developer Portal → Projects & Apps',
      'Create a new app or select existing one',
      'Under "User authentication settings", enable OAuth 2.0',
      'Set type to "Web App" and add the callback URL shown below',
      'Copy the Client ID and Client Secret into your environment variables',
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: 'from-pink-500 via-purple-500 to-orange-500',
    borderColor: 'border-pink-500/40',
    bgColor: 'bg-pink-500/10',
    textColor: 'text-pink-400',
    glowColor: 'shadow-pink-500/25',
    description: 'Schedule posts, reels & stories',
    envVars: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
    consoleUrl: 'https://developers.facebook.com/apps/',
    consoleName: 'Meta for Developers',
    setupSteps: [
      'Go to Meta for Developers → My Apps → Create App',
      'Add the "Instagram Basic Display" product',
      'Under Instagram Basic Display → Basic Display, add the callback URL shown below as a "Valid OAuth Redirect URI"',
      'Copy the Instagram App ID and Instagram App Secret into your environment variables',
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: '♪',
    color: 'from-cyan-400 to-pink-500',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-400',
    glowColor: 'shadow-cyan-500/25',
    description: 'Publish & schedule short-form videos',
    envVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    consoleUrl: 'https://developers.tiktok.com/',
    consoleName: 'TikTok for Developers',
    setupSteps: [
      'Go to TikTok for Developers → Manage Apps',
      'Create a new app and add "Login Kit"',
      'Add the callback URL shown below under redirect URIs',
      'Copy the Client Key and Client Secret into your environment variables',
    ],
  },
] as const

export default function AutomationPage() {
  const { data: session, status } = useSession()
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [expandedSetup, setExpandedSetup] = useState<string | null>(null)
  const [showDiagnostics, setShowDiagnostics] = useState(false)
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([])

  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 6,
      }))
    )
  }, [])

  useEffect(() => {
    setStatusLoading(true)
    fetch('/api/auth/providers-status')
      .then((r) => r.json())
      .then((data: ProviderStatus) => {
        setProviderStatus(data)
        setStatusLoading(false)
      })
      .catch(() => {
        setStatusLoading(false)
      })
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const errorParam = params.get('error')
      if (errorParam) {
        const messages: Record<string, string> = {
          OAuthSignin:
            'Could not start the sign-in flow. The provider may not be configured — check that OAuth credentials (Client ID + Secret) are set in your Vercel environment variables.',
          OAuthCallback:
            'Authentication callback failed. Make sure the callback URL in your OAuth provider settings exactly matches the one shown in the setup guide below.',
          OAuthCreateAccount:
            'Could not create a linked account. Please try again.',
          Callback:
            'Something went wrong during sign-in. Check that the callback URL in your OAuth provider matches exactly. See the setup guide below.',
          OAuthAccountNotLinked:
            'This email is already linked to another provider. Sign in with that provider first.',
          AccessDenied:
            'Access was denied. You may have cancelled the login or lack permission.',
          Configuration:
            'Server configuration error — NEXTAUTH_SECRET is likely missing from your environment variables. See diagnostics below.',
          default: 'An unexpected error occurred. Please try again.',
        }
        setError(messages[errorParam] ?? messages.default)
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [])

  useEffect(() => {
    if (session?.provider) {
      setConnectedAccounts((prev) => {
        if (prev.some((a) => a.provider === session.provider)) return prev
        return [
          ...prev,
          {
            provider: session.provider!,
            name: session.user?.name ?? 'Connected',
            connectedAt: new Date().toISOString(),
          },
        ]
      })
    }
  }, [session])

  const handleConnect = useCallback(
    async (providerId: string) => {
      if (providerStatus && !providerStatus.coreConfigured) {
        setError(
          `Core authentication is not configured. Missing: ${providerStatus.missingCore.join(', ')}. Add these to your Vercel environment variables and redeploy.`
        )
        return
      }
      if (providerStatus && !providerStatus.providers[providerId]?.configured) {
        setError(
          `${SOCIAL_PROVIDERS.find((p) => p.id === providerId)?.name ?? providerId} is not configured yet. Add the required OAuth credentials to your Vercel environment variables and redeploy. Click "Setup Instructions" on the provider card below for step-by-step help.`
        )
        setExpandedSetup(providerId)
        return
      }
      setError(null)
      setConnectingProvider(providerId)
      try {
        await signIn(providerId, {
          callbackUrl: '/spacebaddie/automation',
        })
      } catch {
        setError(`Failed to connect to ${providerId}. Please try again.`)
        setConnectingProvider(null)
      }
    },
    [providerStatus]
  )

  const handleDisconnect = useCallback(async () => {
    setConnectedAccounts([])
    await signOut({ callbackUrl: '/spacebaddie/automation' })
  }, [])

  const isConnected = (providerId: string) =>
    connectedAccounts.some((a) => a.provider === providerId) ||
    session?.provider === providerId

  const isProviderConfigured = (providerId: string) =>
    providerStatus?.providers[providerId]?.configured ?? false

  const loading = status === 'loading'

  const configuredCount = providerStatus
    ? Object.values(providerStatus.providers).filter((p) => p.configured).length
    : null

  const anyConfigured = configuredCount !== null && configuredCount > 0

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Particles */}
      <div className="particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
              width: '2px',
              height: '2px',
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-cyan-500/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="flex items-center space-x-4 group">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-2xl font-bold text-white">⚡</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold neon-glow text-cyan-400">
                SPACEBADDIE
              </h1>
              <p className="text-sm text-cyan-300/70">Automation Hub</p>
            </div>
          </a>

          <div className="flex items-center space-x-4">
            {session?.user && (
              <div className="text-right">
                <div className="text-sm text-cyan-300">
                  {session.user.name}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
            <div
              className={`w-3 h-3 rounded-full animate-pulse ${
                session ? 'bg-green-400' : 'bg-yellow-400'
              }`}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto p-6">
        {/* Page Title */}
        <div className="text-center mb-10 mt-4">
          <h2 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            SOCIAL AUTOMATION
          </h2>
          <p className="text-lg text-cyan-300/80 max-w-2xl mx-auto">
            Connect your social accounts to automate content publishing across
            all platforms
          </p>
        </div>

        {/* Quick-Start Banner when nothing is configured */}
        {providerStatus && !providerStatus.coreConfigured && (
          <div className="mb-8 bg-red-500/10 border border-red-500/40 rounded-2xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <span className="text-red-400 text-2xl mt-0.5">🔴</span>
              <div className="flex-1">
                <p className="text-red-300 font-bold text-lg">
                  Authentication Not Set Up Yet
                </p>
                <p className="text-red-300/80 text-sm mt-1">
                  Social logins require environment variables to be configured on
                  your hosting platform. Follow the steps below to get started.
                </p>
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-5 space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-wider">
                Quick Start — 3 Steps to Get Running
              </h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="bg-cyan-500/20 text-cyan-400 font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm">
                    1
                  </span>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Add NEXTAUTH_SECRET
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Go to{' '}
                      <span className="text-cyan-400">
                        Vercel → Settings → Environment Variables
                      </span>{' '}
                      and add:
                    </p>
                    <div className="bg-black/60 border border-cyan-500/10 rounded-lg px-3 py-2 mt-1.5 font-mono text-xs text-cyan-200/80 flex items-center justify-between">
                      <span>
                        NEXTAUTH_SECRET ={' '}
                        <span className="text-yellow-300">
                          (any random string, e.g. run: openssl rand -base64 32)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-cyan-500/20 text-cyan-400 font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm">
                    2
                  </span>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Add NEXTAUTH_URL
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Set this to your site&apos;s full URL:
                    </p>
                    <div className="bg-black/60 border border-cyan-500/10 rounded-lg px-3 py-2 mt-1.5 font-mono text-xs text-cyan-200/80">
                      NEXTAUTH_URL ={' '}
                      <span className="text-green-300">
                        https://spacebaddie.com
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <span className="bg-cyan-500/20 text-cyan-400 font-bold rounded-full w-7 h-7 flex items-center justify-center flex-shrink-0 text-sm">
                    3
                  </span>
                  <div>
                    <p className="text-white font-semibold text-sm">
                      Set up at least one social provider below
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Click &quot;Setup Instructions&quot; on any provider card
                      to see exactly how. After adding all vars,{' '}
                      <span className="text-cyan-400 font-semibold">
                        redeploy your site
                      </span>{' '}
                      for changes to take effect.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* All providers configured but core is fine */}
        {providerStatus &&
          providerStatus.coreConfigured &&
          configuredCount === 0 && (
            <div className="mb-8 bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3">
              <span className="text-amber-400 text-xl mt-0.5">⚠</span>
              <div className="flex-1">
                <p className="text-amber-300 font-semibold text-sm">
                  No Social Providers Set Up Yet
                </p>
                <p className="text-amber-300/80 text-sm mt-1">
                  Core auth is ready, but no social login providers have
                  credentials configured. Click &quot;Setup Instructions&quot; on
                  any provider card below to get started.
                </p>
              </div>
            </div>
          )}

        {/* Success banner */}
        {providerStatus && providerStatus.coreConfigured && anyConfigured && (
          <div className="mb-8 bg-green-500/10 border border-green-500/40 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-green-400 text-xl mt-0.5">✓</span>
            <div className="flex-1">
              <p className="text-green-300 font-semibold text-sm">
                Authentication is configured — {configuredCount} provider
                {configuredCount === 1 ? '' : 's'} ready
              </p>
              <p className="text-green-300/80 text-sm mt-1">
                Click &quot;Connect&quot; on any green provider card below to
                link your account.
              </p>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-red-400 text-xl mt-0.5">⚠</span>
            <div className="flex-1">
              <p className="text-red-300 font-semibold text-sm">
                Connection Failed
              </p>
              <p className="text-red-300/80 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 text-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading State */}
        {(loading || statusLoading) && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-cyan-300/70 mt-4">Loading…</p>
          </div>
        )}

        {/* Provider Cards */}
        {!loading && !statusLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {SOCIAL_PROVIDERS.map((provider) => {
              const connected = isConnected(provider.id)
              const configured = isProviderConfigured(provider.id)
              const connecting = connectingProvider === provider.id
              const callbackUrl =
                providerStatus?.providers[provider.id]?.callbackUrl
              const isExpanded = expandedSetup === provider.id

              return (
                <div
                  key={provider.id}
                  className={`relative rounded-2xl border ${
                    connected
                      ? 'border-green-500/50 bg-green-500/5'
                      : !configured
                        ? 'border-gray-600/40 bg-gray-800/20'
                        : provider.borderColor + ' ' + provider.bgColor
                  } backdrop-blur-sm p-6 transition-all duration-300 group`}
                >
                  {connected && (
                    <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1 text-xs text-green-400 font-semibold">
                      ✓ CONNECTED
                    </div>
                  )}

                  {!configured && !connected && (
                    <div className="absolute top-4 right-4 bg-yellow-500/20 border border-yellow-500/40 rounded-full px-3 py-1 text-xs text-yellow-400 font-semibold">
                      NOT CONFIGURED
                    </div>
                  )}

                  {configured && !connected && (
                    <div className="absolute top-4 right-4 bg-green-500/20 border border-green-500/40 rounded-full px-3 py-1 text-xs text-green-400 font-semibold">
                      ✓ READY
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                        !configured && !connected
                          ? 'from-gray-500 to-gray-700'
                          : provider.color
                      } flex items-center justify-center text-2xl text-white font-bold shadow-lg ${
                        !configured && !connected ? '' : provider.glowColor
                      } flex-shrink-0`}
                    >
                      {provider.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3
                        className={`text-xl font-bold ${
                          connected
                            ? 'text-green-400'
                            : !configured
                              ? 'text-gray-400'
                              : provider.textColor
                        }`}
                      >
                        {provider.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        {provider.description}
                      </p>

                      <div className="mt-4">
                        {connected ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-green-300 text-sm">
                              Ready for automation
                            </span>
                          </div>
                        ) : configured ? (
                          <button
                            onClick={() => handleConnect(provider.id)}
                            disabled={connecting}
                            className={`bg-gradient-to-r ${provider.color} hover:opacity-90 disabled:opacity-50 px-5 py-2.5 rounded-xl font-semibold text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${provider.glowColor} text-sm flex items-center gap-2`}
                          >
                            {connecting ? (
                              <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Connecting…
                              </>
                            ) : (
                              <>Connect {provider.name}</>
                            )}
                          </button>
                        ) : (
                          <p className="text-yellow-400/80 text-sm">
                            Credentials missing — see setup below
                          </p>
                        )}
                      </div>

                      {/* Setup toggle */}
                      <button
                        onClick={() =>
                          setExpandedSetup(isExpanded ? null : provider.id)
                        }
                        className="mt-3 text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors flex items-center gap-1"
                      >
                        <span
                          className={`transition-transform duration-200 inline-block ${isExpanded ? 'rotate-90' : ''}`}
                        >
                          ▶
                        </span>
                        {isExpanded
                          ? 'Hide Setup Instructions'
                          : 'Setup Instructions'}
                      </button>

                      {/* Expanded setup instructions */}
                      {isExpanded && (
                        <div className="mt-3 bg-black/40 border border-cyan-500/10 rounded-xl p-4 space-y-3">
                          <div className="space-y-2">
                            {provider.setupSteps.map((step, i) => (
                              <div
                                key={i}
                                className="flex items-start gap-2 text-xs"
                              >
                                <span className="text-cyan-400 font-bold flex-shrink-0">
                                  {i + 1}.
                                </span>
                                <span className="text-gray-300">{step}</span>
                              </div>
                            ))}
                          </div>

                          {callbackUrl && (
                            <div className="mt-2">
                              <p className="text-xs text-cyan-400/70 mb-1">
                                Callback URL (copy this exactly):
                              </p>
                              <div className="bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 font-mono text-xs text-green-300 break-all select-all">
                                {callbackUrl}
                              </div>
                            </div>
                          )}

                          <div className="mt-2">
                            <p className="text-xs text-cyan-400/70 mb-1">
                              Environment variables needed:
                            </p>
                            {provider.envVars.map((v) => (
                              <div
                                key={v}
                                className="bg-black/60 border border-cyan-500/10 rounded-lg px-3 py-1.5 font-mono text-xs text-cyan-200/80 mb-1"
                              >
                                {v}
                              </div>
                            ))}
                          </div>

                          <a
                            href={provider.consoleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors mt-1"
                          >
                            Open {provider.consoleName} ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Diagnostics Panel */}
        {!loading && !statusLoading && providerStatus && (
          <div className="mb-10">
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="text-sm text-cyan-400/60 hover:text-cyan-300 transition-colors flex items-center gap-2 mx-auto"
            >
              <span
                className={`transition-transform duration-200 inline-block ${showDiagnostics ? 'rotate-90' : ''}`}
              >
                ▶
              </span>
              {showDiagnostics ? 'Hide' : 'Show'} Diagnostics
            </button>

            {showDiagnostics && (
              <div className="mt-4 bg-black/60 border border-cyan-500/15 rounded-2xl p-6 font-mono text-xs space-y-2">
                <h4 className="text-cyan-400 font-bold text-sm mb-3 font-sans">
                  Configuration Diagnostics
                </h4>

                <DiagRow
                  label="NEXTAUTH_SECRET"
                  ok={providerStatus.debug.hasNextAuthSecret}
                />
                <DiagRow
                  label="NEXTAUTH_URL"
                  ok={providerStatus.debug.hasNextAuthUrl}
                />
                <DiagRow
                  label="VERCEL_URL (auto-detected)"
                  ok={providerStatus.debug.hasVercelUrl}
                />
                <DiagRow
                  label="Resolved Site URL"
                  ok={!!providerStatus.debug.resolvedUrl}
                  value={providerStatus.debug.resolvedUrl ?? 'NOT SET'}
                />
                <DiagRow
                  label="NODE_ENV"
                  ok
                  value={providerStatus.debug.nodeEnv}
                />

                <div className="border-t border-cyan-500/10 my-3" />

                {SOCIAL_PROVIDERS.map((p) => {
                  const info = providerStatus.providers[p.id]
                  return (
                    <DiagRow
                      key={p.id}
                      label={`${p.name} credentials`}
                      ok={info?.configured ?? false}
                    />
                  )
                })}

                <div className="border-t border-cyan-500/10 my-3" />

                <p className="text-gray-500 text-xs font-sans">
                  All environment variables must be set on your hosting platform
                  (Vercel, Netlify, etc.) — not in code. After adding or changing
                  variables, you must <strong>redeploy</strong> for changes to
                  take effect.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Environment Variables Reference */}
        {!loading && !statusLoading && (
          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 mb-10">
            <h3 className="text-2xl font-bold text-cyan-400 mb-2">
              ⚙ ENVIRONMENT VARIABLES REFERENCE
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              All of these must be set in{' '}
              <span className="text-cyan-400">
                Vercel → Settings → Environment Variables
              </span>
              . After adding, click <strong>Redeploy</strong>.
            </p>

            <div className="space-y-4 font-mono text-sm">
              {/* Core vars */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-cyan-300/70 text-xs uppercase tracking-wider font-sans">
                    Required — NextAuth Core
                  </span>
                  {providerStatus && (
                    <StatusBadge
                      ok={providerStatus.debug.hasNextAuthSecret}
                      label={
                        providerStatus.debug.hasNextAuthSecret
                          ? '✓ Set'
                          : '✗ Missing'
                      }
                    />
                  )}
                </div>
                <div className="bg-black/40 border border-cyan-500/10 rounded-lg px-4 py-2 text-cyan-200/80 mb-1">
                  NEXTAUTH_SECRET=<span className="text-yellow-300/60">&lt;random-string&gt;</span>
                </div>
                <div className="bg-black/40 border border-cyan-500/10 rounded-lg px-4 py-2 text-cyan-200/80">
                  NEXTAUTH_URL=<span className="text-green-300/60">https://spacebaddie.com</span>
                </div>
              </div>

              {/* Provider vars */}
              {SOCIAL_PROVIDERS.map((provider) => {
                const info = providerStatus?.providers[provider.id]
                return (
                  <div key={provider.id}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-cyan-300/70 text-xs uppercase tracking-wider font-sans">
                        {provider.name}
                      </span>
                      {info && (
                        <StatusBadge
                          ok={info.configured}
                          label={info.configured ? '✓ Set' : '✗ Missing'}
                        />
                      )}
                    </div>
                    {provider.envVars.map((v) => (
                      <div
                        key={v}
                        className="bg-black/40 border border-cyan-500/10 rounded-lg px-4 py-2 text-cyan-200/80 mb-1"
                      >
                        {v}=<span className="text-yellow-300/60">&lt;your-value&gt;</span>
                      </div>
                    ))}
                    {info?.callbackUrl && (
                      <div className="text-xs text-gray-500 mt-1 font-sans">
                        Callback URL:{' '}
                        <span className="text-cyan-400/70 font-mono">
                          {info.callbackUrl}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Back to Studio */}
        <div className="text-center pb-10">
          <a
            href="/"
            className="inline-block text-cyan-400 hover:text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 rounded-xl px-6 py-3 transition-all duration-200 text-sm font-semibold"
          >
            ← Back to Avatar Studio
          </a>
        </div>
      </main>
    </div>
  )
}

function DiagRow({
  label,
  ok,
  value,
}: {
  label: string
  ok: boolean
  value?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={ok ? 'text-green-400' : 'text-red-400'}>
        {ok ? '●' : '○'}
      </span>
      <span className="text-gray-300">{label}</span>
      {value && <span className="text-gray-500 ml-auto">{value}</span>}
    </div>
  )
}

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full ${
        ok
          ? 'bg-green-500/20 text-green-400'
          : 'bg-yellow-500/20 text-yellow-400'
      }`}
    >
      {label}
    </span>
  )
}
