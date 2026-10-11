import {SpriteConfig} from './utils/helper';

/**
 * THEME styling configuration for Wasteland Bunker Defense.
 */
export const THEME = {
  fontFamily: "'Courier New', monospace, sans-serif",
  colors: {
    bgDark: '#0c0a09',
    hudBg: 'rgba(15, 23, 42, 0.95)',
    panelBg: 'rgba(28, 25, 23, 0.96)',
    accentAmber: '#f59e0b',
    accentCyan: '#06b6d4',
    accentRed: '#ef4444',
    accentGreen: '#10b981',
    borderMuted: '#44403c',
    borderBright: '#78716c',
    scrapGold: '#fbbf24',
    textMuted: '#a8a29e',
    textLight: '#f5f5f4',
  },
  grid: {
    cols: 16,
    rows: 10,
    cellSize: 64,
  },
};

/**
 * Configuration for the game.
 */
export const CONFIG = {
  // Baseline GAME info
  title: {
    value: 'Wasteland Bunker Defense',
    type: 'string',
    label: 'Game Title',
    group: 'GAME',
  },
  baseCanvasWidth: {
    value: 1024,
    type: 'number',
    label: 'Base Canvas Width',
    group: 'GAME',
  },
  baseCanvasHeight: {
    value: 640,
    type: 'number',
    label: 'Base Canvas Height',
    group: 'GAME',
  },

  // System Constants
  targetFPS: {
    value: 60,
    type: 'number',
    label: 'Target FPS',
    group: 'SYSTEM',
  },
  stepMs: {
    value: 1000 / 60,
    type: 'number',
    label: 'Step MS',
    group: 'SYSTEM',
  },
  maxSubSteps: {
    value: 5,
    type: 'number',
    label: 'Max Sub Steps',
    group: 'SYSTEM',
  },

  // THEME Settings
  backgroundColor: {
    value: '#1c1917',
    type: 'color',
    label: 'Background Color',
    group: 'THEME',
  },
  primaryColor: {
    value: '#f59e0b',
    type: 'color',
    label: 'Primary Color',
    group: 'THEME',
  },
  fontFamily: {
    value: "'Courier New', monospace",
    type: 'string',
    label: 'Font Family',
    group: 'THEME',
  },

  // Audio Levels
  defaultMusicVolume: {
    value: 0.5,
    type: 'number',
    label: 'Default Music Volume',
    group: 'AUDIO',
  },
  defaultSfxVolume: {
    value: 0.7,
    type: 'number',
    label: 'Default SFX Volume',
    group: 'AUDIO',
  },

  // Gameplay & Balance Rules (for playground config)
  startingScrap: {
    value: 300,
    type: 'number',
    label: 'Starting Scrap Metal',
    group: 'Rules',
  },
  startingBunkerHealth: {
    value: 20,
    type: 'number',
    label: 'Bunker Integrity HP',
    group: 'Rules',
  },
  totalWaves: {
    value: 20,
    type: 'number',
    label: 'Total Waves',
    group: 'Rules',
  },
  earlyWaveBonus: {
    value: 20,
    type: 'number',
    label: 'Early Call Scrap Bonus',
    group: 'Rules',
  },
  orbitalStrikeCooldown: {
    value: 30,
    type: 'number',
    label: 'Orbital Strike Cooldown (s)',
    group: 'Rules',
  },
  orbitalStrikeDamage: {
    value: 150,
    type: 'number',
    label: 'Orbital Strike Damage',
    group: 'Rules',
  },
  rapidTurretCost: {
    value: 100,
    type: 'number',
    label: 'Rapid Turret Cost',
    group: 'Rules',
  },
  cryoTurretCost: {
    value: 150,
    type: 'number',
    label: 'Cryo Turret Cost',
    group: 'Rules',
  },
  mineCost: {
    value: 60,
    type: 'number',
    label: 'Landmine Cost',
    group: 'Rules',
  },
  mortarTurretCost: {
    value: 220,
    type: 'number',
    label: 'Mortar Turret Cost',
    group: 'Rules',
  },

  // Template compatibility
  playerSprite: {
    value: undefined as SpriteConfig | undefined,
    type: 'sprite',
    label: 'Player Sprite',
    group: 'Visuals',
  },

  // Assets resolutions & aspect ratios (from read_assets_metadata)
  assetScrapIconAspectRatio: {
    value: 619 / 609,
    type: 'number',
    label: 'Scrap Icon Aspect Ratio',
    group: 'ASSETS',
  },
  assetMortarTurretAspectRatio: {
    value: 598 / 660,
    type: 'number',
    label: 'Mortar Turret Aspect Ratio',
    group: 'ASSETS',
  },
  assetMortarShellAspectRatio: {
    value: 824 / 334,
    type: 'number',
    label: 'Mortar Shell Aspect Ratio',
    group: 'ASSETS',
  },
  assetBulletAspectRatio: {
    value: 618 / 373,
    type: 'number',
    label: 'Bullet Aspect Ratio',
    group: 'ASSETS',
  },
  assetLandmineAspectRatio: {
    value: 722 / 578,
    type: 'number',
    label: 'Landmine Aspect Ratio',
    group: 'ASSETS',
  },
  assetExplosionAspectRatio: {
    value: 660 / 576,
    type: 'number',
    label: 'Explosion Aspect Ratio',
    group: 'ASSETS',
  },
  assetCrateAspectRatio: {
    value: 700 / 790,
    type: 'number',
    label: 'Obstacle Crate Aspect Ratio',
    group: 'ASSETS',
  },
  assetBunkerAspectRatio: {
    value: 782 / 705,
    type: 'number',
    label: 'Bunker Aspect Ratio',
    group: 'ASSETS',
  },
  assetRoadTileAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Road Tile Aspect Ratio',
    group: 'ASSETS',
  },
  assetRapidTurretAspectRatio: {
    value: 756 / 579,
    type: 'number',
    label: 'Rapid Turret Aspect Ratio',
    group: 'ASSETS',
  },
  assetCryoTurretAspectRatio: {
    value: 742 / 700,
    type: 'number',
    label: 'Cryo Turret Aspect Ratio',
    group: 'ASSETS',
  },
  assetGroundTileAspectRatio: {
    value: 1.0,
    type: 'number',
    label: 'Ground Tile Aspect Ratio',
    group: 'ASSETS',
  },
  assetOrbitalIconAspectRatio: {
    value: 619 / 618,
    type: 'number',
    label: 'Orbital Icon Aspect Ratio',
    group: 'ASSETS',
  },
};

// Merge customized config values if present (injected by Playground)
const {playgroundConfig} = globalThis as {
  playgroundConfig?: Record<string, unknown>;
};
if (playgroundConfig) {
  for (const [key, value] of Object.entries(playgroundConfig)) {
    if (key in CONFIG) {
      Object.assign(CONFIG[key as keyof typeof CONFIG], {value});
    }
  }
}

/**
 * Type helper for reading values in game code
 */
export type ConfigKey = keyof typeof CONFIG;

/**
 * Gets a configuration value by key.
 * @param key The configuration key.
 * @return The configuration value.
 */
export function getConfig<K extends ConfigKey>(
  key: K,
): (typeof CONFIG)[K]['value'] {
  return CONFIG[key].value;
}

export const PRESETS = {};
