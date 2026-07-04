# Technical Notes — Implementation Hints

Solo-dev guidance for building Fenicia with React / Next.js (or Vite + React).

---

## Architecture

### State Management

Single source of truth for entire game:

```typescript
interface GameState {
  turn: number;
  gold: number;
  generation: number;
  generationTurnsLeft: number;
  ports: Port[];
  ships: Ship[];
  activeEvent: GameEvent | null;
  pendingEventWarning: GameEvent | null;
  dynasty: DynastyState;
  relics: Relic[];
  priceHistory: Record<PortId, Record<GoodId, number[]>>;
}
```

- **React Context** or **Zustand** for state
- All game logic in pure functions (`/src/game/`) — no UI coupling
- Turn resolution: `resolveTurn(state) → newState`

### Save System

```typescript
localStorage.setItem('fenicia_save', JSON.stringify(state));
```

Turn-based = trivial serialization. Auto-save after every End Turn.

---

## Project Structure (Suggested)

```
src/
  game/
    economy.ts      # price formula, regen, buy/sell
    ships.ts        # movement, upgrades, repair
    pirates.ts      # encounter rolls, outcomes
    events.ts       # trigger, apply, expire
    dynasty.ts      # traits, relics, generation change
    turn.ts         # resolveTurn, advanceToNextEvent
    config.ts       # load balance.json
  components/
    MapView.tsx
    PortPanel.tsx
    ShipPanel.tsx
    TurnBar.tsx
    DynastyTimeline.tsx
    EventBanner.tsx
  hooks/
    useGameState.ts
config/
  balance.json
  ports.json
  goods.json
docs/
  ...
```

---

## Key Algorithms

### End Turn Resolution (pseudocode)

```
function resolveTurn(state):
  for ship in state.ships where ship.inTransit:
    ship.turnsRemaining -= ship.speedModifier
    if ship.turnsRemaining <= 0:
      ship.arrive()
    else if ship.onDangerousRoute:
      maybePirateEncounter(ship)

  for port in state.ports:
    for good in port.goods:
      regenStock(port, good)

  updatePriceHistory(state)

  if state.pendingEventWarning:
    maybeActivateEvent(state)
  else:
    maybeWarnOrTriggerEvent(state)

  if state.generationTurnsLeft <= 0:
    advanceGeneration(state)

  state.turn += 1
  return state
```

### Advance to Next Event

```
function advanceToNextEvent(state):
  loop:
    if hasPendingDecision(state):
      break
    state = resolveTurn(state)
    if stoppedAtEvent(state):
      break
  return state
```

`hasPendingDecision`: any ship in port, pirate encounter awaiting choice, event ending, generation transition.

---

## UI Implementation

### Map

- Fixed port coordinates as CSS `position: absolute` percentages
- Ship position: lerp between origin/dest based on `(totalTurns - remaining) / totalTurns`
- Optional: Framer Motion for smooth transitions
- No Canvas required for MVP

### Port Panel

- Table of goods: name, price, trend arrow, delay badge, cargo qty
- Buy/sell buttons call `economy.buy(state, port, good, qty)`

### Mobile

- CSS `@media (max-width: 768px)` — stack panels vertically
- Map top, details bottom sheet on port tap
- Minimum touch target 44×44px

---

## Tech Stack Options

| Stack | Pros | Cons |
|-------|------|------|
| **Vite + React + TS** | Fast, simple static build | Less structure |
| **Next.js static export** | Familiar if you've used it | Heavier for pure client game |
| **Phaser.js** | Game loops, sprites | Overkill for UI-heavy trade game |

**Recommendation:** Vite + React + TypeScript. Fenicia is 90% UI, 10% simulation.

---

## Testing Strategy

### Unit tests (Vitest)

- Price formula edge cases (ratio 0, ratio 10, clamp)
- Stock regen converges to target
- Pirate probability cap
- Turn resolution: ship arrives on correct turn

### Balance script

Node script that simulates 500 turns with random AI trader — output CSV of prices per port. Tune `balance.json` until curves look healthy.

---

## itch.io Build

```bash
npm run build
cd dist  # or out/
zip -r ../fenicia-v1.zip .
```

Upload `fenicia-v1.zip` to itch.io as HTML project.

Viewport meta for mobile:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

---

## Performance

- Entire state < 50KB JSON — no performance concerns
- No network calls in MVP
- Target: 60fps UI, < 2s initial load on mobile 4G
