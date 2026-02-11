'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { History, Shield, Calendar, FileText, Trash2, ExternalLink, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getUserScans, deleteScan, subscribeToUserScans, ScanData } from '@/lib/firestore';
import { getRiskGrade, getRiskLevel } from '@/lib/utils';

export default function HistoryPage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [analyses, setAnalyses] = useState<ScanData[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Use ref for unsubscribe to avoid re-renders
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !loading && !user) {
      router.push('/login');
    }
  }, [isInitialized, loading, user, router]);

  // Fetch data function - defined once, doesn't depend on state setters
  const fetchData = useCallback(async () => {
    if (!user || !mountedRef.current) return;

    try {
      setDataLoading(true);
      console.log('Fetching scans for user:', user.uid);
      
      // Immediate fetch
      const scans = await getUserScans(user.uid);
      if (mountedRef.current) {
        setAnalyses(scans);
        console.log('Initial fetch completed:', scans.length, 'scans');
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      if (mountedRef.current) {
        setDataLoading(false);
      }
    }
  }, [user]);

  // Subscribe to realtime updates
  const subscribeToData = useCallback(() => {
    if (!user) return null;

    const unsub = subscribeToUserScans(user.uid, (scans) => {
      if (mountedRef.current) {
        console.log('Realtime update received:', scans.length, 'scans');
        setAnalyses(scans);
        setDataLoading(false);
      }
    });

    return unsub;
  }, [user]);

  // Set up data fetching after auth is initialized
  useEffect(() => {
    // Reset mounted state
    mountedRef.current = true;

    if (!isInitialized || !user) {
      return;
    }

    console.log('Setting up history data fetching');

    // First, do an immediate fetch
    fetchData();

    // Then subscribe to realtime updates
    unsubscribeRef.current = subscribeToData();

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      console.log('Cleaning up history listener');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isInitialized, user, fetchData, subscribeToData]);

  const handleDelete = async (scanId: string) => {
    if (!user || !confirm('Are you sure you want to delete this scan?')) return;
    
    try {
      setDeletingId(scanId);
      await deleteScan(scanId, user.uid);
      console.log('Scan deleted, waiting for realtime update...');
    } catch (error) {
      console.error('Error deleting scan:', error);
      alert('Failed to delete scan');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-[#39FF14]';
      case 'B':
        return 'text-green-400';
      case 'C':
        return 'text-green-400';
      case 'D':
        return 'text-yellow-400';
      case 'F':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Show loading while auth is initializing
  if (loading || !isInitialized) {
    return (
      <div className="min-h-screen bg-black">
        <AnimatedBackground />
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="text-[#39FF14] text-2xl"
          >
            <Cpu className="h-12 w-12" />
          </motion.div>
        </div>
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
      
      <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
        <BackButton />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <History className="h-6 w-6 text-[#39FF14]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Analysis History</h1>
              <p className="text-gray-400">View your previous privacy scans</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {analyses.map((analysis, index) => (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.01, y: -2 }}
              >
                <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 hover:border-[#39FF14] transition-all">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                          <Shield className="h-6 w-6 text-[#39FF14]" />
                        </div>
                        <div>
                          <CardTitle className="text-white flex items-center gap-3">
                            Analysis Result
                            <span className={`text-2xl font-bold ${getGradeColor(getRiskGrade(analysis.risk_score))}`}>
                              Grade {getRiskGrade(analysis.risk_score)}
                            </span>
                          </CardTitle>
                          <CardDescription className="text-gray-400 flex items-center gap-2 mt-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(analysis.createdAt)}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full border ${getRiskColor(getRiskLevel(analysis.risk_score))}`}>
                          {getRiskLevel(analysis.risk_score)} Risk
                        </span>
                        <span className="text-white font-mono">
                          {analysis.risk_score}/100
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 mb-4">{analysis.summary}</p>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analysis.id && router.push(`/history/${analysis.id}`)}
                        className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => analysis.id && handleDelete(analysis.id)}
                        disabled={deletingId === analysis.id}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingId === analysis.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          {analyses.length === 0 && !dataLoading && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-green-500/30 mx-auto mb-4" />
              <p className="text-gray-400">No analysis history yet</p>
              <Button
                onClick={() => router.push('/analyze')}
                className="mt-4 bg-[#39FF14] text-black hover:bg-[#32e60f]"
              >
                Start Your First Analysis
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
