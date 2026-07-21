import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { 
  ShoppingBag, 
  Search, 
  Calendar, 
  Building2, 
  Tag, 
  Layers, 
  FileSpreadsheet, 
  Printer, 
  FileText, 
  ArrowUpDown, 
  DollarSign, 
  Package, 
  Receipt,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

export default function PurchaseReport({ token, user }) {
  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [partNameFilter, setPartNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [vendorsList, setVendorsList] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('purchaseDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load vendors list on mount
  useEffect(() => {
    fetchVendors();
  }, [token]);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let list = [];
        if (Array.isArray(data)) {
          list = data;
        } else if (data && Array.isArray(data.reports)) {
          list = data.reports;
        } else if (data && Array.isArray(data.data)) {
          list = data.data;
        } else if (data && Array.isArray(data.vendors)) {
          list = data.vendors;
        }
        setVendorsList(Array.isArray(list) ? list : []);
      } else {
        setVendorsList([]);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setVendorsList([]);
    }
  };

  const fetchPurchaseReport = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('fromDate', fromDate);
      if (toDate) queryParams.append('toDate', toDate);
      if (vendorId) queryParams.append('vendorId', vendorId);
      if (partNameFilter) queryParams.append('partName', partNameFilter);
      if (categoryFilter) queryParams.append('category', categoryFilter);

      const res = await fetch(`${API_BASE_URL}/reports/purchase-history?${queryParams.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        let extracted = [];
        if (Array.isArray(data)) {
          extracted = data;
        } else if (data && Array.isArray(data.reports)) {
          extracted = data.reports;
        } else if (data && Array.isArray(data.data)) {
          extracted = data.data;
        } else if (data && Array.isArray(data.items)) {
          extracted = data.items;
        } else if (data && Array.isArray(data.purchases)) {
          extracted = data.purchases;
        }
        setReports(Array.isArray(extracted) ? extracted : []);
      } else {
        const errObj = await res.json().catch(() => ({}));
        setError(errObj.error || 'Failed to fetch purchase report data.');
        setReports([]);
      }
    } catch (err) {
      console.error('Failed to fetch purchase report:', err);
      setError('Failed to connect to server.');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Automatically load report data on initial mount
  useEffect(() => {
    fetchPurchaseReport();
  }, [token]);

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setVendorId('');
    setPartNameFilter('');
    setCategoryFilter('');
    setSearchQuery('');
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Ensure reports is always an array before filtering/sorting
  const safeReports = Array.isArray(reports) ? reports : [];

  const filteredAndSortedItems = safeReports
    .filter(item => {
      if (!searchQuery) return true;
      const s = searchQuery.toLowerCase();
      return (
        (item.partName && item.partName.toLowerCase().includes(s)) ||
        (item.partNumber && item.partNumber.toLowerCase().includes(s)) ||
        (item.vendorName && item.vendorName.toLowerCase().includes(s)) ||
        (item.invoiceNo && item.invoiceNo.toLowerCase().includes(s)) ||
        (item.warehouse && item.warehouse.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (sortField === 'purchaseDate') {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      } else if (typeof aVal === 'string') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Calculate totals safely
  const totalPurchaseAmount = safeReports.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalQuantityPurchased = safeReports.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const transactionCount = new Set(safeReports.map(item => item.purchaseId || item.purchaseNo || item.invoiceNo || item._id)).size;

  // Export handlers
  const handleExportExcel = () => {
    const headers = [
      'Purchase Date',
      'Invoice/Bill No',
      'Vendor Name',
      'Part Name',
      'Part Number',
      'Category',
      'Qty Purchased',
      'Purchase Price (INR)',
      'GST Amount (INR)',
      'Total Amount (INR)',
      'Warehouse / Location'
    ];

    const rows = filteredAndSortedItems.map(item => [
      `"${new Date(item.purchaseDate || Date.now()).toLocaleDateString('en-IN')}"`,
      `"${item.invoiceNo || ''}"`,
      `"${(item.vendorName || '').replace(/"/g, '""')}"`,
      `"${(item.partName || '').replace(/"/g, '""')}"`,
      `"${item.partNumber || ''}"`,
      `"${item.category || 'General'}"`,
      item.qty || 0,
      (item.purchasePrice || 0).toFixed(2),
      (item.gstAmount || 0).toFixed(2),
      (item.total || 0).toFixed(2),
      `"${(item.warehouse || 'Main Store').replace(/"/g, '""')} ${item.locationRack ? `(${item.locationRack})` : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_History_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Purchase History Report
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Track spare parts procurement entries, supplier invoice totals, quantity totals, and tax breakdowns
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20"
            title="Export report to Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            title="Print or Save as PDF"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Filter Purchase Records
            </h3>
          </div>
          <button
            onClick={handleReset}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs font-semibold">
          {/* From Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Supplier / Vendor */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier / Vendor</label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Suppliers / Vendors</option>
              {Array.isArray(vendorsList) && vendorsList.map(v => (
                <option key={v._id} value={v._id}>{v.name} ({v.vendorCode || 'Vendor'})</option>
              ))}
            </select>
          </div>

          {/* Part Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Part Name / Code</label>
            <input
              type="text"
              placeholder="e.g. Oil Filter, Brake Pad"
              value={partNameFilter}
              onChange={(e) => setPartNameFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="Engine">Engine Components</option>
              <option value="Brakes">Brakes & Suspension</option>
              <option value="Electrical">Electrical Parts</option>
              <option value="Body">Body Panels / Glass</option>
              <option value="Consumable">Consumables / Oils</option>
              <option value="General Spares">General Spares</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={fetchPurchaseReport}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            Generate Report
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Purchase Amount */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Purchase Amount</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              ₹{totalPurchaseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Total Quantity Purchased */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total Quantity Purchased</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {totalQuantityPurchased.toLocaleString('en-IN')} <span className="text-xs font-bold text-slate-400">units</span>
            </div>
          </div>
        </div>

        {/* Number of Purchase Transactions */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-500/20">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Purchase Transactions</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {transactionCount} <span className="text-xs font-bold text-slate-400">entries</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Datatable Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* In-table Search Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 print:hidden">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Quick search within report results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-semibold">
            Showing <span className="font-bold text-slate-700 dark:text-slate-200">{filteredAndSortedItems.length}</span> records
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400 text-xs font-semibold">
              Loading purchase history report...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-rose-500 font-semibold text-xs flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          ) : Array.isArray(filteredAndSortedItems) && filteredAndSortedItems.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th 
                    onClick={() => handleSort('purchaseDate')} 
                    className="p-3.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Purchase Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('invoiceNo')} 
                    className="p-3.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Invoice / Bill No
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('vendorName')} 
                    className="p-3.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Vendor Name
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('partName')} 
                    className="p-3.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Part Details
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('partNumber')} 
                    className="p-3.5 cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      Part Number
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('qty')} 
                    className="p-3.5 text-center cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">
                      Qty
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('purchasePrice')} 
                    className="p-3.5 text-right cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Purchase Price
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('gstAmount')} 
                    className="p-3.5 text-right cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      GST Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('total')} 
                    className="p-3.5 text-right cursor-pointer hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Total Amount
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-3.5">Warehouse / Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                {filteredAndSortedItems.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-3.5 font-mono text-[11px]">
                      {new Date(item.purchaseDate || Date.now()).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-indigo-650 dark:text-indigo-400">
                      {item.invoiceNo || item.purchaseNo || 'N/A'}
                    </td>
                    <td className="p-3.5 font-bold text-slate-800 dark:text-white">
                      {item.vendorName || '—'}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.partName || '—'}</div>
                      {item.category && (
                        <div className="text-[10px] text-indigo-500 font-bold uppercase">{item.category}</div>
                      )}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-600 dark:text-slate-400">
                      {item.partNumber || '—'}
                    </td>
                    <td className="p-3.5 text-center font-mono font-bold text-slate-900 dark:text-white">
                      {item.qty || 0}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold">
                      ₹{(Number(item.purchasePrice) || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-right font-mono text-purple-600 dark:text-purple-400 font-semibold">
                      ₹{(Number(item.gstAmount) || 0).toFixed(2)} <span className="text-[9px] text-slate-400">({item.gstPercent || 18}%)</span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                      ₹{(Number(item.total) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {item.warehouse || 'Main Store'} {item.locationRack ? `(${item.locationRack})` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 font-semibold text-xs">
              No purchase records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
