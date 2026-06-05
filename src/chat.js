/**
 * SSE streaming chat via fetch() + ReadableStream.
 * EventSource not used — chat endpoint is POST with JSON body.
 */
export class ChatClient {
  constructor(apiUrl, apiKey) {
    this.apiUrl = apiUrl.replace(/\/$/, '');
    this.apiKey = apiKey;
    this._abortController = null;
  }

  async captureLead(websiteId, email, question) {
    const res = await fetch(`${this.apiUrl}/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
      },
      body: JSON.stringify({ websiteId, email, question, visitorId: null }),
    });
    if (!res.ok) throw new Error('lead capture failed');
  }

  abort() {
    if (this._abortController) {
      this._abortController.abort();
      this._abortController = null;
    }
  }

  /**
   * Stream a chat message.
   * @param {string} message
   * @param {Array<{role:string,content:string}>} history
   * @param {string|null} conversationId
   * @param {string} visitorId
   * @param {object} callbacks - { onToken, onCitations, onDone, onError }
   */
  async send(message, history, conversationId, visitorId, callbacks) {
    this.abort();
    this._abortController = new AbortController();
    const { signal } = this._abortController;

    const body = JSON.stringify({
      message,
      conversationId,
      visitorId,
      history: history.slice(-6), // last 3 turns
    });

    let response;
    try {
      response = await fetch(`${this.apiUrl}/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': this.apiKey,
        },
        body,
        signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') return;
      callbacks.onError('network');
      return;
    }

    if (response.status === 401) { callbacks.onError('auth'); return; }
    if (response.status === 402) { callbacks.onError('quota'); return; }
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After') || '60';
      callbacks.onError('rateLimit', retryAfter);
      return;
    }
    if (response.status === 404) { callbacks.onError('noContent'); return; }
    if (!response.ok) { callbacks.onError('server'); return; }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // keep incomplete line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') { callbacks.onDone(); return; }
          try {
            const parsed = JSON.parse(data);
            if (parsed.token !== undefined) callbacks.onToken(parsed.token);
            if (parsed.citations) callbacks.onCitations(parsed.citations);
            // Server found nothing relevant: offer related topics + email capture instead of a dead-end.
            if (parsed.noAnswer) callbacks.onNoAnswer?.();
          } catch { /* ignore malformed line */ }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') callbacks.onError('stream');
    }
  }
}
