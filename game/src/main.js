// The Gilded Table — game loop and state.
import { W, H, LIFE, MAX_MANA, HAND_MAX, TURN1_MANA } from './config.js';
import { buildDeck, shuffleDeck, cardDamage, aiChoosePlays, WARD_SHIELD } from './cards.js';
import { render } from './render.js';
import { makeInput } from './input.js';
import { sfx, setMuted, isMuted } from './audio.js';
import { applyShot } from './shots.js';

export function newState() {
  return {
    phase: 'title',
    turn: 1,
    yourLife: LIFE,
    rivalLife: LIFE,
    yourShield: 0,
    rivalShield: 0,
    yourMana: TURN1_MANA,
    rivalMana: TURN1_MANA,
    yourMaxMana: TURN1_MANA,
    rivalMaxMana: TURN1_MANA,
    yourHand: [],
    rivalHand: [],
    yourDeck: [],
    rivalDeck: [],
    yourDiscard: [],
    rivalDiscard: [],
    yourLast: null,
    rivalLast: null,
    log: '',
    muted: false,
    aiQueue: [],
    aiT: 0,
    cardsPlayed: 0,
    hovered: -1,
  };
}

function freshGame(state) {
  const s = newState();
  s.phase = 'play';
  const rng = mulberry32(1);
  s.yourDeck = buildDeck(rng);
  s.rivalDeck = buildDeck(rng);
  for (let i = 0; i < 5; i++) {
    s.yourHand.push(s.yourDeck.pop());
    s.rivalHand.push(s.rivalDeck.pop());
  }
  s.log = 'Your turn. Play a card or end your turn.';
  return s;
}

// mulberry32 PRNG (deterministic shuffles).
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawCard(deck, discard, hand) {
  // Fix: reshuffle the discard back into the SAME deck array so the refill persists.
  if (deck.length === 0 && discard.length > 0) {
    const refilled = shuffleDeck(discard, mulberry32(2));
    deck.length = 0;
    deck.push(...refilled);
    discard.length = 0;
  }
  if (deck.length === 0) return;
  const card = deck.pop();
  if (hand.length < HAND_MAX) hand.push(card);
  else discard.push(card);
  return card;
}

function playCard(state, card, isYou) {
  const rivalLast = isYou ? state.rivalLast : state.yourLast;
  const rivalLastSuit = rivalLast ? rivalLast.suit : null;
  const dmg = cardDamage(card, rivalLastSuit);
  const advantage = card.kind === 'attack' && rivalLastSuit && cardDamage(card, rivalLastSuit) > card.power;
  if (card.kind === 'attack') {
    let remaining = dmg;
    if (isYou) {
      if (state.rivalShield > 0) {
        const absorb = Math.min(state.rivalShield, remaining);
        state.rivalShield -= absorb;
        remaining -= absorb;
      }
      state.rivalLife -= remaining;
    } else {
      if (state.yourShield > 0) {
        const absorb = Math.min(state.yourShield, remaining);
        state.yourShield -= absorb;
        remaining -= absorb;
      }
      state.yourLife -= remaining;
    }
  } else {
    if (isYou) state.yourShield += WARD_SHIELD;
    else state.rivalShield += WARD_SHIELD;
  }
  if (isYou) {
    state.yourLast = card;
    state.yourDiscard.push(card);
  } else {
    state.rivalLast = card;
    state.rivalDiscard.push(card);
  }
  state.cardsPlayed++;
  return { dmg, advantage };
}// ---- game loop ----
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = makeInput(canvas);

let state = newState();
let frozen = false;
let shot = null;

// Deterministic screenshot mode: freeze the simulation, render only.
const params = new URLSearchParams(location.search);
if (params.get('shot')) {
  shot = params.get('shot');
  applyShot(state, shot);
  frozen = true;
}

function startGame() {
  state = freshGame(state);
  sfx.turn();
}

function endYourTurn() {
  if (state.phase !== 'play') return;
  state.aiQueue = aiChoosePlays({
    aiHand: state.rivalHand,
    aiMana: state.rivalMana,
    aiLife: state.rivalLife,
    aiShield: state.rivalShield,
    yourLastSuit: state.yourLast ? state.yourLast.suit : null,
  });
  state.aiT = 0;
  state.log = 'Rival turn...';
}

