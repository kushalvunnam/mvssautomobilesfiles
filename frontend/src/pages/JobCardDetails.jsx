import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { 
  FileText, 
  Printer, 
  Download, 
  Clock, 
  User, 
  Car, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  FileCheck,
  Users
} from 'lucide-react';

export default function JobCardDetails({ jcId, token, onBack, onCreateEstimate, onViewEstimate, onConvertInvoice }) {
  const [jc, setJc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [qtyInputs, setQtyInputs] = useState({});
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [modalData, setModalData] = useState({
    technicianRemarks: '',
    estimatedCompletionDate: '',
    jobProgress: 0,
    qcRemarks: '',
    qcStatus: ''
  });

  const handleQtyChange = (partId, val) => {
    setQtyInputs({ ...qtyInputs, [partId]: val });
  };

  const handleIssuePart = async (partId) => {
    const qty = Number(qtyInputs[partId]) || 0;
    if (qty <= 0) {
      alert('Please enter a quantity greater than zero to issue.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/estimates/${estimate._id}/parts/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ partId, qtyToIssue: qty })
      });
      if (res.ok) {
        alert('Stock deducted and parts issued successfully!');
        setQtyInputs({ ...qtyInputs, [partId]: '' });
        fetchEstimate();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to issue parts.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnPart = async (partId) => {
    const qty = Number(qtyInputs[partId]) || 0;
    if (qty <= 0) {
      alert('Please enter a quantity greater than zero to return.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/estimates/${estimate._id}/parts/return`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ partId, qtyToReturn: qty })
      });
      if (res.ok) {
        alert('Parts returned and inventory restocked successfully!');
        setQtyInputs({ ...qtyInputs, [partId]: '' });
        fetchEstimate();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to return parts.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (jc) {
      setModalData({
        technicianRemarks: jc.technicianRemarks || '',
        estimatedCompletionDate: jc.estimatedCompletionDate ? jc.estimatedCompletionDate.split('T')[0] : '',
        jobProgress: jc.jobProgress || 0,
        qcRemarks: jc.qcRemarks || '',
        qcStatus: jc.qcStatus || ''
      });
    }
  }, [jc, showUpdateModal]);

  const fetchEstimate = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/estimates?jobCardId=${jcId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const approved = data.find(e => e.status === 'Approved') || data[0];
          setEstimate(approved);
        } else {
          setEstimate(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobcards/${jcId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setJc(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchEstimate();
  }, [jcId]);

  const updateFields = async (updates) => {
    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/jobcards/${jcId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        fetchDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (nextStatus) => {
    await updateFields({ status: nextStatus });
  };

  const handleModalSave = async (e) => {
    e.preventDefault();
    const updates = { ...modalData };
    if (jc.status === 'Quality Check') {
      if (modalData.qcStatus === 'Fail' || modalData.qcStatus === 'Rework Required') {
        updates.status = 'Work In Progress';
      } else if (modalData.qcStatus === 'Pass') {
        updates.status = 'Ready for Delivery';
      }
    }
    await updateFields(updates);
    setShowUpdateModal(false);
  };

  const printGatePass = () => {
    if (!jc) return;
    const hostname = window.location.hostname;
    const isCloud = hostname.includes('vercel.app') || 
                    hostname.includes('surge.sh') || 
                    hostname.includes('github.io') || 
                    hostname.includes('loca.lt') || 
                    hostname.includes('pinggy') || 
                    hostname.includes('lhr.life') || 
                    hostname.includes('ngrok');
    // const apiHost = '';
    window.open(`${API_BASE_URL}/jobcards/${jc._id}/gatepass/pdf`, '_blank');
  };

  if (loading) {
    return <div className="p-8 text-center text-sm font-semibold text-slate-400">Loading details...</div>;
  }

  if (!jc) {
    return <div className="p-8 text-center text-red-500 font-semibold text-sm">Failed to load Job Card.</div>;
  }

  const formatKey = (str) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

  // PDF download URL
  const pdfUrl = `${API_BASE_URL}/jobcards/${jc._id}/pdf?token=${token}`;

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* Action Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl print:hidden">
        <button
          onClick={onBack}
          className="text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-2 rounded-xl transition-all"
        >
          &larr; Back to List
        </button>

        <div className="flex gap-2">
          {/* Status Update Buttons */}
          {jc.status === 'Created' && (
            <button
              onClick={() => updateStatus('Inspect Stage')}
              disabled={updating}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Allot to Inspect Stage
            </button>
          )}
          {jc.status === 'Inspect Stage' && (
            <button
              onClick={onCreateEstimate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <FileCheck className="w-4 h-4" /> Prepare Estimate
            </button>
          )}
          {jc.status === 'Estimation' && (
            <button
              onClick={() => updateStatus('Customer Approval')}
              disabled={updating}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Send for Customer Approval
            </button>
          )}
          {jc.status === 'Customer Approval' && (
            <button
              onClick={() => updateStatus('Work In Progress')}
              disabled={updating}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Approve & Start Work
            </button>
          )}
          {jc.status === 'Work In Progress' && (
            <button
              onClick={() => {
                if (jc.workCategory === 'B/P' || jc.workCategory === 'Insurance Jobs') {
                  updateStatus('Body Shop');
                } else {
                  updateStatus('Quality Check');
                }
              }}
              disabled={updating}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {(jc.workCategory === 'B/P' || jc.workCategory === 'Insurance Jobs') ? 'Submit to Body Shop' : 'Submit to Quality Check'}
            </button>
          )}
          {jc.status === 'Body Shop' && (
            <button
              onClick={() => {
                if (jc.workCategory === 'Insurance Jobs') {
                  updateStatus('Surveyor Approval');
                } else {
                  updateStatus('Quality Check');
                }
              }}
              disabled={updating}
              className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              {jc.workCategory === 'Insurance Jobs' ? 'Forward to Surveyor Approval' : 'Forward to Quality Check'}
            </button>
          )}
          {jc.status === 'Surveyor Approval' && (
            <button
              onClick={() => updateStatus('Repair')}
              disabled={updating}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Approve Surveyor Claim & Start Repair
            </button>
          )}
          {jc.status === 'Repair' && (
            <button
              onClick={() => updateStatus('Quality Check')}
              disabled={updating}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Submit Repair to Quality Check
            </button>
          )}
          {jc.status === 'Quality Check' && (
            <button
              onClick={() => updateStatus('Ready for Delivery')}
              disabled={updating}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
            >
              Pass Quality Check
            </button>
          )}
          {jc.status === 'Ready for Delivery' && (
            <button
              onClick={onConvertInvoice}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              Generate Tax Invoice
            </button>
          )}

          {jc.status === 'Delivered' && (
            <button
              onClick={printGatePass}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              <Printer className="w-4 h-4" /> Print Gate Pass
            </button>
          )}

          {/* PDF & print operations */}
          <a
            href={pdfUrl}
            onClick={(e) => {
              if (token === 'mock_jwt_token_for_offline_demo') {
                e.preventDefault();
                window.print();
              }
            }}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-205/20"
          >
            <Download className="w-4 h-4" /> Download PDF
          </a>
          {['Work In Progress', 'Body Shop', 'Quality Check'].includes(jc.status) && (
            <button
              onClick={() => setShowUpdateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
            >
              Update Work Log / QC
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl text-xs font-bold transition-all border border-slate-205/20"
          >
            <Printer className="w-4 h-4" /> Print Card
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm print:shadow-none print:border-none print:p-0 space-y-8">
        
        {/* Brand Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider">MVSS AUTOMOBILES PRIVATE LIMITED</h2>
            <p className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1">
              Sy. No. 25/1, Opp. Cine Planet, Beside PSR Convention, Kompally, Hyderabad - 500014. <br />
              PH. No. 9949479765 | Email: accounts@auto4m.in
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider mb-2">
              Job Card: {jc.jobCardNo}
            </span>
            <p className="text-xs text-slate-400 font-semibold">Date: {new Date(jc.date).toLocaleDateString('en-IN')}</p>
            <p className="text-xs text-slate-400 font-semibold">Time: {jc.time}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">Status: <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{jc.status}</span></p>
          </div>
        </div>

        {/* Customer, Vehicle & Staff Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950/10 p-5 rounded-2xl border border-slate-100 dark:border-slate-850">
          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <User className="w-4 h-4" /> Customer Information
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-white text-sm">{jc.customerId?.name}</p>
              <p className="font-semibold">Mobile: {jc.customerId?.mobile}</p>
              <p className="font-semibold text-slate-500">Address: {jc.customerId?.address || 'N/A'}</p>
              {jc.contactPerson && <p className="font-semibold text-slate-500">Contact Person: {jc.contactPerson}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Car className="w-4 h-4" /> Vehicle Details
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-indigo-650 dark:text-indigo-400 text-sm font-mono tracking-wider">{jc.vehicleId?.vehicleNumber}</p>
              <p className="font-semibold">{jc.vehicleId?.make} {jc.vehicleId?.model} {jc.vehicleId?.variant}</p>
              <p className="font-semibold">Chassis No: <span className="font-mono">{jc.vehicleId?.chassisNumber || 'N/A'}</span></p>
              <p className="font-semibold">Engine No: <span className="font-mono">{jc.vehicleId?.engineNumber || 'N/A'}</span></p>
              <p className="font-bold text-slate-900 dark:text-white mb-2">Odometer: {jc.odometerReading.toLocaleString()} km</p>
              <p className="font-semibold">Service Type: {jc.serviceType || 'General Servicing'}</p>
              {jc.workCategory && (
                <p className="font-semibold">
                  Customer Type: <span className="font-bold text-slate-900 dark:text-white">
                    {jc.workCategory === 'RR' ? 'RR(Running repair)' :
                     jc.workCategory === 'PMS' ? 'pMS(periodical maintainence service)' :
                     jc.workCategory === 'B/P' ? 'body shop(bshop)' :
                     jc.workCategory === 'Corporate' ? 'corporate' :
                     jc.workCategory === 'General Service' ? 'General Service' :
                     jc.workCategory === 'Insurance Jobs' ? 'insurance' : jc.workCategory}
                  </span>
                </p>
              )}
              {jc.jobType && <p className="font-semibold">Job Type: <span className="font-bold text-slate-900 dark:text-white">{jc.jobType}</span></p>}
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Users className="w-4 h-4" /> Staff Assignment
            </h4>
            <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <p className="font-semibold text-slate-550">Service Advisor: <span className="font-bold text-slate-900 dark:text-white">{jc.serviceAdvisorName || 'N/A'}</span></p>
              <p className="font-semibold text-slate-550">Technician: <span className="font-bold text-slate-900 dark:text-white">{jc.technicianName || 'N/A'}</span></p>
              <p className="font-semibold text-slate-550">Quality Checker (QC): <span className="font-bold text-slate-900 dark:text-white">{jc.qcName || 'N/A'}</span></p>
              <p className="font-semibold text-slate-550">Floor Incharge: <span className="font-bold text-slate-900 dark:text-white">{jc.floorInchargeName || 'N/A'}</span></p>
              {jc.jobProgress !== undefined && jc.jobProgress > 0 && (
                <p className="font-semibold text-slate-550">
                  Progress: <span className="font-extrabold text-indigo-650 dark:text-indigo-400">{jc.jobProgress}%</span>
                </p>
              )}
              {jc.estimatedCompletionDate && (
                <p className="font-semibold text-slate-550">
                  Est. Completion: <span className="font-bold text-slate-900 dark:text-white">{new Date(jc.estimatedCompletionDate).toLocaleDateString('en-IN')}</span>
                </p>
              )}
              {jc.qcStatus && (
                <p className="font-semibold text-slate-550">
                  QC Status: <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${
                    jc.qcStatus === 'Pass' 
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                      : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                  }`}>{jc.qcStatus}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 32 Inspection items Grid */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b pb-2 uppercase tracking-wide">
            32 Servicing and Maintenance Checklist
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
            {Object.entries(jc.inspectionChecklist || {})
              .filter(([_, val]) => {
                if (!val) return false;
                if (typeof val === 'string') return val !== '';
                return val.status && val.status !== '';
              })
              .map(([key, val]) => {
                const status = typeof val === 'string' ? (val === 'OK' ? 'Yes' : val === 'Not OK' ? 'No' : val) : (val.status || '');
                const remarks = typeof val === 'string' ? '' : (val.remarks || '');
                const isPositive = status === 'Yes' || status === 'OK';
                
                return (
                  <div key={key} className="flex flex-col py-1.5 border-b border-slate-100 dark:border-slate-800/50 gap-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-350">{formatKey(key)}</span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                        isPositive 
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' 
                          : 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {status}
                      </span>
                    </div>
                    {remarks && (
                      <span className="text-[10px] text-slate-400 italic font-medium">
                        Remark: {remarks}
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Accessories & Fuel Position */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b pb-2 uppercase tracking-wide">Accessories Inventory</h4>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
              {Object.entries(jc.accessories || {})
                .filter(([_, val]) => val === 'Yes' || (val && val !== 'No' && val !== '0'))
                .map(([key, val]) => (
                  <span key={key} className="bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400 px-2.5 py-1 rounded-lg">
                    {formatKey(key)}: <strong className="font-extrabold">{val}</strong>
                  </span>
                ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b pb-2 uppercase tracking-wide">Fuel needle & promised delivery</h4>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Fuel Level</span>
                <span className="text-sm font-black text-indigo-650 dark:text-indigo-400">
                  {jc.fuelLevel === 'E' ? 'Empty' : jc.fuelLevel === '1/2' ? 'Half' : jc.fuelLevel === 'F' ? 'Full' : jc.fuelLevel}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estimated Repairs</span>
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">₹{jc.estAmt?.toLocaleString()}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Promised Delivery</span>
                <span className="font-bold text-slate-750 dark:text-slate-300">
                  {jc.promDate ? new Date(jc.promDate).toLocaleDateString('en-IN') : 'TBD'} @ {jc.promTime || 'TBD'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Spares Allocation & Dispatch Section */}
        {estimate && estimate.parts && estimate.parts.length > 0 && (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h4 className="text-xs font-black text-slate-855 dark:text-slate-200 uppercase tracking-wide">
                Spares Dispatch & Inventory Allocation
              </h4>
              <span className="text-[10px] font-bold text-slate-400 font-mono">Estimate Ref: {estimate.estimateNo} ({estimate.status})</span>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4">Spare Part Name</th>
                      <th className="p-4 font-mono">Part Number</th>
                      <th className="p-4 text-center">Parts Required</th>
                      <th className="p-4 text-center text-indigo-650 dark:text-indigo-400 font-bold">Parts Issued</th>
                      <th className="p-4 text-center text-rose-650 dark:text-rose-455 font-bold">Parts Returned</th>
                      <th className="p-4 text-center font-bold">Stock Deduction</th>
                      <th className="p-4 text-right">Spares Allocation Dispatch Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {estimate.parts.map(part => {
                      const deduction = part.qtyIssued - part.qtyReturned;
                      const canIssueCount = part.qty - deduction;
                      const canReturnCount = deduction;

                      return (
                        <tr key={part._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all font-semibold">
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{part.name}</td>
                          <td className="p-4 font-mono text-slate-500">{part.partNo || '—'}</td>
                          <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">{part.qty} units</td>
                          <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{part.qtyIssued} units</td>
                          <td className="p-4 text-center font-bold text-rose-600 dark:text-rose-450">{part.qtyReturned} units</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded font-extrabold text-[10px] ${
                              deduction > 0 ? 'bg-amber-50 text-amber-700 dark:bg-amber-955/20 dark:text-amber-400' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'
                            }`}>
                              {deduction} units
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex gap-2 justify-end items-center">
                              <input
                                type="text"
                                inputMode="numeric"
                                placeholder="Qty"
                                value={qtyInputs[part.partId] || ''}
                                onChange={(e) => handleQtyChange(part.partId, e.target.value.replace(/[^0-9]/g, ''))}
                                className="w-12 px-2 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-center text-xs font-mono focus:outline-none"
                              />
                              <button
                                onClick={() => handleIssuePart(part.partId)}
                                disabled={canIssueCount <= 0}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-600 dark:bg-emerald-950/20 dark:hover:bg-emerald-600 text-emerald-600 dark:text-emerald-450 hover:text-white dark:hover:text-white border border-emerald-100 dark:border-emerald-950/80 rounded text-[10px] font-bold transition-all disabled:opacity-40"
                              >
                                Issue
                              </button>
                              <button
                                onClick={() => handleReturnPart(part.partId)}
                                disabled={canReturnCount <= 0}
                                className="px-2.5 py-1 bg-rose-50 hover:bg-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-600 text-rose-600 dark:text-rose-450 hover:text-white dark:hover:text-white border border-rose-100 dark:border-rose-950/80 rounded text-[10px] font-bold transition-all disabled:opacity-40"
                              >
                                Return
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Notes & Remarks Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Advisor Notes</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold whitespace-pre-line min-h-[40px]">
              {jc.advisorNotes || 'No advisor notes.'}
            </p>
          </div>
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Technician Notes</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold whitespace-pre-line min-h-[40px]">
              {jc.technicianNotes || 'No technician notes.'}
            </p>
          </div>
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Internal Remarks</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold whitespace-pre-line min-h-[40px]">
              {jc.internalRemarks || 'No internal remarks.'}
            </p>
          </div>
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">Technician Remarks</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold whitespace-pre-line min-h-[40px]">
              {jc.technicianRemarks || 'No technician remarks.'}
            </p>
          </div>
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950/20 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-850">
            <h4 className="text-[10px] font-black text-slate-450 uppercase tracking-wider">QC Remarks</h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold whitespace-pre-line min-h-[40px]">
              {jc.qcRemarks || 'No QC remarks.'}
            </p>
          </div>
        </div>

        {/* Attached Photos / Documents Gallery */}
        {jc.photos && jc.photos.length > 0 && (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6 print:hidden animate-fade-in">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-205 uppercase tracking-wide">
              Attached Photos & Supporting Documents
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {jc.photos.map((photo, index) => {
                if (!photo || !photo.url) return null;
                const isAbsolute = photo.url.startsWith('http') || photo.url.startsWith('blob:') || photo.url.startsWith('data:');
                const hostname = window.location.hostname;
                const isCloud = hostname.includes('vercel.app') || hostname.includes('surge.sh') || hostname.includes('github.io') || hostname.includes('loca.lt') || hostname.includes('pinggy') || hostname.includes('lhr.life') || hostname.includes('ngrok');
                // const base = '';
                const src = isAbsolute ? photo.url : `${API_BASE_URL.replace('/api', '')}${photo.url}`;
                
                return (
                  <div key={index} className="relative group border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-sm transition-all hover:shadow-md">
                    <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                      {(photo.url.toLowerCase().endsWith('.pdf') || photo.photoType === 'Document') ? (
                        <div className="flex flex-col items-center justify-center p-4">
                          <FileText className="w-8 h-8 text-indigo-500" />
                          <span className="text-[10px] font-bold text-slate-500 mt-2">Document Copy</span>
                        </div>
                      ) : (
                        <img 
                          src={src} 
                          alt={`Attachment ${index + 1}`} 
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                          onClick={() => window.open(src, '_blank')}
                        />
                      )}
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
                        {photo.photoType || 'Photo'}
                      </span>
                      <a 
                        href={src} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] font-bold text-indigo-650 hover:text-indigo-700 uppercase"
                      >
                        View Full
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Damage markings & Complaints list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b pb-2 uppercase tracking-wide">Customer Complaints</h4>
            <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-350">
              {jc.complaints && jc.complaints.length > 0 ? (
                jc.complaints.map((c, i) => (
                  <p key={i} className="font-medium flex gap-2">
                    <span className="text-indigo-500 font-bold">{i+1}.</span> {c}
                  </p>
                ))
              ) : (
                <p className="text-slate-450 italic">No complaints registered.</p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 border-b pb-2 uppercase tracking-wide">Damage Layout Markings</h4>
            <div className="space-y-1.5 text-xs">
              {jc.damageMarkings && jc.damageMarkings.length > 0 ? (
                jc.damageMarkings.map((m, i) => (
                  <p key={i} className="font-medium">
                    <span className="font-bold text-red-500">[{m.type}]</span> {m.description || 'No description notes'}
                  </p>
                ))
              ) : (
                <p className="text-slate-450 italic">No body damage marked.</p>
              )}
            </div>
          </div>
        </div>

        {/* Signatures & QR Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 border-t border-slate-100 dark:border-slate-800 pt-6">
          
          {/* Customer Signature box */}
          <div className="flex flex-col items-center justify-between border border-slate-100 dark:border-slate-800 p-4 rounded-2xl h-36">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Customer Signature</span>
            {jc.signatures?.customer ? (
              <img src={jc.signatures.customer} alt="Customer Sig" className="max-h-16 w-auto object-contain" />
            ) : (
              <span className="text-[10px] text-slate-400 italic">No signature logged</span>
            )}
            <span className="w-32 border-b border-slate-200 dark:border-slate-700" />
          </div>

          {/* Technician Signature box */}
          <div className="flex flex-col items-center justify-between border border-slate-100 dark:border-slate-800 p-4 rounded-2xl h-36">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Technician Signature</span>
            {jc.signatures?.technician ? (
              <img src={jc.signatures.technician} alt="Technician Sig" className="max-h-16 w-auto object-contain" />
            ) : (
              <span className="text-[10px] text-slate-400 italic">No signature logged</span>
            )}
            <span className="w-32 border-b border-slate-200 dark:border-slate-700" />
          </div>

          {/* Advisor Signature box */}
          <div className="flex flex-col items-center justify-between border border-slate-100 dark:border-slate-800 p-4 rounded-2xl h-36">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Service Advisor Signature</span>
            {jc.signatures?.advisor ? (
              <img src={jc.signatures.advisor} alt="Advisor Sig" className="max-h-16 w-auto object-contain" />
            ) : (
              <span className="text-[10px] text-slate-400 italic">No signature logged</span>
            )}
            <span className="w-32 border-b border-slate-200 dark:border-slate-700" />
          </div>

          {/* QR Code Indicator */}
          <div className="flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 p-4 rounded-2xl h-36 text-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Scan Job Card Details</span>
            {/* Visual QR Code Mock using SVG */}
            <svg width="60" height="60" viewBox="0 0 100 100" className="text-slate-800 dark:text-slate-200">
              <rect x="0" y="0" width="25" height="25" fill="currentColor" />
              <rect x="5" y="5" width="15" height="15" fill="white" />
              <rect x="8" y="8" width="9" height="9" fill="currentColor" />
              
              <rect x="75" y="0" width="25" height="25" fill="currentColor" />
              <rect x="80" y="5" width="15" height="15" fill="white" />
              <rect x="83" y="8" width="9" height="9" fill="currentColor" />

              <rect x="0" y="75" width="25" height="25" fill="currentColor" />
              <rect x="5" y="80" width="15" height="15" fill="white" />
              <rect x="8" y="83" width="9" height="9" fill="currentColor" />

              {/* Random QR pixels */}
              <rect x="35" y="10" width="10" height="10" fill="currentColor" />
              <rect x="50" y="20" width="15" height="5" fill="currentColor" />
              <rect x="35" y="45" width="15" height="15" fill="currentColor" />
              <rect x="55" y="50" width="10" height="10" fill="currentColor" />
              <rect x="80" y="40" width="10" height="20" fill="currentColor" />
              <rect x="15" y="40" width="5" height="25" fill="currentColor" />
              <rect x="40" y="75" width="20" height="10" fill="currentColor" />
              <rect x="75" y="75" width="15" height="5" fill="currentColor" />
            </svg>
            <span className="text-[8px] text-slate-400 mt-2 font-mono">ID: {jc.jobCardNo}</span>
          </div>

        </div>

      </div>

      {showUpdateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in print:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b pb-2">
              Update Job Card Work Log / QC
            </h3>
            
            <form onSubmit={handleModalSave} className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
              
              {/* If WIP or Body Shop stage */}
              {['Work In Progress', 'Body Shop'].includes(jc.status) && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Technician Remarks</label>
                    <textarea
                      rows="3"
                      value={modalData.technicianRemarks}
                      onChange={(e) => setModalData({ ...modalData, technicianRemarks: e.target.value })}
                      placeholder="e.g. Completed engine tuning, currently inspecting brake pads..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 resize-none font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Job Progress (0-100%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={modalData.jobProgress}
                        onChange={(e) => setModalData({ ...modalData, jobProgress: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Est. Completion Date</label>
                      <input
                        type="date"
                        value={modalData.estimatedCompletionDate}
                        onChange={(e) => setModalData({ ...modalData, estimatedCompletionDate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 font-bold"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* If Quality Check stage */}
              {jc.status === 'Quality Check' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">QC Remarks / Comments</label>
                    <textarea
                      rows="3"
                      value={modalData.qcRemarks}
                      onChange={(e) => setModalData({ ...modalData, qcRemarks: e.target.value })}
                      placeholder="Log quality checking notes or details of rework required..."
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 resize-none font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">QC Status Check</label>
                    <select
                      value={modalData.qcStatus}
                      onChange={(e) => setModalData({ ...modalData, qcStatus: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl focus:outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-slate-250"
                      required
                    >
                      <option value="">-- Select QC Verification --</option>
                      <option value="Pass">Pass (Ready for Delivery)</option>
                      <option value="Fail">Fail (Revert to Work In Progress)</option>
                      <option value="Rework Required">Rework Required (Revert to WIP)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
                >
                  Save Log Updates
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
