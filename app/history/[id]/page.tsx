'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Shield, Calendar, AlertTriangle, CheckCircle, Info, FileText, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AnimatedBackground from '@/components/AnimatedBackground';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { getRiskGrade, getRiskLevel } from '@/lib/utils';
import { db } from '@/lib/firebase';

interface ScanData {
  id?: string;
  userId: string;
  text: string;
  risk_score: number;
  risk_level: string;
  red_flags?: string[];
  summary: string;
  grade: string;
  createdAt: any;
  detected_keywords?: string[];
  recommendations?: string[];
}

export default function ScanDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading, isInitialized } = useAuth();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Use ref for unsubscribe to avoid re-renders
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Fallback using getDoc
  const fallbackFetch = useCallback(async (scanId: string, userId: string) => {
    if (!mountedRef.current) return;
    
    try {
      console.log('Using fallback getDoc for scan:', scanId);
      const scanRef = doc(db, 'scans', scanId);
      const scanSnap = await getDoc(scanRef);
      
      if (scanSnap.exists()) {
        const data = scanSnap.data();
        
        if (data.userId !== userId) {
          setError('You do not have permission to view this scan');
          setDataLoading(false);
          return;
        }
        
        setScan({
          id: scanSnap.id,
          ...data,
        } as ScanData);
      } else {
        setError('Scan not found');
      }
    } catch (err) {
      console.error('Error fetching scan:', err);
      setError('Failed to load scan details');
    } finally {
      if (mountedRef.current) {
        setDataLoading(false);
      }
    }
  }, []);

  // Set up data fetching after auth is initialized
  useEffect(() => {
    // Reset mounted state
    mountedRef.current = true;

    if (!isInitialized || loading) {
      return;
    }

    const scanId = params?.id as string;
    
    if (!scanId) {
      console.error('No scan ID in params');
      setError('Invalid scan ID');
      setDataLoading(false);
      return;
    }

    if (!user) {
      console.log('No user, redirecting to login');
      router.push('/login');
      return;
    }

    console.log('Setting up scan data fetching');

    try {
      const scanRef = doc(db, 'scans', scanId);
      
      // Use onSnapshot for realtime updates
      const unsub = onSnapshot(scanRef, (scanSnap) => {
        if (!mountedRef.current) return;
        
        console.log('Firestore snapshot response exists:', scanSnap.exists());
        
        if (scanSnap.exists()) {
          const data = scanSnap.data();
          console.log('Scan data:', data);
          
          // Verify user owns this scan
          if (data.userId !== user.uid) {
            console.error('User does not own this scan');
            setError('You do not have permission to view this scan');
            setDataLoading(false);
            return;
          }
          
          setScan({
            id: scanSnap.id,
            ...data,
          } as ScanData);
          setDataLoading(false);
        } else {
          console.error('Scan not found in Firestore');
          setError('Scan not found');
          setDataLoading(false);
        }
      }, (err) => {
        console.error('Error in realtime subscription:', err);
        if (mountedRef.current) {
          fallbackFetch(scanId, user.uid);
        }
      });

      unsubscribeRef.current = unsub;
    } catch (err) {
      console.error('Error setting up subscription:', err);
      if (mountedRef.current) {
        fallbackFetch(scanId, user.uid);
      }
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      console.log('Cleaning up scan details listener');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isInitialized, loading, user, params, router, fallbackFetch]);

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
        return 'text-red-400 border-red-500/50 bg-red-500/10';
      case 'medium':
        return 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'text-green-400 border-green-500/50 bg-green-500/10';
      default:
        return 'text-gray-400 border-gray-500/50 bg-gray-500/10';
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

  if (error || !scan) {
    return (
      <div className="min-h-screen bg-black">
        <AnimatedBackground />
        <Navbar />
        <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
          <BackButton />
          <div className="text-center py-12">
            <p className="text-red-400">{error || 'Scan not found'}</p>
            <Button
              onClick={() => router.push('/history')}
              className="mt-4 bg-[#39FF14] text-black hover:bg-[#32e60f]"
            >
              Back to History
            </Button>
          </div>
        </div>
      </div>
    );
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
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Shield className="h-6 w-6 text-[#39FF14]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Scan Details</h1>
              <p className="text-gray-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(scan.createdAt)}
              </p>
            </div>
          </div>

          {/* Grade and Risk Level */}
          <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className={`text-6xl font-bold ${getGradeColor(getRiskGrade(scan.risk_score))}`}>
                  Grade {getRiskGrade(scan.risk_score)}
                </div>
                <div className={`p-4 rounded-lg border ${getRiskColor(getRiskLevel(scan.risk_score))}`}>
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="font-medium text-lg">{getRiskLevel(scan.risk_score)} Risk</span>
                  </div>
                  <p className="text-center text-3xl font-bold mt-2">{scan.risk_score}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Info className="h-5 w-5 text-[#39FF14]" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{scan.summary}</p>
            </CardContent>
          </Card>

          {/* Original Text */}
          <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#39FF14]" />
                Original Text
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 p-4 rounded-lg border border-green-500/20">
                <p className="text-gray-300 whitespace-pre-wrap">{scan.text}</p>
              </div>
            </CardContent>
          </Card>

          {/* Red Flags */}
          {scan.red_flags && scan.red_flags.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-xl border-red-500/30 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Red Flags Detected ({scan.red_flags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {scan.red_flags.map((flag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-red-500/20 border border-red-500/50 text-red-400 rounded-full"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {scan.recommendations && scan.recommendations.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-[#39FF14]" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {scan.recommendations.map((rec, index) => (
                    <li key={index} className="text-gray-300 flex items-start gap-2">
                      <span className="text-[#39FF14] mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Detected Keywords */}
          {scan.detected_keywords && scan.detected_keywords.length > 0 && (
            <Card className="bg-black/60 backdrop-blur-xl border-green-500/30 mt-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#39FF14]" />
                  Detected Keywords ({scan.detected_keywords.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {scan.detected_keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}
