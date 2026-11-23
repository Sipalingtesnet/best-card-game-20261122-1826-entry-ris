// The Gilded Table — keyboard and mouse input.
export function makeInput(canvas) {
  const input = {
    clickX: 0,
    clickY: 0,
    clicked: false,
    hoverX: 0,
    hoverY: 0,
    keys: {},
  };

  const onKeyDown = (e) => {
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' ||
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
    }
    input.keys[e.key] = true;
  };

  const onKeyUp = (e) => {
    input.keys[e.key] = false;
  };

  const onBlur = () => {
    input.keys = {};
  };

  const onPointerDown = (e) => {
    const rect = canvas.getBoundingClientRect();
    input.clickX = e.clientX - rect.left;
    input.clickY = e.clientY - rect.top;
    input.clicked = true;
  };

  const onPointerMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    input.hoverX = e.clientX - rect.left;
    input.hoverY = e.clientY - rect.top;
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);

  input.consume = (name) => {
    if (input.keys[name]) {
      input.keys[name] = false;
      return true;
    }
    return false;
  };

  input.consumeClick = () => {
    if (input.clicked) {
      input.clicked = false;
      return { x: input.clickX, y: input.clickY };
    }
    return null;
  };

  return input;
}