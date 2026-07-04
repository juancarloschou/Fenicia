import {
  balance,
  getGoodDef,
  getPortDef,
  getRouteTurns,
  goodIds,
  type GoodId,
  type PortId,
  type PortState,
  type PortStock,
  type GameState,
} from './config';

export function getStockTarget(portId: PortId, goodId: GoodId): number {
  const def = getPortDef(portId);
  if (def.produces.includes(goodId)) return balance.stockTargetProduce;
  if (def.demands.includes(goodId)) return balance.stockTargetDemand;
  return (balance.stockTargetProduce + balance.stockTargetDemand) / 2;
}

export function getRegenRate(portId: PortId, goodId: GoodId): number {
  const def = getPortDef(portId);
  if (def.produces.includes(goodId)) return balance.regenProduction;
  return balance.regenImport;
}

export function getPrice(
  stockActual: number,
  stockTarget: number,
  basePrice: number,
): number {
  if (stockTarget <= 0) return basePrice * balance.priceClampMax;
  const ratio = stockActual / stockTarget;
  const raw = basePrice * (2 - ratio);
  return Math.round(
    Math.max(basePrice * balance.priceClampMin, Math.min(basePrice * balance.priceClampMax, raw)),
  );
}

export function regenStock(actual: number, target: number, rate: number): number {
  return actual + (target - actual) * rate;
}

export function getEffectiveModifiers(state: GameState) {
  let buyDiscount = 0;
  let sellBonus = 0;
  let speedBonus = 0;
  let pirateReduction = 0;
  let upgradeDiscount = 0;
  let fightBonus = 0;
  let fleeBonus = 0;
  let capacityBonus = 0;
  let repairDiscount = 0;
  let festivalBonus = 0;
  let realtimePort = false;

  for (const trait of state.dynasty.currentTraits) {
    if (trait.effect.buyDiscount) buyDiscount += trait.effect.buyDiscount as number;
    if (trait.effect.speedBonus) speedBonus += trait.effect.speedBonus as number;
    if (trait.effect.pirateReduction) pirateReduction += trait.effect.pirateReduction as number;
    if (trait.effect.upgradeDiscount) upgradeDiscount += trait.effect.upgradeDiscount as number;
    if (trait.effect.fightBonus) fightBonus += trait.effect.fightBonus as number;
    if (trait.effect.festivalBonus) festivalBonus += trait.effect.festivalBonus as number;
    if (trait.effect.realtimePort) realtimePort = true;
  }

  for (const relic of state.relics) {
    if (relic.effect.buyDiscount) buyDiscount += relic.effect.buyDiscount;
    if (relic.effect.sellBonus) sellBonus += relic.effect.sellBonus;
    if (relic.effect.capacityBonus) capacityBonus += relic.effect.capacityBonus;
    if (relic.effect.fleeBonus) fleeBonus += relic.effect.fleeBonus;
    if (relic.effect.repairDiscount) repairDiscount += relic.effect.repairDiscount;
  }

  return {
    buyDiscount,
    sellBonus,
    speedBonus,
    pirateReduction,
    upgradeDiscount,
    fightBonus,
    fleeBonus,
    capacityBonus,
    repairDiscount,
    festivalBonus,
    realtimePort,
  };
}

export function getPortPrice(
  state: GameState,
  portId: PortId,
  goodId: GoodId,
  forBuying: boolean,
): number {
  const port = state.ports[portId];
  const stock = port.stocks[goodId];
  const basePrice = getGoodDef(goodId).basePrice;
  let price = getPrice(stock.actual, stock.target, basePrice);

  const mods = getEffectiveModifiers(state);
  if (forBuying) {
    price = Math.round(price * (1 - mods.buyDiscount));
  } else {
    price = Math.round(price * (1 + mods.sellBonus));
  }

  if (state.activeEvent) {
    price = applyEventPriceModifier(state, portId, goodId, price);
  }

  return Math.max(1, price);
}

