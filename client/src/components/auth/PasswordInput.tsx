import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react';

const RULES = [
  { label: '8‑20 characters', test: (p: string) => p.length >= 8 && p.length <= 20 },
  { label: 'Uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Number', test: (p: string) => /\d/.test(p) },
  { label: 'Special character', test: (p: string) => /[!@#$%^&*(),.?\":{}|<>\[\]\\/\-_=+~`;\']/ .test(p) },
  { label: '≤ 72 bytes (bcrypt limit)', test: (p: string) => new TextEncoder().encode(p).length <= 72 },
];

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  onValidityChange?: (isValid: boolean) => void;
}

export default function PasswordInput({ value, onChange, onValidityChange }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [checks, setChecks] = useState<boolean[]>(Array(RULES.length).fill(false));

  useEffect(() => {
    const results = RULES.map(r => r.test(value));
    setChecks(results);
    const allValid = results.every(Boolean);
    if (onValidityChange) onValidityChange(allValid);
  }, [value]);

  const strength = Math.round((checks.filter(Boolean).length / RULES.length) * 100);

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          id="password"
          type={visible ? 'text' : 'password'}
          placeholder="••••••••"
          className="pl-10 pr-10 rounded-xl h-12 bg-muted/30 border-muted-foreground/20 focus:ring-brand-purple w-full"
          value={value}
          onChange={e => onChange(e.target.value)}
          required
        />
        {/* Eye toggle */}
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setVisible(v => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        {/* Icon */}
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Strength meter */}
      <div className="w-full bg-muted/20 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-colors duration-300 ${strength < 50 ? 'bg-red-500' : strength < 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${strength}%` }}
        />
      </div>

      {/* Validation checklist */}
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-1 text-sm"
      >
        {RULES.map((rule, idx) => (
          <motion.li
            key={rule.label}
            className="flex items-center"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
          >
            {checks[idx] ? (
              <Check className="w-4 h-4 text-green-500 mr-2" />
            ) : (
              <X className="w-4 h-4 text-red-500 mr-2" />
            )}
            <span className={checks[idx] ? 'text-foreground' : 'text-muted-foreground'}>{rule.label}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
