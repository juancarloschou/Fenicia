# Game Design Document — MVP v1.0

**Merchant Kings: Mediterranean**

---

## 1. Overview

| Field | Value |
|-------|-------|
| Genre | Economic simulator / light turn-based strategy |
| Platform | Browser (itch.io) + mobile-friendly web |
| Players | 1 (single player) |
| Session | 2–5 min per visit; 3–6 hours full run |
| References | Drug Wars, Patrician, Anno (lite), Civilization (turn pacing) |

### Pitch

You are the founder of a Phoenician trading house around 800 BCE. You do not conquer — you trade, discover routes, and build a legacy your descendants inherit, each with their own talent.

### Design Pillars

1. Never more than **4 active ships** — depth from economy, not unit count.
2. **Player-controlled pace** — world advances only on "End Turn". Closing the app changes nothing.
3. Every buy/sell is a **readable bet** — player always knows why they gained or lost gold.
4. **Dynasty** gives emotional continuity without demographic simulation.

---

## 2. Core Game Loop

```
┌─────────────────────────────────────────────┐
│ 1. Review home port (prices, warehouse)      │
│ 2. Buy cheap goods                           │
│ 3. Send ship to destination (travel = turns) │
│ 4. End turn (or Advance to next event)       │
│ 5. Ship arrives → sell + buy                 │
│ 6. Repeat                                    │
│                                              │
│ Every 8–15 turns: random event               │
│ Every 40–60 turns: generation change         │
└─────────────────────────────────────────────┘
```

Target: **< 60 seconds per decision cycle**.

---

## 3. Time System — Turns, No Real-Time Clock

**Rejected:** Real-time waiting (Hay Day / Clash of Clans model).

**Adopted:** Pure turn-based. Nothing moves unless the player presses "End Turn". This matches PC strategy habits and works equally well in browser.

### 3.1 Turn Structure

1. Player reviews state: ports, ships in transit, market, events.
2. For each ship **in port** (not in transit):
   - Buy / sell goods
   - Assign destination (ship enters route until arrival)
   - Repair damaged ship (gold sink — see §7)
3. Player presses **End Turn**.
4. Simultaneous resolution:
   - All ships in transit advance 1 turn toward destination
   - Markets regenerate stock (§4.2)
   - Pirate encounters on dangerous routes
   - Random event check
   - Generation change check
5. Next turn begins.

A "6-turn voyage" = 6 End Turn presses, at whatever pace the player chooses.

### 3.2 Skip Empty Turns — "Advance to Next Event"

**Problem:** Clicking End Turn 6–10 times with nothing to decide while a ship sails.

**Solution:** Button **"Advance to Next Event"** — auto-skips consecutive turns while no decision is pending. Stops when:
- A ship arrives at port
- A random event fires or ends
- A pirate encounter occurs
- Generation changes

Player can still advance turn-by-turn manually. Same logic as Civilization's "next turn" when no units have moves left.

---

## 4. Economy — Living Market

### 4.1 Goods (v1 — 6 only)

| Good | Category | Base Price | Volatility |
|------|----------|------------|------------|
| Grain | Basic | 4 | Low |
| Wood | Basic | 6 | Low |
| Pottery | Manufactured | 12 | Medium |
| Wine | Manufactured | 18 | Medium |
| Copper | Raw material | 25 | High |
| Purple dye | Luxury | 90 | Very high |

**Excluded from v1:** Stone, iron, oil, slaves — adds complexity without distinct gameplay in MVP.

### 4.2 Dynamic Price Formula

Each port tracks per good:

```
stock_actual   → current warehouse amount
stock_target   → equilibrium level (defined per city)
base_price     → price when stock_actual == stock_target
```

**Price at transaction:**

```
ratio  = stock_actual / stock_target
price  = base_price × (2 - ratio)    [clamped 0.3× – 3.0×]
```

- Player buys heavily → stock drops → ratio low → price rises (up to ×3)
- Player floods market → stock rises → ratio high → price falls (up to ×0.3)

**Regeneration per turn:**

```
stock_actual += (stock_target - stock_actual) × regen_rate
```

| Type | regen_rate |
|------|------------|
| City produces this good | 0.03 / turn |
| City only consumes/imports | 0.01 / turn |

**Bulk trades:** Price recalculates incrementally per unit (or small internal batches). Buying 50 at once yields worse average price than 10×5.

**Config:** All rates in a JSON/config file — not hardcoded — for playtesting.

