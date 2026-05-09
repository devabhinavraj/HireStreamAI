
"use client"

import React from 'react';
import { 
  Lightbulb, 
  Search, 
  BookOpen, 
  Navigation, 
  Trophy, 
  TrendingUp,
  ExternalLink,
  Target,
  ArrowRight,
  BookMarked
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SkillGapPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Skill Gap Analysis</h1>
        <p className="text-muted-foreground">Identifying the bridge between your current expertise and your dream role.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border/50 bg-card/30 rounded-3xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-brand-purple" />
              Target Role: Senior AI Product Engineer
            </h3>
            <div className="space-y-8">
              {[
                { skill: 'Next.js & React Architecture', level: 95, status: 'Expert', color: 'bg-brand-purple' },
                { skill: 'Python (FastAPI / LangChain)', level: 45, status: 'Developing', color: 'bg-yellow-500' },
                { skill: 'Vector Databases (Pinecone/Postgres)', level: 30, status: 'Beginner', color: 'bg-brand-cyan' },
                { skill: 'Cloud Infrastructure (AWS/Vercel)', level: 75, status: 'Advanced', color: 'bg-blue-500' }
              ].map((item, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-sm font-bold block mb-1">{item.skill}</span>
                      <Badge className={cn("rounded-lg text-[10px] uppercase tracking-tighter", item.color + "/10 " + item.color.replace('bg-', 'text-'))}>{item.status}</Badge>
                    </div>
                    <span className="text-sm font-bold">{item.level}%</span>
                  </div>
                  <Progress value={item.level} className="h-2" />
                </div>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/30 rounded-3xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-cyan" />
                Recommended Courses
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Generative AI for Developers', platform: 'DeepLearning.AI', cost: 'Free' },
                  { title: 'Advanced Backend with FastAPI', platform: 'Udemy', cost: '$12.99' },
                  { title: 'Vector DB Architecture', platform: 'Pinecone Academy', cost: 'Free' }
                ].map((course, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-muted/50 border border-border/50 hover:border-brand-purple/30 transition-all cursor-pointer group">
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold leading-tight group-hover:text-brand-purple transition-colors">{course.title}</p>
                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-medium text-muted-foreground">
                      <span>{course.platform}</span>
                      <span className="text-brand-cyan font-bold">{course.cost}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border/50 bg-card/30 rounded-3xl p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-brand-purple" />
                Career Suggestions
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-brand-purple/5 border border-brand-purple/10">
                  <p className="text-sm italic">"Your strong frontend foundation combined with basic AI knowledge makes you a prime candidate for <strong>AI Interface Designer</strong> roles while you build full-stack AI skills."</p>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30">
                  <TrendingUp className="w-4 h-4 text-brand-cyan" />
                  <span className="text-xs font-medium">Demand for this path increased by 34% this month.</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="border-border/50 bg-purple-cyan text-white rounded-3xl p-8 relative overflow-hidden">
            <Trophy className="w-12 h-12 mb-4 opacity-50" />
            <h3 className="text-xl font-bold mb-2">Hireability Score</h3>
            <div className="text-5xl font-black mb-4">72/100</div>
            <p className="text-sm opacity-90 mb-6">You are just 3 core skills away from being in the top 5% of candidates for this role.</p>
            <Button variant="secondary" className="w-full rounded-xl font-bold">View Roadmap</Button>
          </Card>

          <Card className="border-border/50 bg-card/30 rounded-3xl p-6">
            <h3 className="font-bold mb-4">Learning Activity</h3>
            <div className="space-y-6">
              {[
                { label: 'Completed "LangChain 101"', time: '2 days ago' },
                { label: 'Started "Advanced Next.js"', time: '5 days ago' },
                { label: 'Bookmarked "Postgres Vector"', time: '1 week ago' }
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== 2 && <div className="absolute left-2 top-6 w-0.5 h-8 bg-border" />}
                  <div className="w-4 h-4 rounded-full bg-brand-purple shrink-0 mt-1" />
                  <div>
                    <p className="text-xs font-bold">{activity.label}</p>
                    <p className="text-[10px] text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
