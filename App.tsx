// tslint:disable
/* eslint-disable */
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Play,
  RotateCw,
  Volume2,
  VolumeX,
  Shield,
  Zap,
  Crosshair,
  Trash2,
  TrendingUp,
  AlertTriangle,
  HelpCircle,
  Menu as MenuIcon,
  X,
  FastForward,
  Award,
  Cpu,
  Layers,
  Flame,
  Sparkles,
  Radio,
  Target,
  Activity,
  Check,
  Lock,
  Globe,
} from 'lucide-react';
import {CONFIG, getConfig, THEME} from './constants';
import BackgroundMusic from './utils/BackgroundMusic';
import {
  createFixedStepper,
  drawAsset,
  drawBackground,
  Entity,
  formatTime,
  gameAudio,
  GameState,
  MenuOverlay,
  Overlay,
  prepareCanvas,
  useAssets,
  useAutoFocus,
  useInput,
  useIsMobile,
} from './utils/helper';
import {
  usePlayground,
  usePlaygroundGameLifecycle,
  useRpc,
} from './utils/usePlayground';
import {
  SpriteActionConfig,
  SpriteAnimationState,
  SpriteRenderer,
} from './SpriteRenderer';

// Audio track
const BACKGROUND_MUSIC_URL = 'assets/audio/bgm_wasteland_defense.mp3';

// Grid Constants
const COLS = THEME.grid.cols; // 16
const ROWS = THEME.grid.rows; // 10
const CELL_SIZE = THEME.grid.cellSize; // 64
const CANVAS_WIDTH = COLS * CELL_SIZE; // 1024
const CANVAS_HEIGHT = ROWS * CELL_SIZE; // 640

// Asset Manifest
const ASSETS_MANIFEST: Record<string, string> = {
  icon_scrap_metal: 'assets/images/icon_scrap_metal.png',
  turret_rapid_cannon: 'assets/images/turret_rapid_cannon.png',
  turret_cryo_emitter: 'assets/images/turret_cryo_emitter.png',
  trap_landmine: 'assets/images/trap_landmine.png',
  turret_mortar_launcher: 'assets/images/turret_mortar_launcher.png',
  projectile_bullet: 'assets/images/projectile_bullet.png',
  projectile_mortar_shell: 'assets/images/projectile_mortar_shell.png',
  fx_explosion_ring: 'assets/images/fx_explosion_ring.png',
  obstacle_ruin_crate: 'assets/images/obstacle_ruin_crate.png',
  bunker_command_hub: 'assets/images/bunker_command_hub.png',
  road_asphalt_tile: 'assets/images/road_asphalt_tile.png',
  bg_wasteland_ground: 'assets/images/bg_wasteland_ground.png',
  icon_orbital_bombardment: 'assets/images/icon_orbital_bombardment.png',

  // Spritesheets
  zombie_walker_idle: 'assets/images/zombie_walker_idle.png',
  zombie_walker_walk: 'assets/images/zombie_walker_walk.png',
  zombie_walker_hurt: 'assets/images/zombie_walker_hurt.png',
  zombie_walker_death: 'assets/images/zombie_walker_death.png',

  zombie_sprinter_idle: 'assets/images/zombie_sprinter_idle.png',
  zombie_sprinter_run: 'assets/images/zombie_sprinter_run.png',
  zombie_sprinter_hurt: 'assets/images/zombie_sprinter_hurt.png',
  zombie_sprinter_death: 'assets/images/zombie_sprinter_death.png',

  zombie_behemoth_idle: 'assets/images/zombie_behemoth_idle.png',
  zombie_behemoth_walk: 'assets/images/zombie_behemoth_walk.png',
  zombie_behemoth_attack: 'assets/images/zombie_behemoth_attack.png',
  zombie_behemoth_death: 'assets/images/zombie_behemoth_death.png',

  zombie_boss_idle: 'assets/images/zombie_boss_idle.png',
  zombie_boss_walk: 'assets/images/zombie_boss_walk.png',
  zombie_boss_attack: 'assets/images/zombie_boss_attack.png',
  zombie_boss_death: 'assets/images/zombie_boss_death.png',
};

export type Language = 'en' | 'vi';

export const TRANSLATIONS = {
  en: {
    gameTitle: 'WASTELAND BUNKER DEFENSE',
    gameSubtitle: 'Command specialized turret variants, equip Tech Lab weapon mods, and counter dangerous monster affixes across 20 escalating waves.',
    commenceDefense: 'COMMENCE DEFENSE',
    tacticalBriefing: 'TACTICAL BRIEFING',
    bunkerCore: 'BUNKER CORE',
    scrapMetal: 'SCRAP METAL',
    wave: 'WAVE',
    of: 'of',
    callNow: 'CALL NOW (+20s)',
    techLab: 'TECH LAB',
    speed1x: '1x SPEED',
    speed2x: '2x SPEED',
    orbitalStrike: 'ORBITAL STRIKE',
    scoreBest: 'SCORE / BEST',
    menu: 'MENU',
    autocannon: 'AUTOCANNON',
    cryoBeam: 'CRYO BEAM',
    roadMine: 'ROAD MINE',
    mortar: 'MORTAR',
    scrap: 'Scrap',
    target: 'TARGET',
    targetFirst: 'FIRST',
    targetStrongest: 'STRONGEST',
    targetWeakest: 'WEAKEST',
    targetLast: 'LAST',
    sell: 'SELL',
    hintDeployRoad: 'Click on a road tile to deploy.',
    hintDeployEmpty: 'Click on an empty tile to deploy.',
    hintDefault: 'Select a defense turret to construct, or click placed turrets to specialize variants.',
    arsenalTechLab: 'ARSENAL TECH LAB',
    arsenalSubtitle: 'Equip global weapon modifications using Scrap Metal',
    availableScrap: 'AVAILABLE SCRAP',
    returnToDefense: 'RETURN TO DEFENSE',
    active: 'ACTIVE',
    research: 'RESEARCH',
    tacticalPause: 'TACTICAL PAUSE',
    resumeDefense: 'RESUME DEFENSE',
    music: 'Music',
    sfx: 'SFX',
    muted: 'Muted',
    soundActive: 'Active',
    restartDefense: 'RESTART DEFENSE',
    howToPlay: 'HOW TO PLAY & INTEL',
    abandonDefense: 'ABANDON DEFENSE',
    wastelandIntel: 'WASTELAND INTEL',
    monsterAffixesTitle: 'MONSTER MODIFIERS (AFFIXES):',
    affixArmoredDesc: 'ARMORED: -50% kinetic damage reduction. Vulnerable to Railgun & Cryo.',
    affixSwiftDesc: 'SWIFT: +50% movement speed with motion blur trails.',
    affixShieldedDesc: 'SHIELDED: Absorbs all incoming damage until the blue energy barrier collapses.',
    affixRegeneratorDesc: 'REGENERATOR: Constantly recovers +5% HP every second.',
    affixSplitterDesc: 'SPLITTER: Spawns 2 mini-swarmers on death.',
    affixUnstableDesc: 'UNSTABLE: Explodes in a fiery detonation when killed.',
    turretVariantsTitle: 'TURRET SPECIALIZATION VARIANTS:',
    varAutocannonDesc: 'Autocannon: Gatling Overclock (barrage DPS) vs Railgun (Armor Pierce).',
    varCryoDesc: 'Cryo Beam: Blizzard Nova (AoE slow & freeze) vs Sub-Zero Shatter (+40% Brittle).',
    varMineDesc: 'Road Mine: Cluster Napalm (lingering fire) vs EMP Shockwave (stuns & strips affixes).',
    varMortarDesc: 'Mortar: Hellfire Battery (massive firestorm) vs Heavy Siege (shockwave knockback).',
    techLabTitle: 'ARSENAL TECH LAB:',
    techLabDesc: 'Equip 5 global modules (Overcharged Capacitors, HE Munitions, Nanite Matrix, Scavenger, Crit AI) using Scrap metal in the top bar.',
    returnToCommand: 'RETURN TO COMMAND',
    bunkerOverrun: 'BUNKER OVERRUN',
    bunkerOverrunDesc: 'The defense line collapsed on Wave {wave}. Final Score: {score}',
    retryDefense: 'RETRY DEFENSE',
    sectorSecured: 'SECTOR SECURED',
    sectorSecuredDesc: 'All 20 Undead Waves Repelled! The Survivor Bunker Stands! Final Score: {score}',
    defendAgain: 'DEFEND AGAIN',
    clickToStrike: 'CLICK TO STRIKE',
    orbitalBombardment: 'ORBITAL BOMBARDMENT!',
    earlyCallBonus: 'EARLY CALL! +{bonus} SCRAP',
    waveCleared: 'WAVE {wave} CLEARED!',
    notEnoughScrap: 'NOT ENOUGH SCRAP!',
    mustPlaceOnRoad: 'MUST PLACE ON ROAD!',
    cannotBuildHere: 'CANNOT BUILD HERE!',
    upgradedTo: 'UPGRADED: {variant} (LVL {lvl})',
    bunkerDamaged: 'BUNKER DAMAGED -{dmg} HP!',
    bunkerRepair: '+1 BUNKER REPAIR',
    techUnlocked: 'TECH UNLOCKED: {name}!',
    knockback: 'KNOCKBACK!',
    armorMinus50: 'ARMOR -50%',
    armorBypass: 'ARMOR BYPASS!',
    shieldMinus: 'SHIELD -{dmg}',
    shieldCollapsed: 'SHIELD COLLAPSED!',
    enragedHorde: 'ENRAGED HORDE!',
    splitSwarm: 'SPLIT SWARM!',
    deathDetonation: 'DEATH DETONATION!',
    frozen: 'FROZEN!',
    brittle: 'BRITTLE (+40% DMG)',
    empStripped: 'EMP STRIPPED!',
    gatlingBtn: 'GATLING',
    railgunBtn: 'RAILGUN',
    blizzardBtn: 'BLIZZARD',
    shatterBtn: 'SHATTER',
    napalmBtn: 'NAPALM',
    empBtn: 'EMP',
    hellfireBtn: 'HELLFIRE',
    siegeBtn: 'SIEGE',

    // Tech Mods
    modCapacitorsName: 'Overcharged Capacitors',
    modCapacitorsCat: 'OPTICS & CRYO',
    modCapacitorsDesc: '+25% range to all turrets & Cryo slows last +50% longer.',

    modMunitionsName: 'High-Explosive Munitions',
    modMunitionsCat: 'BALLISTICS',
    modMunitionsDesc: 'Kinetic & mortar attacks gain +25% explosive splash radius & +20% damage.',

    modNaniteName: 'Nanite Repair Matrix',
    modNaniteCat: 'ENGINEERING',
    modNaniteDesc: 'Bunker automatically repairs +1 HP every 8s + Turrets fire 15% faster.',

    modScavengerName: 'Scrap Scavenger Module',
    modScavengerCat: 'LOGISTICS',
    modScavengerDesc: '+40% bonus scrap bounty from all modified monsters & bosses.',

    modCritName: 'Critical Targeting AI',
    modCritCat: 'AVIONICS',
    modCritDesc: '20% chance for turret attacks to inflict 2.5x Critical Hit damage.',
  },
  vi: {
    gameTitle: 'PHÒNG THỦ HẦM TRÚ HOANG TÀN',
    gameSubtitle: 'Chỉ huy các tháp phòng thủ chuyên biệt, nghiên cứu vũ khí tại Viện Công Nghệ và khắc chế các thuộc tính quái vật nguy hiểm qua 20 đợt tấn công.',
    commenceDefense: 'BẮT ĐẦU PHÒNG THỦ',
    tacticalBriefing: 'HƯỚNG DẪN CHIẾN THUẬT',
    bunkerCore: 'LÕI HẦM TRÚ',
    scrapMetal: 'PHẾ LIỆU',
    wave: 'ĐỢT QUÁI',
    of: 'trên',
    callNow: 'GỌI NGAY (+20s)',
    techLab: 'VIỆN CÔNG NGHỆ',
    speed1x: 'TỐC ĐỘ 1x',
    speed2x: 'TỐC ĐỘ 2x',
    orbitalStrike: 'OANH KÍCH QUỸ ĐẠO',
    scoreBest: 'ĐIỂM / KỶ LỤC',
    menu: 'MENU',
    autocannon: 'PHÁO TỰ ĐỘNG',
    cryoBeam: 'TIA BĂNG GIÁ',
    roadMine: 'MÌN ĐƯỜNG BỘ',
    mortar: 'SÚNG CỐI',
    scrap: 'Phế liệu',
    target: 'MỤC TIÊU',
    targetFirst: 'ĐẦU',
    targetStrongest: 'MẠNH NHẤT',
    targetWeakest: 'YẾU NHẤT',
    targetLast: 'CUỐI',
    sell: 'BÁN',
    hintDeployRoad: 'Nhấp vào ô đường đi để đặt mìn.',
    hintDeployEmpty: 'Nhấp vào ô đất trống để xây tháp.',
    hintDefault: 'Chọn tháp phòng thủ để xây dựng hoặc nhấp vào tháp đã đặt để nâng cấp nhánh chuyên biệt.',
    arsenalTechLab: 'VIỆN CÔNG NGHỆ VŨ KHÍ',
    arsenalSubtitle: 'Trang bị nâng cấp vũ khí toàn diện bằng Phế Liệu',
    availableScrap: 'PHẾ LIỆU HIỆN CÓ',
    returnToDefense: 'QUAY LẠI TRẬN ĐẤU',
    active: 'ĐANG BẬT',
    research: 'NGHIÊN CỨU',
    tacticalPause: 'TẠM DỪNG CHIẾN THUẬT',
    resumeDefense: 'TIẾP TỤC CHIẾN ĐẤU',
    music: 'Nhạc nền',
    sfx: 'Âm thanh',
    muted: 'Tắt',
    soundActive: 'Bật',
    restartDefense: 'CHƠI LẠI TỪ ĐẦU',
    howToPlay: 'HƯỚNG DẪN & TÌNH BÁO',
    abandonDefense: 'RỜI TRẬN ĐẤU',
    wastelandIntel: 'TÌNH BÁO VÙNG HOANG TÀN',
    monsterAffixesTitle: 'THUỘC TÍNH ĐẶC BIỆT CỦA QUÁI VẬT:',
    affixArmoredDesc: 'GIÁP DÀY (ARMORED): Giảm 50% sát thương động năng. Dễ bị khắc chế bởi Railgun & Tháp Băng.',
    affixSwiftDesc: 'TỐC BIẾN (SWIFT): Tăng +50% tốc độ di chuyển kèm vệt bóng mờ.',
    affixShieldedDesc: 'LÁ CHẮN (SHIELDED): Hấp thụ toàn bộ sát thương đến khi lá chắn năng lượng bị vỡ.',
    affixRegeneratorDesc: 'HỒI PHỤC (REGENERATOR): Liên tục tự hồi phục +5% Máu mỗi giây.',
    affixSplitterDesc: 'PHÂN TÁCH (SPLITTER): Sinh ra 2 quái vật chạy nhanh khi bị tiêu diệt.',
    affixUnstableDesc: 'BẤT ỔN (UNSTABLE): Phát nổ rực lửa diện rộng khi chết.',
    turretVariantsTitle: 'CÁC NHÁNH CHUYÊN HÓA CỦA THÁP:',
    varAutocannonDesc: 'Pháo Tự Động: Gatling Siêu Tốc (xả đạn bão hòa) vs Railgun Điện Từ (xuyên 100% Giáp).',
    varCryoDesc: 'Tia Băng Giá: Bão Tuyết Nova (chậm diện rộng & đóng băng) vs Đập Vỡ (gây hiệu ứng Dễ Vỡ +40% sát thương).',
    varMineDesc: 'Mìn Đường Bộ: Cụm Napalm (đốt cháy mặt đất kéo dài) vs Xung Điện EMP (làm choáng & xóa bỏ thuộc tính quái).',
    varMortarDesc: 'Súng Cối: Pháo Lửa Địa Ngục (bão lửa cực lớn) vs Pháo Công Kiên (sát thương khổng lồ & đẩy lùi).',
    techLabTitle: 'VIỆN CÔNG NGHỆ:',
    techLabDesc: 'Mở khóa 5 mô-đun toàn diện (Tụ Điện, Đạn Nổ Cao, Ma Trận Nanite, Thu Gom Phế Liệu, AI Chí Mạng) từ thanh công cụ phía trên.',
    returnToCommand: 'QUAY LẠI CHỈ HUY',
    bunkerOverrun: 'HẦM TRÚ THẤT THỦ',
    bunkerOverrunDesc: 'Tuyến phòng thủ đã sụp đổ tại Đợt {wave}. Điểm số cuối cùng: {score}',
    retryDefense: 'THỬ LẠI',
    sectorSecured: 'KHU VỰC ĐÃ ĐƯỢC BẢO VỆ',
    sectorSecuredDesc: 'Đã đẩy lùi toàn bộ 20 Đợt quái vật! Hầm trú của người sống sót đã đứng vững! Điểm số: {score}',
    defendAgain: 'CHƠI LẠI',
    clickToStrike: 'NHẤP ĐỂ OANH KÍCH',
    orbitalBombardment: 'OANH TẠC QUỸ ĐẠO!',
    earlyCallBonus: 'GỌI SỚM! +{bonus} PHẾ LIỆU',
    waveCleared: 'ĐÃ VƯỢT ĐỢT {wave}!',
    notEnoughScrap: 'KHÔNG ĐỦ PHẾ LIỆU!',
    mustPlaceOnRoad: 'PHẢI ĐẶT TRÊN ĐƯỜNG ĐI!',
    cannotBuildHere: 'KHÔNG THỂ XÂY Ở ĐÂY!',
    upgradedTo: 'ĐÃ NÂNG CẤP: {variant} (CẤP {lvl})',
    bunkerDamaged: 'HẦM TRÚ BỊ HẠI -{dmg} HP!',
    bunkerRepair: '+1 SỬA HẦM TRÚ',
    techUnlocked: 'ĐÃ MỞ CÔNG NGHỆ: {name}!',
    knockback: 'ĐẨY LÙI!',
    armorMinus50: 'GIÁP -50%',
    armorBypass: 'XUYÊN GIÁP!',
    shieldMinus: 'KHIÊN -{dmg}',
    shieldCollapsed: 'VỠ LÁ CHẮN!',
    enragedHorde: 'CUỒNG NỘ BẦY ĐÀN!',
    splitSwarm: 'PHÂN TÁCH BẦY!',
    deathDetonation: 'NỔ TỬ VONG!',
    frozen: 'ĐÓNG BĂNG!',
    brittle: 'DỄ VỠ (+40% SÁT THƯƠNG)',
    empStripped: 'VÔ HIỆU HÓA EMP!',
    gatlingBtn: 'GATLING',
    railgunBtn: 'RAILGUN',
    blizzardBtn: 'BÃO TUYẾT',
    shatterBtn: 'ĐẬP VỠ',
    napalmBtn: 'NAPALM',
    empBtn: 'EMP',
    hellfireBtn: 'LỬA ĐỊA NGỤC',
    siegeBtn: 'CÔNG KIÊN',

    // Tech Mods
    modCapacitorsName: 'Tụ Điện Quá Tải',
    modCapacitorsCat: 'QUANG HỌC & BĂNG',
    modCapacitorsDesc: '+25% tầm bắn cho tất cả tháp & hiệu ứng làm chậm Băng kéo dài thêm +50%.',

    modMunitionsName: 'Đạn Nổ Mạnh HE',
    modMunitionsCat: 'KHÍ TÀI ĐỘNG NĂNG',
    modMunitionsDesc: 'Đòn đánh động năng & súng cối tăng +25% bán kính nổ lan & +20% sát thương.',

    modNaniteName: 'Ma Trận Nanite Tự Sửa',
    modNaniteCat: 'KỸ THUẬT CƠ KHÍ',
    modNaniteDesc: 'Hầm trú tự sửa chữa +1 HP mỗi 8 giây + Tất cả tháp bắn nhanh hơn 15%.',

    modScavengerName: 'Mô-đun Thu Gom Phế Liệu',
    modScavengerCat: 'HẬU CẦN',
    modScavengerDesc: '+40% tiền thưởng phế liệu từ tất cả quái vật có thuộc tính & trùm.',

    modCritName: 'AI Nhắm Điểm Yếu Chí Mạng',
    modCritCat: 'ĐIỀU HƯỚNG TÁC CHIẾN',
    modCritDesc: '20% cơ hội đòn đánh của tháp gây 2.5x sát thương Chí Mạng.',
  },
};

