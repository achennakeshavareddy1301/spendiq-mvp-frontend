// functions/src/prompts.ts
// Gemini prompts for transaction extraction and analysis

/**
 * Prompt for extracting transactions from PDF text
 * Takes raw PDF text and returns Transaction[] in strict JSON
 */
export const EXTRACT_TRANSACTIONS_PROMPT = `You are a financial data extraction assistant. Extract all transactions from the following bank/UPI statement text.

STRICT RULES:
1. Output ONLY valid JSON - no explanations, no markdown, no code fences, no extra text
2. Return an array of transaction objects
3. Each transaction must have exactly these fields:
   - "date": string in "YYYY-MM-DD" format
   - "amount": number (positive value, no currency symbols)
   - "type": exactly "debit" or "credit"
   - "description": string (transaction description/narration)
   - "vendor": string (merchant/recipient name, empty string if unknown)

4. If date format is ambiguous (DD/MM vs MM/DD), assume DD/MM/YYYY (Indian format)
5. Ignore balance entries, headers, footers - only extract actual transactions
6. If no transactions found, return empty array: []
7. Debit means money going out (spent), Credit means money coming in (received)

STATEMENT TEXT:
---
{{STATEMENT_TEXT}}
---

OUTPUT (JSON array only, no markdown):`;

/**
 * Prompt for analyzing transactions
 * Takes Transaction[] and returns the complete analysis JSON
 */
export const ANALYZE_TRANSACTIONS_PROMPT = `You are a financial analyst AI. Analyze the following transactions and produce a comprehensive financial analysis.

STRICT RULES:
1. Output ONLY valid JSON - no explanations, no markdown, no code fences, no extra text
2. Follow the exact schema below
3. All amounts should be numbers (not strings)
4. Dates should be in "YYYY-MM-DD" format
5. Months should be in "YYYY-MM" format
6. Infer categories from transaction descriptions. Common categories:
   - "Food & Dining" (restaurants, food delivery, groceries)
   - "Shopping" (Amazon, Flipkart, retail)
   - "Bills & Utilities" (electricity, water, phone, internet)
   - "Entertainment" (movies, streaming, games)
   - "Transport" (Uber, Ola, fuel, metro)
   - "Health" (pharmacy, hospitals, doctors)
   - "Education" (courses, books, fees)
   - "Transfer" (UPI transfers to individuals)
   - "Other" (anything that doesn't fit above)
7. For suspicious transactions, flag:
   - Unusually large amounts (significantly above average)
   - Multiple similar transactions in short time
   - Late night transactions (if time available)
   - Round number transfers that seem unusual

REQUIRED OUTPUT SCHEMA (follow exactly):
{
  "summary": {
    "total_spent": <number - sum of all debit amounts>,
    "total_received": <number - sum of all credit amounts>,
    "net_flow": <number - total_received minus total_spent>,
    "period_start": "<YYYY-MM-DD - earliest transaction date>",
    "period_end": "<YYYY-MM-DD - latest transaction date>",
    "transaction_count": <number - total transactions>
  },
  "by_category": {
    "<category_name>": <number - total spent in this category>
  },
  "by_vendor": {
    "<vendor_name>": {
      "spent": <number>,
      "count": <number>
    }
  },
  "monthly": [
    {
      "month": "<YYYY-MM>",
      "spent": <number>,
      "received": <number>,
      "net": <number>
    }
  ],
  "suspicious": [
    {
      "date": "<YYYY-MM-DD>",
      "amount": <number>,
      "reason": "<brief explanation why this is suspicious>"
    }
  ],
  "suggestions": [
    "<actionable financial advice based on spending patterns>"
  ]
}

TRANSACTIONS JSON:
---
{{TRANSACTIONS_JSON}}
---

OUTPUT (JSON only, no markdown):`;

/**
 * Replace placeholder in prompt with actual data
 */
export function buildExtractionPrompt(statementText: string): string {
  return EXTRACT_TRANSACTIONS_PROMPT.replace("{{STATEMENT_TEXT}}", statementText);
}

/**
 * Replace placeholder in prompt with actual data
 */
export function buildAnalysisPrompt(transactionsJson: string): string {
  return ANALYZE_TRANSACTIONS_PROMPT.replace("{{TRANSACTIONS_JSON}}", transactionsJson);
}

const formatTopCategories = (categories: Array<{ category: string; amount: number; percentage: number }>) =>
  JSON.stringify(
    categories
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 6)
      .map((item) => ({
        category: item.category,
        amount: Math.round(item.amount),
        percentage: item.percentage,
      })),
    null,
    2
  );

