import { resolvers as Scalars } from 'graphql-scalars'
import { DataLoaders } from './shared/data-loaders'

export const resolvers = DataLoaders.appendResolvers({
	Query: {
		hello: () => 'Hello World!',
	},
	// Mutation: {
	// 	// TODO
	// },
	...Scalars,
})
