import express from 'express';
import Message from './models/Message.js';
import { normalizeIncomingMessage, normalizeStatus } from './utils/normalize.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => res.json({ ok: true }));

// Get list of conversations (latest message per wa_id)
router.get('/conversations', async (req, res) => {
  const pipeline = [
    { $sort: { timestamp: -1 } },
    {
      $group: {
        _id: '$wa_id',
        lastMessage: { $first: '$$ROOT' },
        name: { $first: '$name' }
      }
    },
    {
      $project: {
        wa_id: '$_id',
        name: 1,
        lastMessage: {
          text: '$lastMessage.text',
          timestamp: '$lastMessage.timestamp',
          status: '$lastMessage.status',
          direction: '$lastMessage.direction'
        }
      }
    },
    { $sort: { 'lastMessage.timestamp': -1 } }
  ];
  const conversations = await Message.aggregate(pipeline);
  res.json(conversations);
});

// Get messages for a contact
router.get('/messages/:wa_id', async (req, res) => {
  const { wa_id } = req.params;
  const messages = await Message.find({ wa_id }).sort({ timestamp: 1 }).lean();
  res.json(messages);
});

// Send a message
router.post('/send', async (req, res) => {
  const { wa_id, text, from, to, name } = req.body || {};
  if (!wa_id || !text) {
    return res.status(400).json({ error: 'wa_id and text required' });
  }

  const doc = await Message.create({
    wa_id: String(wa_id),
    name: name || null,
    direction: 'out',
    type: 'text',
    msg_id: null,
    meta_msg_id: null,
    text,
    from: from || 'business',
    to: to || String(wa_id),
    status: 'sent',
    timestamp: new Date(),
    raw: { source: 'ui' }
  });

  req.app.get('io').to(String(wa_id)).emit('message:new', doc);
  res.json(doc);
});

// Webhook for incoming messages + status updates
router.post('/webhook', async (req, res) => {
  const body = req.body || {};

  // Handle status updates
  const st = normalizeStatus(body);
  if (st && (st.id || st.meta_msg_id)) {
    const q = st.id
      ? { $or: [{ msg_id: st.id }, { meta_msg_id: st.id }] }
      : { meta_msg_id: st.meta_msg_id };
    const updated = await Message.findOneAndUpdate(
      q,
      { status: st.status, timestamp: st.timestamp },
      { new: true }
    );
    if (updated) {
      req.app.get('io').to(String(updated.wa_id)).emit('message:update', updated);
    }
  }

  // Handle incoming messages
  const m = normalizeIncomingMessage(body);
  if (m && (m.msg_id || m.meta_msg_id || m.text)) {
    // ✅ Deduplication check
    const existing = await Message.findOne({
      $or: [
        { msg_id: m.msg_id },
        { meta_msg_id: m.meta_msg_id },
        {
          $and: [
            { wa_id: m.wa_id },
            { text: m.text },
            { timestamp: m.timestamp }
          ]
        }
      ]
    });

    if (!existing) {
      const created = await Message.create(m);
      req.app.get('io').to(String(created.wa_id)).emit('message:new', created);
    }
  }

  res.sendStatus(200);
});

export default router;
