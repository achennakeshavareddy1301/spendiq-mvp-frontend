// src/services/gemini.ts
// Direct Gemini API integration for frontend

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Transaction, AnalysisResult } from "@/types";

// Initialize Gemini
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("Gemini API key not found. Please add VITE_GEMINI_API_KEY to .env");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Extract transactions from PDF text using Gemini
 */
export async function extractTransactions(pdfText: string): Promise<Transaction[]> {
  const prompt = `You are a financial data extraction expert. Extract ALL UPI/payment transactions from this bank/payment statement.

For each transaction, extract:
- date: Transaction date in YYYY-MM-DD format (use reasonable date if unclear)
- description: Full description/narration of the transaction
- amount: Numeric amount (positive number for credits, negative for debits)
- type: "credit" or "debit"
- upiId: UPI ID if visible (e.g., merchant@paytm), otherwise empty string
- category: Categorize as one of: Food, Shopping, Entertainment, Bills, Travel, Health, Education, Groceries, Fuel, Investment, Transfer, Recharge, Other

IMPORTANT RULES:
1. Return ONLY a valid JSON array - no markdown, no code blocks, no explanation
2. Include ALL transactions you can find in the text
3. If a field is unclear, use reasonable defaults
4. Amount should be a number, not a string
5. If you cannot find any transactions, return an empty array: []

Here is the statement text to analyze:

${pdfText.substring(0, 30000)}

Response (JSON array only):`;

  try {
    console.log("Sending to Gemini for extraction...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    console.log("Gemini extraction response:", text.substring(0, 500));
    
    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();
    
    // Handle empty response
    if (!cleanedText || cleanedText === "[]") {
      console.warn("No transactions found in PDF text");
      return [];
    }
    
    const transactions: Transaction[] = JSON.parse(cleanedText);
    console.log(`Extracted ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error("Error extracting transactions:", error);
    throw new Error(`Failed to extract transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Analyze transactions and generate insights using Gemini
 */
export async function analyzeTransactions(transactions: Transaction[]): Promise<AnalysisResult> {
  const prompt = `You are a personal finance analyst. Analyze these UPI transactions and provide comprehensive insights.

Transactions:
${JSON.stringify(transactions, null, 2)}

Provide analysis with:
1. summary: Object with totalSpent, totalReceived, netFlow (numbers), transactionCount, dateRange (string like "Jan 2024 - Mar 2024")
2. categoryBreakdown: Array of {category, amount (positive), percentage, transactionCount}
3. topVendors: Array of top 5 vendors with {name, totalSpent (positive), transactionCount, category}
4. monthlyTrend: Array of {month (e.g., "Jan 2024"), spent (positive), received (positive), net}
5. suspiciousTransactions: Array of unusual transactions with {date, description, amount, reason}
6. suggestions: Array of 3-5 actionable savings tips based on spending patterns (strings)

IMPORTANT: Return ONLY valid JSON - no markdown, no explanation.

Response format:
{
  "summary": {"totalSpent": 50000, "totalReceived": 60000, "netFlow": 10000, "transactionCount": 45, "dateRange": "Jan 2024 - Mar 2024"},
  "categoryBreakdown": [{"category": "Food", "amount": 15000, "percentage": 30, "transactionCount": 20}],
  "topVendors": [{"name": "Swiggy", "totalSpent": 8000, "transactionCount": 15, "category": "Food"}],
  "monthlyTrend": [{"month": "Jan 2024", "spent": 20000, "received": 25000, "net": 5000}],
  "suspiciousTransactions": [{"date": "2024-01-15", "description": "Unknown merchant", "amount": -5000, "reason": "Unusually large amount"}],
  "suggestions": ["Consider reducing food delivery orders to save ₹3000/month"]
}`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    // Clean the response
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();
    
    const analysis: AnalysisResult = JSON.parse(cleanedText);
    return analysis;
  } catch (error) {
    console.error("Error analyzing transactions:", error);
    throw new Error("Failed to analyze transactions");
  }
}

/**
 * Full pipeline: Extract and analyze in one call
 */
export async function processUPIStatement(pdfText: string): Promise<{
  transactions: Transaction[];
  analysis: AnalysisResult;
}> {
  // Step 1: Extract transactions
  const transactions = await extractTransactions(pdfText);
  
  if (transactions.length === 0) {
    throw new Error("No transactions found in the PDF. Please ensure you uploaded a valid UPI statement.");
  }
  
  // Step 2: Analyze transactions
  const analysis = await analyzeTransactions(transactions);
  
  return { transactions, analysis };
}
