"use client"

import React, { useState } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Lock, 
  Camera, 
  Shield, 
  CreditCard, 
  Trash2, 
  Save,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/store/useAuthStore';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    profileImage: user?.profileImage || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.put('/api/auth/update-profile', formData);
      updateUser(response.data);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold font-headline">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, subscription, and account security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardContent className="p-6 text-center">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="w-full h-full rounded-full bg-brand-purple/10 flex items-center justify-center text-3xl font-bold text-brand-purple overflow-hidden border-2 border-brand-purple/20">
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.fullName?.[0]
                  )}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-brand-purple rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-bold text-lg">{user?.fullName}</h3>
              <p className="text-xs text-muted-foreground mb-4">@{user?.username || 'user'}</p>
              <Badge variant="outline" className="rounded-full border-brand-purple/30 text-brand-purple bg-brand-purple/5">
                {user?.subscriptionPlan.toUpperCase()}
              </Badge>
            </CardContent>
          </Card>

          <nav className="space-y-1">
            {[
              { label: 'Profile Info', icon: UserIcon, active: true },
              { label: 'Security', icon: Shield, active: false },
              { label: 'Billing', icon: CreditCard, active: false },
              { label: 'Danger Zone', icon: Trash2, active: false, danger: true },
            ].map((item, i) => (
              <button
                key={i}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all",
                  item.active ? "bg-brand-purple text-white shadow-lg shadow-brand-purple/20" : "text-muted-foreground hover:bg-muted/50",
                  item.danger && "hover:text-destructive"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="md:col-span-2 space-y-8">
          <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-[2rem] p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details and how others see you.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="rounded-xl bg-white/5 border-white/10 h-12" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</Label>
                  <Input 
                    id="username" 
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="rounded-xl bg-white/5 border-white/10 h-12" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                <div className="relative">
                  <Input 
                    id="email" 
                    value={user?.email} 
                    disabled 
                    className="rounded-xl bg-white/5 border-white/10 h-12 pl-10" 
                  />
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-muted-foreground/50" />
                </div>
                <p className="text-[10px] text-muted-foreground">Email cannot be changed directly for security reasons.</p>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="rounded-2xl h-12 px-8 bg-brand-purple hover:bg-brand-purple/90 font-bold gap-2"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/30 backdrop-blur-xl rounded-[2rem] p-8">
             <CardHeader className="p-0 mb-6">
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Secure your account with a unique password.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-6">
                <div className="space-y-4">
                   <div className="space-y-2">
                    <Label htmlFor="current" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Password</Label>
                    <Input id="current" type="password" className="rounded-xl bg-white/5 border-white/10 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">New Password</Label>
                    <Input id="new" type="password" className="rounded-xl bg-white/5 border-white/10 h-12" />
                  </div>
                </div>
                <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold border-white/10 hover:bg-white/5">
                  Update Password
                </Button>
            </CardContent>
          </Card>

          <Card className="border-destructive/20 bg-destructive/5 rounded-[2rem] p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-destructive mb-1">Delete Account</h3>
                <p className="text-sm text-destructive/70 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                <Button variant="destructive" className="rounded-2xl h-12 px-8 font-bold">
                  Delete My Account
                </Button>
              </div>
              <Trash2 className="w-12 h-12 text-destructive/20" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, className, variant }: any) {
  return (
    <span className={cn(
      "px-2.5 py-0.5 text-xs font-bold rounded-md",
      variant === 'outline' ? "border" : "bg-primary text-primary-foreground",
      className
    )}>
      {children}
    </span>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
