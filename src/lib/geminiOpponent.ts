import type { AiDifficulty, AiStrategy } from '@/src/ai';
import type { CharacterId } from '@/src/data/characterRoster';
import { getSupabaseClient } from './supabase';

const SYSTEM_PROMPT = `You direct a fighting-game CPU opponent. Return only JSON matching
{"style":"aggressive|balanced|defensive","range":"close|mid|long"}.
Pick a fair plan appropriate for the requested difficulty. Do not include markdown.`;

type GeminiPayload = { text?: unknown };

export async function loadGeminiOpponentStrategy(
  player: CharacterId,
  opponent: CharacterId,
  difficulty: AiDifficulty,
): Promise<AiStrategy | null> {
  const client = await getSupabaseClient();
  if (client === null) return null;

  try {
    const { data, error } = await client.functions.invoke<GeminiPayload>('ai', {
      body: {
        system: SYSTEM_PROMPT,
        prompt: `Player: ${player}. CPU fighter: ${opponent}. Difficulty: ${difficulty}. Choose the CPU battle plan.`,
      },
    });
    if (error !== null || typeof data?.text !== 'string') return null;
    return parseGeminiStrategy(data.text);
  } catch {
    return null;
  }
}

export function parseGeminiStrategy(value: string): AiStrategy | null {
  const json = value.match(/\{[\s\S]*\}/)?.[0];
  if (json === undefined) return null;
  try {
    const parsed = JSON.parse(json) as { style?: unknown; range?: unknown };
    if (!isStyle(parsed.style) || !isRange(parsed.range)) return null;
    return { style: parsed.style, range: parsed.range };
  } catch {
    return null;
  }
}

function isStyle(value: unknown): value is AiStrategy['style'] {
  return value === 'aggressive' || value === 'balanced' || value === 'defensive';
}

function isRange(value: unknown): value is AiStrategy['range'] {
  return value === 'close' || value === 'mid' || value === 'long';
}
