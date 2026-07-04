import { balance, type GameState } from './config';
import { regenerateMarkets } from './economy';
import { advanceShips } from './ships';
import { rollPirateEncounters } from './pirates';
import { tickEvents } from './events';
import { tickDynasty } from './dynasty';

export function resolveTurn(state: GameState, rng = Math.random): GameState {
  if (state.phase !== 'playing' || state.pirateEncounter) return state;

  let newState = { ...state, turn: state.turn + 1 };

  newState = advanceShips(newState);
  newState = regenerateMarkets(newState);
  newState = rollPirateEncounters(newState, rng);

  if (newState.pirateEncounter) return newState;

  newState = tickEvents(newState, rng);
  newState = tickDynasty(newState);

  return newState;
}

export function hasPendingDecision(state: GameState): boolean {
  if (state.phase !== 'playing') return true;
  if (state.pirateEncounter) return true;

  const shipInPort = state.ships.some((s) => s.portId && !s.inTransit);
  if (shipInPort) return true;

  return false;
}

export function advanceToNextEvent(state: GameState, rng = Math.random): GameState {
  if (state.phase !== 'playing') return state;

  let newState = state;
  let safety = 200;

  while (safety-- > 0) {
    if (hasPendingDecision(newState)) break;
    if (newState.phase !== 'playing') break;

    newState = resolveTurn(newState, rng);
    if (hasPendingDecision(newState)) break;
    if (newState.pirateEncounter) break;
    if (newState.pendingEventWarning?.turnsUntil === balance.eventWarningTurns) break;
    if (newState.activeEvent && newState.activeEvent.turnsRemaining === balance.eventDurationMax) break;
    if (newState.phase === 'heir' || newState.phase === 'ended') break;
  }

  return newState;
}

export function canEndTurn(state: GameState): boolean {
  return state.phase === 'playing' && !state.pirateEncounter;
}
