import * as schema from '#/auth/auth.schema'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { admin } from 'better-auth/plugins'
import { drizzleClient } from './drizzle-client'

export const auth = betterAuth({
	database: drizzleAdapter(drizzleClient, {
		provider: 'pg',
		schema,
		usePlural: true,
	}),
	baseURL: 'http://localhost:4000',
	emailAndPassword: {
		enabled: true,
	},
	plugins: [admin()],
	user: {
		additionalFields: {
			biography: {
				type: 'string',
				required: false,
			},
		},
	},
})
