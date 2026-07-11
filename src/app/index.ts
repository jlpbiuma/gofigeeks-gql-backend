import './env'

import { renderApolloSandbox } from '@graphql-yoga/render-apollo-sandbox'
import { createYoga } from 'graphql-yoga'
import { createServer } from 'node:http'
import { schema } from './graphql/schema'
import { DataLoaders } from './graphql/shared/data-loaders'
import { auth } from '#/shared/auth'

const RESPONSE_HEADERS = new WeakMap<Request, [string, string][]>()

const yoga = createYoga({
	schema,
	async context(ctx) {
		const loaders = DataLoaders.createContext()

		const setCookie = (key: string, value: string) => {
			const headers = RESPONSE_HEADERS.get(ctx.request) || []
			headers.push([key, value])
			RESPONSE_HEADERS.set(ctx.request, headers)
		}

		// Resolver la sesión de better-auth una única vez por petición
		const session = await auth.api.getSession({
			headers: ctx.request.headers,
		})

		return {
			...loaders,
			headers: ctx.request.headers,
			setCookie,
			session,
			user: session?.user ?? null,
		}
	},
	plugins: [
		{
			onResponse({ request, response }) {
				const headers = RESPONSE_HEADERS.get(request)
				if (headers) {
					for (const [key, value] of headers) {
						response.headers.append(key, value)
					}
				}
			},
		},
	],
	renderGraphiQL: renderApolloSandbox({
		initialState: {
			includeCookies: true,
		},
	}),
})


const server = createServer(yoga)

server.listen(4000, () => {
	console.info('Server is running on http://localhost:4000/graphql')
})
