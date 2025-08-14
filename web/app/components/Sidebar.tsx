
'use client';
import { useEffect, useState } from 'react';
import { fetchConversations } from '../api';

export default function Sidebar({ onSelect, active }: { onSelect: (id: string) => void; active?: string }) {
  const [list, setList] = useState<any[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => { (async () => setList(await fetchConversations()))(); }, []);

  const filtered = list.filter(c => (c.name || c.wa_id || c._id).toLowerCase().includes(q.toLowerCase()));

  const getId = (c:any) => c.wa_id || c._id;

  return (
    <div className="w-full md:w-80 border-r bg-white h-full flex flex-col">
      <div className="p-2 sticky-header"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search or start new chat" className="w-full px-3 py-2 rounded-lg border"/></div>
      <div className="overflow-y-auto">
        {filtered.map(c => {
          const id = getId(c);
          return (
          <button key={id} onClick={()=>onSelect(id)}
            className={`w-full text-left px-3 py-3 hover:bg-zinc-50 border-b ${active===id?'bg-zinc-50':''}`}>
            <div className="font-medium">{c.name || id}</div>
            <div className="text-xs opacity-70 truncate">
              {c.lastMessage?.direction==='out' ? 'You: ' : ''}{c.lastMessage?.text}
            </div>
            <div className="text-[10px] opacity-60">{c.lastMessage?.timestamp && new Date(c.lastMessage.timestamp).toLocaleString()}</div>
          </button>
        )})}
      </div>
    </div>
  );
}
