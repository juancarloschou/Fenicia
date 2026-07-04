import { useGameStore } from '../store/gameStore';
import { balance } from '../game/config';
import './PirateModal.css';

export function PirateModal() {
  const encounter = useGameStore((s) => s.state.pirateEncounter);
  const pirateBribe = useGameStore((s) => s.pirateBribe);
  const pirateFlee = useGameStore((s) => s.pirateFlee);
  const pirateFight = useGameStore((s) => s.pirateFight);
  const warActive = useGameStore((s) => s.state.activeEvent?.type === 'war');

  if (!encounter) return null;

  const bribePct = Math.round(
    balance.bribePercent * (warActive ? balance.pirateWarBribeMultiplier : 1) * 100,
  );

  return (
    <div className="modal-overlay">
      <div className="pirate-modal">
        <h2>🏴‍☠️ Pirates!</h2>
        <p>
          Your ship is intercepted! Cargo worth ~{encounter.cargoValue} gold is at
          risk.
        </p>
        <div className="pirate-options">
          <button className="btn-bribe" onClick={pirateBribe}>
            Pay bribe ({bribePct}% cargo)
          </button>
          <button className="btn-flee" onClick={pirateFlee}>
            Flee (risk 25% loss + delay)
          </button>
          <button className="btn-fight" onClick={pirateFight}>
            Fight (risk 50% loss + damage)
          </button>
        </div>
      </div>
    </div>
  );
}
