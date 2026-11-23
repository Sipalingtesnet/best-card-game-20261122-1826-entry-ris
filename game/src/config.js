// The Gilded Table — tuning constants.
export const W = 1280;
export const H = 720     ;
export const LIFE = 30;
export const MAX_MANA = 10;
export const HAND_MAX = 7;
export const DECK_SIZE = 24;
export const TURN1_MANA = 1;

export const SUITS = {
  ember: { label: 'Ember', color: '#f97316', dark: '#7c2d12', beats: 'leaf' },
  tide:  { label: 'Tide',  color: '#38bdf8', dark: '#0c4a6e', beats: 'ember' },
  leaf:  { label: 'Leaf',  color: '#4ade80', dark: '#14532d', beats: 'tide' },
  gale:  { label: 'Gale',  color: '#e879f9', dark: '#701a75', beats: null },
};

// 24 cards: {id, suit, name, cost, power, kind, shield}
export const CARDS = [
  // Ember
  { id: 'cinder-imp',    suit: 'ember', name: 'Cinder Imp',    cost: 1, power: 2, kind: 'attack', shield: 0 },
  { id: 'flame-lash',    suit: 'ember', name: 'Flame Lash',    cost: 2, power: 3, kind: 'attack', shield: 0 },
  { id: 'blaze-hound',   suit: 'ember', name: 'Blaze Hound',   cost: 2, power: 4, kind: 'attack', shield: 0 },
  { id: 'inferno-drake', suit: 'ember', name: 'Inferno Drake', cost: 3, power: 5, kind: 'attack', shield: 0 },
  { id: 'phoenix-crown', suit: 'ember', name: 'Phoenix Crown', cost: 4, power: 7, kind: 'attack', shield: 0 },
  { id: 'ember-ward',    suit: 'ember', name: 'Ember Ward',    cost: 2, power: 0, kind: 'ward',   shield: 6 },
  // Tide
  { id: 'dewdrop',       suit: 'tide',  name: 'Dewdrop',       cost: 1, power: 2, kind: 'attack', shield: 0 },
  { id: 'riptide',       suit: 'tide',  name: 'Riptide',       cost: 2, power: 3, kind: 'attack', shield: 0 },
  { id: 'coral-spear',   suit: 'tide',  name: 'Coral Spear',   cost: 2, power: 4, kind: 'attack', shield: 0 },
  { id: 'abyssal-maw',   suit: 'tide',  name: 'Abyssal Maw',   cost: 3, power: 5, kind: 'attack', shield: 0 },
  { id: 'leviathan',     suit: 'tide',  name: 'Leviathan',     cost: 4, power: 7, kind: 'attack', shield: 0 },
  { id: 'tide-ward',     suit: 'tide',  name: 'Tide Ward',     cost: 2, power: 0, kind: 'ward',   shield: 6 },
  // Leaf
  { id: 'sprout',        suit: 'leaf',  name: 'Sprout',        cost: 1, power: 2, kind: 'attack', shield: 0 },
  { id: 'thorn-whip',    suit: 'leaf',  name: 'Thorn Whip',    cost: 2, power: 3, kind: 'attack', shield: 0 },
  { id: 'briar-wolf',    suit: 'leaf',  name: 'Briar Wolf',    cost: 2, power: 4, kind: 'attack', shield: 0 },
  { id: 'ancient-oak',   suit: 'leaf',  name: 'Ancient Oak',   cost: 3, power: 5, kind: 'attack', shield: 0 },
  { id: 'worldroot',     suit: 'leaf',  name: 'Worldroot',     cost: 4, power: 7, kind: 'attack', shield: 0 },
  { id: 'leaf-ward',     suit: 'leaf',  name: 'Leaf Ward',     cost: 2, power: 0, kind: 'ward',   shield: 6 },
  // Gale
  { id: 'zephyr',        suit: 'gale',  name: 'Zephyr',        cost: 1, power: 2, kind: 'attack', shield: 0 },
  { id: 'gust-slash',    suit: 'gale',  name: 'Gust Slash',    cost: 2, power: 3, kind: 'attack', shield: 0 },
  { id: 'storm-kite',    suit: 'gale',  name: 'Storm Kite',    cost: 2, power: 4, kind: 'attack', shield: 0 },
  { id: 'tempest-roc',   suit: 'gale',  name: 'Tempest Roc',   cost: 3, power: 5, kind: 'attack', shield: 0 },
  { id: 'sky-sovereign', suit: 'gale',  name: 'Sky Sovereign', cost: 4, power: 7, kind: 'attack', shield: 0 },
  { id: 'gale-ward',     suit: 'gale',  name: 'Gale Ward',     cost: 2, power: 0, kind: 'ward',   shield: 6 },
];

export const COLORS = {
  table: '#1b2a1e',
  tableEdge: '#2d4a33',
  felt: '#22402a',
  gold: '#f5c542',
  text: '#f2f5ef',
  dim: '#9fb3a4',
  rivalRed: '#ef4444',
  youBlue: '#38bdf8',
  cardBack: '#7c2d12',
  panel: '#141a16',
  panelEdge: '#33413a',
};

export const CARD_W = 112;
export const CARD_H = 152;
export const HAND_Y = 548;