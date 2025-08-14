
export const API_BASE = 'http://localhost:8080/api';
export async function fetchConversations() {
  const r = await fetch(`${API_BASE}/conversations`, { cache: 'no-store' });
  return r.json();
}
export async function fetchMessages(wa_id: string) {
  const r = await fetch(`${API_BASE}/messages/${wa_id}`, { cache: 'no-store' });
  return r.json();
}
export async function sendMessage(payload: { wa_id: string; text: string; name?: string }) {
  const r = await fetch(`${API_BASE}/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return r.json();
}