// Types & Interfaces
export type TurretType = 'RAPID' | 'CRYO' | 'MINE' | 'MORTAR';
export type TurretVariant =
  | 'NONE'
  | 'GATLING'
  | 'RAILGUN'
  | 'BLIZZARD'
  | 'SHATTER'
  | 'NAPALM'
  | 'EMP'
  | 'HELLFIRE'
  | 'SIEGE';

export type TargetPriority = 'FIRST' | 'STRONGEST' | 'WEAKEST' | 'LAST';
export type EnemyType = 'WALKER' | 'SPRINTER' | 'BEHEMOTH' | 'BOSS';
export type MonsterAffix =
  | 'ARMORED'
  | 'SWIFT'
  | 'SHIELDED'
  | 'REGENERATOR'
  | 'SPLITTER'
  | 'UNSTABLE';

export interface TechMod {
  id: string;
  nameKey: string;
  catKey: string;
  descKey: string;
  cost: number;
  iconName: string;
}

export const TECH_MODS_CATALOG: TechMod[] = [
  {
    id: 'OVERCHARGED_CAPACITORS',
    nameKey: 'modCapacitorsName',
    catKey: 'modCapacitorsCat',
    descKey: 'modCapacitorsDesc',
    cost: 180,
    iconName: 'Zap',
  },
  {
    id: 'HE_MUNITIONS',
    nameKey: 'modMunitionsName',
    catKey: 'modMunitionsCat',
    descKey: 'modMunitionsDesc',
    cost: 220,
    iconName: 'Flame',
  },
  {
    id: 'NANITE_MATRIX',
    nameKey: 'modNaniteName',
    catKey: 'modNaniteCat',
    descKey: 'modNaniteDesc',
    cost: 250,
    iconName: 'Shield',
  },
  {
    id: 'SCRAP_SCAVENGER',
    nameKey: 'modScavengerName',
    catKey: 'modScavengerCat',
    descKey: 'modScavengerDesc',
    cost: 160,
    iconName: 'Radio',
  },
  {
    id: 'CRIT_TARGETING',
    nameKey: 'modCritName',
    catKey: 'modCritCat',
    descKey: 'modCritDesc',
    cost: 200,
    iconName: 'Target',
  },
];

export interface GridCell {
  col: number;
  row: number;
  type: 'ROAD' | 'EMPTY' | 'OBSTACLE' | 'BUNKER';
}

export interface PathPoint {
  x: number;
  y: number;
}

export interface TurretEntity {
  id: string;
  type: TurretType;
  variant: TurretVariant;
  col: number;
  row: number;
  x: number;
  y: number;
  level: number;
  angle: number;
  range: number;
  damage: number;
  fireRate: number;
  cooldownTimer: number;
  targetId: string | null;
  priority: TargetPriority;
  totalInvested: number;
  beamActive?: boolean;
  beamTarget?: {x: number; y: number};
}

export interface EnemyEntity {
  id: string;
  type: EnemyType;
  affix?: MonsterAffix;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  speed: number;
  baseSpeed: number;
  slowTimer: number;
  slowFactor: number;
  freezeTimer: number;
  brittleTimer: number;
  stunTimer: number;
  regenTimer: number;
  coreDamage: number;
  scrapReward: number;
  pathIndex: number;
  distanceTraveled: number;
  animState: SpriteAnimationState;
  isDead: boolean;
  deathTimer: number;
  flashTimer: number;
  bossPhase?: number;
  trailParticlesTimer?: number;
}

export interface ProjectileEntity {
  id: string;
  type: 'BULLET' | 'MORTAR' | 'RAILGUN' | 'GATLING_BULLET';
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  targetEnemyId?: string;
  speed: number;
  damage: number;
  splashRadius: number;
  progress: number;
  arcHeight?: number;
  isCrit?: boolean;
  variant?: TurretVariant;
}

export interface ExplosionEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  duration: number;
  timer: number;
  color?: string;
}

export interface NapalmEntity {
  id: string;
  x: number;
  y: number;
  radius: number;
  dps: number;
  duration: number;
  timer: number;
  isHellfire?: boolean;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  timer: number;
  duration: number;
  isLarge?: boolean;
}

export interface ParticleEntity {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  timer: number;
  duration: number;
}

export interface WaveDefinition {
  waveNumber: number;
  spawnQueue: {type: EnemyType; delay: number; forcedAffix?: MonsterAffix}[];
}

// Fixed Path Waypoints (Cell Centers)
const WAYPOINTS: PathPoint[] = [
  {x: 0 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2},
  {x: 5 * CELL_SIZE + CELL_SIZE / 2, y: 1 * CELL_SIZE + CELL_SIZE / 2},
  {x: 5 * CELL_SIZE + CELL_SIZE / 2, y: 4 * CELL_SIZE + CELL_SIZE / 2},
  {x: 2 * CELL_SIZE + CELL_SIZE / 2, y: 4 * CELL_SIZE + CELL_SIZE / 2},
  {x: 2 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2},
  {x: 9 * CELL_SIZE + CELL_SIZE / 2, y: 7 * CELL_SIZE + CELL_SIZE / 2},
  {x: 9 * CELL_SIZE + CELL_SIZE / 2, y: 3 * CELL_SIZE + CELL_SIZE / 2},
  {x: 13 * CELL_SIZE + CELL_SIZE / 2, y: 3 * CELL_SIZE + CELL_SIZE / 2},
  {x: 13 * CELL_SIZE + CELL_SIZE / 2, y: 6 * CELL_SIZE + CELL_SIZE / 2}, // Bunker hub
];

// Generate Grid Tile Map
function createMapGrid(): GridCell[][] {
  const grid: GridCell[][] = [];
  for (let r = 0; r < ROWS; r++) {
    grid[r] = [];
    for (let c = 0; c < COLS; c++) {
      grid[r][c] = {col: c, row: r, type: 'EMPTY'};
    }
  }

  // Mark Road Segments along waypoints
  const markRoad = (c1: number, r1: number, c2: number, r2: number) => {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (grid[r] && grid[r][c]) {
          grid[r][c].type = 'ROAD';
        }
      }
    }
  };

  markRoad(0, 1, 5, 1);
  markRoad(5, 1, 5, 4);
  markRoad(2, 4, 5, 4);
  markRoad(2, 4, 2, 7);
  markRoad(2, 7, 9, 7);
  markRoad(9, 3, 9, 7);
  markRoad(9, 3, 13, 3);
  markRoad(13, 3, 13, 6);

  // Mark Bunker Command Hub (2x2 structure at (12, 5) - (13, 6))
  if (grid[5] && grid[12]) grid[5][12].type = 'BUNKER';
  if (grid[5] && grid[13]) grid[5][13].type = 'BUNKER';
  if (grid[6] && grid[12]) grid[6][12].type = 'BUNKER';
  if (grid[6] && grid[13]) grid[6][13].type = 'BUNKER';

  // Mark Strategic Obstacles (Industrial Ruin Crates)
  const obstacles = [
    [3, 5],
    [7, 5],
    [6, 2],
    [11, 5],
    [14, 1],
    [0, 8],
    [7, 9],
  ];
  for (const [c, r] of obstacles) {
    if (grid[r] && grid[c] && grid[r][c].type === 'EMPTY') {
      grid[r][c].type = 'OBSTACLE';
    }
  }

  return grid;
}

