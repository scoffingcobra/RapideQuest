import mongoose from 'mongoose';

/*
  Message model that supports two modes:
  - MEMORY_DB=true  -> in-memory demo model (ephemeral)
  - otherwise       -> real mongoose model using the Message schema
*/

let MessageModel = null;

if (process.env.MEMORY_DB === 'true') {
  // in-memory (demo) model implementation
  console.log('⚠️  Using in-memory Message model (MEMORY_DB=true)');

  const _store = [];
  function _clone(o){ return JSON.parse(JSON.stringify(o)); }
  function _match(doc, query){
    if (!query) return true;
    for (const [k,v] of Object.entries(query)){
      if (k === '$or') return query.$or.some(q => _match(doc, q));
      if (doc[k] !== v) return false;
    }
    return true;
  }

  class MessageMemory {
    static async aggregate(pipeline){
      // Only supports the pipeline used in routes.js: last message per wa_id
      const by = {};
      for (const m of _store){
        const key = m.wa_id;
        if (!by[key] || new Date(m.timestamp) > new Date(by[key].timestamp)){
          by[key] = m;
        }
      }
      const out = Object.entries(by).map(([wa_id, last]) => ({
        wa_id,
        name: last.name,
        lastMessage: {
          text: last.text,
          timestamp: last.timestamp,
          status: last.status,
          direction: last.direction
        }
      }));
      out.sort((a,b)=> new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));
      return out;
    }

    static find(query){
      const arr = _store.filter(d => _match(d, query));
      const chain = {
        sort(sortSpec){
          if (sortSpec && 'timestamp' in sortSpec){
            const dir = sortSpec.timestamp;
            arr.sort((a,b)=> dir >= 0 ? (new Date(a.timestamp) - new Date(b.timestamp)) : (new Date(b.timestamp) - new Date(a.timestamp)));
          }
          return chain;
        },
        lean(){
          // return cloned copies to mimic mongoose .lean()
          return Promise.resolve(arr.map(_clone));
        }
      };
      return chain;
    }

    static async findOne(query){
      const d = _store.find(d => _match(d, query));
      return d ? _clone(d) : null;
    }

    static async findOneAndUpdate(query, update, opts){
      const doc = _store.find(d => _match(d, query));
      if (doc){
        Object.assign(doc, update);
        return _clone(doc);
      }
      return null;
    }

    static async create(doc){
      const copy = _clone(doc);
      copy._id = copy._id || String(Date.now()) + "-" + Math.random().toString(36).slice(2);
      _store.push(copy);
      return _clone(copy);
    }
  }

  MessageModel = MessageMemory;
} else {
  // real mongoose schema (same fields as original)
  const MessageSchema = new mongoose.Schema(
    {
      wa_id: { type: String, index: true, required: true },
      name: { type: String },
      direction: { type: String, enum: ['in', 'out'], required: true },
      type: { type: String, default: 'text' },
      msg_id: { type: String, unique: true, sparse: true },
      meta_msg_id: { type: String, index: true },
      text: { type: String },
      media: { type: Object },
      from: { type: String },
      to: { type: String },
      status: { type: String, enum: ['queued','sent','delivered','read','failed'], default: 'sent', index: true },
      timestamp: { type: Date, index: true },
      raw: { type: Object }
    },
    { timestamps: true }
  );

  MessageSchema.index({ wa_id: 1, timestamp: -1 });
  MessageSchema.index({ meta_msg_id: 1 });

  MessageModel = mongoose.model('Message', MessageSchema);
}

export default MessageModel;
