// src/services/chatbotService.js
// ─────────────────────────────────────────────────────────────────
// Handles all communication with chatbot_backend (port 8001)
// ─────────────────────────────────────────────────────────────────

const CHATBOT_BASE_URL = "http://localhost:8001/api";

/**
 * Send a text message to the chatbot.
 * @param {string} message     - user's message
 * @param {string} threadId    - session ID (null = new session)
 * @returns {Promise<object>}  - { status, thread_id, route, final_answer, reviewer, player_data, error }
 */
export async function sendMessage(message, threadId = null) {
  const response = await fetch(`${CHATBOT_BASE_URL}/chat`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      message,
      thread_id: threadId,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Send a message with an attached file (CV/PDF).
 * @param {string} message
 * @param {File}   file        - File object from <input type="file">
 * @param {string} threadId
 */
export async function sendMessageWithFile(message, file, threadId = null) {
  const formData = new FormData();
  formData.append("message",   message);
  formData.append("file",      file);
  if (threadId) {
    formData.append("thread_id", threadId);
  }

  const response = await fetch(`${CHATBOT_BASE_URL}/chat/upload`, {
    method: "POST",
    body:   formData,
    // ⚠️ Do NOT set Content-Type header — browser sets it automatically
    //    with the correct multipart boundary
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json();
}

/**
 * Get full conversation history for a session.
 */
export async function getChatHistory(threadId) {
  const response = await fetch(`${CHATBOT_BASE_URL}/chat/${threadId}/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
}

/**
 * Clear session (returns a new thread_id to use).
 */
export async function clearSession(threadId) {
  const response = await fetch(`${CHATBOT_BASE_URL}/chat/${threadId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to clear session");
  return response.json();  // { new_thread_id }
}

/**
 * Check if chatbot backend is online.
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${CHATBOT_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}