export function applyEventPriceModifier(
  state: GameState,
  portId: PortId,
  goodId: GoodId,
  price: number,
): number {
  const ev = state.activeEvent;
  if (!ev) return price;

  if (ev.type === 'drought' && goodId === 'grain' && ev.affectedPorts.includes(portId)) {
    return Math.round(price * 3);
  }
  if (ev.type === 'festival' && goodId === 'wine' && ev.targetPort === portId) {
    const mods = getEffectiveModifiers(state);
    const mult = 2.5 * (1 + (ev.type === 'festival' ? mods.festivalBonus : 0));
    return Math.round(price * mult);
  }
  if (ev.type === 'harvest' && (goodId === 'grain' || goodId === 'wood') && ev.affectedPorts.includes(portId)) {
    return Math.round(price * 0.5);
  }
  return price;
}

export function getDelayedPrice(
  state: GameState,
  portId: PortId,
  goodId: GoodId,
): { price: number; delay: number } | null {
  if (!state.knownPorts.includes(portId)) return null;

  const mods = getEffectiveModifiers(state);
  const history = state.ports[portId].priceHistory[goodId];
  const fromHome = getRouteTurnsFrom(state, 'tyre', portId);
  let delay = balance.priceDelayNear;
  if (fromHome >= 6) delay = balance.priceDelayFar;
  else if (fromHome >= 4) delay = balance.priceDelayMedium;

  if (mods.realtimePort && state.dynasty.explorerPortId === portId) {
    delay = 0;
  }

  const idx = history.length - 1 - delay;
  const price = idx >= 0 ? history[idx] : getPortPrice(state, portId, goodId, false);
  return { price, delay };
}

function getRouteTurnsFrom(_state: GameState, from: PortId, to: PortId): number {
  return getRouteTurns(from, to);
}

export function getCargoWeight(cargo: { good: GoodId; qty: number }[]): number {
  return cargo.reduce((sum, c) => sum + c.qty, 0);
}

export function getCargoValue(state: GameState, cargo: { good: GoodId; qty: number }[], atPort: PortId): number {
  return cargo.reduce((sum, c) => {
    const price = getPortPrice(state, atPort, c.good, false);
    return sum + price * c.qty;
  }, 0);
}

export function getShipCapacity(state: GameState, tier: number): number {
  const mods = getEffectiveModifiers(state);
  const base = balance.shipTiers[tier]?.capacity ?? 20;
  return Math.floor(base * (1 + mods.capacityBonus));
}

export function buyGood(
  state: GameState,
  shipId: string,
  goodId: GoodId,
  qty: number,
): GameState {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship || !ship.portId || ship.inTransit || qty <= 0) return state;

  const portId = ship.portId;
  const port = state.ports[portId];
  const stock = port.stocks[goodId];
  const capacity = getShipCapacity(state, ship.tier);
  const currentWeight = getCargoWeight(ship.cargo);

  let totalCost = 0;
  let bought = 0;
  let newActual = stock.actual;
  const newCargo = ship.cargo.map((c) => ({ ...c }));

  for (let i = 0; i < qty; i++) {
    if (currentWeight + bought >= capacity) break;
    if (newActual <= 0) break;

    const price = getPortPrice(
      { ...state, ports: { ...state.ports, [portId]: { ...port, stocks: { ...port.stocks, [goodId]: { ...stock, actual: newActual } } } } },
      portId,
      goodId,
      true,
    );
    if (state.gold - totalCost < price) break;

    totalCost += price;
    newActual -= 1;
    bought += 1;

    const existing = newCargo.find((c) => c.good === goodId);
    if (existing) existing.qty += 1;
    else newCargo.push({ good: goodId, qty: 1 });
  }

  if (bought === 0) return state;

  const newPorts = { ...state.ports };
  newPorts[portId] = {
    ...port,
    stocks: {
      ...port.stocks,
      [goodId]: { ...stock, actual: newActual },
    },
  };

  const newShips = state.ships.map((s) =>
    s.id === shipId ? { ...s, cargo: newCargo } : s,
  );

  return {
    ...state,
    gold: state.gold - totalCost,
    ports: newPorts,
    ships: newShips,
    stats: { ...state.stats, tradesCompleted: state.stats.tradesCompleted + 1 },
  };
}

