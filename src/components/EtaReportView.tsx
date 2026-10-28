import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Clock, Search, Download, Printer, PackageCheck, Truck, AlertCircle } from 'lucide-react';

interface EtaReportViewProps {
  items: InventoryItem[];
}

export const EtaReportView: React.FC<EtaReportViewProps> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter items with incoming Extra PO stock (> 0)
  const incomingShipments = items.filter(item => item.extraPoStock > 0);

  const filteredShipments = incomingShipments.filter(item =>
    item.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate 2 months ETA from last updated or current date
  const getEtaDate = (dateString: string) => {
    const d = new Date(dateString || Date.now());
    d.setMonth(d.getMonth() + 2);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const exportCsv = () => {
    const headers = ['ISBN', 'Title', 'Supplier', 'Incoming PO Quantity', 'Lead Time', 'Estimated Arrival Date', 'Status'];
    const rows = filteredShipments.map(item => [
      item.isbn,
      `"${item.title}"`,
      `"${item.supplier}"`,
      item.extraPoStock,
      '2 months',
      getEtaDate(item.lastUpdated),
      'In Transit'
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eta_incoming_shipments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalIncomingUnits = filteredShipments.reduce((acc, i) => acc + i.extraPoStock, 0);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#eb7f31]" />
            <span>Incoming Shipments ETA Report</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-[#eb7f31] font-semibold border border-orange-200 dark:border-orange-800">
              2 Months Lead Time Tracking
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Tracking estimated delivery dates for active Extra PO buffer stock across publisher shipments.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            title="Print Report"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Incoming Shipments</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{filteredShipments.length} Titles</div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-[#eb7f31] flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Incoming Buffer Units</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{totalIncomingUnits} Copies</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ISBN, title, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#eb7f31]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">ISBN & Title</th>
              <th className="py-3.5 px-4">Publisher / Supplier</th>
              <th className="py-3.5 px-4 text-center">Incoming PO Qty</th>
              <th className="py-3.5 px-4 text-center">Lead Time</th>
              <th className="py-3.5 px-4 text-center">Estimated Arrival Date (ETA)</th>
              <th className="py-3.5 px-4 text-center">Shipment Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
            {filteredShipments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-base font-medium">No active incoming shipments found.</p>
                  <p className="text-xs mt-1">Upload Extra PO stock or place supplier reorders to track shipments here.</p>
                </td>
              </tr>
            ) : (
              filteredShipments.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 max-w-md">
                    <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">{item.isbn}</div>
                    <div className="text-xs text-slate-700 dark:text-slate-300 font-medium mt-0.5">{item.title}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium text-xs">
                    {item.supplier}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    +{item.extraPoStock} copies
                  </td>
                  <td className="py-3.5 px-4 text-center text-xs text-slate-600 dark:text-slate-400">
                    2 months
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-900 dark:text-white">
                    {getEtaDate(item.lastUpdated)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-950/60 text-[#eb7f31] border border-orange-200 dark:border-orange-900">
                      In Transit
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
