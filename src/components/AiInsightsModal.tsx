import React, { useState } from 'react';
import { CalculatedItem } from '../utils/wmsCalculator';
import { Sparkles, X, BrainCircuit, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

interface AiInsightsModalProps {
  items: CalculatedItem[];
  onClose: () => void;
}

export const AiInsightsModal: React.FC<AiInsightsModalProps> = ({ items, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAiAnalysis = async () => {
    setLoading(true);
    setError(null);

    try {
      const deficitItems = items.filter(i => i.isDeficit);
      const totalCost = deficitItems.reduce((acc, i) => acc + i.totalOrderCost, 0);

      const prompt = `You are an expert Supply Chain and Inventory Management AI Advisor for educational book publishing & distribution (Emo Book Service Sdn Bhd). 
Analyze the following WMS Minimum Qty inventory data (36 textbook titles with minimum quantity threshold = 50) and provide strategic recommendations:

Total Titles: ${items.length}
Titles with Shortages (Reorder Required): ${deficitItems.length}
Total Reorder Cost: $${totalCost.toFixed(2)}

Deficit Titles Detail:
${JSON.stringify(deficitItems.map(i => ({
  isbn: i.isbn,
  title: i.title,
  category: i.category,
  minimumQty: i.minimumQty,
  stockBalance: i.stockBalance,
  extraPo: i.extraPoStock,
  deficit: i.reorderQuantity,
  supplier: i.supplier,
  leadTime: i.leadTimeDays
})), null, 2)}

Please provide:
1. Executive summary of inventory health and risk areas for curriculum stock.
2. Prioritized publisher reorder recommendations (considering lead times and upcoming academic term stockouts).
3. Textbook buffer stock optimization tips.

Format your response cleanly with clear headings and bullet points in Markdown.`;

      // Call server-side API endpoint instead of direct browser SDK call
      const res = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, prompt })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setAnalysis(data.text || 'No analysis generated.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to server AI endpoint.');
      setAnalysis(`### Textbook Inventory AI Operational Analysis (Fallback Mode)

1. **Executive Summary**: 
   - You currently have **${items.filter(i => i.isDeficit).length} textbook titles** in stock deficit against the minimum quantity threshold of 50.
   - Immediate reorder with publishers (Cambridge & Oxford University Press) is recommended to prevent backorders.

2. **Publisher Reorder Priorities**:
   - Focus on titles with longer lead times and zero incoming PO stock.
   - Track incoming shipments closely to ensure adequate buffer before semester rush.

3. **Optimization Tips**:
   - Standardize safety stock thresholds across Cambridge Primary and Oxford International math & English series.`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runAiAnalysis();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Gemini AI Textbook Intelligence (Server-Side)</h3>
              <p className="text-xs text-slate-400">Minimum Qty stock health & publisher reorder strategy advisor</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-300 text-sm leading-relaxed">
          {loading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-sm font-medium text-slate-300">Analyzing textbook inventory levels via secure backend server...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800 text-amber-200 text-xs flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{error} (Showing intelligent fallback analysis)</span>
                </div>
              )}

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 space-y-3">
                <div className="prose prose-invert max-w-none text-sm space-y-3 whitespace-pre-wrap font-sans">
                  {analysis}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/80">
          <button
            onClick={runAiAnalysis}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-analyze</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
