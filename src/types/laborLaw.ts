export type WorldId =
  | 'world1'
  | 'world2'
  | 'world3'
  | 'world4'
  | 'world5'
  | 'world6'
  | 'holidays'
  | 'warp_calc'
  | 'flashcards'
  | 'wage_matrix'
  | 'shop'
  | 'vault';

export type MarioTheme =
  | 'overworld'
  | 'underground'
  | 'castle'
  | 'galaxy'
  | 'rainbow'
  | 'bowser_lava'
  | 'retro_nes'
  | 'neon_synth'
  | 'desert_oasis'
  | 'aurora'
  | 'pro_study_paper'
  | 'pro_study_slate'
  | 'pro_study_sage'
  | 'peach_castle'
  | 'yoshi_island'
  | 'rosalina_comet'
  | 'royal_parchment'
  | 'luigi_mansion'
  | 'sakura_garden'
  | 'arctic_ice_world'
  | 'espresso_tribunal';

export type AppStudyFontId =
  | 'jakarta'
  | 'editorial_serif'
  | 'lexend'
  | 'outfit'
  | 'crimson'
  | 'dm_sans'
  | 'bricolage'
  | 'jetbrains_mono';

export type MarioAvatar =
  | 'mario'
  | 'luigi'
  | 'peach'
  | 'daisy'
  | 'rosalina'
  | 'pauline'
  | 'toad'
  | 'toadette'
  | 'capttoad'
  | 'yoshi'
  | 'birdo'
  | 'donkeykong'
  | 'diddykong'
  | 'wario'
  | 'waluigi'
  | 'bowser'
  | 'bowserjr'
  | 'koopatroopa'
  | 'shyguy'
  | 'boo'
  | 'kamek'
  | 'drybones'
  | 'metalmario'
  | 'goldmario'
  | 'firemario'
  | 'iceluigi'
  | 'tanookimario'
  | 'catpeach'
  | 'cosmicrosalina'
  | 'drybowser'
  | 'goldenyoshi'
  | 'lawyertoad'
  | 'shadowmario'
  | 'drpeach';

export type ComplexityMode = 'beginner' | 'advanced';

export type StudyDifficulty = 'casual' | 'exam_prep';

export type ShopCategory =
  | 'powerup'
  | 'special_event'
  | 'luxury'
  | 'theme'
  | 'avatar'
  | 'companion'
  | 'frame'
  | 'perk'
  | 'soundpack'
  | 'title'
  | 'certificate';

export type SoundPackId =
  | 'sound_default'
  | 'sound_nes_8bit'
  | 'sound_snes_16bit'
  | 'sound_zen_lofi'
  | 'sound_galaxy_synth'
  | 'sound_bowser_metal'
  | 'sound_orchestral'
  | 'sound_underwater_ambient'
  | 'sound_peach_royal'
  | 'sound_yoshi_tropical'
  | 'sound_ghost_organ'
  | 'sound_dk_jungle'
  | 'sound_rainbow_synthwave'
  | 'sound_paper_acoustic'
  | 'sound_starlight_jazz';

export type StudyCompanionId =
  | 'comp_none'
  | 'comp_luma'
  | 'comp_baby_yoshi'
  | 'comp_polterpup'
  | 'comp_counsel_toad'
  | 'comp_chain_chomp'
  | 'comp_lakitu'
  | 'comp_toadsworth'
  | 'comp_captain_toad'
  | 'comp_pauline'
  | 'comp_dry_bones'
  | 'comp_shy_guy'
  | 'comp_birdo'
  | 'comp_dk'
  | 'comp_diddy'
  | 'comp_kamek'
  | 'comp_nabbit';

export type CardFrameId =
  | 'frame_default'
  | 'frame_royal_gold'
  | 'frame_starlight_prism'
  | 'frame_retro_brick'
  | 'frame_emerald_pipe'
  | 'frame_supreme_crimson'
  | 'frame_koopa_sovereign'
  | 'frame_peach_stained_glass'
  | 'frame_bowser_obsidian'
  | 'frame_yoshi_botanical'
  | 'frame_boo_ethereal'
  | 'frame_rainbow_prism';

export interface ShopItem {
  id: string;
  name: string;
  category: ShopCategory;
  price: number;
  description: string;
  previewColor?: string;
  avatarId?: MarioAvatar;
  themeId?: MarioTheme;
  soundPackId?: SoundPackId;
  companionId?: StudyCompanionId;
  frameId?: CardFrameId;
  luxuryFrameId?: string;
  luxuryAuraId?: string;
  luxuryCartridgeId?: string;
  specialEventType?: 'double_xp_1h' | 'unlock_modules_30m' | 'boss_skip_token' | 'invincible_frenzy';
  faction?: string;
  badge?: string;
  perkEffect?: string;
  isConsumable?: boolean;
  durationMinutes?: number;
}

export type TopicDifficulty = 'Foundation' | 'Intermediate' | 'Bar Master';

export interface LawTopic {
  id: string;
  worldId: WorldId;
  title: string;
  badge: string; // e.g., "Art. 82", "R.A. 11360", "D.O. 174"
  iconName: string; // Mario item representation
  summary: string;
  difficulty?: TopicDifficulty;
  verbatimProvision?: string; // Exact statutory text of the provision
  beginnerSummary?: string; // Plain-English simplified summary for Beginner mode
  practicalTakeaway?: string; // Real-world practical application for employees/employers
  keyDoctrines: string[];
  rules: {
    heading: string;
    description?: string;
    items?: string[];
    subSections?: {
      title: string;
      items: string[];
    }[];
    tableData?: {
      headers: string[];
      rows: string[][];
    };
  }[];
  exceptions?: {
    generalRule: string;
    exceptions: string[];
    exceptionToException?: string[];
  }[];
  barTips?: string[];
  keyTips?: string[];
}

export interface Flashcard {
  id: string;
  world: string;
  worldNum: number;
  question: string;
  answer: string;
  keyTakeaway: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface RegionalWageEntry {
  region: string;
  effectivity: string;
  nonAgri: string;
  agri: string;
}

export interface KasambahayWageEntry {
  region: string;
  effectivity: string;
  minimumWage: string;
}
