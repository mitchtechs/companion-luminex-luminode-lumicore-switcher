import type { CompanionActionDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { inputValue, type InputNumber } from './artnet.js'
import { parseGroups } from './config.js'

export enum ActionId {
	SwitchInput = 'switch_input',
	SwitchGroupInput = 'switch_group_input',
	SwitchAllInput = 'switch_all_input',
}

export function UpdateActions(self: ModuleInstance): void {
	const inputChoices = [
		{ id: '1', label: 'Input 1' },
		{ id: '2', label: 'Input 2' },
		{ id: '3', label: 'Input 3' },
		{ id: '4', label: 'Input 4' },
	]

	const numPE = self.config?.numProcessEngines ?? 4
	const groups = parseGroups(self.config?.groups ?? '[]')

	const groupChoices = groups.map((g) => ({
		id: g.name,
		label: `${g.name} (PE ${g.engines.join(', ')})`,
	}))

	const actions: CompanionActionDefinitions = {
		[ActionId.SwitchInput]: {
			name: 'Switch Process Engine Input',
			description: 'Switch a single process engine to a specific input',
			options: [
				{
					type: 'number',
					id: 'processEngine',
					label: 'Process Engine',
					tooltip: 'Process engine number (1-based)',
					default: 1,
					min: 1,
					max: numPE,
				},
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					default: '1',
					choices: inputChoices,
				},
			],
			callback: (action) => {
				const pe = Number(action.options.processEngine)
				const input = Number(action.options.input) as InputNumber
				self.switchEngine(pe, input)
			},
		},

		[ActionId.SwitchAllInput]: {
			name: 'Switch ALL Process Engines',
			description: 'Switch all process engines to the same input',
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					default: '1',
					choices: inputChoices,
				},
			],
			callback: (action) => {
				const input = Number(action.options.input) as InputNumber
				const num = self.config?.numProcessEngines ?? 4
				const value = inputValue(input)
				for (let pe = 1; pe <= num; pe++) {
					self.setEngineValue(pe, value)
				}
				self.transmit()
			},
		},
	}

	// Only add group action if groups are defined
	if (groups.length > 0) {
		actions[ActionId.SwitchGroupInput] = {
			name: 'Switch Group Input',
			description: 'Switch all process engines in a group to a specific input',
			options: [
				{
					type: 'dropdown',
					id: 'group',
					label: 'Group',
					default: groups[0]?.name ?? '',
					choices: groupChoices,
				},
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					default: '1',
					choices: inputChoices,
				},
			],
			callback: (action) => {
				const groupName = String(action.options.group)
				const input = Number(action.options.input) as InputNumber
				const group = groups.find((g) => g.name === groupName)
				if (!group) return
				const value = inputValue(input)
				for (const pe of group.engines) {
					self.setEngineValue(pe, value)
				}
				self.transmit()
			},
		}
	}

	self.setActionDefinitions(actions)
}
