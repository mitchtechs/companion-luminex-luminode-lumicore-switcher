import dgram from 'node:dgram'

const ARTNET_PORT = 6454
const ARTNET_HEADER = Buffer.from([
	0x41, 0x72, 0x74, 0x2d, 0x4e, 0x65, 0x74, 0x00, // "Art-Net\0"
	0x00, 0x50, // OpCode: ArtDmx (0x5000) little-endian
	0x00, 0x0e, // Protocol version 14
])

// Control channel DMX values (mid-range for stability)
export const INPUT_VALUES = {
	NONE: 0,
	INPUT_1: 12,
	INPUT_2: 20,
	INPUT_3: 28,
	INPUT_4: 36,
} as const

export type InputNumber = 1 | 2 | 3 | 4

export function inputValue(input: InputNumber): number {
	switch (input) {
		case 1:
			return INPUT_VALUES.INPUT_1
		case 2:
			return INPUT_VALUES.INPUT_2
		case 3:
			return INPUT_VALUES.INPUT_3
		case 4:
			return INPUT_VALUES.INPUT_4
	}
}

export class ArtNetSender {
	private socket?: dgram.Socket
	private host: string
	private universe: number
	private subnet: number
	private net: number
	private dmxData: Buffer
	private refreshTimer?: ReturnType<typeof setInterval>
	private sequence = 0

	constructor(host: string, universe: number, subnet: number, net: number) {
		this.host = host
		this.universe = universe & 0x0f
		this.subnet = subnet & 0x0f
		this.net = net & 0x7f
		this.dmxData = Buffer.alloc(512, 0)
	}

	start(refreshRate: number): void {
		this.stop()
		this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true })
		this.socket.on('error', () => {
			// silently handle socket errors
		})

		// Send initial frame
		this.transmit()

		// Keep the stream alive
		this.refreshTimer = setInterval(() => {
			this.transmit()
		}, refreshRate)
	}

	stop(): void {
		if (this.refreshTimer) {
			clearInterval(this.refreshTimer)
			this.refreshTimer = undefined
		}
		if (this.socket) {
			try {
				this.socket.close()
			} catch {
				// ignore
			}
			this.socket = undefined
		}
	}

	setChannel(channel: number, value: number): void {
		// channel is 0-based internally
		if (channel >= 0 && channel < 512) {
			this.dmxData[channel] = value & 0xff
		}
	}

	getChannel(channel: number): number {
		if (channel >= 0 && channel < 512) {
			return this.dmxData[channel]
		}
		return 0
	}

	setChannelAndSend(channel: number, value: number): void {
		this.setChannel(channel, value)
		this.transmit()
	}

	private transmit(): void {
		if (!this.socket) return

		this.sequence = (this.sequence + 1) % 256
		if (this.sequence === 0) this.sequence = 1 // 0 means "ignore sequence"

		const universeAddr = this.universe | (this.subnet << 4)

		// Build ArtDmx packet
		const packet = Buffer.alloc(ARTNET_HEADER.length + 6 + this.dmxData.length)
		ARTNET_HEADER.copy(packet, 0)
		packet[12] = this.sequence
		packet[13] = 0 // Physical port
		packet[14] = universeAddr // Universe low byte
		packet[15] = this.net // Universe high byte (net)
		packet[16] = (this.dmxData.length >> 8) & 0xff // Length high byte
		packet[17] = this.dmxData.length & 0xff // Length low byte
		this.dmxData.copy(packet, 18)

		this.socket.send(packet, 0, packet.length, ARTNET_PORT, this.host, () => {
			// sent
		})
	}
}
