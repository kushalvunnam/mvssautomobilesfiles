/**
 * Shared Workshop ERP Pricing Engine
 * Performs standard parts and labour master billing calculations
 */
export function calculatePricing({
  purchasePrice = 0,
  marginPercent = 0,
  sellingPrice = 0,
  quantity = 1,
  discountPercent = 0,
  discountAmount = 0,
  lastDiscountEdited = 'percent',
  gstPercent = 18,
  mrp = 0,
  manualFinalTotal = null
}) {
  const costVal = Math.max(0, parseFloat(purchasePrice) || 0);
  const qty = Math.max(1, parseFloat(quantity) || 1);
  const gstP = Math.min(100, Math.max(0, parseFloat(gstPercent) || 0));
  const mrpVal = Math.max(0, parseFloat(mrp) || 0);

  if (manualFinalTotal !== null) {
    const finalTotalAmount = Math.max(0, parseFloat(manualFinalTotal) || 0);
    
    // 1. Recalculate Net Charge (Taxable Amount)
    const taxableAmount = finalTotalAmount / (1 + gstP / 100);
    
    // 2. GST Amount
    const gstAmount = finalTotalAmount - taxableAmount;

    // 3. Selling Price & Discount
    let discAmt = parseFloat(discountAmount) || 0;
    let subtotal = taxableAmount + discAmt;
    let sell = subtotal / qty;

    // Ensure selling price does not cause discount to exceed subtotal
    if (discAmt > subtotal) {
      discAmt = 0;
      subtotal = taxableAmount;
      sell = subtotal / qty;
    }

    let discPercent = sell > 0 ? (discAmt / (sell * qty)) * 100 : 0;

    // 4. Profit Margin
    let marginPercentValue = costVal > 0 ? ((sell - costVal) / costVal) * 100 : 0;

    // Customer saving
    const customerSaving = mrpVal > sell ? mrpVal - sell : 0;
    const customerSavingPercent = mrpVal > 0 && mrpVal > sell ? (customerSaving / mrpVal) * 100 : 0;
    const sellingExceedsMrp = mrpVal > 0 && sell > mrpVal;

    return {
      cost: costVal,
      marginPercent: marginPercentValue,
      sellingPrice: sell,
      quantity: qty,
      subtotal,
      discountPercent: discPercent,
      discountAmount: discAmt,
      taxableAmount,
      gstPercent: gstP,
      gstAmount,
      finalTotalAmount,
      unitChargeRate: qty > 0 ? finalTotalAmount / qty : 0,
      mrp: mrpVal,
      customerSaving,
      customerSavingPercent,
      sellingExceedsMrp
    };
  }

  // Forward calculation (original logic)
  let sell = parseFloat(sellingPrice) || 0;
  let marginP = parseFloat(marginPercent) || 0;
  
  if (sell === 0 && costVal > 0 && marginP > 0) {
    sell = costVal + (costVal * marginP) / 100;
  } else if (sell > 0 && costVal > 0) {
    marginP = ((sell - costVal) / costVal) * 100;
  }

  const grossAmount = qty * sell; // subtotal

  let discPercent = parseFloat(discountPercent) || 0;
  let discAmt = parseFloat(discountAmount) || 0;

  if (lastDiscountEdited === 'percent') {
    discAmt = grossAmount * (discPercent / 100);
  } else {
    discPercent = grossAmount > 0 ? (discAmt / grossAmount) * 100 : 0;
  }

  if (discAmt > grossAmount) {
    discAmt = grossAmount;
    discPercent = 100;
  }
  if (discAmt < 0) {
    discAmt = 0;
    discPercent = 0;
  }

  const taxableAmount = Math.max(0, grossAmount - discAmt);
  const gstAmount = taxableAmount * (gstP / 100);
  const calculatedFinalTotal = Math.max(0, taxableAmount + gstAmount);

  const finalTotalAmount = calculatedFinalTotal;
  const unitChargeRate = qty > 0 ? finalTotalAmount / qty : 0;

  const customerSaving = mrpVal > sell ? mrpVal - sell : 0;
  const customerSavingPercent = mrpVal > 0 && mrpVal > sell ? (customerSaving / mrpVal) * 100 : 0;
  const sellingExceedsMrp = mrpVal > 0 && sell > mrpVal;

  return {
    cost: costVal,
    marginPercent: marginP,
    sellingPrice: sell,
    quantity: qty,
    subtotal: grossAmount,
    discountPercent: discPercent,
    discountAmount: discAmt,
    taxableAmount,
    gstPercent: gstP,
    gstAmount,
    finalTotalAmount,
    unitChargeRate,
    mrp: mrpVal,
    customerSaving,
    customerSavingPercent,
    sellingExceedsMrp
  };
}
