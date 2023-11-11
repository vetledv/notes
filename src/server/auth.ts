import { PrismaAdapter } from '@auth/prisma-adapter'
import NextAuth from 'next-auth'
import Discord from 'next-auth/providers/discord'

import { env } from '~/env.mjs'
import { db } from '~/server/db'

export const {
	auth,
	handlers: { GET, POST },
	signIn,
	signOut
} = NextAuth({
	adapter: PrismaAdapter(db),
	providers: [
		Discord({
			clientId: env.DISCORD_CLIENT_ID,
			clientSecret: env.DISCORD_CLIENT_SECRET
		})
	],
	callbacks: {
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id
			}
		})
	},
	pages: {
		signIn: '/login'
	}
})
