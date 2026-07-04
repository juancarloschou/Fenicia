import { useGameStore } from '../store/gameStore';
import { calculatePrestige } from '../game/dynasty';
import { getHeirTitle } from '../game/dynasty';
import './EndScreen.css';

export function EndScreen() {
  const state = useGameStore((s) => s.state);
  const reset = useGameStore((s) => s.reset);
  const prestige = calculatePrestige(state);
  const profit = state.gold - state.startingGold;

  return (
    <div className="end-screen">
      <div className="end-card">
        <h1>Dynasty Complete</h1>
        <p className="end-subtitle">Your Phoenician trading legacy</p>

        <div className="prestige-score">
          <span className="prestige-label">Prestige</span>
          <span className="prestige-value">{prestige}</span>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <span className="stat-val">{state.gold}</span>
            <span className="stat-lbl">Final Gold</span>
          </div>
          <div className="stat">
            <span className="stat-val">{profit >= 0 ? '+' : ''}{profit}</span>
            <span className="stat-lbl">Net Profit</span>
          </div>
          <div className="stat">
            <span className="stat-val">{state.knownPorts.length}</span>
            <span className="stat-lbl">Ports Known</span>
          </div>
          <div className="stat">
            <span className="stat-val">{state.stats.routesCompleted}</span>
            <span className="stat-lbl">Routes</span>
          </div>
          <div className="stat">
            <span className="stat-val">{state.stats.upgradesPurchased}</span>
            <span className="stat-lbl">Upgrades</span>
          </div>
          <div className="stat">
            <span className="stat-val">{state.relics.length}</span>
            <span className="stat-lbl">Relics</span>
          </div>
        </div>

        {state.dynasty.heirs.length > 0 && (
          <div className="saga-summary">
            <h3>Family Saga</h3>
            {state.dynasty.heirs.map((h, i) => (
              <div key={i} className="saga-entry">
                <strong>{h.name}</strong> ({getHeirTitle(i + 1)})
                <span>
                  {h.traits.map((t) => t.name).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {state.relics.length > 0 && (
          <div className="relics-summary">
            <h3>Family Relics</h3>
            {state.relics.map((r) => (
              <div key={r.id}>{r.name} — {r.description}</div>
            ))}
          </div>
        )}

        <button className="btn-new-game" onClick={reset}>
          Start New Dynasty
        </button>
      </div>
    </div>
  );
}
