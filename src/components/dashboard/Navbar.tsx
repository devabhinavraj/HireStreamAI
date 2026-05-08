
"use client"

import React from 'react';
import { Search, Bell, Moon, Sun, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function DashboardNavbar() {
  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-xl fixed top-0 right-0 left-64 z-30 px-6 flex items-center justify-between">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search candidates, jobs, reports..." 
            className="pl-10 h-10 bg-muted/50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-brand-purple"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand-cyan rounded-full border-2 border-background" />
        </Button>
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="w-5 h-5 dark:hidden" />
          <Moon className="w-5 h-5 hidden dark:block" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-3 px-2 rounded-2xl hover:bg-muted/50">
              <Avatar className="w-8 h-8 rounded-xl border border-border">
                <AvatarImage src="https://picsum.photos/seed/user/32/32" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold leading-none">John Doe</p>
                <p className="text-[10px] text-muted-foreground">Recruiter Admin</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 mt-2">
            <DropdownMenuLabel className="font-bold">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl">Profile</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl">Settings</DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl">Team Management</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="rounded-xl text-destructive">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function Separator({ orientation = 'horizontal', className }: { orientation?: 'horizontal' | 'vertical', className?: string }) {
  return <div className={cn("bg-border", orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full', className)} />
}

import { cn } from '@/lib/utils';
