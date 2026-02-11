'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Search, Lock, AlertTriangle, CheckCircle, ArrowRight, Cpu, Eye, Database } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import RadarScanner from '@/components/RadarScanner';

export default function LandingPage() {
  const features = [
    {
      icon: Search,
      title: 'Deep Privacy Scan',
      description: 'Advanced NLP analysis to detect privacy risks in any text or document',
    },
    {
      icon: AlertTriangle,
      title: 'Red Flag Detection',
      description: 'Instant identification of sensitive data collection and sharing practices',
    },
    {
      icon: Shield,
      title: 'Risk Scoring',
      description: 'Comprehensive risk assessment with weighted scoring system',
    },
    {
      icon: Lock,
      title: 'Secure Analysis',
      description: 'Your data never leaves our secure, encrypted environment',
    },
  ];

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <AnimatedBackground />
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-[#39FF14] text-sm mb-6"
              >
                <Cpu className="h-4 w-4" />
                AI-Powered Privacy Analysis
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Protect Your Privacy with{' '}
                <span className="text-[#39FF14]">AI Precision</span>
              </h1>
              
              <p className="text-xl text-gray-400 mb-8">
                Advanced NLP-powered analysis to detect privacy risks in policies, 
                documents, and communications. Get instant risk scores and actionable insights.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#32e60f] transition-all shadow-[0_0_30px_rgba(57,255,20,0.5)]"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-500/20 border border-green-500/50 text-[#39FF14] font-semibold rounded-lg hover:bg-green-500/30 transition-all"
                >
                  Try Demo
                </Link>
              </div>
              
              <div className="flex items-center gap-8 mt-10">
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle className="h-5 w-5 text-[#39FF14]" />
                  <span>Free Tier Available</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <CheckCircle className="h-5 w-5 text-[#39FF14]" />
                  <span>No Credit Card Required</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#39FF14] blur-[100px] opacity-20" />
                <RadarScanner size={350} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Advanced Privacy Protection
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features to analyze and protect your privacy across all digital communications
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 hover:border-[#39FF14] transition-all group"
              >
                <div className="w-14 h-14 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#39FF14]/20 transition-all">
                  <feature.icon className="h-7 w-7 text-[#39FF14]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              How PrivacyGuard Works
            </h2>
            <p className="text-xl text-gray-400">
              Three simple steps to analyze your privacy risks
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Paste Your Text', desc: 'Copy privacy policies, terms, or any text you want to analyze' },
              { step: '02', title: 'AI Analysis', desc: 'Our NLP engine scans for keywords and calculates risk scores' },
              { step: '03', title: 'Get Results', desc: 'Receive detailed reports with risk levels and recommendations' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative"
              >
                <div className="bg-black/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-8 text-center h-full">
                  <span className="text-6xl font-bold text-[#39FF14] opacity-20">{item.step}</span>
                  <h3 className="text-xl font-semibold text-white mt-4 mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-[#39FF14]" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500/20 to-[#39FF14]/10 border border-green-500/30 rounded-2xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#39FF14] blur-[100px] opacity-10" />
            <div className="relative z-10">
              <Shield className="h-16 w-16 text-[#39FF14] mx-auto mb-6" />
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Secure Your Privacy?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                Join thousands of users who trust PrivacyGuard for their privacy analysis needs.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#39FF14] text-black font-semibold rounded-lg hover:bg-[#32e60f] transition-all shadow-[0_0_30px_rgba(57,255,20,0.5)]"
              >
                Start Free Analysis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-green-500/20 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#39FF14]" />
            <span className="text-lg font-bold text-white">PrivacyGuard</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 PrivacyGuard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
