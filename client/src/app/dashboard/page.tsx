
"use client"

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Target, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const [healthBars, setHealthBars] = useState<boolean[]>([]);

  useEffect(() => {
    // Generate random health pulse states only on the client to avoid hydration mismatch
    setHealthBars([...Array(20)].map(() => Math.random() > 0.1));
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Welcome Back, John</h1>
          <p className="text-muted-foreground">Here's what's happening with your recruitment funnel today.</p>
        </div>
        <div className="flex gap-2">
          <Card className="bg-brand-purple/5 border-brand-purple/20 py-2 px-4 rounded-2xl flex items-center gap-2">
            <TrendingUp className="text-brand-purple w-4 h-4" />
            <span className="text-sm font-bold text-brand-purple">+12% performance</span>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Candidates', value: '2,845', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Resumes Parsed', value: '14,209', icon: FileText, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          { label: 'Job Matches', value: '458', icon: Target, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
          { label: 'Active Jobs', value: '24', icon: Briefcase, color: 'text-orange-500', bg: 'bg-orange-500/10' }
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/30 rounded-3xl group hover:border-brand-purple/50 transition-all">
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
        <Card className="lg:col-span-2 border-border/50 bg-card/30 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Candidates</CardTitle>
            <span className="text-xs text-brand-purple font-bold hover:underline cursor-pointer">View all</span>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: 'Alex Thompson', role: 'Senior React Developer', score: 94, date: '2 hours ago' },
                { name: 'Maria Garcia', role: 'Product Designer', score: 88, date: '4 hours ago' },
                { name: 'James Wilson', role: 'DevOps Engineer', score: 76, date: '6 hours ago' },
                { name: 'Linda Chen', role: 'Data Scientist', score: 91, date: '1 day ago' }
              ].map((candidate, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold">
                      {candidate.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="hidden md:block w-24">
                      <div className="flex justify-between text-[10px] mb-1 font-bold">
                        <span>Match</span>
                        <span>{candidate.score}%</span>
                      </div>
                      <Progress value={candidate.score} className="h-1.5" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3" /> {candidate.date}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/30 rounded-3xl overflow-hidden">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-muted-foreground">AI Accuracy</span>
                <span className="font-bold">99.8%</span>
              </div>
              <Progress value={99.8} className="h-2 bg-brand-cyan/10" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-muted-foreground">Processing Speed</span>
                <span className="font-bold">1.2s / resume</span>
              </div>
              <Progress value={85} className="h-2 bg-brand-purple/10" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-muted-foreground">Database Sync</span>
                <span className="font-bold">Active</span>
              </div>
              <div className="w-full h-12 bg-muted/50 rounded-xl flex items-center justify-center">
                <div className="flex gap-1">
                  {(healthBars.length > 0 ? healthBars : [...Array(20)].fill(false)).map((isActive, i) => (
                    <div key={i} className={cn(
                      "w-1 h-4 rounded-full transition-colors duration-500",
                      isActive ? "bg-brand-cyan animate-pulse" : "bg-muted-foreground/30"
                    )} />
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-4">
              <div className="bg-brand-purple/10 border border-brand-purple/20 p-4 rounded-2xl">
                <p className="text-xs font-bold text-brand-purple mb-1">New Feature Available</p>
                <p className="text-[10px] text-brand-purple/80 mb-3">Check out our new side-by-side comparison tool in the recruiter panel.</p>
                <Button size="sm" variant="link" className="p-0 h-auto text-xs text-brand-purple font-bold">Learn more →</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
