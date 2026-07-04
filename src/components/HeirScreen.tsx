import { useGameStore } from '../store/gameStore';
import { getHeirTitle } from '../game/dynasty';
import './HeirScreen.css';

export function HeirScreen() {
  const state = useGameStore((s) => s.state);
  const confirmNewHeir = useGameStore((s) => s.confirmNewHeir);
  const dynasty = state.dynasty;
  const lastHeir = dynasty.heirs[dynasty.heirs.length - 1];
  const newRelic = state.relics[state.relics.length - 1];

  return (
    <div className="heir-screen">
      <div className="heir-card">
        <h1>A New Generation</h1>
        {lastHeir && (
          <p className="heir-farewell">
            {lastHeir.name} ({getHeirTitle(dynasty.generation - 1)}) passes the
            trading house to the next generation.
          </p>
        )}

        <div className="heir-portrait">👤</div>
        <h2>Generation {dynasty.generation}</h2>

        <div className="traits-list">
          <h3>Traits</h3>
          {dynasty.currentTraits.map((t) => (
            <div key={t.id} className="trait-item">
              <strong>{t.name}</strong>
              <span>{t.description}</span>
            </div>
          ))}
        </div>

        {newRelic && (
          <div className="relic-gained">
            <h3>Family Relic</h3>
            <p>
              <strong>{newRelic.name}</strong> — {newRelic.description}
            </p>
          </div>
        )}

        <button className="btn-continue" onClick={confirmNewHeir}>
          Continue Trading
        </button>
      </div>
    </div>
  );
}
