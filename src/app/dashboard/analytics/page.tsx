
"use client"

import React from 'react';
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
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const trendData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const skillData = [
  { name: 'React', value: 85 },
  { name: 'Python', value: 72 },
  { name: 'SQL', value: 65 },
  { name: 'AWS', value: 58 },
  { name: 'Tailwind', value: 90 },
];

const scoreDist = [
  { name: '90-100', value: 15 },
  { name: '80-90', value: 35 },
  { name: '70-80', value: 25 },
  { name: '60-70', value: 15 },
  { name: 'Below 60', value: 10 },
];

const COLORS = ['#9B99FE', '#2BC8B7', '#71717A', '#18181B', '#E4E4E7'];

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Recruitment Analytics</h1>
          <p className="text-muted-foreground">Deep insights into your candidate pool and hiring efficiency.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl gap-2">
            <Filter className="w-4 h-4" /> Filter
          </Button>
          <Button className="bg-brand-purple rounded-xl gap-2">
            <Download className="w-4 h-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-border/50 bg-card/30 rounded-3xl p-6">
          <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Candidate Applications Over Time</CardTitle>
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
              <Button size="sm" variant="ghost" className="h-7 text-[10px] rounded-lg bg-background shadow-sm">6 Months</Button>
              <Button size="sm" variant="ghost" className="h-7 text-[10px] rounded-lg">1 Year</Button>
            </div>
          </CardHeader>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9B99FE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9B99FE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717A'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717A'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181B', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#9B99FE" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/50 bg-card/30 rounded-3xl p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg">Score Distribution</CardTitle>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {scoreDist.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {scoreDist.map((entry, index) => (
              <div key={index} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{entry.name}: {entry.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="border-border/50 bg-card/30 rounded-3xl p-6">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-lg">In-Demand Skills Frequency</CardTitle>
          </CardHeader>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#71717A'}} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#2BC8B7" radius={[0, 10, 10, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="border-border/50 bg-card/30 rounded-3xl p-6 lg:col-span-2">
            <div className="flex items-center gap-6">
              <div className="p-4 rounded-3xl bg-brand-purple/10 flex items-center justify-center">
                 <TrendingUp className="w-10 h-10 text-brand-purple" />
              </div>
              <div>
                 <h3 className="text-xl font-bold mb-1">AI Matching Optimization</h3>
                 <p className="text-sm text-muted-foreground">The matching engine has improved by <span className="text-brand-cyan font-bold">+15%</span> compared to last quarter after the recent model update.</p>
                 <div className="flex gap-4 mt-4">
                    <div className="flex flex-col">
                       <span className="text-2xl font-bold">8.4s</span>
                       <span className="text-[10px] text-muted-foreground">Avg. Time to Shortlist</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-2xl font-bold">42%</span>
                       <span className="text-[10px] text-muted-foreground">Conversion Rate</span>
                    </div>
                 </div>
              </div>
            </div>
        </Card>
      </div>
    </div>
  );
}
