import { create } from 'zustand';
import type { GameState, GoodId, PortId } from '../game/config';
import { buyGood, sellGood } from '../game/economy';
import {
  assignRoute,
  scoutPort,
  repairShip,
  upgradeShip,
  buyNewShip,
  renameShip,
} from '../game/ships';
import {
  resolvePirateBribe,
  resolvePirateFlee,
  resolvePirateFight,
} from '../game/pirates';
import { resolveTurn, advanceToNextEvent, canEndTurn } from '../game/turn';
import { createInitialState, saveGame, loadGame, clearSave } from '../game/init';
import { confirmHeir, retireEarly } from '../game/dynasty';

interface GameStore {
  state: GameState;
  init: () => void;
  load: () => boolean;
  reset: () => void;
  endTurn: () => void;
  advanceEvent: () => void;
  selectPort: (id: PortId | null) => void;
  selectShip: (id: string | null) => void;
  buy: (shipId: string, good: GoodId, qty: number) => void;
  sell: (shipId: string, good: GoodId, qty: number) => void;
  sail: (shipId: string, dest: PortId) => void;
  scout: (portId: PortId) => void;
  repair: (shipId: string) => void;
  upgrade: (shipId: string) => void;
  purchaseShip: () => void;
  setShipName: (shipId: string, name: string) => void;
  pirateBribe: () => void;
  pirateFlee: () => void;
  pirateFight: () => void;
  confirmNewHeir: () => void;
  retire: () => void;
}

function persist(state: GameState) {
  saveGame(state);
  return state;
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),

  init: () => {
    const loaded = loadGame();
    set({ state: loaded ?? createInitialState() });
  },

  load: () => {
    const loaded = loadGame();
    if (loaded) {
      set({ state: loaded });
      return true;
    }
    return false;
  },

  reset: () => {
    clearSave();
    set({ state: createInitialState() });
  },

  endTurn: () => {
    const { state } = get();
    if (!canEndTurn(state)) return;
    const next = persist(resolveTurn(state));
    set({ state: next });
  },

  advanceEvent: () => {
    const { state } = get();
    const next = persist(advanceToNextEvent(state));
    set({ state: next });
  },

  selectPort: (id) => set((s) => ({ state: { ...s.state, selectedPortId: id } })),

  selectShip: (id) => set((s) => ({ state: { ...s.state, selectedShipId: id } })),

  buy: (shipId, good, qty) =>
    set((s) => ({ state: persist(buyGood(s.state, shipId, good, qty)) })),

  sell: (shipId, good, qty) =>
    set((s) => ({ state: persist(sellGood(s.state, shipId, good, qty)) })),

  sail: (shipId, dest) =>
    set((s) => ({ state: persist(assignRoute(s.state, shipId, dest)) })),

  scout: (portId) =>
    set((s) => ({ state: persist(scoutPort(s.state, portId)) })),

  repair: (shipId) =>
    set((s) => ({ state: persist(repairShip(s.state, shipId)) })),

  upgrade: (shipId) =>
    set((s) => ({ state: persist(upgradeShip(s.state, shipId)) })),

  purchaseShip: () =>
    set((s) => ({ state: persist(buyNewShip(s.state)) })),

  setShipName: (shipId, name) =>
    set((s) => ({ state: persist(renameShip(s.state, shipId, name)) })),

  pirateBribe: () =>
    set((s) => ({ state: persist(resolvePirateBribe(s.state)) })),

  pirateFlee: () =>
    set((s) => ({ state: persist(resolvePirateFlee(s.state)) })),

  pirateFight: () =>
    set((s) => ({ state: persist(resolvePirateFight(s.state)) })),

  confirmNewHeir: () =>
    set((s) => ({ state: persist(confirmHeir(s.state)) })),

  retire: () =>
    set((s) => ({ state: persist(retireEarly(s.state)) })),
}));

export { canEndTurn };
