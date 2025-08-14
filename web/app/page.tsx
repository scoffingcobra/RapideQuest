
'use client';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

export default function Page() {
  const [active, setActive] = useState<string | undefined>();
  return (
    <div className="h-screen w-full grid grid-rows-[auto_1fr]">
      <div className="px-4 py-2 border-b bg-emerald-700 text-white">WhatsApp Web Clone</div>
      <div className="grid grid-cols-1 md:grid-cols-[20rem_1fr] h-full">
        <Sidebar onSelect={setActive} active={active} />
        <ChatWindow wa_id={active} />
      </div>
    </div>
  );
}