function resolveAiStep() {
  const uid = state.aiQueue.shift();
  if (!uid) return;
  const idx = state.rivalHand.findIndex((c) => c.uid === uid);
  if (idx < 0) return;
  const card = state.rivalHand[idx];
  state.rivalHand.splice(idx, 1);
  state.rivalMana -= card.cost;
  const { dmg, advantage } = playCard(state, card, false);
  if (card.kind === 'attack') {
    state.log = 'Rival played ' + card.name + ' — ' + dmg + ' damage.';
    sfx.hit();
  } else {
    state.log = 'Rival played ' + card.name + ' — shield raised.';
    sfx.ward();
  }
  if (advantage) sfx.advantage();
  if (state.yourLife <= 0) {
    state.phase = 'lose';
    state.log = 'Rival played ' + card.name + ' — ' + dmg + ' damage. Defeat.';
    sfx.lose();
  }
}

function startYourTurn() {
  state.turn++;
  state.yourMaxMana = Math.min(MAX_MANA, state.turn);
  state.yourMana = state.yourMaxMana;
  state.rivalMaxMana = Math.min(MAX_MANA, state.turn);
  state.rivalMana = state.rivalMaxMana;
  drawCard(state.yourDeck, state.yourDiscard, state.yourHand);
  drawCard(state.rivalDeck, state.rivalDiscard, state.rivalHand);
  state.log = 'Your turn. Play a card or end your turn.';
  sfx.turn();
}

function handlePlayInput() {
  if (state.phase !== 'play') return;
  // keyboard 1-7
  for (let i = 1; i <= 7; i++) {
    if (input.consume(String(i))) {
      const idx = i - 1;
      if (idx < state.yourHand.length) {
        const card = state.yourHand[idx];
        if (card.cost <= state.yourMana) {
          state.yourHand.splice(idx, 1);
          state.yourMana -= card.cost;
          const { dmg, advantage } = playCard(state, card, true);
          if (card.kind === 'attack') {
            state.log = 'You played ' + card.name + ' — ' + dmg + ' damage.';
            sfx.hit();
          } else {
            state.log = 'You played ' + card.name + ' — shield raised.';
            sfx.ward();
          }
          if (advantage) sfx.advantage();
          if (state.rivalLife <= 0) {
            state.phase = 'win';
            state.log = 'You played ' + card.name + ' — ' + dmg + ' damage. Victory!';
            sfx.win();
          }
        }
      }
      return;
    }
  }
  // click a hand card
  const click = input.consumeClick();
  if (click) {
    const idx = handIndexAt(click.x, click.y);
    if (idx >= 0 && idx < state.yourHand.length) {
      const card = state.yourHand[idx];
      if (card.cost <= state.yourMana) {
        state.yourHand.splice(idx, 1);
        state.yourMana -= card.cost;
        const { dmg, advantage } = playCard(state, card, true);
        if (card.kind === 'attack') {
          state.log = 'You played ' + card.name + ' — ' + dmg + ' damage.';
          sfx.hit();
        } else {
          state.log = 'You played ' + card.name + ' — shield raised.';
          sfx.ward();
        }
        if (advantage) sfx.advantage();
        if (state.rivalLife <= 0) {
          state.phase = 'win';
          state.log = 'You played ' + card.name + ' — ' + dmg + ' damage. Victory!';
          sfx.win();
        }
      }
    }
  }
}

function handIndexAt(x, y) {
  const n = state.yourHand.length;
  if (n === 0) return -1;
  const spread = Math.min(150, 900 / n);
  const totalW = (n - 1) * spread;
  const x0 = W / 2 - totalW / 2;
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * spread;
    const hx = cx + 112 / 2;
    const hy = 548 + 152 / 2;
    if (Math.abs(x - hx) < 56 && Math.abs(y - hy) < 76) return i;
  }
  return -1;
}

function handleGlobalInput() {
  if (input.consume('m') || input.consume('M')) {
    state.muted = !state.muted;
    setMuted(state.muted);
  }
  if (input.consume('r') || input.consume('R')) {
    startGame();
    return;
  }
  if (state.phase !== 'play') {
    if (input.consume('Enter') || input.consumeClick()) {
      startGame();
    }
    return;
  }
  if (input.consume(' ') || input.consume('Enter')) {
    endYourTurn();
  }
}

function update(dt) {
  if (state.phase !== 'play') return;
  if (state.aiQueue.length > 0) {
    state.aiT += dt;
    if (state.aiT >= 0.7) {
      state.aiT = 0;
      resolveAiStep();
      if (state.aiQueue.length === 0 && state.phase === 'play') {
        startYourTurn();
      }
    }
  }
  // hover tracking
  state.hovered = handIndexAt(input.hoverX, input.hoverY);
}

let last = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (!frozen) {
    handleGlobalInput();
    handlePlayInput();
    update(dt);
  }
  render(ctx, state, now / 1000);
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);