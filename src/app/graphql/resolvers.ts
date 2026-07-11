import { resolvers as Scalars } from 'graphql-scalars'
import { DataLoaders } from './shared/data-loaders'
import { drizzleClient } from '#/shared/drizzle-client'
import { tweets } from '#/tweet/tweet.schema'
import { desc, eq } from 'drizzle-orm'
import { users } from '#/auth/auth.schema'



export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World!',
		tweets: async () => {
			const results = await drizzleClient
				.select()
				.from(tweets)
				.innerJoin(users, eq(tweets.userId, users.id))
				.orderBy(desc(tweets.createdAt))

			return results.map((row) => ({
				...row.tweets,
				author: row.users,
			}))
		},
	},
	// Mutation: {
	// 	// TODO
	// },
	...Scalars,
})
