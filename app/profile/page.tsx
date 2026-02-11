'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Settings, LogOut, Bell, Lock, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import AnimatedBackground from '@/components/AnimatedBackground';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    router.push('/login');
    return null;
  }

  const userStats = [
    { label: 'Total Scans', value: '24' },
    { label: 'Member Since', value: 'Jan 2024' },
    { label: 'Saved Reports', value: '12' },
  ];

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
            <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <User className="h-8 w-8 text-[#39FF14]" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Profile</h1>
              <p className="text-gray-400">Manage your PrivacyGuard account</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Account Info */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer"
            >
              <h3 className="text-white flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-[#39FF14]" />
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <span className="text-white">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Shield className="h-5 w-5 text-gray-400" />
                  <span className="text-white">Email Verified</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <Cpu className="h-5 w-5 text-gray-400" />
                  <span className="text-white">{user.uid.slice(0, 8)}...{user.uid.slice(-8)}</span>
                </div>
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer"
            >
              <h3 className="text-white flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-[#39FF14]" />
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {userStats.map((stat) => (
                  <div key={stat.label} className="p-4 bg-green-500/10 rounded-lg border border-green-500/20 text-center">
                    <p className="text-3xl font-bold text-[#39FF14]">{stat.value}</p>
                    <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Settings */}
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all cursor-pointer md:col-span-2"
            >
              <h3 className="text-white flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-[#39FF14]" />
                Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-gray-400" />
                    <span className="text-white">Email Notifications</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <span className="text-white">Two-Factor Authentication</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                    Enable
                  </Button>
                </div>
              </div>
            </motion.div>
            
            {/* Logout Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="md:col-span-2"
            >
              <Button
                onClick={handleLogout}
                className="w-full py-3 bg-red-500/20 border border-red-500/50 text-red-400 font-semibold rounded-lg hover:bg-red-500/30 transition-all"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign Out
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
