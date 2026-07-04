# Fenicia — Design Documentation

**Merchant Kings: Mediterranean** — A turn-based Phoenician trading strategy game for browser and mobile (itch.io).

## Documents

| Document | Description |
|----------|-------------|
| [CONCEPT.md](./CONCEPT.md) | Original vision, pitch, and design pillars |
| [GDD-MVP.md](./GDD-MVP.md) | Full Game Design Document — MVP v1.0 with mechanics and formulas |
| [DESIGN-NOTES.md](./DESIGN-NOTES.md) | Evaluation, risks, and refinements applied to the design |
| [ROADMAP.md](./ROADMAP.md) | Post-launch feature roadmap (v2–v4) |
| [PUBLICATION.md](./PUBLICATION.md) | Distribution strategy (itch.io, web, alternatives to Google Play) |
| [TECH-NOTES.md](./TECH-NOTES.md) | Implementation hints for solo dev (Next.js / React) |

## Quick Summary

- **Genre:** Economic simulator / light turn-based strategy
- **Platform:** Browser (HTML5) + mobile-friendly; primary target: itch.io
- **Core loop:** Buy cheap → sail → sell where demand is high → earn gold → upgrade ships → repeat
- **Differentiator:** Dynasty system — each generation inherits with unique traits; build a merchant legacy over 5 generations
- **Time model:** Pure turn-based — no real-time clock, no waiting while app is closed
- **Scope:** MVP is deliberately small — 6 ports, 6 goods, 3 ships, no colonies in v1

## Status

Design phase — no code yet. Start with market formula playtesting before full implementation.
