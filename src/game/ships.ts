import {
  balance,
  getPortDef,
  getRouteTurns,
  isRouteDangerous,
  type PortId,
  type ShipState,
  type GameState,
} from './config';
import { getCargoValue, getCargoWeight, getEffectiveModifiers, getShipCapacity } from './economy';

export function createShip(id: string, name: string, portId: PortId): ShipState {
  return {
    id,
    name,
    tier: 0,
    portId,
    originId: null,
    destinationId: null,
    turnsRemaining: 0,
    totalTurns: 0,
    cargo: [],
    damaged: false,
    damageCargoValue: 0,
    inTransit: false,
    pirateChecked: false,
  };
}

export function assignRoute(
  state: GameState,
  shipId: string,
  destinationId: PortId,
): GameState {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship || !ship.portId || ship.inTransit) return state;
  if (!state.knownPorts.includes(destinationId)) return state;

  const from = ship.portId;
  if (from === destinationId) return state;

  let turns = getRouteTurns(from, destinationId);
  const mods = getEffectiveModifiers(state);
  const speed = balance.shipTiers[ship.tier].speed * (1 + mods.speedBonus);
  turns = Math.max(1, Math.ceil(turns / speed));
  if (ship.damaged) turns = Math.ceil(turns * 1.5);

  const newShips = state.ships.map((s) =>
    s.id === shipId
      ? {
          ...s,
          originId: from,
          destinationId,
          turnsRemaining: turns,
          totalTurns: turns,
          inTransit: true,
          portId: null,
          pirateChecked: false,
        }
      : s,
  );

  return { ...state, ships: newShips };
}

export function advanceShips(state: GameState): GameState {
  let newState = { ...state };
  const arrivedShips: ShipState[] = [];

  const newShips = newState.ships.map((ship) => {
    if (!ship.inTransit) return ship;

    const remaining = ship.turnsRemaining - 1;
    if (remaining > 0) {
      return { ...ship, turnsRemaining: remaining };
    }

    const dest = ship.destinationId!;
    const arrived: ShipState = {
      ...ship,
      portId: dest,
      originId: null,
      destinationId: null,
      turnsRemaining: 0,
      totalTurns: 0,
      inTransit: false,
      pirateChecked: false,
    };
    arrivedShips.push(arrived);
    return arrived;
  });

  newState = { ...newState, ships: newShips };

  for (const ship of arrivedShips) {
    if (ship.portId) {
      newState = discoverPort(newState, ship.portId);
      newState = {
        ...newState,
        stats: {
          ...newState.stats,
          routesCompleted: newState.stats.routesCompleted + 1,
        },
      };
    }
  }

  return newState;
}

export function discoverPort(state: GameState, portId: PortId): GameState {
  if (state.knownPorts.includes(portId)) {
    const def = getPortDef(portId);
    const newKnown = [...new Set([...state.knownPorts, ...def.adjacent])] as PortId[];
    if (newKnown.length === state.knownPorts.length) return state;
    return {
      ...state,
      knownPorts: newKnown,
      stats: {
        ...state.stats,
        portsDiscovered: newKnown.length,
      },
    };
  }

  const def = getPortDef(portId);
  const newKnown = [...new Set([...state.knownPorts, portId, ...def.adjacent])] as PortId[];

  return {
    ...state,
    knownPorts: newKnown,
    stats: {
      ...state.stats,
      portsDiscovered: newKnown.length,
    },
  };
}

export function scoutPort(state: GameState, portId: PortId): GameState {
  if (state.knownPorts.includes(portId)) return state;
  const def = getPortDef(portId);
  if (state.gold < def.scoutCost) return state;

  const newKnown = [...new Set([...state.knownPorts, portId])] as PortId[];

  return {
    ...state,
    gold: state.gold - def.scoutCost,
    knownPorts: newKnown,
    stats: {
      ...state.stats,
      portsDiscovered: newKnown.length,
    },
  };
}

