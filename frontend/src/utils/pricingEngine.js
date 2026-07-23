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
  const marginP = Math.max(0, parseFloat(marginPercent) || 0);
  const qty = Math.max(1, parseFloat(quantity) || 1);
  const gstP = Math.min(100, Math.max(0, parseFloat(gstPercent) || 0));
  const mrpVal = Math.max(0, parseFloat(mrp) || 0);

  // If cost and margin are set, calculate sellingPrice
  let sell = parseFloat(sellingPrice) || 0;
  // Fallback to auto calculate if it's 0 or empty
  if (sell === 0 && costVal > 0 && marginP > 0) {
    sell = costVal + (costVal * marginP) / 100;
  }

  const grossAmount = qty * sell; // subtotal

  let discPercent = parseFloat(discountPercent) || 0;
  let discAmt = parseFloat(discountAmount) || 0;

  if (lastDiscountEdited === 'percent') {
    discAmt = grossAmount * (discPercent / 100);
  } else {
    discPercent = grossAmount > 0 ? (discAmt / grossAmount) * 100 : 0;
  }

  // Discount cannot exceed subtotal
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

  // Final Total support Manual Override
  const finalTotalAmount = manualFinalTotal !== null ? Math.max(0, parseFloat(manualFinalTotal) || 0) : calculatedFinalTotal;
  const unitChargeRate = qty > 0 ? finalTotalAmount / qty : 0;

  // Customer saving
  const customerSaving = mrpVal > sell ? mrpVal - sell : 0;
  const customerSavingPercent = mrpVal > 0 && mrpVal > sell ? (customerSaving / mrpVal) * 100 : 0;

  // Warning check
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
