import {
  BrokerageType,
  BrokeragePayee,
  RiceQualitySpecs,
  RiceCategory,
  MatchingResultDTO,
  MatchDifferenceDetail
} from '@pragyam/types';

// ==========================================
// 1. QUANTITY & UNIT CONVERSIONS
// ==========================================

export const QUINTALS_PER_METRIC_TONNE = 10;

/**
 * Convert Metric Tonnes to Quintals (1 MT = 10 Quintals)
 */
export function mtToQuintals(mt: number): number {
  return Number((mt * QUINTALS_PER_METRIC_TONNE).toFixed(2));
}

/**
 * Convert Quintals to Metric Tonnes (10 Quintals = 1 MT)
 */
export function quintalsToMT(quintals: number): number {
  return Number((quintals / QUINTALS_PER_METRIC_TONNE).toFixed(3));
}

/**
 * Convert price per Quintal to price per Metric Tonne
 */
export function pricePerQuintalToMT(pricePerQuintal: number): number {
  return Number((pricePerQuintal * QUINTALS_PER_METRIC_TONNE).toFixed(2));
}

/**
 * Convert price per MT to price per Quintal
 */
export function pricePerMTToQuintal(pricePerMT: number): number {
  return Number((pricePerMT / QUINTALS_PER_METRIC_TONNE).toFixed(2));
}

// ==========================================
// 2. BROKERAGE CALCULATIONS
// ==========================================

export interface BrokerageCalculationResult {
  brokerageTotal: number;
  goodsTotal: number;
  ratePerMT: number;
  ratePerQuintal: number;
  explanation: string;
}

/**
 * Calculates brokerage accurately based on agreed type and rates.
 * Supports: FIXED_AMOUNT, PER_METRIC_TONNE, PER_QUINTAL, PERCENTAGE_OF_VALUE, CUSTOM_NEGOTIATED.
 */
export function calculateBrokerage(
  quantityMT: number,
  ratePerQuintal: number,
  brokerageType: BrokerageType,
  brokerageRateOrValue: number
): BrokerageCalculationResult {
  const quantityQuintals = mtToQuintals(quantityMT);
  const goodsTotal = Number((quantityQuintals * ratePerQuintal).toFixed(2));
  let brokerageTotal = 0;
  let explanation = '';

  switch (brokerageType) {
    case BrokerageType.PER_METRIC_TONNE:
      brokerageTotal = Number((quantityMT * brokerageRateOrValue).toFixed(2));
      explanation = `₹${brokerageRateOrValue} per MT across ${quantityMT} MT`;
      break;

    case BrokerageType.PER_QUINTAL:
      brokerageTotal = Number((quantityQuintals * brokerageRateOrValue).toFixed(2));
      explanation = `₹${brokerageRateOrValue} per Quintal across ${quantityQuintals} Quintals`;
      break;

    case BrokerageType.PERCENTAGE_OF_VALUE:
      brokerageTotal = Number(((goodsTotal * brokerageRateOrValue) / 100).toFixed(2));
      explanation = `${brokerageRateOrValue}% of total goods value (₹${goodsTotal.toLocaleString('en-IN')})`;
      break;

    case BrokerageType.FIXED_AMOUNT:
    case BrokerageType.CUSTOM_NEGOTIATED:
    default:
      brokerageTotal = Number(brokerageRateOrValue.toFixed(2));
      explanation = `Fixed agreed brokerage of ₹${brokerageTotal.toLocaleString('en-IN')}`;
      break;
  }

  return {
    brokerageTotal,
    goodsTotal,
    ratePerMT: pricePerQuintalToMT(ratePerQuintal),
    ratePerQuintal,
    explanation
  };
}

// ==========================================
// 3. GST & TAX CALCULATIONS
// ==========================================

export interface GstCalculationResult {
  taxableAmount: number;
  isInterState: boolean;
  cgstPercent: number;
  cgstAmount: number;
  sgstPercent: number;
  sgstAmount: number;
  igstPercent: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
}

