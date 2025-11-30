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
