import {
  FIGHTER_VOICE_PROFILES,
  type VoicedCharacterId,
  type VoiceCategory,
} from './fighterVoiceProfiles';

export class VoicePlayer {
  private readonly nextLine = new Map<string, number>();
  private active: HTMLAudioElement | null = null;

  public play(
    fighterId: string,
    characterId: VoicedCharacterId,
    category: VoiceCategory,
    interrupt = false,
  ): boolean {
    if (typeof window === 'undefined') return false;
    if (!interrupt && this.active !== null && !this.active.ended) return false;
    this.stop();

    const lines = FIGHTER_VOICE_PROFILES[characterId][category];
    const lineKey = `${fighterId}:${category}`;
    const nextIndex = this.nextLine.get(lineKey) ?? 0;
    const line = lines[nextIndex % lines.length] ?? lines[0];
    this.nextLine.set(lineKey, nextIndex + 1);

    const audio = new window.Audio(line.src);
    audio.preload = 'auto';
    audio.volume = 0.96;
    this.active = audio;
    audio.addEventListener('ended', () => {
      if (this.active === audio) this.active = null;
    }, { once: true });
    void audio.play().catch(() => {
      if (this.active === audio) this.active = null;
    });
    return true;
  }

  public stop(): void {
    this.active?.pause();
    this.active = null;
  }
}
