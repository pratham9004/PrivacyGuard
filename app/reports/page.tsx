'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AnimatedBackground from '@/components/AnimatedBackground';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, FileText, Calendar, AlertTriangle, Download, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScanData {
  id?: string;
  userId: string;
  risk_score: number;
  risk_level: string;
  grade: string;
  summary: string;
  createdAt: any;
  detected_keywords?: string[];
}

export default function ReportsPage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [scans, setScans] = useState<ScanData[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !loading && !user) {
      router.push('/login');
    }
  }, [isInitialized, loading, user, router]);

  // Fetch user's scans
  useEffect(() => {
    if (!isInitialized || !user) return;

    const fetchScans = async () => {
      try {
        const scansRef = collection(db, 'scans');
        const q = query(
          scansRef,
          where('userId', '==', user.uid)
        );

        const querySnapshot = await getDocs(q);
        const scansData: ScanData[] = [];

        querySnapshot.forEach((doc) => {
          scansData.push({
            id: doc.id,
            ...doc.data(),
          } as ScanData);
        });

        // Sort by date (newest first)
        scansData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        setScans(scansData);
        setLoadingScans(false);
      } catch (error) {
        console.error('Error fetching scans:', error);
        setLoadingScans(false);
      }
    };

    fetchScans();
  }, [isInitialized, user]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
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
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#39FF14]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Reports</h1>
              <p className="text-gray-400">View and download your analysis reports</p>
            </div>
          </div>

          {loadingScans ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin h-8 w-8 border-2 border-[#39FF14] border-t-transparent rounded-full"></div>
            </div>
          ) : scans.length === 0 ? (
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white">No Reports Yet</CardTitle>
                <CardDescription className="text-gray-400">
                  You haven't analyzed any privacy policies yet.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/analyze">
                  <Button className="bg-[#39FF14] hover:bg-[#32c911] text-black">
                    <Shield className="h-4 w-4 mr-2" />
                    Analyze Your First Policy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {scans.map((scan, index) => (
                <Link key={scan.id} href={`/reports/${scan.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 hover:border-[#39FF14] transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`text-3xl font-bold ${getGradeColor(scan.grade)}`}>
                              {scan.grade}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-semibold ${getRiskColor(scan.risk_level)}`}>
                                  {scan.risk_level} Risk
                                </span>
                                <span className="text-gray-500">•</span>
                                <span className="text-gray-400 text-sm">
                                  Score: {scan.risk_score}
                                </span>
                              </div>
                              <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                                {scan.summary}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-gray-400 text-sm">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(scan.createdAt)}</span>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
