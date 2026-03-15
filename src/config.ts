import type { SomeCompanionConfigField } from '@companion-module/base'

export interface PEGroup {
	name: string
	engines: number[] // 1-based engine numbers
}

export interface ModuleConfig {
	host: string
	universe: number
	subnet: number
	net: number
	numProcessEngines: number
	baseChannel: number
	groups: string // JSON string of PEGroup[]
	refreshRate: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			tooltip: 'IP address of the LumiNode/LumiCore device',
			width: 6,
		},
		{
			type: 'number',
			id: 'universe',
			label: 'Art-Net Universe',
			tooltip: 'Must match the control universe configured on the device (0-15)',
			default: 0,
			min: 0,
			max: 15,
			width: 3,
		},
		{
			type: 'number',
			id: 'subnet',
			label: 'Art-Net Subnet',
			tooltip: 'Art-Net subnet (0-15)',
			default: 0,
			min: 0,
			max: 15,
			width: 3,
		},
		{
			type: 'number',
			id: 'net',
			label: 'Art-Net Net',
			tooltip: 'Art-Net net (0-127)',
			default: 0,
			min: 0,
			max: 127,
			width: 3,
		},
		{
			type: 'number',
			id: 'numProcessEngines',
			label: 'Number of Process Engines',
			tooltip: 'How many process engines to control (each uses one consecutive DMX channel)',
			default: 4,
			min: 1,
			max: 64,
			width: 3,
		},
		{
			type: 'number',
			id: 'baseChannel',
			label: 'Base Control Channel',
			tooltip: 'First DMX channel (1-based). PE1 uses this channel, PE2 uses the next, etc.',
			default: 1,
			min: 1,
			max: 512,
			width: 3,
		},
		{
			type: 'number',
			id: 'refreshRate',
			label: 'Art-Net Refresh Rate (ms)',
			tooltip: 'How often to re-send the Art-Net frame to keep the control stream alive',
			default: 1000,
			min: 100,
			max: 5000,
			width: 3,
		},
		{
			type: 'textinput',
			id: 'groups',
			label: 'Process Engine Groups (JSON)',
			tooltip: 'Define groups as JSON array: [{"name":"Group A","engines":[1,2]},{"name":"Group B","engines":[3,4]}]',
			default: '[]',
			width: 12,
		},
	]
}

export function parseGroups(groupsJson: string): PEGroup[] {
	try {
		const parsed = JSON.parse(groupsJson)
		if (!Array.isArray(parsed)) return []
		return parsed.filter(
			(g: unknown): g is PEGroup =>
				typeof g === 'object' &&
				g !== null &&
				typeof (g as PEGroup).name === 'string' &&
				Array.isArray((g as PEGroup).engines) &&
				(g as PEGroup).engines.every((e: unknown) => typeof e === 'number'),
		)
	} catch {
		return []
	}
}
