'use client';

import { useState } from 'react';

export function CompileButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setMessage(null);
    await fetch('/api/jobs/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'compilePdf', projectId })
    });
    setMessage('Compile job queued. PDF will appear when ready.');
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>Compile interior PDF</h3>
      <p>Gather processed line art pages into a printable PDF.</p>
      <button onClick={onClick} disabled={loading}>{loading ? 'Queueing...' : 'Compile PDF'}</button>
      {message && <p>{message}</p>}
    </div>
  );
}
