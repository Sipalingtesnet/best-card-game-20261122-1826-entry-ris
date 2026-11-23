// Logic simulation for The Gilded Table — 30 turns of random legal play.
import { buildDeck, shuffleDeck, cardDamage, aiChoosePlays, suitBeats, WARD_SHIELD } from './game/src/cards.js';
import { CARDS, LIFE, MAX_MANA, HAND_MAX } from './game/src/config.js';

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
  if (isYou) { state.yourLast = card; state.yourDiscard.push(card); }
  else { state.rivalLast = card; state.rivalDiscard.push(card); }
  return dmg;
}

function simulate(seed) {
  const rng = mulberry32(seed);
  const s = {
    turn: 1, yourLife: LIFE, rivalLife: LIFE, yourShield: 0, rivalShield: 0,
    yourMana: 1, rivalMana: 1, yourMaxMana: 1, rivalMaxMana: 1,
    yourHand: [], rivalHand: [], yourDeck: buildDeck(rng), rivalDeck: buildDeck(rng),
    yourDiscard: [], rivalDiscard: [], yourLast: null, rivalLast: null,
  };
  for (let i = 0; i < 5; i++) {
    s.yourHand.push(s.yourDeck.pop());
    s.rivalHand.push(s.rivalDeck.pop());
  }
  let winner = null;
  for (let t = 1; t <= 30; t++) {
    s.turn = t;
    s.yourMana = Math.min(MAX_MANA, t);
    s.rivalMana = Math.min(MAX_MANA, t);
    if (t > 1) {
      drawCard(s.yourDeck, s.yourDiscard, s.yourHand);
      drawCard(s.rivalDeck, s.rivalDiscard, s.rivalHand);
    }
    // player plays random affordable cards
    let mana = s.yourMana;
    const affordable = s.yourHand.filter((c) => c.cost <= mana);
    while (affordable.length > 0 && mana > 0) {
      const idx = Math.floor(rng() * affordable.length);
      const card = affordable[idx];
      affordable.splice(idx, 1);
      s.yourHand.splice(s.yourHand.indexOf(card), 1);
      mana -= card.cost;
      playCard(s, card, true);
      if (s.rivalLife <= 0) { winner = 'you'; break; }
    }
    if (winner) break;
    // rival plays via aiChoosePlays
    const plays = aiChoosePlays({
      aiHand: s.rivalHand, aiMana: s.rivalMana, aiLife: s.rivalLife,
      aiShield: s.rivalShield, yourLastSuit: s.yourLast ? s.yourLast.suit : null,
    });
    for (const uid of plays) {
      const idx = s.rivalHand.findIndex((c) => c.uid === uid);
      if (idx < 0) continue;
      const card = s.rivalHand[idx];
      s.rivalHand.splice(idx, 1);
      s.rivalMana -= card.cost;
      playCard(s, card, false);
      if (s.yourLife <= 0) { winner = 'rival'; break; }
    }
    if (winner) break;
    // assertions
    if (s.yourMana < 0 || s.rivalMana < 0) throw new Error('negative mana');
    if (s.yourHand.length > HAND_MAX || s.rivalHand.length > HAND_MAX) throw new Error('hand over 7');
    if (s.yourLife > LIFE || s.rivalLife > LIFE) throw new Error('life above 30');
  }
  return { winner, turns: s.turn };
}

let wins = { you: 0, rival: 0, none: 0 };
let failures = 0;
const N = 200;
for (let seed = 1; seed <= N; seed++) {
  try {
    const r = simulate(seed);
    wins[r.winner || 'none']++;
  } catch (e) {
    failures++;
    console.log('FAIL seed', seed, e.message);
  }
}
console.log('games simulated:', N);
console.log('winners:', JSON.stringify(wins));
console.log('assert failures:', failures);
if (failures === 0) console.log('RESULT: PASS');
else console.log('RESULT: FAIL');