import type { AchievementCategory, AchievementDefinition } from './types.js';

const a = (id: string, category: AchievementCategory, title: string, description: string,
  progressSource: string, target: number, tokenReward: number, hidden = false,
  cosmeticRewards: readonly string[] = []): AchievementDefinition => ({
  id, category, title, description, hidden, target, progressSource, tokenReward,
  cosmeticRewards, repeatable: false, prerequisiteIds: [], version: 1,
});

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  a('first-step','tutorial','First Step','Complete the first Tutorial lesson.','TutorialLessonCompleted',1,1),
  a('first-victory','general','First Victory','Win your first complete match.','MatchWon',1,1),
  a('ready-to-fight','tutorial','Ready to Fight','Complete the Core Tutorial.','CoreTutorialCompleted',1,3),
  a('clean-round','combat','Clean Round','Win a round without taking damage.','PerfectRound',1,2),
  a('full-roster','collection','Full Roster','Play a complete match as every fighter.','UniqueFighterMatch',5,3),
  a('five-paths','longTerm','Five Paths','Purchase a node for every fighter.','UniqueFighterNode',5,5),
  a('master-yzx','mastery','Master of YZX','Reach mastery with all five fighters.','CharacterMastered',5,10,false,['emblem.master-yzx']),
  a('first-combo','combat','Link Established','Complete your first combo.','ComboCompleted',1,1),
  a('ten-hit','combat','Unbroken String','Complete a ten-hit combo.','TenHitCombo',1,3),
  a('punish','combat','Frame Perfect','Land a successful punish.','PunishLanded',1,2),
  a('anti-air','combat','Air Denied','Land an anti-air.','AntiAirLanded',1,2),
  a('throw-escape','combat','No Entry','Escape a throw.','ThrowEscaped',1,2),
  a('perfect-block','combat','Perfect Block','Perform a Perfect Block.','PerfectBlock',1,2),
  a('guard-break','combat','Open Circuit','Break an opponent guard.','GuardBreak',1,2),
  a('comeback','challenge','Not Over Yet','Win after critical health.','ComebackVictory',1,3),
  a('super-finish','combat','Super Finish','Finish a match with a Super.','SuperFinish',1,2),
  a('ultimate-finish','combat','Ultimate Finish','Finish a match with an Ultimate.','UltimateFinish',1,3),
  a('critical-win','challenge','One Pixel Left','Win with critical HP.','CriticalHpVictory',1,3),
  a('story-prologue','story','No Fixed Position','Complete the Prologue.','StoryPrologueCompleted',1,1),
  a('story-mim','story','The Silent Wall','Defeat Mim in Story Mode.','StoryMimDefeated',1,2),
  a('story-lucky','story','The Winning Version','Defeat Lucky in Story Mode.','StoryLuckyDefeated',1,2),
  a('story-titan','story','The Last Order','Defeat Titan in Story Mode.','StoryTitanDefeated',1,2),
  a('story-vorgh','story','All the Pain','Defeat Vorgh in Story Mode.','StoryVorghDefeated',1,2),
  a('story-fifth','story','The Fifth','Defeat the Fifth.','StoryFifthDefeated',1,5,true),
  a('story-zero','story','Zero Form','Defeat Zero Form.','StoryZeroDefeated',1,5,true),
  a('true-ending','secret','Living Geometry','Unlock the true ending.','TrueEndingUnlocked',1,10,true,['palette.glitch-living','title.true-ending']),
  a('training-first','training','Lab Entry','Complete a Training challenge.','TrainingChallengeCompleted',1,1),
  a('training-twenty','training','Lab Discipline','Complete twenty Training challenges.','TrainingChallengeCompleted',20,5),
  ...characterAchievements('mim', ['First Invisible Wall','Wall Rebound','Wall-Assisted Combo','Valid Reflection','Measured Architecture'],
    ['WallCreated','WallRebound','WallCombo','ProjectileReflected','MimLimitWin']),
  ...characterAchievements('glitch', ['Teleport Punish','Side-Switch Combo','Air Combo','Boss Corrupted','Story Complete'],
    ['TeleportPunish','SideSwitchCombo','AirCombo','StoryBossDefeated','StoryCompleted']),
  ...characterAchievements('lucky', ['Jackpot','No Luck Wasted','Lucky Guard','Fixed Seed','Enhanced Conversion'],
    ['JackpotReached','LuckPreservedWin','LuckyGuard','FixedSeedChallenge','EnhancedConversion']),
  ...characterAchievements('titan', ['Command Authority','Air Interception','Wall Throw','Armour Approved','Siege Mix'],
    ['CommandGrab','AntiAirGrab','WallThrow','ArmourAbsorbed','StrikeThrowWin']),
  ...characterAchievements('vorgh', ['Every Rage Tier','Pain Guard','Controlled Berserk','Critical Predator','Varied Pressure'],
    ['AllRageTiers','PainGuard','ControlledBerserkFinish','ComebackVictory','VariedPressure']),
];

function characterAchievements(character: string, titles: readonly string[], sources: readonly string[]): readonly AchievementDefinition[] {
  const regular = titles.map((title, index) => a(`${character}-${index + 1}`,'mastery',title,
    `Complete ${title.toLowerCase()} as ${character.toUpperCase()}.`,sources[index]!,1,index === 4 ? 3 : 2));
  return [...regular, a(`${character}-all-branches`,'mastery',`${character.toUpperCase()} Mastery`,
    `Master all three ${character.toUpperCase()} branches.`,`${character}BranchesMastered`,3,5,false,[`tree-vfx.${character}`])];
}

export const achievementById = (id: string): AchievementDefinition | undefined => ACHIEVEMENTS.find((entry) => entry.id === id);