// Generate 20 Wave Definitions with Affix Modifiers
function generateWaves(totalWaves = 20): WaveDefinition[] {
  const waves: WaveDefinition[] = [];
  const affixes: MonsterAffix[] = [
    'ARMORED',
    'SWIFT',
    'SHIELDED',
    'REGENERATOR',
    'SPLITTER',
    'UNSTABLE',
  ];

  for (let w = 1; w <= totalWaves; w++) {
    const queue: {type: EnemyType; delay: number; forcedAffix?: MonsterAffix}[] = [];

    if (w === 1) {
      for (let i = 0; i < 8; i++) queue.push({type: 'WALKER', delay: 1.2});
    } else if (w === 2) {
      for (let i = 0; i < 10; i++) queue.push({type: 'WALKER', delay: 1.0});
      for (let i = 0; i < 4; i++) queue.push({type: 'SPRINTER', delay: 0.8});
    } else if (w === 3) {
      // Introduce swift & armored modifiers
      queue.push({type: 'WALKER', delay: 1.0, forcedAffix: 'ARMORED'});
      for (let i = 0; i < 7; i++) queue.push({type: 'SPRINTER', delay: 0.7});
      for (let i = 0; i < 7; i++) queue.push({type: 'WALKER', delay: 0.9});
    } else if (w === 4) {
      queue.push({type: 'WALKER', delay: 0.8, forcedAffix: 'SHIELDED'});
      for (let i = 0; i < 12; i++) queue.push({type: 'WALKER', delay: 0.8});
      for (let i = 0; i < 7; i++) queue.push({type: 'SPRINTER', delay: 0.6});
    } else if (w === 5) {
      queue.push({type: 'BEHEMOTH', delay: 2.0, forcedAffix: 'ARMORED'});
      queue.push({type: 'BEHEMOTH', delay: 2.5, forcedAffix: 'REGENERATOR'});
      for (let i = 0; i < 12; i++) queue.push({type: 'WALKER', delay: 0.7});
    } else if (w === 6) {
      queue.push({type: 'SPRINTER', delay: 0.5, forcedAffix: 'SWIFT'});
      queue.push({type: 'WALKER', delay: 0.6, forcedAffix: 'SPLITTER'});
      for (let i = 0; i < 14; i++) queue.push({type: 'SPRINTER', delay: 0.5});
      for (let i = 0; i < 3; i++) queue.push({type: 'BEHEMOTH', delay: 2.0});
    } else if (w === 7) {
      queue.push({type: 'BEHEMOTH', delay: 1.8, forcedAffix: 'UNSTABLE'});
      for (let i = 0; i < 16; i++) queue.push({type: 'WALKER', delay: 0.6});
      for (let i = 0; i < 4; i++) queue.push({type: 'BEHEMOTH', delay: 1.8});
    } else if (w === 8) {
      for (let i = 0; i < 12; i++) queue.push({type: 'SPRINTER', delay: 0.5});
      for (let i = 0; i < 14; i++) queue.push({type: 'WALKER', delay: 0.6});
      for (let i = 0; i < 4; i++) queue.push({type: 'BEHEMOTH', delay: 1.5});
    } else if (w === 9) {
      for (let i = 0; i < 6; i++) queue.push({type: 'BEHEMOTH', delay: 1.5});
      for (let i = 0; i < 16; i++) queue.push({type: 'SPRINTER', delay: 0.45});
    } else if (w === 10) {
      // FIRST BOSS
      queue.push({type: 'BOSS', delay: 3.0, forcedAffix: 'SHIELDED'});
      for (let i = 0; i < 4; i++) queue.push({type: 'BEHEMOTH', delay: 2.0});
      for (let i = 0; i < 12; i++) queue.push({type: 'SPRINTER', delay: 0.6});
    } else if (w <= 14) {
      const walkers = 15 + (w - 10) * 3;
      const sprinters = 12 + (w - 10) * 2;
      const behemoths = 4 + (w - 10);
      for (let i = 0; i < sprinters; i++)
        queue.push({type: 'SPRINTER', delay: 0.4});
      for (let i = 0; i < walkers; i++) queue.push({type: 'WALKER', delay: 0.5});
      for (let i = 0; i < behemoths; i++)
        queue.push({type: 'BEHEMOTH', delay: 1.6});
    } else if (w <= 19) {
      const walkers = 24 + (w - 14) * 3;
      const sprinters = 20 + (w - 14) * 3;
      const behemoths = 6 + (w - 14) * 2;
      for (let i = 0; i < behemoths; i++)
        queue.push({type: 'BEHEMOTH', delay: 1.4});
      for (let i = 0; i < sprinters; i++)
        queue.push({type: 'SPRINTER', delay: 0.35});
      for (let i = 0; i < walkers; i++)
        queue.push({type: 'WALKER', delay: 0.45});
    } else {
      // WAVE 20: FINAL HORDE
      queue.push({type: 'BOSS', delay: 2.0, forcedAffix: 'ARMORED'});
      for (let i = 0; i < 8; i++) queue.push({type: 'BEHEMOTH', delay: 1.5});
      queue.push({type: 'BOSS', delay: 4.0, forcedAffix: 'UNSTABLE'});
      for (let i = 0; i < 25; i++) queue.push({type: 'SPRINTER', delay: 0.3});
      for (let i = 0; i < 30; i++) queue.push({type: 'WALKER', delay: 0.35});
    }

    // Assign random affixes to a percentage of creeps based on wave depth
    if (w >= 3) {
      const affixChance = Math.min(0.55, 0.15 + (w - 3) * 0.03);
      for (const item of queue) {
        if (!item.forcedAffix && Math.random() < affixChance) {
          item.forcedAffix = affixes[Math.floor(Math.random() * affixes.length)];
        }
      }
    }

    waves.push({waveNumber: w, spawnQueue: queue});
  }
  return waves;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stepperRef = useRef<ReturnType<typeof createFixedStepper>>();
  const lastCancelRef = useRef(false);
  const isMobile = useIsMobile();

  // Language selection state (English / Vietnamese)
  const [lang, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('wasteland_td_lang') as Language) || 'vi';
    } catch {
      return 'vi';
    }
  });

  const langRef = useRef<Language>(lang);
  langRef.current = lang;

  const toggleLanguage = () => {
    const nextLang: Language = lang === 'en' ? 'vi' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem('wasteland_td_lang', nextLang);
    } catch {}
    gameAudio.playCrispClick();
  };

  const t = (key: keyof typeof TRANSLATIONS['en'], params?: Record<string, string | number>) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    let text = dict[key] || TRANSLATIONS.en[key] || (key as string);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return text;
  };

  // Playground SDK integration
  const {sdk, isReady} = usePlayground();
  const [exitChat] = useRpc<Record<string, unknown>, void>('ExitChat');

  // Preload Assets
  const {assets, isReady: assetsReady} = useAssets(ASSETS_MANIFEST);

  // Setup Stepper
  if (!stepperRef.current) {
    const stepMs = getConfig('stepMs');
    const maxSubSteps = getConfig('maxSubSteps');
    stepperRef.current = createFixedStepper(stepMs, maxSubSteps);
  }

  // React State for HUD & UI Screens
  const [gameState, setGameState] = useState<GameState>({
    status: 'START',
    score: 0,
    level: 1,
  });
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  // Game speed toggle (1x / 2x)
  const [gameSpeed, setGameSpeed] = useState<1 | 2>(1);
  const gameSpeedRef = useRef<number>(1);
  gameSpeedRef.current = gameSpeed;

  useEffect(() => {
    (window as any).canHandleBackKey = gameState.status !== 'START';
  }, [gameState.status]);

  // Audio mute states
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [isSfxMuted, setIsSfxMuted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isTechLabOpen, setIsTechLabOpen] = useState(false);

  // HUD stats for quick rendering
  const [hudStats, setHudStats] = useState({
    bunkerHp: getConfig('startingBunkerHealth'),
    maxBunkerHp: getConfig('startingBunkerHealth'),
    scrap: getConfig('startingScrap'),
    wave: 1,
    maxWaves: getConfig('totalWaves'),
    waveState: 'PREPARE' as 'PREPARE' | 'ACTIVE' | 'VICTORY',
    waveTimer: 10,
    orbitalReady: true,
    orbitalCooldownRatio: 0,
    activeModsCount: 0,
  });

  // Selected Tool & Selected Placed Turret
  const [selectedTool, setSelectedTool] = useState<TurretType | null>(null);
  const [selectedTurretId, setSelectedTurretId] = useState<string | null>(null);
  const [isOrbitalTargeting, setIsOrbitalTargeting] = useState(false);

  // High score tracking
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('wasteland_td_highscore') || 0);
    } catch {
      return 0;
    }
  });

  // Input Hook
  const inputRef = useInput(canvasRef, true, {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  });

  // Sprite Renderers Ref
  const spriteRenderers = useRef<{
    walker?: SpriteRenderer;
    sprinter?: SpriteRenderer;
    behemoth?: SpriteRenderer;
    boss?: SpriteRenderer;
  }>({});

  useEffect(() => {
    if (!spriteRenderers.current.walker) {
      spriteRenderers.current.walker = new SpriteRenderer({
        WALK: {
          imageUrl: 'zombie_walker_walk',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 12,
          loop: true,
        },
        HURT: {
          imageUrl: 'zombie_walker_hurt',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 14,
          loop: false,
        },
        DEATH: {
          imageUrl: 'zombie_walker_death',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 12,
          loop: false,
        },
      });

      spriteRenderers.current.sprinter = new SpriteRenderer({
        RUN: {
          imageUrl: 'zombie_sprinter_run',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 18,
          loop: true,
        },
        HURT: {
          imageUrl: 'zombie_sprinter_hurt',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 16,
          loop: false,
        },
        DEATH: {
          imageUrl: 'zombie_sprinter_death',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 14,
          loop: false,
        },
      });

      spriteRenderers.current.behemoth = new SpriteRenderer({
        WALK: {
          imageUrl: 'zombie_behemoth_walk',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 8,
          loop: true,
        },
        ATTACK: {
          imageUrl: 'zombie_behemoth_attack',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 14,
          loop: true,
        },
        DEATH: {
          imageUrl: 'zombie_behemoth_death',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 10,
          loop: false,
        },
      });

      spriteRenderers.current.boss = new SpriteRenderer({
        WALK: {
          imageUrl: 'zombie_boss_walk',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 9,
          loop: true,
        },
        ATTACK: {
          imageUrl: 'zombie_boss_attack',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 14,
          loop: true,
        },
        DEATH: {
          imageUrl: 'zombie_boss_death',
          frameWidth: 512,
          frameHeight: 512,
          totalFrames: 16,
          fps: 10,
          loop: false,
        },
      });
    }
  }, []);

  // Mutable Game Simulation State (inside Ref to prevent re-render bottlenecks)
  const sim = useRef<{
    grid: GridCell[][];
    turrets: TurretEntity[];
    enemies: EnemyEntity[];
    projectiles: ProjectileEntity[];
    explosions: ExplosionEntity[];
    napalms: NapalmEntity[];
    texts: FloatingText[];
    particles: ParticleEntity[];
    waves: WaveDefinition[];
    currentWaveIndex: number;
    waveState: 'PREPARE' | 'ACTIVE' | 'VICTORY';
    wavePrepareTimer: number;
    spawnTimer: number;
    bunkerHp: number;
    maxBunkerHp: number;
    scrap: number;
    score: number;
    orbitalCooldown: number;
    maxOrbitalCooldown: number;
    screenShake: number;
    hoverCol: number;
    hoverRow: number;
    dragPointer: {x: number; y: number; active: boolean};
    orbitalReticle: {x: number; y: number; active: boolean};
    unlockedTechMods: string[];
    naniteTimer: number;
  }>({
    grid: createMapGrid(),
    turrets: [],
    enemies: [],
    projectiles: [],
    explosions: [],
    napalms: [],
    texts: [],
    particles: [],
    waves: generateWaves(getConfig('totalWaves')),
    currentWaveIndex: 0,
    waveState: 'PREPARE',
    wavePrepareTimer: 10,
    spawnTimer: 0,
    bunkerHp: getConfig('startingBunkerHealth'),
    maxBunkerHp: getConfig('startingBunkerHealth'),
    scrap: getConfig('startingScrap'),
    score: 0,
    orbitalCooldown: 0,
    maxOrbitalCooldown: getConfig('orbitalStrikeCooldown'),
    screenShake: 0,
    hoverCol: -1,
    hoverRow: -1,
    dragPointer: {x: 0, y: 0, active: false},
    orbitalReticle: {x: 0, y: 0, active: false},
    unlockedTechMods: [],
    naniteTimer: 0,
  });

  // Helper to trigger screen shake
  const addScreenShake = (amount: number) => {
    sim.current.screenShake = Math.min(25, sim.current.screenShake + amount);
  };

  // Helper to spawn floating text
  const addFloatingText = (
    x: number,
    y: number,
    text: string,
    color = '#fbbf24',
    isLarge = false,
  ) => {
    sim.current.texts.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      timer: 0,
      duration: isLarge ? 1.4 : 1.0,
      isLarge,
    });
  };

  // Helper to spawn particle burst
  const addParticleBurst = (
    x: number,
    y: number,
    count = 10,
    color = '#f59e0b',
  ) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 120;
      sim.current.particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 4,
        color,
        timer: 0,
        duration: 0.4 + Math.random() * 0.4,
      });
    }
  };

  // Helper to spawn an explosion
  const triggerExplosion = (
    x: number,
    y: number,
    radius = 90,
    damage = 25,
    customColor?: string,
    knockback = 0,
  ) => {
    gameAudio.playChiptuneExplosion();
    addScreenShake(8);
    sim.current.explosions.push({
      id: Math.random().toString(),
      x,
      y,
      radius: 0,
      maxRadius: radius,
      duration: 0.35,
      timer: 0,
      color: customColor,
    });
    addParticleBurst(x, y, 16, customColor || '#f97316');

    const curLang = langRef.current;
    const knockbackText = TRANSLATIONS[curLang]?.knockback || 'KNOCKBACK!';

    // Splash damage to all active enemies in range
    for (const e of sim.current.enemies) {
      if (e.isDead) continue;
      const dist = Math.hypot(e.x - x, e.y - y);
      if (dist <= radius) {
        applyEnemyDamage(e, damage, 'KINETIC', '#ea580c');
        if (knockback > 0 && e.pathIndex > 0) {
          // Push monster backwards along path
          e.pathIndex = Math.max(0, e.pathIndex - 1);
          const prevWp = WAYPOINTS[e.pathIndex];
          if (prevWp) {
            e.x = prevWp.x;
            e.y = prevWp.y;
            e.distanceTraveled = Math.max(0, e.distanceTraveled - knockback);
          }
          addFloatingText(e.x, e.y - 12, knockbackText, '#f97316');
        }
      }
    }
  };

  // Apply damage to enemy with Armor, Shield, Brittle & Affix interactions
  const applyEnemyDamage = (
    enemy: EnemyEntity,
    rawDmg: number,
    damageType: 'KINETIC' | 'CRYO' | 'ENERGY' | 'PIERCE' = 'KINETIC',
    textColor = '#ef4444',
    isCrit = false,
  ) => {
    if (enemy.isDead) return;

    let dmg = rawDmg;
    const curLang = langRef.current;
    const dict = TRANSLATIONS[curLang] || TRANSLATIONS.en;

    // High-Explosive Munitions Tech Mod: +20% damage
    if (
      sim.current.unlockedTechMods.includes('HE_MUNITIONS') &&
      damageType === 'KINETIC'
    ) {
      dmg *= 1.2;
    }

    // Sub-Zero Brittle debuff (+40% bonus damage)
    if (enemy.brittleTimer > 0) {
      dmg *= 1.4;
      addParticleBurst(enemy.x, enemy.y, 2, '#67e8f9');
    }

    // Monster Affix: ARMORED (-50% kinetic damage unless Piercing railgun/cryo)
    if (enemy.affix === 'ARMORED' && damageType === 'KINETIC') {
      dmg *= 0.5;
      gameAudio.playShieldBlock();
      addFloatingText(enemy.x, enemy.y - 20, dict.armorMinus50, '#94a3b8');
    } else if (enemy.affix === 'ARMORED' && damageType === 'PIERCE') {
      // Railgun bonus vs armor
      dmg *= 1.25;
      addFloatingText(enemy.x, enemy.y - 20, dict.armorBypass, '#06b6d4');
    }

    dmg = Math.max(1, Math.round(dmg));

    // Shield Absorption
    if (enemy.shield > 0) {
      if (enemy.shield >= dmg) {
        enemy.shield -= dmg;
        gameAudio.playShieldBlock();
        const shieldTxt = dict.shieldMinus.replace('{dmg}', String(dmg));
        addFloatingText(enemy.x, enemy.y - 14, shieldTxt, '#38bdf8');
        addParticleBurst(enemy.x, enemy.y, 3, '#06b6d4');
        enemy.flashTimer = 0.12;
        return;
      } else {
        dmg -= enemy.shield;
        enemy.shield = 0;
        addFloatingText(enemy.x, enemy.y - 18, dict.shieldCollapsed, '#38bdf8', true);
        gameAudio.playSwordClash();
        addParticleBurst(enemy.x, enemy.y, 8, '#38bdf8');
      }
    }

    // Direct HP damage
    enemy.hp -= dmg;
    enemy.flashTimer = 0.15;

    if (isCrit) {
      addFloatingText(enemy.x, enemy.y - 22, `CRIT! -${dmg}`, '#fbbf24', true);
      addParticleBurst(enemy.x, enemy.y, 6, '#fbbf24');
      gameAudio.playSwordClash();
    } else {
      addFloatingText(enemy.x, enemy.y - 16, `-${dmg}`, textColor);
    }

    // Boss Phase check
    if (enemy.type === 'BOSS') {
      const hpPct = enemy.hp / enemy.maxHp;
      if (hpPct <= 0.5 && (enemy.bossPhase ?? 0) === 0) {
        enemy.bossPhase = 1;
        addFloatingText(enemy.x, enemy.y - 30, dict.enragedHorde, '#22c55e', true);
        // Spawn 3 mini crawlers
        for (let i = 0; i < 3; i++) {
          spawnMiniWalker(enemy.x + (i - 1) * 20, enemy.y, enemy.pathIndex);
        }
      }
    }

    if (enemy.hp <= 0) {
      enemy.isDead = true;
      enemy.deathTimer = 0;
      enemy.animState = {
        currentAction: 'DEATH',
        currentFrame: 0,
        timer: 0,
      };

      // Handle Affix on Death
      if (enemy.affix === 'SPLITTER') {
        // Spawns 2 mini swarmers
        addFloatingText(enemy.x, enemy.y - 25, dict.splitSwarm, '#c084fc', true);
        spawnMiniWalker(enemy.x - 12, enemy.y, enemy.pathIndex);
        spawnMiniWalker(enemy.x + 12, enemy.y, enemy.pathIndex);
      } else if (enemy.affix === 'UNSTABLE') {
        // Emits shockwave explosion
        addFloatingText(enemy.x, enemy.y - 30, dict.deathDetonation, '#f97316', true);
        triggerExplosion(enemy.x, enemy.y, 110, 35, '#f97316');
      }

      // Scrap calculation with Scavenger Module
      let reward = enemy.scrapReward;
      if (
        sim.current.unlockedTechMods.includes('SCRAP_SCAVENGER') &&
        (enemy.affix || enemy.type === 'BOSS')
      ) {
        reward = Math.round(reward * 1.4);
      }

      sim.current.scrap += reward;
      sim.current.score += reward * 10;
      addFloatingText(enemy.x, enemy.y - 25, `+${reward} ${dict.scrap.toUpperCase()}`, '#fbbf24');
      gameAudio.playCoinPickup();
      addParticleBurst(enemy.x, enemy.y, 8, '#fbbf24');
    }
  };

  const spawnMiniWalker = (x: number, y: number, pathIndex: number) => {
    const mini: EnemyEntity = {
      id: Math.random().toString(),
      type: 'SPRINTER',
      x,
      y,
      hp: 8,
      maxHp: 8,
      shield: 0,
      maxShield: 0,
      speed: 2.0,
      baseSpeed: 2.0,
      slowTimer: 0,
      slowFactor: 1.0,
      freezeTimer: 0,
      brittleTimer: 0,
      stunTimer: 0,
      regenTimer: 0,
      coreDamage: 1,
      scrapReward: 3,
      pathIndex: Math.min(pathIndex, WAYPOINTS.length - 2),
      distanceTraveled: 0,
      animState: {
        currentAction: 'RUN',
        currentFrame: 0,
        timer: 0,
      },
      isDead: false,
      deathTimer: 0,
      flashTimer: 0,
    };
    sim.current.enemies.push(mini);
  };

  // Initialize/Reset Game
  const initGame = useCallback(() => {
    const startingScrap = Number(getConfig('startingScrap'));
    const startingBunkerHp = Number(getConfig('startingBunkerHealth'));
    const totalWaves = Number(getConfig('totalWaves'));

    sim.current = {
      grid: createMapGrid(),
      turrets: [],
      enemies: [],
      projectiles: [],
      explosions: [],
      napalms: [],
      texts: [],
      particles: [],
      waves: generateWaves(totalWaves),
      currentWaveIndex: 0,
      waveState: 'PREPARE',
      wavePrepareTimer: 10,
      spawnTimer: 0,
      bunkerHp: startingBunkerHp,
      maxBunkerHp: startingBunkerHp,
      scrap: startingScrap,
      score: 0,
      orbitalCooldown: 0,
      maxOrbitalCooldown: Number(getConfig('orbitalStrikeCooldown')),
      screenShake: 0,
      hoverCol: -1,
      hoverRow: -1,
      dragPointer: {x: 0, y: 0, active: false},
      orbitalReticle: {x: 0, y: 0, active: false},
      unlockedTechMods: [],
      naniteTimer: 0,
    };

    setSelectedTool(null);
    setSelectedTurretId(null);
    setIsOrbitalTargeting(false);
    setIsMenuOpen(false);
    setIsHowToPlayOpen(false);
    setIsTechLabOpen(false);

    setGameState({
      status: 'PLAYING',
      score: 0,
      level: 1,
    });

    setHudStats({
      bunkerHp: startingBunkerHp,
      maxBunkerHp: startingBunkerHp,
      scrap: startingScrap,
      wave: 1,
      maxWaves: totalWaves,
      waveState: 'PREPARE',
      waveTimer: 10,
      orbitalReady: true,
      orbitalCooldownRatio: 0,
      activeModsCount: 0,
    });

    if (sdk) {
      sdk.startGame();
    }
  }, [sdk]);

  // Early Wave Call
  const callWaveEarly = useCallback(() => {
    if (sim.current.waveState !== 'PREPARE') return;
    const bonus = Number(getConfig('earlyWaveBonus'));
    sim.current.scrap += bonus;
    sim.current.score += bonus * 5;
    sim.current.waveState = 'ACTIVE';
    sim.current.wavePrepareTimer = 0;
    gameAudio.playPowerupChime();
    const curLang = langRef.current;
    const text = (TRANSLATIONS[curLang]?.earlyCallBonus || 'EARLY CALL! +{bonus} SCRAP').replace('{bonus}', String(bonus));
    addFloatingText(CANVAS_WIDTH / 2, 80, text, '#22c55e', true);
  }, []);

  // Trigger Orbital Strike
  const triggerOrbitalStrike = useCallback((targetX: number, targetY: number) => {
    if (sim.current.orbitalCooldown > 0) {
      gameAudio.playErrorBuzz();
      return;
    }
    sim.current.orbitalCooldown = sim.current.maxOrbitalCooldown;
    setIsOrbitalTargeting(false);
    gameAudio.playArcadeLaser();
    addScreenShake(18);

    // Reticle animation and burst
    sim.current.explosions.push({
      id: Math.random().toString(),
      x: targetX,
      y: targetY,
      radius: 0,
      maxRadius: 160,
      duration: 0.5,
      timer: 0,
      color: '#ef4444',
    });

    // Napalm residue
    sim.current.napalms.push({
      id: Math.random().toString(),
      x: targetX,
      y: targetY,
      radius: 120,
      dps: 18,
      duration: 4.5,
      timer: 0,
    });

    // Damage all targets in blast
    const damage = Number(getConfig('orbitalStrikeDamage') || 150);
    for (const e of sim.current.enemies) {
      if (e.isDead) continue;
      const dist = Math.hypot(e.x - targetX, e.y - targetY);
      if (dist <= 160) {
        applyEnemyDamage(e, damage, 'ENERGY', '#ef4444');
      }
    }

    const curLang = langRef.current;
    const text = TRANSLATIONS[curLang]?.orbitalBombardment || 'ORBITAL BOMBARDMENT!';
    addParticleBurst(targetX, targetY, 30, '#ef4444');
    addFloatingText(targetX, targetY - 40, text, '#f87171', true);
  }, []);

  // Purchase Tech Lab Module
  const unlockTechMod = useCallback((modId: string) => {
    const mod = TECH_MODS_CATALOG.find((m) => m.id === modId);
    if (!mod) return;
    if (sim.current.unlockedTechMods.includes(modId)) return;

    if (sim.current.scrap < mod.cost) {
      gameAudio.playErrorBuzz();
      return;
    }

    sim.current.scrap -= mod.cost;
    sim.current.unlockedTechMods.push(modId);
    gameAudio.playPowerupChime();

    const curLang = langRef.current;
    const dict = TRANSLATIONS[curLang] || TRANSLATIONS.en;
    const modName = dict[mod.nameKey as keyof typeof dict] || modId;
    const text = dict.techUnlocked.replace('{name}', String(modName).toUpperCase());
    addFloatingText(CANVAS_WIDTH / 2, 90, text, '#38bdf8', true);
  }, []);

  // Purchase/Place Turret
  const tryPlaceTurret = useCallback(
    (type: TurretType, col: number, row: number) => {
      if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
      const cell = sim.current.grid[row]?.[col];
      if (!cell) return;

      const curLang = langRef.current;
      const dict = TRANSLATIONS[curLang] || TRANSLATIONS.en;

      let cost = 100;
      if (type === 'RAPID') cost = Number(getConfig('rapidTurretCost'));
      else if (type === 'CRYO') cost = Number(getConfig('cryoTurretCost'));
      else if (type === 'MINE') cost = Number(getConfig('mineCost'));
      else if (type === 'MORTAR') cost = Number(getConfig('mortarTurretCost'));

      if (sim.current.scrap < cost) {
        gameAudio.playErrorBuzz();
        addFloatingText(
          col * CELL_SIZE + CELL_SIZE / 2,
          row * CELL_SIZE + CELL_SIZE / 2,
          dict.notEnoughScrap,
          '#ef4444',
        );
        return;
      }

      // Placement Rules:
      // Landmine can ONLY be placed on ROAD tiles without an existing mine.
      // Other Turrets can ONLY be placed on EMPTY wasteland tiles without an existing turret.
      if (type === 'MINE') {
        if (cell.type !== 'ROAD') {
          gameAudio.playErrorBuzz();
          addFloatingText(
            col * CELL_SIZE + CELL_SIZE / 2,
            row * CELL_SIZE + CELL_SIZE / 2,
            dict.mustPlaceOnRoad,
            '#ef4444',
          );
          return;
        }
        const existingMine = sim.current.turrets.find(
          (t) => t.type === 'MINE' && t.col === col && t.row === row,
        );
        if (existingMine) {
          gameAudio.playErrorBuzz();
          return;
        }
      } else {
        if (cell.type !== 'EMPTY') {
          gameAudio.playErrorBuzz();
          addFloatingText(
            col * CELL_SIZE + CELL_SIZE / 2,
            row * CELL_SIZE + CELL_SIZE / 2,
            dict.cannotBuildHere,
            '#ef4444',
          );
          return;
        }
        const existingTurret = sim.current.turrets.find(
          (t) => t.col === col && t.row === row,
        );
        if (existingTurret) {
          gameAudio.playErrorBuzz();
          return;
        }
      }

      // Deduct scrap
      sim.current.scrap -= cost;
      gameAudio.playConfirmSelect();

      // Configure Base Stats
      let range = 160;
      let damage = 2;
      let fireRate = 0.22;
      if (type === 'CRYO') {
        range = 145;
        damage = 1;
        fireRate = 0.15;
      } else if (type === 'MINE') {
        range = 35; // trigger distance
        damage = 25;
        fireRate = 0;
      } else if (type === 'MORTAR') {
        range = 280;
        damage = 18;
        fireRate = 2.7;
      }

      const newTurret: TurretEntity = {
        id: Math.random().toString(),
        type,
        variant: 'NONE',
        col,
        row,
        x: col * CELL_SIZE + CELL_SIZE / 2,
        y: row * CELL_SIZE + CELL_SIZE / 2,
        level: 1,
        angle: 0,
        range,
        damage,
        fireRate,
        cooldownTimer: 0,
        targetId: null,
        priority: 'FIRST',
        totalInvested: cost,
      };

      sim.current.turrets.push(newTurret);
      addParticleBurst(newTurret.x, newTurret.y, 10, '#10b981');
      addFloatingText(newTurret.x, newTurret.y - 18, `-${cost} ${dict.scrap.toUpperCase()}`, '#f59e0b');
    },
    [],
  );

  // Upgrade Selected Turret with Specialized Variant Choice
  const upgradeTurretVariant = useCallback(
    (variantChoice: TurretVariant) => {
      if (!selectedTurretId) return;
      const turret = sim.current.turrets.find((t) => t.id === selectedTurretId);
      if (!turret || turret.level >= 3) {
        gameAudio.playErrorBuzz();
        return;
      }

      const curLang = langRef.current;
      const dict = TRANSLATIONS[curLang] || TRANSLATIONS.en;

      // Calculate upgrade cost
      const upgradeCost = Math.floor(turret.totalInvested * 0.85);
      if (sim.current.scrap < upgradeCost) {
        gameAudio.playErrorBuzz();
        addFloatingText(turret.x, turret.y - 20, dict.notEnoughScrap, '#ef4444');
        return;
      }

      sim.current.scrap -= upgradeCost;
      turret.totalInvested += upgradeCost;
      turret.level += 1;
      turret.variant = variantChoice;

      // Apply Variant Stat Adjustments
      if (turret.type === 'RAPID') {
        if (variantChoice === 'GATLING') {
          turret.fireRate = turret.level === 2 ? 0.08 : 0.05;
          turret.damage = turret.level === 2 ? 2 : 3;
          turret.range = 175;
        } else if (variantChoice === 'RAILGUN') {
          turret.fireRate = turret.level === 2 ? 0.65 : 0.45;
          turret.damage = turret.level === 2 ? 14 : 24;
          turret.range = 240;
        }
      } else if (turret.type === 'CRYO') {
        if (variantChoice === 'BLIZZARD') {
          turret.range = 170;
          turret.damage = turret.level === 2 ? 2 : 3;
        } else if (variantChoice === 'SHATTER') {
          turret.range = 160;
          turret.damage = turret.level === 2 ? 2 : 3;
        }
      } else if (turret.type === 'MINE') {
        if (variantChoice === 'NAPALM') {
          turret.damage = 35;
        } else if (variantChoice === 'EMP') {
          turret.damage = 15;
          turret.range = 50;
        }
      } else if (turret.type === 'MORTAR') {
        if (variantChoice === 'HELLFIRE') {
          turret.damage = turret.level === 2 ? 24 : 36;
          turret.range = 300;
          turret.fireRate = 2.4;
        } else if (variantChoice === 'SIEGE') {
          turret.damage = turret.level === 2 ? 45 : 75;
          turret.range = 320;
          turret.fireRate = 2.9;
        }
      }

      gameAudio.playLevelUpStinger();
      addParticleBurst(turret.x, turret.y, 20, '#38bdf8');
      const upgradeMsg = dict.upgradedTo
        .replace('{variant}', variantChoice)
        .replace('{lvl}', String(turret.level));
      addFloatingText(turret.x, turret.y - 26, upgradeMsg, '#38bdf8', true);
    },
    [selectedTurretId],
  );

  // Sell/Scrap Selected Turret
  const sellSelectedTurret = useCallback(() => {
    if (!selectedTurretId) return;
    const index = sim.current.turrets.findIndex((t) => t.id === selectedTurretId);
    if (index === -1) return;

    const turret = sim.current.turrets[index];
    const refund = Math.floor(turret.totalInvested * 0.7);
    sim.current.scrap += refund;
    sim.current.turrets.splice(index, 1);
    setSelectedTurretId(null);

    const curLang = langRef.current;
    const dict = TRANSLATIONS[curLang] || TRANSLATIONS.en;

    gameAudio.playCoinPickup();
    addParticleBurst(turret.x, turret.y, 12, '#fbbf24');
    addFloatingText(turret.x, turret.y - 20, `+${refund} ${dict.scrap.toUpperCase()} (${dict.sell})`, '#fbbf24');
  }, [selectedTurretId]);

  // Update & Simulation Loop
  const update = (deltaTime: number) => {
    if (gameStateRef.current.status !== 'PLAYING') return;

    const dt = Math.min(0.1, deltaTime);
    const s = sim.current;
    const curLang = langRef.current;
    const dict = TRANSLATIONS[curLang] || TRANSLATIONS.en;

    // Decay screen shake
    if (s.screenShake > 0) {
      s.screenShake = Math.max(0, s.screenShake - dt * 25);
    }

    // Update Orbital Cooldown
    if (s.orbitalCooldown > 0) {
      s.orbitalCooldown = Math.max(0, s.orbitalCooldown - dt);
    }

    // Nanite Matrix Tech Mod: Bunker slow auto-repair
    if (s.unlockedTechMods.includes('NANITE_MATRIX')) {
      s.naniteTimer += dt;
      if (s.naniteTimer >= 8.0) {
        s.naniteTimer = 0;
        if (s.bunkerHp < s.maxBunkerHp) {
          s.bunkerHp = Math.min(s.maxBunkerHp, s.bunkerHp + 1);
          addFloatingText(12 * CELL_SIZE + CELL_SIZE, 5 * CELL_SIZE, dict.bunkerRepair, '#10b981');
          addParticleBurst(12 * CELL_SIZE + CELL_SIZE, 5 * CELL_SIZE, 8, '#10b981');
        }
      }
    }

    // Wave Management
    if (s.waveState === 'PREPARE') {
      s.wavePrepareTimer -= dt;
      if (s.wavePrepareTimer <= 0) {
        s.waveState = 'ACTIVE';
        s.spawnTimer = 0;
      }
    } else if (s.waveState === 'ACTIVE') {
      const currentWave = s.waves[s.currentWaveIndex];
      if (currentWave) {
        s.spawnTimer += dt;
        if (currentWave.spawnQueue.length > 0) {
          const nextSpawn = currentWave.spawnQueue[0];
          if (s.spawnTimer >= nextSpawn.delay) {
            s.spawnTimer = 0;
            const enemyToSpawn = currentWave.spawnQueue.shift()!;

            let hp = 15;
            let speed = 1.0;
            let coreDmg = 1;
            let scrap = 5;
            let action = 'WALK';
            let shield = 0;

            if (enemyToSpawn.type === 'SPRINTER') {
              hp = 8;
              speed = 2.2;
              scrap = 4;
              action = 'RUN';
            } else if (enemyToSpawn.type === 'BEHEMOTH') {
              hp = 120;
              speed = 0.36;
              coreDmg = 3;
              scrap = 30;
              action = 'WALK';
            } else if (enemyToSpawn.type === 'BOSS') {
              hp = 750;
              speed = 0.25;
              coreDmg = 10;
              scrap = 120;
              action = 'WALK';
            }

            // Wave scaling factor
            const waveScale = 1 + s.currentWaveIndex * 0.12;
            hp = Math.round(hp * waveScale);

            // Apply monster affix bonuses at spawn
            const affix = enemyToSpawn.forcedAffix;
            if (affix === 'SWIFT') {
              speed *= 1.5;
            } else if (affix === 'SHIELDED') {
              shield = Math.round(hp * 0.5);
            }

            s.enemies.push({
              id: Math.random().toString(),
              type: enemyToSpawn.type,
              affix,
              x: WAYPOINTS[0].x,
              y: WAYPOINTS[0].y,
              hp,
              maxHp: hp,
              shield,
              maxShield: shield,
              speed,
              baseSpeed: speed,
              slowTimer: 0,
              slowFactor: 1.0,
              freezeTimer: 0,
              brittleTimer: 0,
              stunTimer: 0,
              regenTimer: 0,
              coreDamage: coreDmg,
              scrapReward: scrap,
              pathIndex: 0,
              distanceTraveled: 0,
              animState: {
                currentAction: action,
                currentFrame: 0,
                timer: 0,
              },
              isDead: false,
              deathTimer: 0,
              flashTimer: 0,
              trailParticlesTimer: 0,
            });
          }
        } else if (s.enemies.length === 0) {
          // Wave Cleared!
          s.score += (s.currentWaveIndex + 1) * 200;
          if (s.currentWaveIndex + 1 >= s.waves.length) {
            // Victory
            s.waveState = 'VICTORY';
            setGameState((prev) => ({
              ...prev,
              status: 'VICTORY',
              score: s.score,
            }));
            gameAudio.playVictoryFanfare();
          } else {
            s.currentWaveIndex += 1;
            s.waveState = 'PREPARE';
            s.wavePrepareTimer = 10;
            gameAudio.playPowerupChime();
            const clearedTxt = dict.waveCleared.replace('{wave}', String(s.currentWaveIndex));
            addFloatingText(
              CANVAS_WIDTH / 2,
              CANVAS_HEIGHT / 2,
              clearedTxt,
              '#10b981',
              true,
            );
          }
        }
      }
    }

    // Update Enemies along path
    for (let i = s.enemies.length - 1; i >= 0; i--) {
      const e = s.enemies[i];

      // Flash timer decay
      if (e.flashTimer > 0) e.flashTimer -= dt;

      // Status Timers
      if (e.freezeTimer > 0) e.freezeTimer -= dt;
      if (e.brittleTimer > 0) e.brittleTimer -= dt;
      if (e.stunTimer > 0) e.stunTimer -= dt;

      // Slow timer decay
      if (e.slowTimer > 0) {
        e.slowTimer -= dt;
        if (e.slowTimer <= 0) {
          e.slowFactor = 1.0;
        }
      }

      // Monster Affix: REGENERATOR
      if (!e.isDead && e.affix === 'REGENERATOR' && e.hp < e.maxHp) {
        e.regenTimer += dt;
        if (e.regenTimer >= 1.0) {
          e.regenTimer = 0;
          const healAmount = Math.max(1, Math.round(e.maxHp * 0.05));
          e.hp = Math.min(e.maxHp, e.hp + healAmount);
          addFloatingText(e.x, e.y - 14, `+${healAmount} HP`, '#22c55e');
          addParticleBurst(e.x, e.y, 2, '#22c55e');
        }
      }

      // Handle Death Animation
      if (e.isDead) {
        e.deathTimer += dt;
        const renderer =
          e.type === 'WALKER'
            ? spriteRenderers.current.walker
            : e.type === 'SPRINTER'
            ? spriteRenderers.current.sprinter
            : e.type === 'BEHEMOTH'
            ? spriteRenderers.current.behemoth
            : spriteRenderers.current.boss;

        if (renderer) {
          e.animState = renderer.getNextState(e.animState, dt);
        }

        if (e.deathTimer > 0.8) {
          s.enemies.splice(i, 1);
        }
        continue;
      }

      // Movement Check (Stun & Freeze halt movement)
      if (e.stunTimer > 0 || e.freezeTimer > 0) {
        continue;
      }

      const currentSpeed = e.baseSpeed * e.slowFactor * 60 * dt;
      const targetWp = WAYPOINTS[e.pathIndex + 1];

      if (targetWp) {
        const dx = targetWp.x - e.x;
        const dy = targetWp.y - e.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= currentSpeed) {
          e.x = targetWp.x;
          e.y = targetWp.y;
          e.pathIndex += 1;
          e.distanceTraveled += dist;

          // Check if reached Bunker Hub
          if (e.pathIndex >= WAYPOINTS.length - 1) {
            s.bunkerHp = Math.max(0, s.bunkerHp - e.coreDamage);
            addScreenShake(12);
            gameAudio.playShieldBlock();
            const dmgText = dict.bunkerDamaged.replace('{dmg}', String(e.coreDamage));
            addFloatingText(
              targetWp.x,
              targetWp.y - 30,
              dmgText,
              '#ef4444',
              true,
            );
            s.enemies.splice(i, 1);

            if (s.bunkerHp <= 0) {
              setGameState((prev) => ({
                ...prev,
                status: 'GAME_OVER',
                score: s.score,
              }));
              gameAudio.playDefeatMotif();
            }
            continue;
          }
        } else {
          e.x += (dx / dist) * currentSpeed;
          e.y += (dy / dist) * currentSpeed;
          e.distanceTraveled += currentSpeed;
        }
      }

      // Animate walking
      const renderer =
        e.type === 'WALKER'
          ? spriteRenderers.current.walker
          : e.type === 'SPRINTER'
          ? spriteRenderers.current.sprinter
          : e.type === 'BEHEMOTH'
          ? spriteRenderers.current.behemoth
          : spriteRenderers.current.boss;

      if (renderer) {
        e.animState = renderer.getNextState(e.animState, dt);
      }
    }

    // Update Napalms
    for (let i = s.napalms.length - 1; i >= 0; i--) {
      const n = s.napalms[i];
      n.timer += dt;
      // Napalm ticking damage
      for (const e of s.enemies) {
        if (e.isDead) continue;
        if (Math.hypot(e.x - n.x, e.y - n.y) <= n.radius) {
          applyEnemyDamage(e, n.dps * dt, 'ENERGY', '#f97316');
        }
      }
      if (n.timer >= n.duration) {
        s.napalms.splice(i, 1);
      }
    }

    // Update Turrets & Firing Logic
    const hasCapacitors = s.unlockedTechMods.includes('OVERCHARGED_CAPACITORS');
    const hasNanite = s.unlockedTechMods.includes('NANITE_MATRIX');
    const hasCritAI = s.unlockedTechMods.includes('CRIT_TARGETING');

    for (const t of s.turrets) {
      if (t.type === 'MINE') {
        // Mine proximity trigger
        for (const e of s.enemies) {
          if (e.isDead) continue;
          if (Math.hypot(e.x - t.x, e.y - t.y) <= t.range) {
            if (t.variant === 'EMP') {
              // EMP Blast: Stuns & strips shields/affixes
              gameAudio.playArcadeLaser();
              addScreenShake(10);
              s.explosions.push({
                id: Math.random().toString(),
                x: t.x,
                y: t.y,
                radius: 0,
                maxRadius: 130,
                duration: 0.4,
                timer: 0,
                color: '#06b6d4',
              });
              addParticleBurst(t.x, t.y, 25, '#06b6d4');
              for (const victim of s.enemies) {
                if (victim.isDead) continue;
                if (Math.hypot(victim.x - t.x, victim.y - t.y) <= 130) {
                  victim.stunTimer = 2.0;
                  victim.shield = 0;
                  victim.affix = undefined; // Strip affix!
                  applyEnemyDamage(victim, 15, 'ENERGY', '#06b6d4');
                  addFloatingText(victim.x, victim.y - 18, dict.empStripped, '#06b6d4');
                }
              }
            } else if (t.variant === 'NAPALM') {
              // Cluster Napalm: Leaves 6s burning ground fire
              triggerExplosion(t.x, t.y, 110, t.damage, '#f97316');
              s.napalms.push({
                id: Math.random().toString(),
                x: t.x,
                y: t.y,
                radius: 110,
                dps: 12,
                duration: 6.0,
                timer: 0,
              });
            } else {
              // Standard Mine
              triggerExplosion(t.x, t.y, 90, t.damage);
            }

            const mineIndex = s.turrets.indexOf(t);
            if (mineIndex !== -1) s.turrets.splice(mineIndex, 1);
            break;
          }
        }
        continue;
      }

      // Cooldown timer
      if (t.cooldownTimer > 0) t.cooldownTimer -= dt;

      // Effective range with Capacitors
      const effectiveRange = hasCapacitors ? t.range * 1.25 : t.range;
      const effectiveFireRate = hasNanite ? t.fireRate * 0.85 : t.fireRate;

      // Find valid enemies in range
      const inRangeEnemies = s.enemies.filter(
        (e) => !e.isDead && Math.hypot(e.x - t.x, e.y - t.y) <= effectiveRange,
      );

      let target: EnemyEntity | null = null;
      if (inRangeEnemies.length > 0) {
        if (t.priority === 'FIRST') {
          inRangeEnemies.sort((a, b) => b.distanceTraveled - a.distanceTraveled);
        } else if (t.priority === 'STRONGEST') {
          inRangeEnemies.sort((a, b) => b.hp - a.hp);
        } else if (t.priority === 'WEAKEST') {
          inRangeEnemies.sort((a, b) => a.hp - b.hp);
        } else if (t.priority === 'LAST') {
          inRangeEnemies.sort((a, b) => a.distanceTraveled - b.distanceTraveled);
        }
        target = inRangeEnemies[0];
      }

      t.targetId = target ? target.id : null;

      if (target) {
        // Rotate turret towards target
        const targetAngle = Math.atan2(target.y - t.y, target.x - t.x);
        t.angle = targetAngle;

        const isCrit = hasCritAI && Math.random() < 0.2;
        const critMult = isCrit ? 2.5 : 1.0;

        // Calculate exact muzzle origin along turret rotation angle
        const barrelLength =
          t.type === 'MORTAR'
            ? 24
            : t.type === 'RAPID'
            ? t.variant === 'RAILGUN'
              ? 28
              : 25
            : 22;
        const muzzleX = t.x + Math.cos(t.angle) * barrelLength;
        const muzzleY = t.y + Math.sin(t.angle) * barrelLength;

        // Firing actions
        if (t.type === 'RAPID') {
          if (t.cooldownTimer <= 0) {
            t.cooldownTimer = effectiveFireRate;

            if (t.variant === 'RAILGUN') {
              // Hyper-Velocity Railgun
              gameAudio.playArcadeLaser();
              addScreenShake(3);
              s.projectiles.push({
                id: Math.random().toString(),
                type: 'RAILGUN',
                x: muzzleX,
                y: muzzleY,
                startX: muzzleX,
                startY: muzzleY,
                targetX: target.x,
                targetY: target.y,
                targetEnemyId: target.id,
                speed: 1800,
                damage: Math.round(t.damage * critMult),
                splashRadius: 0,
                progress: 0,
                isCrit,
                variant: 'RAILGUN',
              });
              addParticleBurst(muzzleX, muzzleY, 5, '#06b6d4');
            } else if (t.variant === 'GATLING') {
              // Gatling Overclock Rapid Barrage
              gameAudio.playGunshotBlast();
              s.projectiles.push({
                id: Math.random().toString(),
                type: 'GATLING_BULLET',
                x: muzzleX,
                y: muzzleY,
                startX: muzzleX,
                startY: muzzleY,
                targetX: target.x + (Math.random() - 0.5) * 12,
                targetY: target.y + (Math.random() - 0.5) * 12,
                targetEnemyId: target.id,
                speed: 1200,
                damage: Math.round(t.damage * critMult),
                splashRadius: 0,
                progress: 0,
                isCrit,
                variant: 'GATLING',
              });
              addParticleBurst(muzzleX, muzzleY, 3, '#f59e0b');
            } else {
              // Standard Autocannon
              gameAudio.playGunshotBlast();
              s.projectiles.push({
                id: Math.random().toString(),
                type: 'BULLET',
                x: muzzleX,
                y: muzzleY,
                startX: muzzleX,
                startY: muzzleY,
                targetX: target.x,
                targetY: target.y,
                targetEnemyId: target.id,
                speed: 950,
                damage: Math.round(t.damage * critMult),
                splashRadius: 0,
                progress: 0,
                isCrit,
              });
              addParticleBurst(muzzleX, muzzleY, 3, '#fde047');
            }
          }
        } else if (t.type === 'CRYO') {
          t.beamActive = true;
          t.beamTarget = {x: target.x, y: target.y};
          if (t.cooldownTimer <= 0) {
            t.cooldownTimer = effectiveFireRate;
            const slowDur = hasCapacitors ? 1.8 : 1.2;

            if (t.variant === 'BLIZZARD') {
              // Blizzard Nova: Slows area around target & short freeze chance
              for (const creep of s.enemies) {
                if (creep.isDead) continue;
                if (Math.hypot(creep.x - target.x, creep.y - target.y) <= 110) {
                  creep.slowTimer = slowDur;
                  creep.slowFactor = 0.68;
                  if (Math.random() < 0.2) {
                    creep.freezeTimer = 0.5;
                    addFloatingText(creep.x, creep.y - 16, dict.frozen, '#38bdf8');
                  }
                  applyEnemyDamage(creep, Math.round(t.damage * critMult), 'CRYO', '#38bdf8', isCrit);
                }
              }
              addParticleBurst(target.x, target.y, 8, '#38bdf8');
            } else if (t.variant === 'SHATTER') {
              // Sub-Zero Shatter: Applies Brittle with moderate slow
              target.slowTimer = slowDur;
              target.slowFactor = 0.70;
              target.brittleTimer = 2.5;
              applyEnemyDamage(target, Math.round(t.damage * critMult), 'CRYO', '#38bdf8', isCrit);
              addFloatingText(target.x, target.y - 20, dict.brittle, '#06b6d4');
              addParticleBurst(target.x, target.y, 4, '#06b6d4');
            } else {
              // Standard Cryo Beam
              target.slowTimer = slowDur;
              target.slowFactor = t.level === 1 ? 0.70 : t.level === 2 ? 0.66 : 0.62;
              applyEnemyDamage(target, Math.round(t.damage * critMult), 'CRYO', '#38bdf8', isCrit);
              addParticleBurst(target.x, target.y, 2, '#38bdf8');
            }
          }
        } else if (t.type === 'MORTAR') {
          if (t.cooldownTimer <= 0) {
            t.cooldownTimer = effectiveFireRate;
            gameAudio.playGunshotBlast();

            const leadX = target.x;
            const leadY = target.y;
            let splash = t.level === 1 ? 105 : t.level === 2 ? 125 : 145;
            if (t.variant === 'HELLFIRE') splash = 160;
            if (s.unlockedTechMods.includes('HE_MUNITIONS')) splash *= 1.25;

            s.projectiles.push({
              id: Math.random().toString(),
              type: 'MORTAR',
              x: muzzleX,
              y: muzzleY,
              startX: muzzleX,
              startY: muzzleY,
              targetX: leadX,
              targetY: leadY,
              speed: 280,
              damage: Math.round(t.damage * critMult),
              splashRadius: splash,
              progress: 0,
              arcHeight: 65,
              isCrit,
              variant: t.variant,
            });
            addParticleBurst(muzzleX, muzzleY, 6, '#f97316');
          }
        }
      } else {
        t.beamActive = false;
        t.beamTarget = undefined;
      }
    }

    // Update Projectiles
    for (let i = s.projectiles.length - 1; i >= 0; i--) {
      const p = s.projectiles[i];

      if (p.type === 'BULLET' || p.type === 'GATLING_BULLET' || p.type === 'RAILGUN') {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.hypot(dx, dy);
        const step = p.speed * dt;

        if (dist <= step) {
          // Hit Target
          if (p.targetEnemyId) {
            const hitEnemy = s.enemies.find((e) => e.id === p.targetEnemyId && !e.isDead);
            if (hitEnemy) {
              const dmgType = p.variant === 'RAILGUN' ? 'PIERCE' : 'KINETIC';
              applyEnemyDamage(
                hitEnemy,
                p.damage,
                dmgType,
                p.variant === 'RAILGUN' ? '#06b6d4' : '#fde047',
                p.isCrit,
              );
              addParticleBurst(
                p.targetX,
                p.targetY,
                p.variant === 'RAILGUN' ? 6 : 4,
                p.variant === 'RAILGUN' ? '#06b6d4' : '#fbbf24',
              );
            }
          }
          s.projectiles.splice(i, 1);
        } else {
          p.x += (dx / dist) * step;
          p.y += (dy / dist) * step;
        }
      } else if (p.type === 'MORTAR') {
        const totalDist = Math.hypot(p.targetX - p.startX, p.targetY - p.startY);
        p.progress += (p.speed * dt) / Math.max(1, totalDist);

        if (p.progress >= 1.0) {
          // Impact!
          const isSiege = p.variant === 'SIEGE';
          const isHellfire = p.variant === 'HELLFIRE';
          const knockback = isSiege ? 45 : 0;

          triggerExplosion(
            p.targetX,
            p.targetY,
            p.splashRadius,
            p.damage,
            isHellfire ? '#dc2626' : undefined,
            knockback,
          );

          // Hellfire or standard Lingering fire patch
          s.napalms.push({
            id: Math.random().toString(),
            x: p.targetX,
            y: p.targetY,
            radius: p.splashRadius * 0.75,
            dps: isHellfire ? 15 : 4,
            duration: isHellfire ? 5.0 : 2.5,
            timer: 0,
            isHellfire,
          });
          s.projectiles.splice(i, 1);
        } else {
          p.x = p.startX + (p.targetX - p.startX) * p.progress;
          const baseY = p.startY + (p.targetY - p.startY) * p.progress;
          const arc = Math.sin(p.progress * Math.PI) * (p.arcHeight || 65);
          p.y = baseY - arc;
        }
      }
    }

    // Update Explosions
    for (let i = s.explosions.length - 1; i >= 0; i--) {
      const exp = s.explosions[i];
      exp.timer += dt;
      exp.radius = (exp.timer / exp.duration) * exp.maxRadius;
      if (exp.timer >= exp.duration) {
        s.explosions.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = s.texts.length - 1; i >= 0; i--) {
      const txt = s.texts[i];
      txt.timer += dt;
      txt.y -= (txt.isLarge ? 32 : 24) * dt;
      if (txt.timer >= txt.duration) {
        s.texts.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = s.particles.length - 1; i >= 0; i--) {
      const part = s.particles[i];
      part.timer += dt;
      part.x += part.vx * dt;
      part.y += part.vy * dt;
      if (part.timer >= part.duration) {
        s.particles.splice(i, 1);
      }
    }

    // Update HUD Stats in React
    setHudStats({
      bunkerHp: s.bunkerHp,
      maxBunkerHp: s.maxBunkerHp,
      scrap: s.scrap,
      wave: s.currentWaveIndex + 1,
      maxWaves: s.waves.length,
      waveState: s.waveState,
      waveTimer: Math.ceil(s.wavePrepareTimer),
      orbitalReady: s.orbitalCooldown <= 0,
      orbitalCooldownRatio: s.orbitalCooldown / s.maxOrbitalCooldown,
      activeModsCount: s.unlockedTechMods.length,
    });

    if (s.score > highScore) {
      setHighScore(s.score);
      try {
        localStorage.setItem('wasteland_td_highscore', s.score.toString());
      } catch {}
    }
  };

  // Canvas Drawing
  const draw = (ctx: CanvasRenderingContext2D) => {
    prepareCanvas(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);

    const s = sim.current;
    const curLang = langRef.current;
    const dict = TRANSLATIONS[curLang] || TRANSLATIONS.en;

    // Apply Screen Shake
    ctx.save();
    if (s.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * s.screenShake;
      const shakeY = (Math.random() - 0.5) * s.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Base Wasteland Floor
    const groundImg = assets['bg_wasteland_ground'];
    if (groundImg && groundImg.complete && groundImg.naturalWidth > 0) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          ctx.drawImage(groundImg, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    } else {
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // 2. Draw Road Asphalt Tiles
    const roadImg = assets['road_asphalt_tile'];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (s.grid[r][c].type === 'ROAD') {
          if (roadImg && roadImg.complete && roadImg.naturalWidth > 0) {
            ctx.drawImage(roadImg, c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          } else {
            ctx.fillStyle = '#292524';
            ctx.fillRect(c * CELL_SIZE, r * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        }
      }
    }

    // 3. Draw Grid Lines Subtly
    ctx.strokeStyle = 'rgba(120, 113, 108, 0.15)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_SIZE, 0);
      ctx.lineTo(c * CELL_SIZE, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_SIZE);
      ctx.lineTo(CANVAS_WIDTH, r * CELL_SIZE);
      ctx.stroke();
    }

    // 4. Draw Static Obstacle Ruin Crates
    const crateImg = assets['obstacle_ruin_crate'];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (s.grid[r][c].type === 'OBSTACLE') {
          if (crateImg && crateImg.complete && crateImg.naturalWidth > 0) {
            ctx.drawImage(crateImg, c * CELL_SIZE + 2, r * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
          } else {
            ctx.fillStyle = '#78350f';
            ctx.fillRect(c * CELL_SIZE + 4, r * CELL_SIZE + 4, CELL_SIZE - 8, CELL_SIZE - 8);
          }
        }
      }
    }

    // 5. Draw Fortified Survivor Bunker Command Hub (2x2 tiles at (12,5) - (13,6))
    const bunkerImg = assets['bunker_command_hub'];
    const bunkerX = 12 * CELL_SIZE;
    const bunkerY = 5 * CELL_SIZE;
    const bunkerW = CELL_SIZE * 2;
    const bunkerH = CELL_SIZE * 2;
    if (bunkerImg && bunkerImg.complete && bunkerImg.naturalWidth > 0) {
      ctx.drawImage(bunkerImg, bunkerX, bunkerY, bunkerW, bunkerH);
    } else {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(bunkerX, bunkerY, bunkerW, bunkerH);
    }

    // 6. Draw Napalm Fire Patches
    for (const n of s.napalms) {
      const alpha = Math.max(0, 1 - n.timer / n.duration);
      ctx.save();
      const fireColor = n.isHellfire ? '220, 38, 38' : '234, 88, 12';
      ctx.fillStyle = `rgba(${fireColor}, ${alpha * 0.45})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fill();

      // Flickering inner fire
      ctx.fillStyle = `rgba(251, 191, 36, ${alpha * 0.65})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius * 0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Draw Landmines
    const mineImg = assets['trap_landmine'];
    for (const t of s.turrets) {
      if (t.type === 'MINE') {
        if (mineImg && mineImg.complete && mineImg.naturalWidth > 0) {
          ctx.drawImage(mineImg, t.x - 22, t.y - 18, 44, 36);
        } else {
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(t.x, t.y, 16, 0, Math.PI * 2);
          ctx.fill();
        }

        // Variant indicator ring
        if (t.variant === 'EMP') {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
          ctx.stroke();
        } else if (t.variant === 'NAPALM') {
          ctx.strokeStyle = '#f97316';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.x, t.y, 18, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Blinking trigger diode
        const blink = Math.floor(Date.now() / 250) % 2 === 0;
        ctx.fillStyle =
          t.variant === 'EMP'
            ? blink
              ? '#06b6d4'
              : '#083344'
            : t.variant === 'NAPALM'
            ? blink
              ? '#f97316'
              : '#7c2d12'
            : blink
            ? '#ef4444'
            : '#7f1d1d';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 8. Draw Enemies with Affix Badges & Health/Shield Bars
    for (const e of s.enemies) {
      ctx.save();

      // Affix specific auras & speed trails
      if (e.affix === 'SWIFT' && !e.isDead) {
        ctx.fillStyle = 'rgba(250, 204, 21, 0.25)';
        ctx.beginPath();
        ctx.arc(e.x - Math.cos(e.animState.timer * 8) * 10, e.y, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.affix === 'SHIELDED' && e.shield > 0) {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(e.x, e.y, 26, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (e.affix === 'ARMORED') {
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.6)';
        ctx.lineWidth = 2;
        ctx.strokeRect(e.x - 22, e.y - 22, 44, 44);
      } else if (e.affix === 'UNSTABLE') {
        ctx.fillStyle = 'rgba(249, 115, 22, 0.15)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 28, 0, Math.PI * 2);
        ctx.fill();
      }

      // Frost blue aura when slowed/frozen
      if (e.freezeTimer > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 24, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.slowTimer > 0) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.beginPath();
        ctx.arc(e.x, e.y, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Brittle crystalline marker
      if (e.brittleTimer > 0) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Damage flash
      if (e.flashTimer > 0) {
        ctx.filter = 'brightness(2) drop-shadow(0 0 8px #ef4444)';
      }

      const renderer =
        e.type === 'WALKER'
          ? spriteRenderers.current.walker
          : e.type === 'SPRINTER'
          ? spriteRenderers.current.sprinter
          : e.type === 'BEHEMOTH'
          ? spriteRenderers.current.behemoth
          : spriteRenderers.current.boss;

      const spriteSize =
        e.type === 'BOSS' ? 96 : e.type === 'BEHEMOTH' ? 76 : e.type === 'SPRINTER' ? 52 : 56;

      if (renderer) {
        renderer.draw(
          ctx,
          e.animState,
          e.x - spriteSize / 2,
          e.y - spriteSize / 2,
          spriteSize,
          spriteSize,
          assets,
        );
      }

      ctx.restore();

      // Health & Shield Bars + Affix Badge
      if (!e.isDead) {
        const barW = e.type === 'BOSS' ? 56 : e.type === 'BEHEMOTH' ? 44 : 32;
        const barH = 4;
        const barX = e.x - barW / 2;
        let barY = e.y - spriteSize / 2 - 8;

        // Draw Shield Bar above HP bar if Shielded
        if (e.maxShield > 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          ctx.fillRect(barX - 1, barY - 6, barW + 2, 4);

          const shieldRatio = Math.max(0, e.shield / e.maxShield);
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(barX, barY - 5, barW * shieldRatio, 2);
        }

        // HP Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

        const hpRatio = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle =
          hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#f59e0b' : '#ef4444';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);

        // Affix Icon / Label Tag
        if (e.affix) {
          ctx.save();
          ctx.font = 'bold 9px "Courier New", monospace';
          ctx.textAlign = 'center';

          let badgeText = e.affix;
          let badgeColor = '#94a3b8';
          if (e.affix === 'ARMORED') badgeColor = '#cbd5e1';
          else if (e.affix === 'SWIFT') badgeColor = '#facc15';
          else if (e.affix === 'SHIELDED') badgeColor = '#38bdf8';
          else if (e.affix === 'REGENERATOR') badgeColor = '#4ade80';
          else if (e.affix === 'SPLITTER') badgeColor = '#c084fc';
          else if (e.affix === 'UNSTABLE') badgeColor = '#fb923c';

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          const textW = ctx.measureText(badgeText).width;
          ctx.fillRect(e.x - textW / 2 - 3, barY - 14, textW + 6, 10);

          ctx.fillStyle = badgeColor;
          ctx.fillText(badgeText, e.x, barY - 6);
          ctx.restore();
        }
      }
    }

    // 9. Draw Cryo Beams (originating accurately from muzzle tip)
    for (const t of s.turrets) {
      if (t.type === 'CRYO' && t.beamActive && t.beamTarget) {
        ctx.save();
        const beamColor =
          t.variant === 'SHATTER'
            ? 'rgba(6, 182, 212, 0.9)'
            : t.variant === 'BLIZZARD'
            ? 'rgba(147, 197, 253, 0.9)'
            : 'rgba(56, 189, 248, 0.8)';
        ctx.strokeStyle = beamColor;
        ctx.lineWidth = t.level === 1 ? 4 : t.level === 2 ? 6 : 8;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;

        const muzzleX = t.x + Math.cos(t.angle) * 22;
        const muzzleY = t.y + Math.sin(t.angle) * 22;

        ctx.beginPath();
        ctx.moveTo(muzzleX, muzzleY);
        ctx.lineTo(t.beamTarget.x, t.beamTarget.y);
        ctx.stroke();

        // Core white beam
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(muzzleX, muzzleY);
        ctx.lineTo(t.beamTarget.x, t.beamTarget.y);
        ctx.stroke();

        // Blizzard vortex ring around target
        if (t.variant === 'BLIZZARD') {
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(t.beamTarget.x, t.beamTarget.y, 110, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 10. Draw Turrets (Rapid, Cryo, Mortar)
    for (const t of s.turrets) {
      if (t.type === 'MINE') continue;

      // Draw stationary tactical turret base mount
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;

      // Variant Ring Color
      let ringColor = '#475569';
      if (t.variant === 'GATLING') ringColor = '#f59e0b';
      else if (t.variant === 'RAILGUN') ringColor = '#06b6d4';
      else if (t.variant === 'BLIZZARD') ringColor = '#93c5fd';
      else if (t.variant === 'SHATTER') ringColor = '#38bdf8';
      else if (t.variant === 'HELLFIRE') ringColor = '#ef4444';
      else if (t.variant === 'SIEGE') ringColor = '#f97316';

      ctx.strokeStyle = ringColor;
      ctx.stroke();

      // Inner swivel mount ring
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw Turret Top/Gun with clean center rotation without axis flip
      ctx.save();
      ctx.translate(t.x, t.y);

      let turretImg = assets['turret_rapid_cannon'];
      if (t.type === 'CRYO') turretImg = assets['turret_cryo_emitter'];
      else if (t.type === 'MORTAR') turretImg = assets['turret_mortar_launcher'];

      ctx.rotate(t.angle);

      if (turretImg && turretImg.complete && turretImg.naturalWidth > 0) {
        ctx.drawImage(turretImg, -28, -28, 56, 56);
      } else {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = ringColor;
        ctx.fillRect(0, -5, 24, 10);
      }

      ctx.restore();

      // Draw Level Star/Pips
      if (t.level > 1) {
        ctx.fillStyle = ringColor;
        for (let i = 0; i < t.level; i++) {
          ctx.beginPath();
          ctx.arc(t.x - 8 + i * 8, t.y + 24, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Selection Highlight
      if (selectedTurretId === t.id) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        const effectiveR = s.unlockedTechMods.includes('OVERCHARGED_CAPACITORS')
          ? t.range * 1.25
          : t.range;
        ctx.arc(t.x, t.y, effectiveR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Selection Box
        ctx.strokeStyle = '#fbbf24';
        ctx.strokeRect(t.col * CELL_SIZE + 2, t.row * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
      }
    }

    // 11. Draw Projectiles (aligned with their true trajectory)
    const bulletImg = assets['projectile_bullet'];
    const shellImg = assets['projectile_mortar_shell'];

    for (const p of s.projectiles) {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'BULLET' || p.type === 'GATLING_BULLET') {
        const angle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
        ctx.rotate(angle);
        if (bulletImg && bulletImg.complete && bulletImg.naturalWidth > 0) {
          ctx.drawImage(bulletImg, -14, -6, 28, 12);
        } else {
          ctx.fillStyle = p.type === 'GATLING_BULLET' ? '#f59e0b' : '#fde047';
          ctx.fillRect(-10, -3, 20, 6);
        }
      } else if (p.type === 'RAILGUN') {
        const angle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
        ctx.rotate(angle);
        ctx.fillStyle = '#06b6d4';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fillRect(-18, -2, 36, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-14, -1, 28, 2);
      } else if (p.type === 'MORTAR') {
        const angle = Math.atan2(p.targetY - p.startY, p.targetX - p.startX);
        ctx.rotate(angle);
        if (shellImg && shellImg.complete && shellImg.naturalWidth > 0) {
          ctx.drawImage(shellImg, -18, -9, 36, 18);
        } else {
          ctx.fillStyle = p.variant === 'HELLFIRE' ? '#dc2626' : '#ef4444';
          ctx.fillRect(-12, -6, 24, 12);
        }
      }
      ctx.restore();
    }

    // 12. Draw Explosions
    const expImg = assets['fx_explosion_ring'];
    for (const exp of s.explosions) {
      const alpha = Math.max(0, 1 - exp.timer / exp.duration);
      ctx.save();
      if (expImg && expImg.complete && expImg.naturalWidth > 0 && !exp.color) {
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          expImg,
          exp.x - exp.radius,
          exp.y - exp.radius,
          exp.radius * 2,
          exp.radius * 2,
        );
      } else {
        ctx.fillStyle = exp.color
          ? exp.color.replace(')', `, ${alpha * 0.7})`).replace('rgb', 'rgba')
          : `rgba(249, 115, 22, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 13. Draw Particles
    for (const part of s.particles) {
      const alpha = Math.max(0, 1 - part.timer / part.duration);
      ctx.fillStyle = part.color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    // 14. Draw Floating Texts
    for (const txt of s.texts) {
      const alpha = Math.max(0, 1 - txt.timer / txt.duration);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font = txt.isLarge
        ? 'bold 14px "Courier New", monospace'
        : 'bold 12px "Courier New", monospace';
      ctx.fillStyle = txt.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText(txt.text, txt.x, txt.y);
      ctx.restore();
    }

    // 15. Draw Placement Range Preview when dragging/selecting a tool
    if (selectedTool && s.hoverCol >= 0 && s.hoverRow >= 0) {
      const hx = s.hoverCol * CELL_SIZE + CELL_SIZE / 2;
      const hy = s.hoverRow * CELL_SIZE + CELL_SIZE / 2;
      const cell = s.grid[s.hoverRow]?.[s.hoverCol];

      let isValid = false;
      if (selectedTool === 'MINE') {
        isValid = cell?.type === 'ROAD';
      } else {
        isValid = cell?.type === 'EMPTY';
      }

      let previewRange = 160;
      if (selectedTool === 'CRYO') previewRange = 145;
      else if (selectedTool === 'MINE') previewRange = 35;
      else if (selectedTool === 'MORTAR') previewRange = 280;

      if (s.unlockedTechMods.includes('OVERCHARGED_CAPACITORS')) {
        previewRange *= 1.25;
      }

      ctx.save();
      ctx.strokeStyle = isValid ? '#10b981' : '#ef4444';
      ctx.fillStyle = isValid ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hx, hy, previewRange, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Tile Box
      ctx.strokeRect(s.hoverCol * CELL_SIZE, s.hoverRow * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      ctx.restore();
    }

    // 16. Draw Orbital Targeting Reticle
    if (isOrbitalTargeting && s.dragPointer.active) {
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(s.dragPointer.x, s.dragPointer.y, 160, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(s.dragPointer.x - 30, s.dragPointer.y);
      ctx.lineTo(s.dragPointer.x + 30, s.dragPointer.y);
      ctx.moveTo(s.dragPointer.x, s.dragPointer.y - 30);
      ctx.lineTo(s.dragPointer.x, s.dragPointer.y + 30);
      ctx.stroke();

      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText(dict.clickToStrike, s.dragPointer.x, s.dragPointer.y - 35);
      ctx.restore();
    }

    ctx.restore(); // Restore screen shake
  };

  // Keep latest loop refs
  const updateRef = useRef(update);
  const drawRef = useRef(draw);
  updateRef.current = update;
  drawRef.current = draw;

  // Main Stepper RAF Loop
  useEffect(() => {
    let raf = 0;
    const loop = (time: number) => {
      // Global Pause with ESC
      if (inputRef.current) {
        const cancelPressed = inputRef.current.actions.cancel;
        if (cancelPressed && !lastCancelRef.current) {
          const currentStatus = gameStateRef.current.status;
          if (currentStatus === 'PLAYING') {
            setIsMenuOpen((prev) => !prev);
          } else if (currentStatus === 'START') {
            void exitChat({});
          } else if (['GAME_OVER', 'VICTORY'].includes(currentStatus)) {
            setGameState((prev) => ({...prev, status: 'START'}));
          }
        }
        lastCancelRef.current = cancelPressed;

        // Spacebar to call wave early
        if (inputRef.current.actions.confirm && sim.current.waveState === 'PREPARE') {
          callWaveEarly();
        }

        // Pointer interactions on canvas
        const p = inputRef.current.pointer;
        sim.current.dragPointer = {x: p.x, y: p.y, active: p.down};
        sim.current.hoverCol = Math.floor(p.x / CELL_SIZE);
        sim.current.hoverRow = Math.floor(p.y / CELL_SIZE);
      }

      stepperRef.current?.(time, (dt) => {
        if (!isMenuOpen && !isTechLabOpen) {
          updateRef.current(dt * gameSpeedRef.current);
        }
      });

      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) drawRef.current(ctx);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [callWaveEarly, isMenuOpen, isTechLabOpen, exitChat]);

  // Handle Canvas Pointer Click / Tap
  const handleCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (isOrbitalTargeting) {
      triggerOrbitalStrike(x, y);
      return;
    }

    if (selectedTool) {
      tryPlaceTurret(selectedTool, col, row);
      setSelectedTool(null);
      return;
    }

    // Check if clicked an existing turret
    const clickedTurret = sim.current.turrets.find((t) => t.col === col && t.row === row);
    if (clickedTurret) {
      setSelectedTurretId(clickedTurret.id);
      gameAudio.playCrispClick();
    } else {
      setSelectedTurretId(null);
    }
  };

  // Selected turret data for inspector panel
  const selectedTurret = useMemo(() => {
    return sim.current.turrets.find((t) => t.id === selectedTurretId) || null;
  }, [selectedTurretId, hudStats.scrap]);

  // Lifecycle SDK events
  usePlaygroundGameLifecycle(gameState, sdk);

  // Auto-play support
  const hasAutoplayed = useRef(false);
  useEffect(() => {
    if (
      !hasAutoplayed.current &&
      new URLSearchParams(window.location.search).has('autoplay')
    ) {
      hasAutoplayed.current = true;
      initGame();
    }
  }, [initGame]);

  return (
    <div className="fixed inset-0 overflow-hidden touch-none flex flex-col bg-stone-950 text-stone-100 font-mono select-none">
      {/* Background Music */}
      <BackgroundMusic
        url={BACKGROUND_MUSIC_URL}
        isPlaying={gameState.status === 'PLAYING' && !isMenuOpen && !isTechLabOpen}
        isMuted={isMusicMuted}
      />

      {/* Asset Loading Screen */}
      {!assetsReady && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-stone-950 text-amber-400">
          <div className="text-2xl font-black mb-2 animate-pulse">ESTABLISHING TACTICAL UPLINK...</div>
          <div className="text-sm text-stone-400">Loading Defense Assets & Spritesheets</div>
        </div>
      )}

      {/* TOP HUD BAR */}
      <header className="w-full shrink-0 bg-stone-900/95 border-b border-stone-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 z-20 text-xs md:text-sm">
        {/* Left: Bunker Health & Scrap */}
        <div className="flex items-center gap-3">
          {/* Bunker HP */}
          <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded border border-red-900/60">
            <Shield size={16} className="text-red-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 leading-none">{t('bunkerCore')}</span>
              <span className="font-bold text-red-400 leading-none mt-0.5">
                {hudStats.bunkerHp} / {hudStats.maxBunkerHp} HP
              </span>
            </div>
          </div>

          {/* Scrap Metal Currency */}
          <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded border border-amber-900/60">
            <img src={ASSETS_MANIFEST.icon_scrap_metal} alt="Scrap" className="w-4 h-4 object-contain" />
            <div className="flex flex-col">
              <span className="text-[10px] text-stone-400 leading-none">{t('scrapMetal')}</span>
              <span className="font-bold text-amber-400 leading-none mt-0.5">{hudStats.scrap}</span>
            </div>
          </div>
        </div>

        {/* Center: Wave Status, Speed & Tech Lab */}
        <div className="flex items-center gap-2">
          <div className="bg-stone-950/80 px-2.5 py-1 rounded border border-stone-700 text-center">
            <span className="text-[10px] text-stone-400 block leading-none">{t('wave')}</span>
            <span className="font-bold text-cyan-400 text-xs md:text-sm leading-none mt-0.5">
              {hudStats.wave} / {hudStats.maxWaves}
            </span>
          </div>

          {hudStats.waveState === 'PREPARE' && (
            <button
              onClick={callWaveEarly}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1 shadow transition-colors animate-pulse"
              title={t('callNow')}>
              <Zap size={14} />
              <span>{t('callNow')}</span>
            </button>
          )}

          {/* Tech Lab / Weapon Mods Button */}
          <button
            onClick={() => {
              setIsTechLabOpen(true);
              gameAudio.playCrispClick();
            }}
            className="bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-700 px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1.5 shadow transition-colors"
            title={t('techLab')}>
            <Cpu size={14} className="text-cyan-400" />
            <span>{t('techLab')}</span>
            {hudStats.activeModsCount > 0 && (
              <span className="bg-cyan-500 text-stone-950 px-1.5 py-0.2 rounded-full font-black text-[10px]">
                {hudStats.activeModsCount}
              </span>
            )}
          </button>

          {/* Game Speed 1x / 2x Toggle Button */}
          <button
            onClick={() => {
              setGameSpeed((prev) => (prev === 1 ? 2 : 1));
              gameAudio.playCrispClick();
            }}
            className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1 border transition-all ${
              gameSpeed === 2
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 border-amber-300 shadow-md shadow-amber-900/40 font-black'
                : 'bg-stone-950/80 hover:bg-stone-800 text-stone-300 border-stone-700'
            }`}
            title="Toggle Game Speed (1x / 2x)">
            <FastForward size={14} className={gameSpeed === 2 ? 'text-stone-950 fill-stone-950' : 'text-stone-400'} />
            <span>{gameSpeed === 2 ? t('speed2x') : t('speed1x')}</span>
          </button>

          {/* Tactical Orbital Strike Button */}
          <button
            onClick={() => {
              if (hudStats.orbitalReady) {
                setIsOrbitalTargeting((prev) => !prev);
                setSelectedTool(null);
                setSelectedTurretId(null);
                gameAudio.playCrispClick();
              } else {
                gameAudio.playErrorBuzz();
              }
            }}
            disabled={!hudStats.orbitalReady}
            className={`px-2.5 py-1 rounded font-bold text-xs flex items-center gap-1.5 border transition-all ${
              isOrbitalTargeting
                ? 'bg-red-600 text-white border-red-400 shadow-lg shadow-red-900/50'
                : hudStats.orbitalReady
                ? 'bg-red-950/80 hover:bg-red-900 text-red-400 border-red-800'
                : 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed'
            }`}>
            <img src={ASSETS_MANIFEST.icon_orbital_bombardment} alt="Orbital" className="w-4 h-4 object-contain" />
            <span>{t('orbitalStrike')}</span>
            {!hudStats.orbitalReady && (
              <span className="text-[10px] text-stone-400">({Math.ceil(sim.current.orbitalCooldown)}s)</span>
            )}
          </button>
        </div>

        {/* Right: Language Switcher, Score & Menu Button */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="bg-stone-950/80 hover:bg-stone-800 border border-stone-700 px-2 py-1 rounded flex items-center gap-1.5 text-xs font-bold text-amber-300 transition-colors"
            title="Toggle Language / Chuyển Đổi Ngôn Ngữ">
            <Globe size={14} className="text-amber-400" />
            <span>{lang === 'en' ? 'EN' : 'VI'}</span>
          </button>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-[10px] text-stone-400 leading-none">{t('scoreBest')}</span>
            <span className="font-bold text-yellow-400 leading-none mt-0.5">
              {sim.current.score} / {highScore}
            </span>
          </div>

          <button
            onClick={() => setIsMenuOpen(true)}
            className="min-w-[48px] min-h-[48px] bg-stone-800 hover:bg-stone-700 text-stone-200 rounded px-3 py-1 flex items-center justify-center gap-1 border border-stone-700 transition-colors"
            title="Open Pause Menu (Esc)">
            <MenuIcon size={18} />
            <span className="text-xs font-bold">{t('menu')}</span>
          </button>
        </div>
      </header>

      {/* GAME CANVAS PLAY AREA */}
      <main className="flex-1 w-full min-h-0 relative flex items-center justify-center bg-stone-950 p-1">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerDown={handleCanvasClick}
          style={{
            aspectRatio: `${CANVAS_WIDTH} / ${CANVAS_HEIGHT}`,
            width: `min(100%, calc(100vh * ${CANVAS_WIDTH} / ${CANVAS_HEIGHT}))`,
          }}
          className="h-auto max-w-full max-h-full border border-stone-800 shadow-2xl rounded cursor-crosshair"
        />
      </main>

      {/* BOTTOM CONTROL DOCK */}
      <footer className="w-full shrink-0 bg-stone-900/95 border-t border-stone-800 px-3 py-2 z-20 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Turret Selection Cards */}
        <div className="flex items-center gap-2 overflow-x-auto py-0.5">
          {/* Rapid Cannon */}
          <button
            onClick={() => {
              setSelectedTool((prev) => (prev === 'RAPID' ? null : 'RAPID'));
              setSelectedTurretId(null);
              setIsOrbitalTargeting(false);
              gameAudio.playCrispClick();
            }}
            className={`min-w-[76px] p-1.5 rounded flex flex-col items-center border transition-all ${
              selectedTool === 'RAPID'
                ? 'bg-amber-950 border-amber-400 shadow-lg shadow-amber-900/40 text-amber-300'
                : 'bg-stone-950 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}>
            <img src={ASSETS_MANIFEST.turret_rapid_cannon} alt="Rapid" className="w-8 h-8 object-contain" />
            <span className="font-bold text-[11px] mt-0.5">{t('autocannon')}</span>
            <span className="text-[10px] text-amber-400 font-semibold">{getConfig('rapidTurretCost')} {t('scrap')}</span>
          </button>

          {/* Cryo Projector */}
          <button
            onClick={() => {
              setSelectedTool((prev) => (prev === 'CRYO' ? null : 'CRYO'));
              setSelectedTurretId(null);
              setIsOrbitalTargeting(false);
              gameAudio.playCrispClick();
            }}
            className={`min-w-[76px] p-1.5 rounded flex flex-col items-center border transition-all ${
              selectedTool === 'CRYO'
                ? 'bg-cyan-950 border-cyan-400 shadow-lg shadow-cyan-900/40 text-cyan-300'
                : 'bg-stone-950 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}>
            <img src={ASSETS_MANIFEST.turret_cryo_emitter} alt="Cryo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-[11px] mt-0.5">{t('cryoBeam')}</span>
            <span className="text-[10px] text-cyan-400 font-semibold">{getConfig('cryoTurretCost')} {t('scrap')}</span>
          </button>

          {/* Road Landmine */}
          <button
            onClick={() => {
              setSelectedTool((prev) => (prev === 'MINE' ? null : 'MINE'));
              setSelectedTurretId(null);
              setIsOrbitalTargeting(false);
              gameAudio.playCrispClick();
            }}
            className={`min-w-[76px] p-1.5 rounded flex flex-col items-center border transition-all ${
              selectedTool === 'MINE'
                ? 'bg-red-950 border-red-400 shadow-lg shadow-red-900/40 text-red-300'
                : 'bg-stone-950 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}>
            <img src={ASSETS_MANIFEST.trap_landmine} alt="Mine" className="w-8 h-8 object-contain" />
            <span className="font-bold text-[11px] mt-0.5">{t('roadMine')}</span>
            <span className="text-[10px] text-red-400 font-semibold">{getConfig('mineCost')} {t('scrap')}</span>
          </button>

          {/* Mortar Cannon */}
          <button
            onClick={() => {
              setSelectedTool((prev) => (prev === 'MORTAR' ? null : 'MORTAR'));
              setSelectedTurretId(null);
              setIsOrbitalTargeting(false);
              gameAudio.playCrispClick();
            }}
            className={`min-w-[76px] p-1.5 rounded flex flex-col items-center border transition-all ${
              selectedTool === 'MORTAR'
                ? 'bg-orange-950 border-orange-400 shadow-lg shadow-orange-900/40 text-orange-300'
                : 'bg-stone-950 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}>
            <img src={ASSETS_MANIFEST.turret_mortar_launcher} alt="Mortar" className="w-8 h-8 object-contain" />
            <span className="font-bold text-[11px] mt-0.5">{t('mortar')}</span>
            <span className="text-[10px] text-orange-400 font-semibold">{getConfig('mortarTurretCost')} {t('scrap')}</span>
          </button>
        </div>

        {/* Selected Turret Inspector & Branching Upgrades */}
        {selectedTurret ? (
          <div className="flex flex-wrap items-center gap-2.5 bg-stone-950 px-3 py-1.5 rounded border border-cyan-800/60 max-w-full">
            <div className="flex flex-col">
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1">
                {selectedTurret.type === 'RAPID'
                  ? t('autocannon')
                  : selectedTurret.type === 'CRYO'
                  ? t('cryoBeam')
                  : selectedTurret.type === 'MINE'
                  ? t('roadMine')
                  : t('mortar')}{' '}
                {selectedTurret.variant !== 'NONE' && `[${selectedTurret.variant}]`} (LVL {selectedTurret.level})
              </span>
              <span className="text-[10px] text-stone-400">
                DMG: {selectedTurret.damage} | RNG: {selectedTurret.range}px {selectedTurret.fireRate > 0 && `| CD: ${selectedTurret.fireRate.toFixed(1)}s`}
              </span>
            </div>

            {/* Target Priority Selector */}
            {selectedTurret.type !== 'MINE' && (
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-stone-400">{t('target')}:</span>
                {(['FIRST', 'STRONGEST', 'WEAKEST', 'LAST'] as TargetPriority[]).map((p) => {
                  const pLabel =
                    p === 'FIRST'
                      ? t('targetFirst')
                      : p === 'STRONGEST'
                      ? t('targetStrongest')
                      : p === 'WEAKEST'
                      ? t('targetWeakest')
                      : t('targetLast');
                  return (
                    <button
                      key={p}
                      onClick={() => {
                        selectedTurret.priority = p;
                        gameAudio.playCrispClick();
                        setSelectedTurretId(selectedTurret.id);
                      }}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        selectedTurret.priority === p
                          ? 'bg-cyan-600 text-white'
                          : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
                      }`}>
                      {pLabel[0]}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Branching Upgrade Variant Choices */}
            {selectedTurret.level < 3 && (
              <div className="flex items-center gap-1.5">
                {selectedTurret.type === 'RAPID' && (
                  <>
                    <button
                      onClick={() => upgradeTurretVariant('GATLING')}
                      className="bg-amber-700 hover:bg-amber-600 text-amber-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="Gatling Overclock: Extreme fire rate shredding barrage">
                      <TrendingUp size={12} />
                      <span>{t('gatlingBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>

                    <button
                      onClick={() => upgradeTurretVariant('RAILGUN')}
                      className="bg-cyan-700 hover:bg-cyan-600 text-cyan-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="Hyper-Velocity Rail: High kinetic pierce with 100% Armor Bypass">
                      <Zap size={12} />
                      <span>{t('railgunBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>
                  </>
                )}

                {selectedTurret.type === 'CRYO' && (
                  <>
                    <button
                      onClick={() => upgradeTurretVariant('BLIZZARD')}
                      className="bg-blue-700 hover:bg-blue-600 text-blue-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="Blizzard Nova: Wide AoE slowing vortex with freeze chance">
                      <Sparkles size={12} />
                      <span>{t('blizzardBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>

                    <button
                      onClick={() => upgradeTurretVariant('SHATTER')}
                      className="bg-sky-700 hover:bg-sky-600 text-sky-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="Sub-Zero Shatter: Applies Brittle debuff (+40% damage taken)">
                      <TrendingUp size={12} />
                      <span>{t('shatterBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>
                  </>
                )}

                {selectedTurret.type === 'MINE' && (
                  <>
                    <button
                      onClick={() => upgradeTurretVariant('NAPALM')}
                      className="bg-orange-700 hover:bg-orange-600 text-orange-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="Cluster Napalm: Persistent ground fire on detonation">
                      <Flame size={12} />
                      <span>{t('napalmBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>

                    <button
                      onClick={() => upgradeTurretVariant('EMP')}
                      className="bg-cyan-700 hover:bg-cyan-600 text-cyan-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="EMP Shockwave: Stuns and completely strips enemy shields & affixes">
                      <Radio size={12} />
                      <span>{t('empBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>
                  </>
                )}

                {selectedTurret.type === 'MORTAR' && (
                  <>
                    <button
                      onClick={() => upgradeTurretVariant('HELLFIRE')}
                      className="bg-red-700 hover:bg-red-600 text-red-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="Hellfire Battery: Huge incendiary blast & lingering flames">
                      <Flame size={12} />
                      <span>{t('hellfireBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>

                    <button
                      onClick={() => upgradeTurretVariant('SIEGE')}
                      className="bg-stone-700 hover:bg-stone-600 text-stone-100 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                      title="Heavy Siege: Colossal impact damage with shockwave knockback">
                      <Target size={12} />
                      <span>{t('siegeBtn')} ({Math.floor(selectedTurret.totalInvested * 0.85)}s)</span>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Sell Button */}
            <button
              onClick={sellSelectedTurret}
              className="bg-red-900/60 hover:bg-red-800 text-red-200 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
              <Trash2 size={12} />
              <span>{t('sell')} (+{Math.floor(selectedTurret.totalInvested * 0.7)}s)</span>
            </button>
          </div>
        ) : (
          <div className="text-[11px] text-stone-400 italic hidden sm:block">
            {selectedTool
              ? selectedTool === 'MINE'
                ? t('hintDeployRoad')
                : t('hintDeployEmpty')
              : t('hintDefault')}
          </div>
        )}
      </footer>

      {/* TECH LAB / WEAPON MODS MODAL OVERLAY */}
      {isTechLabOpen && (
        <MenuOverlay tone="neutral" zIndex={45}>
          <div className="w-full max-w-xl flex flex-col bg-stone-900 border-2 border-cyan-600 rounded-lg p-5 m-4 shadow-2xl text-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Cpu size={24} className="text-cyan-400" />
                <div>
                  <h3 className="text-xl font-black text-cyan-400 tracking-wider">
                    {t('arsenalTechLab')}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {t('arsenalSubtitle')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTechLabOpen(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 p-1.5 rounded transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {TECH_MODS_CATALOG.map((mod) => {
                const isUnlocked = sim.current.unlockedTechMods.includes(mod.id);
                const canAfford = sim.current.scrap >= mod.cost;
                const modName = t(mod.nameKey as any);
                const modCat = t(mod.catKey as any);
                const modDesc = t(mod.descKey as any);

                return (
                  <div
                    key={mod.id}
                    className={`p-3 rounded border flex items-center justify-between gap-3 transition-all ${
                      isUnlocked
                        ? 'bg-cyan-950/40 border-cyan-600 shadow-md shadow-cyan-950/50'
                        : 'bg-stone-950 border-stone-800'
                    }`}>
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded flex items-center justify-center shrink-0 border ${
                          isUnlocked
                            ? 'bg-cyan-900/60 border-cyan-400 text-cyan-300'
                            : 'bg-stone-900 border-stone-700 text-stone-500'
                        }`}>
                        {mod.id === 'OVERCHARGED_CAPACITORS' && <Zap size={20} />}
                        {mod.id === 'HE_MUNITIONS' && <Flame size={20} />}
                        {mod.id === 'NANITE_MATRIX' && <Shield size={20} />}
                        {mod.id === 'SCRAP_SCAVENGER' && <Radio size={20} />}
                        {mod.id === 'CRIT_TARGETING' && <Target size={20} />}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-stone-100">{modName}</span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-stone-800 text-cyan-400 font-bold">
                            {modCat}
                          </span>
                        </div>
                        <p className="text-xs text-stone-300 mt-0.5 leading-tight">{modDesc}</p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isUnlocked ? (
                        <div className="flex items-center gap-1 text-xs font-black text-cyan-400 bg-cyan-950/80 px-2.5 py-1.5 rounded border border-cyan-700">
                          <Check size={14} />
                          <span>{t('active')}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => unlockTechMod(mod.id)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded font-black text-xs flex items-center gap-1 transition-all ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md'
                              : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                          }`}>
                          <Lock size={12} />
                          <span>{t('research')} ({mod.cost}s)</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
              <span>{t('availableScrap')}: <strong className="text-amber-400">{hudStats.scrap}</strong></span>
              <button
                onClick={() => setIsTechLabOpen(false)}
                className="bg-stone-800 hover:bg-stone-700 text-stone-200 px-4 py-1.5 rounded font-bold transition-colors">
                {t('returnToDefense')}
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* PAUSE / GAME MENU OVERLAY */}
      {isMenuOpen && (
        <MenuOverlay tone="neutral" zIndex={40}>
          <div className="w-full max-w-md flex flex-col items-center bg-stone-900 border-2 border-stone-700 rounded-lg p-6 m-4 shadow-2xl text-stone-100">
            <h2 className="text-3xl font-black mb-4 text-yellow-400 tracking-wider flex items-center gap-2">
              <Shield className="text-yellow-400" /> {t('tacticalPause')}
            </h2>

            <p className="text-stone-300 text-sm text-center mb-6">
              {t('wave')} {hudStats.wave} {t('of')} {hudStats.maxWaves} &bull; {t('bunkerCore')}: {hudStats.bunkerHp} HP
            </p>

            <div className="w-full flex flex-col gap-3">
              {/* Resume */}
              <button
                onClick={() => setIsMenuOpen(false)}
                autoFocus
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-2.5 rounded text-base flex items-center justify-center gap-2 transition-colors">
                <Play size={18} />
                {t('resumeDefense')}
              </button>

              {/* Music & SFX Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setIsMusicMuted((prev) => !prev)}
                  className="bg-stone-800 hover:bg-stone-700 border border-stone-700 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                  {isMusicMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
                  {t('music')}: {isMusicMuted ? t('muted') : t('soundActive')}
                </button>

                <button
                  onClick={() => {
                    const newMuted = gameAudio.toggleMute();
                    setIsSfxMuted(newMuted);
                  }}
                  className="bg-stone-800 hover:bg-stone-700 border border-stone-700 py-2 rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
                  {isSfxMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
                  {t('sfx')}: {isSfxMuted ? t('muted') : t('soundActive')}
                </button>
              </div>

              {/* Language Selector inside Pause Menu */}
              <button
                onClick={toggleLanguage}
                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-700 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 text-amber-300 transition-colors">
                <Globe size={16} className="text-amber-400" />
                <span>{lang === 'en' ? 'Ngôn Ngữ: English (Đổi sang Tiếng Việt)' : 'Language: Tiếng Việt (Switch to English)'}</span>
              </button>

              {/* Restart Level */}
              <button
                onClick={() => {
                  initGame();
                }}
                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-700 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                <RotateCw size={16} />
                {t('restartDefense')}
              </button>

              {/* How to Play */}
              <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="w-full bg-stone-800 hover:bg-stone-700 border border-stone-700 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                <HelpCircle size={16} />
                {t('howToPlay')}
              </button>

              {/* Quit to Menu */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setGameState((prev) => ({...prev, status: 'START'}));
                }}
                className="w-full bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 py-2 rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                <X size={16} />
                {t('abandonDefense')}
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* HOW TO PLAY OVERLAY */}
      {isHowToPlayOpen && (
        <MenuOverlay tone="neutral" zIndex={50}>
          <div className="w-full max-w-lg flex flex-col bg-stone-900 border-2 border-amber-600 rounded-lg p-6 m-4 shadow-2xl text-stone-200 overflow-y-auto max-h-[85vh]">
            <h3 className="text-2xl font-black text-amber-400 mb-4 flex items-center gap-2">
              <HelpCircle className="text-amber-400" /> {t('wastelandIntel')}
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-stone-300">
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <strong className="text-amber-400 block mb-1">{t('monsterAffixesTitle')}</strong>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{t('affixArmoredDesc')}</li>
                  <li>{t('affixSwiftDesc')}</li>
                  <li>{t('affixShieldedDesc')}</li>
                  <li>{t('affixRegeneratorDesc')}</li>
                  <li>{t('affixSplitterDesc')}</li>
                  <li>{t('affixUnstableDesc')}</li>
                </ul>
              </div>

              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <strong className="text-cyan-400 block mb-1">{t('turretVariantsTitle')}</strong>
                <ul className="list-disc pl-4 space-y-1">
                  <li>{t('varAutocannonDesc')}</li>
                  <li>{t('varCryoDesc')}</li>
                  <li>{t('varMineDesc')}</li>
                  <li>{t('varMortarDesc')}</li>
                </ul>
              </div>

              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <strong className="text-emerald-400 block mb-1">{t('techLabTitle')}</strong>
                {t('techLabDesc')}
              </div>
            </div>

            <button
              onClick={() => setIsHowToPlayOpen(false)}
              className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-2.5 rounded text-sm transition-colors">
              {t('returnToCommand')}
            </button>
          </div>
        </MenuOverlay>
      )}

      {/* START SCREEN */}
      {gameState.status === 'START' && (
        <MenuOverlay tone="neutral" zIndex={40}>
          <div className="bg-stone-900 border-2 border-stone-700 p-6 md:p-8 rounded-xl shadow-2xl flex flex-col items-center w-full max-w-md text-stone-100">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-900/50">
              <Shield size={36} className="text-amber-400" />
            </div>

            <h1 className="text-2xl md:text-3xl font-black mb-2 text-yellow-400 text-center tracking-wider">
              {t('gameTitle')}
            </h1>

            <p className="text-stone-300 text-xs md:text-sm text-center mb-5 leading-relaxed">
              {t('gameSubtitle')}
            </p>

            {/* Language switch on start screen */}
            <div className="flex items-center gap-2 mb-5">
              <button
                onClick={() => {
                  setLang('vi');
                  try {
                    localStorage.setItem('wasteland_td_lang', 'vi');
                  } catch {}
                  gameAudio.playCrispClick();
                }}
                className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                  lang === 'vi'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                }`}>
                🇻🇳 Tiếng Việt
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  try {
                    localStorage.setItem('wasteland_td_lang', 'en');
                  } catch {}
                  gameAudio.playCrispClick();
                }}
                className={`px-3 py-1 rounded text-xs font-bold border transition-colors ${
                  lang === 'en'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-black shadow'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700'
                }`}>
                🇺🇸 English
              </button>
            </div>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={initGame}
                autoFocus
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-black px-6 py-3 rounded font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95">
                <Play size={20} />
                {t('commenceDefense')}
              </button>

              <button
                onClick={() => setIsHowToPlayOpen(true)}
                className="w-full bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 py-2.5 rounded font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                <HelpCircle size={16} />
                {t('tacticalBriefing')}
              </button>
            </div>
          </div>
        </MenuOverlay>
      )}

      {/* GAME OVER SCREEN */}
      {gameState.status === 'GAME_OVER' && (
        <Overlay
          title={t('bunkerOverrun')}
          description={t('bunkerOverrunDesc', {
            wave: hudStats.wave,
            score: gameState.score,
          })}
          actionLabel={t('retryDefense')}
          onAction={initGame}
          icon={<RotateCw size={24} />}
          tone="danger"
        />
      )}

      {/* VICTORY SCREEN */}
      {gameState.status === 'VICTORY' && (
        <Overlay
          title={t('sectorSecured')}
          description={t('sectorSecuredDesc', {
            score: gameState.score,
          })}
          actionLabel={t('defendAgain')}
          onAction={initGame}
          icon={<Award size={24} />}
          tone="victory"
        />
      )}
    </div>
  );
}
