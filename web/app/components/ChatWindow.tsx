
'use client';
import { useEffect, useRef, useState } from 'react';
import { fetchMessages, sendMessage } from '../api';
import MessageBubble from './MessageBubble';
import { getSocket } from '../socket';

export default function ChatWindow({ wa_id }: { wa_id?: string }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [name, setName] = useState<string>('');
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!wa_id) return;
    (async () => {
      const data = await fetchMessages(wa_id);
      setMessages(data);
      setName(data.find((m:any)=>m.name)?.name || '');
    })();

    const socket = getSocket();
    socket.emit('join', wa_id);
    const onNew = (m:any) => setMessages(prev => prev.concat(m));
    const onUpdate = (m:any) => setMessages(prev => prev.map(x => x._id===m._id? m : x));
    socket.on('message:new', onNew);
    socket.on('message:update', onUpdate);
    return () => { socket.off('message:new', onNew); socket.off('message:update', onUpdate); };
  }, [wa_id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!wa_id || !text.trim()) return;
    const created = await sendMessage({ wa_id, text: text.trim(), name });
    setMessages((prev) => prev.concat(created));
    setText('');
  }

  if (!wa_id) return (
    <div className="flex-1 hidden md:flex items-center justify-center text-zinc-500">Select a chat to start messaging</div>
  );

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="sticky-header px-4 py-2 bg-emerald-700 text-white">
        <div className="font-semibold">{name || wa_id}</div>
        <div className="text-xs opacity-90">{wa_id}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1" style={{ backgroundImage: "url('https://i.imgur.com/6IUbEMN.png')", backgroundSize: 'cover' }}>
        {messages.map((m, i) => (<MessageBubble key={m._id || i} m={m} />))}
        <div ref={endRef} />
      </div>

      <form onSubmit={onSubmit} className="p-3 bg-white border-t flex gap-2">
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 px-3 py-2 rounded-xl border" />
        <button className="px-4 py-2 rounded-xl bg-green-600 text-white">Send</button>
      </form>
    </div>
  );
}
