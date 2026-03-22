import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import TwitterProvider from 'next-auth/providers/twitter'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtube.upload',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID ?? '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET ?? '',
      version: '2.0',
    }),
    {
      id: 'tiktok',
      name: 'TikTok',
      type: 'oauth',
      clientId: process.env.TIKTOK_CLIENT_KEY ?? '',
      clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? '',
      authorization: {
        url: 'https://www.tiktok.com/v2/auth/authorize/',
        params: {
          scope: 'user.info.basic,video.list',
          response_type: 'code',
        },
      },
      token: 'https://open.tiktokapis.com/v2/oauth/token/',
      userinfo: 'https://open.tiktokapis.com/v2/user/info/',
      profile(profile) {
        return {
          id: profile.data?.user?.open_id ?? profile.open_id ?? 'unknown',
          name: profile.data?.user?.display_name ?? 'TikTok User',
          image: profile.data?.user?.avatar_url ?? null,
        }
      },
    },
    {
      id: 'instagram',
      name: 'Instagram',
      type: 'oauth',
      clientId: process.env.INSTAGRAM_CLIENT_ID ?? '',
      clientSecret: process.env.INSTAGRAM_CLIENT_SECRET ?? '',
      authorization: {
        url: 'https://api.instagram.com/oauth/authorize',
        params: {
          scope: 'user_profile,user_media',
          response_type: 'code',
        },
      },
      token: 'https://api.instagram.com/oauth/access_token',
      userinfo: 'https://graph.instagram.com/me?fields=id,username',
      profile(profile) {
        return {
          id: profile.id,
          name: profile.username ?? 'Instagram User',
          image: null,
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.provider = account.provider
        token.providerAccountId = account.providerAccountId
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.accessToken as string | undefined,
        provider: token.provider as string | undefined,
      }
    },
  },
  pages: {
    signIn: '/spacebaddie/automation',
    error: '/spacebaddie/automation',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