/**
 * Calculates GST for brokerage invoices or commercial invoices.
 * Standard SAC for brokerage: 998319 (18% GST).
 */
export function calculateGst(
  taxableAmount: number,
  supplierState: string,
  recipientState: string,
  taxRatePercent: number = 18
): GstCalculationResult {
  const isInterState = supplierState.trim().toLowerCase() !== recipientState.trim().toLowerCase();
  
  if (isInterState) {
    const igstAmount = Number(((taxableAmount * taxRatePercent) / 100).toFixed(2));
    return {
      taxableAmount,
      isInterState: true,
      cgstPercent: 0,
      cgstAmount: 0,
      sgstPercent: 0,
      sgstAmount: 0,
      igstPercent: taxRatePercent,
      igstAmount,
      totalTax: igstAmount,
      grandTotal: Number((taxableAmount + igstAmount).toFixed(2))
    };
  } else {
    const halfRate = taxRatePercent / 2;
    const cgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
    const sgstAmount = Number(((taxableAmount * halfRate) / 100).toFixed(2));
    const totalTax = Number((cgstAmount + sgstAmount).toFixed(2));
    return {
      taxableAmount,
      isInterState: false,
      cgstPercent: halfRate,
      cgstAmount,
      sgstPercent: halfRate,
      sgstAmount,
      igstPercent: 0,
      igstAmount: 0,
      totalTax,
      grandTotal: Number((taxableAmount + totalTax).toFixed(2))
    };
  }
}

// ==========================================
// 4. BUYER-SELLER MATCHING ENGINE
// ==========================================

export interface ListingForMatch {
  id: string;
  anonymousCode: string;
  category: RiceCategory;
  variety: string;
  availableQuantityMT: number;
  askingPricePerQuintal: number;
  qualitySpecs: RiceQualitySpecs;
  generalizedLocation: { state: string; district: string };
  sellerCompanyName?: string;
}

export interface RequirementForMatch {
  id: string;
  anonymousCode: string;
  category: RiceCategory;
  variety: string;
  requiredQuantityMT: number;
  targetPricePerQuintal: number;
  qualitySpecs: RiceQualitySpecs;
  deliveryLocation: { state: string; district: string };
  buyerCompanyName?: string;
}

/**
 * Matches a Buyer Requirement with Available Seller Listings.
 * Evaluates category compatibility, variety, quality tolerances, price delta, and quantity.
 * Returns match score 0-100% with transparent difference breakdown.
 */
