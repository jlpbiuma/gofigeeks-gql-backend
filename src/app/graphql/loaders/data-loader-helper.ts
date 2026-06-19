import { Criteria } from '#/shared/domain/criteria/criteria'
import { Operator } from '#/shared/domain/criteria/filter-operator'
import { Filters } from '#/shared/domain/criteria/filters'

export class DataLoaderHelper {
	/**
	 * One to one loader
	 *
	 * @param {Object} params - Parameters object.
	 * @param {Array<{ obj: TEntry }>} params.entries - Array of entries to process.
	 * @param {string} params.joinField - The field name used to join entities.
	 * @param {{ search: (criteria: Criteria) => Promise<{ data: TEntity[] }> }} params.joinSearcher - Object with a `search` method returning entities.
	 * @param {string} [params.joinFieldResult] - Optional alternative field to match results.
	 * @param {string} [params.entryField='id.value'] - Field to extract the ID from the entry objects.
	 */
	static async load({
		entries,
		joinField,
		joinSearcher,
		joinFieldResult,
		entryField = 'id.value',
	}: {
		entries: readonly { obj: any }[]
		joinField: string
		joinSearcher: { search: (criteria: Criteria) => Promise<any[]> }
		joinFieldResult?: string
		entryField?: string
	}) {
		const ids = [
			...new Set(
				entries.map((entry) => this.#getProperty(entry.obj, entryField)),
			),
		]

		const criteria = Criteria.fromValues({
			filters: Filters.fromValues([
				{
					field: joinField,
					operator: Operator.IN,
					value: ids,
				},
			]),
		})

		const result = await joinSearcher.search(criteria)
		const entities = Object.fromEntries(
			result.map((entity) => [
				this.#getProperty(entity, joinFieldResult ?? joinField),
				entity,
			]),
		)

		const mappedResults = entries.map(
			(entry) => entities[this.#getProperty(entry.obj, entryField)],
		)

		return mappedResults
	}

	/**
	 * One to many loader
	 *
	 * @param {Object} params - Parameters object.
	 * @param {Array<{ obj: TEntry }>} params.entries - Array of entries to process.
	 * @param {string} params.joinField - The field name used to join entities.
	 * @param {{ search: (criteria: Criteria) => Promise<{ data: TEntity[] }> }} params.joinSearcher - Object with a `search` method returning entities.
	 * @param {string} [params.joinFieldResult] - Optional alternative field to match results.
	 * @param {string} [params.entryField='id.value'] - Field to extract the ID from the entry objects.
	 */
	static async loadMany({
		entries,
		joinField,
		joinSearcher,
		joinFieldResult,
		entryField = 'id.value',
	}: {
		entries: readonly { obj: any }[]
		joinField: string
		joinSearcher: { search: (criteria: Criteria) => Promise<any[]> }
		joinFieldResult?: string
		entryField?: string
	}) {
		const ids = [
			...new Set(
				entries.map((entry) => this.#getProperty(entry.obj, entryField)),
			),
		]

		const criteria = Criteria.fromValues({
			filters: Filters.fromValues([
				{
					field: joinField,
					operator: Operator.IN,
					value: ids,
				},
			]),
		})

		const result = await joinSearcher.search(criteria)
		const entities = result

		const mappedResults = ids.map((id) =>
			entities.filter(
				(entity) =>
					this.#getProperty(entity, joinFieldResult ?? joinField) == id,
			),
		)

		return mappedResults
	}

	static #getProperty(object: any, property: string) {
		return property.split('.').reduce((obj, prop) => obj[prop], object)
	}
}
