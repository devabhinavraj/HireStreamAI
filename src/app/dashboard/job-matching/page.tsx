
"use client"

import React, { useState } from 'react';
import { 
  Target, 
  Search, 
  Filter, 
  MapPin, 
  DollarSign, 
  Briefcase,
  ChevronRight,
  Sparkles,
  Zap,
  Bookmark
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const mockJobs = [
  { id: '1', company: 'Linear', role: 'Senior Product Engineer', score: 98, skills: ['React', 'Next.js', 'PostgreSQL'], salary: '$160k - $220k', type: 'Remote' },
  { id: '2', company: 'Vercel', role: 'Frontend Architect', score: 94, skills: ['Turbo', 'Rust', 'Edge Functions'], salary: '$180k - $240k', type: 'San Francisco' },
  { id: '3', company: 'Stripe', role: 'Full Stack Developer', score: 89, skills: ['Ruby', 'Java', 'React'], salary: '$150k - $210k', type: 'Remote' },
  { id: '4', company: 'OpenAI', role: 'AI Applications Engineer', score: 85, skills: ['Python', 'LLMs', 'TypeScript'], salary: '$200k - $300k', type: 'San Francisco' },
  { id: '5', company: 'Airbnb', role: 'Senior UX Engineer', score: 82, skills: ['Framer Motion', 'React', 'A11y'], salary: '$140k - $190k', type: 'Remote' },
  { id: '6', company: 'Github', role: 'Core Platform Engineer', score: 78, skills: ['Go', 'Kubernetes', 'CI/CD'], salary: '$170k - $230k', type: 'Remote' },
];

export default function JobMatchingPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">AI Job Matching</h1>
          <p className="text-muted-foreground">Recommended positions based on your parsed profile and skills.</p>
        </div>
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
          <Button size="sm" variant="ghost" className="rounded-lg h-8 text-xs bg-background shadow-sm">Relevant</Button>
          <Button size="sm" variant="ghost" className="rounded-lg h-8 text-xs">Newest</Button>
          <Button size="sm" variant="ghost" className="rounded-lg h-8 text-xs">Salary</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search roles, companies, or technologies..." 
            className="pl-10 h-12 bg-card/50 rounded-2xl border-none focus-visible:ring-1 focus-visible:ring-brand-purple"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="h-12 rounded-2xl gap-2 px-6 border-border/50">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {mockJobs.filter(j => j.role.toLowerCase().includes(searchTerm.toLowerCase()) || j.company.toLowerCase().includes(searchTerm.toLowerCase())).map((job) => (
          <Card key={job.id} className="group border-border/50 bg-card/30 rounded-[2.5rem] overflow-hidden hover:border-brand-purple/50 transition-all p-1">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-brand-purple/10 flex items-center justify-center shrink-0">
                    <Briefcase className="w-8 h-8 text-brand-purple" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{job.role}</h3>
                      <Badge className="bg-brand-cyan/10 text-brand-cyan border-none rounded-lg text-[10px] font-bold">New</Badge>
                    </div>
                    <p className="text-muted-foreground font-medium mb-3">{job.company}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {job.type}</span>
                      <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>
                      <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-yellow-500" /> Full-time</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-4 border-t lg:border-t-0 pt-6 lg:pt-0">
                  <div className="flex items-center gap-3 bg-brand-purple/5 p-3 rounded-2xl border border-brand-purple/10">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-brand-purple tracking-wider leading-none mb-1">Match Score</p>
                      <p className="text-2xl font-black text-brand-purple leading-none">{job.score}%</p>
                    </div>
                    <Target className="text-brand-purple w-8 h-8 opacity-40" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl border border-border/50">
                      <Bookmark className="w-5 h-5" />
                    </Button>
                    <Button className="bg-brand-purple hover:bg-brand-purple/90 rounded-xl px-8 font-bold">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-border/50 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground mr-2 self-center">Required:</span>
                {job.skills.map((skill, i) => (
                  <Badge key={i} variant="secondary" className="rounded-lg bg-muted text-muted-foreground hover:bg-muted/80">{skill}</Badge>
                ))}
                <Badge variant="outline" className="rounded-lg border-dashed text-muted-foreground border-border/50">+5 more</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center py-12">
        <Button variant="ghost" className="text-muted-foreground rounded-2xl group">
          Load more opportunities
          <ChevronRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </div>
  );
}
