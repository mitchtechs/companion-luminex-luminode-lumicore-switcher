# Companion Module — Luminex LumiNode / LumiCore Input Switcher

Switch input sources on Luminex LumiNode and LumiCore process engines via Art-Net control channel, from [Bitfocus Companion](https://bitfocus.io/companion).

Developed by **[PDA Technical Limited](https://pda-tech.com)** — Mitch Bailey.

---

## Supported Devices

- **LumiNode** — Network DMX processor
- **LumiCore** — Network DMX process engine

> **Note:** This module handles **input source switching** via Art-Net. For full device control (universe management, feedbacks, variables) use the [companion-luminex-luminode-lumicore](https://github.com/mitchtechs/companion-luminex-luminode-lumicore) module.

---

## Features

### Actions
- Switch input source for a specific universe (via Art-Net control channel)

### Feedbacks
- Current input source per universe

### Variables
- Active input source per universe

### Presets
- Pre-built source switching buttons

---

## How It Works

This module uses the **Art-Net control channel** built into LumiNode/LumiCore to switch input sources. This allows fast, reliable source switching without relying on the REST API.

---

## Configuration

| Field | Description |
|-------|-------------|
| Host | IP address of the LumiNode / LumiCore device |
| Art-Net Universe | The Art-Net universe used for control |

---

## License

MIT — © PDA Technical Limited
