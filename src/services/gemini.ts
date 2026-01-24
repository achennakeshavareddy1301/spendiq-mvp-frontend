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
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * Extract transactions from PDF text using Gemini
 */
export async function extractTransactions(pdfText: string): Promise<Transaction[]> {
  const prompt = `You are a financial data extraction expert specializing in Indian UPI and bank statements. Extract ALL transactions from this payment statement with high accuracy.

EXTRACTION RULES:

For each transaction, extract:
- **date**: Transaction date in YYYY-MM-DD format. Parse Indian date formats (DD/MM/YYYY, DD-MM-YYYY, etc.)
- **description**: Full description/narration. Include merchant name, UPI ID, and any reference numbers
- **amount**: Numeric amount as a NUMBER (not string). Use NEGATIVE for debits/payments, POSITIVE for credits/received
- **type**: "debit" for money sent/paid, "credit" for money received
- **upiId**: Extract UPI ID if visible (e.g., merchant@paytm, shop@ybl), otherwise empty string ""
- **category**: Intelligently categorize based on merchant name and description:

CATEGORY MAPPING:
- Food & Dining: Swiggy, Zomato, restaurants, cafes, food courts, Dominos, McDonald's, KFC, Starbucks
- Shopping: Amazon, Flipkart, Myntra, Ajio, retail stores, clothing, electronics
- Entertainment: Netflix, Prime Video, Hotstar, Spotify, movies, gaming, BookMyShow
- Bills & Utilities: Electricity, water, gas, broadband, phone recharge, DTH, insurance
- Travel: Ola, Uber, Rapido, IRCTC, flights, hotels, MakeMyTrip, RedBus
- Health: Pharmacies, hospitals, doctors, Apollo, Netmeds, 1mg, gym memberships
- Education: Schools, colleges, courses, Udemy, Coursera, books
- Groceries: BigBasket, Blinkit, Zepto, DMart, supermarkets, Instamart
- Fuel: Petrol pumps, HP, Indian Oil, BPCL, EV charging
- Investment: Groww, Zerodha, mutual funds, stocks, SIP, crypto
- Transfer: Person-to-person transfers, self-transfers between accounts
- Recharge: Mobile recharge, DTH, FASTag
- Rent: House rent, PG payments
- EMI: Loan EMIs, credit card payments
- Subscription: Monthly/yearly subscriptions
- ATM: Cash withdrawals
- Other: Anything that doesn't fit above categories

IMPORTANT:
1. Return ONLY a valid JSON array - NO markdown, NO code blocks, NO explanation text
2. Extract EVERY transaction you can find - don't skip any
3. Parse amounts correctly - remove commas, handle decimals
4. For ambiguous merchants, make your best category guess
5. If the PDF has no transactions, return: []

STATEMENT TEXT:
${pdfText.substring(0, 30000)}

JSON ARRAY OUTPUT:`;

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
  const prompt = `You are an expert personal finance advisor with 20+ years of experience helping individuals optimize their spending, build wealth, and achieve financial freedom. Analyze these UPI transactions deeply and provide actionable, personalized insights.

TRANSACTIONS DATA:
${JSON.stringify(transactions, null, 2)}

ANALYSIS REQUIREMENTS:

1. **summary**: Calculate precise totals
   - totalSpent: Sum of all debit amounts (positive number)
   - totalReceived: Sum of all credit amounts (positive number)
   - netFlow: totalReceived - totalSpent
   - transactionCount: Total number of transactions
   - dateRange: Format as "DD Mon YYYY - DD Mon YYYY"

2. **categoryBreakdown**: For each spending category, provide:
   - category: Category name
   - amount: Total spent (positive number)
   - percentage: Percentage of total spending (rounded to 1 decimal)
   - transactionCount: Number of transactions in this category

3. **topVendors**: Identify top 5-7 merchants/vendors by spending:
   - name: Vendor/merchant name (clean and readable)
   - totalSpent: Amount spent at this vendor (positive)
   - transactionCount: How many times user transacted here
   - category: What category this vendor falls under

4. **monthlyTrend**: Monthly breakdown showing:
   - month: Format as "Mon YYYY" (e.g., "Nov 2024")
   - spent: Total spending that month (positive)
   - received: Total income/credits that month (positive)
   - net: received - spent

5. **suspiciousTransactions**: Flag transactions that are:
   - Unusually large compared to typical spending
   - At odd hours or unusual merchants
   - Potential duplicate charges
   - Subscriptions user might have forgotten
   Include: date, description, amount, reason (detailed explanation)

6. **suggestions**: Provide 5-7 HIGHLY SPECIFIC and ACTIONABLE financial tips based on the actual spending patterns. Be a tough but caring financial advisor. Include:
   
   - **Spending Cuts**: Identify specific areas where user is overspending (e.g., "You spent ₹X on food delivery this month. Cooking at home 3 days/week could save ₹Y/month")
   
   - **50/30/20 Rule Analysis**: Compare their spending to the ideal budget (50% needs, 30% wants, 20% savings) and give specific recommendations
   
   - **Subscription Audit**: If you see recurring charges, suggest reviewing them
   
   - **Smart Alternatives**: Suggest cheaper alternatives for their spending habits (e.g., "Switch from Zomato Gold to cooking - save ₹2000/month")
   
   - **Savings Goals**: Based on their income/spending, suggest realistic monthly savings targets
   
   - **Emergency Fund**: If spending is high, remind about building 6-month emergency fund
   
   - **Investment Nudge**: If they have positive cash flow, suggest where to invest (SIPs, FDs, etc.)
   
   - **Behavioral Insights**: Point out spending patterns (weekend splurges, emotional shopping, etc.)

   Make suggestions SPECIFIC with actual numbers from their data. Don't be generic!

RESPONSE FORMAT (JSON only, no markdown):
{
  "summary": {"totalSpent": 50000, "totalReceived": 60000, "netFlow": 10000, "transactionCount": 45, "dateRange": "01 Nov 2024 - 30 Nov 2024"},
  "categoryBreakdown": [{"category": "Food", "amount": 15000, "percentage": 30.0, "transactionCount": 20}],
  "topVendors": [{"name": "Swiggy", "totalSpent": 8000, "transactionCount": 15, "category": "Food"}],
  "monthlyTrend": [{"month": "Nov 2024", "spent": 20000, "received": 25000, "net": 5000}],
  "suspiciousTransactions": [{"date": "2024-11-15", "description": "Unknown merchant", "amount": 5000, "reason": "This transaction is 3x your average spend"}],
  "suggestions": ["Your food delivery spending of ₹8,000 is 16% of your income. Try meal prepping on Sundays - you could save ₹5,000/month and eat healthier!"]
}

Remember: Be specific, use actual numbers, and give advice that a caring but honest financial advisor would give.`;

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

/**
 * Chat session type for financial advisor
 */
export interface FinancialChatSession {
  sendMessage: (message: string) => Promise<string>;
}

/**
 * Start a financial advisor chat session with transaction context
 * Uses Gemini's chat functionality to maintain conversation history
 */
export function startFinancialChat(transactions: Transaction[]): FinancialChatSession {
  const systemPrompt = `You are SpendIQ's AI Financial Advisor - a friendly, knowledgeable, and data-driven personal finance expert. You have access to the user's complete transaction history and should provide personalized, actionable financial advice.

PERSONALITY:
- Be concise and friendly - use casual but professional language
- Be data-driven - always reference specific numbers from their transactions
- Be proactive - suggest insights they might not have thought to ask about
- Use emojis sparingly to make responses engaging (1-2 per response max)
- Format currency in Indian Rupees (₹)

YOUR KNOWLEDGE BASE - User's Transaction Data:
${JSON.stringify(transactions, null, 2)}

CAPABILITIES:
1. Analyze spending patterns by category, vendor, or time period
2. Identify their highest and lowest expenses
3. Compare spending across different categories
4. Spot unusual or suspicious transactions
5. Provide budgeting recommendations based on 50/30/20 rule
6. Suggest savings opportunities based on their actual spending
7. Track recurring subscriptions and suggest reviews
8. Analyze food delivery, shopping, and entertainment habits
9. Calculate daily/weekly/monthly spending averages
10. Identify spending trends over time

RESPONSE GUIDELINES:
- Keep responses concise (2-4 sentences for simple queries, up to a paragraph for analysis)
- Always include specific numbers and percentages from their data
- If asked about something not in their data, politely explain what you can help with
- Suggest follow-up questions to help them explore their finances deeper
- Never make up data - only use what's in their transaction history

EXAMPLE RESPONSES:
- "Your top spending category is Food & Dining at ₹12,450 (28% of total). Swiggy alone accounts for ₹6,200! 🍕 Want me to break down your food spending by vendor?"
- "You spent ₹3,200 on subscriptions this month. I noticed Netflix, Spotify, and Amazon Prime. Have you considered bundling services to save?"`;

  // Initialize chat session with context in history (systemInstruction as Content object)
  const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [{ text: systemPrompt + "\n\nPlease acknowledge that you understand and are ready to help." }],
      },
      {
        role: "model",
        parts: [{ text: "I'm ready to help you understand your finances! I've analyzed your transaction history and I'm here to answer any questions about your spending patterns, help identify savings opportunities, and provide personalized financial advice. What would you like to know? 💰" }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 1024,
    },
  });

  return {
    sendMessage: async (message: string): Promise<string> => {
      try {
        const result = await chat.sendMessage(message);
        const response = result.response;
        return response.text();
      } catch (error) {
        console.error("Chat error:", error);
        throw new Error("Failed to get response from AI advisor. Please try again.");
      }
    },
  };
}
