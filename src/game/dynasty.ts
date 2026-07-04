import { balance, relics, traits, type DynastyState, type GameState, type HeirRecord, type RelicDef, type TraitDef } from './config';

const HEIR_NAMES = [
  'Abd-Melqart', 'Baal-Eser', 'Hiram', 'Pygmalion', 'Ithobaal',
  'Mattan', 'Astarte-Baal', 'Eshmunazar', 'Tabnit', 'Bod-Astarte',
];

function randomPick<T>(arr: T[], rng = Math.random): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pickTraits(count: number, rng = Math.random): TraitDef[] {
  const pool = [...traits];
  const picked: TraitDef[] = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(rng() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function pickRelic(usedIds: string[], rng = Math.random): RelicDef {
  const available = relics.filter((r) => !usedIds.includes(r.id));
  return randomPick(available.length > 0 ? available : relics, rng);
}

export function initDynasty(rng = Math.random): DynastyState {
  const turnsLeft = Math.floor(
    rng() * (balance.generationTurnsMax - balance.generationTurnsMin + 1) +
      balance.generationTurnsMin,
  );

  const explorerPort = 'carthage' as const;

  return {
    generation: 1,
    turnsLeft,
    currentTraits: pickTraits(2, rng),
    heirs: [],
    explorerPortId: explorerPort,
  };
}

export function tickDynasty(state: GameState): GameState {
  const dynasty = state.dynasty;
  if (dynasty.turnsLeft > 1) {
    return {
      ...state,
      dynasty: { ...dynasty, turnsLeft: dynasty.turnsLeft - 1 },
    };
  }
  return startHeirTransition(state);
}

export function startHeirTransition(state: GameState, rng = Math.random): GameState {
  const dynasty = state.dynasty;
  const heirName = randomPick(HEIR_NAMES, rng);

  const record: HeirRecord = {
    name: heirName,
    traits: dynasty.currentTraits,
    turnsServed: balance.generationTurnsMax - dynasty.turnsLeft + dynasty.turnsLeft,
    goldEarned: state.stats.totalGoldEarned,
  };

  const usedRelicIds = state.relics.map((r) => r.id);
  const newRelic = dynasty.generation < balance.totalGenerations ? pickRelic(usedRelicIds, rng) : null;

  const nextGen = dynasty.generation + 1;
  const isLastGen = nextGen > balance.totalGenerations;

  if (isLastGen) {
    return {
      ...state,
      phase: 'ended',
      dynasty: {
        ...dynasty,
        heirs: [...dynasty.heirs, record],
      },
      relics: newRelic ? [...state.relics, newRelic] : state.relics,
    };
  }

  const turnsLeft = Math.floor(
    rng() * (balance.generationTurnsMax - balance.generationTurnsMin + 1) +
      balance.generationTurnsMin,
  );

  return {
    ...state,
    phase: 'heir',
    dynasty: {
      generation: nextGen,
      turnsLeft,
      currentTraits: pickTraits(2, rng),
      heirs: [...dynasty.heirs, record],
      explorerPortId: dynasty.explorerPortId,
    },
    relics: newRelic ? [...state.relics, newRelic] : state.relics,
  };
}

export function confirmHeir(state: GameState): GameState {
  if (state.phase !== 'heir') return state;
  return { ...state, phase: 'playing' };
}

export function retireEarly(state: GameState): GameState {
  return { ...state, phase: 'ended' };
}

export function calculatePrestige(state: GameState): number {
  return (
    state.gold * 1 +
    state.knownPorts.length * 200 +
    state.stats.upgradesPurchased * 150 +
    state.dynasty.generation * 300 +
    state.relics.length * 100
  );
}

export function getHeirTitle(generation: number): string {
  const titles = ['Founder', 'Son', 'Grandson', 'Great-grandson', 'Patriarch'];
  return titles[Math.min(generation - 1, titles.length - 1)];
}
