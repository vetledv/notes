import { type GetServerSidePropsContext } from 'next'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { getServerSession, type NextAuthOptions } from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

import { env } from '~/env.mjs'
import { prisma } from '~/server/db'

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	providers: [
		DiscordProvider({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET
		})
	],
	callbacks: {
		// Include user.id on session
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id
			}
			return session
		}
	},
	pages: {
		signIn: '/login'
	}
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
	req: GetServerSidePropsContext['req']
	res: GetServerSidePropsContext['res']
}) => {
	return getServerSession(ctx.req, ctx.res, authOptions)
}
