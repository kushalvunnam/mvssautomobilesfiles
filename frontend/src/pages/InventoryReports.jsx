import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { 
  TrendingUp, 
  FileText, 
  Building2, 
  Wrench, 
  AlertTriangle, 
  FileSpreadsheet, 
  Printer, 
  Search,
  IndianRupee,
  ShoppingBag
} from 'lucide-react';
import PurchaseReport from './PurchaseReport';

export default function InventoryReports({ token, user }) {
  const [activeTab, setActiveTab] = useState('statement');
  const [statementData, setStatementData] = useState({ summary: {}, items: [] });
  const [vendorData, setVendorData] = useState([]);
  const [movementData, setMovementData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, [token, activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'statement') {
        const res = await fetch(`${API_BASE_URL}/reports/stock-statement`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setStatementData(await res.json());
      } else if (activeTab === 'vendors') {
        const res = await fetch(`${API_BASE_URL}/reports/vendor-ledger`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setVendorData(await res.json());
      } else if (activeTab === 'movement') {
        const res = await fetch(`${API_BASE_URL}/reports/inventory-movement`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) setMovementData(await res.json());
      }
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in p-1 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <TrendingUp className="w-7 h-7 text-indigo-500" /> Inventory & Stock Reports
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive audit reports for Stock Valuation, Vendor Ledgers & Inventory Movement History
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print Active Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 print:hidden">
        <button
          onClick={() => setActiveTab('statement')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'statement'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> Stock Valuation & Statement
        </button>

        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'vendors'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Vendor Summary & Balances
        </button>

        <button
          onClick={() => setActiveTab('movement')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'movement'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Wrench className="w-4 h-4" /> Movement & Audit Logs
        </button>

        <button
          onClick={() => setActiveTab('purchase')}
          className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'purchase'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Purchase History Report
        </button>
      </div>

      {/* Report Content */}
      {activeTab === 'purchase' ? (
        <PurchaseReport token={token} user={user} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm">
          {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-semibold">Generating report...</div>
        ) : activeTab === 'statement' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total SKUs</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">{statementData.summary?.totalItemsCount || 0}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Purchase Valuation</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  ₹{(statementData.summary?.totalPurchaseValuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Selling Valuation</span>
                <span className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                  ₹{(statementData.summary?.totalSellingValuation || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950 border-b text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    <th className="p-3">Part Code & Name</th>
                    <th className="p-3">Brand & Category</th>
                    <th className="p-3 text-right">Purchase Price</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-center">Current Stock</th>
                    <th className="p-3 text-right">Stock Valuation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {(statementData.items || []).map(item => (
                    <tr key={item._id}>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 dark:text-white">{item.partName}</div>
                        <div className="text-[10px] font-mono text-indigo-500">{item.partCode}</div>
                      </td>
                      <td className="p-3">{item.brand} ({item.category})</td>
                      <td className="p-3 text-right font-mono">₹{item.purchasePrice?.toFixed(2)}</td>
                      <td className="p-3 text-right font-mono">₹{item.sellingPrice?.toFixed(2)}</td>
                      <td className="p-3 text-center font-bold font-mono">{item.currentStock} {item.unit}</td>
                      <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ₹{item.stockValue?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'vendors' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-3">Vendor Code & Name</th>
                  <th className="p-3">GSTIN & Terms</th>
                  <th className="p-3 text-center">Purchases Count</th>
                  <th className="p-3 text-right">Total Purchase Value</th>
                  <th className="p-3 text-right">Total Paid Amount</th>
                  <th className="p-3 text-right">Outstanding Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {vendorData.map(v => (
                  <tr key={v._id}>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">{v.name}</div>
                      <div className="text-[10px] font-mono text-indigo-500">{v.vendorCode}</div>
                    </td>
                    <td className="p-3 font-mono">{v.gstNumber || 'N/A'} ({v.paymentTerms})</td>
                    <td className="p-3 text-center font-mono font-bold">{v.purchaseCount}</td>
                    <td className="p-3 text-right font-mono">₹{v.totalPurchaseValue?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">₹{v.totalPaidAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">₹{v.outstandingBalance?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reference No</th>
                  <th className="p-3">Part Name</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3">Reason / Details</th>
                  <th className="p-3">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {movementData.map((m, idx) => (
                  <tr key={idx}>
                    <td className="p-3 text-slate-500 font-mono">
                      {new Date(m.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.type === 'SALE' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {m.type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold">{m.reference}</td>
                    <td className="p-3 font-bold text-slate-900 dark:text-white">{m.partName}</td>
                    <td className="p-3 text-center font-mono font-bold">{m.qty}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">{m.reason}</td>
                    <td className="p-3 text-slate-400">{m.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
