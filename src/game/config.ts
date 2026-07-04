import balanceData from '../../config/balance.json';
import goodsData from '../../config/goods.json';
import portsData from '../../config/ports.json';
import routesData from '../../config/routes.json';
import traitsData from '../../config/traits.json';
import relicsData from '../../config/relics.json';

export type GoodId = 'grain' | 'wood' | 'pottery' | 'wine' | 'copper' | 'dye';
export type PortId = 'tyre' | 'byblos' | 'cyprus' | 'rhodes' | 'crete' | 'carthage';

export interface GoodDef {
  id: GoodId;
  name: string;
  category: string;
  basePrice: number;
  icon: string;
}

export interface PortDef {
  id: PortId;
  name: string;
  isHome: boolean;
  startUnlocked: boolean;
  scoutCost: number;
  x: number;
  y: number;
  produces: GoodId[];
  demands: GoodId[];
  adjacent: PortId[];
}

export interface RouteDef {
  from: PortId;
  to: PortId;
  turns: number;
  dangerous: boolean;
}

export interface TraitDef {
  id: string;
  name: string;
  description: string;
  effect: Record<string, number | boolean>;
}

export interface RelicDef {
  id: string;
  name: string;
  description: string;
  effect: Record<string, number>;
}

export interface BalanceConfig {
  startingGold: number;
  regenProduction: number;
  regenImport: number;
  priceClampMin: number;
  priceClampMax: number;
  stockTargetProduce: number;
  stockTargetDemand: number;
  pirateBaseChance: number;
  pirateCargoFactor: number;
  pirateMaxChance: number;
  pirateWarChance: number;
  pirateWarBribeMultiplier: number;
  eventIntervalMin: number;
  eventIntervalMax: number;
  eventWarningTurns: number;
  eventDurationMin: number;
  eventDurationMax: number;
  generationTurnsMin: number;
  generationTurnsMax: number;
  totalGenerations: number;
  priceDelayNear: number;
  priceDelayMedium: number;
  priceDelayFar: number;
  repairCostRatio: number;
  repairCostMin: number;
  newShipCost: number;
  maxShips: number;
  shipUpgradeCosts: number[];
  shipTiers: { capacity: number; speed: number; crew: number }[];
  bribePercent: number;
  fleeFailCargoLoss: number;
  fleeFailExtraTurns: number;
  fightFailCargoLoss: number;
  fightWinLootChance: number;
  fightWinLootAmount: number;
}

export interface PortStock {
  actual: number;
  target: number;
}

export interface PortState {
  id: PortId;
  stocks: Record<GoodId, PortStock>;
  priceHistory: Record<GoodId, number[]>;
}

export interface Cargo {
  good: GoodId;
  qty: number;
}

export interface ShipState {
  id: string;
  name: string;
  tier: number;
  portId: PortId | null;
  originId: PortId | null;
  destinationId: PortId | null;
  turnsRemaining: number;
  totalTurns: number;
  cargo: Cargo[];
  damaged: boolean;
  damageCargoValue: number;
  inTransit: boolean;
  pirateChecked: boolean;
}

export type EventType = 'drought' | 'festival' | 'plague' | 'war' | 'harvest';

export interface GameEvent {
  type: EventType;
  turnsRemaining: number;
  affectedPorts: PortId[];
  targetPort?: PortId;
  targetGood?: GoodId;
}

export interface PendingEventWarning {
  type: EventType;
  turnsUntil: number;
  affectedPorts: PortId[];
  targetPort?: PortId;
}

export interface PirateEncounter {
  shipId: string;
  cargoValue: number;
}

export interface HeirRecord {
  name: string;
  traits: TraitDef[];
  turnsServed: number;
  goldEarned: number;
}

export interface DynastyState {
  generation: number;
  turnsLeft: number;
  currentTraits: TraitDef[];
  heirs: HeirRecord[];
  explorerPortId: PortId | null;
}

export interface GameStats {
  totalGoldEarned: number;
  portsDiscovered: number;
  upgradesPurchased: number;
  routesCompleted: number;
  tradesCompleted: number;
}

export type GamePhase = 'playing' | 'heir' | 'ended';

export interface GameState {
  turn: number;
  gold: number;
  phase: GamePhase;
  knownPorts: PortId[];
  ports: Record<PortId, PortState>;
  ships: ShipState[];
  activeEvent: GameEvent | null;
  pendingEventWarning: PendingEventWarning | null;
  turnsUntilNextEventCheck: number;
  pirateEncounter: PirateEncounter | null;
  dynasty: DynastyState;
  relics: RelicDef[];
  stats: GameStats;
  selectedPortId: PortId | null;
  selectedShipId: string | null;
  startingGold: number;
}

export const balance = balanceData as BalanceConfig;
export const goods = goodsData as GoodDef[];
export const portDefs = portsData as PortDef[];
export const routes = routesData as RouteDef[];
export const traits = traitsData as unknown as TraitDef[];
export const relics = relicsData as unknown as RelicDef[];

export const goodIds: GoodId[] = goods.map((g) => g.id as GoodId);
export const portIds: PortId[] = portDefs.map((p) => p.id as PortId);

export function getGoodDef(id: GoodId): GoodDef {
  return goods.find((g) => g.id === id)!;
}

export function getPortDef(id: PortId): PortDef {
  return portDefs.find((p) => p.id === id)!;
}

export function getRoute(from: PortId, to: PortId): RouteDef | undefined {
  return routes.find(
    (r) => (r.from === from && r.to === to) || (r.from === to && r.to === from),
  );
}

export function getRouteTurns(from: PortId, to: PortId): number {
  const route = getRoute(from, to);
  return route?.turns ?? 99;
}

export function isRouteDangerous(from: PortId, to: PortId): boolean {
  const route = getRoute(from, to);
  return route?.dangerous ?? false;
}
