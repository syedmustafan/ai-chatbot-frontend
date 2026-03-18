import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function leadsHeaders() {
  const key = import.meta.env.VITE_LEADS_API_KEY;
  if (!key) return {};
  return { 'X-API-Key': key };
}

/**
 * Paginated leads (GET /api/leads/). Set VITE_LEADS_API_KEY when backend LEADS_API_KEY is set.
 */
export const fetchLeads = async (page = 1) => {
  const response = await axios.get(`${API_BASE_URL}/api/leads/`, {
    params: { page },
    headers: leadsHeaders(),
  });
  return response.data;
};

/**
 * Send a message to the chat API.
 * @param {string} message - User message text
 * @param {string} [conversationId] - Optional conversation UUID for continuity
 * @returns {Promise<{ success: boolean, response?: string, conversation_id?: string, timestamp?: string, error?: string }>}
 */
export const sendMessage = async (message, conversationId = null) => {
  const payload = { message };
  if (conversationId) payload.conversation_id = conversationId;
  const response = await axios.post(`${API_BASE_URL}/api/chat/`, payload);
  return response.data;
};
