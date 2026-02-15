import { useEffect } from "react";
import { ControlPanel } from "./components/ControlPanel";
import { MotherboardView } from "./components/MotherboardView";
import { executionGraph } from "./simulation/graphConfig";
import { useSimulationEngine } from "./simulation/useSimulationEngine";

const App = () => {
  const { state, start, reset, setSpeed } = useSimulationEngine(executionGraph);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [start]);

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="kicker">Interactive Educational Simulation</p>
        <h1>What Happens When You Press Enter?</h1>
        <p className="summary">
          Signal flows from keyboard hardware through kernel scheduling and into CPU pipeline stages.
        </p>
      </header>

      <section className="stats-grid">
        <article className="panel stat-card">
          <h2>Estimated Operations</h2>
          <p className="big-value">{state.totalOps.toLocaleString()}</p>
        </article>
        <article className="panel stat-card">
          <h2>Status</h2>
          <p className={`status-pill ${state.running ? "online" : "idle"}`}>
            {state.running ? "Signal in Progress" : "Waiting for Enter"}
          </p>
        </article>
      </section>

      <ControlPanel
        running={state.running}
        speed={state.speed}
        onSpeedChange={setSpeed}
        onRun={start}
        onReset={reset}
      />

      <MotherboardView
        graph={executionGraph}
        nodeStatus={state.nodeStatus}
        edgeStatus={state.edgeStatus}
        edgeFlows={state.edgeFlows}
        nowMs={state.nowMs}
      />
    </main>
  );
};

export default App;
