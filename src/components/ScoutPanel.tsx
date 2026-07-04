import { useGameStore } from '../store/gameStore';
import { portDefs } from '../game/config';
import './ScoutPanel.css';

export function ScoutPanel() {
  const state = useGameStore((s) => s.state);
  const scout = useGameStore((s) => s.scout);

  const lockedPorts = portDefs.filter(
    (p) => !p.startUnlocked && !state.knownPorts.includes(p.id) && p.scoutCost > 0,
  );

  if (lockedPorts.length === 0) return null;

  return (
    <div className="scout-panel">
      <h3>Send Scout from Tyre</h3>
      <div className="scout-list">
        {lockedPorts.map((p) => (
          <button
            key={p.id}
            className="scout-btn"
            onClick={() => scout(p.id)}
            disabled={state.gold < p.scoutCost}
          >
            Reveal {p.name} — {p.scoutCost} gold
          </button>
        ))}
      </div>
    </div>
  );
}
