import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core'
import { users } from '#/auth/auth.schema'

export const tweets = pgTable('tweets', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    content: text('content').notNull(),
    likes: integer('likes').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
})
