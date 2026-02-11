'use client';

import { motion } from 'framer-motion';
import { getRiskGrade } from '@/lib/utils';

interface RiskGaugeProps {
  score: number;
}

export default function RiskGauge({ score }: RiskGaugeProps) {
  const getColor = (score: number) => {
    if (score < 30) return '#00FF00';
    if (score < 70) return '#FFFF00';
    return '#FF0000';
  };

  return (
    <div className="glassmorphism p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4">Risk Score</h3>
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#333"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={getColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 100)}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - score / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold glow">{score}</div>
            <div className="text-lg">Grade {getRiskGrade(score)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
