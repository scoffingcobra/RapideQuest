
export function normalizeIncomingMessage(p) {
  const msg = p?.messages?.[0] || p?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  const contact = p?.contacts?.[0] || p?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
  if (!msg) return null;

  const wa_id = contact?.wa_id || msg?.from || msg?.wa_id;
  const name = contact?.profile?.name || p?.name || null;

  return {
    wa_id: String(wa_id),
    name,
    direction: 'in',
    type: msg.type || (msg.text ? 'text' : 'unknown'),
    msg_id: msg.id || msg.message_id || null,
    meta_msg_id: msg.meta_msg_id || null,
    text: msg.text?.body || msg.body || '',
    from: msg.from || wa_id,
    to: msg.to || null,
    status: 'delivered',
    timestamp: msg.timestamp ? new Date(Number(msg.timestamp) * 1000) : new Date(),
    raw: p
  };
}

export function normalizeStatus(p) {
  const s = p?.statuses?.[0] || p?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];
  if (!s) return null;
  return {
    id: s.id || s.message_id || null,
    meta_msg_id: s.meta_msg_id || null,
    wa_id: s.recipient_id || s.wa_id || null,
    status: s.status,
    timestamp: s.timestamp ? new Date(Number(s.timestamp) * 1000) : new Date(),
    raw: p
  };
}
