# Publication Strategy

## Recommended Path: Web-First on itch.io

Google Play now requires ~20 testers for 14 days for new developer accounts — impractical for solo hobbyists. **Do not start with native mobile stores.**

### Primary: itch.io

1. Build as **HTML5** (static export from Vite + React — `npm run build` → `dist/` zip)
2. Create itch.io project → Kind: **HTML**
3. Upload `.zip` of build output
4. Check "This file will be played in the browser"
5. Set viewport (responsive or 1280×720)
6. Tags: `Strategy`, `Economy`, `Turn-Based`, `Historical`, `Casual`, `Singleplayer`, `Browser`

**Why itch.io:** Zero review friction, instant publish, indie audience loves board-game-style strategy.

### Secondary: Own URL

- **GitHub Pages** or **Vercel** — free hosting
- Share link on social / Reddit
- Same build as itch.io upload

### Tertiary: Web Game Portals

After polish, submit to:
- **Poki**, **CrazyGames**, **Y8** (HTML5 portals, large casual audience)

Requires some SDK integration for ads — do after itch.io validates fun.

### If Native Android Needed Later

- **Amazon Appstore** — simpler review than Google Play
- Wrap web build in **Capacitor** or **TWA** (Trusted Web Activity)
- Still avoid Google Play until you have tester network

---

## Exporting from Vite

### Single-player (no backend) — Recommended for Fenicia

```ts
// vite.config.ts
export default defineConfig({
  base: './',  // required for itch.io relative paths
})
```

```bash
npm run build
# Output in /dist → zip contents → upload to itch.io
cd dist && zip -r ../fenicia-v1.zip .
```

Save game via `localStorage` — no server needed.

---

## Visibility Checklist

- [ ] Strong cover art (map + ship + Mediterranean palette)
- [ ] 3–5 screenshots (map, port trade, event, dynasty screen, end score)
- [ ] Short gameplay GIF
- [ ] Clear description: "Drug Wars meets Phoenician traders, turn-based"
- [ ] Post to r/WebGames, r/indiegames, r/playmygame
- [ ] Tag historical strategy communities

---

## Monetization (Optional)

| Model | Fit |
|-------|-----|
| Free | Best for visibility and feedback |
| Pay what you want | itch.io default; works well |
| Fixed price ($3–5) | After v2 with colonies |
| Ads | Only on portal versions (Poki etc.) |

Recommendation: **Free / pay-what-you-want** for v1. Goal is players and feedback, not revenue.

---

## Legal / Content

- No slave trade mechanic (removed from design)
- Historical disclaimer: simplified fiction, not academic simulation
- itch.io allows browser games with no age gate for this content
