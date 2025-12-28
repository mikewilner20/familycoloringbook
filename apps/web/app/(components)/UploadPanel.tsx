'use client';

import { useState } from 'react';

export function UploadPanel({ projectId }: { projectId: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setStatus('Requesting upload slot...');

    const presign = await fetch(`/api/projects/${projectId}/assets/presign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contentType: file.type || 'application/octet-stream' })
    }).then((res) => res.json());

    const upload = await fetch(presign.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file
    });

    if (!upload.ok) {
      setStatus('Upload failed');
      setUploading(false);
      return;
    }

    setStatus('Queued for line art generation...');
    await fetch('/api/jobs/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'generateLineArt', assetId: presign.assetId })
    });
    setStatus('Uploaded! Worker will create line art.');
    setUploading(false);
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>Upload a photo</h3>
      <input type="file" accept="image/*" onChange={onFileChange} disabled={uploading} />
      {status ? <p>{status}</p> : <p>We will queue a job to convert to outlines after upload.</p>}
    </div>
  );
}
