"use client"

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Target, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  Briefcase,
  Activity as ActivityIcon,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import axiosInstance from '@/lib/axios';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface DashboardStats {
  totalUsers: number;
  totalResumes: number;
  totalAnalyses: number;
  activeSubscriptions: number;
  recentActivities: any[];
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentResumes, setRecentResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          axiosInstance.get('/api/analytics/dashboard-stats'),
          axiosInstance.get('/api/resumes/history?limit=4')
        ]);
        setStats(statsRes.data);
        setRecentResumes(historyRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-purple"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Platform Users', value: stats?.totalUsers.toLocaleString() || '0', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Your Resumes', value: user?.resumeCount.toString() || '0', icon: FileText, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
    { label: 'ATS Avg Score', value: `${user?.atsAverageScore.toFixed(1) || '0'}%`, icon: Target, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
    { label: 'Active Jobs', value: '458', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome Back, {user?.fullName.split(' ')[0]}</h1>
          <p className="text-muted-foreground">Here's your real-time recruitment and ATS performance overview.</p>
        </div>
        <div className="flex gap-2">
          <Card className="bg-brand-purple/5 border-brand-purple/20 py-2 px-4 rounded-2xl flex items-center gap-2">
            <TrendingUp className="text-brand-purple w-4 h-4" />
            <span className="text-sm font-bold text-brand-purple">
              {user?.subscriptionPlan.toUpperCase()} PLAN
            </span>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl group hover:border-brand-purple/50 transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
            <CardTitle className="text-xl">Recent Resumes</CardTitle>
            <Link href="/dashboard/resume-analyzer">
              <span className="text-xs text-brand-purple font-bold hover:underline cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </span>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {recentResumes.length > 0 ? (
              <div className="divide-y divide-border/10">
                {recentResumes.map((resume, i) => (
                  <div key={i} className="flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center font-bold text-brand-purple group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{resume.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(resume.createdAt))} ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="hidden md:block w-32">
                        <div className="flex justify-between text-[10px] mb-1.5 font-bold uppercase tracking-wider">
                          <span className="text-muted-foreground">ATS Score</span>
                          <span className="text-brand-cyan">{resume.atsScore.toFixed(0)}%</span>
                        </div>
                        <Progress value={resume.atsScore} className="h-1.5 bg-brand-cyan/10" />
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">No resumes yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Upload your first resume to see ATS insights.</p>
                <Link href="/dashboard/resume-analyzer">
                  <Button className="rounded-2xl bg-brand-purple hover:bg-brand-purple/90">Upload Resume</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="border-b border-border/10 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-brand-cyan" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/10">
                {stats?.recentActivities.slice(0, 5).map((activity, i) => (
                  <div key={i} className="p-4 hover:bg-white/5 transition-all">
                    <div className="flex gap-3">
                      <div className="mt-1">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          activity.type === 'login' ? "bg-green-500" : 
                          activity.type === 'upload' ? "bg-brand-purple" : "bg-blue-500"
                        )} />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none mb-1">{activity.description}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.createdAt))} ago
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-brand-gradient text-white rounded-3xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 transition-transform duration-500">
              <Target className="w-32 h-32" />
            </div>
            <CardContent className="p-8 relative z-10">
              <h3 className="text-2xl font-bold mb-2">Upgrade to Pro</h3>
              <p className="text-white/80 text-sm mb-6 max-w-[200px]">Get unlimited resume uploads and advanced AI career insights.</p>
              <Button variant="secondary" className="rounded-2xl font-bold px-8 bg-white text-brand-purple hover:bg-white/90 border-none shadow-xl">
                Explore Plans
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
