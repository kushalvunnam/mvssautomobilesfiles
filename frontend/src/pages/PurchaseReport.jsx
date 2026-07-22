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
  IndianRupee, 
  Package, 
  Receipt,
  RotateCcw,
  AlertTriangle,
  Plus,
  X,
  Check,
  CheckCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Eye,
  Percent
} from 'lucide-react';

export default function PurchaseReport({ token, user }) {
  // Active Module Sub-Tab: 'entry' | 'history' | 'reports'
  const [activeTab, setActiveTab] = useState('entry');

  // Datasets
  const [vendorsList, setVendorsList] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [reportsData, setReportsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filtering & Search for History & Reports
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [partNameFilter, setPartNameFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState('purchaseDate');
  const [sortDirection, setSortDirection] = useState('desc');

  // Expanded Row IDs in Purchase History
  const [expandedPurchaseIds, setExpandedPurchaseIds] = useState(new Set());

  // View Voucher Modal State
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Payment Status Update Modal State
  const [paymentModalPurchase, setPaymentModalPurchase] = useState(null);
  const [paymentModalAmount, setPaymentModalAmount] = useState('');
  const [paymentModalStatus, setPaymentModalStatus] = useState('Credit');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  // ==========================================
  // PURCHASE ENTRY FORM STATE (Multi-Part)
  // ==========================================
  const createEmptyRow = () => ({
    id: `row_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    selectedPartId: '',
    partName: '',
    partNumber: '',
    hsnCode: '8708',
    qty: 1,
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    discountPercent: 0,
    discountAmount: 0,
    gstPercent: 18,
    warehouse: 'Main Store'
  });

  const [purchaseHeader, setPurchaseHeader] = useState({
    vendorId: '',
    invoiceNo: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    paymentStatus: 'Credit', // Options: Paid, Credit, Partially Paid
    amountPaid: '',
    notes: '',
    updatePurchasePrice: true,
    updateMRP: true
  });

  const [purchaseItems, setPurchaseItems] = useState([createEmptyRow()]);
  const [purchaseSubmitting, setPurchaseSubmitting] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState('');
  const [purchaseFormError, setPurchaseFormError] = useState('');

  // Helper for 2-decimal rounding
  const round2 = (num) => Math.round(((Number(num) || 0) + Number.EPSILON) * 100) / 100;

  // Load initial datasets
  useEffect(() => {
    fetchVendors();
    fetchInventoryList();
    fetchPurchases();
    fetchPurchaseReports();
  }, [token]);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/vendors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.vendors || data.data || []);
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

  const fetchPurchases = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/purchases`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPurchaseHistory(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch purchases:', err);
    }
  };

  const fetchPurchaseReports = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (fromDate) queryParams.append('fromDate', fromDate);
      if (toDate) queryParams.append('toDate', toDate);
      if (vendorId) queryParams.append('vendorId', vendorId);
      if (partNameFilter) queryParams.append('partName', partNameFilter);
      if (categoryFilter) queryParams.append('category', categoryFilter);
      if (paymentStatusFilter) queryParams.append('paymentStatus', paymentStatusFilter);
      if (warehouseFilter) queryParams.append('warehouse', warehouseFilter);

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
        }
        setReportsData(Array.isArray(extracted) ? extracted : []);
      } else {
        const errObj = await res.json().catch(() => ({}));
        setError(errObj.error || 'Failed to fetch purchase report data.');
        setReportsData([]);
      }
    } catch (err) {
      console.error('Failed to fetch purchase reports:', err);
      setError('Failed to connect to server.');
      setReportsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch reports when filters change
  useEffect(() => {
    fetchPurchaseReports();
  }, [fromDate, toDate, vendorId, partNameFilter, categoryFilter, paymentStatusFilter, warehouseFilter]);

  // ==========================================
  // MULTI-PART ROW LOGIC & DUAL DISCOUNT SYNC
  // ==========================================
  const handleAddRow = () => {
    setPurchaseItems(prev => [...prev, createEmptyRow()]);
  };

  const handleRemoveRow = (id) => {
    if (purchaseItems.length === 1) {
      // Clear values instead of removing single row
      setPurchaseItems([createEmptyRow()]);
      return;
    }
    setPurchaseItems(prev => prev.filter(row => row.id !== id));
  };

  const handleSelectSKU = (rowId, partId) => {
    const selected = inventoryList.find(p => p._id === partId);
    setPurchaseItems(prev => prev.map(row => {
      if (row.id !== rowId) return row;
      if (!selected) {
        return { ...row, selectedPartId: '' };
      }
      return {
        ...row,
        selectedPartId: selected._id,
        partName: selected.partName || '',
        partNumber: selected.partNumber || '',
        hsnCode: selected.hsnCode || '8708',
        purchasePrice: selected.purchasePrice !== undefined ? selected.purchasePrice.toString() : '',
        sellingPrice: selected.sellingPrice !== undefined ? selected.sellingPrice.toString() : '',
        mrp: selected.mrp !== undefined ? selected.mrp.toString() : '',
        gstPercent: selected.gstPercent !== undefined ? selected.gstPercent : 18,
        warehouse: selected.warehouse || 'Main Store',
        currentStock: selected.stockQuantity || 0
      };
    }));
  };

  const handleRowChange = (rowId, field, value) => {
    setPurchaseItems(prev => prev.map(row => {
      if (row.id !== rowId) return row;

      const updated = { ...row, [field]: value };

      const qty = Number(field === 'qty' ? value : updated.qty) || 0;
      const rate = Number(field === 'purchasePrice' ? value : updated.purchasePrice) || 0;
      const gross = qty * rate;

      if (field === 'discountPercent') {
        const discPct = Math.max(0, Math.min(100, Number(value) || 0));
        const discAmt = gross > 0 ? round2((gross * discPct) / 100) : 0;
        updated.discountPercent = discPct;
        updated.discountAmount = discAmt;
      } else if (field === 'discountAmount') {
        const discAmt = Math.max(0, Number(value) || 0);
        const discPct = gross > 0 ? round2((discAmt / gross) * 100) : 0;
        updated.discountAmount = discAmt;
        updated.discountPercent = discPct;
      } else if (field === 'qty' || field === 'purchasePrice') {
        // Recalculate discount amount based on existing discountPercent
        const discPct = Number(updated.discountPercent) || 0;
        updated.discountAmount = gross > 0 ? round2((gross * discPct) / 100) : 0;
      }

      return updated;
    }));
  };

  // Helper row totals calculation
  const calculateRowTotals = (row) => {
    const qty = Number(row.qty) || 0;
    const rate = Number(row.purchasePrice) || 0;
    const gross = qty * rate;
    const discAmt = Number(row.discountAmount) || 0;
    const taxable = Math.max(0, gross - discAmt);
    const gstPct = Number(row.gstPercent) !== undefined ? Number(row.gstPercent) : 18;
    const gstAmt = taxable * (gstPct / 100);
    const total = taxable + gstAmt;

    return {
      gross: round2(gross),
      taxable: round2(taxable),
      gstAmt: round2(gstAmt),
      total: round2(total)
    };
  };

  // Overall Purchase Summary Calculation (Live Footer)
  const summaryTotals = purchaseItems.reduce((acc, row) => {
    const qty = Number(row.qty) || 0;
    const { gross, taxable, gstAmt, total } = calculateRowTotals(row);
    const discAmt = Number(row.discountAmount) || 0;

    acc.totalQty += qty;
    acc.subtotal += gross;
    acc.totalDiscount += discAmt;
    acc.taxableAmount += taxable;
    acc.gstTotal += gstAmt;
    acc.grandTotal += total;
    return acc;
  }, {
    totalQty: 0,
    subtotal: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    gstTotal: 0,
    grandTotal: 0
  });

  // Handle Form Submit
  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    setPurchaseFormError('');
    setPurchaseSuccess('');

    if (!purchaseHeader.vendorId) {
      setPurchaseFormError('Please select a Supplier / Vendor.');
      return;
    }

    if (purchaseItems.length === 0) {
      setPurchaseFormError('At least one purchase item is required.');
      return;
    }

    for (let i = 0; i < purchaseItems.length; i++) {
      const item = purchaseItems[i];
      if (!item.partName || !item.partNumber) {
        setPurchaseFormError(`Row #${i + 1}: Part Name and Part Number are required.`);
        return;
      }
      if (!item.qty || Number(item.qty) <= 0) {
        setPurchaseFormError(`Row #${i + 1}: Quantity must be at least 1.`);
        return;
      }
      if (item.mrp === undefined || item.mrp === '' || Number(item.mrp) < 0) {
        setPurchaseFormError(`Row #${i + 1}: MRP must be 0 or greater.`);
        return;
      }
    }

    const rateExceedsMrpItems = purchaseItems.filter(item => Number(item.purchasePrice) > Number(item.mrp));
    if (rateExceedsMrpItems.length > 0) {
      const confirmSave = window.confirm(
        `Warning: Purchase Rate exceeds MRP for the following items:\n` +
        rateExceedsMrpItems.map(item => `- ${item.partName} (Purchase Rate: ₹${item.purchasePrice}, MRP: ₹${item.mrp})`).join('\n') +
        `\n\nDo you want to proceed and save this purchase entry?`
      );
      if (!confirmSave) return;
    }

    const grandTotal = summaryTotals.grandTotal;
    const amountPaidNum = Number(purchaseHeader.amountPaid) || 0;
    
    let finalStatus = purchaseHeader.paymentStatus;
    if (finalStatus === 'Unpaid') finalStatus = 'Credit';

    const payloadItems = purchaseItems.map(row => {
      const { taxable, gstAmt, total } = calculateRowTotals(row);
      return {
        partId: row.selectedPartId || undefined,
        partName: row.partName,
        partNumber: row.partNumber,
        hsnCode: row.hsnCode || '8708',
        qty: Number(row.qty) || 1,
        purchasePrice: Number(row.purchasePrice) || 0,
        sellingPrice: Number(row.sellingPrice) || Number(row.purchasePrice) || 0,
        mrp: Number(row.mrp) || 0,
        discountPercent: Number(row.discountPercent) || 0,
        discountAmount: Number(row.discountAmount) || 0,
        gstPercent: Number(row.gstPercent) !== undefined ? Number(row.gstPercent) : 18,
        warehouse: row.warehouse || 'Main Store',
        taxableAmount: taxable,
        gstAmount: gstAmt,
        total: total
      };
    });

    const payload = {
      vendorId: purchaseHeader.vendorId,
      invoiceNo: purchaseHeader.invoiceNo || `PUR-${Date.now().toString().slice(-6)}`,
      invoiceDate: purchaseHeader.invoiceDate || new Date().toISOString(),
      paymentStatus: finalStatus,
      amountPaid: finalStatus === 'Paid' ? grandTotal : amountPaidNum,
      notes: purchaseHeader.notes,
      items: payloadItems,
      updatePurchasePrice: purchaseHeader.updatePurchasePrice,
      updateMRP: purchaseHeader.updateMRP
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
        setPurchaseSuccess('Purchase Entry saved successfully! Inventory stock automatically updated.');
        setTimeout(() => {
          setPurchaseSuccess('');
          // Reset Header & Items
          setPurchaseHeader({
            vendorId: '',
            invoiceNo: '',
            invoiceDate: new Date().toISOString().slice(0, 10),
            paymentStatus: 'Credit',
            amountPaid: '',
            notes: '',
            updatePurchasePrice: true,
            updateMRP: true
          });
          setPurchaseItems([createEmptyRow()]);
          fetchPurchases();
          fetchPurchaseReports();
          fetchInventoryList();
          setActiveTab('history');
        }, 1500);
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

  // Toggle Row Expansion in History
  const toggleRowExpand = (id) => {
    setExpandedPurchaseIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle Update Payment Status Submit
  const handleUpdatePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentModalPurchase) return;

    setPaymentSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/purchases/${paymentModalPurchase._id}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amountPaid: Number(paymentModalAmount) || 0,
          paymentStatus: paymentModalStatus === 'Unpaid' ? 'Credit' : paymentModalStatus
        })
      });

      if (res.ok) {
        setPaymentModalPurchase(null);
        fetchPurchases();
        fetchPurchaseReports();
        fetchVendors();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update payment status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating payment status');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  // Filtering for History & Reports
  const safeReports = Array.isArray(reportsData) ? reportsData : [];

  const filteredReports = safeReports
    .filter(item => {
      if (paymentStatusFilter) {
        const itemStatus = (item.paymentStatus || 'Credit').toLowerCase();
        const filterStatus = paymentStatusFilter.toLowerCase();
        if (filterStatus === 'credit' && itemStatus === 'unpaid') {
          // Match
        } else if (itemStatus !== filterStatus) {
          return false;
        }
      }
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

  // Calculate Report KPI Totals
  const reportTotalAmount = filteredReports.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const reportTotalQty = filteredReports.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const reportTxCount = new Set(filteredReports.map(item => item.purchaseId || item.purchaseNo || item.invoiceNo || item._id)).size;
  const reportCreditTotal = filteredReports
    .filter(item => (item.paymentStatus || 'Credit') !== 'Paid')
    .reduce((sum, item) => sum + (Number(item.total) || 0), 0);

  // CSV Export
  const handleExportExcel = () => {
    const headers = [
      'Purchase Date',
      'Invoice/Bill No',
      'Vendor Name',
      'Part Name',
      'Part Number',
      'HSN Code',
      'Qty Purchased',
      'Purchase Price (INR)',
      'MRP (INR)',
      'Discount (INR)',
      'GST Amount (INR)',
      'Total Amount (INR)',
      'Payment Status',
      'Warehouse'
    ];

    const rows = filteredReports.map(item => [
      `"${new Date(item.purchaseDate || Date.now()).toLocaleDateString('en-IN')}"`,
      `"${item.invoiceNo || ''}"`,
      `"${(item.vendorName || '').replace(/"/g, '""')}"`,
      `"${(item.partName || '').replace(/"/g, '""')}"`,
      `"${item.partNumber || ''}"`,
      `"${item.hsnCode || '8708'}"`,
      item.qty || 0,
      (item.purchasePrice || 0).toFixed(2),
      (item.mrp || 0).toFixed(2),
      (item.discountAmount || 0).toFixed(2),
      (item.gstAmount || 0).toFixed(2),
      (item.total || 0).toFixed(2),
      `"${item.paymentStatus === 'Unpaid' ? 'Credit' : (item.paymentStatus || 'Credit')}"`,
      `"${(item.warehouse || 'Main Store').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchases_Report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in p-1 print:p-0">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Purchases Module
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Record multi-part vendor bills, auto-restock inventory, manage credit payments, and generate purchase reports.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => setActiveTab('entry')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'entry'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Plus className="w-4 h-4" />
            Purchase Entry
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <FileText className="w-4 h-4" />
            Purchase History ({purchaseHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'reports'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Purchase Reports
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: PURCHASE ENTRY FORM (Multi-Part Procurement Billing)               */}
      {/* ========================================================================= */}
      {activeTab === 'entry' && (
        <form onSubmit={handlePurchaseSubmit} className="space-y-6">
          {/* Live Auto Calculation Header Banner */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg shrink-0 print:hidden grid grid-cols-2 md:grid-cols-6 gap-4 text-center md:text-left animate-fade-in">
            <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 pr-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Cost Price</span>
              <span className="text-sm font-black font-mono text-slate-200">₹{summaryTotals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 pr-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Quantity</span>
              <span className="text-sm font-black font-mono text-blue-400">{summaryTotals.totalQty} Pcs</span>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 pr-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Discount</span>
              <span className="text-sm font-black font-mono text-amber-400">₹{summaryTotals.totalDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 pr-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Total Purchase Value</span>
              <span className="text-sm font-black font-mono text-indigo-300 font-bold">₹{summaryTotals.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 pr-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">GST Amount</span>
              <span className="text-sm font-black font-mono text-purple-400">₹{summaryTotals.gstTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div>
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Grand Total</span>
              <span className="text-base font-black font-mono text-emerald-300">₹{summaryTotals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" />
                Vendor & Invoice Header Details
              </h2>
              <span className="text-xs font-bold text-slate-400">Step 1 of 2</span>
            </div>

            {purchaseSuccess && (
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                {purchaseSuccess}
              </div>
            )}

            {purchaseFormError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                {purchaseFormError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Supplier / Vendor Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Supplier / Vendor <span className="text-rose-500">*</span>
                </label>
                <select
                  value={purchaseHeader.vendorId}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, vendorId: e.target.value })}
                  required
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Select Vendor --</option>
                  {vendorsList.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.name} {v.companyName ? `(${v.companyName})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Invoice Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Purchase Invoice / Bill No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. INV-99824"
                  value={purchaseHeader.invoiceNo}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, invoiceNo: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={purchaseHeader.invoiceDate}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, invoiceDate: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Payment Status (Paid / Credit / Partially Paid) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Payment Status
                </label>
                <select
                  value={purchaseHeader.paymentStatus}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, paymentStatus: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Credit">Credit</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  placeholder={purchaseHeader.paymentStatus === 'Paid' ? 'Full Amount' : '0'}
                  disabled={purchaseHeader.paymentStatus === 'Paid'}
                  value={purchaseHeader.paymentStatus === 'Paid' ? summaryTotals.grandTotal.toFixed(2) : purchaseHeader.amountPaid}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, amountPaid: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Purchase Notes / Remarks
                </label>
                <input
                  type="text"
                  placeholder="Optional notes or supplier references"
                  value={purchaseHeader.notes}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, notes: e.target.value })}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-semibold text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Inventory Master Updates:
              </span>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={purchaseHeader.updatePurchasePrice}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, updatePurchasePrice: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Update Purchase Rate (Cost) in Parts Master
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer">
                <input
                  type="checkbox"
                  checked={purchaseHeader.updateMRP}
                  onChange={(e) => setPurchaseHeader({ ...purchaseHeader, updateMRP: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                Update MRP in Parts Master
              </label>
            </div>
          </div>

          {/* Multiple Line Items Table Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-500" />
                  Spare Parts Line Items ({purchaseItems.length})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add multiple parts under this purchase invoice. Select existing SKU to auto-fill details or type new part.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                <Plus className="w-4 h-4" />
                + Add Another Part
              </button>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3 w-48">SKU / Search Inventory</th>
                    <th className="py-2.5 px-3 w-44">Part Name *</th>
                    <th className="py-2.5 px-3 w-36">Part Number *</th>
                    <th className="py-2.5 px-3 w-24">HSN</th>
                    <th className="py-2.5 px-3 w-20">Qty *</th>
                    <th className="py-2.5 px-3 w-28">Rate (₹) *</th>
                    <th className="py-2.5 px-3 w-28">MRP (₹) *</th>
                    <th className="py-2.5 px-3 w-24">Disc %</th>
                    <th className="py-2.5 px-3 w-28">Disc Amt (₹)</th>
                    <th className="py-2.5 px-3 w-20">GST %</th>
                    <th className="py-2.5 px-3 w-28">Taxable (₹)</th>
                    <th className="py-2.5 px-3 w-28">GST (₹)</th>
                    <th className="py-2.5 px-3 w-32">Total (₹)</th>
                    <th className="py-2.5 px-3 w-36">Warehouse</th>
                    <th className="py-2.5 px-3 w-12 text-center">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {purchaseItems.map((row, idx) => {
                    const rowCalc = calculateRowTotals(row);
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        {/* Index */}
                        <td className="py-2.5 px-3 font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Existing SKU Select */}
                        <td className="py-2.5 px-3">
                          <select
                            value={row.selectedPartId}
                            onChange={(e) => handleSelectSKU(row.id, e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">-- New / Select Part --</option>
                            {inventoryList.map(p => (
                              <option key={p._id} value={p._id}>
                                {p.partName} ({p.partNumber}) - Stock: {p.stockQuantity}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Part Name */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="e.g. Front Brake Pads"
                            value={row.partName}
                            onChange={(e) => handleRowChange(row.id, 'partName', e.target.value)}
                            required
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Part Number */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="e.g. BP-8821"
                            value={row.partNumber}
                            onChange={(e) => handleRowChange(row.id, 'partNumber', e.target.value)}
                            required
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* HSN Code */}
                        <td className="py-2.5 px-3">
                          <input
                            type="text"
                            placeholder="8708"
                            value={row.hsnCode}
                            onChange={(e) => handleRowChange(row.id, 'hsnCode', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Qty */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="1"
                            value={row.qty}
                            onChange={(e) => handleRowChange(row.id, 'qty', e.target.value)}
                            required
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Purchase Rate */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={row.purchasePrice}
                            onChange={(e) => handleRowChange(row.id, 'purchasePrice', e.target.value)}
                            required
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* MRP (GST Inclusive) */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={row.mrp}
                            onChange={(e) => handleRowChange(row.id, 'mrp', e.target.value)}
                            required
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-bold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Discount % */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={row.discountPercent || ''}
                            onChange={(e) => handleRowChange(row.id, 'discountPercent', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* Discount Amount */}
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={row.discountAmount || ''}
                            onChange={(e) => handleRowChange(row.id, 'discountAmount', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          />
                        </td>

                        {/* GST % */}
                        <td className="py-2.5 px-3">
                          <select
                            value={row.gstPercent}
                            onChange={(e) => handleRowChange(row.id, 'gstPercent', Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value={0}>0%</option>
                            <option value={5}>5%</option>
                            <option value={12}>12%</option>
                            <option value={18}>18%</option>
                            <option value={28}>28%</option>
                          </select>
                        </td>

                        {/* Taxable Amount (Calculated) */}
                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          ₹{rowCalc.taxable.toFixed(2)}
                        </td>

                        {/* GST Amount (Calculated) */}
                        <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                          ₹{rowCalc.gstAmt.toFixed(2)}
                        </td>

                        {/* Total Amount (Calculated) */}
                        <td className="py-2.5 px-3 font-black text-indigo-600 dark:text-indigo-400">
                          <div>₹{rowCalc.total.toFixed(2)}</div>
                          {row.qty > 1 && (
                            <div className="text-[9px] text-slate-400 font-semibold mt-0.5" title="Net Cost Per Unit (Final Amount / Quantity)">
                              Net: ₹{(rowCalc.total / row.qty).toFixed(2)}/u
                            </div>
                          )}
                        </td>

                        {/* Warehouse Location */}
                        <td className="py-2.5 px-3">
                          <select
                            value={row.warehouse || 'Main Store'}
                            onChange={(e) => handleRowChange(row.id, 'warehouse', e.target.value)}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-semibold text-slate-800 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="Main Store">Main Store</option>
                            <option value="Spares Warehouse">Spares Warehouse</option>
                            <option value="Body Shop Store">Body Shop Store</option>
                            <option value="Accessories Store">Accessories Store</option>
                          </select>
                        </td>

                        {/* Remove Row Button */}
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(row.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Remove row"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Add Row Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Another Spare Part Row
              </button>
            </div>
          </div>

          {/* Live Purchase Summary Footer Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 text-left w-full md:w-auto">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total Parts</span>
                <span className="text-base font-black text-white">{purchaseItems.length} Parts</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total Quantity</span>
                <span className="text-base font-black text-white">{summaryTotals.totalQty} Pcs</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total Purchase Value</span>
                <span className="text-base font-black text-slate-200">₹{summaryTotals.subtotal.toFixed(2)}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total Discount</span>
                <span className="text-base font-black text-emerald-400">₹{summaryTotals.totalDiscount.toFixed(2)}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total Taxable Amount</span>
                <span className="text-base font-black text-slate-200">₹{summaryTotals.taxableAmount.toFixed(2)}</span>
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total GST</span>
                <span className="text-base font-black text-indigo-300 font-semibold">₹{summaryTotals.gstTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="text-right">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">Grand Total Amount</span>
                <span className="text-2xl font-black text-emerald-400">₹{summaryTotals.grandTotal.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={purchaseSubmitting}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {purchaseSubmitting ? 'Saving Purchase...' : 'Save Purchase Entry'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PURCHASE HISTORY (All Transactions & Payment Updates)              */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden space-y-4 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">
                Purchase Entry History Log
              </h2>
              <p className="text-xs text-slate-500">
                View all vendor invoices, multi-part procurement breakdowns, and payment status updates.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search history..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* History Datatable */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 px-4">Date & Purchase No</th>
                  <th className="py-3 px-4">Supplier / Vendor</th>
                  <th className="py-3 px-4">Invoice Bill #</th>
                  <th className="py-3 px-4">Parts Count</th>
                  <th className="py-3 px-4">Total Qty</th>
                  <th className="py-3 px-4">Taxable (₹)</th>
                  <th className="py-3 px-4">GST (₹)</th>
                  <th className="py-3 px-4">Grand Total (₹)</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseHistory.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="py-8 text-center text-slate-400 text-xs font-semibold">
                      No purchase entries recorded yet. Click "Purchase Entry" tab to record your first vendor purchase.
                    </td>
                  </tr>
                ) : (
                  purchaseHistory
                    .filter(p => {
                      if (!searchQuery) return true;
                      const s = searchQuery.toLowerCase();
                      return (
                        (p.purchaseNo && p.purchaseNo.toLowerCase().includes(s)) ||
                        (p.invoiceNo && p.invoiceNo.toLowerCase().includes(s)) ||
                        (p.vendorName && p.vendorName.toLowerCase().includes(s))
                      );
                    })
                    .map((p) => {
                      const isExpanded = expandedPurchaseIds.has(p._id);
                      const displayStatus = p.paymentStatus === 'Unpaid' ? 'Credit' : (p.paymentStatus || 'Credit');
                      const itemsCount = (p.items && Array.isArray(p.items)) ? p.items.length : 1;
                      const totalQty = p.totals?.totalQty || (p.items ? p.items.reduce((s, i) => s + (i.qty || 1), 0) : 1);

                      return (
                        <React.Fragment key={p._id}>
                          <tr className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                              <div>{new Date(p.date || p.createdAt).toLocaleDateString('en-IN')}</div>
                              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">{p.purchaseNo}</span>
                            </td>

                            <td className="py-3 px-4 font-bold text-slate-800 dark:text-white">
                              {p.vendorName || 'General Vendor'}
                            </td>

                            <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                              {p.invoiceNo || 'N/A'}
                            </td>

                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={() => toggleRowExpand(p._id)}
                                className="flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                              >
                                {itemsCount} Part{itemsCount > 1 ? 's' : ''}
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </td>

                            <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              {totalQty} Pcs
                            </td>

                            <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              ₹{(p.totals?.taxableAmount || 0).toFixed(2)}
                            </td>

                            <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                              ₹{(p.totals?.gstTotal || 0).toFixed(2)}
                            </td>

                            <td className="py-3 px-4 font-black text-emerald-600 dark:text-emerald-400">
                              ₹{(p.totals?.grandTotal || 0).toFixed(2)}
                            </td>

                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                                displayStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : displayStatus === 'Partially Paid'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}>
                                {displayStatus}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setSelectedVoucher(p)}
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                                  title="View Purchase Voucher"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setPaymentModalPurchase(p);
                                    setPaymentModalAmount(p.amountPaid ? p.amountPaid.toString() : '');
                                    setPaymentModalStatus(displayStatus);
                                  }}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                                  title="Update Payment Status"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable Line Items Drawer */}
                          {isExpanded && (
                            <tr className="bg-slate-50/90 dark:bg-slate-850">
                              <td colSpan="10" className="p-4 border-b border-slate-200 dark:border-slate-700">
                                <div className="space-y-2">
                                  <span className="text-[11px] font-black uppercase text-indigo-600 dark:text-indigo-400">
                                    Itemized Spare Parts Line Items for Invoice #{p.invoiceNo}
                                  </span>

                                  <table className="w-full text-left border-collapse text-xs bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                    <thead>
                                      <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase">
                                        <th className="py-2 px-3">Part Name</th>
                                        <th className="py-2 px-3">Part Number</th>
                                        <th className="py-2 px-3">HSN</th>
                                        <th className="py-2 px-3">Qty</th>
                                        <th className="py-2 px-3">Rate</th>
                                        <th className="py-2 px-3">MRP</th>
                                        <th className="py-2 px-3">Discount</th>
                                        <th className="py-2 px-3">Taxable</th>
                                        <th className="py-2 px-3">GST %</th>
                                        <th className="py-2 px-3">GST Amt</th>
                                        <th className="py-2 px-3">Total</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {(p.items || []).map((item, idx) => (
                                        <tr key={idx}>
                                          <td className="py-2 px-3 font-semibold text-slate-800 dark:text-white">{item.partName}</td>
                                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300 font-mono">{item.partNumber}</td>
                                          <td className="py-2 px-3 text-slate-600 dark:text-slate-300">{item.hsnCode || '8708'}</td>
                                          <td className="py-2 px-3 font-bold">{item.qty}</td>
                                          <td className="py-2 px-3">₹{(item.purchasePrice || 0).toFixed(2)}</td>
                                          <td className="py-2 px-3">₹{(item.mrp || 0).toFixed(2)}</td>
                                          <td className="py-2 px-3 text-emerald-600">₹{(item.discountAmount || 0).toFixed(2)}</td>
                                          <td className="py-2 px-3">₹{(item.taxableAmount || 0).toFixed(2)}</td>
                                          <td className="py-2 px-3">{item.gstPercent || 18}%</td>
                                          <td className="py-2 px-3">₹{(item.gstAmount || 0).toFixed(2)}</td>
                                          <td className="py-2 px-3 font-bold text-indigo-600">₹{(item.total || 0).toFixed(2)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PURCHASE REPORTS & ANALYTICS                                        */}
      {/* ========================================================================= */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          {/* Filter Bar Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 print:hidden">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-500" />
                Filter Purchase Reports Data
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Excel CSV
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3">
              {/* From Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-white"
                />
              </div>

              {/* To Date */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-white"
                />
              </div>

              {/* Supplier / Vendor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Supplier</label>
                <select
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-white"
                >
                  <option value="">All Suppliers</option>
                  {vendorsList.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>

              {/* Part Name / Number */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Part Name</label>
                <input
                  type="text"
                  placeholder="Filter part..."
                  value={partNameFilter}
                  onChange={(e) => setPartNameFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-white"
                />
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Payment Status</label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-bold text-slate-800 dark:text-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Paid">Paid</option>
                  <option value="Credit">Credit</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>

              {/* Warehouse */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Warehouse</label>
                <select
                  value={warehouseFilter}
                  onChange={(e) => setWarehouseFilter(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 font-semibold text-slate-800 dark:text-white"
                >
                  <option value="">All Warehouses</option>
                  <option value="Main Store">Main Store</option>
                  <option value="Spares Rack">Spares Rack</option>
                  <option value="Body Shop Depot">Body Shop Depot</option>
                </select>
              </div>
            </div>
          </div>

          {/* Top 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total Purchase Value</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">₹{reportTotalAmount.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Total Qty Purchased</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">{reportTotalQty} Pcs</span>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Purchase Transactions</span>
                <span className="text-xl font-black text-slate-800 dark:text-white mt-1 block">{reportTxCount} Invoices</span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-xl">
                <Receipt className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">Outstanding Credit</span>
                <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">₹{reportCreditTotal.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Report Data Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Invoice Bill #</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Part Name</th>
                    <th className="py-3 px-4">Part Number</th>
                    <th className="py-3 px-4">HSN</th>
                    <th className="py-3 px-4">Qty</th>
                    <th className="py-3 px-4">Rate (₹)</th>
                    <th className="py-3 px-4">GST (₹)</th>
                    <th className="py-3 px-4">Total (₹)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredReports.length === 0 ? (
                    <tr>
                      <td colSpan="11" className="py-8 text-center text-slate-400 text-xs font-semibold">
                        No purchase records match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredReports.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white">
                          {new Date(item.purchaseDate || item.createdAt || Date.now()).toLocaleDateString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                          {item.invoiceNo || item.purchaseNo}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white">
                          {item.vendorName || 'Supplier'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">
                          {item.partName}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                          {item.partNumber}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                          {item.hsnCode || '8708'}
                        </td>
                        <td className="py-2.5 px-4 font-bold text-slate-800 dark:text-white">
                          {item.qty}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-white">
                          ₹{(item.purchasePrice || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          ₹{(item.gstAmount || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(item.total || 0).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-4 font-bold">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${
                            (item.paymentStatus === 'Unpaid' ? 'Credit' : (item.paymentStatus || 'Credit')) === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}>
                            {item.paymentStatus === 'Unpaid' ? 'Credit' : (item.paymentStatus || 'Credit')}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: VIEW PURCHASE VOUCHER                                            */}
      {/* ========================================================================= */}
      {selectedVoucher && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 print:p-0 print:bg-white print:static">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden shadow-2xl space-y-6 p-6 print:shadow-none print:border-none">
            {/* Voucher Actions Bar */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4 print:hidden">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-500" />
                Purchase Voucher: {selectedVoucher.purchaseNo}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print Voucher
                </button>
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Voucher Document Printable Section */}
            <div className="space-y-6 text-slate-800 dark:text-slate-200 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h2 className="text-lg font-black text-indigo-600 dark:text-indigo-400 uppercase">MVSS AUTOMOBILES</h2>
                  <p className="text-[11px] text-slate-500">Multi-Brand Workshop & Spares Depot</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">PURCHASE VOUCHER</span>
                  <span className="text-sm font-mono font-black text-slate-900 dark:text-white">{selectedVoucher.purchaseNo}</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Date: {new Date(selectedVoucher.date || selectedVoucher.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">SUPPLIER DETAILS</span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedVoucher.vendorName}</p>
                  <p className="text-slate-500">Invoice Ref: {selectedVoucher.invoiceNo || 'N/A'}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mb-1">PAYMENT STATUS</span>
                  <span className="inline-block px-3 py-1 bg-slate-900 text-emerald-400 font-extrabold rounded-lg text-xs">
                    {selectedVoucher.paymentStatus === 'Unpaid' ? 'Credit' : selectedVoucher.paymentStatus}
                  </span>
                  <p className="text-slate-500 mt-1">Amount Paid: ₹{(selectedVoucher.amountPaid || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
                    <th className="p-2 border-b">Part Name</th>
                    <th className="p-2 border-b">Part #</th>
                    <th className="p-2 border-b">Qty</th>
                    <th className="p-2 border-b">Rate</th>
                    <th className="p-2 border-b">MRP</th>
                    <th className="p-2 border-b">Disc</th>
                    <th className="p-2 border-b">Taxable</th>
                    <th className="p-2 border-b">GST %</th>
                    <th className="p-2 border-b">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedVoucher.items || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-bold">{item.partName}</td>
                      <td className="p-2 font-mono text-slate-500">{item.partNumber}</td>
                      <td className="p-2 font-bold">{item.qty}</td>
                      <td className="p-2">₹{(item.purchasePrice || 0).toFixed(2)}</td>
                      <td className="p-2">₹{(item.mrp || 0).toFixed(2)}</td>
                      <td className="p-2 text-emerald-600">₹{(item.discountAmount || 0).toFixed(2)}</td>
                      <td className="p-2">₹{(item.taxableAmount || 0).toFixed(2)}</td>
                      <td className="p-2">{item.gstPercent || 18}%</td>
                      <td className="p-2 font-black text-indigo-600">₹{(item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Voucher Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1 text-right">
                  <div className="flex justify-between text-slate-500">
                    <span>Taxable Amount:</span>
                    <span>₹{(selectedVoucher.totals?.taxableAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Total GST:</span>
                    <span>₹{(selectedVoucher.totals?.gstTotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{(selectedVoucher.totals?.grandTotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UPDATE PAYMENT STATUS                                             */}
      {/* ========================================================================= */}
      {paymentModalPurchase && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-500" />
                Update Payment Status
              </h3>
              <button onClick={() => setPaymentModalPurchase(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePaymentSubmit} className="space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 block uppercase">Purchase Reference</span>
                <p className="font-bold text-slate-800 dark:text-white">{paymentModalPurchase.purchaseNo} ({paymentModalPurchase.vendorName})</p>
                <p className="text-indigo-600 font-extrabold mt-0.5">Grand Total: ₹{(paymentModalPurchase.totals?.grandTotal || 0).toFixed(2)}</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Amount Paid (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={paymentModalAmount}
                  onChange={(e) => setPaymentModalAmount(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={paymentModalStatus}
                  onChange={(e) => setPaymentModalStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-bold text-slate-800 dark:text-white"
                >
                  <option value="Credit">Credit</option>
                  <option value="Paid">Paid</option>
                  <option value="Partially Paid">Partially Paid</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPaymentModalPurchase(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"
                >
                  {paymentSubmitting ? 'Saving...' : 'Save Payment Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
