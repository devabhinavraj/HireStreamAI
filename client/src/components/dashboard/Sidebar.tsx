
"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Upload, 
  Users, 
  Target, 
  BarChart3, 
  Lightbulb, 
  UserCircle, 
  Settings, 
  Zap,
  ChevronRight,
  LogOut,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Resume Analyzer', icon: FileText, href: '/dashboard/resume-analyzer' },
  { label: 'Job Matching', icon: Target, href: '/dashboard/job-matching' },
  { label: 'Analytics', icon: BarChart3, href: '/dashboard/analytics' },
  { label: 'Skill Gap', icon: Lightbulb, href: '/dashboard/skill-gap' },
  { label: 'Candidates', icon: Users, href: '/dashboard/candidates' },
  { label: 'Recruiter Panel', icon: UserCircle, href: '/dashboard/recruiter' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r bg-card/50 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 z-40">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-cyan flex items-center justify-center">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">HireStream<span className="gradient-text">AI</span></span>
        </Link>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] uppercase font-bold text-muted-foreground px-4 mb-4 tracking-widest">Main Menu</p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                isActive 
                  ? "bg-brand-purple/10 text-brand-purple shadow-sm" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}>
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-brand-purple" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-purple" />}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-muted/50 rounded-3xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-cyan/20 flex items-center justify-center">
              <Zap className="text-brand-cyan w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Pro Plan</p>
              <p className="text-[10px] text-muted-foreground">90% credits used</p>
            </div>
          </div>
          <Button size="sm" className="w-full bg-purple-cyan border-none text-[10px] h-8 rounded-xl font-bold">Upgrade Now</Button>
        </div>
        
        <Separator className="mb-4" />
        
        <div className="flex flex-col gap-1">
          <Button variant="ghost" className="justify-start gap-3 text-muted-foreground hover:text-foreground rounded-2xl h-10 px-4">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-2xl h-10 px-4">
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
