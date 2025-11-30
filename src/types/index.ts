// src/types/index.ts
// Core TypeScript types for SpendIQ UPI Analysis

/**
 * A single transaction extracted from UPI statement
 */
export interface Transaction {
  date: string; // YYYY-MM-DD format
  amount: number;
  type: "debit" | "credit";
  description: string;
  upiId?: string;
  category?: string;
  vendor?: string;
}

/**
 * Summary metrics for the analysis
 */
export interface AnalysisSummary {
  totalSpent: number;
  totalReceived: number;
  netFlow: number;
  transactionCount: number;
  dateRange: string;
}

/**
 * Category breakdown item
 */
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

/**
 * Vendor spending item
 */
export interface VendorItem {
  name: string;
  totalSpent: number;
  transactionCount: number;
  category: string;
}

/**
 * Monthly breakdown
 */
export interface MonthlyTrend {
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
  description: string;
  amount: number;
  reason: string;
}

/**
 * Complete analysis result from Gemini
 */
export interface AnalysisResult {
  summary: AnalysisSummary;
  categoryBreakdown: CategoryBreakdown[];
  topVendors: VendorItem[];
  monthlyTrend: MonthlyTrend[];
  suspiciousTransactions: SuspiciousTransaction[];
  suggestions: string[];
}

/**
 * Analysis status enum
 */
export type AnalysisStatus = "pending" | "processing" | "done" | "error";

/**
 * Firestore document for analyses collection
 */
export interface AnalysisDocument {
  id?: string; // Firestore document ID (optional, added after fetch)
  userId: string;
  fileName: string;
  status: AnalysisStatus;
  createdAt: string;
  completedAt?: string;
  transactionCount: number;
  result?: AnalysisResult | null;
  error?: string | null;
}

/**
 * Firestore document for users collection
 */
export interface UserDocument {
  email: string;
  displayName: string | null;
  createdAt: Date | string;
}

/**
 * API response types
 */
export interface UploadResponse {
  success: boolean;
  analysisId: string;
  message?: string;
}

export interface AnalysisResponse {
  success: boolean;
  analysis: AnalysisDocument;
}

export interface AnalysesListResponse {
  success: boolean;
  analyses: AnalysisDocument[];
}

export interface ErrorResponse {
  success: false;
  error: string;
}
