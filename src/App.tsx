import React, { useState, useEffect } from 'react';
import { InventoryItem, ViewMode, User } from './types';
import { INITIAL_ITEMS, INITIAL_USERS } from './data/initialData';
import { calculateWarehouseMetrics } from './utils/wmsCalculator';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { InventoryTable } from './components/InventoryTable';
import { DataIngestionModal } from './components/DataIngestionModal';
import { SupplierReordersView } from './components/SupplierReordersView';
import { ThresholdSettings } from './components/ThresholdSettings';
import { AiInsightsModal } from './components/AiInsightsModal';
import { SkuEditorModal } from './components/SkuEditorModal';
import { SignInView } from './components/auth/SignInView';
import { SignUpView } from './components/auth/SignUpView';
import { ForgotPasswordView } from './components/auth/ForgotPasswordView';
import { UserManagementModal } from './components/UserManagementModal';

export default function App() {
  // Auth page route when not signed in: 'signin' | 'signup' | 'forgot'
  const [authRoute, setAuthRoute] = useState<'signin' | 'signup' | 'forgot'>('signin');

  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('wms_users_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USERS;
  });

  // Current logged in user (null if not logged in)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wms_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_USERS[0]; // Default admin session for instant testing
  });

  // Inventory items state
  const [items, setItems] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('wms_minimum_qty_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ITEMS;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('wms_minimum_qty_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('wms_users_list', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wms_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wms_current_user');
    }
  }, [currentUser]);

  const metrics = calculateWarehouseMetrics(items);

  // Auth Handlers
  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleSignUp = (newUser: User) => {
    const updated = [...users, newUser];
    setUsers(updated);
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthRoute('signin');
  };

  const handleUpdateUsers = (updatedList: User[]) => {
    setUsers(updatedList);
  };

  // Update single item stock balance & PO stock
  const handleUpdateItemStock = (id: string, newBalance: number, newPo: number) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          stockBalance: newBalance,
          extraPoStock: newPo,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  // Apply batch stock balance updates from ingestion module
  const handleApplyStockBalance = (updates: { isbn: string; stockBalance: number }[]) => {
    setItems(prev => prev.map(item => {
      const match = updates.find(u => u.isbn.toLowerCase() === item.isbn.toLowerCase());
      if (match) {
        return {
          ...item,
          stockBalance: match.stockBalance,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  // Apply batch extra PO stock updates from ingestion module
  const handleApplyExtraPo = (updates: { isbn: string; extraPoStock: number }[]) => {
    setItems(prev => prev.map(item => {
      const match = updates.find(u => u.isbn.toLowerCase() === item.isbn.toLowerCase());
      if (match) {
        return {
          ...item,
          extraPoStock: match.extraPoStock,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  // Simulate placing publisher PO -> adds ordered qty to extraPoStock buffer
  const handleSimulatePoPlacement = (ordered: { isbn: string; orderedQty: number }[]) => {
    setItems(prev => prev.map(item => {
      const match = ordered.find(o => o.isbn.toLowerCase() === item.isbn.toLowerCase());
      if (match) {
        return {
          ...item,
          extraPoStock: item.extraPoStock + match.orderedQty,
          lastUpdated: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  // Add new Item
  const handleAddSku = (newItem: InventoryItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  // Update thresholds from settings page
  const handleUpdateThresholds = (updatedList: InventoryItem[]) => {
    setItems(updatedList);
  };

  // Reset to initial sample data from Minimum Qty.xlsx
  const handleResetData = () => {
    if (window.confirm('Reset inventory data back to default Minimum Qty.xlsx sample state (36 titles)?')) {
      setItems(INITIAL_ITEMS);
      localStorage.removeItem('wms_minimum_qty_items');
    }
  };

  // Render Authentication Pages if not signed in
  if (!currentUser || !currentUser.isActive) {
    if (authRoute === 'signup') {
      return (
        <SignUpView
          users={users}
          onSignUp={handleSignUp}
          onNavigateToSignIn={() => setAuthRoute('signin')}
        />
      );
    }
    if (authRoute === 'forgot') {
      return (
        <ForgotPasswordView
          onNavigateToSignIn={() => setAuthRoute('signin')}
        />
      );
    }
    return (
      <SignInView
        users={users}
        onLogin={handleLogin}
        onNavigateToSignUp={() => setAuthRoute('signup')}
        onNavigateToForgot={() => setAuthRoute('forgot')}
      />
    );
  }

  // Front Page / Dashboard Workspace (`/dashboard`)
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white pb-16">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAiInsights={() => setShowAiModal(true)}
        onResetData={handleResetData}
        onOpenUserManagement={() => setShowUserModal(true)}
        onLogout={handleLogout}
        currentUser={currentUser}
        deficitCount={metrics.deficitCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {currentView === 'dashboard' && (
          <div className="space-y-8">
            <StatsOverview
              totalSkus={metrics.totalSkus}
              deficitCount={metrics.deficitCount}
              sufficientCount={metrics.sufficientCount}
              totalReorderCost={metrics.totalReorderCost}
              onNavigateToReorders={() => setCurrentView('reorders')}
              onNavigateToIngestion={() => setCurrentView('ingestion')}
              onNavigateToReport={() => setCurrentView('inventory')}
            />

            <InventoryTable
              items={metrics.calculatedItems}
              onUpdateItemStock={handleUpdateItemStock}
              onOpenAddModal={() => setShowAddModal(true)}
              onNavigateToIngestion={() => setCurrentView('ingestion')}
              onNavigateToReorders={() => setCurrentView('reorders')}
            />
          </div>
        )}

        {currentView === 'inventory' && (
          <InventoryTable
            items={metrics.calculatedItems}
            onUpdateItemStock={handleUpdateItemStock}
            onOpenAddModal={() => setShowAddModal(true)}
            onNavigateToIngestion={() => setCurrentView('ingestion')}
            onNavigateToReorders={() => setCurrentView('reorders')}
          />
        )}

        {currentView === 'ingestion' && (
          <DataIngestionModal
            items={items}
            onApplyStockBalance={handleApplyStockBalance}
            onApplyExtraPo={handleApplyExtraPo}
          />
        )}

        {currentView === 'reorders' && (
          <SupplierReordersView
            items={metrics.calculatedItems}
            onSimulatePoPlacement={handleSimulatePoPlacement}
          />
        )}

        {currentView === 'settings' && (
          <ThresholdSettings
            items={items}
            onUpdateThresholds={handleUpdateThresholds}
            onOpenAddModal={() => setShowAddModal(true)}
          />
        )}
      </main>

      {/* AI Insights Modal */}
      {showAiModal && (
        <AiInsightsModal
          items={metrics.calculatedItems}
          onClose={() => setShowAiModal(false)}
        />
      )}

      {/* Add Title Modal */}
      {showAddModal && (
        <SkuEditorModal
          onAddSku={handleAddSku}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* User Management Modal */}
      {showUserModal && currentUser.role === 'admin' && (
        <UserManagementModal
          users={users}
          currentUser={currentUser}
          onUpdateUsers={handleUpdateUsers}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </div>
  );
}
