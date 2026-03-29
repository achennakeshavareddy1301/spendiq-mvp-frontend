// functions/src/types.ts
// Shared TypeScript types for SpendIQ Cloud Functions

/**
 * A single transaction extracted from UPI statement
 */
export interface Transaction {
  date: string; // YYYY-MM-DD format
  amount: number;
  type: "debit" | "credit";
  description: string;
  vendor: string;
}

/**
 * Summary metrics for the analysis
 */
export interface AnalysisSummary {
  total_spent: number;
  total_received: number;
  net_flow: number;
  period_start: string;
  period_end: string;
  transaction_count: number;
}

/**
 * Vendor spending breakdown
 */
export interface VendorStats {
  spent: number;
  count: number;
}

/**
 * Monthly breakdown
 */
export interface MonthlyStats {
  month: string;
  spent: number;
  received: number;
  net: number;
}

/**
 * Suspicious transaction flag
 */
export interface SuspiciousTransaction {
  date: string;
  amount: number;
  reason: string;
}

/**
 * Complete analysis result from Gemini
 */
export interface AnalysisResult {
  summary: AnalysisSummary;
  by_category: Record<string, number>;
  by_vendor: Record<string, VendorStats>;
  monthly: MonthlyStats[];
  suspicious: SuspiciousTransaction[];
  suggestions: string[];
}

/**
 * Analysis status
 */
export type AnalysisStatus = "pending" | "processing" | "done" | "error";

/**
 * Firestore document for analyses collection
 */
export interface AnalysisDocument {
  userId: string;
  fileName: string;
  status: AnalysisStatus;
  createdAt: FirebaseFirestore.Timestamp | Date;
  updatedAt: FirebaseFirestore.Timestamp | Date;
  transactionCount: number;
  result: AnalysisResult | null;
  advisorPlan?: AdvisorPlan | null;
  error: string | null;
  rawText?: string;
}

/**
 * Request body for analyzeUPI function
 */
export interface AnalyzeUPIRequest {
  fileName: string;
  fileContent: string; // base64 encoded PDF
  mimeType: string;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface MoneyHealthResult {
  score: number;
  label: "Healthy" | "Average" | "Risky";
  insights: string[];
}

export interface FirePlanResult {
  retirementCorpus: number;
  monthlySipRequired: number;
  yearsToFinancialIndependence: number;
  targetRetirementAge: number;
  assumedAnnualReturn: number;
  assumedInflation: number;
}

export interface FinancialAdvisorInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debt?: number;
  moneyHealth: MoneyHealthResult;
  firePlan: FirePlanResult;
  categoryBreakdown: CategoryBreakdownItem[];
  portfolioSnapshot?: PortfolioSnapshotItem[];
}

export interface PortfolioSnapshotItem {
  name: string;
  type: "mf" | "stock" | "etf" | "other";
  amount: number;
}

export interface AdvisorChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AnalyzeFinancialsRequest {
  mode: "advice" | "chat";
  input: FinancialAdvisorInput;
  analysisId?: string;
  history?: AdvisorChatMessage[];
  question?: string;
}

export interface AdvisorPlan {
  sipRecommendation: {
    amount: number;
    rationale: string;
  };
  savingsAdvice: string[];
  taxSuggestions: string[];
  riskProfile: {
    label: "Conservative" | "Moderate" | "Aggressive";
    rationale: string;
  };
  portfolioSuggestions: string[];
  actionItems: string[];
}

export interface MFPortfolioHolding {
  fundName: string;
  category: string;
  invested: number;
  currentValue: number;
  xirr: number;
  expenseRatio: number;
  topSectors: string[];
}

export interface MFOverlapPair {
  fundA: string;
  fundB: string;
  overlapPercent: number;
}

export interface MFOverlapAnalysis {
  duplicateHoldings: string[];
  overlapPairs: MFOverlapPair[];
}

export interface MFBenchmarkComparison {
  benchmark: string;
  portfolioReturn: number;
  benchmarkReturn: number;
  alpha: number;
  period: string;
}

export interface MFPortfolioSummary {
  totalInvested: number;
  currentValue: number;
  xirr: number;
  equityAllocation: number;
  debtAllocation: number;
  hybridAllocation: number;
  expenseRatioDrag: number;
  overlapScore: number;
}

export interface MFDataQuality {
  confidence: "low" | "medium" | "high";
  notes: string[];
}

export interface MFPortfolioReport {
  portfolioSummary: MFPortfolioSummary;
  holdings: MFPortfolioHolding[];
  overlapAnalysis: MFOverlapAnalysis;
  benchmarkComparison: MFBenchmarkComparison;
  riskFlags: string[];
  rebalancingPlan: string[];
  dataQuality: MFDataQuality;
}

export interface AnalyzeMFPortfolioRequest {
  fileName: string;
  extractedText: string;
}
