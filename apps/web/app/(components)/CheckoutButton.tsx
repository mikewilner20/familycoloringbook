'use client';

import { useState } from 'react';

export function CheckoutButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId })
    });
    if (!res.ok) {
      setError('Failed to start checkout');
      setLoading(false);
      return;
    }
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setError('Stripe session missing');
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onClick} disabled={loading}>{loading ? 'Redirecting...' : 'Checkout'}</button>
      {error && <p>{error}</p>}
    </div>
  );
}
