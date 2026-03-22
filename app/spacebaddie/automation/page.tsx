'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

interface ConnectedAccount {
  provider: string
  name: string
  connectedAt: string
}

interface ProviderStatus {
  providers: Record<string, boolean>
  coreConfigured: boolean
  missingCore: string[]
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
  },
] as const

export default function AutomationPage() {
  const { data: session, status } = useSession()
  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([])
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [providerStatus, setProviderStatus] = useState<ProviderStatus | null>(null)
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
    fetch('/api/auth/providers-status')
      .then((r) => r.json())
      .then((data: ProviderStatus) => setProviderStatus(data))
      .catch(() => {
        /* status endpoint unavailable, allow all attempts */
      })
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const errorParam = params.get('error')
      if (errorParam) {
        const messages: Record<string, string> = {
          OAuthSignin: 'Could not start the sign-in flow. The provider may not be configured — check that OAuth credentials are set in your environment variables.',
          OAuthCallback: 'Authentication callback failed. The provider may have rejected the request.',
          OAuthCreateAccount: 'Could not create a linked account. Please try again.',
          Callback: 'Something went wrong during sign-in. Please try again.',
          OAuthAccountNotLinked: 'This email is already linked to another provider. Sign in with that provider first.',
          AccessDenied: 'Access was denied. You may have cancelled the login or lack permission.',
          Configuration: 'Server configuration issue — OAuth credentials may be missing. See the setup guide below.',
          default: 'An unexpected error occurred. Please try again.',
        }
        setError(messages[errorParam] ?? messages.default)
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
      if (providerStatus && !providerStatus.providers[providerId]) {
        setError(
          `${SOCIAL_PROVIDERS.find((p) => p.id === providerId)?.name ?? providerId} is not configured yet. Add the required OAuth credentials to your environment variables (see setup guide below).`
        )
        return
      }
      if (providerStatus && !providerStatus.coreConfigured) {
        setError(
          `Core authentication is not configured. Missing: ${providerStatus.missingCore.join(', ')}. Add these to your environment variables.`
        )
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
    !providerStatus || providerStatus.providers[providerId]

  const loading = status === 'loading'

  const configuredCount = providerStatus
    ? Object.values(providerStatus.providers).filter(Boolean).length
    : null

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

        {/* Credentials Status Banner */}
        {providerStatus && !providerStatus.coreConfigured && (
          <div className="mb-8 bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-yellow-400 text-xl mt-0.5">🔑</span>
            <div className="flex-1">
              <p className="text-yellow-300 font-semibold text-sm">
                Core Configuration Missing
              </p>
              <p className="text-yellow-300/80 text-sm mt-1">
                The following environment variables are required:{' '}
                <span className="font-mono">
                  {providerStatus.missingCore.join(', ')}
                </span>
                . Set them in your deployment environment (e.g. Vercel &gt;
                Settings &gt; Environment Variables).
              </p>
            </div>
          </div>
        )}

        {providerStatus && configuredCount === 0 && (
          <div className="mb-8 bg-amber-500/10 border border-amber-500/40 rounded-2xl p-4 flex items-start gap-3">
            <span className="text-amber-400 text-xl mt-0.5">⚠</span>
            <div className="flex-1">
              <p className="text-amber-300 font-semibold text-sm">
                No OAuth Providers Configured
              </p>
              <p className="text-amber-300/80 text-sm mt-1">
                None of the social login providers have credentials set up yet.
                Social logins will not work until you add the OAuth client ID
                and secret for at least one provider. Scroll down to the setup
                guide for instructions.
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
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-cyan-300/70 mt-4">Loading session…</p>
          </div>
        )}

        {/* Provider Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {SOCIAL_PROVIDERS.map((provider) => {
              const connected = isConnected(provider.id)
              const configured = isProviderConfigured(provider.id)
              const connecting = connectingProvider === provider.id

              return (
                <div
                  key={provider.id}
                  className={`relative rounded-2xl border ${
                    connected
                      ? 'border-green-500/50 bg-green-500/5'
                      : !configured
                        ? 'border-gray-600/40 bg-gray-800/20 opacity-75'
                        : provider.borderColor + ' ' + provider.bgColor
                  } backdrop-blur-sm p-6 transition-all duration-300 hover:scale-[1.02] group`}
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
                        ) : !configured ? (
                          <p className="text-yellow-400/80 text-sm">
                            Add OAuth credentials to enable this provider
                          </p>
                        ) : (
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
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Setup Instructions */}
        {!loading && (
          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-cyan-500/20 rounded-2xl p-8 mb-10">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">
              ⚙ SETUP GUIDE
            </h3>
            <p className="text-gray-300 mb-6">
              To connect your social accounts, you need OAuth credentials for
              each platform. Set them in your environment variables (e.g. Vercel
              &gt; Settings &gt; Environment Variables):
            </p>

            <div className="space-y-3 font-mono text-sm">
              {[
                {
                  label: 'YouTube / Google',
                  id: 'google',
                  vars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
                  link: 'https://console.cloud.google.com/apis/credentials',
                },
                {
                  label: 'Twitter / X',
                  id: 'twitter',
                  vars: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
                  link: 'https://developer.twitter.com/en/portal/projects-and-apps',
                },
                {
                  label: 'Instagram',
                  id: 'instagram',
                  vars: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
                  link: 'https://developers.facebook.com/apps/',
                },
                {
                  label: 'TikTok',
                  id: 'tiktok',
                  vars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
                  link: 'https://developers.tiktok.com/',
                },
                {
                  label: 'NextAuth (required)',
                  id: 'core',
                  vars: ['NEXTAUTH_SECRET', 'NEXTAUTH_URL'],
                  link: '',
                },
              ].map((group) => {
                const configured =
                  group.id === 'core'
                    ? providerStatus?.coreConfigured
                    : providerStatus?.providers[group.id]

                return (
                  <div key={group.label} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300/70 text-xs uppercase tracking-wider">
                        {group.label}
                      </span>
                      {providerStatus && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            configured
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {configured ? '✓ Ready' : '✗ Missing'}
                        </span>
                      )}
                    </div>
                    {group.link && (
                      <a
                        href={group.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400/60 text-xs hover:text-cyan-300 transition-colors"
                      >
                        {group.link} ↗
                      </a>
                    )}
                    {group.vars.map((v) => (
                      <div
                        key={v}
                        className="bg-black/40 border border-cyan-500/10 rounded-lg px-4 py-2 text-cyan-200/80"
                      >
                        {v}=&lt;your-value&gt;
                      </div>
                    ))}
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
