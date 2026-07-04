import { balance, type GameState, type PirateEncounter } from './config';
import { getCargoValue, getEffectiveModifiers } from './economy';
import {
  applyCargoLoss,
  addExtraTurns,
  getShipsNeedingPirateCheck,
} from './ships';

export function getPirateChance(state: GameState, shipId: string): number {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship || !ship.destinationId) return 0;

  const atPort = ship.destinationId;
  const cargoValue = getCargoValue(state, ship.cargo, atPort);
  const mods = getEffectiveModifiers(state);

  let chance =
    balance.pirateBaseChance +
    (cargoValue / 1000) * balance.pirateCargoFactor;

  if (state.activeEvent?.type === 'war') {
    chance = balance.pirateWarChance;
  }

  chance *= 1 - mods.pirateReduction;
  return Math.min(balance.pirateMaxChance, Math.max(0, chance));
}

export function rollPirateEncounters(state: GameState, rng = Math.random): GameState {
  if (state.pirateEncounter) return state;

  const candidates = getShipsNeedingPirateCheck(state);
  for (const ship of candidates) {
    const chance = getPirateChance(state, ship.id);
    const encountered = rng() < chance;
    const newShips = state.ships.map((s) =>
      s.id === ship.id ? { ...s, pirateChecked: true } : s,
    );
    let newState = { ...state, ships: newShips };

    if (encountered) {
      const cargoValue = getCargoValue(state, ship.cargo, ship.destinationId!);
      const encounter: PirateEncounter = { shipId: ship.id, cargoValue };
      return { ...newState, pirateEncounter: encounter };
    }
    state = newState;
  }
  return state;
}

export function resolvePirateBribe(state: GameState): GameState {
  const enc = state.pirateEncounter;
  if (!enc) return state;

  let bribeRatio = balance.bribePercent;
  if (state.activeEvent?.type === 'war') {
    bribeRatio *= balance.pirateWarBribeMultiplier;
  }

  let newState = applyCargoLoss(state, enc.shipId, bribeRatio);
  return { ...newState, pirateEncounter: null };
}

export function resolvePirateFlee(state: GameState, rng = Math.random): GameState {
  const enc = state.pirateEncounter;
  if (!enc) return state;

  const ship = state.ships.find((s) => s.id === enc.shipId)!;
  const mods = getEffectiveModifiers(state);
  const speed = balance.shipTiers[ship.tier].speed * (1 + mods.speedBonus);
  const fleeChance = 0.4 + speed * 0.2 + mods.fleeBonus;

  let newState: GameState = { ...state, pirateEncounter: null };

  if (rng() > fleeChance) {
    newState = applyCargoLoss(newState, enc.shipId, balance.fleeFailCargoLoss);
    newState = addExtraTurns(newState, enc.shipId, balance.fleeFailExtraTurns);
  }

  return newState;
}

export function resolvePirateFight(state: GameState, rng = Math.random): GameState {
  const enc = state.pirateEncounter;
  if (!enc) return state;

  const ship = state.ships.find((s) => s.id === enc.shipId)!;
  const mods = getEffectiveModifiers(state);
  const crew = balance.shipTiers[ship.tier].crew;
  const fightChance = 0.35 + crew * 0.04 + mods.fightBonus;

  let newState: GameState = { ...state, pirateEncounter: null };

  if (rng() < fightChance) {
    if (rng() < balance.fightWinLootChance) {
      newState = { ...newState, gold: newState.gold + balance.fightWinLootAmount };
    }
  } else {
    newState = applyCargoLoss(newState, enc.shipId, balance.fightFailCargoLoss, true);
  }

  return newState;
}
