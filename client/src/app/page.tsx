
"use client"

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Cpu, 
  Search, 
  Target, 
  Briefcase, 
  FileText, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  PlayCircle,
  Zap,
  Star,
  Globe,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-cyan flex items-center justify-center">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight font-headline">HireStream<span className="gradient-text">AI</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium hover:text-brand-purple transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-brand-purple transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-brand-purple transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex">Login</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="bg-purple-cyan hover:opacity-90 border-none">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-purple/20 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-cyan/20 blur-[120px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 border-brand-purple/30 text-brand-purple bg-brand-purple/5">
            Introducing HireStream AI v2.0
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight font-headline tracking-tighter">
            AI Resume Screener & <br />
            <span className="gradient-text">Smart Job Matching</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate ATS scoring, candidate ranking, and job recommendations using cutting-edge AI. Hire the top 1% without the manual grind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard">
              <Button size="lg" className="h-14 px-8 text-lg bg-brand-purple hover:bg-brand-purple/90 rounded-2xl w-full sm:w-auto">
                Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-2xl w-full sm:w-auto">
              <PlayCircle className="mr-2 w-5 h-5" /> Watch Demo
            </Button>
          </div>

          <div className="relative max-w-5xl mx-auto mt-12 animate-float">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-[2.5rem] blur opacity-25" />
            <div className="relative rounded-[2rem] border bg-card/50 overflow-hidden shadow-2xl">
              <Image 
                src="/dashboard.jpeg"
                alt="AI Dashboard Preview"
                width={1200}
                height={800}
                className="w-full h-auto"
                data-ai-hint="SaaS dashboard"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">Powerful AI at your fingertips</h2>
            <p className="text-muted-foreground">Everything you need to modernize your hiring workflow</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: FileText, title: "Resume Parsing", desc: "Instantly extract skills, experience, and education with 99.9% accuracy." },
              { icon: Target, title: "ATS Score Analysis", desc: "Get detailed scoring on how well a resume fits specific job roles." },
              { icon: Cpu, title: "AI Job Matching", desc: "Automatically match candidates to open positions based on potential." },
              { icon: Users, title: "Candidate Ranking", desc: "Focus on the best talent first with automated stack ranking." },
              { icon: Search, title: "Skill Gap Detection", desc: "Identify exactly what's missing and suggest learning roadmaps." },
              { icon: Briefcase, title: "Recruiter Dashboard", desc: "Manage thousands of applicants with a seamless SaaS interface." }
            ].map((f, i) => (
              <Card key={i} className="group hover:border-brand-purple/50 transition-all duration-300 rounded-3xl overflow-hidden border-border/50 bg-card/50">
                <CardContent className="p-8">
                  <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center mb-6 group-hover:bg-brand-purple transition-colors duration-300">
                    <f.icon className="text-brand-purple group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-headline">The Smart Hiring Pipeline</h2>
            <p className="text-muted-foreground">Four simple steps to transform your recruitment</p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 hidden md:block" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {[
                { step: "01", title: "Upload", icon: FileText },
                { step: "02", title: "Analyze", icon: Cpu },
                { step: "03", title: "Match", icon: Target },
                { step: "04", title: "Hire", icon: CheckCircle2 }
              ].map((item, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-background border-4 border-brand-purple flex items-center justify-center mb-6 shadow-xl">
                    <item.icon className="text-brand-purple w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-brand-purple mb-2">{item.step}</span>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Loved by Recruiters Worldwide</h2>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => <Star key={i} className="fill-brand-purple text-brand-purple w-5 h-5" />)}
              <span className="ml-2 font-bold">4.9/5 Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Head of Talent, Vercel", text: "HireStream AI has cut our screening time by 70%. The ATS matching is shockingly accurate." },
              { name: "Michael Chen", role: "Sr. Recruiter, Google", text: "The interface is beautiful and the AI suggestions help us find hidden gems in our talent pool." },
              { name: "Elena Rodriguez", role: "Founding Partner, HRTech", text: "Finally an ATS that recruiters actually enjoy using. The skill gap analysis is a game changer." }
            ].map((t, i) => (
              <Card key={i} className="bg-card/80 border-border/50 rounded-3xl p-8">
                <p className="text-lg italic mb-6">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-purple/20" />
                  <div>
                    <h4 className="font-bold">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-cyan flex items-center justify-center">
                  <Zap className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-bold">HireStream AI</span>
              </div>
              <p className="text-muted-foreground mb-6">The future of intelligent recruitment. Powering the world's most innovative companies.</p>
              <div className="flex items-center gap-4">
                <Twitter className="w-5 h-5 cursor-pointer hover:text-brand-purple" />
                <Github className="w-5 h-5 cursor-pointer hover:text-brand-purple" />
                <Linkedin className="w-5 h-5 cursor-pointer hover:text-brand-purple" />
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-brand-purple">Features</Link></li>
                <li><Link href="#" className="hover:text-brand-purple">Pricing</Link></li>
                <li><Link href="#" className="hover:text-brand-purple">API Docs</Link></li>
                <li><Link href="#" className="hover:text-brand-purple">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-brand-purple">About Us</Link></li>
                <li><Link href="#" className="hover:text-brand-purple">Careers</Link></li>
                <li><Link href="#" className="hover:text-brand-purple">Blog</Link></li>
                <li><Link href="#" className="hover:text-brand-purple">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Subscribe</h4>
              <p className="text-sm text-muted-foreground mb-4">Get the latest updates in AI hiring.</p>
              <div className="flex gap-2">
                <input type="email" placeholder="Email" className="bg-muted px-4 py-2 rounded-xl text-sm w-full border-none focus:ring-1 focus:ring-brand-purple" />
                <Button size="sm" className="bg-brand-purple">Join</Button>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            © 2024 HireStream AI Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
