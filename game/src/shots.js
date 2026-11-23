// The Gilded Table — deterministic screenshot poses.
import { CARDS } from './config.js';

function cardById(id) {
  return CARDS.find((c) => c.id === id);
}

function makeCard(id, uid) {
  return { ...cardById(id), uid };
}

export function applyShot(state, shot) {
  if (shot === 'start') {
    state.phase = 'title';
    return;
  }
  if (shot === 'play') {
    state.phase = 'play';
    state.turn = 5;
    state.yourLife = 24;
    state.rivalLife = 19;
    state.yourShield = 0;
    state.rivalShield = 6;
    state.yourMana = 5;
    state.yourMaxMana = 5;
    state.rivalMana = 4;
    state.rivalMaxMana = 4;
    state.yourHand = [
      makeCard('flame-lash', 's1'),
      makeCard('blaze-hound', 's2'),
      makeCard('tide-ward', 's3'),
      makeCard('thorn-whip', 's4'),
      makeCard('zephyr', 's5'),
    ];
    state.rivalHand = [1, 2, 3, 4].map((i) => ({ back: true, uid: 'r' + i }));
    state.yourDeck = Array.from({ length: 14 }, (_, i) => ({ back: true, uid: 'yd' + i }));
    state.rivalDeck = Array.from({ length: 15 }, (_, i) => ({ back: true, uid: 'rd' + i }));
    state.yourLast = makeCard('blaze-hound', 'yl');
    state.rivalLast = makeCard('riptide', 'rl');
    state.log = 'Rival played Riptide — 3 damage. Your turn.';
    return;
  }
  if (shot === 'win') {
    state.phase = 'win';
    state.turn = 8;
    state.yourLife = 11;
    state.rivalLife = 0;
    state.yourShield = 2;
    state.rivalShield = 0;
    state.cardsPlayed = 14;
    state.yourHand = [makeCard('phoenix-crown', 'w1'), makeCard('ember-ward', 'w2')];
    state.rivalHand = [1, 2].map((i) => ({ back: true, uid: 'wr' + i }));
    state.yourLast = makeCard('phoenix-crown', 'wl');
    state.rivalLast = makeCard('leviathan', 'wrl');
    state.log = 'You played Phoenix Crown — 10 damage. Victory!';
    return;
  }
  if (shot === 'lose') {
    state.phase = 'lose';
    state.turn = 9;
    state.yourLife = 0;
    state.rivalLife = 9;
    state.yourShield = 0;
    state.rivalShield = 4;
    state.cardsPlayed = 15;
    state.yourHand = [makeCard('coral-spear', 'l1'), makeCard('gust-slash', 'l2')];
    state.rivalHand = [1, 2, 3].map((i) => ({ back: true, uid: 'lr' + i }));
    state.yourLast = makeCard('coral-spear', 'll');
    state.rivalLast = makeCard('tempest-roc', 'lrl');
    state.log = 'Rival played Tempest Roc — 8 damage. Defeat.';
    return;
  }
  state.phase = 'title';
}