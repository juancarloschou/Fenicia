# Design Notes — Evaluation & Refinements

## Verdict: Worth Building

This project is well-scoped for a solo indie dev targeting itch.io. The core hook — **trade as gameplay** with a **dynasty layer** — is genuinely underserved on mobile and browser.

Strengths:
- Turn-based (no F2P stigma) fits PC and casual strategy players
- 6 goods × 6 ports = closed economy, easy to balance in config
- Dynasty as narrative-flavored buff system = high flavor, low code cost
- Board-game visuals = achievable art scope

---

## Problems in Original Scope (Cut for MVP)

The initial brainstorm bundled ~6 games into one:

| System | MVP | Later |
|--------|-----|-------|
| Living economy | ✅ | — |
| Ships & pirates | ✅ | — |
| Dynasty traits | ✅ | — |
| Events | ✅ | — |
| Colonies (5 levels) | ❌ | v2 |
| Tech tree | ❌ | v3 |
| Nations / AI rivals | ❌ | v3 |
| 300-year simulation | ❌ | Simplified to 5 generations |
| Exploration continents | ❌ | v2+ |

---

## Refinements Applied

### 1. Real-Time vs Turn-Based

**Original conflict:** Pillars mentioned "world advances while not playing" but player preferred no waiting.

**Resolution:** Pure turn-based only. Closing the app freezes the world. "Advance to Next Event" solves empty-turn tedium without real-time clocks.

### 2. Pirate Repair as Gold Sink

**Problem:** Damaged ships auto-repairing removes economic pressure; gold accumulates too fast.

**Fix:** Repair costs gold in port (`15% of cargo value at damage`, min 50). Ship stays slow until paid. Also: new ships cost 800 gold.

### 3. Market Visibility

**Problem:** Hidden prices make 8-turn Carthage voyages feel like blind luck.

**Fix:** All known ports show **delayed** prices (1–3 turns old by distance). Explorer trait grants real-time prices for one port. Game becomes about **trends**, not roulette.

### 4. Dynasty Legacy — Relics Not Stacked Traits

**Problem:** Inheriting 50% of past traits × 5 generations = 6–7 modifiers → breaks "readable decisions" pillar.

**Fix:** Each generation leaves **one family relic** (small permanent buff). Heir gets 2 fresh traits. Max 4 relics by game end.

### 5. War Event — Risk Not Lockout

**Problem:** Closing a route can trap ships in port with nothing to do.

**Fix:** War increases pirate chance to 80% and triples bribe cost on affected routes. Route stays open; player chooses whether risk is worth reward.

### 6. Goods Count

**Original:** 10 resources including slaves.

**Fix:** 6 goods in v1. Slaves removed — no distinct mechanic, tonal/review risk on itch.io.

---

## What Makes It Addictive

The player should constantly re-evaluate:

```
"If I take copper to Rhodes… big profit."
     ↓
"Wait, drought in Carthage — grain is ×3 there now."
     ↓
"I can afford a second ship."
     ↓
"My heir is a Navigator — time to push the Carthage route."
```

This loop — **spot opportunity → react to event → reinvest → adapt to new generation** — is the retention engine.

---

## Playtest Priority

Before writing game code, simulate §4.2 market formula in a spreadsheet or small script:

1. Run 200 turns of AI traders buying/selling randomly
2. Check: do prices stay in 0.3×–3.0× range?
3. Check: does stock regenerate fast enough that routes stay profitable?
4. Check: can a skilled player 3× starting gold in 40 turns?

If the economy feels alive in simulation, the rest of the game will work.

---

## Competitive Position

| vs | Fenicia |
|----|---------|
| Modern RTS | No unit spam; 3–4 ships max |
| F2P city builders | No timers; player controls pace |
| Drug Wars clones | Map + dynasty + events add depth |
| Patrician / Anno | Much smaller scope; browser-first |

Niche but defensible. Perfect for itch.io + r/WebGames launch.
