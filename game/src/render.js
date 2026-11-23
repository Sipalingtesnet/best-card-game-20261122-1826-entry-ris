// The Gilded Table — all drawing on the 1280x720 canvas.
import { W, H, COLORS, SUITS, CARD_W, CARD_H, HAND_Y } from './config.js';
import { suitBeats } from './cards.js';

// ---- suit glyphs drawn with canvas paths ----
function drawFlame(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-8, 2, -5, -8, 0, -12);
  ctx.bezierCurveTo(5, -8, 8, 2, 0, 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-2, 4,  0, 0, 0, -4);
  ctx.bezierCurveTo(2, 0, 2, 4, 0, 10);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.fill();
  ctx.restore();
}

function drawDrop(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.bezierCurveTo(8, -2, 9, 4, 5, 8);
  ctx.bezierCurveTo(2, 11, -2, 11, -5, 8);
  ctx.bezierCurveTo(-9, 4, -8, -2, 0, -12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLeaf(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 5, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(6, 4);
  ctx.lineTo(12, 8);
  ctx.stroke();
  ctx.restore();
}

function drawSwirl(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 0, 9, 0, Math.PI * 1.4);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, 4, Math.PI * 0.6, Math.PI * 1.6);
  ctx.stroke();
  ctx.restore();
}

export function drawSuitGlyph(ctx, suit, x, y, s) {
  const c = SUITS[suit];
  if (suit === 'ember') drawFlame(ctx, x, y, s, c.color);
  else if (suit === 'tide') drawDrop(ctx, x, y, s, c.color);
  else if (suit === 'leaf') drawLeaf(ctx, x, y, s, c.color);
  else drawSwirl(ctx, x, y, s, c.color);
}// ---- table ----
function drawTable(ctx) {
  ctx.fillStyle = COLORS.table;
  ctx.fillRect(0, 0, W, H);
  // inner felt
  ctx.fillStyle = COLORS.felt;
  ctx.fillRect(30, 30, W - 60, H - 60);
  // gold edge trim
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);
  ctx.strokeStyle = COLORS.tableEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, W - 80, H - 80);
  // centre emblem: four-suit compass rose in a circle
  const cx = W / 2, cy = 300;
  ctx.strokeStyle = 'rgba(245,197,66,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(245,197,66,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, 40, 0, Math.PI * 2);
  ctx.stroke();
  const glyphs = ['ember', 'tide', 'leaf', 'gale'];
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const gx = cx + Math.cos(a) * 46;
    const gy = cy + Math.sin(a) * 46;
    drawSuitGlyph(ctx, glyphs[i], gx, gy, 1);
  }
  // subtle vignette
  const grad = ctx.createRadialGradient(cx, cy, 200, cx, cy, 700);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

// ---- life bar ----
function drawLifeBar(ctx, x, y, w, h, life, max, color, shield) {
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(x, y, w, h);
  const pct = Math.max(0, Math.min(1, life / max));
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * pct, h);
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(life + ' / ' + max, x + w / 2, y + h / 2 + 1);
  if (shield > 0) {
    ctx.fillStyle = COLORS.youBlue;
    ctx.fillRect(x + w + 4, y, 10, h);
    ctx.strokeStyle = COLORS.panelEdge;
    ctx.strokeRect(x + w + 4, y, 10, h);
  }
}

