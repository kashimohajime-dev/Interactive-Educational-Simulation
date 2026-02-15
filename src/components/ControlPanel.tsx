interface ControlPanelProps {
  running: boolean;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onRun: () => void;
  onReset: () => void;
}

export const ControlPanel = ({
  running,
  speed,
  onSpeedChange,
  onRun,
  onReset
}: ControlPanelProps) => {
  return (
    <section className="panel control-panel">
      <h2>Simulation Controls</h2>
      <div className="controls-row">
        <button className="btn btn-primary" disabled={running} onClick={onRun}>
          Run Enter Signal
        </button>
        <button className="btn btn-secondary" onClick={onReset}>
          Reset
        </button>
      </div>
      <label className="slider-wrap">
        <span>Speed: {speed.toFixed(1)}x</span>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.1}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
        />
      </label>
      <p className="hint">Tip: press Enter on your keyboard to trigger the flow.</p>
    </section>
  );
};
