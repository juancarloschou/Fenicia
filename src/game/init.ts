import {
  balance,
  portDefs,
  type GameState,
  type PortId,
} from './config';
import { createPortState } from './economy';
import { createShip } from './ships';
import { initDynasty } from './dynasty';
import { initEventTimer } from './events';

export function createInitialState(rng = Math.random): GameState {
  const ports = {} as GameState['ports'];
  for (const def of portDefs) {
    ports[def.id] = createPortState(def.id);
  }

  const knownPorts = portDefs.filter((p) => p.startUnlocked).map((p) => p.id as PortId);

  return {
    turn: 1,
    gold: balance.startingGold,
    phase: 'playing',
    knownPorts,
    ports,
    ships: [createShip('ship-1', 'Tyrian Dawn', 'tyre')],
    activeEvent: null,
    pendingEventWarning: null,
    turnsUntilNextEventCheck: initEventTimer(rng),
    pirateEncounter: null,
    dynasty: initDynasty(rng),
    relics: [],
    stats: {
      totalGoldEarned: 0,
      portsDiscovered: knownPorts.length,
      upgradesPurchased: 0,
      routesCompleted: 0,
      tradesCompleted: 0,
    },
    selectedPortId: 'tyre',
    selectedShipId: 'ship-1',
    startingGold: balance.startingGold,
  };
}

export const SAVE_KEY = 'fenicia_save';

export function saveGame(state: GameState): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    }
  } catch {
    // ignore quota errors
  }
}

export function loadGame(): GameState | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    return null;
  }
}

export function clearSave(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SAVE_KEY);
  }
}
