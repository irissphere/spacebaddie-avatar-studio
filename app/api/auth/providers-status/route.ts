import { NextResponse } from 'next/server'

const providerCredentials: Record<string, string[]> = {
  google: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'],
  twitter: ['TWITTER_CLIENT_ID', 'TWITTER_CLIENT_SECRET'],
  instagram: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET'],
  tiktok: ['TIKTOK_CLIENT_KEY', 'TIKTOK_CLIENT_SECRET'],
}

function isConfigured(envVars: string[]): boolean {
  return envVars.every((v) => {
    const val = process.env[v]
    return val !== undefined && val !== ''
  })
}

export async function GET() {
  const status: Record<string, boolean> = {}
  for (const [provider, vars] of Object.entries(providerCredentials)) {
    status[provider] = isConfigured(vars)
  }

  const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
  const hasNextAuthUrl = !!process.env.NEXTAUTH_URL

  return NextResponse.json({
    providers: status,
    coreConfigured: hasNextAuthSecret && hasNextAuthUrl,
    missingCore: [
      ...(!hasNextAuthSecret ? ['NEXTAUTH_SECRET'] : []),
      ...(!hasNextAuthUrl ? ['NEXTAUTH_URL'] : []),
    ],
  })
}