### 4.3 Production & Demand by City

| City | Produces (cheap to buy) | Demands (expensive to sell) |
|------|-------------------------|----------------------------|
| Tyre (home) | Purple dye, Pottery | Grain, Wood |
| Byblos | Wood, Wine | Copper, Pottery |
| Cyprus | Copper | Grain, Wine |
| Crete | Wine, Pottery | Copper, Dye |
| Carthage | Grain | Wood, Pottery |
| Rhodes | Pottery, Grain | Dye, Copper |

Each city **produces** 2 goods (high stock_target, high regen → prices tend low) and **demands** 2 goods (low stock_target → prices tend high). Natural trade routes emerge without tutorial.

### 4.4 Market Information (Delayed Prices)

**Default:** Player sees prices at all **known** ports, but with **delay**:
- Nearby ports (≤3 turns): prices from **1 turn ago**
- Medium distance (4–5 turns): **2 turns ago**
- Far ports (6+ turns, e.g. Carthage): **3 turns ago**

This makes long voyages strategic (predict trends) rather than blind gambling.

**Explorer trait:** One distant port shows **real-time** prices (spy network fantasy).

---

## 5. Ships

| Stat | Tier 1 | Tier 2 | Tier 3 |
|------|--------|--------|--------|
| Capacity | 20 t | 35 t | 55 t |
| Speed | 1× | 1.25× | 1.5× |
| Crew (pirate defense) | 5 | 8 | 12 |
| Upgrade cost | — | 400 gold | 1200 gold |

- **Fleet cap v1:** 3 ships (4th unlocks via prestige milestone in v2)
- Ships have **editable names** — small emotional attachment hook
- **New ship cost:** 800 gold (gold sink)

---

## 6. Map & Distances

Fixed map, 6 ports. Travel in **turns**:

| Route | Turns |
|-------|-------|
| Tyre ↔ Byblos | 2 |
| Tyre ↔ Cyprus | 3 |
| Tyre ↔ Crete | 5 |
| Tyre ↔ Rhodes | 4 |
| Tyre ↔ Carthage | 8 |
| Cyprus ↔ Crete | 4 |
| Crete ↔ Carthage | 6 |

**Carthage** is deliberately farthest — late-game reward with best grain margins. Long distance = opportunity cost (ship tied up N turns), not real-time punishment.

**Dangerous routes (pirates):** Tyre–Carthage, Crete–Carthage.

---

## 7. Pirates (Simplified Risk)

On entering a dangerous route, encounter check:

```
encounter_chance = 0.15 + (cargo_value / 1000) × 0.05   [cap 0.5]
```

On encounter, player chooses one:

| Option | Result |
|--------|--------|
| **Pay bribe** | Lose 10% cargo value; continue |
| **Flee** | Speed vs pirate roll; fail → lose 25% cargo + 2 extra turns |
| **Fight** | Crew vs pirate roll; win → keep all (rare loot); lose → lose 50% cargo + ship **damaged** |

**Damaged ship:** Next voyage 50% slower until **repaired in port**.

**Repair cost (gold sink):** `cargo_value_at_damage × 0.15` (minimum 50 gold). No free auto-repair. If player lacks gold, ship stays slow until they can pay.

No tactical minigame — one decision, immediate result.

---

## 8. Random Events

Every **8–15 turns**, chance to trigger one event (only one active at a time). Duration: **5–10 turns**.

Events announced **2–3 turns in advance** ("Drought looming in Carthage") so player can react.

| Event | Effect |
|-------|--------|
| **Drought** | Grain ×3 in affected region (2–3 ports) |
| **Festival** | Wine ×2.5 at one specific port |
| **Plague** | One port stops producing main good (stock_target = 0 temporarily) |
| **War** | Dangerous routes: pirate chance → 80%; bribe cost ×3 (route stays **open**) |
| **Good harvest** | Grain & wood prices drop in a region |

**Design note:** "War" no longer closes routes — avoids trapping ships with no player agency (see DESIGN-NOTES.md).

---

## 9. Dynasty System

### 9.1 Structure

- Game divided into **generations** (~40–60 turns each, slight randomness)
- On generation end: brief screen — portrait, name, 1–2 traits
- **5 generations** per full game (or player retires early)

### 9.2 Traits (v1 deck — 8 cards, draw 2 per generation)

