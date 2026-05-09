"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Zap, Mail, User, ArrowRight, Loader2, Lock } from 'lucide-react';
import PasswordInput from '@/components/auth/PasswordInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import axios from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';

export default function SignupPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const router = useRouter();
  const login = useAuthStore(state => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log("🚀 Signup started with:", formData.email);

    try {
      console.log("📡 Sending request to backend...");
      const response = await axios.post('/api/auth/signup', formData);
      console.log("✅ Signup successful!", response.data);
      
      login(response.data.user, response.data.access_token);
      console.log("🏠 Redirecting to dashboard...");
      router.push('/dashboard');
    } catch (err: any) {
      console.error("❌ Signup error:", err);
      const errorMessage = err.response?.data?.detail || err.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log("🔄 Loading state reset.");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/10 blur-[120px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-cyan/10 blur-[120px] rounded-full -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-cyan flex items-center justify-center">
              <Zap className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-headline tracking-tight">HireStream<span className="gradient-text">AI</span></span>
          </Link>
          <h1 className="text-3xl font-bold font-headline mb-2">Create your account</h1>
          <p className="text-muted-foreground">Start hiring the top 1% with AI.</p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
          <CardHeader className="pt-8 px-8">
            <CardTitle className="text-xl">Get Started</CardTitle>
            <CardDescription>Enter your details below to create your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="fullName" 
                    placeholder="John Doe" 
                    className="pl-10 rounded-xl h-12 bg-muted/30 border-muted-foreground/20 focus:ring-brand-purple"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    className="pl-10 rounded-xl h-12 bg-muted/30 border-muted-foreground/20 focus:ring-brand-purple"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 rounded-xl h-12 bg-muted/30 border-muted-foreground/20 focus:ring-brand-purple"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 p-3 rounded-xl">
                  {error}
                </p>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-brand-purple hover:bg-brand-purple/90 font-bold transition-all"
                disabled={isLoading || !isPasswordValid}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="ml-2 w-4 h-4" /></>}
              </Button>
            </form>

            <div className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-brand-purple font-bold hover:underline">
                Login here
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
