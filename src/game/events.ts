import { balance, getPortDef, type EventType, type GameEvent, type GameState, type GoodId, type PendingEventWarning, type PortId } from './config';

const EVENT_TYPES: EventType[] = ['drought', 'festival', 'plague', 'war', 'harvest'];

function randomInt(min: number, max: number, rng = Math.random): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickRandomPorts(count: number, known: PortId[], rng = Math.random): PortId[] {
  const pool = [...known];
  const result: PortId[] = [];
  while (result.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

function createEventWarning(type: EventType, known: PortId[], rng = Math.random): PendingEventWarning {
  const turnsUntil = balance.eventWarningTurns;

  switch (type) {
    case 'drought':
      return { type, turnsUntil, affectedPorts: pickRandomPorts(2, known, rng) };
    case 'festival': {
      const port = pickRandomPorts(1, known, rng)[0];
      return { type, turnsUntil, affectedPorts: [port], targetPort: port };
    }
    case 'plague': {
      const port = pickRandomPorts(1, known, rng)[0];
      return { type, turnsUntil, affectedPorts: [port], targetPort: port };
    }
    case 'war':
      return { type, turnsUntil, affectedPorts: known.filter((p) => p === 'carthage' || p === 'crete') };
    case 'harvest':
      return { type, turnsUntil, affectedPorts: pickRandomPorts(2, known, rng) };
    default:
      return { type, turnsUntil, affectedPorts: [] };
  }
}

function warningToEvent(warning: PendingEventWarning, rng = Math.random): GameEvent {
  const duration = randomInt(balance.eventDurationMin, balance.eventDurationMax, rng);
  const def = warning.targetPort ? getPortDef(warning.targetPort) : null;
  const mainGood = def?.produces[0] as GoodId | undefined;

  return {
    type: warning.type,
    turnsRemaining: duration,
    affectedPorts: warning.affectedPorts,
    targetPort: warning.targetPort,
    targetGood: mainGood,
  };
}

export function tickEvents(state: GameState, rng = Math.random): GameState {
  let newState = { ...state };

  if (newState.pendingEventWarning) {
    const w = newState.pendingEventWarning;
    if (w.turnsUntil <= 1) {
      newState = {
        ...newState,
        activeEvent: warningToEvent(w, rng),
        pendingEventWarning: null,
      };
    } else {
      newState = {
        ...newState,
        pendingEventWarning: { ...w, turnsUntil: w.turnsUntil - 1 },
      };
    }
  }

  if (newState.activeEvent) {
    const ev = newState.activeEvent;
    if (ev.turnsRemaining <= 1) {
      newState = { ...newState, activeEvent: null };
    } else {
      newState = {
        ...newState,
        activeEvent: { ...ev, turnsRemaining: ev.turnsRemaining - 1 },
      };
    }
  }

  newState = {
    ...newState,
    turnsUntilNextEventCheck: newState.turnsUntilNextEventCheck - 1,
  };

  if (
    !newState.activeEvent &&
    !newState.pendingEventWarning &&
    newState.turnsUntilNextEventCheck <= 0
  ) {
    const known = newState.knownPorts;
    if (known.length >= 2) {
      const type = EVENT_TYPES[Math.floor(rng() * EVENT_TYPES.length)];
      newState = {
        ...newState,
        pendingEventWarning: createEventWarning(type, known, rng),
        turnsUntilNextEventCheck: randomInt(
          balance.eventIntervalMin,
          balance.eventIntervalMax,
          rng,
        ),
      };
    }
  }

  return newState;
}

export function getEventDescription(warning: PendingEventWarning): string {
  switch (warning.type) {
    case 'drought':
      return `Drought looming near ${warning.affectedPorts.map((p) => getPortDef(p).name).join(', ')}`;
    case 'festival':
      return `Festival coming to ${warning.targetPort ? getPortDef(warning.targetPort).name : 'a port'}`;
    case 'plague':
      return `Plague threatens ${warning.targetPort ? getPortDef(warning.targetPort).name : 'a port'}`;
    case 'war':
      return 'War in the western seas — piracy surges';
    case 'harvest':
      return `Bountiful harvest expected near ${warning.affectedPorts.map((p) => getPortDef(p).name).join(', ')}`;
    default:
      return 'Unknown omen';
  }
}

export function getActiveEventDescription(state: GameState): string {
  const ev = state.activeEvent;
  if (!ev) return '';

  switch (ev.type) {
    case 'drought':
      return `Drought: grain prices ×3 (${ev.turnsRemaining} turns left)`;
    case 'festival':
      return `Festival at ${ev.targetPort ? getPortDef(ev.targetPort).name : 'port'}: wine ×2.5 (${ev.turnsRemaining} turns)`;
    case 'plague':
      return `Plague at ${ev.targetPort ? getPortDef(ev.targetPort).name : 'port'} (${ev.turnsRemaining} turns)`;
    case 'war':
      return `War: extreme piracy risk (${ev.turnsRemaining} turns)`;
    case 'harvest':
      return `Good harvest: grain & wood cheap (${ev.turnsRemaining} turns)`;
    default:
      return '';
  }
}

export function initEventTimer(rng = Math.random): number {
  return randomInt(balance.eventIntervalMin, balance.eventIntervalMax, rng);
}
