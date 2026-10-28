import React from 'react';
import { ViewMode, User } from '../types';
import { Warehouse, LayoutDashboard, Database, UploadCloud, Truck, Settings, Sparkles, RefreshCw, Users, LogOut, Shield, User as UserIcon, Clock } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onOpenAiInsights: () => void;
  onResetData: () => void;
  onOpenUserManagement: () => void;
  onLogout: () => void;
  currentUser: User;
  deficitCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  onOpenAiInsights,
  onResetData,
  onOpenUserManagement,
  onLogout,
  currentUser,
  deficitCount
}) => {
  const isAdmin = currentUser.role === 'admin';

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#eb7f31] to-[#e45742] flex items-center justify-center shadow-lg shadow-orange-600/30">
              <Warehouse className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight">Emo Book Service</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#eb7f31]/20 text-[#fcad38] border border-[#eb7f31]/30 font-semibold">
                  WMS Phase 1
                </span>
              </div>
              <p className="text-xs text-slate-400">Inventory Replenishment & RBAC</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-[#eb7f31] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onViewChange('inventory')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'inventory'
                  ? 'bg-[#eb7f31] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Shortage Report</span>
              {deficitCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-[#e45742] text-white rounded-full font-bold animate-pulse">
                  {deficitCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onViewChange('eta')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'eta'
                  ? 'bg-[#eb7f31] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>ETA Report</span>
            </button>

            <button
              onClick={() => onViewChange('ingestion')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'ingestion'
                  ? 'bg-[#eb7f31] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Data Ingestion</span>
            </button>

            <button
              onClick={() => onViewChange('reorders')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'reorders'
                  ? 'bg-[#eb7f31] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>Supplier Reorders</span>
            </button>

            <button
              onClick={() => onViewChange('settings')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentView === 'settings'
                  ? 'bg-[#eb7f31] text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Thresholds</span>
            </button>

            {isAdmin && (
              <button
                onClick={onOpenUserManagement}
                className="flex items-center space-x-2 px-3 py-2 rounded-xl text-sm font-medium text-[#fcad38] hover:bg-slate-800 transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Users</span>
              </button>
            )}
          </nav>

          {/* Action Buttons & User Profile */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenAiInsights}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-[#eb7f31] hover:from-purple-500 hover:to-orange-500 text-white shadow-md shadow-orange-600/20 transition-all"
              title="Analyze inventory health with Gemini AI"
            >
              <Sparkles className="w-4 h-4 text-purple-200" />
              <span>AI Insights</span>
            </button>

            <button
              onClick={onResetData}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
              title="Reset to default Minimum Qty data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-800">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-white">{currentUser.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">{currentUser.email}</div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                isAdmin ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-800 text-slate-300 border border-slate-700'
              }`}>
                {isAdmin ? <Shield className="w-3 h-3 mr-0.5" /> : <UserIcon className="w-3 h-3 mr-0.5" />}
                {currentUser.role}
              </span>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-[#e45742] hover:text-rose-300 hover:bg-slate-800 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'dashboard' ? 'text-[#eb7f31] font-bold' : 'text-slate-400'}`}
          >
            <LayoutDashboard className="w-4 h-4 mb-0.5" />
            Dashboard
          </button>
          <button
            onClick={() => onViewChange('inventory')}
            className={`flex flex-col items-center py-1 px-2 rounded relative ${currentView === 'inventory' ? 'text-[#eb7f31] font-bold' : 'text-slate-400'}`}
          >
            <Database className="w-4 h-4 mb-0.5" />
            Report
            {deficitCount > 0 && (
              <span className="absolute top-0 right-1 w-4 h-4 bg-[#e45742] text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                {deficitCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onViewChange('eta')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'eta' ? 'text-[#eb7f31] font-bold' : 'text-slate-400'}`}
          >
            <Clock className="w-4 h-4 mb-0.5" />
            ETA
          </button>
          <button
            onClick={() => onViewChange('ingestion')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'ingestion' ? 'text-[#eb7f31] font-bold' : 'text-slate-400'}`}
          >
            <UploadCloud className="w-4 h-4 mb-0.5" />
            Upload
          </button>
          <button
            onClick={() => onViewChange('reorders')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'reorders' ? 'text-[#eb7f31] font-bold' : 'text-slate-400'}`}
          >
            <Truck className="w-4 h-4 mb-0.5" />
            Reorders
          </button>
          <button
            onClick={() => onViewChange('settings')}
            className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'settings' ? 'text-[#eb7f31] font-bold' : 'text-slate-400'}`}
          >
            <Settings className="w-4 h-4 mb-0.5" />
            Thresholds
          </button>
          {isAdmin && (
            <button
              onClick={onOpenUserManagement}
              className={`flex flex-col items-center py-1 px-2 rounded ${currentView === 'users' ? 'text-[#fcad38] font-bold' : 'text-slate-400'}`}
            >
              <Users className="w-4 h-4 mb-0.5" />
              Users
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
