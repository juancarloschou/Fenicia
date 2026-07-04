import { createInitialState } from '../src/game/init';
import { buyGood, sellGood, getPortPrice } from '../src/game/economy';
import { assignRoute } from '../src/game/ships';
import { resolveTurn } from '../src/game/turn';
import { balance, type GoodId } from '../src/game/config';

const GOODS: GoodId[] = ['grain', 'wood', 'pottery', 'wine', 'copper', 'dye'];

function randomTrade(state: ReturnType<typeof createInitialState>, rng: () => number) {
  const ship = state.ships.find((s) => s.portId && !s.inTransit);
  if (!ship) return state;

  const good = GOODS[Math.floor(rng() * GOODS.length)];

  if (rng() < 0.5) {
    return buyGood(state, ship.id, good, Math.floor(rng() * 5) + 1);
  }
  const has = ship.cargo.find((c) => c.good === good);
  if (has && has.qty > 0) {
    return sellGood(state, ship.id, good, Math.min(has.qty, Math.floor(rng() * 3) + 1));
  }
  return state;
}

function runSimulation(turns: number, seed = 42) {
  let rng = seed;
  const random = () => {
    rng = (rng * 16807) % 2147483647;
    return (rng - 1) / 2147483646;
  };

  let state = createInitialState(random);
  const priceLog: Record<string, { min: number; max: number }> = {};

  for (const g of GOODS) {
    priceLog[g] = { min: Infinity, max: -Infinity };
  }

  let atByblos = false;

  for (let t = 0; t < turns; t++) {
    const ship = state.ships[0];
    if (ship.portId && !ship.inTransit) {
      state = randomTrade(state, random);
      const dest = ship.portId === 'tyre' ? 'byblos' : 'tyre';
      state = assignRoute(state, ship.id, dest);
    }

    state = resolveTurn(state, random);

    for (const g of GOODS) {
      for (const port of ['tyre', 'byblos'] as const) {
        const p = getPortPrice(state, port, g, false);
        priceLog[g].min = Math.min(priceLog[g].min, p);
        priceLog[g].max = Math.max(priceLog[g].max, p);
      }
    }

    if (state.ships[0].portId === 'byblos') atByblos = true;
  }

  const profit = state.gold - balance.startingGold;

  console.log('\n=== Fenicia Economy Simulation (Tyre ↔ Byblos, 200 turns) ===\n');
  console.log(`Starting gold: ${balance.startingGold}`);
  console.log(`Final gold:    ${state.gold}`);
  console.log(`Net profit:    ${profit}`);
  console.log(`Reached Byblos: ${atByblos}`);
  console.log('\nPrice ranges (Tyre/Byblos):');
  for (const g of GOODS) {
    const clamped =
      priceLog[g].min >= balance.priceClampMin * 4 &&
      priceLog[g].max <= balance.priceClampMax * 90;
    console.log(`  ${g.padEnd(8)} min=${priceLog[g].min} max=${priceLog[g].max} ${clamped ? 'OK' : 'CHECK'}`);
  }
  console.log('\n');
}

runSimulation(200);
