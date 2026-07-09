import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ChatClient } from '../src/chat.js';

// Mock fetch helper that respects an AbortSignal so timeout/abort tests can complete.
function hangingFetch(_url, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    const onAbort = () => reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

describe('ChatClient SSE parser', () => {
  it('calls onDone when the server closes without sending [DONE]', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('data: {"token":"hello"}\n\n'));
        controller.close();
      },
    });

    global.fetch = async () => ({
      ok: true,
      status: 200,
      headers: new Map(),
      body: stream,
    });

    const client = new ChatClient('https://api.example.com', 'test-key');
    let doneCalled = false;
    let tokenReceived = false;

    await client.send('hi', [], null, 'visitor-1', {
      onToken(token) { tokenReceived = token === 'hello'; },
      onDone() { doneCalled = true; },
    });

    assert.strictEqual(tokenReceived, true, 'token should be received');
    assert.strictEqual(doneCalled, true, 'onDone should be called when stream closes without [DONE]');
  });

  it('calls onError("network") when the request times out', async () => {
    global.fetch = hangingFetch;

    const client = new ChatClient('https://api.example.com', 'test-key');
    let errorType = null;

    await client.send('hi', [], null, 'visitor-1', {
      onError(type) { errorType = type; },
    }, { timeoutMs: 50 });

    assert.strictEqual(errorType, 'network', 'should emit network error on timeout');
  });

  it('calls onError with the correct status for HTTP errors', async () => {
    const cases = [
      { status: 401, expected: 'auth' },
      { status: 402, expected: 'quota' },
      { status: 404, expected: 'noContent' },
      { status: 429, expected: 'rateLimit' },
      { status: 500, expected: 'server' },
    ];

    for (const { status, expected } of cases) {
      global.fetch = async () => ({
        ok: false,
        status,
        headers: new Map(),
      });

      const client = new ChatClient('https://api.example.com', 'test-key');
      let errorType = null;
      let extra = null;

      await client.send('hi', [], null, 'visitor-1', {
        onError(type, e) { errorType = type; extra = e; },
      });

      assert.strictEqual(errorType, expected, `status ${status} should map to ${expected}`);
      if (status === 429) {
        assert.strictEqual(extra, '60', 'rateLimit should pass default retry-after');
      }
    }
  });

  it('does not call onError when aborted by the caller', async () => {
    global.fetch = hangingFetch;

    const client = new ChatClient('https://api.example.com', 'test-key');
    let errorCalled = false;

    const promise = client.send('hi', [], null, 'visitor-1', {
      onError() { errorCalled = true; },
    }, { timeoutMs: 10000 });

    client.abort();
    await promise;

    assert.strictEqual(errorCalled, false, 'caller abort should not trigger onError');
  });
});
