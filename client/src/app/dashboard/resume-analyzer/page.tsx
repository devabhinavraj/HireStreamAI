"use client"

import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Sparkles,
  Trophy,
  Target,
  ArrowRight,
  Briefcase,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import axiosInstance from '@/lib/axios';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from 'sonner';

export default function ResumeAnalyzerPage() {
  const { user, updateUser } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const processResume = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // 1. Upload and Process in one go (as per our new backend route)
      const response = await axiosInstance.post('/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const resumeData = response.data;
      setUploadProgress(100);
      clearInterval(interval);

      // Update user stats in global store
      if (user) {
        updateUser({
          resumeCount: user.resumeCount + 1,
          // Recalculating average score would require more data or a profile fetch
        });
      }

      // Map backend data to frontend format
      const formattedResult = {
        name: user?.fullName || "Candidate",
        email: user?.email || "",
        skills: resumeData.skills || [],
        experience: [
          {
            title: "Extracted Experience",
            company: "Analyzed from Resume",
            dates: "Various",
            description: resumeData.parsedText?.substring(0, 500) + "..."
          }
        ],
        education: [],
        atsScore: Math.round(resumeData.atsScore),
        strengths: ["Skills Match", "Experience Level"],
        missingSkills: [],
        atsGrade: resumeData.atsScore > 80 ? "A" : resumeData.atsScore > 60 ? "B" : "C"
      };

      setResult(formattedResult);
      toast.success("Resume analyzed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.detail || "Failed to process resume");
      clearInterval(interval);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline mb-2">Resume Analyzer</h1>
        <p className="text-muted-foreground">Upload any PDF or DOCX to get instant AI insights and ATS scoring.</p>
      </div>

      {!result ? (
        <Card className="border-2 border-dashed border-border/50 bg-card/30 backdrop-blur-xl rounded-[3rem] p-12 text-center transition-all hover:border-brand-purple/50">
          <CardContent className="flex flex-col items-center">
            {isProcessing ? (
              <div className="w-full max-w-md space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-brand-purple/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Sparkles className="text-brand-purple w-12 h-12" />
                  </div>
                  <div className="absolute inset-0 pulse-glow rounded-3xl" />
                </div>
                <h3 className="text-xl font-bold">AI is analyzing your resume...</h3>
                <p className="text-sm text-muted-foreground">Extracting skills, parsing education, and calculating ATS score.</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span>Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              </div>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-brand-purple/10 flex items-center justify-center mb-6">
                  <Upload className="text-brand-purple w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-2">Drag and drop your resume here</h3>
                <p className="text-muted-foreground mb-8">Support for PDF, DOCX up to 10MB</p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="cursor-pointer">
                    <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold border-brand-purple/30 text-brand-purple" asChild>
                      <span>Choose File</span>
                    </Button>
                    <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx" />
                  </label>
                  {file && (
                    <Button className="rounded-2xl h-12 px-8 font-bold bg-brand-purple" onClick={processResume}>
                      Analyze Resume
                    </Button>
                  )}
                </div>
                {file && (
                  <div className="mt-4 flex items-center gap-2 text-sm font-medium bg-muted px-4 py-2 rounded-xl">
                    <FileText className="w-4 h-4" />
                    {file.name}
                    <X className="w-4 h-4 cursor-pointer hover:text-destructive" onClick={() => setFile(null)} />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl p-8 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8">
                  <Button variant="ghost" size="sm" onClick={() => setResult(null)} className="rounded-xl">
                    <Upload className="w-4 h-4 mr-2" /> Re-upload
                  </Button>
               </div>
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-3xl bg-brand-purple flex items-center justify-center text-4xl text-white font-bold">
                  {result.name[0]}
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{result.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {result.email && <Badge variant="secondary" className="rounded-lg">{result.email}</Badge>}
                  </div>
                </div>
              </div>

              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="bg-muted/50 p-1 rounded-2xl mb-6">
                  <TabsTrigger value="skills" className="rounded-xl px-6">Extracted Skills</TabsTrigger>
                  <TabsTrigger value="experience" className="rounded-xl px-6">Experience</TabsTrigger>
                </TabsList>
                <TabsContent value="skills" className="flex flex-wrap gap-2 pt-4">
                  {result.skills.map((skill: string, i: number) => (
                    <Badge key={i} className="px-4 py-2 rounded-xl bg-brand-purple/5 border-brand-purple/20 text-foreground hover:bg-brand-purple/10">
                      {skill}
                    </Badge>
                  ))}
                  {result.skills.length === 0 && <p className="text-muted-foreground text-sm">No skills detected.</p>}
                </TabsContent>
                <TabsContent value="experience" className="space-y-6 pt-4">
                  {result.experience.map((exp: any, i: number) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-muted/30 transition-all border border-transparent hover:border-border">
                      <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center shrink-0">
                        <Briefcase className="w-5 h-5 text-brand-purple" />
                      </div>
                      <div>
                        <h4 className="font-bold">{exp.title}</h4>
                        <p className="text-sm font-medium">{exp.company} • <span className="text-muted-foreground">{exp.dates}</span></p>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/50 bg-card/30 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Key Strengths
                </h3>
                <ul className="space-y-3">
                  {result.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-brand-cyan mt-0.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card className="border-border/50 bg-card/30 rounded-3xl p-6 backdrop-blur-xl">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 shrink-0" />
                    <span>Consider adding more quantitative achievements.</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>

          <div className="space-y-8">
            <Card className="border-border/50 bg-brand-gradient text-white rounded-3xl p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">ATS Score</h3>
              <div className="text-6xl font-extrabold mb-4">{result.atsScore}%</div>
              <Progress value={result.atsScore} className="h-3 bg-white/20 mb-4" />
              <p className="text-sm opacity-90">Your resume is {result.atsScore > 70 ? 'looking great!' : 'needs some work.'}</p>
            </Card>

            <Card className="border-border/50 bg-card/30 rounded-3xl p-6 backdrop-blur-xl">
              <h3 className="font-bold mb-4">AI Recommendations</h3>
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/50 border border-border/50 text-sm">
                  <p className="leading-relaxed">Based on your extracted skills, you match well for **Full Stack Engineer** roles. We recommend highlighting your React experience more prominently.</p>
                </div>
                <Button className="w-full bg-brand-purple hover:bg-brand-purple/90 rounded-2xl h-12 font-bold group shadow-lg shadow-brand-purple/20">
                  Detailed Report
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
