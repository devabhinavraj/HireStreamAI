
"use client"

import React from 'react';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  MoreHorizontal, 
  Download, 
  Plus,
  Target,
  FileText,
  Filter,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const candidates = [
  { id: '1', name: 'Alex Thompson', role: 'Full Stack Engineer', score: 96, experience: '8 yrs', status: 'Shortlisted', skills: ['React', 'Go', 'AWS'] },
  { id: '2', name: 'Maria Garcia', role: 'Product Designer', score: 92, experience: '5 yrs', status: 'New', skills: ['Figma', 'UX', 'Design Systems'] },
  { id: '3', name: 'James Wilson', role: 'DevOps Lead', score: 88, experience: '10 yrs', status: 'Interviewing', skills: ['K8s', 'Terraform', 'Azure'] },
  { id: '4', name: 'Linda Chen', role: 'Frontend Engineer', score: 84, experience: '4 yrs', status: 'Screened', skills: ['React', 'TypeScript', 'Tailwind'] },
  { id: '5', name: 'Robert Miller', role: 'Backend Engineer', score: 79, experience: '6 yrs', status: 'Rejected', skills: ['Node', 'Postgres', 'Redis'] },
  { id: '6', name: 'Sophie Martin', role: 'AI Researcher', score: 95, experience: '3 yrs', status: 'Shortlisted', skills: ['Python', 'PyTorch', 'NLP'] },
];

export default function RecruiterPanel() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Recruiter Control Center</h1>
          <p className="text-muted-foreground">Automatically rank and compare candidates with AI assistance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-border/50 gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
          <Button className="bg-brand-purple rounded-xl gap-2">
            <Plus className="w-4 h-4" /> Bulk Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Active Candidates', count: '1,240', change: '+12%', icon: Users, color: 'text-brand-purple' },
          { label: 'Top Scored (90+)', count: '45', change: '+5', icon: Target, color: 'text-brand-cyan' },
          { label: 'Pending Review', count: '128', change: '-12', icon: FileText, color: 'text-orange-500' },
          { label: 'Avg. Match Score', count: '74%', change: '+2%', icon: TrendingUp, color: 'text-green-500' }
        ].map((stat, i) => (
          <Card key={i} className="border-border/50 bg-card/30 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <stat.icon className={cn("w-6 h-6", stat.color)} />
              <Badge variant="secondary" className="rounded-lg text-[10px] bg-muted">{stat.change}</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold mt-1">{stat.count}</h3>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/30 rounded-3xl overflow-hidden">
        <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search applicants..." className="pl-10 h-10 bg-muted/50 border-none rounded-xl" />
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-2"><Filter className="w-3 h-3" /> Filter</Button>
            <Button variant="ghost" size="sm" className="rounded-lg text-xs gap-2"><ArrowUpDown className="w-3 h-3" /> Sort</Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <TableHead className="w-[250px] font-bold">Candidate</TableHead>
              <TableHead className="font-bold text-center">ATS Score</TableHead>
              <TableHead className="font-bold">Experience</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Top Skills</TableHead>
              <TableHead className="text-right font-bold">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((candidate) => (
              <TableRow key={candidate.id} className="border-border/50 hover:bg-muted/50 transition-all cursor-pointer group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold shrink-0">
                      {candidate.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm group-hover:text-brand-purple transition-colors">{candidate.name}</p>
                      <p className="text-[10px] text-muted-foreground">{candidate.role}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn("text-xs font-bold", candidate.score > 90 ? "text-brand-cyan" : "text-brand-purple")}>{candidate.score}%</span>
                    <Progress value={candidate.score} className="w-20 h-1" />
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">{candidate.experience}</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-lg text-[10px] border-none font-bold",
                    candidate.status === 'Shortlisted' ? "bg-green-500/10 text-green-500" :
                    candidate.status === 'Rejected' ? "bg-red-500/10 text-red-500" :
                    candidate.status === 'Interviewing' ? "bg-brand-purple/10 text-brand-purple" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {candidate.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {candidate.skills.slice(0, 2).map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] h-5 rounded-md px-1.5 border-border/50">{s}</Badge>
                    ))}
                    {candidate.skills.length > 2 && <span className="text-[10px] text-muted-foreground self-center ml-1">+{candidate.skills.length - 2}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-brand-purple"><MessageSquare className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg"><MoreHorizontal className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="p-4 border-t border-border/50 text-center">
           <Button variant="ghost" size="sm" className="text-xs text-muted-foreground rounded-lg">Show more candidates (124 available)</Button>
        </div>
      </Card>
    </div>
  );
}

import { cn } from '@/lib/utils';
import { TrendingUp } from 'lucide-react';
