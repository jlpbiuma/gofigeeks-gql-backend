import { resolvers as Scalars } from 'graphql-scalars'
import { DataLoaders } from './shared/data-loaders'
import { drizzleClient } from '#/shared/drizzle-client'
import { tweets } from '#/tweet/tweet.schema'
import { desc } from 'drizzle-orm'
import { auth } from '#/shared/auth'
import { GraphQLError } from 'graphql'

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World!',
		tweets: async () => {
			return drizzleClient.select().from(tweets).orderBy(desc(tweets.createdAt))

		},
	},
	Mutation: {
		signIn: async (_, { email, password }, context: any) => {
			const res = await auth.api.signInEmail({
				body: { email, password },
				headers: context.headers,
				asResponse: true,
			})

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}))
				throw new GraphQLError(errorData.message || 'Error de autenticación', {
					extensions: { code: 'UNAUTHENTICATED' },
				})
			}

			for (const [key, value] of res.headers.entries()) {
				if (key.toLowerCase() === 'set-cookie') {
					context.setCookie(key, value)
				}
			}

			const { user } = await res.json()
			return user
		},
		signOut: async (_, __, context: any) => {
			const res = await auth.api.signOut({
				headers: context.headers,
				asResponse: true,
			})

			if (!res.ok) {
				const errorData = await res.json().catch(() => ({}))
				throw new GraphQLError(errorData.message || 'Error al cerrar sesión', {
					extensions: { code: 'BAD_REQUEST' },
				})
			}

			for (const [key, value] of res.headers.entries()) {
				if (key.toLowerCase() === 'set-cookie') {
					context.setCookie(key, value)
				}
			}
			return true
		},
		createTweet: async (_, { content }, context: any) => {
			if (!content || content.trim() === '') {
				throw new GraphQLError('El contenido del tweet no puede estar vacío', {
					extensions: { code: 'BAD_USER_INPUT' },
				})
			}
			const user = context.session?.user
			if (!user) {
				throw new GraphQLError('No autenticado', {
					extensions: { code: 'UNAUTHENTICATED' },
				})
			}
			const [newTweet] = await drizzleClient
				.insert(tweets)
				.values({
					content,
					userId: user.id,
				})
				.returning()
			return newTweet
		},
	},
	...Scalars,
})