export function calculateMatchScore(
  req: RequirementForMatch,
  stock: ListingForMatch
): MatchingResultDTO | null {
  // Category MUST match exactly (e.g. STEAM_RICE with STEAM_RICE)
  if (req.category !== stock.category) {
    return null;
  }

  // 1. Variety match (Weight: 20%)
  let varietyScore = 0;
  const reqVar = req.variety.trim().toLowerCase();
  const stockVar = stock.variety.trim().toLowerCase();
  if (reqVar === stockVar) {
    varietyScore = 20;
  } else if (reqVar.includes(stockVar) || stockVar.includes(reqVar)) {
    varietyScore = 15;
  } else {
    varietyScore = 5;
  }

  // 2. Quality Specs match (Weight: 40%)
  // - Grain length: Max difference acceptable ~ 0.5mm
  const grainLengthDiff = Number((stock.qualitySpecs.grainLengthMm - req.qualitySpecs.grainLengthMm).toFixed(2));
  let grainLengthScore = 12;
  const absGld = Math.abs(grainLengthDiff);
  if (absGld > 0.6) grainLengthScore = 0;
  else if (absGld > 0.3) grainLengthScore = 6;
  else if (absGld > 0.1) grainLengthScore = 9;

  // - Moisture: Lower or equal is good. Excess moisture penalizes heavily.
  const moistureDiff = Number((stock.qualitySpecs.moisturePercent - req.qualitySpecs.moisturePercent).toFixed(2));
  let moistureScore = 10;
  if (moistureDiff > 1.5) moistureScore = 0;
  else if (moistureDiff > 0.5) moistureScore = 5;
  else if (moistureDiff <= 0) moistureScore = 10; // equal or drier is perfect

  // - Broken percentage: Lower or equal is better.
  const brokenDiff = Number((stock.qualitySpecs.brokenPercent - req.qualitySpecs.brokenPercent).toFixed(2));
  let brokenScore = 10;
  if (brokenDiff > 2.0) brokenScore = 0;
  else if (brokenDiff > 1.0) brokenScore = 4;
  else if (brokenDiff > 0) brokenScore = 7;
  else brokenScore = 10;

  // - Whiteness: Tolerance +- 4 Kett
  const whitenessDiff = Number((stock.qualitySpecs.whiteness - req.qualitySpecs.whiteness).toFixed(1));
  let whitenessScore = 8;
  const absWd = Math.abs(whitenessDiff);
  if (absWd > 5) whitenessScore = 2;
  else if (absWd > 2) whitenessScore = 5;

  const totalQualityScore = Math.min(40, grainLengthScore + moistureScore + brokenScore + whitenessScore);

  // 3. Quantity matching (Weight: 20%)
  const quantityDiffMT = Number((stock.availableQuantityMT - req.requiredQuantityMT).toFixed(2));
  let quantityScore = 20;
  if (stock.availableQuantityMT >= req.requiredQuantityMT) {
    quantityScore = 20; // Seller has enough to fulfill entire requirement
  } else {
    // Partial fulfillment ratio
    const ratio = stock.availableQuantityMT / req.requiredQuantityMT;
    quantityScore = Number((ratio * 20).toFixed(1));
  }

  // 4. Price proximity (Weight: 15%)
  const priceDiffPerQuintal = Number((stock.askingPricePerQuintal - req.targetPricePerQuintal).toFixed(2));
  let priceScore = 15;
  if (priceDiffPerQuintal <= 0) {
    priceScore = 15; // Asking price <= target price is ideal for buyer
  } else {
    const percentAbove = (priceDiffPerQuintal / req.targetPricePerQuintal) * 100;
    if (percentAbove > 20) priceScore = 0;
    else if (percentAbove > 10) priceScore = 5;
    else if (percentAbove > 5) priceScore = 10;
    else priceScore = 12;
  }

  // 5. Location proximity (Weight: 5%)
  let locationScore = 3;
  if (req.deliveryLocation.state.trim().toLowerCase() === stock.generalizedLocation.state.trim().toLowerCase()) {
    locationScore = 5;
  }

  const overallMatchScore = Math.min(100, Math.round(varietyScore + totalQualityScore + quantityScore + priceScore + locationScore));

  const differences: MatchDifferenceDetail = {
    grainLengthDiff,
    moistureDiff,
    brokenDiff,
    whitenessDiff,
    priceDiffPerQuintal,
    quantityDiffMT
  };

  let recommendationSummary = '';
  if (overallMatchScore >= 85) {
    recommendationSummary = 'Excellent match across quality, price, and volume.';
  } else if (overallMatchScore >= 70) {
    recommendationSummary = 'Good match with minor price or moisture variance subject to negotiation.';
  } else {
    recommendationSummary = 'Moderate match; admin negotiation required on price or specs.';
  }

  return {
    requirementId: req.id,
    requirementCode: req.anonymousCode,
    listingId: stock.id,
    anonymousListingCode: stock.anonymousCode,
    category: req.category,
    variety: req.variety,
    overallMatchScore,
    qualityScore: Math.round((totalQualityScore / 40) * 100),
    priceScore: Math.round((priceScore / 15) * 100),
    quantityScore: Math.round((quantityScore / 20) * 100),
    locationScore: Math.round((locationScore / 5) * 100),
    differences,
    recommendationSummary,
    sellerCompanyName: stock.sellerCompanyName,
    buyerCompanyName: req.buyerCompanyName
  };
}

