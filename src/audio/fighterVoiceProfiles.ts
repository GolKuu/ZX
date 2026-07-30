import type { CharacterId } from '@/src/data/characterRoster';

export type VoiceCategory = 'dodge' | 'taunt' | 'victory';

interface VoiceLine {
  readonly src: string;
  readonly text: string;
}

type FighterVoiceProfile = Readonly<Record<
  VoiceCategory,
  readonly VoiceLine[]
>>;

export const FIGHTER_VOICE_PROFILES = {
  mim: {
    dodge: [
      { src: '/audio/mim/dodge-01.mp3', text: 'Р­С‚Рѕ Р±С‹Р» РјСѓРІ РёР»Рё СЃСѓРґРѕСЂРѕРіР°?' },
      { src: '/audio/mim/dodge-02.mp3', text: 'РЇ Р±С‹ С‚РѕР¶Рµ РїСЂРѕРјР°С…РЅСѓР»СЃСЏ РѕС‚ СЃС‚С‹РґР°.' },
      { src: '/audio/mim/dodge-03.mp3', text: 'РџРѕРїСЂРѕР±СѓР№ СЂСѓРєР°РјРё, РјС‹С€РєР° РЅРµ РїРѕРјРѕР¶РµС‚.' },
    ],
    taunt: [
      { src: '/audio/mim/taunt-01.mp3', text: 'Р§С‚РѕР±С‹ РІС‹РёРіСЂР°С‚СЊ, РЅР°Р¶РјРё Alt+F4.' },
      {
        src: '/audio/mim/taunt-02.mp3',
        text: 'РЎРµР№С‡Р°СЃ Р±СѓРґРµС‚ РјРѕРјРµРЅС‚, РєРѕС‚РѕСЂС‹Р№ РІС‹СЂРµР¶СѓС‚ РІ С‚РёРєС‚РѕРє.',
      },
      { src: '/audio/mim/taunt-03.mp3', text: 'РўС‹ С‚РѕС‡РЅРѕ РіР»Р°РІРЅС‹Р№ РіРµСЂРѕР№ СЃРІРѕРµР№ РёСЃС‚РѕСЂРёРё?' },
    ],
    victory: [
      { src: '/audio/mim/victory-01.mp3', text: 'GG. Mostly me.' },
      {
        src: '/audio/mim/victory-02.mp3',
        text: 'РЎРїР°СЃРёР±Рѕ Р·Р° Р±РµСЃРїР»Р°С‚РЅС‹Рµ РѕС‡РєРё СЂРµР№С‚РёРЅРіР°.',
      },
      { src: '/audio/mim/victory-03.mp3', text: 'Р•СЃР»Рё С‡С‚Рѕ, СЌС‚Рѕ Р·Р°РїРёСЃС‹РІР°Р»РѕСЃСЊ.' },
    ],
  },
  echo: {
    dodge: [
      { src: '/audio/echo/dodge-01.mp3', text: 'РЇ СЌС‚Рѕ СѓР¶Рµ РІРёРґРµР».' },
      { src: '/audio/echo/dodge-02.mp3', text: 'РџРѕРІС‚РѕСЂСЏРµС€СЊСЃСЏ.' },
      { src: '/audio/echo/dodge-03.mp3', text: 'РЎРєСѓС‡РЅРѕ.' },
    ],
    taunt: [
      { src: '/audio/echo/taunt-01.mp3', text: 'РЈРіР°РґР°Р№, С‡С‚Рѕ С‚С‹ СЃРµР№С‡Р°СЃ РЅР°Р¶РјРµС€СЊ.' },
      { src: '/audio/echo/taunt-02.mp3', text: 'РЇ СѓР¶Рµ Р·РЅР°СЋ СЃР»РµРґСѓСЋС‰РёР№ РјСѓРІ.' },
      { src: '/audio/echo/taunt-03.mp3', text: 'РџРѕРІС‚РѕСЂРё РґР»СЏ СЃС‚Р°С‚РёСЃС‚РёРєРё.' },
    ],
    victory: [
      { src: '/audio/echo/victory-01.mp3', text: 'РЎРїР°СЃРёР±Рѕ Р·Р° РґР°РЅРЅС‹Рµ.' },
      { src: '/audio/echo/victory-02.mp3', text: 'РџСЂРµРґСЃРєР°Р·СѓРµРјРѕСЃС‚СЊ вЂ” СЃС‚СЂР°С€РЅР°СЏ СЃРёР»Р°.' },
      { src: '/audio/echo/victory-03.mp3', text: 'РЇ РїРѕР±РµРґРёР» С‚РµР±СЏ С‚РІРѕРёРј Р¶Рµ РїР»Р°РЅРѕРј.' },
    ],
  },
  glitch: {
    dodge: [
      { src: '/audio/glitch/dodge-01.mp3', text: 'РћС€РёР±РєР° 403.' },
      {
        src: '/audio/glitch/dodge-02.mp3',
        text: 'РџРѕРїСЂРѕР±СѓР№С‚Рµ РїРµСЂРµР·Р°РіСЂСѓР·РёС‚СЊ РїСЂРѕС‚РёРІРЅРёРєР°.',
      },
      { src: '/audio/glitch/dodge-03.mp3', text: 'РђС‚Р°РєР° РЅРµ РЅР°Р№РґРµРЅР°.' },
    ],
    taunt: [
      { src: '/audio/glitch/taunt-01.mp3', text: 'Р Р°Р±РѕС‚Р°РµС‚ РєР°Рє Р·Р°РґСѓРјР°РЅРѕ.' },
      { src: '/audio/glitch/taunt-02.mp3', text: 'РќРµ Р±Р°Рі. РћСЃРѕР±РµРЅРЅРѕСЃС‚СЊ.' },
      {
        src: '/audio/glitch/taunt-03.mp3',
        text: 'Р Р°Р·СЂР°Р±РѕС‚С‡РёРє Р±С‹ СЌС‚Рѕ РЅРµ РѕРґРѕР±СЂРёР».',
      },
    ],
    victory: [
      {
        src: '/audio/glitch/victory-01.mp3',
        text: 'Opponent.exe РїРµСЂРµСЃС‚Р°Р» РѕС‚РІРµС‡Р°С‚СЊ.',
      },
      {
        src: '/audio/glitch/victory-02.mp3',
        text: 'РљСЂРёС‚РёС‡РµСЃРєР°СЏ РѕС€РёР±РєР° РёРіСЂРѕРєР°.',
      },
      {
        src: '/audio/glitch/victory-03.mp3',
        text: 'РџР°С‚С‡РЅРѕСѓС‚С‹ Р±С‹Р»Рё РїСЂРѕС‚РёРІ С‚РµР±СЏ.',
      },
    ],
  },
  chrono: {
    dodge: [
      { src: '/audio/chrono/dodge-01.mp3', text: 'РЇ РІРёРґРµР» СЌС‚Рѕ С‡РµСЂРµР· РїСЏС‚СЊ СЃРµРєСѓРЅРґ.' },
      { src: '/audio/chrono/dodge-02.mp3', text: 'РЎС‚Р°СЂР°СЏ РІРµСЂСЃРёСЏ СЃРѕР±С‹С‚РёР№.' },
      { src: '/audio/chrono/dodge-03.mp3', text: 'РќРµСѓРґР°С‡РЅР°СЏ Р»РёРЅРёСЏ РІСЂРµРјРµРЅРё.' },
    ],
    taunt: [
      {
        src: '/audio/chrono/taunt-01.mp3',
        text: 'РР· 143 РІР°СЂРёР°РЅС‚РѕРІ С‚С‹ РІС‹Р±СЂР°Р» С…СѓРґС€РёР№.',
      },
      {
        src: '/audio/chrono/taunt-02.mp3',
        text: 'Р’ РґСЂСѓРіРѕР№ РІСЃРµР»РµРЅРЅРѕР№ СЌС‚Рѕ СЃСЂР°Р±РѕС‚Р°Р»Рѕ.',
      },
      {
        src: '/audio/chrono/taunt-03.mp3',
        text: 'РЎС‚Р°С‚РёСЃС‚РёРєР° РЅРµ РЅР° С‚РІРѕРµР№ СЃС‚РѕСЂРѕРЅРµ.',
      },
    ],
    victory: [
      {
        src: '/audio/chrono/victory-01.mp3',
        text: 'РќР°РёР±РѕР»РµРµ РІРµСЂРѕСЏС‚РЅС‹Р№ СЂРµР·СѓР»СЊС‚Р°С‚.',
      },
      {
        src: '/audio/chrono/victory-02.mp3',
        text: 'РЇ РїСЂРѕРІРµСЂСЏР». Р”СЂСѓРіРёС… РєРѕРЅС†РѕРІРѕРє РЅРµС‚.',
      },
      {
        src: '/audio/chrono/victory-03.mp3',
        text: 'РЎС‚Р°С‚РёСЃС‚РёРєР° Р±РµСЃРїРѕС‰Р°РґРЅР°.',
      },
    ],
  },
} as const satisfies Partial<Record<CharacterId, FighterVoiceProfile>>;

export type VoicedCharacterId = keyof typeof FIGHTER_VOICE_PROFILES;

export function hasVoiceProfile(
  characterId: CharacterId,
): characterId is VoicedCharacterId {
  return characterId in FIGHTER_VOICE_PROFILES;
}

