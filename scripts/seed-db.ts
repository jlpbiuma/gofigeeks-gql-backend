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


const dbUsers = await drizzleClient.select().from(authSchema.users)

const tweetsWithUserId = tweets.map((tweet) => {
	const user = dbUsers.find((u) => u.email === tweet.userEmail)
	if (!user) throw new Error(`User not found for email ${tweet.userEmail}`)
	return {
		content: tweet.content,
		likes: tweet.likes,
		userId: user.id,
	}
})

console.log('Seeding initial tweets...')
await drizzleClient.insert(tweetsTable).values(tweetsWithUserId)




console.log('Seed completed successfully!')
process.exit(0)
