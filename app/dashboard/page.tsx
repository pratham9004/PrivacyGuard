'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, History, User, TrendingUp, Cpu, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AnimatedBackground from '@/components/AnimatedBackground';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ScanData {
  id?: string;
  userId: string;
  risk_score: number;
  risk_level: string;
  createdAt: any;
}

export default function DashboardPage() {
  const { user, loading, isInitialized } = useAuth();
  const router = useRouter();
  const [totalScans, setTotalScans] = useState(0);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [mediumRiskCount, setMediumRiskCount] = useState(0);
  const [lowRiskCount, setLowRiskCount] = useState(0);
  const [lastScanDate, setLastScanDate] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Use ref for unsubscribe to avoid re-renders
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !loading && !user) {
      router.push('/login');
    }
  }, [isInitialized, loading, user, router]);

  // Fallback function using getDocs
  const fetchStatsFallback = useCallback(async () => {
    if (!user || !mountedRef.current) return;

    console.log('Using fallback getDocs method');
    
    try {
      const scansRef = collection(db, 'scans');
      const q = query(
        scansRef,
        where('userId', '==', user.uid)
      );

      const querySnapshot = await getDocs(q);
      console.log('Fallback fetched:', querySnapshot.size, 'documents');

      let total = 0;
      let high = 0;
      let medium = 0;
      let low = 0;
      let lastDate: any = null;

      querySnapshot.forEach((doc) => {
        const data = doc.data() as ScanData;
        total++;
        
        if (data.risk_level === 'High') {
          high++;
        } else if (data.risk_level === 'Medium') {
          medium++;
        } else if (data.risk_level === 'Low') {
          low++;
        }

        if (data.createdAt) {
          if (!lastDate) {
            lastDate = data.createdAt;
          } else {
            const currentTime = data.createdAt.toMillis?.() || data.createdAt;
            const lastTime = lastDate.toMillis?.() || lastDate;
            if (currentTime > lastTime) {
              lastDate = data.createdAt;
            }
          }
        }
      });

      if (mountedRef.current) {
        setTotalScans(total);
        setHighRiskCount(high);
        setMediumRiskCount(medium);
        setLowRiskCount(low);
        setLastScanDate(lastDate);
        setDataLoading(false);
      }
    } catch (error) {
      console.error('Fallback also failed:', error);
      if (mountedRef.current) {
        setDataLoading(false);
      }
    }
  }, [user]);

  // Set up data fetching after auth is initialized
  useEffect(() => {
    // Reset mounted state
    mountedRef.current = true;

    if (!isInitialized || !user) {
      return;
    }

    console.log('Setting up dashboard data fetching');

    try {
      const scansRef = collection(db, 'scans');
      const q = query(
        scansRef,
        where('userId', '==', user.uid)
      );

      // Use onSnapshot for realtime updates
      const unsub = onSnapshot(q, (snapshot) => {
        if (!mountedRef.current) return;
        
        console.log('Dashboard received snapshot:', snapshot.size, 'documents');
        
        let total = 0;
        let high = 0;
        let medium = 0;
        let low = 0;
        let lastDate: any = null;

        snapshot.forEach((doc) => {
          const data = doc.data() as ScanData;
          total++;
          
          if (data.risk_level === 'High') {
            high++;
          } else if (data.risk_level === 'Medium') {
            medium++;
          } else if (data.risk_level === 'Low') {
            low++;
          }

          // Track last scan date
          if (data.createdAt) {
            if (!lastDate) {
              lastDate = data.createdAt;
            } else {
              const currentTime = data.createdAt.toMillis?.() || data.createdAt;
              const lastTime = lastDate.toMillis?.() || lastDate;
              if (currentTime > lastTime) {
                lastDate = data.createdAt;
              }
            }
          }
        });

        console.log('Calculated stats:', { total, high, medium, low });
        
        setTotalScans(total);
        setHighRiskCount(high);
        setMediumRiskCount(medium);
        setLowRiskCount(low);
        setLastScanDate(lastDate);
        setDataLoading(false);
      }, (error) => {
        console.error('Error in dashboard snapshot:', error);
        if (mountedRef.current) {
          fetchStatsFallback();
        }
      });

      unsubscribeRef.current = unsub;
    } catch (error) {
      console.error('Error setting up dashboard listener:', error);
      if (mountedRef.current) {
        fetchStatsFallback();
      }
    }

    // Cleanup on unmount
    return () => {
      mountedRef.current = false;
      console.log('Cleaning up dashboard listener');
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [isInitialized, user, fetchStatsFallback]);

  const formatLastScanDate = (timestamp: any) => {
    if (!timestamp) return 'No scans yet';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString();
    } catch {
      return 'Unknown';
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
          <Cpu className="h-12 w-12" />
        </motion.div>
      </div>
    );
  }
  
  if (!user) return null;

  const statsData = [
    { label: 'Total Scans', value: dataLoading ? '...' : totalScans.toString() },
    { label: 'High Risk', value: dataLoading ? '...' : highRiskCount.toString() },
    { label: 'Medium Risk', value: dataLoading ? '...' : mediumRiskCount.toString() },
    { label: 'Low Risk', value: dataLoading ? '...' : lowRiskCount.toString() },
  ];

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
              <h1 className="text-4xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Welcome back, {user.email}</p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsData.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#39FF14] opacity-50" />
                </div>
                {stat.label === 'Total Scans' && !dataLoading && (
                  <div className="flex items-center gap-1 mt-2 text-green-400 text-sm">
                    <Calendar className="h-3 w-3" />
                    <span>Last: {formatLastScanDate(lastScanDate)}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* Quick Actions */}
          <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/analyze">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-[#39FF14]" />
                </div>
                <CardTitle className="text-white mb-2">Analyze Policy</CardTitle>
                <CardDescription className="text-gray-400">
                  Upload and analyze a privacy policy
                </CardDescription>
              </motion.div>
            </Link>
            
            <Link href="/history">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <History className="h-6 w-6 text-[#39FF14]" />
                </div>
                <CardTitle className="text-white mb-2">Analysis History</CardTitle>
                <CardDescription className="text-gray-400">
                  View previous analyses
                </CardDescription>
              </motion.div>
            </Link>
            
            <Link href="/profile">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-[#39FF14]" />
                </div>
                <CardTitle className="text-white mb-2">Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account settings
                </CardDescription>
              </motion.div>
            </Link>
            
            <Link href="/reports">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-[#39FF14]" />
              </div>
              <CardTitle className="text-white mb-2">Reports</CardTitle>
              <CardDescription className="text-gray-400">
                Generate detailed reports
              </CardDescription>
            </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
