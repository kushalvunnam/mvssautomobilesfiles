import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { Search, Plus, AlertTriangle, ArrowUpRight, Save } from 'lucide-react';

export default function Inventory({ token, user }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showReduceModal, setShowReduceModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyPart, setHistoryPart] = useState('');

  const [addForm, setAddForm] = useState({
    partName: '',
    partNumber: '',
    hsnCode: '',
    brand: '',
    model: '',
    variant: '',
    stockQuantity: '',
    lowStockThreshold: '',
    purchasePrice: '',
    sellingPrice: '',
    gstPercent: '',
    category: '',
    vehicleCompatibility: '',
    supplier: '',
    reorderLevel: '',
    locationRack: ''
  });

  const [restockForm, setRestockForm] = useState({
    partNumber: '',
    quantityToAdd: '',
    purchasePrice: '',
    sellingPrice: ''
  });

  const [reduceForm, setReduceForm] = useState({
    partNumber: '',
    quantityToReduce: '',
    reason: ''
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    _id: '',
    partName: '',
    partNumber: '',
    hsnCode: '',
    brand: '',
    model: '',
    variant: '',
    stockQuantity: '',
    lowStockThreshold: '',
    purchasePrice: '',
    sellingPrice: '',
    gstPercent: '',
    category: '',
    vehicleCompatibility: '',
    supplier: '',
    reorderLevel: '',
    locationRack: ''
  });

  const cleanNumberInput = (val, allowDecimal = true, maxVal = null) => {
    if (val === undefined || val === null) return '';
    let cleaned = val.toString().replace(/[^0-9.]/g, '');
    if (!allowDecimal) {
      cleaned = cleaned.replace(/\./g, '');
    }
    if (cleaned === '.') return '0.';
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }
    if (cleaned.startsWith('0') && cleaned.length > 1 && cleaned[1] !== '.') {
      cleaned = cleaned.replace(/^0+/, '');
      if (cleaned === '') cleaned = '';
    }
    if (maxVal !== null && cleaned !== '') {
      const num = parseFloat(cleaned);
      if (!isNaN(num) && num > maxVal) {
        cleaned = maxVal.toString();
      }
    }
    return cleaned;
  };

  const handleNumericChange = (e, form, setter, key, allowDecimal = true, maxVal = null) => {
    const input = e.target;
    const originalValue = input.value;
    const processedValue = cleanNumberInput(originalValue, allowDecimal, maxVal);
    
    const selectionStart = input.selectionStart;
    setter({ ...form, [key]: processedValue });

    requestAnimationFrame(() => {
      if (input && input.setSelectionRange) {
        const beforeCursor = originalValue.slice(0, selectionStart);
        const cleanBeforeCursor = cleanNumberInput(beforeCursor, allowDecimal, maxVal);
        const newCursorPos = cleanBeforeCursor.length;
        input.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory?search=${encodeURIComponent(search)}&lowStock=${lowStockFilter}&category=${encodeURIComponent(categoryFilter)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [search, lowStockFilter, categoryFilter]);

  useEffect(() => {
    const globalFilter = localStorage.getItem('global_search_filter');
    if (globalFilter) {
      setSearch(globalFilter);
      localStorage.removeItem('global_search_filter');
    }
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...addForm,
        stockQuantity: Number(addForm.stockQuantity) || 0,
        lowStockThreshold: Number(addForm.lowStockThreshold) || 0,
        purchasePrice: Number(addForm.purchasePrice) || 0,
        sellingPrice: Number(addForm.sellingPrice) || 0,
        gstPercent: Number(addForm.gstPercent) || 0,
        reorderLevel: Number(addForm.reorderLevel) || 0
      };
      const res = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({
          partName: '',
          partNumber: '',
          hsnCode: '',
          brand: '',
          model: '',
          variant: '',
          stockQuantity: '',
          lowStockThreshold: '',
          purchasePrice: '',
          sellingPrice: '',
          gstPercent: '',
          category: '',
          vehicleCompatibility: '',
          supplier: '',
          reorderLevel: '',
          locationRack: ''
        });
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to add item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...restockForm,
        quantityToAdd: Number(restockForm.quantityToAdd) || 0,
        purchasePrice: Number(restockForm.purchasePrice) || 0,
        sellingPrice: Number(restockForm.sellingPrice) || 0
      };
      const res = await fetch(`${API_BASE_URL}/inventory/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowRestockModal(false);
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to restock item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReduceSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...reduceForm,
        quantityToReduce: Number(reduceForm.quantityToReduce) || 0
      };
      const res = await fetch(`${API_BASE_URL}/inventory/reduce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowReduceModal(false);
        setReduceForm({ partNumber: '', quantityToReduce: '', reason: '' });
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to reduce stock.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async (partNumber) => {
    try {
      const res = await fetch(`${API_BASE_URL}/inventory/history/${partNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHistoryLogs(data);
        setHistoryPart(partNumber);
        setShowHistoryModal(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const triggerRestock = (item) => {
    setRestockForm({
      partNumber: item.partNumber,
      quantityToAdd: '',
      purchasePrice: item.purchasePrice !== undefined && item.purchasePrice !== null ? item.purchasePrice.toString() : '',
      sellingPrice: item.sellingPrice !== undefined && item.sellingPrice !== null ? item.sellingPrice.toString() : ''
    });
    setShowRestockModal(true);
  };

  const triggerReduce = (item) => {
    setReduceForm({
      partNumber: item.partNumber,
      quantityToReduce: '',
      reason: ''
    });
    setShowReduceModal(true);
  };

  const triggerEdit = (item) => {
    setEditForm({
      _id: item._id,
      partName: item.partName || '',
      partNumber: item.partNumber || '',
      hsnCode: item.hsnCode || '',
      brand: item.brand || '',
      model: item.model || '',
      variant: item.variant || '',
      stockQuantity: item.stockQuantity !== undefined && item.stockQuantity !== null ? item.stockQuantity.toString() : '',
      lowStockThreshold: item.lowStockThreshold !== undefined && item.lowStockThreshold !== null ? item.lowStockThreshold.toString() : '',
      purchasePrice: item.purchasePrice !== undefined && item.purchasePrice !== null ? item.purchasePrice.toString() : '',
      sellingPrice: item.sellingPrice !== undefined && item.sellingPrice !== null ? item.sellingPrice.toString() : '',
      gstPercent: item.gstPercent !== undefined && item.gstPercent !== null ? item.gstPercent.toString() : '',
      category: item.category || '',
      vehicleCompatibility: item.vehicleCompatibility || '',
      supplier: item.supplier || '',
      reorderLevel: item.reorderLevel !== undefined && item.reorderLevel !== null ? item.reorderLevel.toString() : '',
      locationRack: item.locationRack || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editForm,
        stockQuantity: Number(editForm.stockQuantity) || 0,
        lowStockThreshold: Number(editForm.lowStockThreshold) || 0,
        purchasePrice: Number(editForm.purchasePrice) || 0,
        sellingPrice: Number(editForm.sellingPrice) || 0,
        gstPercent: Number(editForm.gstPercent) || 0,
        reorderLevel: Number(editForm.reorderLevel) || 0
      };
      const res = await fetch(`${API_BASE_URL}/inventory/${editForm._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchInventory();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update item.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isBillingOrAdmin = user?.role === 'Admin' || user?.role === 'Spares' || user?.role === 'Accounts';

  return (
    <div className="space-y-4 animate-fade-in p-1 select-none">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Spare Parts Inventory</h2>
          <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">Log stock supplies and track parts replenishment thresholds</p>
        </div>
        {isBillingOrAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-4 h-4" /> Add Spare Part
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by part name, brand, model, HSN, compatibility, rack..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 text-xs font-semibold focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="w-44">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-880 rounded-xl text-slate-800 dark:text-slate-200 text-xs font-bold focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="Engine">Engine Components</option>
            <option value="Brakes">Brakes & Suspension</option>
            <option value="Electrical">Electrical Parts</option>
            <option value="Body">Body Panels / Glass</option>
            <option value="Consumable">Consumables / Oils</option>
            <option value="General">General Spares</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => setLowStockFilter(!lowStockFilter)}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
            lowStockFilter 
              ? 'bg-red-500 text-white border-red-500' 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-880 text-slate-700 dark:text-slate-350 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Low Stock Warning Alert
        </button>
      </div>

      {/* Datatable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <th className="p-4">Part Details</th>
                <th className="p-4">Brand / Supplier</th>
                <th className="p-4">Compatibility</th>
                <th className="p-4">Part Info</th>
                <th className="p-4 text-right">Purchase Price</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4">Stock Level</th>
                <th className="p-4">Location (Rack)</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {items.length > 0 ? (
                items.map(item => {
                  const isLow = item.stockQuantity <= item.lowStockThreshold;
                  const isReorder = item.stockQuantity <= (item.reorderLevel || item.lowStockThreshold);

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{item.partName}</div>
                        {item.category && (
                          <div className="text-[10px] text-indigo-500 font-bold uppercase mt-0.5">{item.category}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-300 font-semibold">{item.brand || '—'}</div>
                        {item.supplier && (
                          <div className="text-[10px] text-slate-400 font-medium">Supplier: {item.supplier}</div>
                        )}
                      </td>
                      <td className="p-4 text-slate-650 dark:text-slate-350 font-semibold">
                        {item.vehicleCompatibility || item.model || 'Universal'}
                      </td>
                      <td className="p-4">
                        <div className="font-mono font-bold text-slate-600 dark:text-slate-300">{item.partNumber}</div>
                        <div className="text-[9px] text-slate-450 font-mono">HSN: {item.hsnCode}</div>
                      </td>
                      <td className="p-4 text-right font-semibold text-slate-650 dark:text-slate-350">₹{item.purchasePrice.toFixed(2)}</td>
                      <td className="p-4 text-right font-extrabold text-slate-800 dark:text-slate-200">₹{item.sellingPrice.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                              isLow 
                                ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400' 
                                : isReorder 
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            }`}>
                              {item.stockQuantity} units
                            </span>
                            {isLow && (
                              <span className="text-[9px] text-red-500 font-bold uppercase flex items-center gap-0.5">
                                <AlertTriangle className="w-3.5 h-3.5" /> Low
                              </span>
                            )}
                          </div>
                          <div className="text-[9px] text-slate-450 font-semibold">
                            Min: {item.lowStockThreshold} | Reorder: {item.reorderLevel || 0}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-400 font-mono">
                        {item.locationRack || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-1.5 justify-end items-center flex-wrap">
                          <button
                            onClick={() => fetchHistory(item.partNumber)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 rounded-lg text-[10px] font-bold transition-all border border-slate-200 dark:border-slate-700"
                          >
                            History
                          </button>
                          {isBillingOrAdmin && (
                            <>
                              <button
                                onClick={() => triggerRestock(item)}
                                className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-950/30 dark:hover:bg-emerald-650 text-emerald-600 dark:text-emerald-400 hover:text-white dark:hover:text-white rounded-lg text-[10px] font-bold transition-all border border-emerald-100 dark:border-emerald-950/80"
                              >
                                <Plus className="w-3 h-3" /> Add
                              </button>
                              <button
                                onClick={() => triggerReduce(item)}
                                className="flex items-center gap-1 px-2 py-1 bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/30 dark:hover:bg-rose-650 text-rose-600 dark:text-rose-400 hover:text-white dark:hover:text-white rounded-lg text-[10px] font-bold transition-all border border-rose-100 dark:border-rose-950/80"
                              >
                                Reduce
                              </button>
                            </>
                          )}
                          {user?.role === 'Admin' && (
                            <button
                              onClick={() => triggerEdit(item)}
                              className="px-2 py-1 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-950/30 dark:hover:bg-indigo-650 text-indigo-600 dark:text-indigo-405 hover:text-white dark:hover:text-white rounded-lg text-[10px] font-bold transition-all border border-indigo-100 dark:border-indigo-950/80"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
                    No inventory spare parts matches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Part Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-fade-in text-xs font-semibold">
            <h3 className="text-lg font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6">
              Create New Inventory Part
            </h3>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Part Name</label>
                <input
                  type="text"
                  required
                  value={addForm.partName}
                  onChange={(e) => setAddForm({ ...addForm, partName: e.target.value })}
                  placeholder="Engine Oil Filter (Swift)"
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Brand Name</label>
                  <input
                    type="text"
                    value={addForm.brand}
                    onChange={(e) => setAddForm({ ...addForm, brand: e.target.value })}
                    placeholder="e.g. Bosch, MGP, Castrol"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Compatible Vehicle Model</label>
                  <input
                    type="text"
                    value={addForm.model}
                    onChange={(e) => setAddForm({ ...addForm, model: e.target.value })}
                    placeholder="e.g. Swift, Alto, Universal"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Compatible Variant</label>
                  <input
                    type="text"
                    value={addForm.variant}
                    onChange={(e) => setAddForm({ ...addForm, variant: e.target.value })}
                    placeholder="e.g. VXI, LXI, All"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Part Number</label>
                  <input
                    type="text"
                    required
                    value={addForm.partNumber}
                    onChange={(e) => setAddForm({ ...addForm, partNumber: e.target.value.toUpperCase() })}
                    placeholder="SP-FILT-OIL"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">HSN Code</label>
                  <input
                    type="text"
                    required
                    value={addForm.hsnCode}
                    onChange={(e) => setAddForm({ ...addForm, hsnCode: e.target.value })}
                    placeholder="84212300"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Purchase Price</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={addForm.purchasePrice}
                    onChange={(e) => handleNumericChange(e, addForm, setAddForm, 'purchasePrice', true)}
                    placeholder="Enter purchase price"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Selling Price</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={addForm.sellingPrice}
                    onChange={(e) => handleNumericChange(e, addForm, setAddForm, 'sellingPrice', true)}
                    placeholder="Enter selling price"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">GST Percent (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={addForm.gstPercent}
                    onChange={(e) => handleNumericChange(e, addForm, setAddForm, 'gstPercent', true, 100)}
                    placeholder="Enter GST %"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Stock Quantity</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={addForm.stockQuantity}
                    onChange={(e) => handleNumericChange(e, addForm, setAddForm, 'stockQuantity', false)}
                    placeholder="Enter stock quantity"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Low Stock Alert Threshold</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={addForm.lowStockThreshold}
                    onChange={(e) => handleNumericChange(e, addForm, setAddForm, 'lowStockThreshold', false)}
                    placeholder="Enter threshold"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Category</label>
                  <select
                    value={addForm.category}
                    onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Engine">Engine Components</option>
                    <option value="Brakes">Brakes & Suspension</option>
                    <option value="Electrical">Electrical Parts</option>
                    <option value="Body">Body Panels / Glass</option>
                    <option value="Consumable">Consumables / Oils</option>
                    <option value="General">General Spares</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Vehicle Compatibility</label>
                  <input
                    type="text"
                    value={addForm.vehicleCompatibility}
                    onChange={(e) => setAddForm({ ...addForm, vehicleCompatibility: e.target.value })}
                    placeholder="e.g. Swift 2018-2022, Universal"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Supplier</label>
                  <input
                    type="text"
                    value={addForm.supplier}
                    onChange={(e) => setAddForm({ ...addForm, supplier: e.target.value })}
                    placeholder="e.g. Bosch India"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Reorder Level</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={addForm.reorderLevel}
                    onChange={(e) => handleNumericChange(e, addForm, setAddForm, 'reorderLevel', false)}
                    placeholder="e.g. 10"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Location / Rack</label>
                  <input
                    type="text"
                    value={addForm.locationRack}
                    onChange={(e) => setAddForm({ ...addForm, locationRack: e.target.value })}
                    placeholder="e.g. Rack A-4"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock modal */}
      {showRestockModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-fade-in text-xs font-semibold">
            <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6">
              Restock Spare Part
            </h3>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Part Number Code</label>
                <input
                  type="text"
                  readOnly
                  value={restockForm.partNumber}
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-mono text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Quantity to Add</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={restockForm.quantityToAdd}
                  onChange={(e) => handleNumericChange(e, restockForm, setRestockForm, 'quantityToAdd', false)}
                  placeholder="Enter quantity to add"
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Update Cost Price</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={restockForm.purchasePrice}
                  onChange={(e) => handleNumericChange(e, restockForm, setRestockForm, 'purchasePrice', true)}
                  placeholder="Enter cost price"
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Update Selling Price</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={restockForm.sellingPrice}
                  onChange={(e) => handleNumericChange(e, restockForm, setRestockForm, 'sellingPrice', true)}
                  placeholder="Enter selling price"
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-bold font-mono"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRestockModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Restock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Part Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-fade-in text-xs font-semibold">
            <h3 className="text-lg font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6">
              Edit Inventory Part Details
            </h3>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Part Name</label>
                <input
                  type="text"
                  required
                  value={editForm.partName}
                  onChange={(e) => setEditForm({ ...editForm, partName: e.target.value })}
                  placeholder="Engine Oil Filter (Swift)"
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Brand Name</label>
                  <input
                    type="text"
                    value={editForm.brand}
                    onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })}
                    placeholder="e.g. Bosch, MGP, Castrol"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Compatible Vehicle Model</label>
                  <input
                    type="text"
                    value={editForm.model}
                    onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                    placeholder="e.g. Swift, Alto, Universal"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Compatible Variant</label>
                  <input
                    type="text"
                    value={editForm.variant}
                    onChange={(e) => setEditForm({ ...editForm, variant: e.target.value })}
                    placeholder="e.g. VXI, LXI, All"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Part Number</label>
                  <input
                    type="text"
                    required
                    value={editForm.partNumber}
                    onChange={(e) => setEditForm({ ...editForm, partNumber: e.target.value.toUpperCase() })}
                    placeholder="SP-FILT-OIL"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">HSN Code</label>
                  <input
                    type="text"
                    required
                    value={editForm.hsnCode}
                    onChange={(e) => setEditForm({ ...editForm, hsnCode: e.target.value })}
                    placeholder="84212300"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Purchase Price</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={editForm.purchasePrice}
                    onChange={(e) => handleNumericChange(e, editForm, setEditForm, 'purchasePrice', true)}
                    placeholder="Enter purchase price"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Selling Price</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={editForm.sellingPrice}
                    onChange={(e) => handleNumericChange(e, editForm, setEditForm, 'sellingPrice', true)}
                    placeholder="Enter selling price"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">GST Percent (%)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={editForm.gstPercent}
                    onChange={(e) => handleNumericChange(e, editForm, setEditForm, 'gstPercent', true, 100)}
                    placeholder="Enter GST %"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Stock Quantity</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={editForm.stockQuantity}
                    onChange={(e) => handleNumericChange(e, editForm, setEditForm, 'stockQuantity', false)}
                    placeholder="Enter stock quantity"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Low Stock Alert Threshold</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={editForm.lowStockThreshold}
                    onChange={(e) => handleNumericChange(e, editForm, setEditForm, 'lowStockThreshold', false)}
                    placeholder="Enter threshold"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Category</option>
                    <option value="Engine">Engine Components</option>
                    <option value="Brakes">Brakes & Suspension</option>
                    <option value="Electrical">Electrical Parts</option>
                    <option value="Body">Body Panels / Glass</option>
                    <option value="Consumable">Consumables / Oils</option>
                    <option value="General">General Spares</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Vehicle Compatibility</label>
                  <input
                    type="text"
                    value={editForm.vehicleCompatibility}
                    onChange={(e) => setEditForm({ ...editForm, vehicleCompatibility: e.target.value })}
                    placeholder="e.g. Swift 2018-2022, Universal"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Supplier</label>
                  <input
                    type="text"
                    value={editForm.supplier}
                    onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })}
                    placeholder="e.g. Bosch India"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Reorder Level</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={editForm.reorderLevel}
                    onChange={(e) => handleNumericChange(e, editForm, setEditForm, 'reorderLevel', false)}
                    placeholder="e.g. 10"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">Location / Rack</label>
                  <input
                    type="text"
                    value={editForm.locationRack}
                    onChange={(e) => setEditForm({ ...editForm, locationRack: e.target.value })}
                    placeholder="e.g. Rack A-4"
                    className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reduce stock modal */}
      {showReduceModal && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-fade-in text-xs font-semibold">
            <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider mb-6">
              Reduce Spare Part Stock
            </h3>

            <form onSubmit={handleReduceSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Part Number Code</label>
                <input
                  type="text"
                  readOnly
                  value={reduceForm.partNumber}
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-mono text-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Quantity to Reduce</label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  value={reduceForm.quantityToReduce}
                  onChange={(e) => handleNumericChange(e, reduceForm, setReduceForm, 'quantityToReduce', false)}
                  placeholder="e.g. 5"
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Reason for Reduction</label>
                <input
                  type="text"
                  required
                  value={reduceForm.reason}
                  onChange={(e) => setReduceForm({ ...reduceForm, reason: e.target.value })}
                  placeholder="e.g. Damaged, Internal service use"
                  className="mt-1 block w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReduceModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-750 text-white rounded-xl font-bold"
                >
                  Reduce Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock History Logs Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-955/60 backdrop-blur-xs flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-fade-in text-xs font-semibold">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
                Stock History Logs ({historyPart})
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-xl font-bold"
              >
                Close
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2.5 pr-1">
              {historyLogs.length > 0 ? (
                historyLogs.map(log => (
                  <div key={log._id} className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-0.5 rounded font-extrabold text-[8px] uppercase ${
                        log.action === 'INVENTORY_CREATE' 
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                          : log.action === 'INVENTORY_RESTOCK'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : log.action === 'INVENTORY_REDUCE'
                              ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400'
                      }`}>{log.action.replace('INVENTORY_', '')}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{log.description}</p>
                    <div className="text-[10px] text-slate-450 font-medium">Logged by: {log.userEmail}</div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-slate-400 font-semibold">No stock actions history logged for this part number.</div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
