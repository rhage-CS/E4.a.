import { WIDTH } from "./actors.ts";

/** The enemy kinds a wave can bring; each is also the enemy's texture key. */
export type EnemyKind = "drone" | "dart" | "turret" | "lancer";

/**
 * How a wave's ships are arranged:
 * - line: side by side at the top, all at once
 * - vee: side by side, the middle ships first
 * - column: one behind another at a single x
 * - pincer: pairs from both sides, lower each pair
 */
export type Formation = "line" | "vee" | "column" | "pincer";

export interface Wave {
  /** Ticks after the sector starts when the first ship appears. */
  at: number;
  kind: EnemyKind;
  count: number;
  formation: Formation;
  /** Center of a line or vee, or the lane of a column (default mid-screen). */
  x?: number;
}

export interface Sector {
  name: string;
  subtitle: string;
  /** Ticks before the route may move on (sooner never; later if enemies linger). */
  length: number;
  waves: Wave[];
}

/** Extra ticks a sector waits for stragglers before moving on anyway. */
export const SECTOR_GRACE_TICKS = 240;

/** The name the route shows after the last sector. */
export const BOSS_NAME = "The Warden";

/** The route, in order. Adding a sector means adding one entry. */
export const SECTORS: readonly Sector[] = [
  {
    name: "Outer Drift",
    subtitle: "Scouts ahead",
    length: 1560,
    waves: [
      { at: 60, kind: "drone", count: 4, formation: "line" },
      { at: 360, kind: "drone", count: 5, formation: "vee", x: 168 },
      { at: 660, kind: "drone", count: 5, formation: "vee", x: 312 },
      { at: 960, kind: "drone", count: 6, formation: "line" },
      { at: 1200, kind: "drone", count: 4, formation: "column", x: 120 },
      { at: 1260, kind: "drone", count: 4, formation: "column", x: 360 },
    ],
  },
  {
    name: "Shatter Belt",
    subtitle: "Divers incoming",
    length: 1800,
    waves: [
      { at: 60, kind: "drone", count: 6, formation: "vee" },
      { at: 300, kind: "dart", count: 4, formation: "line" },
      { at: 600, kind: "dart", count: 5, formation: "column", x: 144 },
      { at: 720, kind: "dart", count: 5, formation: "column", x: 336 },
      { at: 1020, kind: "drone", count: 7, formation: "line" },
      { at: 1140, kind: "dart", count: 5, formation: "vee" },
      { at: 1440, kind: "dart", count: 6, formation: "line" },
    ],
  },
  {
    name: "Gun Lanes",
    subtitle: "Turrets online",
    length: 1920,
    waves: [
      { at: 60, kind: "turret", count: 1, formation: "line" },
      { at: 240, kind: "drone", count: 6, formation: "vee" },
      { at: 540, kind: "turret", count: 2, formation: "line" },
      { at: 840, kind: "dart", count: 6, formation: "column", x: 240 },
      { at: 1080, kind: "turret", count: 2, formation: "line" },
      { at: 1140, kind: "drone", count: 6, formation: "line" },
      { at: 1500, kind: "turret", count: 3, formation: "line" },
    ],
  },
  {
    name: "Lancer Gate",
    subtitle: "Crossfire",
    length: 1920,
    waves: [
      { at: 60, kind: "lancer", count: 4, formation: "pincer" },
      { at: 360, kind: "dart", count: 6, formation: "vee" },
      { at: 600, kind: "lancer", count: 6, formation: "pincer" },
      { at: 780, kind: "turret", count: 2, formation: "line" },
      { at: 1140, kind: "lancer", count: 6, formation: "pincer" },
      { at: 1260, kind: "drone", count: 8, formation: "vee" },
      { at: 1560, kind: "dart", count: 8, formation: "line" },
    ],
  },
  {
    name: "Last Approach",
    subtitle: "Everything they have",
    length: 2040,
    waves: [
      { at: 60, kind: "turret", count: 3, formation: "line" },
      { at: 180, kind: "lancer", count: 6, formation: "pincer" },
      { at: 540, kind: "dart", count: 6, formation: "column", x: 120 },
      { at: 540, kind: "dart", count: 6, formation: "column", x: 360 },
      { at: 900, kind: "drone", count: 9, formation: "vee" },
      { at: 1020, kind: "turret", count: 2, formation: "line" },
      { at: 1320, kind: "lancer", count: 8, formation: "pincer" },
      { at: 1560, kind: "dart", count: 8, formation: "vee" },
    ],
  },
];

/** One ship of a wave: what it is, and when (sector tick) and where it appears. */
export interface Spawn {
  at: number;
  kind: EnemyKind;
  x: number;
  y: number;
  /** Which way the ship leans or travels: 1 or -1. */
  side: number;
}

const ENTRY_Y = -30;
const LINE_SPACING = 64;
const VEE_SPACING = 44;
const VEE_STAGGER = 10;
const COLUMN_STAGGER = 24;
const PINCER_STAGGER = 30;
const PINCER_TOP = 70;
const PINCER_ROW = 50;
const PINCER_EDGE = 30;

/** Expands a wave into its ships, in creation order. */
export function spawnsOf(wave: Wave): Spawn[] {
  const center = wave.x ?? WIDTH / 2;
  const middle = (wave.count - 1) / 2;
  const spawns: Spawn[] = [];
  for (let i = 0; i < wave.count; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const offset = i - middle;
    switch (wave.formation) {
      case "line":
        spawns.push({
          at: wave.at,
          kind: wave.kind,
          x: center + offset * LINE_SPACING,
          y: ENTRY_Y,
          side,
        });
        break;
      case "vee":
        spawns.push({
          at: wave.at + Math.abs(offset) * VEE_STAGGER,
          kind: wave.kind,
          x: center + offset * VEE_SPACING,
          y: ENTRY_Y,
          side,
        });
        break;
      case "column":
        spawns.push({
          at: wave.at + i * COLUMN_STAGGER,
          kind: wave.kind,
          x: center,
          y: ENTRY_Y,
          side,
        });
        break;
      case "pincer": {
        const row = Math.floor(i / 2);
        spawns.push({
          at: wave.at + row * PINCER_STAGGER,
          kind: wave.kind,
          x: side === 1 ? -PINCER_EDGE : WIDTH + PINCER_EDGE,
          y: PINCER_TOP + row * PINCER_ROW,
          side,
        });
        break;
      }
    }
  }
  return spawns;
}
