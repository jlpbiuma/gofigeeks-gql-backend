import { resolvers as Scalars } from 'graphql-scalars'
import { DataLoaders } from './shared/data-loaders'
import { drizzleClient } from '#/shared/drizzle-client'
import { tweets } from '#/tweet/tweet.schema'
import { desc } from 'drizzle-orm'

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World!',
		tweets: () => {
			return drizzleClient.select().from(tweets).orderBy(desc(tweets.createdAt))
		},
	},
	// Mutation: {
	// 	// TODO
	// },
	...Scalars,
})
