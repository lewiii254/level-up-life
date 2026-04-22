import { motion } from 'framer-motion';
import { getColorClass, getAccessoryEmoji } from '@/lib/avatarOptions';
import { cn } from '@/lib/utils';

interface AvatarDisplayProps {
  emoji?: string | null;
  color?: string | null;
  accessory?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { box: 'w-10 h-10', text: 'text-lg', acc: 'text-xs -top-1 -right-1' },
  md: { box: 'w-16 h-16', text: 'text-3xl', acc: 'text-base -top-1 -right-1' },
  lg: { box: 'w-24 h-24', text: 'text-5xl', acc: 'text-2xl -top-2 -right-2' },
  xl: { box: 'w-36 h-36', text: 'text-7xl', acc: 'text-4xl -top-2 -right-2' },
};

export function AvatarDisplay({ emoji = '🧙', color = 'cyan', accessory = 'none', size = 'md', animated = true, className }: AvatarDisplayProps) {
  const s = sizeMap[size];
  const acc = getAccessoryEmoji(accessory ?? 'none');

  return (
    <motion.div
      whileHover={animated ? { scale: 1.05, rotate: -3 } : undefined}
      className={cn('relative inline-flex items-center justify-center rounded-full bg-gradient-to-br shadow-lg', s.box, getColorClass(color ?? 'cyan'), className)}
    >
      <span className={cn(s.text, 'drop-shadow')}>{emoji ?? '🧙'}</span>
      {acc && <span className={cn('absolute', s.acc)}>{acc}</span>}
    </motion.div>
  );
}
