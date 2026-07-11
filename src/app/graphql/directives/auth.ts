import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { defaultFieldResolver, GraphQLError } from 'graphql'

const directiveName = 'auth'

export function auth() {
	return (schema: any) =>
		mapSchema(schema, {
			[MapperKind.OBJECT_FIELD]: (fieldConfig, _fieldName, typeName) => {
				const authDirective = getDirective(
					schema,
					fieldConfig,
					directiveName,
				)?.[0]

				if (authDirective) {
					const { requires: enabledRoles } = authDirective

					if (enabledRoles) {
						const { resolve = defaultFieldResolver } = fieldConfig

						fieldConfig.resolve = async (source, args, context, info) => {
							// 1. Obtener la sesión pre-resuelta del contexto global
							const session = context.session

							// 2. Si no hay sesión, rechazar con un error de autenticación
							if (!session) {
								throw new GraphQLError('No autenticado', {
									extensions: { code: 'UNAUTHENTICATED' },
								})
							}

							// 3. Validar el rol del usuario (normalizándolo a mayúsculas para comparar con el enum de GraphQL)
							const userRole = (session.user.role || 'user').toUpperCase()
							if (enabledRoles && !enabledRoles.includes(userRole)) {
								throw new GraphQLError('No autorizado (rol insuficiente)', {
									extensions: { code: 'FORBIDDEN' },
								})
							}

							return resolve(source, args, context, info)
						}
					}
				}
			},
		})
}
