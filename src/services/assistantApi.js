const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Stream an AI Assistant chat response via SSE.
 * Uses fetch (not axios) because axios doesn't support streaming response bodies.
 *
 * @param {string} message - User message
 * @param {string|null} conversationId - Optional conversation UUID
 * @param {(event: {event: string, data: object}) => void} onEvent - Callback for each SSE event
 * @returns {{ abort: () => void }} - Abort controller
 */
export function streamAssistantChat(message, conversationId, onEvent) {
  const controller = new AbortController();

  const payload = { message };
  if (conversationId) payload.conversation_id = conversationId;

  fetch(`${API_BASE_URL}/api/assistant/chat/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onEvent({ event: 'error', data: { message: `HTTP ${response.status}` } });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // keep incomplete chunk

        for (const part of parts) {
          if (!part.trim()) continue;

          let eventType = 'message';
          let data = {};

          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              try {
                data = JSON.parse(line.slice(6));
              } catch {
                data = { raw: line.slice(6) };
              }
            }
          }

          onEvent({ event: eventType, data });
        }
      }
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        onEvent({ event: 'error', data: { message: err.message } });
      }
    });

  return { abort: () => controller.abort() };
}
