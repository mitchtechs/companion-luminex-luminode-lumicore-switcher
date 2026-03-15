import type { CompanionFeedbackDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { parseGroups } from './config.js'
import * as Color from './colors.js'

export enum FeedbackId {
	SelectedInput = 'selected_input',
	GroupSelectedInput = 'group_selected_input',
	AllSelectedInput = 'all_selected_input',
}

function dmxValueToInput(value: number): number {
	if (value >= 8 && value <= 15) return 1
	if (value >= 16 && value <= 23) return 2
	if (value >= 24 && value <= 31) return 3
	if (value >= 32 && value <= 39) return 4
	return 0
}

export function UpdateFeedbacks(self: ModuleInstance): void {
	const numPE = self.config?.numProcessEngines ?? 4
	const groups = parseGroups(self.config?.groups ?? '[]')

	const inputChoices = [
		{ id: '1', label: 'Input 1' },
		{ id: '2', label: 'Input 2' },
		{ id: '3', label: 'Input 3' },
		{ id: '4', label: 'Input 4' },
	]

	const groupChoices = groups.map((g) => ({
		id: g.name,
		label: `${g.name} (PE ${g.engines.join(', ')})`,
	}))

	const feedbacks: CompanionFeedbackDefinitions = {
		[FeedbackId.SelectedInput]: {
			type: 'boolean',
			name: 'Process Engine Input Selected',
			description: 'Change style when a process engine is set to a specific input',
			defaultStyle: {
				bgcolor: Color.Green,
				color: Color.White,
			},
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
			callback: (feedback) => {
				const pe = Number(feedback.options.processEngine)
				const targetInput = Number(feedback.options.input)
				const currentValue = self.getEngineValue(pe)
				return dmxValueToInput(currentValue) === targetInput
			},
		},

		[FeedbackId.AllSelectedInput]: {
			type: 'boolean',
			name: 'ALL Engines Input Selected',
			description: 'Change style when all process engines are set to the same input',
			defaultStyle: {
				bgcolor: Color.Green,
				color: Color.White,
			},
			options: [
				{
					type: 'dropdown',
					id: 'input',
					label: 'Input',
					default: '1',
					choices: inputChoices,
				},
			],
			callback: (feedback) => {
				const targetInput = Number(feedback.options.input)
				const num = self.config?.numProcessEngines ?? 4
				for (let pe = 1; pe <= num; pe++) {
					if (dmxValueToInput(self.getEngineValue(pe)) !== targetInput) {
						return false
					}
				}
				return true
			},
		},
	}

	// Only add group feedback if groups are defined
	if (groups.length > 0) {
		feedbacks[FeedbackId.GroupSelectedInput] = {
			type: 'boolean',
			name: 'Group Input Selected',
			description: 'Change style when all process engines in a group are set to a specific input',
			defaultStyle: {
				bgcolor: Color.Cyan,
				color: Color.Black,
			},
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
			callback: (feedback) => {
				const groupName = String(feedback.options.group)
				const targetInput = Number(feedback.options.input)
				const group = groups.find((g) => g.name === groupName)
				if (!group) return false
				return group.engines.every((pe) => dmxValueToInput(self.getEngineValue(pe)) === targetInput)
			},
		}
	}

	self.setFeedbackDefinitions(feedbacks)
}
