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
  AlertTriangle,
  Plus,
  X,
  Check,
  CheckCircle
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
  const [inventoryList, setInventoryList] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sorting state
  const [sortField, setSortField] = useState('purchaseDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Purchase Entry Modal State
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');
  const [purchaseFormError, setPurchaseFormError] = useState('');

  // Purchase Form fields
  const [purchaseForm, setPurchaseForm] = useState({
    vendorId: '',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    paymentStatus: 'Paid',
    amountPaid: '',
    notes: '',
    // Single item fields
    selectedPartId: '',
    partName: '',
    partNumber: '',
    hsnCode: '8708',
    qty: 1,
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    gstPercent: 18,
    warehouse: 'Main Store'
  });

  // Load initial datasets on mount
  useEffect(() => {
    fetchVendors();
    fetchInventoryList();
    fetchPurchaseReport();
  }, [token]);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        let list = Array.isArray(data) ? data : (data.vendors || data.data || []);
        setVendorsList(Array.isArray(list) ? list : []);
      }
    } catch (err) {
      console.error('Failed to fetch vendors:', err);
      setVendorsList([]);
    }
  };

  const fetchInventoryList = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInventoryList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
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

  // Auto-fill form when selecting existing inventory part
  const handleSelectPart = (partId) => {
    const selected = inventoryList.find(p => p._id === partId);
    if (selected) {
      setPurchaseForm(prev => ({
        ...prev,
        selectedPartId: selected._id,
        partName: selected.partName || '',
        partNumber: selected.partNumber || '',
        hsnCode: selected.hsnCode || '8708',
        purchasePrice: selected.purchasePrice !== undefined ? selected.purchasePrice.toString() : '',
        sellingPrice: selected.sellingPrice !== undefined ? selected.sellingPrice.toString() : '',
        mrp: selected.mrp !== undefined ? selected.mrp.toString() : '',
        gstPercent: selected.gstPercent || 18,
        warehouse: selected.warehouse || 'Main Store',
        vendorId: prev.vendorId || selected.vendorId || ''
      }));
    } else {
      setPurchaseForm(prev => ({
        ...prev,
        selectedPartId: ''
      }));
    }
  };

  // Submit Purchase Entry Form
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setPurchaseFormError('');
    setPurchaseSuccess('');

    if (!purchaseForm.vendorId) {
      setPurchaseFormError('Please select a Supplier / Vendor.');
      return;
    }
    if (!purchaseForm.partName || !purchaseForm.partNumber) {
      setPurchaseFormError('Part Name and Part Number are required.');
      return;
    }
    if (!purchaseForm.qty || Number(purchaseForm.qty) <= 0) {
      setPurchaseFormError('Quantity purchased must be at least 1.');
      return;
    }

    const qty = Number(purchaseForm.qty) || 1;
    const rate = Number(purchaseForm.purchasePrice) || 0;
    const gstPercent = Number(purchaseForm.gstPercent) || 18;
    const itemTaxable = qty * rate;
    const itemGst = itemTaxable * (gstPercent / 100);
    const itemTotal = itemTaxable + itemGst;

    const payload = {
      vendorId: purchaseForm.vendorId,
      invoiceNo: purchaseForm.invoiceNo || `INV-${Date.now().toString().slice(-6)}`,
      invoiceDate: purchaseForm.invoiceDate || new Date().toISOString(),
      paymentStatus: purchaseForm.paymentStatus,
      amountPaid: purchaseForm.paymentStatus === 'Paid' ? itemTotal : (Number(purchaseForm.amountPaid) || 0),
      notes: purchaseForm.notes,
      items: [{
        partId: purchaseForm.selectedPartId || undefined,
        partName: purchaseForm.partName,
        partNumber: purchaseForm.partNumber,
        hsnCode: purchaseForm.hsnCode || '8708',
        qty,
        purchasePrice: rate,
        sellingPrice: Number(purchaseForm.sellingPrice) || rate,
        mrp: Number(purchaseForm.mrp) || rate,
        gstPercent,
        warehouse: purchaseForm.warehouse || 'Main Store'
      }]
    };

    setPurchaseSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setPurchaseSuccess('Purchase Entry saved successfully! Stock updated.');
        setTimeout(() => {
          setShowPurchaseModal(false);
          setPurchaseSuccess('');
          // Reset form
          setPurchaseForm({
            vendorId: '',
            invoiceNo: '',
            invoiceDate: new Date().toISOString().slice(0, 10),
            paymentStatus: 'Paid',
            amountPaid: '',
            notes: '',
            selectedPartId: '',
            partName: '',
            partNumber: '',
            hsnCode: '8708',
            qty: 1,
            purchasePrice: '',
            sellingPrice: '',
            mrp: '',
            gstPercent: 18,
            warehouse: 'Main Store'
          });
          fetchPurchaseReport();
          fetchInventoryList();
        }, 1200);
      } else {
        const err = await res.json();
        setPurchaseFormError(err.error || 'Failed to save purchase entry.');
      }
    } catch (err) {
      console.error(err);
      setPurchaseFormError('Network error while saving purchase entry.');
    } finally {
      setPurchaseSubmitting(false);
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
        (item.hsnCode && item.hsnCode.toLowerCase().includes(s)) ||
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

  // Calculate totals safely based on filtered items
  const totalPurchaseAmount = filteredAndSortedItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalQuantityPurchased = filteredAndSortedItems.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const transactionCount = new Set(filteredAndSortedItems.map(item => item.purchaseId || item.purchaseNo || item.invoiceNo || item._id)).size;

  // Calculated form preview values
  const formQty = Number(purchaseForm.qty) || 0;
  const formRate = Number(purchaseForm.purchasePrice) || 0;
  const formGst = Number(purchaseForm.gstPercent) || 0;
  const formTaxable = formQty * formRate;
  const formGstAmt = formTaxable * (formGst / 100);
  const formTotalAmt = formTaxable + formGstAmt;

  // Export handlers
  const handleExportExcel = () => {
    const headers = [
      'Purchase Date',
      'Invoice/Bill No',
      'Vendor Name',
      'Part Name',
      'Part Number',
      'HSN Code',
      'Category',
      'Qty Purchased',
      'Purchase Price (INR)',
      'GST Amount (INR)',
      'Total Amount (INR)',
      'Payment Status',
      'Warehouse / Location'
    ];

    const rows = filteredAndSortedItems.map(item => [
      `"${new Date(item.purchaseDate || Date.now()).toLocaleDateString('en-IN')}"`,
      `"${item.invoiceNo || ''}"`,
      `"${(item.vendorName || '').replace(/"/g, '""')}"`,
      `"${(item.partName || '').replace(/"/g, '""')}"`,
      `"${item.partNumber || ''}"`,
      `"${item.hsnCode || '8708'}"`,
      `"${item.category || 'General'}"`,
      item.qty || 0,
      (item.purchasePrice || 0).toFixed(2),
      (item.gstAmount || 0).toFixed(2),
      (item.total || 0).toFixed(2),
      `"${item.paymentStatus || 'Paid'}"`,
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

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setShowPurchaseModal(true);
              setPurchaseFormError('');
              setPurchaseSuccess('');
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Purchase Entry
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            title="Export report to Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
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
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
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
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
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
                      Part No & HSN
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
                      Purchase Rate
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
                  <th className="p-3.5">Warehouse / Status</th>
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
                    <td className="p-3.5 font-mono">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.partNumber || '—'}</div>
                      <div className="text-[10px] text-slate-400">HSN: {item.hsnCode || '8708'}</div>
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
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="font-bold text-slate-700 dark:text-slate-300">{item.warehouse || 'Main Store'}</div>
                      <span className={`inline-block px-1.5 py-0.5 text-[9px] font-black rounded uppercase tracking-wider ${
                        item.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                        item.paymentStatus === 'Partially Paid' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}>
                        {item.paymentStatus || 'Paid'}
                      </span>
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

      {/* Desktop-Optimized Fixed/Sticky Purchase Entry Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex justify-center items-center z-50 p-3 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            
            {/* Modal Header (Fixed at Top) */}
            <div className="flex-none p-4 px-6 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="font-black text-sm uppercase tracking-wider">New Purchase Entry</h3>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Form Area */}
            <form id="purchase-entry-form" onSubmit={handlePurchaseSubmit} className="flex-1 overflow-y-auto p-5 px-6 space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              {purchaseFormError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/80 text-rose-600 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{purchaseFormError}</span>
                </div>
              )}

              {purchaseSuccess && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{purchaseSuccess}</span>
                </div>
              )}

              {/* Row 1: Vendor & Invoice Info (Responsive 4 Columns on Desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Supplier / Vendor *</label>
                  <select
                    value={purchaseForm.vendorId}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, vendorId: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                    required
                  >
                    <option value="">Select Supplier / Vendor</option>
                    {Array.isArray(vendorsList) && vendorsList.map(v => (
                      <option key={v._id} value={v._id}>{v.name} ({v.vendorCode || 'Vendor'})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Purchase Invoice / Bill No *</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-9842"
                    value={purchaseForm.invoiceNo}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, invoiceNo: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    value={purchaseForm.invoiceDate}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, invoiceDate: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Payment Status</label>
                  <select
                    value={purchaseForm.paymentStatus}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, paymentStatus: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Part Details Section (Compact Desktop Grid) */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 p-3.5 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase text-indigo-900 dark:text-indigo-300">Part Procurement Details</span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Select existing SKU to auto-fill</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Existing SKU (Auto-fill)</label>
                    <select
                      value={purchaseForm.selectedPartId}
                      onChange={(e) => handleSelectPart(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-800 dark:text-slate-200 text-xs"
                    >
                      <option value="">Custom Part / Search Inventory...</option>
                      {Array.isArray(inventoryList) && inventoryList.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.partName} — ({item.partNumber}) | Stock: {item.stockQuantity}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="lg:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Part Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Engine Oil 5W30"
                      value={purchaseForm.partName}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, partName: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Part Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. EO-5W30"
                      value={purchaseForm.partNumber}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, partNumber: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none focus:border-indigo-500 text-xs"
                      required
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">HSN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 8708"
                      value={purchaseForm.hsnCode}
                      onChange={(e) => setPurchaseForm(prev => ({ ...prev, hsnCode: e.target.value }))}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono focus:outline-none focus:border-indigo-500 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Quantity, Pricing, GST & Location (Responsive 5 Columns on Desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Qty Purchased *</label>
                  <input
                    type="number"
                    min="1"
                    value={purchaseForm.qty}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, qty: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Purchase Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={purchaseForm.purchasePrice}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, purchasePrice: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold focus:outline-none focus:border-indigo-500 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GST %</label>
                  <select
                    value={purchaseForm.gstPercent}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, gstPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                  >
                    <option value="0">0% (Exempted)</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Warehouse / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Store"
                    value={purchaseForm.warehouse}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, warehouse: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={formTotalAmt ? formTotalAmt.toFixed(2) : "0.00"}
                    value={purchaseForm.amountPaid}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, amountPaid: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-mono font-bold focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              {/* Row 4: Notes & Live Price Calculations (Side-by-Side Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
                <div className="lg:col-span-6">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Notes / Remarks (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Batch #4092, Supplier Bill Copy Received"
                    value={purchaseForm.notes}
                    onChange={(e) => setPurchaseForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-medium focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                <div className="lg:col-span-6">
                  <div className="p-2.5 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between font-mono text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Taxable Subtotal</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">₹{formTaxable.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">GST Amount</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">₹{formGstAmt.toFixed(2)} ({formGst}%)</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Total Amount</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹{formTotalAmt.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Action Footer (Fixed at Bottom) */}
            <div className="flex-none p-4 px-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPurchaseModal(false)}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="purchase-entry-form"
                disabled={purchaseSubmitting}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
              >
                {purchaseSubmitting ? 'Saving Entry...' : 'Save Purchase Entry'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
