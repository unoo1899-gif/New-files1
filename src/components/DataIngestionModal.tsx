import React, { useState } from 'react';
import Papa from 'papaparse';
import { InventoryItem } from '../types';
import { SAMPLE_STOCK_BALANCE_CSV, SAMPLE_EXTRA_PO_CSV } from '../data/initialData';
import { Database, PackagePlus, Upload, FileText, CheckCircle2, AlertCircle, ArrowRight, Download } from 'lucide-react';

interface DataIngestionModalProps {
  items: InventoryItem[];
  onApplyStockBalance: (updates: { isbn: string; stockBalance: number }[]) => void;
  onApplyExtraPo: (updates: { isbn: string; extraPoStock: number }[]) => void;
  onClose?: () => void;
}

export const DataIngestionModal: React.FC<DataIngestionModalProps> = ({
  items,
  onApplyStockBalance,
  onApplyExtraPo,
}) => {
  const [activeTab, setActiveTab] = useState<'stock' | 'po'>('stock');
  
  // Stock balance state
  const [stockCsvText, setStockCsvText] = useState('');
  const [stockStatusMessage, setStockStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [parsedStockRows, setParsedStockRows] = useState<{ isbn: string; stockBalance: number; found: boolean; title?: string }[]>([]);

  // Extra PO state
  const [poCsvText, setPoCsvText] = useState('');
  const [poStatusMessage, setPoStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [parsedPoRows, setParsedPoRows] = useState<{ isbn: string; extraPoStock: number; found: boolean; title?: string }[]>([]);

  // Handle Stock CSV Parse
  const handleParseStockCsv = (csvString: string) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          const formatted = rows.map(row => {
            const isbn = (row.isbn || row.ISBN || row.sku || row.SKU || '').trim();
            let balance = Number(row.stockBalance || row.StockBalance || row.balance || 0);
            if (isNaN(balance) || balance < 0) balance = 0;
            const matchedItem = items.find(i => i.isbn.toLowerCase() === isbn.toLowerCase());
            return {
              isbn,
              stockBalance: balance,
              found: !!matchedItem,
              title: matchedItem ? matchedItem.title : 'Unknown Title'
            };
          }).filter(r => r.isbn !== '');

          setParsedStockRows(formatted);
          if (formatted.length > 0) {
            setStockStatusMessage({ type: 'success', text: `Successfully parsed ${formatted.length} stock balance records.` });
          } else {
            setStockStatusMessage({ type: 'error', text: 'No valid records found. Ensure CSV has "isbn" and "stockBalance" columns.' });
          }
        } catch (err) {
          setStockStatusMessage({ type: 'error', text: 'Failed to parse CSV file format.' });
        }
      },
      error: () => {
        setStockStatusMessage({ type: 'error', text: 'Error reading CSV file.' });
      }
    });
  };

  // Handle PO CSV Parse
  const handleParsePoCsv = (csvString: string) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          const formatted = rows.map(row => {
            const isbn = (row.isbn || row.ISBN || row.sku || row.SKU || '').trim();
            let po = Number(row.extraPoStock || row.ExtraPoStock || row.po || row.ExtraPO || 0);
            if (isNaN(po) || po < 0) po = 0;
            const matchedItem = items.find(i => i.isbn.toLowerCase() === isbn.toLowerCase());
            return {
              isbn,
              extraPoStock: po,
              found: !!matchedItem,
              title: matchedItem ? matchedItem.title : 'Unknown Title'
            };
          }).filter(r => r.isbn !== '');

          setParsedPoRows(formatted);
          if (formatted.length > 0) {
            setPoStatusMessage({ type: 'success', text: `Successfully parsed ${formatted.length} incoming PO records.` });
          } else {
            setPoStatusMessage({ type: 'error', text: 'No valid records found. Ensure CSV has "isbn" and "extraPoStock" columns.' });
          }
        } catch (err) {
          setPoStatusMessage({ type: 'error', text: 'Failed to parse CSV file format.' });
        }
      },
      error: () => {
        setPoStatusMessage({ type: 'error', text: 'Error reading CSV file.' });
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'stock' | 'po') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (type === 'stock') {
        setStockCsvText(text);
        handleParseStockCsv(text);
      } else {
        setPoCsvText(text);
        handleParsePoCsv(text);
      }
    };
    reader.readAsText(file);
  };

  const downloadSampleStock = () => {
    const blob = new Blob([SAMPLE_STOCK_BALANCE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_stock_balance.csv';
    a.click();
  };

  const downloadSamplePo = () => {
    const blob = new Blob([SAMPLE_EXTRA_PO_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_extra_po.csv';
    a.click();
  };

  const handleConfirmStockIngestion = () => {
    const validUpdates = parsedStockRows.filter(r => r.found).map(r => ({ isbn: r.isbn, stockBalance: r.stockBalance }));
    onApplyStockBalance(validUpdates);
    setStockStatusMessage({ type: 'success', text: `Successfully updated stock balance for ${validUpdates.length} items!` });
  };

  const handleConfirmPoIngestion = () => {
    const validUpdates = parsedPoRows.filter(r => r.found).map(r => ({ isbn: r.isbn, extraPoStock: r.extraPoStock }));
    onApplyExtraPo(validUpdates);
    setPoStatusMessage({ type: 'success', text: `Successfully updated incoming PO stock for ${validUpdates.length} items!` });
  };

  return (
    <div className="space-y-6">
      {/* Header Description */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Data Ingestion Hub (Minimum Qty Upload Modules)</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ingest dynamic operational data by ISBN to instantly recalculate inventory health and shortage deficits.
        </p>

        {/* Module Switcher Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <button
            onClick={() => setActiveTab('stock')}
            className={`p-5 rounded-xl border text-left transition-all flex items-start space-x-4 ${
              activeTab === 'stock'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'stock' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>1. Stock Balance Upload Icon</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">Physical Counts</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload physical inventory count data (CSV) representing actual on-hand quantities by ISBN.
              </p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('po')}
            className={`p-5 rounded-xl border text-left transition-all flex items-start space-x-4 ${
              activeTab === 'po'
                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activeTab === 'po' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}>
              <PackagePlus className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <span>2. Extra PO Stock Upload Icon</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">Incoming Buffer</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload active purchase orders (PO) placed with publishers but not yet received by ISBN.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Active Ingestion Module Content */}
      {activeTab === 'stock' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <Database className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Stock Balance Ingestion Module</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload CSV containing <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">isbn</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">stockBalance</code> columns.
              </p>
            </div>
            <button
              onClick={downloadSampleStock}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors self-start"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample Stock CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50 relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => handleFileUpload(e, 'stock')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Click to upload or drag and drop</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CSV format with ISBN and stock balance data</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Paste CSV Data Directly:
                </label>
                <textarea
                  rows={5}
                  value={stockCsvText}
                  onChange={(e) => {
                    setStockCsvText(e.target.value);
                    handleParseStockCsv(e.target.value);
                  }}
                  placeholder="isbn,stockBalance&#10;9781108742719,20&#10;9781108789943,60"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => {
                  setStockCsvText(SAMPLE_STOCK_BALANCE_CSV);
                  handleParseStockCsv(SAMPLE_STOCK_BALANCE_CSV);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Load sample stock balance CSV data &rarr;
              </button>
            </div>

            {/* Preview & Confirmation Area */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>Parsed Stock Records Preview</span>
                  </h4>
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300 font-medium">
                    {parsedStockRows.length} rows parsed
                  </span>
                </div>

                {stockStatusMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 mb-3 ${
                    stockStatusMessage.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  }`}>
                    {stockStatusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{stockStatusMessage.text}</span>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {parsedStockRows.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No records parsed yet. Upload or paste CSV above.
                    </div>
                  ) : (
                    parsedStockRows.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="max-w-[200px]">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{row.isbn}</span>
                          <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]" title={row.title}>{row.title}</div>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{row.stockBalance} copies</span>
                          {row.found ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="ISBN matched"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="ISBN not found in catalog"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={parsedStockRows.length === 0}
                  onClick={handleConfirmStockIngestion}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Apply Stock Balance to Inventory Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <PackagePlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>Extra PO Stock Ingestion Module</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Upload CSV containing <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">isbn</code> and <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600">extraPoStock</code> columns.
              </p>
            </div>
            <button
              onClick={downloadSamplePo}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors self-start"
            >
              <Download className="w-4 h-4" />
              <span>Download Sample PO CSV</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-50 dark:bg-slate-800/50 relative">
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => handleFileUpload(e, 'po')}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">Click to upload or drag and drop</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">CSV format with ISBN and extra PO stock data</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Or Paste CSV Data Directly:
                </label>
                <textarea
                  rows={5}
                  value={poCsvText}
                  onChange={(e) => {
                    setPoCsvText(e.target.value);
                    handleParsePoCsv(e.target.value);
                  }}
                  placeholder="isbn,extraPoStock&#10;9781108742719,15&#10;9781108819558,25"
                  className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 border-none p-3 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => {
                  setPoCsvText(SAMPLE_EXTRA_PO_CSV);
                  handleParsePoCsv(SAMPLE_EXTRA_PO_CSV);
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                Load sample extra PO CSV data &rarr;
              </button>
            </div>

            {/* Preview & Confirmation Area */}
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Parsed Incoming PO Records Preview</span>
                  </h4>
                  <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-700 dark:text-slate-300 font-medium">
                    {parsedPoRows.length} rows parsed
                  </span>
                </div>

                {poStatusMessage && (
                  <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 mb-3 ${
                    poStatusMessage.type === 'success' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  }`}>
                    {poStatusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    <span>{poStatusMessage.text}</span>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                  {parsedPoRows.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No records parsed yet. Upload or paste CSV above.
                    </div>
                  ) : (
                    parsedPoRows.map((row, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="max-w-[200px]">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">{row.isbn}</span>
                          <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]" title={row.title}>{row.title}</div>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="font-mono font-bold text-purple-600 dark:text-purple-400">+{row.extraPoStock} copies</span>
                          {row.found ? (
                            <span className="w-2 h-2 rounded-full bg-emerald-500" title="ISBN matched"></span>
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="ISBN not found in catalog"></span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  disabled={parsedPoRows.length === 0}
                  onClick={handleConfirmPoIngestion}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <span>Apply Extra PO Stock to Inventory Engine</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
