
export default function StatusTick({ status }: { status?: string }) {
  if (!status) return null;
  if (status === 'sent') return <span title="sent">✓</span>;
  if (status === 'delivered') return <span title="delivered">✓✓</span>;
  if (status === 'read') return <span title="read" className="text-sky-600">✓✓</span>;
  if (status === 'failed') return <span title="failed">⚠</span>;
  return null;
}