export function sellGood(
  state: GameState,
  shipId: string,
  goodId: GoodId,
  qty: number,
): GameState {
  const ship = state.ships.find((s) => s.id === shipId);
  if (!ship || !ship.portId || ship.inTransit || qty <= 0) return state;

  const portId = ship.portId;
  const port = state.ports[portId];
  const stock = port.stocks[goodId];
  const cargoItem = ship.cargo.find((c) => c.good === goodId);
  if (!cargoItem || cargoItem.qty <= 0) return state;

  const toSell = Math.min(qty, cargoItem.qty);
  let totalEarned = 0;
  let newActual = stock.actual;
  const newCargo = ship.cargo
    .map((c) => {
      if (c.good !== goodId) return c;
      return { ...c, qty: c.qty - toSell };
    })
    .filter((c) => c.qty > 0);

  for (let i = 0; i < toSell; i++) {
    const price = getPortPrice(
      { ...state, ports: { ...state.ports, [portId]: { ...port, stocks: { ...port.stocks, [goodId]: { ...stock, actual: newActual } } } } },
      portId,
      goodId,
      false,
    );
    totalEarned += price;
    newActual += 1;
  }

  const newPorts = { ...state.ports };
  newPorts[portId] = {
    ...port,
    stocks: {
      ...port.stocks,
      [goodId]: { ...stock, actual: newActual },
    },
  };

  const newShips = state.ships.map((s) =>
    s.id === shipId ? { ...s, cargo: newCargo } : s,
  );

  return {
    ...state,
    gold: state.gold + totalEarned,
    ports: newPorts,
    ships: newShips,
    stats: {
      ...state.stats,
      tradesCompleted: state.stats.tradesCompleted + 1,
      totalGoldEarned: state.stats.totalGoldEarned + totalEarned,
    },
  };
}

export function regenerateMarkets(state: GameState): GameState {
  const newPorts = { ...state.ports };

  for (const portId of Object.keys(newPorts) as PortId[]) {
    const port = newPorts[portId];
    const def = getPortDef(portId);
    const newStocks = { ...port.stocks };
    const newHistory = { ...port.priceHistory };

    for (const goodId of goodIds) {
      let target = getStockTarget(portId, goodId);

      if (state.activeEvent?.type === 'plague' && state.activeEvent.targetPort === portId) {
        if (def.produces[0] === goodId) target = 0;
      }

      const rate = getRegenRate(portId, goodId);
      const stock = newStocks[goodId];
      const newActual = regenStock(stock.actual, target, rate);
      newStocks[goodId] = { actual: newActual, target };

      const basePrice = getGoodDef(goodId).basePrice;
      const price = getPrice(newActual, target, basePrice);
      const hist = [...(newHistory[goodId] ?? []), price];
      if (hist.length > 20) hist.shift();
      newHistory[goodId] = hist;
    }

    newPorts[portId] = { ...port, stocks: newStocks, priceHistory: newHistory };
  }

  return { ...state, ports: newPorts };
}

export function initPortStocks(portId: PortId): Record<GoodId, PortStock> {
  const stocks = {} as Record<GoodId, PortStock>;
  for (const goodId of goodIds) {
    const target = getStockTarget(portId, goodId);
    stocks[goodId] = { actual: target, target };
  }
  return stocks;
}

export function initPriceHistory(portId: PortId): Record<GoodId, number[]> {
  const history = {} as Record<GoodId, number[]>;
  for (const goodId of goodIds) {
    const target = getStockTarget(portId, goodId);
    const basePrice = getGoodDef(goodId).basePrice;
    history[goodId] = [getPrice(target, target, basePrice)];
  }
  return history;
}

export function createPortState(portId: PortId): PortState {
  return {
    id: portId,
    stocks: initPortStocks(portId),
    priceHistory: initPriceHistory(portId),
  };
}
