import React, { useState, useEffect } from 'react';
import { SKUItem, ViewMode } from './types';
import { INITIAL_SKUS } from './data/initialData';
import { calculateWarehouseMetrics } from './utils/wmsCalculator';
import { Header } from './components/Header';
import { StatsOverview } from './components/StatsOverview';
import { InventoryTable } from './components/InventoryTable';
import { DataIngestionModal } from './components/DataIngestionModal';
import { SupplierReordersView } from './components/SupplierReordersView';
import { ThresholdSettings } from './components/ThresholdSettings';
import { AiInsightsModal } from './components/AiInsightsModal';
import { SkuEditorModal } from './components/SkuEditorModal';

export default function App() {
  const [items, setItems] = useState<SKUItem[]>(() => {
    const saved = localStorage.getItem('wms_phase1_skus');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved items', e);
      }
    }
    return INITIAL_SKUS;
  });

  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('wms_phase1_skus', JSON.stringify(items));
  }, [items]);

  const metrics = calculateWarehouseMetrics(items);

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
  const handleApplyStockBalance = (updates: { sku: string; stockBalance: number }[]) => {
    setItems(prev => prev.map(item => {
      const match = updates.find(u => u.sku.toLowerCase() === item.sku.toLowerCase());
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
  const handleApplyExtraPo = (updates: { sku: string; extraPoStock: number }[]) => {
    setItems(prev => prev.map(item => {
      const match = updates.find(u => u.sku.toLowerCase() === item.sku.toLowerCase());
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

  // Simulate placing supplier PO -> adds ordered qty to extraPoStock buffer
  const handleSimulatePoPlacement = (ordered: { sku: string; orderedQty: number }[]) => {
    setItems(prev => prev.map(item => {
      const match = ordered.find(o => o.sku.toLowerCase() === item.sku.toLowerCase());
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

  // Add new SKU
  const handleAddSku = (newItem: SKUItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  // Update thresholds from settings page
  const handleUpdateThresholds = (updatedList: SKUItem[]) => {
    setItems(updatedList);
  };

  // Reset to initial sample data
  const handleResetData = () => {
    if (window.confirm('Reset warehouse inventory data back to default sample state?')) {
      setItems(INITIAL_SKUS);
      localStorage.removeItem('wms_phase1_skus');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-600 selection:text-white pb-16">
      {/* Navigation Header */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onOpenAiInsights={() => setShowAiModal(true)}
        onResetData={handleResetData}
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

      {/* Add SKU Modal */}
      {showAddModal && (
        <SkuEditorModal
          onAddSku={handleAddSku}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
