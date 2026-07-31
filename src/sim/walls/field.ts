import type { MoveFrameData } from '../frame-data.js';
import type { MutableFighterState } from '../state.js';
import {
  isBlockingKind,
  WALL_BLOCKING_LIMIT,
  WALL_SHATTER_FRAMES,
  WALL_TOTAL_LIMIT,
  type WallEntity,
  type WallSnapshot,
  type WallSpawnData,
} from './types.js';

/**
 * Ownership and lifetime of every energy plane in the round.
 *
 * The field is deliberately the only thing that creates or destroys a wall.
 * Moves ask for one; interruption, expiry and round reset are all handled here,
 * so a plane can never outlive the fighter that made it.
 */
export class WallField {
  private readonly walls: WallEntity[] = [];
  private nextId = 1;
  /** `fighterId:actionSerial:spawnIndex` — one spawn per authored entry. */
  private readonly spawned = new Set<string>();

  public get entities(): readonly WallEntity[] {
    return this.walls;
  }

  public clear(): void {
    this.walls.length = 0;
    this.spawned.clear();
  }

  /** Every plane belonging to a fighter leaves with them. */
  public removeOwnedBy(ownerId: string): void {
    for (let index = this.walls.length - 1; index >= 0; index -= 1) {
      if (this.walls[index]?.ownerId === ownerId) this.walls.splice(index, 1);
    }
  }

  public spawnFromMoves(
    fighters: readonly MutableFighterState[],
    moves: ReadonlyMap<string, MoveFrameData>,
  ): void {
    for (const fighter of fighters) {
      const action = fighter.action;
      if (action === null || fighter.hitstop > 0) continue;
      const authored = moves.get(action.moveId)?.walls;
      if (authored === undefined) continue;
      authored.forEach((data, index) => {
        const key = `${fighter.id}:${String(action.serial)}:${String(index)}`;
        if (action.frame !== data.spawnFrame || this.spawned.has(key)) return;
        this.spawned.add(key);
        this.create(fighter, data);
      });
    }
  }

  public create(owner: MutableFighterState, data: WallSpawnData): WallEntity {
    this.enforceLimits(owner.id, data);
    const wall: WallEntity = {
      id: this.nextId,
      ownerId: owner.id,
      team: owner.team,
      kind: data.kind,
      facing: owner.facing,
      center: {
        x: owner.position.x + data.offset.x * owner.facing,
        y: owner.position.y + data.offset.y,
      },
      halfSize: { ...data.halfSize },
      age: 0,
      materializeFrames: data.materializeFrames,
      lifetimeFrames: data.lifetimeFrames,
      integrity: data.integrity,
      maxIntegrity: data.integrity,
      runnable: data.runnable ?? false,
      platform: data.platform ?? false,
      pushSpeed: data.pushSpeed ?? 0,
      pushDamage: data.pushDamage ?? 0,
      pushHitstun: data.pushHitstun ?? 0,
      state: data.materializeFrames > 0 ? 'materializing' : 'solid',
      shatterFrames: 0,
      contactLedger: [],
    };
    this.nextId += 1;
    this.walls.push(wall);
    return wall;
  }

  /** Ages every plane, drives moving ones, and retires the finished ones. */
  public tick(leftWall: number, rightWall: number): void {
    for (const wall of this.walls) {
      wall.age += 1;
      if (wall.state === 'materializing' && wall.age >= wall.materializeFrames) {
        wall.state = 'solid';
      }
      if (wall.pushSpeed !== 0 && wall.state === 'solid') {
        wall.center.x += wall.pushSpeed * wall.facing;
        const limit = wall.facing === 1 ? rightWall : leftWall;
        const past = wall.facing === 1
          ? wall.center.x >= limit
          : wall.center.x <= limit;
        if (past) this.shatter(wall);
      }
      if (wall.state === 'shattering') {
        wall.shatterFrames -= 1;
      } else if (wall.age >= wall.lifetimeFrames) {
        this.shatter(wall);
      }
    }
    for (let index = this.walls.length - 1; index >= 0; index -= 1) {
      const wall = this.walls[index];
      if (wall !== undefined && wall.state === 'shattering' && wall.shatterFrames <= 0) {
        this.walls.splice(index, 1);
      }
    }
  }

  public shatter(wall: WallEntity): void {
    if (wall.state === 'shattering') return;
    wall.state = 'shattering';
    wall.shatterFrames = WALL_SHATTER_FRAMES;
    wall.pushSpeed = 0;
  }

  public find(id: number): WallEntity | null {
    return this.walls.find((wall) => wall.id === id) ?? null;
  }

  public read(): readonly WallSnapshot[] {
    return this.walls.map((wall) => ({
      id: wall.id,
      ownerId: wall.ownerId,
      kind: wall.kind,
      state: wall.state,
      center: { ...wall.center },
      halfSize: { ...wall.halfSize },
      facing: wall.facing,
      age: wall.age,
      lifetimeFrames: wall.lifetimeFrames,
      materializeFrames: wall.materializeFrames,
      integrity: wall.integrity,
      maxIntegrity: wall.maxIntegrity,
      runnable: wall.runnable,
      platform: wall.platform,
    }));
  }

  /**
   * The anti-turtle rule. Building a fourth blocking plane costs you the first
   * one, so pressure can always be re-established by breaking what is there.
   */
  private enforceLimits(ownerId: string, data: WallSpawnData): void {
    const owned = this.walls.filter(
      (wall) => wall.ownerId === ownerId && wall.state !== 'shattering',
    );
    if (isBlockingKind(data.kind)) {
      const blocking = owned.filter((wall) => isBlockingKind(wall.kind));
      while (blocking.length >= WALL_BLOCKING_LIMIT) {
        const oldest = blocking.shift();
        if (oldest !== undefined) this.shatter(oldest);
      }
    }
    while (owned.length >= WALL_TOTAL_LIMIT) {
      const oldest = owned.shift();
      if (oldest !== undefined) this.shatter(oldest);
    }
  }
}
