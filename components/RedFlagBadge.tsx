'use client';

import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface RedFlagBadgeProps {
  flag: string;
}

export default function RedFlagBadge({ flag }: RedFlagBadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <Badge variant="destructive" className="glow">
        {flag}
      </Badge>
    </motion.div>
  );
}
