import { useGameStore, canEndTurn } from '../store/gameStore';
import './TurnBar.css';

export function TurnBar() {
  const state = useGameStore((s) => s.state);
  const endTurn = useGameStore((s) => s.endTurn);
  const advanceEvent = useGameStore((s) => s.advanceEvent);
  const reset = useGameStore((s) => s.reset);
  const retire = useGameStore((s) => s.retire);

  const canEnd = canEndTurn(state);
  const shipInPort = state.ships.some((s) => s.portId && !s.inTransit);

  return (
    <footer className="turn-bar">
      <div className="turn-info">
        <span>Turn {state.turn}</span>
        <span>Gen {state.dynasty.generation} ({state.dynasty.turnsLeft} left)</span>
      </div>
      <div className="turn-actions">
        <button
          className="btn-advance"
          onClick={advanceEvent}
          disabled={!canEnd || shipInPort}
          title="Skip turns until something happens"
        >
          Advance to Event
        </button>
        <button className="btn-end-turn" onClick={endTurn} disabled={!canEnd}>
          End Turn
        </button>
      </div>
      <div className="turn-meta">
        <button className="btn-small" onClick={retire} title="Retire dynasty">
          Retire
        </button>
        <button className="btn-small" onClick={reset} title="New game">
          New Game
        </button>
      </div>
    </footer>
  );
}