// ==========================================
// 5. PRIVACY & CONFIDENTIALITY SANITIZERS
// ==========================================

/**
 * Sanitizes inventory listing for Buyer view.
 * Guarantees zero leakage of seller company, mill name, phone, email, full address.
 */
export function sanitizeListingForBuyer(listing: any): any {
  return {
    id: listing.id,
    anonymousCode: listing.anonymousCode || `PRG-${listing.id.slice(0, 4)}`,
    category: listing.category,
    variety: listing.variety,
    classification: listing.classification,
    availableQuantityMT: listing.availableQuantityMT,
    availableQuantityQuintals: listing.availableQuantityQuintals || mtToQuintals(listing.availableQuantityMT),
    minOrderQuantityMT: listing.minOrderQuantityMT,
    maxOrderQuantityMT: listing.maxOrderQuantityMT,
    askingPricePerQuintal: listing.askingPricePerQuintal,
    askingPricePerMT: listing.askingPricePerMT || pricePerQuintalToMT(listing.askingPricePerQuintal),
    qualitySpecs: listing.qualitySpecs,
    packaging: listing.packaging,
    generalizedLocation: {
      district: listing.generalizedDistrict || listing.district || 'Confidential Hub',
      state: listing.generalizedState || listing.state || 'India'
    },
    availabilityDate: listing.availabilityDate,
    cropYear: listing.cropYear,
    stockImages: Array.isArray(listing.stockImages) ? listing.stockImages : [],
    status: listing.status,
    createdAt: listing.createdAt
  };
}

/**
 * Sanitizes purchase order for Buyer view.
 * Seller name & mill identity are replaced with Pragyam Enterprises intermediary representation.
 */
export function sanitizePOForBuyer(po: any): any {
  return {
    id: po.id,
    poNumber: po.poNumber,
    orderDate: po.orderDate,
    intermediaryBroker: 'PRAGYAM ENTERPRISES',
    riceCategory: po.riceCategory,
    riceVariety: po.riceVariety,
    classification: po.classification,
    quantityMT: po.quantityMT,
    quantityQuintals: po.quantityQuintals,
    agreedRatePerQuintal: po.agreedRatePerQuintal,
    agreedRatePerMT: po.agreedRatePerMT,
    totalGoodsValue: po.totalGoodsValue,
    qualitySpecs: po.qualitySpecs,
    packaging: po.packaging,
    dispatchOriginDistrict: po.dispatchOriginDistrict || 'Verified Northern Hub',
    deliveryLocation: po.deliveryLocation,
    deliveryDate: po.deliveryDate,
    paymentTerms: po.paymentTerms,
    status: po.status,
    specialInstructions: po.specialInstructions,
    createdAt: po.createdAt,
    updatedAt: po.updatedAt
  };
}

/**
 * Sanitizes purchase order for Seller view.
 * Buyer name & contact details are replaced with Pragyam Enterprises intermediary representation.
 */
export function sanitizePOForSeller(po: any): any {
  return {
    id: po.id,
    poNumber: po.poNumber,
    orderDate: po.orderDate,
    intermediaryBroker: 'PRAGYAM ENTERPRISES',
    riceCategory: po.riceCategory,
    riceVariety: po.riceVariety,
    classification: po.classification,
    quantityMT: po.quantityMT,
    quantityQuintals: po.quantityQuintals,
    agreedRatePerQuintal: po.agreedRatePerQuintal,
    agreedRatePerMT: po.agreedRatePerMT,
    totalGoodsValue: po.totalGoodsValue,
    brokerageAmount: po.brokerageAmount,
    qualitySpecs: po.qualitySpecs,
    packaging: po.packaging,
    dispatchLocation: po.dispatchLocation,
    deliveryDestinationState: po.deliveryDestinationState || 'Verified Buyer Destination',
    deliveryDate: po.deliveryDate,
    paymentTerms: po.paymentTerms,
    status: po.status,
    createdAt: po.createdAt,
    updatedAt: po.updatedAt
  };
}
