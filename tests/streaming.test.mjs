import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { JSDOM } from 'jsdom';

function createDom() {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'https://example.com/',
    runScripts: 'dangerously',
  });
  global.window = dom.window;
  global.document = dom.window.document;
  global.location = dom.window.location;
  global.CustomEvent = dom.window.CustomEvent;
  global.window.matchMedia = global.window.matchMedia || (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}

describe('WidgetUI streaming render', () => {
  beforeEach(() => createDom());

  it('debounces rapid tokens instead of re-rendering on every token', async () => {
    const { WidgetUI } = await import('../src/ui.js');
    const ui = new WidgetUI({ position: 'right' });
    ui.mount();
    ui.startBotMessage();

    let renderCount = 0;
    const originalFlush = ui._flushStreamRender.bind(ui);
    ui._flushStreamRender = () => { renderCount += 1; return originalFlush(); };

    // Append 20 rapid tokens without any natural breakpoint.
    for (let i = 0; i < 20; i++) {
      ui.appendToken('word ');
    }

    // Wait for the debounce timer to fire.
    await new Promise((r) => setTimeout(r, 150));

    assert.ok(renderCount < 20, `expected fewer than 20 renders, got ${renderCount}`);
    assert.ok(renderCount >= 1, 'expected at least one debounced render');
  });

  it('renders immediately on sentence and block breakpoints', async () => {
    const { WidgetUI } = await import('../src/ui.js');
    const ui = new WidgetUI({ position: 'right' });
    ui.mount();
    ui.startBotMessage();

    let renderCount = 0;
    const originalFlush = ui._flushStreamRender.bind(ui);
    ui._flushStreamRender = () => { renderCount += 1; return originalFlush(); };

    ui.appendToken('Hello');
    ui.appendToken(' world.');
    assert.strictEqual(renderCount, 1, 'sentence end should trigger immediate render');

    ui.appendToken('\n');
    assert.strictEqual(renderCount, 2, 'newline should trigger immediate render');
  });

  it('keeps the caret as the last child of the bubble after rendering', async () => {
    const { WidgetUI } = await import('../src/ui.js');
    const ui = new WidgetUI({ position: 'right' });
    ui.mount();
    ui.startBotMessage();

    ui.appendToken('Hello world.');
    await new Promise((r) => setTimeout(r, 20));

    const bubble = ui.shadow.querySelector('.aiml-msg-bubble');
    const last = bubble.lastElementChild;
    assert.ok(last.classList.contains('aiml-caret'), 'caret should remain the last element after render');
  });

  it('cancels pending debounced render when the message finishes', async () => {
    const { WidgetUI } = await import('../src/ui.js');
    const ui = new WidgetUI({ position: 'right' });
    ui.mount();
    ui.startBotMessage();

    let renderCount = 0;
    const originalFlush = ui._flushStreamRender.bind(ui);
    ui._flushStreamRender = () => { renderCount += 1; return originalFlush(); };

    ui.appendToken('Hello');
    // Finish before the 80 ms debounce fires.
    ui.finishBotMessage([]);

    await new Promise((r) => setTimeout(r, 150));
    assert.strictEqual(renderCount, 0, 'pending debounced render should be cancelled on finish');
  });
});
