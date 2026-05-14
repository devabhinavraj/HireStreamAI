"use client"

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Sparkles, Shield, Rocket, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for individuals just starting their career journey.',
    features: ['5 Resume Analyses / month', 'Basic ATS Scoring', 'Standard Job Matching', 'Community Support'],
    icon: <Rocket className="w-6 h-6 text-brand-cyan" />,
    color: 'bg-brand-cyan/10',
    planId: 'starter'
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/month',
    description: 'The ultimate tool for serious job seekers and power users.',
    features: ['Unlimited Analyses', 'Advanced Skill Gap Reports', 'Priority AI Ranking', 'Personalized Career Paths', '24/7 Support'],
    icon: <Zap className="w-6 h-6 text-brand-purple" />,
    color: 'bg-brand-purple/10',
    popular: true,
    planId: 'pro'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for teams, agencies, and hiring managers.',
    features: ['Bulk Resume Ranking (up to 500)', 'API Access', 'Custom White-label Reports', 'Dedicated Account Manager', 'Custom ML Model Training'],
    icon: <Shield className="w-6 h-6 text-white" />,
    color: 'bg-foreground/10',
    planId: 'enterprise'
  }
];

export default function PricingPage() {
  const { isAuthenticated, user, updateUser } = useAuthStore();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (planId: string) => {
    if (!isAuthenticated) {
      router.push('/signup');
      return;
    }

    if (user?.subscriptionPlan === planId) {
      alert("You are already on this plan!");
      return;
    }

    setLoadingPlan(planId);
    try {
      // In a real world app, this would redirect to Stripe Checkout
      // For now, we'll simulate the plan update in our database
      const response = await axios.put('/api/auth/update-profile', { subscriptionPlan: planId });
      updateUser(response.data);
      alert(`Success! You have been upgraded to the ${planId.toUpperCase()} plan.`);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Failed to update plan. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen py-24 px-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-purple/5 blur-[150px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-brand-cyan/5 blur-[150px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-1.5 rounded-full bg-brand-purple/10 text-brand-purple text-xs font-bold uppercase tracking-wider mb-4 inline-block">
            Simple, Transparent Pricing
          </span>
          <h1 className="text-4xl md:text-6xl font-bold font-headline mb-6 tracking-tight">
            Accelerate your career with <span className="gradient-text">HireStreamAI</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your ambition. From free starters to enterprise powerhouses.
          </p>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className={`h-full border-border/50 bg-card/50 backdrop-blur-xl rounded-[2.5rem] shadow-xl flex flex-col relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 ${plan.popular ? 'border-brand-purple ring-1 ring-brand-purple' : ''}`}>
              {plan.popular && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-brand-purple text-white text-[10px] font-bold rounded-full uppercase tracking-tighter">
                  Most Popular
                </div>
              )}
              
              <CardHeader className="p-8">
                <div className={`w-12 h-12 rounded-2xl ${plan.color} flex items-center justify-center mb-4`}>
                  {plan.icon}
                </div>
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-sm mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="px-8 pb-8 flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-muted-foreground ml-1">{plan.period}</span>}
                </div>
                
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <div className="mt-1 bg-brand-cyan/20 rounded-full p-0.5">
                        <Check className="w-3.5 h-3.5 text-brand-cyan" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              
              <CardFooter className="p-8 pt-0">
                <Button 
                  className={`w-full h-12 rounded-xl font-bold ${plan.popular ? 'bg-brand-purple hover:bg-brand-purple/90' : 'bg-muted hover:bg-muted/80'}`}
                  variant={plan.popular ? 'default' : 'secondary'}
                  onClick={() => handleSelectPlan(plan.planId)}
                  disabled={loadingPlan === plan.planId}
                >
                  {loadingPlan === plan.planId ? 'Processing...' : (isAuthenticated && user?.subscriptionPlan === plan.planId ? 'Current Plan' : 'Get Started')}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-20 text-center">
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Shield className="w-4 h-4" /> Secure payments via Stripe. 30-day money back guarantee.
        </p>
      </div>
    </div>
  );
}
