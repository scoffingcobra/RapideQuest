
// Usage: node src/webhookLoader.js ./payloads
import fs from 'fs';
import path from 'path';
import { connectDB } from './db.js';
import Message from './models/Message.js';
import { normalizeIncomingMessage, normalizeStatus } from './utils/normalize.js';

const dir = process.argv[2];
if (!dir) {
  console.error('Provide a directory containing JSON payload files.');
  process.exit(1);
}

(async () => {
  await connectDB();

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const full = path.join(dir, f);
    const raw = JSON.parse(fs.readFileSync(full, 'utf8'));

    const st = normalizeStatus(raw);
    if (st && (st.id || st.meta_msg_id)) {
      const q = st.id ? { $or: [{ msg_id: st.id }, { meta_msg_id: st.id }] } : { meta_msg_id: st.meta_msg_id };
      const updated = await Message.findOneAndUpdate(q, { status: st.status, timestamp: st.timestamp }, { new: true });
      if (updated) { console.log('✔ status updated', updated._id, updated.status); continue; }
    }

    const m = normalizeIncomingMessage(raw);
    if (m) {
      const exists = m.msg_id ? await Message.findOne({ msg_id: m.msg_id }) : null;
      if (!exists) {
        const created = await Message.create(m);
        console.log('＋ message inserted', created._id, (m.text||'').slice(0, 50));
      }
    } else {
      console.warn('… skipped (unrecognized shape):', f);
    }
  }

  console.log('✅ Done.');
  process.exit(0);
})();
