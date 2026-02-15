# Enter Key Educational Simulation

Interactive React + TypeScript app that visualizes what happens in a computer system when the user presses `Enter`.

The current UI is the original MVP view:
- 2D system flow board (SVG)
- Node-by-node activation
- Animated edge signal flow
- Simulated operations counter
- Tooltip explanations for each system node

## Tech Stack

- React 18
- TypeScript
- Vite
- SVG rendering (2D)

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown in terminal (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

## How Simulation Works

1. User presses `Enter` on keyboard.
2. The app starts an event-driven simulation queue.
3. Signal passes through nodes in this order:
   - Keyboard
   - Keyboard Controller
   - Hardware Interrupt
   - Kernel Input Handler
   - Scheduler
   - Application Layer
   - CPU Fetch
   - CPU Decode
   - CPU Execute
4. Each node becomes active, then completed.
5. Each edge animates during transfer latency.
6. Operation counter increases with simulated cost.

## Project Structure

```text
src/
  App.tsx                         # Main page + Enter key listener
  main.tsx                        # React entrypoint
  styles.css                      # UI styling
  types.ts                        # Graph and simulation types
  components/
    ControlPanel.tsx              # Run/reset/speed controls
    MotherboardView.tsx           # SVG board rendering + tooltips
  simulation/
    graphConfig.ts                # Node and edge definitions + latencies
    useSimulationEngine.ts        # Event queue + propagation engine
```

## Configuration

Update these files to customize behavior:

- `src/simulation/graphConfig.ts`
  - Node positions (`x`, `y`)
  - Node descriptions (`tooltip`)
  - Node costs (`opsCost`)
  - Latencies (`baseLatencyMs`, `edge.latencyMs`)
- `src/simulation/useSimulationEngine.ts`
  - Event processing behavior
  - Random ops multiplier logic
  - Speed scaling rules

## Controls

- `Run Enter Signal` button starts simulation.
- `Reset` clears state and counter.
- `Speed` slider changes propagation speed.
- Physical `Enter` key also starts simulation.

## Notes

- This is an educational simulation, not a real hardware monitor.
- Operation counts are simulated estimates.
