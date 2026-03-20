import { InstanceBase, InstanceStatus, runEntrypoint, type SomeCompanionConfigField } from '@companion-module/base'
import { type ModuleConfig, GetConfigFields } from './config.js'
import { UpdateActions } from './actions.js'
import { UpdateFeedbacks, FeedbackId } from './feedbacks.js'
import { UpdatePresets } from './presets.js'
import { UpdateVariableDefinitions, updateAllVariables } from './variables.js'
import { UpgradeScripts } from './upgrades.js'
import { ArtNetSender, inputValue, type InputNumber } from './artnet.js'

export class ModuleInstance extends InstanceBase<ModuleConfig> {
	config?: ModuleConfig
	private artnet?: ArtNetSender

	constructor(internal: unknown) {
		super(internal)
	}

	async init(config: ModuleConfig): Promise<void> {
		this.config = config
		this.initAll()
		this.startArtNet()
	}

	async destroy(): Promise<void> {
		this.artnet?.stop()
		this.artnet = undefined
	}

	async configUpdated(config: ModuleConfig): Promise<void> {
		this.config = config
		this.artnet?.stop()
		this.artnet = undefined
		this.initAll()
		this.startArtNet()
	}

	getConfigFields(): SomeCompanionConfigField[] {
		return GetConfigFields()
	}

	private initAll(): void {
		UpdateVariableDefinitions(this)
		UpdateFeedbacks(this)
		UpdateActions(this)
		UpdatePresets(this)
	}

	private getHostAddress(): string | null {
		if (!this.config) return null
		if (this.config.luminode_host) {
			const ip = this.config.luminode_host.split(':')[0]
			const regex = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/
			if (regex.test(ip)) return ip
			this.log('warn', `Bonjour host IP "${ip}" has unexpected format`)
			return null
		}
		return this.config.host || null
	}

	private startArtNet(): void {
		const host = this.getHostAddress()
		if (!host) {
			this.updateStatus(InstanceStatus.BadConfig, 'No target IP configured')
			return
		}

		this.artnet = new ArtNetSender(
			host,
			this.config?.universe ?? 0,
			this.config?.subnet ?? 0,
			this.config?.net ?? 0,
		)
		this.artnet.start(this.config?.refreshRate ?? 1000)
		this.updateStatus(InstanceStatus.Ok)

		// Set initial variable values
		updateAllVariables(this)
	}

	// --- Public API for actions ---

	switchEngine(pe: number, input: InputNumber): void {
		const value = inputValue(input)
		this.setEngineValue(pe, value)
		this.transmit()
	}

	setEngineValue(pe: number, value: number): void {
		if (!this.artnet || !this.config) return
		const channel = (this.config.baseChannel ?? 1) - 1 + (pe - 1) // 0-based
		this.artnet.setChannel(channel, value)
	}

	getEngineValue(pe: number): number {
		if (!this.artnet || !this.config) return 0
		const channel = (this.config.baseChannel ?? 1) - 1 + (pe - 1) // 0-based
		return this.artnet.getChannel(channel)
	}

	transmit(): void {
		// The ArtNet sender auto-refreshes, but we trigger an immediate send
		// after a value change for responsiveness, then update feedback
		updateAllVariables(this)
		this.checkFeedbacks(
			FeedbackId.SelectedInput,
			FeedbackId.GroupSelectedInput,
			FeedbackId.AllSelectedInput,
		)
	}
}

runEntrypoint(ModuleInstance, UpgradeScripts)
