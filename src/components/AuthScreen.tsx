import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Warehouse, Mail, Lock, User as UserIcon, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  onSignUp: (newUser: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ users, onLogin, onSignUp }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (isSignUp) {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      const existing = users.find(u => u.email.toLowerCase() === trimmedEmail);
      if (existing) {
        setError('An account with this email already exists. Please login.');
        return;
      }

      const newUser: User = {
        id: `u-${Date.now()}`,
        email: trimmedEmail,
        name: name.trim(),
        role,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      onSignUp(newUser);
      onLogin(newUser);
    } else {
      const found = users.find(u => u.email.toLowerCase() === trimmedEmail);
      if (!found) {
        setError('No account found with this email. Please sign up first.');
        return;
      }
      if (!found.isActive) {
        setError('This account has been deactivated by an administrator.');
        return;
      }
      onLogin(found);
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    const found = users.find(u => u.email === demoEmail);
    if (found) {
      onLogin(found);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 animate-fadeIn">
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30 text-white">
            <Warehouse className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">WMS Pro Authentication</h1>
            <p className="text-xs text-slate-400 mt-1">Warehouse Management & Replenishment System</p>
          </div>
        </div>

        {/* Quick Demo Login Cards */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Quick Demo Access</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin('admin@wms.com')}
              className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-left transition-all"
            >
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">admin@wms.com</div>
            </button>
            <button
              onClick={() => handleQuickDemoLogin('user@wms.com')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
            >
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Staff</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">user@wms.com</div>
            </button>
          </div>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-wider">or sign {isSignUp ? 'up' : 'in'} with email</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address (Username)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="user">Standard User (Operations Staff)</option>
                <option value="admin">Admin (Warehouse Manager)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="text-center text-xs text-slate-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-indigo-400 hover:underline font-semibold ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
