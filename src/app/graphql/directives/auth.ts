import { getDirective, MapperKind, mapSchema } from '@graphql-tools/utils'
import { defaultFieldResolver } from 'graphql/execution/execute'

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
							// TODO

							return resolve(source, args, context, info)
						}
					}
				}
			},
		})
}
