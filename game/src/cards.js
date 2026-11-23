// The Gilded Table — deck and rules.
import { CARDS, SUITS, DECK_SIZE } from './config.js';

export const WARD_SHIELD = 6;

// A fresh copy of every card, each with a unique uid.
export function buildDeck(rng) {
  const deck = CARDS.map((c, i) => ({ ...c, uid: 'c' + (i + 1) }));
  return shuffleDeck(deck, rng);
}

// Fisher-Yates shuffle using the given rng.
export function shuffleDeck(deck, rng) {
  const out = deck.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

// True when suit a beats suit b in the Court cycle.
export function suitBeats(a, b) {
  if (!a || !b) return false;
  return SUITS[a].beats === b;
}

// Damage a card deals, counting +3 Court Advantage when its suit beats the rival's last suit.
export function cardDamage(card, rivalLastSuit) {
  if (card.kind !== 'attack') return 0;
  const bonus = rivalLastSuit && suitBeats(card.suit, rivalLastSuit) ? 3 : 0;
  return card.power + bonus;
}

// Deterministic rival play selection: at most 2 cards, each affordable with remaining mana.
export function aiChoosePlays(state) {
  const { aiHand, aiMana, aiLife, aiShield, yourLastSuit } = state;
  const plays = [];
  let mana = aiMana;

  // Prefer a Ward when low on life and unshielded and a ward is affordable.
  if (aiLife <= 12 && aiShield === 0) {
    const ward = aiHand.find((c) => c.kind === 'ward' && c.cost <= mana);
    if (ward) {
      plays.push(ward.uid);
      mana -= ward.cost;
    }
  }

  // Pick the affordable attack with the highest damage (counting Court Advantage).
  const pickAttack = () => {
    let best = null;
    for (const c of aiHand) {
      if (c.kind !== 'attack' || c.cost > mana) continue;
      const dmg = cardDamage(c, yourLastSuit);
      if (best === null || dmg > best.dmg) best = { card: c, dmg };
    }
    return best;
  };

  // At most 2 cards total: a ward (if played) plus at most one attack.
  const first = pickAttack();
  if (first) {
    plays.push(first.card.uid);
    mana -= first.card.cost;
    if (plays.length < 2) {
      const second = pickAttack();
      if (second) plays.push(second.card.uid);
    }
  }

  return plays;
}