export function repairShip(state: GameState, shipId: string): GameState {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship || !ship.portId || !ship.damaged) return state;

  const mods = getEffectiveModifiers(state);
  const cost = Math.max(
    balance.repairCostMin,
    Math.round(ship.damageCargoValue * balance.repairCostRatio * (1 - mods.repairDiscount)),
  );
  if (state.gold < cost) return state;

  const newShips = state.ships.map((s) =>
    s.id === shipId ? { ...s, damaged: false, damageCargoValue: 0 } : s,
  );

  return { ...state, gold: state.gold - cost, ships: newShips };
}

export function upgradeShip(state: GameState, shipId: string): GameState {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship || !ship.portId || ship.inTransit) return state;
  if (ship.tier >= balance.shipTiers.length - 1) return state;

  const mods = getEffectiveModifiers(state);
  const nextTier = ship.tier + 1;
  const cost = Math.round(balance.shipUpgradeCosts[nextTier] * (1 - mods.upgradeDiscount));
  if (state.gold < cost) return state;

  const capacity = getShipCapacity({ ...state, ships: state.ships.map((s) => (s.id === shipId ? { ...s, tier: nextTier } : s)) }, nextTier);
  const weight = getCargoWeight(ship.cargo);
  if (weight > capacity) return state;

  const newShips = state.ships.map((s) =>
    s.id === shipId ? { ...s, tier: nextTier } : s,
  );

  return {
    ...state,
    gold: state.gold - cost,
    ships: newShips,
    stats: { ...state.stats, upgradesPurchased: state.stats.upgradesPurchased + 1 },
  };
}

export function buyNewShip(state: GameState): GameState {
  if (state.ships.length >= balance.maxShips) return state;
  if (state.gold < balance.newShipCost) return state;

  const homePort = state.ships.find((s) => s.portId)?.portId ?? 'tyre';
  const id = `ship-${state.ships.length + 1}`;
  const newShip = createShip(id, `Ship ${state.ships.length + 1}`, homePort);

  return {
    ...state,
    gold: state.gold - balance.newShipCost,
    ships: [...state.ships, newShip],
  };
}

export function renameShip(state: GameState, shipId: string, name: string): GameState {
  const newShips = state.ships.map((s) => (s.id === shipId ? { ...s, name } : s));
  return { ...state, ships: newShips };
}

export function getShipsInPort(state: GameState, portId: PortId): ShipState[] {
  return state.ships.filter((s) => s.portId === portId && !s.inTransit);
}

export function getShipsNeedingPirateCheck(state: GameState): ShipState[] {
  return state.ships.filter(
    (s) =>
      s.inTransit &&
      s.originId &&
      s.destinationId &&
      !s.pirateChecked &&
      isRouteDangerous(s.originId, s.destinationId),
  );
}

export function loseCargo(
  ship: ShipState,
  lossRatio: number,
): { cargo: ShipState['cargo']; lostValue: number } {
  const newCargo = ship.cargo
    .map((c) => ({ ...c, qty: Math.max(0, Math.floor(c.qty * (1 - lossRatio))) }))
    .filter((c) => c.qty > 0);
  return { cargo: newCargo, lostValue: 0 };
}

export function applyCargoLoss(
  state: GameState,
  shipId: string,
  lossRatio: number,
  damage = false,
): GameState {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship) return state;

  const atPort = ship.destinationId ?? 'tyre';
  const cargoValue = getCargoValue(state, ship.cargo, atPort);

  const newCargo = ship.cargo
    .map((c) => ({ ...c, qty: Math.max(0, Math.ceil(c.qty * (1 - lossRatio))) }))
    .filter((c) => c.qty > 0);

  const newShips = state.ships.map((s) =>
    s.id === shipId
      ? {
          ...s,
          cargo: newCargo,
          damaged: damage ? true : s.damaged,
          damageCargoValue: damage ? cargoValue : s.damageCargoValue,
        }
      : s,
  );

  return { ...state, ships: newShips };
}

export function addExtraTurns(state: GameState, shipId: string, extra: number): GameState {
  const newShips = state.ships.map((s) =>
    s.id === shipId ? { ...s, turnsRemaining: s.turnsRemaining + extra } : s,
  );
  return { ...state, ships: newShips };
}
