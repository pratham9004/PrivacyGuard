'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface RadarScannerProps {
  size?: number;
  scanning?: boolean;
}

export default function RadarScanner({ size = 200, scanning = true }: RadarScannerProps) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer ring */}
      <motion.div
        className="absolute rounded-full border border-green-500/30"
        style={{ width: size, height: size }}
        animate={scanning ? {
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.3, 0.5],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      {/* Middle ring */}
      <motion.div
        className="absolute rounded-full border border-green-500/50"
        style={{ width: size * 0.66, height: size * 0.66 }}
        animate={scanning ? {
          scale: [1, 1.15, 1],
          opacity: [0.7, 0.4, 0.7],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />
      
      {/* Inner ring */}
      <motion.div
        className="absolute rounded-full border border-green-500/70"
        style={{ width: size * 0.33, height: size * 0.33 }}
        animate={scanning ? {
          scale: [1, 1.2, 1],
          opacity: [1, 0.6, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.6,
        }}
      />
      
      {/* Center dot */}
      <div
        className="absolute rounded-full bg-[#39FF14] shadow-[0_0_20px_#39FF14]"
        style={{
          width: size * 0.08,
          height: size * 0.08,
        }}
      />
      
      {/* Scanning beam */}
      <motion.div
        className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-[#39FF14] to-transparent"
        style={{ top: size / 2 }}
        animate={scanning ? {
          rotate: [0, 360],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Rotating crosshairs */}
      <motion.div
        className="absolute"
        style={{ width: size * 0.9, height: size * 0.9 }}
        animate={scanning ? {
          rotate: [0, -360],
        } : {}}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="absolute top-1/2 left-0 w-full h-px bg-green-500/20" />
        <div className="absolute left-1/2 top-0 h-full w-px bg-green-500/20" />
      </motion.div>
      
      {/* Grid overlay */}
      <svg className="absolute" style={{ width: size, height: size }}>
        <defs>
          <pattern id={`grid-${size}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(57,255,20,0.1)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${size})`} />
      </svg>
    </div>
  );
}
