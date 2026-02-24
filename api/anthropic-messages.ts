const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(
  req: { method?: string; body?: unknown },
  res: {
    setHeader: (name: string, value: string) => void;
    status: (code: number) => { json: (body: unknown) => void };
    json: (body: unknown) => void;
  }
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Anthropic proxy error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Proxy error' });
  }
}