export function buildFinancialAdvicePrompt(input: {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debt?: number;
  moneyHealth: { score: number; label: string; insights: string[] };
  firePlan: {
    retirementCorpus: number;
    monthlySipRequired: number;
    yearsToFinancialIndependence: number;
    targetRetirementAge: number;
  };
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  portfolioSnapshot?: Array<{ name: string; type: string; amount: number }>;
}): string {
  const portfolioText = input.portfolioSnapshot && input.portfolioSnapshot.length > 0
    ? JSON.stringify(input.portfolioSnapshot, null, 2)
    : "[]";

  return `You are a senior Indian personal finance mentor. Use the provided data to give specific, actionable advice with INR amounts.

USER FINANCIAL DATA:
Monthly Income (INR): ${Math.round(input.monthlyIncome)}
Monthly Expenses (INR): ${Math.round(input.monthlyExpenses)}
Monthly Savings (INR): ${Math.round(input.savings)}
Monthly Debt Payments (INR): ${Math.round(input.debt ?? 0)}

MONEY HEALTH SCORE:
Score: ${input.moneyHealth.score}
Label: ${input.moneyHealth.label}
Insights: ${input.moneyHealth.insights.join(" | ")}

FIRE PLAN:
Retirement Corpus (INR): ${input.firePlan.retirementCorpus}
Monthly SIP Required (INR): ${input.firePlan.monthlySipRequired}
Years to Financial Independence: ${input.firePlan.yearsToFinancialIndependence}
Target Retirement Age: ${input.firePlan.targetRetirementAge}

TOP SPEND CATEGORIES:
${formatTopCategories(input.categoryBreakdown)}

PORTFOLIO SNAPSHOT (manual):
${portfolioText}

Generate a JSON response (no markdown) with precise INR amounts. The user wants clear steps, not generic advice.

RESPONSE JSON:
{
  "sipRecommendation": { "amount": 8000, "rationale": "Short reason with numbers" },
  "savingsAdvice": ["Actionable advice with INR savings"],
  "taxSuggestions": ["India-specific tax suggestion with INR limits"],
  "riskProfile": { "label": "Moderate", "rationale": "Explain based on data" },
  "portfolioSuggestions": ["Allocation idea with INR amounts"],
  "actionItems": ["Next 3 concrete actions with INR" ]
}

Constraints:
- Amounts must be numbers in INR (no currency symbols).
- Provide at least 3 actionItems.
- Make SIP recommendation match the cash flow and FIRE plan.
- Keep it actionable and specific to the data.
`;
}

export function buildAdvisorChatPrompt(input: {
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
  debt?: number;
  moneyHealth: { score: number; label: string; insights: string[] };
  firePlan: {
    retirementCorpus: number;
    monthlySipRequired: number;
    yearsToFinancialIndependence: number;
    targetRetirementAge: number;
  };
  categoryBreakdown: Array<{ category: string; amount: number; percentage: number }>;
  portfolioSnapshot?: Array<{ name: string; type: string; amount: number }>;
  history: string[];
  question: string;
}): string {
  const portfolioText = input.portfolioSnapshot && input.portfolioSnapshot.length > 0
    ? JSON.stringify(input.portfolioSnapshot, null, 2)
    : "[]";

  return `You are SpendIQ's AI Financial Advisor for an Indian user. Answer with specific, actionable guidance based on the data below. Use INR amounts and reference the user's actual numbers.

USER FINANCIAL DATA:
Monthly Income (INR): ${Math.round(input.monthlyIncome)}
Monthly Expenses (INR): ${Math.round(input.monthlyExpenses)}
Monthly Savings (INR): ${Math.round(input.savings)}
Monthly Debt Payments (INR): ${Math.round(input.debt ?? 0)}

MONEY HEALTH SCORE:
Score: ${input.moneyHealth.score}
Label: ${input.moneyHealth.label}
Insights: ${input.moneyHealth.insights.join(" | ")}

FIRE PLAN:
Retirement Corpus (INR): ${input.firePlan.retirementCorpus}
Monthly SIP Required (INR): ${input.firePlan.monthlySipRequired}
Years to Financial Independence: ${input.firePlan.yearsToFinancialIndependence}
Target Retirement Age: ${input.firePlan.targetRetirementAge}

TOP SPEND CATEGORIES:
${formatTopCategories(input.categoryBreakdown)}

PORTFOLIO SNAPSHOT (manual):
${portfolioText}

RECENT CONVERSATION:
${input.history.join("\n")}

USER QUESTION:
${input.question}

RESPONSE RULES:
- Keep it concise (4-7 sentences or up to 5 bullets).
- Use actionable steps with INR amounts where possible.
- If the question is about investing, mention risk tolerance based on cash flow and score.
- Do not use markdown or JSON in the reply.
`;
}