| Trait | Effect |
|-------|--------|
| Negotiator | −10% buy prices at all ports |
| Navigator | +15% ship speed |
| Builder | Reserved for v2 (colonies) |
| Explorer | Real-time prices for 1 undiscovered/distant port |
| Cautious | −30% pirate encounter chance |
| Ambitious | +20% gold from Festival events |
| Thrifty | −15% ship upgrade costs |
| Bold | +25% success fighting pirates |

Player does **not** choose heir — random draw forces adaptation and replay variety.

Visual: simple timeline / family tree showing ancestors and traits.

### 9.3 Family Relics (Legacy — replaces stacked trait inheritance)

On generation change:
- New heir gets **fresh 2 traits** (full effect)
- Previous generation leaves **one family relic** (permanent passive, small effect)

Examples:
- *Grandfather's ring:* +5% cargo capacity
- *Tyrian ledger:* −5% buy prices
- *Blessed compass:* +5% flee success

Max **4 relics** by generation 5 (one per past generation). Clean, readable — no "Christmas tree" of 6+ stacked buffs.

---

## 10. Progression & Scoring

### 10.1 Prestige (Final Score)

```
Prestige = Total_gold × 1
         + Ports_discovered × 200
         + Ship_upgrades_purchased × 150
         + Generations_completed × 300
         + Relics_collected × 100
```

End screen: score + saga summary (traits per generation, best routes, total gold).

### 10.2 Difficulty Curve

| Generation | Feel |
|------------|------|
| 1 | Generous market; no pirates on short routes; mild events |
| 2–3 | More pirates; Carthage route becomes profitable but risky |
| 4–5 | Harsher events (plague, war); player has upgraded ships + relics |

---

## 11. UI / UX

### Screens

**Main map**
- Top-down board style
- Port icons, ship icons (position reflects voyage progress: 2/5 turns)
- Tap port → port screen
- Tap ship → ship detail / assign route

**Port screen**
- List of 6 goods with:
  - Current price (↑↓ vs base)
  - Price age indicator ("2 turns old" for delayed info)
  - Cargo hold quantity
  - +/- or slider to buy/sell

**Turn bar (always visible)**
- Current turn / generation
- **End Turn**
- **Advance to Next Event**
- Active event banner (if any)

### Mobile Considerations

- Touch-friendly buttons (min 44px)
- Responsive layout (portrait primary)
- No push notifications (no real-time clock)

### Art Direction

- Board-game top view
- Mediterranean earthy palette (ochre, sea blue, terracotta)
- Simple iconography: amphorae, bales, coins
- Static or 2–3 frame sprites

---

## 12. MVP Checklist

- [ ] 6 ports with dynamic market (price formula + regeneration)
- [ ] 1–3 ships with 3 upgrade tiers
- [ ] Turn system (no real-time) + Advance to Next Event
- [ ] Delayed market prices + Explorer exception
- [ ] Pirates on 2 routes, 3 resolution options + paid repair
- [ ] 5 event types (with War = risk, not closure)
- [ ] Dynasty: 8 traits, 5 generations, family relics
- [ ] Final score / saga summary screen
- [ ] Map UI + port trade UI
- [ ] Save/load (localStorage JSON)

### Explicitly Out of v1

- Colonies
- Technology tree
- Naval combat detail
- AI rival nations
- New continent exploration
- More than 6 ports
- Multiplayer

---

## 13. Design Risks

| Risk | Mitigation |
|------|------------|
| Dead market (regen too low) | Config-file tuning; spreadsheet simulation before coding |
| Empty turn tedium | Advance to Next Event button |
| Useless traits | Playtest all 8 for comparable gold/hour impact |
| Gold inflation | Repair costs, ship purchases, upgrade costs as sinks |
| Blind long voyages | Delayed prices + trend arrows |

---

## 14. Balance Constants (Starter Values)

All values live in `config/balance.json` for tuning.

```json
{
  "regen_production": 0.03,
  "regen_import": 0.01,
  "price_clamp_min": 0.3,
  "price_clamp_max": 3.0,
  "pirate_base_chance": 0.15,
  "pirate_cargo_factor": 0.05,
  "pirate_max_chance": 0.5,
  "event_interval_min": 8,
  "event_interval_max": 15,
  "generation_turns_min": 40,
  "generation_turns_max": 60,
  "price_delay_near": 1,
  "price_delay_medium": 2,
  "price_delay_far": 3,
  "repair_cost_ratio": 0.15,
  "repair_cost_min": 50,
  "new_ship_cost": 800
}
```
