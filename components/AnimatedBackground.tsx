'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';

interface Star {
  id: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
}

export default function AnimatedBackground() {
  // Generate stars on client side only to prevent hydration mismatch
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate consistent star positions based on index
    const newStars = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: (i * 17 + 3) % 100, // Deterministic pseudo-random positions
      top: (i * 23 + 7) % 100,
      duration: 2 + (i % 3), // Vary duration between 2-4 seconds
      delay: (i * 0.1) % 2, // Staggered delays
    }));
    setStars(newStars);
  }, []);

  // Gradient animation settings
  const gradientVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        background: [
          'linear-gradient(to bottom right, #000000, #111111, #000000)',
          'linear-gradient(to bottom right, #000000, #222222, #000000)',
          'linear-gradient(to bottom right, #000000, #111111, #000000)',
        ],
        duration: 10,
        repeat: Infinity,
        ease: 'linear',
      },
    },
  };

  return (
    <div className="fixed inset-0 -z-10">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"
        animate={{
          background: [
            'linear-gradient(to bottom right, #000000, #111111, #000000)',
            'linear-gradient(to bottom right, #000000, #222222, #000000)',
            'linear-gradient(to bottom right, #000000, #111111, #000000)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 opacity-20">
        {mounted && stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute w-1 h-1 bg-neon-green rounded-full"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
