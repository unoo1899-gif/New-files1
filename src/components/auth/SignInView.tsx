import React, { useState } from 'react';
import { User } from '../../types';
import { Warehouse, Mail, Lock, ArrowRight, Shield, User as UserIcon } from 'lucide-react';

interface SignInViewProps {
  users: User[];
  onLogin: (user: User) => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgot: () => void;
}

export const SignInView: React.FC<SignInViewProps> = ({
  users,
  onLogin,
  onNavigateToSignUp,
  onNavigateToForgot
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const found = users.find(u => u.email.toLowerCase() === trimmedEmail);

    if (!found) {
      setError('No account found with this email. Please sign up.');
      return;
    }
    if (!found.isActive) {
      setError('This account has been deactivated by an administrator.');
      return;
    }

    onLogin(found);
  };

  const handleQuickDemo = (demoEmail: string) => {
    const found = users.find(u => u.email === demoEmail);
    if (found) onLogin(found);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8 animate-fadeIn">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-indigo-600/30 text-white">
            <Warehouse className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Emo Book Service</h1>
            <p className="text-xs text-slate-400 mt-1">Warehouse Management & Replenishment System (WMS Phase 1)</p>
          </div>
        </div>

        {/* Quick Demo Accounts */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Quick Demo Access</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@wms.com')}
              className="p-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span>Admin</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">admin@wms.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('user@wms.com')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all cursor-pointer"
            >
              <div className="text-xs font-bold text-white flex items-center space-x-1">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Staff</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 truncate">user@wms.com</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-300 text-xs">
              {error}
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <button
                type="button"
                onClick={onNavigateToForgot}
                className="text-xs text-indigo-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateToSignUp}
            className="text-indigo-400 hover:underline font-semibold ml-1 cursor-pointer"
          >
            Sign up now
          </button>
        </div>
      </div>
    </div>
  );
};
