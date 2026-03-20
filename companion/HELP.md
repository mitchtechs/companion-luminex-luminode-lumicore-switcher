# Luminex LumiNode / LumiCore Switcher

> Developed by **[PDA Technical Limited](https://pda-tech.com)**


This module switches input sources on Luminex LumiNode and LumiCore process engines by sending Art-Net DMX data to the device's control channel.

## How It Works

When a LumiNode/LumiCore process engine is set to **Switch** mode, it listens on a configurable **control universe** and **control channel** for DMX values that select which input source is active:

| DMX Value | Action |
|-----------|--------|
| 0 - 7 | No action |
| 8 - 15 | Select Input 1 |
| 16 - 23 | Select Input 2 |
| 24 - 31 | Select Input 3 |
| 32 - 39 | Select Input 4 |

## Configuration

### Device Settings (on the LumiNode/LumiCore)
Before using this module, configure each process engine in the device's web UI:
1. Set the process engine mode to **Switch**
2. Under Global Settings > Control Source, configure:
   - **Control Source Protocol**: Art-Net
   - **Control Universe**: The Art-Net universe to listen on
   - **Control Channel**: The DMX channel within that universe

### Module Settings
- **Target IP**: The IP address of your LumiNode/LumiCore device
- **Art-Net Universe**: Must match the control universe configured on the device
- **Art-Net Net / Subnet**: Art-Net addressing (default 0/0 for most setups)
- **Number of Process Engines**: How many process engines to create controls for (1-64)
- **Base Control Channel**: The first DMX channel used for control. Each process engine uses one consecutive channel starting from this value.
- **Process Engine Groups**: Define named groups of process engines for batch switching

## Presets

### Per Process Engine
- **Switch PE X to Input 1/2/3/4**: Individual input selection buttons

### Groups
- **Switch Group to Input 1/2/3/4**: Switch all process engines in a named group simultaneously

### All Engines
- **Switch ALL to Input 1/2/3/4**: Switch every configured process engine at once

## Companion Module Pairing

For full functionality, pair this module with the **Luminex LumiNode/LumiCore** REST API module, which provides:
- Active input feedback (shows which input is currently selected)
- Process engine mode monitoring
- Device status and configuration
