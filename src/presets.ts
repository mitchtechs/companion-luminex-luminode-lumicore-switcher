import type { CompanionPresetDefinitions } from '@companion-module/base'
import type { ModuleInstance } from './main.js'
import { ActionId } from './actions.js'
import { FeedbackId } from './feedbacks.js'
import { parseGroups } from './config.js'
import * as Color from './colors.js'

const INPUT_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣']
const INPUT_LABELS = ['Input 1', 'Input 2', 'Input 3', 'Input 4']

const INPUT_BG: Record<number, number> = {
	1: Color.Input1Bg,
	2: Color.Input2Bg,
	3: Color.Input3Bg,
	4: Color.Input4Bg,
}

const INPUT_GROUP_BG: Record<number, number> = {
	1: Color.Input1Group,
	2: Color.Input2Group,
	3: Color.Input3Group,
	4: Color.Input4Group,
}

const INPUT_FEEDBACK_COLORS: Record<number, number> = {
	1: Color.Green,
	2: Color.Blue,
	3: Color.Orange,
	4: Color.Purple,
}

export function UpdatePresets(self: ModuleInstance): void {
	const presets: CompanionPresetDefinitions = {}
	const label = self.label
	const numPE = self.config?.numProcessEngines ?? 4
	const groups = parseGroups(self.config?.groups ?? '[]')

	// ──────────────── Per Process Engine ────────────────

	for (let pe = 1; pe <= numPE; pe++) {
		// Status display
		presets[`pe_${pe}_status`] = {
			type: 'button',
			category: `PE ${pe}`,
			name: `PE ${pe} Current Input`,
			style: {
				text: `PE${pe}\\n$(${label}:pe_${pe}_selected_input)\\nStatus`,
				size: 'auto',
				color: Color.White,
				bgcolor: Color.DarkGrey,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}

		// Input selection buttons
		for (let input = 1; input <= 4; input++) {
			presets[`pe_${pe}_input_${input}`] = {
				type: 'button',
				category: `PE ${pe}`,
				name: `PE ${pe}: ${INPUT_LABELS[input - 1]}`,
				style: {
					text: `${INPUT_EMOJIS[input - 1]} PE${pe}\\n${INPUT_LABELS[input - 1]}`,
					size: 'auto',
					color: Color.White,
					bgcolor: INPUT_BG[input],
				},
				steps: [
					{
						down: [
							{
								actionId: ActionId.SwitchInput,
								options: { processEngine: pe, input: String(input) },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FeedbackId.SelectedInput,
						options: { processEngine: pe, input: String(input) },
						style: { bgcolor: INPUT_FEEDBACK_COLORS[input], color: Color.White },
					},
				],
			}
		}
	}

	// ──────────────── Groups ────────────────

	for (const group of groups) {
		const catName = `Group: ${group.name}`

		// Group status display
		const safeId = group.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
		presets[`group_${safeId}_status`] = {
			type: 'button',
			category: catName,
			name: `${group.name} Current Input`,
			style: {
				text: `🔀 ${group.name}\\n$(${label}:group_${safeId}_selected_input)\\nStatus`,
				size: 'auto',
				color: Color.White,
				bgcolor: Color.Teal,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}

		// Input selection buttons for group
		for (let input = 1; input <= 4; input++) {
			presets[`group_${safeId}_input_${input}`] = {
				type: 'button',
				category: catName,
				name: `${group.name}: ${INPUT_LABELS[input - 1]}`,
				style: {
					text: `🔀 ${INPUT_EMOJIS[input - 1]}\\n${group.name}\\n${INPUT_LABELS[input - 1]}`,
					size: 'auto',
					color: Color.White,
					bgcolor: INPUT_GROUP_BG[input],
				},
				steps: [
					{
						down: [
							{
								actionId: ActionId.SwitchGroupInput,
								options: { group: group.name, input: String(input) },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: FeedbackId.GroupSelectedInput,
						options: { group: group.name, input: String(input) },
						style: { bgcolor: INPUT_FEEDBACK_COLORS[input], color: Color.White },
					},
				],
			}
		}
	}

	// ──────────────── All Engines ────────────────

	// All engines status
	presets['all_status'] = {
		type: 'button',
		category: 'All Engines',
		name: 'All Engines Status',
		style: {
			text: `📡 ALL\\n${numPE} Engines`,
			size: 'auto',
			color: Color.White,
			bgcolor: Color.DarkGrey,
		},
		steps: [{ down: [], up: [] }],
		feedbacks: [],
	}

	// All engines input selection
	for (let input = 1; input <= 4; input++) {
		presets[`all_input_${input}`] = {
			type: 'button',
			category: 'All Engines',
			name: `ALL: ${INPUT_LABELS[input - 1]}`,
			style: {
				text: `📡 ${INPUT_EMOJIS[input - 1]}\\nALL\\n${INPUT_LABELS[input - 1]}`,
				size: 'auto',
				color: Color.White,
				bgcolor: INPUT_BG[input],
			},
			steps: [
				{
					down: [
						{
							actionId: ActionId.SwitchAllInput,
							options: { input: String(input) },
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: FeedbackId.AllSelectedInput,
					options: { input: String(input) },
					style: { bgcolor: INPUT_FEEDBACK_COLORS[input], color: Color.White },
				},
			],
		}
	}

	self.setPresetDefinitions(presets)
}
