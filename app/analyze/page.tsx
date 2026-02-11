'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import axios from 'axios';
import RiskGauge from '@/components/RiskGauge';
import RedFlagBadge from '@/components/RedFlagBadge';
import ScanResultCard from '@/components/ScanResultCard';
import RadarScanner from '@/components/RadarScanner';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AnimatedBackground from '@/components/AnimatedBackground';
import { saveScanResult } from '@/lib/firestore';
import { Shield, FileText, AlertTriangle, CheckCircle, Download, Share2, Cpu } from 'lucide-react';

interface AnalysisResult {
  risk_score: number;
  risk_level: string;
  red_flags: string[];
  summary: string;
  detected_keywords: string[];
  recommendations: string[];
  grade: string;
  analyzed_at: string;
}

export default function AnalyzePage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [policyText, setPolicyText] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !loading && !user) {
      router.push('/login');
    }
  }, [isInitialized, loading, user, router]);

  const sampleText = `This app collects your precise location data even when the app is closed.
We may share your personal data with third-party advertising partners for marketing purposes.
The app has access to your camera, microphone, and contacts.
We collect biometric data including face recognition and fingerprint for authentication.
Your browsing history and search queries are shared with affiliate partners.
We retain your data indefinitely for analytics and improvement purposes.`;

  const handleAnalyze = async () => {
    if (!policyText.trim()) {
      setError('Please enter some text to analyze');
      return;
    }
    setProcessing(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/analyze', { text: policyText });
      setResult(response.data);
      
      // Save scan to Firestore after successful analysis
      if (user) {
        try {
          const scanId = await saveScanResult({
            userId: user.uid,
            text: policyText,
            risk_score: response.data.risk_score,
            risk_level: response.data.risk_level as 'Low' | 'Medium' | 'High',
            red_flags: response.data.red_flags,
            summary: response.data.summary,
            detected_keywords: response.data.detected_keywords,
            recommendations: response.data.recommendations,
          });
          if (scanId) {
            console.log('Scan saved successfully with ID:', scanId);
          }
        } catch (firestoreError) {
          console.error('Error saving scan to Firestore:', firestoreError);
        }
      }
    } catch (err: any) {
      console.error('Analysis failed', err);
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleLoadSample = () => {
    setPolicyText(sampleText);
    setError('');
  };

  const handleShare = async () => {
    if (result) {
      const shareUrl = `${window.location.origin}/share/${btoa(JSON.stringify(result))}`;
      await navigator.clipboard.writeText(shareUrl);
      alert('Share link copied to clipboard!');
    }
  };

  const handleExportPDF = () => {
    if (!result) return;
    
    const content = `
PrivacyGuard Analysis Report
============================
Date: ${result.analyzed_at}
Grade: ${result.grade}
Risk Score: ${result.risk_score}/100
Risk Level: ${result.risk_level}

Summary
-------
${result.summary}

Red Flags Found
----------------
${result.red_flags.length > 0 ? result.red_flags.map(f => `• ${f}`).join('\n') : 'None detected'}

Detected Keywords
-----------------
${result.detected_keywords.map(k => `• ${k}`).join('\n')}

Recommendations
---------------
${result.recommendations.map(r => `• ${r}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privacy-analysis-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show loading while auth is initializing
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-[#39FF14] text-2xl"
        >
          <Cpu className="h-12 w-12" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#39FF14]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Privacy Analysis</h1>
              <p className="text-gray-400">Scan any text for privacy risks and concerns</p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#39FF14]" />
                    <CardTitle className="text-white">Input Text</CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                  >
                    Load Sample
                  </Button>
                </div>
                <CardDescription className="text-gray-400">
                  Paste privacy policy, terms of service, or any text to analyze
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Paste the text you want to analyze..."
                  value={policyText}
                  onChange={(e) => setPolicyText(e.target.value)}
                  className="min-h-80 bg-black/50 border-green-500/30 text-white placeholder-gray-500 focus:border-[#39FF14] focus:shadow-[0_0_20px_rgba(57,255,20,0.3)]"
                />
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400"
                  >
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                  </motion.div>
                )}
                
                <Button
                  onClick={handleAnalyze}
                  disabled={processing || !policyText.trim()}
                  className="w-full mt-4 bg-[#39FF14] text-black hover:bg-[#32e60f] shadow-[0_0_20px_rgba(57,255,20,0.5)] disabled:opacity-50"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="inline-block"
                      >
                        ⏳
                      </motion.span>
                      Analyzing...
                    </span>
                  ) : (
                    <>
                      <Shield className="h-5 w-5 mr-2" />
                      Analyze Privacy Risks
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
            
            {/* Results Section */}
            <div>
              {processing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-96 bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-2xl"
                >
                  <RadarScanner size={200} />
                  <p className="text-[#39FF14] mt-4 animate-pulse">Scanning for privacy risks...</p>
                </motion.div>
              )}
              
              {!processing && !result && (
                <div className="flex flex-col items-center justify-center h-96 bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-2xl">
                  <Shield className="h-16 w-16 text-green-500/30 mb-4" />
                  <p className="text-gray-500 text-center max-w-sm">
                    Enter text and click analyze to see privacy risk analysis results
                  </p>
                </div>
              )}
              
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleShare}
                      variant="outline"
                      className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Results
                    </Button>
                    <Button
                      onClick={handleExportPDF}
                      variant="outline"
                      className="flex-1 border-green-500/50 text-green-400 hover:bg-green-500/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                  
                  <RiskGauge score={result.risk_score} />
                  
                  <ScanResultCard result={result} />
                  
                  {result.red_flags.length > 0 && (
                    <Card className="bg-black/60 backdrop-blur-xl border-red-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Red Flags Detected
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {result.red_flags.map((flag, index) => (
                            <RedFlagBadge key={index} flag={flag} />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  {result.recommendations.length > 0 && (
                    <Card className="bg-black/60 backdrop-blur-xl border-green-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-[#39FF14]" />
                          Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {result.recommendations.map((rec, index) => (
                            <li key={index} className="text-gray-300 flex items-start gap-2">
                              <span className="text-[#39FF14] mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
