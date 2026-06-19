import { Criteria } from '#/shared/domain/criteria/criteria'
import { Operator } from '#/shared/domain/criteria/filter-operator'
import { Filters } from '#/shared/domain/criteria/filters'

export class CountLoaderHelper {
	/**
	 * Count loader: for each entry, returns the count of related entities.
	 *
	 * @param {Object} params - Parameters object.
	 * @param {Array<{ obj: TEntry }>} params.entries - Array of entries to process.
	 * @param {string} params.joinField - The field name in the related entity to filter by.
	 * @param {{ count: (criteria: Criteria) => Promise<number> }} params.counter - Object with a `count` method.
	 * @param {string} [params.entryField='id.value'] - Field path to extract the ID from entry objects.
	 */
	static async loadCount({
		entries,
		joinField,
		counter,
		entryField = 'id.value',
	}: {
		entries: readonly { obj: any }[]
		joinField: string
		counter: { count: (criteria: Criteria) => Promise<number> }
		entryField?: string
	}): Promise<number[]> {
		const ids = [
			...new Set(
				entries.map((entry) => this.#getProperty(entry.obj, entryField)),
			),
		]

		const counts = await Promise.all(
			ids.map((id) =>
				counter.count(
					Criteria.fromValues({
						filters: Filters.fromValues([
							{ field: joinField, operator: Operator.EQUALS, value: id },
						]),
					}),
				),
			),
		)

		const countMap = Object.fromEntries(ids.map((id, i) => [id, counts[i]]))

		return entries.map(
			(entry) => countMap[this.#getProperty(entry.obj, entryField)] ?? 0,
		)
	}

	static #getProperty(object: any, property: string) {
		return property.split('.').reduce((obj, prop) => obj[prop], object)
	}
}
