import type { EstimatedFood } from './types';

const API_KEY_STORAGE_KEY = 'macrotracker-claude-api-key';

export function getClaudeApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) ?? '';
}

export function setClaudeApiKey(key: string): void {
  if (key.trim()) {
    localStorage.setItem(API_KEY_STORAGE_KEY, key.trim());
  } else {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}

const ANALYZE_PROMPT = `Analyze this food photo. Estimate the following per serving shown:
- Food name/description
- Calories
- Protein (g)
- Carbs (g)
- Fat (g)
- Fiber (g)

If you can identify specific items, list each separately.
Return ONLY a valid JSON array, no other text. Example format:
[{"name": "Grilled chicken breast", "calories": 165, "protein": 31, "carbs": 0, "fat": 4, "fiber": 0}]

Be conservative with estimates. If unsure, provide a reasonable range and use the midpoint.`;

/**
 * Send the image (and optional description) to Claude and return estimated foods.
 * Uses model claude-sonnet-4-20250514 with vision.
 */
export async function analyzeFoodPhoto(
  apiKey: string,
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
  userDescription?: string
): Promise<EstimatedFood[]> {
  const content: Array<{ type: 'image'; source: { type: 'base64'; media_type: string; data: string } } | { type: 'text'; text: string }> = [
    {
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType,
        data: imageBase64,
      },
    },
    {
      type: 'text',
      text: userDescription?.trim()
        ? `${ANALYZE_PROMPT}\n\nAdditional context from the user: ${userDescription.trim()}`
        : ANALYZE_PROMPT,
    },
  ];

  const apiUrl = import.meta.env.DEV
    ? '/api/anthropic/v1/messages'
    : 'https://api.anthropic.com/v1/messages';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    }),
  });

  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(err?.error?.message ?? `API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = data.content?.find((b) => b.type === 'text')?.text?.trim();
  if (!text) throw new Error('No response from Claude');

  // Extract JSON array (handle optional markdown code block)
  let jsonStr = text;
  const codeMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeMatch) jsonStr = codeMatch[1].trim();
  const raw = JSON.parse(jsonStr) as unknown;
  if (!Array.isArray(raw)) throw new Error('Response was not a JSON array');

  return raw.map((item) => {
    const o = item as Record<string, unknown>;
    return {
      name: String(o.name ?? 'Unknown'),
      calories: Number(o.calories) || 0,
      protein: Number(o.protein) || 0,
      carbs: Number(o.carbs) || 0,
      fat: Number(o.fat) || 0,
      fiber: typeof o.fiber === 'number' ? o.fiber : undefined,
    } satisfies EstimatedFood;
  });
}
