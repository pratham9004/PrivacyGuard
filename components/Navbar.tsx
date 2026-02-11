import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Shield, Menu, X, User, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-green-500/30 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#39FF14]" />
              <span className="text-xl font-bold text-[#39FF14]">PrivacyGuard</span>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-green-500/30 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-[#39FF14] animate-pulse" />
              <span className="text-xl font-bold text-[#39FF14] tracking-wider">PrivacyGuard</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link href="/" className="text-gray-300 hover:text-[#39FF14] transition-colors">
                  Home
                </Link>
                <Link href="/dashboard" className="text-gray-300 hover:text-[#39FF14] transition-colors">
                  Dashboard
                </Link>
                <Link href="/analyze" className="text-gray-300 hover:text-[#39FF14] transition-colors">
                  Analyze
                </Link>
                <Link href="/history" className="text-gray-300 hover:text-[#39FF14] transition-colors">
                  History
                </Link>
                <Link href="/profile" className="text-gray-300 hover:text-[#39FF14] transition-colors">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 text-[#39FF14] rounded-lg hover:bg-green-500/30 transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-[#39FF14] transition-colors">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#32e60f] transition-all shadow-[0_0_20px_rgba(57,255,20,0.5)]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
          
          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-green-500/30 bg-black/90 backdrop-blur-md"
        >
          <div className="px-4 py-4 space-y-3">
            {user ? (
              <>
                <Link href="/" className="block text-gray-300 hover:text-[#39FF14] py-2">
                  Home
                </Link>
                <Link href="/dashboard" className="block text-gray-300 hover:text-[#39FF14] py-2">
                  Dashboard
                </Link>
                <Link href="/analyze" className="block text-gray-300 hover:text-[#39FF14] py-2">
                  Analyze
                </Link>
                <Link href="/history" className="block text-gray-300 hover:text-[#39FF14] py-2">
                  History
                </Link>
                <Link href="/profile" className="block text-gray-300 hover:text-[#39FF14] py-2">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 bg-green-500/20 border border-green-500/50 text-[#39FF14] rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-300 hover:text-[#39FF14] py-2">
                  Login
                </Link>
                <Link href="/register" className="block text-center px-4 py-2 bg-[#39FF14] text-black font-semibold rounded-lg">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
