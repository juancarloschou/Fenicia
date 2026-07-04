# Concept — Merchant Kings: Mediterranean

## Elevator Pitch

You are the founder of a Phoenician trading house around 800 BCE. You do not conquer — you trade, discover routes, and build a legacy that your descendants will inherit, each with their own talents.

## Why This Game

This project does not try to compete with modern RTS titles. It revives a mechanic that barely exists on mobile today: **trade as the core of the game**.

References:
- **Drug Wars** — dynamic buy/sell economy
- **Patrician** — Mediterranean merchant fantasy
- **Anno** — light city/trade expansion (future phases)
- **Civilization** — turn-based pacing, "next event" skip

## Core Fantasy

Control a **commercial enterprise**, not an army. A small Phoenician family grows from a single ship in Tyre to a Mediterranean trading dynasty — without conquering territory.

The player always thinks:
1. *"If I take copper there… I make a lot of money."*
2. *"Wait… a drought just hit… better load grain instead."*
3. *"Now I can build another colony."* (v2+)

## Design Pillars

1. **Never more than 4 active ships** — depth comes from the economy, not unit micromanagement.
2. **Player-controlled pace** — the world advances only when you press "End Turn". No background timers.
3. **Every buy/sell decision is a readable bet** — the player always understands why they gained or lost gold.
4. **Dynasty gives emotional continuity** — without simulating real demographics or 300 years of history.

## Core Loop

```
1. Review home port (prices, warehouse)
2. Buy cheap goods
3. Send ship to another port (travel = N turns)
4. End turn (repeat or use "Advance to next event")
5. Ship arrives → sell + buy something else
6. Return to home port → repeat

Every N cycles: random event
Every M cycles: generation change (inheritance)
```

Each decision cycle should take **under 60 seconds**: enter, see what arrived, decide what to sell/buy, send the ship, leave.

## Target Audience

- Casual strategy players who enjoy economic puzzles
- Fans of board-game-style top-down maps
- Indie / itch.io players looking for something different from F2P mobile

## Session Design

| Metric | Target |
|--------|--------|
| Per session | 2–5 minutes |
| Full game | 3–6 hours (5 generations) |
| Players | 1 (single player) |

## Visual Style

- Top-down view (board-game map)
- Ships as small icons
- Cities as simple illustrations
- Mediterranean / earthy palette
- Static sprites or 2–3 frame animations only
- Achievable by a solo developer

## Original Feature Ideas (Post-MVP)

These are intentionally **out of v1** to keep scope manageable:

- Colonies (found + upgrade levels 1–5)
- Technology tree (sails, warehouses, accounting, shipyards…)
- Nations with distinct demand (Egypt, Greece, Assyria, Rome)
- Exploration of new regions (Cyprus, Crete, Sicily, Sardinia, Spain, Atlantic)
- Victory by wealth, trade volume, prestige, colonies, or influence

## Dynasty Hook (The Differentiator)

Instead of controlling a country, you control a **merchant family**:

- The founder dies → your son inherits
- Then your grandson
- Each generation has distinct traits: better negotiator, navigator, builder, explorer

A full campaign can span 200–300 in-game years, watching a small Phoenician firm dominate Mediterranean trade through commerce alone — not conquest.

In MVP this is simplified to **5 generations** with trait cards, not a full demographic simulation.

## Working Title

**Merchant Kings: Mediterranean**

Project folder name: **Fenicia**
