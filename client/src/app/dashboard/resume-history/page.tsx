"use client"

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Trash2, 
  Eye, 
  Download, 
  MoreVertical,
  Calendar,
  BarChart2,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import axiosInstance from '@/lib/axios';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ResumeHistoryPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchResumes = async () => {
    try {
      const response = await axiosInstance.get('/api/resumes/history?limit=50');
      setResumes(response.data);
    } catch (error) {
      console.error('Failed to fetch resumes', error);
      toast.error("Failed to load resume history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await axiosInstance.delete(`/api/resumes/${id}`);
      setResumes(resumes.filter((r: any) => r._id !== id));
      toast.success("Resume deleted");
    } catch (error) {
      toast.error("Failed to delete resume");
    }
  };

  const filteredResumes = resumes.filter((r: any) => 
    r.fileName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Resume History</h1>
          <p className="text-muted-foreground">Manage and review all your uploaded resumes and ATS reports.</p>
        </div>
        <Link href="/dashboard/resume-analyzer">
          <Button className="rounded-2xl bg-brand-purple hover:bg-brand-purple/90 h-12 px-6 font-bold gap-2">
            <Plus className="w-5 h-5" /> Analyze New
          </Button>
        </Link>
      </div>

      <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-[2rem] overflow-hidden">
        <CardHeader className="p-6 border-b border-border/10">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search resumes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-white/5 border-white/10 h-11"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-20 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-purple"></div>
            </div>
          ) : filteredResumes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/10">
                    <th className="px-6 py-4">Resume Name</th>
                    <th className="px-6 py-4">Date Uploaded</th>
                    <th className="px-6 py-4">ATS Score</th>
                    <th className="px-6 py-4">Skills Found</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {filteredResumes.map((resume: any) => (
                    <tr key={resume._id} className="hover:bg-white/5 transition-all group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-brand-purple/10 text-brand-purple group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-sm">{resume.fileName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(resume.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="w-32">
                           <div className="flex justify-between text-[10px] mb-1 font-bold">
                             <span className="text-brand-cyan">{resume.atsScore.toFixed(0)}%</span>
                           </div>
                           <Progress value={resume.atsScore} className="h-1.5 bg-brand-cyan/10" />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {resume.skills.slice(0, 3).map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-[10px] rounded-md bg-white/5">
                              {skill}
                            </Badge>
                          ))}
                          {resume.skills.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{resume.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                           <Button variant="ghost" size="icon" className="rounded-full hover:bg-brand-purple/10 hover:text-brand-purple">
                             <Eye className="w-4 h-4" />
                           </Button>
                           <Button 
                             onClick={() => handleDelete(resume._id)}
                             variant="ghost" 
                             size="icon" 
                             className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center">
               <p className="text-muted-foreground">No resumes found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
