import React, { useState, useEffect } from 'react';
import { Search, Plus, Receipt, Download, Share2, Mail, CheckCircle2, Printer, Edit2 } from 'lucide-react';
import InvoiceForm from './InvoiceForm';

export default function Invoices({ token, user, setActiveTab }) {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list', 'create', 'edit'
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  
  // Modals for Mock sharing
  const [shareModal, setShareModal] = useState({ show: false, type: 'whatsapp', invoice: null });
  const [sharePhone, setSharePhone] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareSuccess, setShareSuccess] = useState(false);

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/invoices?status=${statusFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Filter search locally for robustness
        const filtered = data.filter(inv => {
          const invNo = inv.invoiceNo || '';
          const name = inv.customerId?.name || '';
          const mobile = inv.customerId?.mobile || '';
          const plate = inv.vehicleId?.vehicleNumber || '';
          return (
            invNo.toLowerCase().includes(search.toLowerCase()) ||
            name.toLowerCase().includes(search.toLowerCase()) ||
            mobile.includes(search) ||
            plate.toLowerCase().includes(search.toLowerCase())
          );
        });
        setInvoices(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (viewMode === 'list') {
      fetchInvoices();
    }
  }, [search, statusFilter, viewMode]);

  const handleSaved = () => {
    setViewMode('list');
    setSelectedInvoiceId(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedInvoiceId(null);
  };

  const handleOpenEdit = (id, e) => {
    if (e) e.stopPropagation();
    setSelectedInvoiceId(id);
    setViewMode('edit');
  };

  const finalizeInvoice = async (id) => {
    if (!confirm('Are you sure you want to finalize this invoice? This will deduct parts from inventory.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/invoices/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Finalized', paymentStatus: 'Paid' })
      });
      if (res.ok) {
        fetchInvoices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open sharing modal
  const openShare = (inv, type) => {
    setShareModal({ show: true, type, invoice: inv });
    setSharePhone(inv.customerId?.mobile || '');
    setShareEmail(inv.customerId?.email || '');
    setShareSuccess(false);
  };

  const executeMockShare = () => {
    setShareSuccess(true);
    setTimeout(() => {
      setShareModal({ show: false, type: 'whatsapp', invoice: null });
      setShareSuccess(false);
    }, 1500);
  };

  const printInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download/print invoices.');
      return;
    }
    
    const convertNumberToWords = (num) => {
      const roundedNum = Math.round(num * 100) / 100;
      if (roundedNum === 0) return 'Rupees Zero Only';
      
      const a = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
        'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
      ];
      const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
      
      function convert(n) {
        if (n < 20) return a[n];
        if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
        if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
        if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
        if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
        return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
      }
      
      const parts = roundedNum.toString().split('.');
      const rupees = parseInt(parts[0], 10);
      const paise = parts[1] ? parseInt(parts[1].padEnd(2, '0').slice(0, 2), 10) : 0;
      
      let result = 'Rupees ';
      if (rupees > 0) {
        result += convert(rupees);
      } else {
        result += 'Zero';
      }
      
      if (paise > 0) {
        result += ' and ' + convert(paise) + ' Paise';
      }
      result += ' Only';
      return result.replace(/\s+/g, ' ').trim();
    };

    const isInterstate = inv.gstDetails?.isInterstate || false;

    let partsRowsHtml = '';
    if (inv.parts && inv.parts.length > 0) {
      inv.parts.forEach((p, idx) => {
        const taxable = (p.qty || 0) * (p.rate || 0);
        const taxAmt = taxable * ((p.gstPercent || 0) / 100);
        const net = taxable + taxAmt;
        
        let taxSplitHtml = '';
        if (isInterstate) {
          taxSplitHtml = `<td>IGST (${p.gstPercent}%)<br/>₹${taxAmt.toFixed(2)}</td>`;
        } else {
          const halfPct = p.gstPercent / 2;
          const halfAmt = taxAmt / 2;
          taxSplitHtml = `<td>CGST (${halfPct}%)<br/>₹${halfAmt.toFixed(2)}</td><td>SGST (${halfPct}%)<br/>₹${halfAmt.toFixed(2)}</td>`;
        }

        partsRowsHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td style="text-align: left;"><strong>${p.name || 'Spare Part'}</strong><br/><span style="font-size: 10px; color: #555;">No: ${p.partNo || 'N/A'}</span></td>
            <td>${p.hsnCode || '8708'}</td>
            <td>${p.qty}</td>
            <td>₹${p.rate.toFixed(2)}</td>
            <td>₹${taxable.toFixed(2)}</td>
            ${taxSplitHtml}
            <td><strong>₹${net.toFixed(2)}</strong></td>
          </tr>
        `;
      });
    } else {
      partsRowsHtml = `<tr><td colspan="${isInterstate ? 8 : 9}" style="text-align: center; color: #888;">No spare parts items.</td></tr>`;
    }

    let labourRowsHtml = '';
    if (inv.labour && inv.labour.length > 0) {
      inv.labour.forEach((l, idx) => {
        const taxable = l.rate || 0;
        const taxAmt = taxable * ((l.gstPercent || 0) / 100);
        const net = taxable + taxAmt;
        
        let taxSplitHtml = '';
        if (isInterstate) {
          taxSplitHtml = `<td>IGST (${l.gstPercent}%)<br/>₹${taxAmt.toFixed(2)}</td>`;
        } else {
          const halfPct = l.gstPercent / 2;
          const halfAmt = taxAmt / 2;
          taxSplitHtml = `<td>CGST (${halfPct}%)<br/>₹${halfAmt.toFixed(2)}</td><td>SGST (${halfPct}%)<br/>₹${halfAmt.toFixed(2)}</td>`;
        }

        labourRowsHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td style="text-align: left;"><strong>${l.description || 'Labour Service'}</strong></td>
            <td>9987</td>
            <td>1</td>
            <td>₹${taxable.toFixed(2)}</td>
            <td>₹${taxable.toFixed(2)}</td>
            ${taxSplitHtml}
            <td><strong>₹${net.toFixed(2)}</strong></td>
          </tr>
        `;
      });
    } else {
      labourRowsHtml = `<tr><td colspan="${isInterstate ? 8 : 9}" style="text-align: center; color: #888;">No labour charges items.</td></tr>`;
    }

    const dateStr = new Date(inv.date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'long', day: 'numeric'
    });

    let partsTotal = 0;
    let labourTotal = 0;
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    let gstTotal = 0;

    if (inv.parts && inv.parts.length > 0) {
      inv.parts.forEach(p => {
        const taxable = (p.qty || 0) * (p.rate || 0);
        const gstPercent = (p.gstPercent !== undefined && p.gstPercent !== null && p.gstPercent !== '') ? Number(p.gstPercent) : 18;
        const taxAmt = taxable * (gstPercent / 100);
        partsTotal += taxable;
        gstTotal += taxAmt;
        if (isInterstate) {
          igstTotal += taxAmt;
        } else {
          cgstTotal += taxAmt / 2;
          sgstTotal += taxAmt / 2;
        }
      });
    }

    if (inv.labour && inv.labour.length > 0) {
      inv.labour.forEach(l => {
        const taxable = l.rate || 0;
        const gstPercent = (l.gstPercent !== undefined && l.gstPercent !== null && l.gstPercent !== '') ? Number(l.gstPercent) : 18;
        const taxAmt = taxable * (gstPercent / 100);
        labourTotal += taxable;
        gstTotal += taxAmt;
        if (isInterstate) {
          igstTotal += taxAmt;
        } else {
          cgstTotal += taxAmt / 2;
          sgstTotal += taxAmt / 2;
        }
      });
    }

    const grandTotal = Math.round((partsTotal + labourTotal + gstTotal) * 100) / 100;

    const insuranceComp = inv.insuranceClaimDetails?.insuranceCompany || inv.insuranceDetails?.insuranceCompany || '';
    const claimNo = inv.insuranceClaimDetails?.claimNo || inv.insuranceDetails?.claimNo || '';
    const approvedAmt = inv.insuranceClaimDetails?.approvedAmount || inv.insuranceDetails?.approvedAmount || 0;
    const customerPayable = inv.insuranceClaimDetails?.customerPayableAmount || inv.insuranceDetails?.customerPayableAmount || grandTotal;

    printWindow.document.write(`
      <html>
        <head>
          <title>GST Tax Invoice - ${inv.invoiceNo}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #333;
              margin: 0;
              padding: 20px;
              font-size: 11px;
              line-height: 1.4;
            }
            .invoice-box {
              max-width: 800px;
              margin: auto;
              border: 1px solid #eee;
              padding: 25px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
              background: #fff;
            }
            .header-table, .meta-table, .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .header-table td {
              vertical-align: top;
            }
            .title {
              font-size: 24px;
              font-weight: 900;
              color: #1e3a8a;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin: 0;
            }
            .subtitle {
              font-size: 10px;
              font-weight: bold;
              color: #666;
              margin: 2px 0 0 0;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .company-details {
              text-align: right;
              font-size: 10px;
            }
            .company-name {
              font-size: 14px;
              font-weight: 900;
              color: #111;
              margin-bottom: 4px;
            }
            .meta-table td {
              border: 1px solid #e5e7eb;
              padding: 10px;
              width: 50%;
              vertical-align: top;
            }
            .section-title {
              font-size: 10px;
              font-weight: 800;
              color: #1e3a8a;
              text-transform: uppercase;
              border-bottom: 1px solid #1e3a8a;
              padding-bottom: 4px;
              margin-bottom: 8px;
            }
            .items-table th {
              background: #1e3a8a;
              color: #fff;
              font-weight: bold;
              text-transform: uppercase;
              font-size: 9px;
              padding: 8px;
              border: 1px solid #1e3a8a;
              text-align: center;
            }
            .items-table td {
              padding: 8px;
              border: 1px solid #e5e7eb;
              text-align: center;
              vertical-align: middle;
            }
            .totals-table {
              width: 40%;
              margin-left: auto;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .totals-table td {
              padding: 6px;
              border: 1px solid #e5e7eb;
            }
            .totals-table tr.grand-total td {
              background: #f3f4f6;
              font-weight: 900;
              font-size: 12px;
              color: #1e3a8a;
              border-top: 2px solid #1e3a8a;
            }
            .words {
              margin: 15px 0;
              padding: 10px;
              background: #f9fafb;
              border: 1px dashed #d1d5db;
              font-style: italic;
              font-weight: bold;
            }
            .insurance-block {
              margin: 15px 0;
              padding: 10px;
              background: #eff6ff;
              border: 1px solid #bfdbfe;
              border-radius: 6px;
            }
            .footer-section {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              text-align: center;
              border-top: 1px solid #ccc;
              width: 200px;
              padding-top: 8px;
              margin-top: 30px;
              font-weight: bold;
            }
            @media print {
              body { padding: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <table class="header-table">
              <tr>
                <td>
                  <div class="title">${inv.invoiceType || 'Tax Invoice'}</div>
                  <div class="subtitle">Original for Recipient</div>
                </td>
                <td class="company-details">
                  <div class="company-name">MVSS AUTOMOBILES PRIVATE LIMITED</div>
                  <div>Sy. No. 25/1, Opp. Cine Planet, Beside PSR Convention</div>
                  <div>Kompally, Hyderabad, Telangana - 500014</div>
                  <div>GSTIN: <strong>36AAJCM4778P1ZI</strong> (State Code: 36)</div>
                  <div>Email: accounts@auto4m.in | Cell: 99494 79765</div>
                </td>
              </tr>
            </table>

            <table class="meta-table">
              <tr>
                <td>
                  <div class="section-title">Invoice Details</div>
                  <table style="width:100%; border:none;">
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold; width:35%;">${inv.invoiceType === 'Proforma invoice' ? 'Proforma No:' : 'Invoice No:'}</td><td style="border:none; padding:2px; font-family: monospace; font-size:12px; font-weight:bold;">${inv.invoiceNo}</td></tr>
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Date:</td><td style="border:none; padding:2px;">${dateStr}</td></tr>
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Status:</td><td style="border:none; padding:2px; text-transform:uppercase; font-weight:bold; color: ${inv.status === 'Finalized' ? 'green' : 'orange'}">${inv.status}</td></tr>
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Billing Type:</td><td style="border:none; padding:2px;">${isInterstate ? 'IGST Interstate' : 'CGST/SGST Intra-state'}</td></tr>
                    ${inv.poNumber ? `<tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">PO Number:</td><td style="border:none; padding:2px; font-family: monospace;">${inv.poNumber}</td></tr>` : ''}
                    ${(inv.roNumber || inv.jobCardId?.jobCardNo) ? `<tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">RO Number:</td><td style="border:none; padding:2px; font-family: monospace;">${inv.roNumber || inv.jobCardId?.jobCardNo}</td></tr>` : ''}
                  </table>
                </td>
                <td>
                  <div class="section-title">Customer & Vehicle Details</div>
                  <table style="width:100%; border:none;">
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold; width:35%;">Customer Name:</td><td style="border:none; padding:2px;">${inv.customerId?.name || 'N/A'}</td></tr>
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Address:</td><td style="border:none; padding:2px;">${inv.customerId?.address || 'N/A'}</td></tr>
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Mobile:</td><td style="border:none; padding:2px;">${inv.customerId?.mobile || 'N/A'}</td></tr>
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Vehicle Reg No:</td><td style="border:none; padding:2px; font-family: monospace; font-weight:bold; font-size:11px;">${inv.vehicleId?.vehicleNumber || 'N/A'}</td></tr>
                    <tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Make/Model:</td><td style="border:none; padding:2px;">${inv.vehicleId?.make || ''} ${inv.vehicleId?.model || ''}</td></tr>
                    ${inv.customerId?.gstNumber ? `<tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Customer GSTIN:</td><td style="border:none; padding:2px; font-family: monospace;">${inv.customerId.gstNumber}</td></tr>` : ''}
                    ${claimNo ? `<tr style="border:none;"><td style="border:none; padding:2px; font-weight:bold;">Claim Number:</td><td style="border:none; padding:2px; font-family: monospace;">${claimNo}</td></tr>` : ''}
                  </table>
                </td>
              </tr>
            </table>

            <div class="section-title" style="margin-top: 15px;">A. Spare Parts Details</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;">Sl</th>
                  <th style="width: 35%; text-align: left;">Item Description</th>
                  <th style="width: 10%;">HSN</th>
                  <th style="width: 8%;">Qty</th>
                  <th style="width: 10%;">Rate</th>
                  <th style="width: 10%;">Taxable Value</th>
                  ${isInterstate ? `<th style="width: 12%;">IGST</th>` : `<th style="width: 8%;">CGST</th><th style="width: 8%;">SGST</th>`}
                  <th style="width: 10%;">Net Total</th>
                </tr>
              </thead>
              <tbody>
                ${partsRowsHtml}
              </tbody>
            </table>

            <div class="section-title" style="margin-top: 15px;">B. Labour / Services Details</div>
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;">Sl</th>
                  <th style="width: 35%; text-align: left;">Description</th>
                  <th style="width: 10%;">SAC</th>
                  <th style="width: 8%;">Qty</th>
                  <th style="width: 10%;">Rate</th>
                  <th style="width: 10%;">Taxable Value</th>
                  ${isInterstate ? `<th style="width: 12%;">IGST</th>` : `<th style="width: 8%;">CGST</th><th style="width: 8%;">SGST</th>`}
                  <th style="width: 10%;">Net Total</th>
                </tr>
              </thead>
              <tbody>
                ${labourRowsHtml}
              </tbody>
            </table>

            <div class="words">
              Amount in Words: <strong>${convertNumberToWords(grandTotal)}</strong>
            </div>

            ${(approvedAmt > 0 || insuranceComp || claimNo) ? `
              <div class="insurance-block">
                <h4 style="margin: 0 0 5px 0; color: #1e3a8a; text-transform: uppercase; font-size: 10px; font-weight: 800;">Insurance Settlement Claim Info</h4>
                <table style="width: 100%; border: none; font-size: 10px;">
                  <tr style="border:none;">
                    <td style="border:none; padding:2px; font-weight:bold; width: 15%;">Insurance Provider:</td><td style="border:none; padding:2px; width: 35%;">${insuranceComp || 'N/A'}</td>
                    <td style="border:none; padding:2px; font-weight:bold; width: 15%;">Claim Number:</td><td style="border:none; padding:2px; width: 35%;">${claimNo || 'N/A'}</td>
                  </tr>
                  <tr style="border:none;">
                    <td style="border:none; padding:2px; font-weight:bold;">Approved Amount:</td><td style="border:none; padding:2px; font-weight:bold; color: #16a34a;">₹${approvedAmt.toLocaleString()}</td>
                    <td style="border:none; padding:2px; font-weight:bold;">Customer Balance:</td><td style="border:none; padding:2px; font-weight:bold; color: #dc2626;">₹${customerPayable.toLocaleString()}</td>
                  </tr>
                </table>
              </div>
            ` : ''}

            <table class="totals-table">
              <tr>
                <td>Spare Parts Total:</td>
                <td style="text-align: right;">₹${partsTotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Labour Charges Total:</td>
                <td style="text-align: right;">₹${labourTotal.toFixed(2)}</td>
              </tr>
              <tr style="font-weight: bold; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                <td>Net Total (Taxable Amount):</td>
                <td style="text-align: right;">₹${(partsTotal + labourTotal).toFixed(2)}</td>
              </tr>
              ${isInterstate ? `
                <tr>
                  <td>IGST Total (18%):</td>
                  <td style="text-align: right;">₹${igstTotal.toFixed(2)}</td>
                </tr>
              ` : `
                <tr>
                  <td>CGST Total (9%):</td>
                  <td style="text-align: right;">₹${cgstTotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>SGST Total (9%):</td>
                  <td style="text-align: right;">₹${sgstTotal.toFixed(2)}</td>
                </tr>
              `}
              <tr>
                <td>Total GST Amount:</td>
                <td style="text-align: right;">₹${gstTotal.toFixed(2)}</td>
              </tr>
              <tr class="grand-total">
                <td>Grand Total:</td>
                <td style="text-align: right;">₹${grandTotal.toFixed(2)}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; font-size: 9px; color: #666;">
              <strong>Declaration:</strong> We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct.
            </div>

            <div class="footer-section">
              <div>
                <div style="font-weight: bold; text-decoration: underline; margin-bottom: 5px;">Customer Signature</div>
                <div style="height: 40px;"></div>
              </div>
              <div style="text-align: left; padding-left: 20px;">
                <div style="font-weight: bold; margin-bottom: 5px;">Prepared By:</div>
                <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #111;">${inv.preparedBy || 'Staff Incharge'}</div>
              </div>
              <div>
                <div style="font-weight: bold; text-align: center;">For MVSS AUTOMOBILES PVT. LTD.</div>
                <div class="signature-box">Authorized Signatory</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  const printGatePass = (inv) => {
    const hostname = window.location.hostname;
    const isCloud = hostname.includes('vercel.app') || 
                    hostname.includes('surge.sh') || 
                    hostname.includes('github.io') || 
                    hostname.includes('loca.lt') || 
                    hostname.includes('pinggy') || 
                    hostname.includes('lhr.life') || 
                    hostname.includes('ngrok');
    const apiHost = isCloud ? 'localhost:5000' : `${hostname}:5000`;
    window.open(`http://${apiHost}/api/invoices/${inv._id}/gatepass/pdf`, '_blank');
  };    


  const handleDownload = (inv, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (token === 'mock_jwt_token_for_offline_demo') {
      printInvoice(inv);
    } else {
      window.open(`http://${window.location.hostname}:5000/api/invoices/${inv._id}/pdf?token=${token}`, '_blank');
    }
  };

  const isBillingOrAdmin = user?.role === 'Admin' || user?.role === 'Accounts';

  return (
    <div className="space-y-4 animate-fade-in p-1">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white">GST Tax Invoices</h2>
          <p className="text-xs text-slate-400 font-semibold dark:text-slate-500 font-mono">Invoice management, payment logs, and PDF dispatching</p>
        </div>
        {isBillingOrAdmin && (
          <button
            onClick={() => setViewMode('create')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10"
          >
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice number, customer name, mobile, vehicle plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 text-xs font-semibold focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-350 text-xs font-bold focus:outline-none"
        >
          <option value="">All Invoice Statuses</option>
          <option value="Draft">Draft</option>
          <option value="Finalized">Finalized</option>
        </select>
      </div>

      {/* List */}
      {viewMode === 'create' ? (
        <InvoiceForm token={token} onSaved={handleSaved} onCancel={handleCancel} />
      ) : viewMode === 'edit' ? (
        <InvoiceForm token={token} editId={selectedInvoiceId} onSaved={handleSaved} onCancel={handleCancel} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Reg Number</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Grand Total</th>
                  <th className="p-4">Billing type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {invoices.length > 0 ? (
                  invoices.map(inv => {
                    let statusBg = 'bg-slate-50 text-slate-600 dark:bg-slate-800';
                    if (inv.status === 'Finalized') statusBg = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400';

                    return (
                      <tr
                        key={inv._id}
                        onClick={(e) => handleDownload(inv, e)}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-all"
                      >
                        <td className="p-4 font-bold text-slate-855 dark:text-slate-200 font-mono">{inv.invoiceNo}</td>
                        <td className="p-4 font-semibold text-slate-650 dark:text-slate-400">{inv.invoiceType || 'Tax Invoice'}</td>
                        <td className="p-4 font-semibold text-slate-550 dark:text-slate-400">
                          {new Date(inv.date).toLocaleDateString('en-IN')}
                        </td>
                        <td className="p-4 font-bold text-slate-555 dark:text-slate-400 font-mono tracking-wider">
                          {inv.vehicleId?.vehicleNumber || 'N/A'}
                        </td>
                        <td className="p-4 font-medium text-slate-550 dark:text-slate-400">
                          {inv.customerId?.name || 'Unknown'}
                        </td>
                        <td className="p-4 font-extrabold text-slate-800 dark:text-slate-200">
                          ₹{inv.totals?.grandTotal?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className="p-4 font-semibold text-[10px] text-slate-500 uppercase tracking-wider">
                          {inv.gstDetails?.isInterstate ? 'IGST Interstate' : 'CGST/SGST Intra'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-extrabold text-[9px] uppercase ${statusBg}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex gap-2 justify-end">
                            {isBillingOrAdmin && inv.status === 'Draft' && (
                              <>
                                <button
                                  onClick={() => finalizeInvoice(inv._id)}
                                  className="text-emerald-600 hover:text-emerald-700 font-bold px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/20"
                                >
                                  Finalize
                                </button>
                                <button
                                  onClick={(e) => handleOpenEdit(inv._id, e)}
                                  className="text-slate-400 hover:text-indigo-650 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                                  title="Edit Invoice"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {inv.paymentStatus === 'Paid' && (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   printGatePass(inv);
                                 }}
                                 className="text-emerald-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                                 title="Print Gate Pass"
                               >
                                 <Printer className="w-3.5 h-3.5" />
                               </button>
                             )}

                             <button
                               onClick={(e) => handleDownload(inv, e)}
                               className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                               title="Download PDF"
                             >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openShare(inv, 'whatsapp')}
                              className="text-slate-400 hover:text-green-600 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                              title="Share on WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => openShare(inv, 'email')}
                              className="text-slate-400 hover:text-indigo-650 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850"
                              title="Share via Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400 dark:text-slate-500 font-semibold">
                      No GST tax invoices billed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Share dialog modal */}
      {shareModal.show && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in text-xs font-semibold">
            {shareSuccess ? (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
                <h4 className="text-sm font-bold text-slate-850 dark:text-white">Message Dispatched!</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Simulated API webhook triggered successfully.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-slate-850 dark:text-white uppercase tracking-wider">
                  {shareModal.type === 'whatsapp' ? 'Share Invoice on WhatsApp' : 'Dispatch Email Invoice'}
                </h3>
                
                {shareModal.type === 'whatsapp' ? (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={sharePhone}
                      onChange={(e) => setSharePhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Recipient Email Address</label>
                    <input
                      type="email"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl font-bold focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1">Pre-compiled Message Template</label>
                  <textarea
                    rows="4"
                    readOnly
                    value={
                      shareModal.type === 'whatsapp' 
                        ? `Dear ${shareModal.invoice?.customerId?.name || 'Customer'},\nYour vehicle ${shareModal.invoice?.vehicleId?.vehicleNumber || 'TS09'} is ready! Invoice ${shareModal.invoice?.invoiceNo} of amount ₹${shareModal.invoice?.totals?.grandTotal?.toLocaleString()} generated. Download: http://${window.location.hostname}:5000/api/invoices/${shareModal.invoice?._id}/pdf\nThanks, MVSS Automobiles.`
                        : `Subject: Tax Invoice - MVSS Automobiles\n\nDear Customer,\nPlease find attached your tax invoice details for repairs on vehicle ${shareModal.invoice?.vehicleId?.vehicleNumber || 'TS09'}.\nInvoice No: ${shareModal.invoice?.invoiceNo}\nNet Total: ₹${shareModal.invoice?.totals?.grandTotal?.toLocaleString()}\nDownload copy: http://${window.location.hostname}:5000/api/invoices/${shareModal.invoice?._id}/pdf`
                    }
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl text-[10px] font-medium text-slate-500 resize-none focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShareModal({ show: false, type: 'whatsapp', invoice: null })}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeMockShare}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
                  >
                    Send simulated updates
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
