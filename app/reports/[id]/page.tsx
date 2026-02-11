'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Calendar, AlertTriangle, Download, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportReportAsTxt } from '@/lib/exportTxt';
import { exportReportAsPdf } from '@/lib/exportPdf';

interface ReportData {
  id?: string;
  userId: string;
  risk_score: number;
  risk_level: string;
  grade: string;
  summary: string;
  red_flags: string[];
  detected_keywords: string[];
  recommendations: string[];
  original_text?: string;
  createdAt: any;
  analyzed_at?: string;
}

export default function ReportDetailPage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [report, setReport] = useState<ReportData | null>(null);
  const [loadingReport, setLoadingReport] = useState(true);

  const scanId = params?.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !loading && !user) {
      router.push('/login');
    }
  }, [isInitialized, loading, user, router]);

  // Fetch report data
  useEffect(() => {
    if (!isInitialized || !user || !scanId) return;

    const fetchReport = async () => {
      try {
        const scanRef = doc(db, 'scans', scanId);
        const scanSnap = await getDoc(scanRef);

        if (scanSnap.exists()) {
          const data = scanSnap.data() as ReportData;
          setReport({
            id: scanSnap.id,
            ...data,
            analyzed_at: data.createdAt?.toDate?.().toISOString() || new Date().toISOString()
          });
        } else {
          router.push('/reports');
        }
        setLoadingReport(false);
      } catch (error) {
        console.error('Error fetching report:', error);
        setLoadingReport(false);
        router.push('/reports');
      }
    };

    fetchReport();
  }, [isInitialized, user, scanId, router]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-yellow-500';
      case 'Low': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-lime-500';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getGradeBgColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500/20 border-green-500/50';
      case 'B': return 'bg-lime-500/20 border-lime-500/50';
      case 'C': return 'bg-yellow-500/20 border-yellow-500/50';
      case 'D': return 'bg-orange-500/20 border-orange-500/50';
      case 'F': return 'bg-red-500/20 border-red-500/50';
      default: return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const handleExportTxt = () => {
    if (report) {
      exportReportAsTxt(report);
    }
  };

  const handleExportPdf = () => {
    if (report) {
      exportReportAsPdf(report);
    }
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
          <Shield className="h-12 w-12" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  if (loadingReport) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-[#39FF14] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 max-w-5xl mx-auto">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-xl flex items-center justify-center border-2 ${getGradeBgColor(report.grade)}`}>
                <span className={`text-4xl font-bold ${getGradeColor(report.grade)}`}>
                  {report.grade}
                </span>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">Analysis Report</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`font-semibold ${getRiskColor(report.risk_level)}`}>
                    {report.risk_level} Risk
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">
                    Score: {report.risk_score}/100
                  </span>
                  <span className="text-gray-500">•</span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {formatDate(report.createdAt)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportTxt}
                variant="outline"
                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
              >
                <FileText className="h-4 w-4 mr-2" />
                TXT
              </Button>
              <Button
                onClick={handleExportPdf}
                className="bg-[#39FF14] hover:bg-[#32c911] text-black"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#39FF14]" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{report.summary}</p>
            </CardContent>
          </Card>

          {/* Detected Keywords */}
          {report.detected_keywords && report.detected_keywords.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Detected Keywords</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.detected_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Red Flags */}
          {report.red_flags && report.red_flags.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-xl border-red-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Red Flags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {report.red_flags.map((flag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {report.recommendations && report.recommendations.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {report.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 bg-[#39FF14]/20 rounded-full flex items-center justify-center text-[#39FF14] text-sm font-bold">
                        {index + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Original Text */}
          {report.original_text && (
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white">Original Analyzed Text</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-black/40 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-gray-400 whitespace-pre-wrap">{report.original_text}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
