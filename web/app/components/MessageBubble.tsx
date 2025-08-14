
import StatusTick from './StatusTick';

export default function MessageBubble({ m }: { m: any }) {
  const dir = m.direction === 'out' ? 'bubble-out' : 'bubble-in';
  return (
    <div className={`my-1 ${m.direction === 'out' ? 'text-right' : 'text-left'}`}>
      <div className={dir}>
        <div className="whitespace-pre-wrap break-words">{m.text}</div>
        <div className="text-[10px] mt-1 opacity-70 flex items-center gap-1 justify-end">
          <span>{new Date(m.timestamp).toLocaleString()}</span>
          {m.direction === 'out' && <StatusTick status={m.status} />}
        </div>
      </div>
    </div>
  );
}
