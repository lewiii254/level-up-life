export type SkillBranch = 'coding' | 'study' | 'self';

export interface SkillNode {
  id: string;
  branch: SkillBranch;
  tier: number; // 1..4
  name: string;
  description: string;
  cost: number;
  icon: string;
  requires?: string[];
  effect: { type: 'xp_multiplier' | 'streak_shield' | 'bonus_quest_chance' | 'mission_bonus'; value: number };
}

export const SKILL_TREE: SkillNode[] = [
  // CODING branch
  { id: 'code_1', branch: 'coding', tier: 1, name: 'Syntax Apprentice', description: '+5% XP from coding sessions', cost: 1, icon: '💻', effect: { type: 'xp_multiplier', value: 0.05 } },
  { id: 'code_2', branch: 'coding', tier: 2, name: 'Bug Hunter', description: '+10% XP from coding sessions', cost: 2, icon: '🐛', requires: ['code_1'], effect: { type: 'xp_multiplier', value: 0.10 } },
  { id: 'code_3', branch: 'coding', tier: 3, name: 'Architect', description: 'Coding missions grant +25% bonus XP', cost: 3, icon: '🏛️', requires: ['code_2'], effect: { type: 'mission_bonus', value: 0.25 } },
  { id: 'code_4', branch: 'coding', tier: 4, name: 'Code Sage', description: '+20% XP & 1 streak shield', cost: 5, icon: '🧙‍♂️', requires: ['code_3'], effect: { type: 'xp_multiplier', value: 0.20 } },

  // STUDY branch
  { id: 'study_1', branch: 'study', tier: 1, name: 'Curious Mind', description: '+5% XP from study sessions', cost: 1, icon: '📖', effect: { type: 'xp_multiplier', value: 0.05 } },
  { id: 'study_2', branch: 'study', tier: 2, name: 'Knowledge Vault', description: '+10% XP from study sessions', cost: 2, icon: '🗝️', requires: ['study_1'], effect: { type: 'xp_multiplier', value: 0.10 } },
  { id: 'study_3', branch: 'study', tier: 3, name: 'Quest Magnet', description: '+15% chance for daily bonus quests', cost: 3, icon: '🧲', requires: ['study_2'], effect: { type: 'bonus_quest_chance', value: 0.15 } },
  { id: 'study_4', branch: 'study', tier: 4, name: 'Scholar Supreme', description: '+20% XP from all study', cost: 5, icon: '🎓', requires: ['study_3'], effect: { type: 'xp_multiplier', value: 0.20 } },

  // SELF branch
  { id: 'self_1', branch: 'self', tier: 1, name: 'Inner Spark', description: '+5% XP from self-improvement', cost: 1, icon: '✨', effect: { type: 'xp_multiplier', value: 0.05 } },
  { id: 'self_2', branch: 'self', tier: 2, name: 'Streak Shield', description: 'Protects 1 missed day per week', cost: 2, icon: '🛡️', requires: ['self_1'], effect: { type: 'streak_shield', value: 1 } },
  { id: 'self_3', branch: 'self', tier: 3, name: 'Mindful Master', description: '+10% XP & immune to streak loss', cost: 3, icon: '🧘', requires: ['self_2'], effect: { type: 'xp_multiplier', value: 0.10 } },
  { id: 'self_4', branch: 'self', tier: 4, name: 'Ascended', description: '+25% XP from self-improvement', cost: 5, icon: '🌟', requires: ['self_3'], effect: { type: 'xp_multiplier', value: 0.25 } },
];

export const BRANCH_META: Record<SkillBranch, { label: string; color: string; emoji: string }> = {
  coding: { label: 'Coding', color: 'from-cyan-500 to-blue-600', emoji: '💻' },
  study: { label: 'Study', color: 'from-purple-500 to-pink-600', emoji: '📚' },
  self: { label: 'Self', color: 'from-amber-500 to-orange-600', emoji: '💪' },
};
