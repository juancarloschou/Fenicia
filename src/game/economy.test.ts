import { describe, it, expect } from 'vitest';
import { getPrice, regenStock, getStockTarget } from './economy';
import { balance } from './config';
import { createInitialState } from './init';
import { buyGood } from './economy';
import { resolveTurn } from './turn';
import { assignRoute } from './ships';

describe('economy', () => {
  it('returns base price when stock equals target', () => {
    expect(getPrice(100, 100, 10)).toBe(10);
  });

  it('raises price when stock is low', () => {
    const price = getPrice(30, 100, 10);
    expect(price).toBeGreaterThan(10);
    expect(price).toBeLessThanOrEqual(10 * balance.priceClampMax);
  });

  it('lowers price when stock is high', () => {
    const price = getPrice(200, 100, 10);
    expect(price).toBeLessThan(10);
    expect(price).toBeGreaterThanOrEqual(10 * balance.priceClampMin);
  });

  it('clamps price at minimum', () => {
    const price = getPrice(1000, 100, 10);
    expect(price).toBe(10 * balance.priceClampMin);
  });

  it('clamps price at maximum when stock is very low', () => {
    const price = getPrice(1, 100, 10);
    expect(price).toBeLessThanOrEqual(10 * balance.priceClampMax);
    expect(price).toBeGreaterThan(10);
  });

  it('regenerates stock toward target', () => {
    const next = regenStock(50, 100, 0.03);
    expect(next).toBeGreaterThan(50);
    expect(next).toBeLessThan(100);
  });

  it('produce goods have higher target than demand goods', () => {
    expect(getStockTarget('tyre', 'dye')).toBeGreaterThan(getStockTarget('tyre', 'grain'));
  });
});

describe('game loop', () => {
  it('creates valid initial state', () => {
    const state = createInitialState();
    expect(state.gold).toBe(balance.startingGold);
    expect(state.ships).toHaveLength(1);
    expect(state.knownPorts).toContain('tyre');
    expect(state.knownPorts).toContain('byblos');
  });

  it('buys goods and reduces gold', () => {
    let state = createInitialState();
    const goldBefore = state.gold;
    state = buyGood(state, 'ship-1', 'grain', 5);
    expect(state.gold).toBeLessThan(goldBefore);
    expect(state.ships[0].cargo.find((c) => c.good === 'grain')?.qty).toBe(5);
  });

  it('advances ship on end turn', () => {
    let state = createInitialState();
    state = assignRoute(state, 'ship-1', 'byblos');
    expect(state.ships[0].inTransit).toBe(true);
    state = resolveTurn(state);
    expect(state.ships[0].turnsRemaining).toBeLessThan(state.ships[0].totalTurns);
  });

  it('ship arrives at destination after enough turns', () => {
    let state = createInitialState();
    state = assignRoute(state, 'ship-1', 'byblos');
    for (let i = 0; i < 5; i++) {
      if (!state.ships[0].inTransit) break;
      state = resolveTurn(state);
    }
    expect(state.ships[0].portId).toBe('byblos');
    expect(state.ships[0].inTransit).toBe(false);
  });
});
