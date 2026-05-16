/**
 * Inject a visible fake cursor into the page so Playwright's video recording
 * shows where the mouse is. Playwright's `recordVideo` does NOT capture the
 * native OS cursor, so we draw our own DOM cursor and let `page.mouse.move()`
 * drive it via synthetic mousemove events.
 *
 * Also exposes window.__pulseCursor() — call from Playwright via
 * `page.evaluate('__pulseCursor()')` to emit a teal expand+fade ring at the
 * current cursor position. Used in the storyboard's "cursor pulse" cues.
 */

export const CURSOR_INJECT_SCRIPT = `
(() => {
  if (window.__senopatiCursorInstalled) return;
  window.__senopatiCursorInstalled = true;

  const style = document.createElement('style');
  style.textContent = \`
    #__sn-cursor {
      position: fixed;
      width: 22px;
      height: 22px;
      pointer-events: none;
      z-index: 2147483647;
      transform: translate(-3px, -3px);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.45));
      transition: transform 60ms linear;
    }
    #__sn-cursor svg {
      width: 100%;
      height: 100%;
    }
    .__sn-pulse {
      position: fixed;
      pointer-events: none;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: rgba(24, 194, 156, 0.55);
      border: 2px solid #18C29C;
      z-index: 2147483646;
      transform: translate(-50%, -50%);
      animation: __sn-pulse-anim 700ms ease-out forwards;
    }
    @keyframes __sn-pulse-anim {
      0%   { width: 12px; height: 12px; opacity: 0.85; }
      100% { width: 64px; height: 64px; opacity: 0; }
    }
  \`;
  document.head.appendChild(style);

  const cursor = document.createElement('div');
  cursor.id = '__sn-cursor';
  cursor.innerHTML = \`
    <svg viewBox="0 0 24 24" fill="white" stroke="#0d1f3a" stroke-width="1.5">
      <path d="M5 3 L5 19 L9 15 L11.5 21 L13.5 20 L11 14 L17 14 Z" />
    </svg>
  \`;
  cursor.style.left = '-100px';
  cursor.style.top = '-100px';
  document.body.appendChild(cursor);

  window.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }, { passive: true });

  window.__pulseCursor = (x, y) => {
    const pulse = document.createElement('div');
    pulse.className = '__sn-pulse';
    pulse.style.left = (x ?? parseFloat(cursor.style.left || '0')) + 'px';
    pulse.style.top = (y ?? parseFloat(cursor.style.top || '0')) + 'px';
    document.body.appendChild(pulse);
    setTimeout(() => pulse.remove(), 750);
  };

  // Helper to draw a transient border highlight around an element — used by
  // the sidebar tour to confirm which menu the cursor is hovering.
  window.__highlightElement = (selector, durationMs = 1200) => {
    const el = document.querySelector(selector);
    if (!el) return;
    const orig = {
      outline: el.style.outline,
      outlineOffset: el.style.outlineOffset,
      transition: el.style.transition,
    };
    el.style.transition = 'outline 120ms ease-out';
    el.style.outline = '2px solid #18C29C';
    el.style.outlineOffset = '2px';
    setTimeout(() => {
      el.style.outline = orig.outline;
      el.style.outlineOffset = orig.outlineOffset;
      el.style.transition = orig.transition;
    }, durationMs);
  };
})();
`;
