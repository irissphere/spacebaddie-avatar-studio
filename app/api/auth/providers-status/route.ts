import { NextResponse } from 'next/server'
import { resolveSiteUrl } from '@/lib/auth'

const providerCredentials: Record<string, { envVars: string[]; callbackPath: string }> = {
  google: {
    envVars: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
    callbackPath: '/api/auth/callback/google',
  },
  twitter: {
    envVars: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
    callbackPath: '/api/auth/callback/twitter',
  },
  instagram: {
    envVars: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
    callbackPath: '/api/auth/callback/instagram',
  },
  tiktok: {
    envVars: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
    callbackPath: '/api/auth/callback/tiktok',
  },
}

function isConfigured(envVars: string[]): boolean {
  return envVars.every((v) => {
    const val = process.env[v]
    return val !== undefined && val !== ''
  })
}

export async function GET() {
  const siteUrl = resolveSiteUrl()
  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
  const hasNextAuthUrl = !!process.env.NEXTAUTH_URL
  const hasVercelUrl = !!process.env.VERCEL_URL

  const providers: Record<
    string,
    { configured: boolean; callbackUrl: string | null }
  > = {}

  for (const [provider, config] of Object.entries(providerCredentials)) {
    providers[provider] = {
      configured: isConfigured(config.envVars),
      callbackUrl: siteUrl ? `${siteUrl}${config.callbackPath}` : null,
    }
  }

  const missingCore: string[] = []
  if (!hasNextAuthSecret) missingCore.push('NEXTAUTH_SECRET')
  if (!hasNextAuthUrl && !hasVercelUrl) missingCore.push('NEXTAUTH_URL')

  return NextResponse.json({
    providers,
    siteUrl: siteUrl ?? null,
    coreConfigured: hasNextAuthSecret && (hasNextAuthUrl || hasVercelUrl),
    missingCore,
    debug: {
      hasNextAuthSecret,
      hasNextAuthUrl,
      hasVercelUrl,
      resolvedUrl: siteUrl ?? null,
      nodeEnv: process.env.NODE_ENV ?? 'unknown',
    },
  })
}
