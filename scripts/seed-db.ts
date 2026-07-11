import '@/env'

import { auth } from '#/shared/auth'
import { drizzleClient } from '#/shared/drizzle-client'
import { reset } from 'drizzle-seed'
import * as authSchema from '../src/contexts/auth/auth.schema'
import * as tweetSchema from '../src/contexts/tweet/tweet.schema'
import { users } from './seed/users'
import { tweets as tweetsTable } from '../src/contexts/tweet/tweet.schema'
import { tweets } from './seed/tweets'

const schema = { ...authSchema, ...tweetSchema }

console.log('Resetting database...')

await reset(drizzleClient, schema)

console.log('Seeding initial users...')

await Promise.all(
	users.map((user) =>
		auth.api.createUser({
			body: {
				email: user.email,
				password: user.password,
				name: user.name,
				role: user.role,
				data: { biography: user.biography },
			},
		}),
	),
)

console.log('Seeding initial tweets...')
await drizzleClient.insert(tweetsTable).values(tweets)

console.log('Seed completed successfully!')
process.exit(0)
