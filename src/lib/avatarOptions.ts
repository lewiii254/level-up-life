export const AVATAR_EMOJIS = [
  '🧙', '🦸', '🥷', '🤖', '👾', '🐉', '🦊', '🐺',
  '🦅', '🦁', '🐯', '🐲', '👨‍💻', '👩‍💻', '🧠', '⚡',
  '🔥', '🌟', '💀', '👑',
];

export const AVATAR_COLORS = [
  { id: 'cyan', label: 'Cyan', class: 'from-cyan-400 to-blue-600', ring: 'ring-cyan-400' },
  { id: 'purple', label: 'Purple', class: 'from-purple-400 to-pink-600', ring: 'ring-purple-400' },
  { id: 'fire', label: 'Fire', class: 'from-orange-400 to-red-600', ring: 'ring-orange-400' },
  { id: 'forest', label: 'Forest', class: 'from-emerald-400 to-teal-600', ring: 'ring-emerald-400' },
  { id: 'gold', label: 'Gold', class: 'from-yellow-400 to-amber-600', ring: 'ring-yellow-400' },
  { id: 'shadow', label: 'Shadow', class: 'from-slate-500 to-slate-900', ring: 'ring-slate-400' },
];

export const AVATAR_ACCESSORIES = [
  { id: 'none', label: 'None', emoji: '' },
  { id: 'crown', label: 'Crown', emoji: '👑' },
  { id: 'halo', label: 'Halo', emoji: '😇' },
  { id: 'fire', label: 'Fire', emoji: '🔥' },
  { id: 'star', label: 'Star', emoji: '⭐' },
  { id: 'lightning', label: 'Lightning', emoji: '⚡' },
];

export const getColorClass = (id: string) => AVATAR_COLORS.find(c => c.id === id)?.class ?? AVATAR_COLORS[0].class;
export const getAccessoryEmoji = (id: string) => AVATAR_ACCESSORIES.find(a => a.id === id)?.emoji ?? '';
