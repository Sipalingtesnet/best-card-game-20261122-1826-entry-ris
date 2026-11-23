# The Gilded Table — Evaluation Round

## Defects found and fixed

1. **Deck reshuffle lost (rule bug).** In `game/src/main.js`, `drawCard` reshuffled the discard into a *new* local array and never wrote it back to the caller's deck, so after the first refill the deck stayed permanently empty. Fixed by mutating the deck array in place (`deck.length = 0; deck.push(...refilled)`), so the refill persists across draws.

2. **AI could play more than 2 cards (rule bug).** In `game/src/cards.js`, `aiChoosePlays` played a Ward *and then* two attacks, reaching 3 cards, violating "Never play more than 2 cards." Fixed by capping the total at 2 plays: a Ward (when the low-life condition is met) plus at most one attack.

3. **Card-name legibility.** In `game/src/render.js`, long card names (e.g. "Sky Sovereign") were cramped at a fixed 13px on the 112px card. Fixed with an adaptive name size (11/12/13px by name length) so every name stays readable.

4. **"not enough mana" overlay legibility.** In `game/src/render.js`, the dim grey 12px overlay text was hard to read. Fixed to white bold 13px on a slightly darker overlay for clear contrast.

## Logic simulation

Ran `node logic-sim.mjs`: 200 games of random legal play for both sides (30-turn cap). Result: **171 wins for you, 29 wins for the rival, 0 draws, 0 assert failures** — no negative mana, no hand over 7, no life above 30, and every game reached a winner or the turn cap.

## Final screenshots

| File | Size | Dimensions |
|------|------|------------|
| screenshots/1-start.jpg | 52,908 B | 1280x720 |
| screenshots/2-play.jpg | 65,468 B | 1280x720 |
| screenshots/3-win.jpg | 47,207 B | 1280x720 |
| screenshots/4-lose.jpg | 44,533 B | 1280x720 |

All four are under 256 KiB, 1280x720, and re-shot with 0 console errors / 0 uncaught exceptions / 0 failed requests.