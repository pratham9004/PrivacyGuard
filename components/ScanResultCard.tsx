'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface AnalysisResult {
  risk_score: number;
  risk_level: string;
  red_flags: string[];
  summary: string;
  detected_keywords: string[];
  grade: string;
  analyzed_at: string;
}

interface ScanResultCardProps {
  result: AnalysisResult;
}

export default function ScanResultCard({ result }: ScanResultCardProps) {
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'text-red-400 border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'text-green-400 border-green-500/50 bg-green-500/10';
      default:
        return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-black/60 backdrop-blur-xl border-green-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#39FF14]" />
            Analysis Results
          </CardTitle>
          <CardDescription className="text-gray-400">
            Privacy risk assessment completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`p-4 rounded-lg border ${getRiskColor(result.risk_level)}`}>
            <div className="flex items-center justify-between">
              <span className="font-medium">Risk Level</span>
              <span className="text-lg font-bold">{result.risk_level}</span>
            </div>
          </div>
          
          <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
            <div className="flex items-center gap-2 text-[#39FF14] mb-2">
              <Info className="h-5 w-5" />
              <span className="font-medium">Summary</span>
            </div>
            <p className="text-gray-300">{result.summary}</p>
          </div>
          
          {result.detected_keywords.length > 0 && (
            <div className="p-4 bg-black/40 rounded-lg border border-green-500/20">
              <div className="flex items-center gap-2 text-[#39FF14] mb-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Detected Keywords ({result.detected_keywords.length})</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.detected_keywords.slice(0, 10).map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-sm"
                  >
                    {keyword}
                  </span>
                ))}
                {result.detected_keywords.length > 10 && (
                  <span className="px-2 py-1 bg-green-500/10 text-gray-400 rounded text-sm">
                    +{result.detected_keywords.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          <div className="text-sm text-gray-500">
            Analyzed at: {new Date(result.analyzed_at).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