// ---- mana gems ----
function drawMana(ctx, x, y, cur, max) {
  for (let i = 0; i < max; i++) {
    const gx = x + i * 22;
    ctx.beginPath();
    ctx.arc(gx, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = i < cur ? COLORS.gold : 'rgba(255,255,255,0.15)';
    ctx.fill();
    ctx.strokeStyle = COLORS.panelEdge;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}// ---- rival top zone ----
function drawRival(ctx, state) {
  // avatar circle with ash-grey hooded figure
  const ax = 150, ay = 84, ar = 34;
  ctx.beginPath();
  ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.fillStyle = '#3a3f3a';
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  // hood
  ctx.fillStyle = '#2a2e2a';
  ctx.beginPath();
  ctx.arc(ax, ay - 6, 20, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#1c1f1c';
  ctx.beginPath();
  ctx.arc(ax, ay + 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(ax - 5, ay + 2, 2.5, 0, Math.PI * 2);
  ctx.arc(ax + 5, ay + 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ASH RIVAL', ax + ar + 12, ay - 12);

  drawLifeBar(ctx, 420, 66, 440, 18, state.rivalLife, 30, COLORS.rivalRed, state.rivalShield);
  drawMana(ctx, 880, 75, state.rivalMana, state.rivalMaxMana);

  // rival hand: face-down card backs fanned across the top
  const n = state.rivalHand.length;
  const totalW = n * 66;
  let x0 = W / 2 - totalW / 2;
  for (let i = 0; i < n; i++) {
    const cx = x0 + i * 66;
    const rot = (i - (n - 1) / 2) * 0.06;
    ctx.save();
    ctx.translate(cx + 33, 138);
    ctx.rotate(rot);
    ctx.fillStyle = COLORS.cardBack;
    ctx.fillRect(-33, -42, 66, 84);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(-33, -42, 66, 84);
    drawSuitGlyph(ctx, 'ember', 0, 0, 0.8);
    ctx.restore();
  }
  ctx.fillStyle = COLORS.dim;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Rival hand: ' + n, W / 2, 196);
}

// ---- centre played slots ----
function drawPlayed(ctx, state) {
  const slots = [
    { label: 'YOUR PLAY', x: 430, card: state.yourLast },
    { label: 'RIVAL PLAY', x: 740, card: state.rivalLast },
  ];
  for (const s of slots) {
    ctx.fillStyle = COLORS.dim;
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.label, s.x + CARD_W / 2, 268);
    if (s.card) {
      drawCardFace(ctx, s.card, s.x, 300);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(s.x, 300, CARD_W, CARD_H);
      ctx.setLineDash([]);
    }
  }
  // VS badge
  ctx.fillStyle = COLORS.gold;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VS', 640, 376);
  // Court Advantage banner under rival slot
  if (state.rivalLast && state.yourLast && suitBeats(state.yourLast.suit, state.rivalLast.suit)) {
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('+3 Court Advantage!', 796, 480);
  }
}// ---- player bottom zone ----
function drawPlayer(ctx, state) {
  const ax = 150, ay = 636, ar = 34;
  ctx.beginPath();
  ctx.arc(ax, ay, ar, 0, Math.PI * 2);
  ctx.fillStyle = '#2a3a4a';
  ctx.fill();
  ctx.strokeStyle = COLORS.gold;
  ctx.lineWidth = 2;
  ctx.stroke();
  // warden figure
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.arc(ax, ay - 4, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1c1f1c';
  ctx.beginPath();
  ctx.arc(ax - 4, ay - 4, 2.5, 0, Math.PI * 2);
  ctx.arc(ax + 4, ay - 4, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f5c542';
  ctx.beginPath();
  ctx.moveTo(ax - 16, ay + 14);
  ctx.lineTo(ax + 16, ay + 14);
  ctx.lineTo(ax, ay + 28);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = COLORS.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('GILDED WARDEN (YOU)', ax + ar + 12, ay - 12);

  drawLifeBar(ctx, 420, 622, 440, 18, state.yourLife, 30, COLORS.youBlue, state.yourShield);
  drawMana(ctx, 880, 631, state.yourMana, state.yourMaxMana);

  ctx.fillStyle = COLORS.dim;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Deck: ' + state.yourDeck.length, 420, 668);
  ctx.fillText('Turn ' + state.turn, 560, 668);

  // log line centred above the hand
  ctx.fillStyle = COLORS.dim;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(state.log, W / 2, 528);
}

// ---- your hand fanned across the bottom ----
function drawHand(ctx, state) {
  const n = state.yourHand.length;
  if (n === 0) return;
  const spread = Math.min(150, 900 / n);
  const totalW = (n - 1) * spread;
  let x0 = W / 2 - totalW / 2;
  for (let i = 0; i < n; i++) {
    const card = state.yourHand[i];
    const cx = x0 + i * spread;
    const rot = (i - (n - 1) / 2) * 0.05;
    const hovered = i === state.hovered;
    const lift = hovered ? 18 : 0;
    ctx.save();
    ctx.translate(cx + CARD_W / 2, HAND_Y + CARD_H / 2 - lift);
    ctx.rotate(rot);
    if (hovered) {
      ctx.shadowColor = COLORS.gold;
      ctx.shadowBlur = 18;
    }
    drawCardFace(ctx, card, -CARD_W / 2, -CARD_H / 2, state.yourMana);
    ctx.restore();
  }
}

// ---- one card face ----
function drawCardFace(ctx, card, x, y, mana) {
  const suit = SUITS[card.suit];
  const affordable = mana === undefined || card.cost <= mana;
  ctx.fillStyle = '#f5efe0';
  ctx.fillRect(x, y, CARD_W, CARD_H);
  ctx.strokeStyle = COLORS.panelEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, CARD_W, CARD_H);
  // suit band
  ctx.fillStyle = suit.color;
  ctx.fillRect(x, y, CARD_W, 26);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(suit.label, x + 8, y + 13);
  drawSuitGlyph(ctx, card.suit, x + CARD_W - 14, y + 13, 0.7);
  // name (adaptive size so long names stay legible on the 112px card)
  const nameSize = card.name.length > 12 ? 11 : card.name.length > 9 ? 12 : 13;
  ctx.fillStyle = '#1c1f1c';
  ctx.font = 'bold ' + nameSize + 'px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.name, x + CARD_W / 2, y + 52);
  // power / shield
  ctx.font = 'bold 26px sans-serif';
  if (card.kind === 'attack') {
    ctx.fillStyle = '#1c1f1c';
    ctx.fillText(String(card.power), x + CARD_W - 24, y + CARD_H - 22);
  } else {
    ctx.fillStyle = suit.color;
    ctx.fillText(String(card.shield), x + CARD_W - 24, y + CARD_H - 22);
    drawSuitGlyph(ctx, card.suit, x + CARD_W - 24, y + CARD_H - 46, 0.5);
  }
  // cost circle
  ctx.beginPath();
  ctx.arc(x + 18, y + 18, 12, 0, Math.PI * 2);
  ctx.fillStyle = COLORS.gold;
  ctx.fill();
  ctx.strokeStyle = '#7a5a10';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#1c1f1c';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(String(card.cost), x + 18, y + 19);
  if (!affordable) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(x, y, CARD_W, CARD_H);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('not enough mana', x + CARD_W / 2, y + CARD_H / 2);
  }
}// ---- controls ----
function drawControls(ctx, state) {
  if (state.phase !== 'play') return;
  // END TURN button
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(1090, 470, 150, 44);
  ctx.strokeStyle = '#7a5a10';
  ctx.lineWidth = 2;
  ctx.strokeRect(1090, 470, 150, 44);
  ctx.fillStyle = '#1c1f1c';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('END TURN', 1165, 488);
  ctx.fillStyle = '#1c1f1c';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('(Space)', 1165, 506);
  // hint bar
  ctx.fillStyle = COLORS.dim;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Click a card or press 1-7 to play · Space: end turn · R: restart · M: mute', W / 2, 706);
}

// ---- overlays ----
function drawOverlay(ctx, state) {
  if (state.phase === 'play') return;
  ctx.fillStyle = 'rgba(0,0,0,0.66)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (state.phase === 'title') {
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('THE GILDED TABLE', W / 2, 240);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('A duel of suits at the Gilded Table', W / 2, 300);
    ctx.fillStyle = COLORS.dim;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Ember beats Leaf · Tide beats Ember · Leaf beats Tide · Gale beats nothing', W / 2, 350);
    ctx.fillText('Play cards to deal damage, raise wards for shield, reduce the rival to 0 life.', W / 2, 380);
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Press ENTER or click to begin', W / 2, 460);
  } else if (state.phase === 'win') {
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText('VICTORY', W / 2, 240);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('The court is yours — the Ash Rival falls.', W / 2, 310);
    ctx.fillStyle = COLORS.dim;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(state.turn + ' turns · ' + state.cardsPlayed + ' cards played', W / 2, 360);
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Press R or click to duel again', W / 2, 440);
  } else {
    ctx.fillStyle = COLORS.rivalRed;
    ctx.font = 'bold 72px sans-serif';
    ctx.fillText('DEFEAT', W / 2, 240);
    ctx.fillStyle = COLORS.text;
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('The Ash Rival takes the court.', W / 2, 310);
    ctx.fillStyle = COLORS.dim;
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(state.turn + ' turns · ' + state.cardsPlayed + ' cards played', W / 2, 360);
    ctx.fillStyle = COLORS.gold;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('Press R or click to try again', W / 2, 440);
  }
}

// ---- main render ----
export function render(ctx, state, t) {
  ctx.clearRect(0, 0, W, H);
  drawTable(ctx);
  drawRival(ctx, state);
  drawPlayed(ctx, state);
  drawPlayer(ctx, state);
  drawHand(ctx, state);
  drawControls(ctx, state);
  drawOverlay(ctx, state);
}