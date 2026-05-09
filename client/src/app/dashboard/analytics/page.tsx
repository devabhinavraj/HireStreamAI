"use client"

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Calendar,
  Filter,
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/lib/axios';

const COLORS = ['#9B99FE', '#2BC8B7', '#71717A', '#18181B', '#E4E4E7'];

export default function AnalyticsPage() {
  const [userGrowth, setUserGrowth] = useState([]);
  const [resumeStats, setResumeStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [growthRes, resumeRes] = await Promise.all([
          axiosInstance.get('/api/analytics/user-growth'),
          axiosInstance.get('/api/analytics/resume-stats')
        ]);
        setUserGrowth(growthRes.data);
        setResumeStats(resumeRes.data);
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin h-12 w-12 text-brand-purple" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Recruitment Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your candidate pool and hiring efficiency.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl gap-2 backdrop-blur-xl bg-white/5 border-white/10">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-brand-purple rounded-xl gap-2 shadow-lg shadow-brand-purple/20">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl p-6">
          <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Platform Growth (Users)</CardTitle>
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
              <Button size="sm" variant="ghost" className="h-7 text-[10px] rounded-lg bg-background shadow-sm">6 Months</Button>
              <Button size="sm" variant="ghost" className="h-7 text-[10px] rounded-lg">1 Year</Button>
            </div>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowth}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9B99FE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9B99FE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717A'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717A'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="users" stroke="#9B99FE" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg">Daily Upload Statistics</CardTitle>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={resumeStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717A'}} />
                <YAxis axisLine={false} hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="uploads" fill="#2BC8B7" radius={[10, 10, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Weekly Peak</span>
                <span className="text-lg font-bold text-brand-cyan">Thursday</span>
            </div>
          </div>
        </Card>

        <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl p-6 lg:col-span-3">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="p-6 rounded-[2rem] bg-brand-purple/10 flex items-center justify-center shrink-0">
                 <TrendingUp className="w-12 h-12 text-brand-purple" />
              </div>
              <div className="flex-1">
                 <h3 className="text-2xl font-bold mb-2">AI Matching Insights</h3>
                 <p className="text-muted-foreground leading-relaxed">
                    Our current model processing speed is averaging **1.2s per resume** with a **99.8% extraction accuracy**. 
                    User engagement on suggested jobs has increased by **24%** this month.
                 </p>
                 <div className="flex flex-wrap gap-8 mt-6">
                    <div className="flex flex-col">
                       <span className="text-3xl font-bold text-brand-purple">1.2s</span>
                       <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Processing Speed</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-3xl font-bold text-brand-cyan">99.8%</span>
                       <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">AI Accuracy</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-3xl font-bold text-orange-500">+24%</span>
                       <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Engagement Rate</span>
                    </div>
                 </div>
              </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
