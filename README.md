# Fenicia

**Merchant Kings: Mediterranean** — turn-based Phoenician trading strategy for browser and mobile.

## Play locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run zip` | Build + zip for itch.io → `fenicia-v1.zip` |
| `npm test` | Run Vitest unit tests |
| `npm run simulate` | Economy balance simulation |

## Publish

1. `npm run zip`
2. Upload `fenicia-v1.zip` to [itch.io](https://itch.io) as HTML project
3. Or deploy `dist/` to Vercel / GitHub Pages

See [docs/PUBLICATION.md](./docs/PUBLICATION.md) and [docs/ITCH-PAGE.md](./docs/ITCH-PAGE.md).

## Documentation

Design docs in [`docs/`](./docs/README.md).

## Status

MVP implemented — 6 ports, economy, ships, pirates, events, dynasty, scoring, save/load.
