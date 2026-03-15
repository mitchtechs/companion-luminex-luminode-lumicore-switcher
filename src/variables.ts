import type { CompanionVariableDefinition } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { parseGroups } from './config.js'

export function UpdateVariableDefinitions(self: ModuleInstance): void {
	const numPE = self.config?.numProcessEngines ?? 4
	const groups = parseGroups(self.config?.groups ?? '[]')

	const variables: CompanionVariableDefinition[] = []

	// Per-engine variables
	for (let i = 1; i <= numPE; i++) {
		variables.push(
			{ variableId: `pe_${i}_selected_input`, name: `PE ${i} Selected Input` },
			{ variableId: `pe_${i}_dmx_value`, name: `PE ${i} DMX Value` },
			{ variableId: `pe_${i}_channel`, name: `PE ${i} Control Channel` },
		)
	}

	// Group variables
	for (const group of groups) {
		const safeId = group.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
		variables.push({
			variableId: `group_${safeId}_selected_input`,
			name: `Group "${group.name}" Selected Input`,
		})
	}

	self.setVariableDefinitions(variables)
}

export function dmxValueToInputName(value: number): string {
	if (value >= 8 && value <= 15) return 'Input 1'
	if (value >= 16 && value <= 23) return 'Input 2'
	if (value >= 24 && value <= 31) return 'Input 3'
	if (value >= 32 && value <= 39) return 'Input 4'
	return 'None'
}

export function updateAllVariables(self: ModuleInstance): void {
	const numPE = self.config?.numProcessEngines ?? 4
	const baseChannel = self.config?.baseChannel ?? 1
	const groups = parseGroups(self.config?.groups ?? '[]')
	const vars: Record<string, string | number> = {}

	for (let i = 1; i <= numPE; i++) {
		const dmxValue = self.getEngineValue(i)
		vars[`pe_${i}_selected_input`] = dmxValueToInputName(dmxValue)
		vars[`pe_${i}_dmx_value`] = dmxValue
		vars[`pe_${i}_channel`] = baseChannel + (i - 1)
	}

	for (const group of groups) {
		const safeId = group.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
		const inputNames = new Set(group.engines.map((pe) => dmxValueToInputName(self.getEngineValue(pe))))
		vars[`group_${safeId}_selected_input`] = inputNames.size === 1 ? [...inputNames][0] : 'Mixed'
	}

	self.setVariableValues(vars)
}
