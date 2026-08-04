import type { HudSnapshot } from '@/src/hud/types';
import type { FighterInput, WorldSnapshot } from '@/src/sim';
import type { MatchResult } from '@/src/store/hudStore';
import type { FramePacket, InputPacket } from './types';

type Sender = (event: string, payload: object) => void;

let send: Sender = () => undefined;
let remoteInput: InputPacket = { sequence: 0, input: {} };
let remoteFrame: FramePacket | null = null;
let remoteResult: MatchResult | null = null;
let inputSequence = 0;

export function configureOnlineCombat(sender: Sender): void { send = sender; }
export function resetOnlineCombat(): void {
  send = () => undefined;
  remoteInput = { sequence: 0, input: {} };
  remoteFrame = null;
  remoteResult = null;
  inputSequence = 0;
}

export function receiveOnlineInput(payload: unknown): void { remoteInput = payload as InputPacket; }
export function receiveOnlineFrame(payload: unknown): void { remoteFrame = payload as FramePacket; }
export function receiveOnlineResult(payload: unknown): void { remoteResult = payload as MatchResult; }

export function sendOnlineInput(input: FighterInput): void {
  inputSequence += 1;
  send('input', { sequence: inputSequence, input });
}

export function readRemoteInput(): InputPacket { return remoteInput; }
export function broadcastOnlineFrame(world: WorldSnapshot, hud: HudSnapshot): void {
  send('frame', { world, hud });
}
export function takeRemoteFrame(): FramePacket | null {
  const packet = remoteFrame; remoteFrame = null; return packet;
}
export function broadcastOnlineResult(result: MatchResult): void { send('result', result); }
export function takeRemoteResult(): MatchResult | null {
  const result = remoteResult; remoteResult = null; return result;
}
