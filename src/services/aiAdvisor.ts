import type { AnalysisResult, PortfolioSnapshotItem } from "@/types";
import type { MoneyHealthResult } from "@/lib/financialScore";
import type { FirePlannerResult } from "@/lib/firePlanner";
import { analyzeFinancials } from "@/services/api";

export interface AdvisorInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debt?: number;
  portfolioSnapshot?: PortfolioSnapshotItem[];
  analysis: AnalysisResult;
  moneyHealth: MoneyHealthResult;
  firePlan: FirePlannerResult;
}

export interface AdvisorResponse {
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

export interface AdvisorChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnalyzeFinancialsRequest {
  mode: "advice" | "chat";
  input: {
    monthlyIncome: number;
    monthlyExpenses: number;
    savings: number;
    debt?: number;
    moneyHealth: MoneyHealthResult;
    firePlan: FirePlannerResult;
    categoryBreakdown: AnalysisResult["categoryBreakdown"];
    portfolioSnapshot?: PortfolioSnapshotItem[];
  };
  analysisId?: string;
  history?: AdvisorChatMessage[];
  question?: string;
}

interface AnalyzeFinancialsResponse {
  success: boolean;
  advice?: AdvisorResponse;
  reply?: string;
}

export async function generateFinancialAdvice(
  input: AdvisorInput,
  analysisId?: string
): Promise<AdvisorResponse> {
  const payload: AnalyzeFinancialsRequest = {
    mode: "advice",
    input: {
      monthlyIncome: input.monthlyIncome,
      monthlyExpenses: input.monthlyExpenses,
      savings: input.savings,
      debt: input.debt,
      moneyHealth: input.moneyHealth,
      firePlan: input.firePlan,
      categoryBreakdown: input.analysis.categoryBreakdown,
      portfolioSnapshot: input.portfolioSnapshot,
    },
    analysisId,
  };

  const response = (await analyzeFinancials(payload)) as AnalyzeFinancialsResponse;
  if (!response.success || !response.advice) {
    throw new Error("Failed to generate AI financial advice");
  }

  return response.advice;
}

export async function askAdvisorQuestion(
  input: AdvisorInput,
  history: AdvisorChatMessage[],
  question: string,
  analysisId?: string
): Promise<string> {
  const payload: AnalyzeFinancialsRequest = {
    mode: "chat",
    input: {
      monthlyIncome: input.monthlyIncome,
      monthlyExpenses: input.monthlyExpenses,
      savings: input.savings,
      debt: input.debt,
      moneyHealth: input.moneyHealth,
      firePlan: input.firePlan,
      categoryBreakdown: input.analysis.categoryBreakdown,
      portfolioSnapshot: input.portfolioSnapshot,
    },
    analysisId,
    history,
    question,
  };

  const response = (await analyzeFinancials(payload)) as AnalyzeFinancialsResponse;
  if (!response.success || !response.reply) {
    throw new Error("Failed to answer advisor question");
  }

  return response.reply;
}
