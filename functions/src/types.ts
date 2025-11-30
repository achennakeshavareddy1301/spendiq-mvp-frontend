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
