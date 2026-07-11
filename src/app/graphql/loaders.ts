import { inArray } from 'drizzle-orm'
import { drizzleClient } from '#/shared/drizzle-client'
import { users } from '#/auth/auth.schema'

export const loaders = {
    Tweet: {
        author: async (entries: { obj: any }[]) => {
            // 1. Extraemos los userIds únicos de todos los tweets cargados
            const userIds = entries.map((entry) => entry.obj.userId)
            if (userIds.length === 0) return []

            // 2. Buscamos los usuarios en la base de datos con una sola consulta
            const dbUsers = await drizzleClient
                .select()
                .from(users)
                .where(inArray(users.id, userIds))

            // 3. Mapeamos los usuarios a un diccionario para recuperarlos rápidamente
            const usersMap = new Map(dbUsers.map((user) => [user.id, user]))

            // 4. Retornamos los usuarios en el mismo orden exacto que vinieron los tweets
            return entries.map((entry) => {
                const user = usersMap.get(entry.obj.userId)
                if (!user) {
                    throw new Error(`User not found for id ${entry.obj.userId}`)
                }
                return user
            })
        },
    },
}
