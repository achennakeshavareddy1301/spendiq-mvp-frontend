// functions/src/index.ts
// Firebase Cloud Functions for SpendIQ UPI Analysis

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from "cors";
// @ts-ignore - pdf-parse types are incomplete
import pdfParse from "pdf-parse";
import { 
  Transaction, 
  AnalysisResult, 
  AnalyzeUPIRequest,
  AnalysisDocument 
} from "./types";
import { buildExtractionPrompt, buildAnalysisPrompt } from "./prompts";

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// Get Gemini API key from environment
// Set this using: firebase functions:config:set gemini.apikey="YOUR_API_KEY"
// Or use environment variables in Firebase Functions v2
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || functions.config().gemini?.apikey;

/**
 * Verify Firebase ID token from Authorization header
 */
async function verifyAuth(req: functions.https.Request): Promise<admin.auth.DecodedIdToken> {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new functions.https.HttpsError("unauthenticated", "Missing or invalid authorization header");
  }
  
  const idToken = authHeader.split("Bearer ")[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new functions.https.HttpsError("unauthenticated", "Invalid authentication token");
  }
}

/**
 * Parse JSON from Gemini response, handling potential markdown formatting
 */
function parseGeminiJson(text: string): unknown {
  // Remove markdown code fences if present
  let cleanText = text.trim();
  
  // Remove ```json or ``` markers
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  
  // Try to find JSON array or object in the response
  const jsonMatch = cleanText.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
  if (jsonMatch) {
    cleanText = jsonMatch[1];
  }
  
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error(`Failed to parse Gemini response as JSON: ${text.substring(0, 200)}...`);
  }
}

/**
 * Main function: Upload PDF and analyze UPI statement
 */
export const analyzeUPI = functions
  .runWith({ 
    timeoutSeconds: 300, // 5 minutes for processing
    memory: "512MB" 
  })
  .https.onRequest((req, res) => {
    corsHandler(req, res, async () => {
      try {
        // Only allow POST
        if (req.method !== "POST") {
          res.status(405).json({ success: false, error: "Method not allowed" });
          return;
        }

        // Verify authentication
        const decodedToken = await verifyAuth(req);
        const userId = decodedToken.uid;

        // Validate Gemini API key
        if (!GEMINI_API_KEY) {
          functions.logger.error("Gemini API key not configured");
          res.status(500).json({ success: false, error: "Server configuration error" });
          return;
        }

        // Parse request body
        const { fileName, fileContent, mimeType } = req.body as AnalyzeUPIRequest;
        
        if (!fileName || !fileContent) {
          res.status(400).json({ success: false, error: "Missing fileName or fileContent" });
          return;
        }

        if (mimeType !== "application/pdf") {
          res.status(400).json({ success: false, error: "Only PDF files are supported" });
          return;
        }

        // Create analysis document
        const analysisRef = db.collection("analyses").doc();
        const analysisId = analysisRef.id;
        
        const initialDoc: AnalysisDocument = {
          userId,
          fileName,
          status: "processing",
          createdAt: admin.firestore.FieldValue.serverTimestamp() as any,
          updatedAt: admin.firestore.FieldValue.serverTimestamp() as any,
          transactionCount: 0,
          result: null,
          error: null
        };
        
        await analysisRef.set(initialDoc);
        
        // Return immediately with analysisId
        res.json({ success: true, analysisId });
        
        // Continue processing in background
        processAnalysis(analysisRef, fileContent, GEMINI_API_KEY).catch(async (error) => {
          functions.logger.error("Analysis processing failed:", error);
          await analysisRef.update({
            status: "error",
            error: error.message || "Analysis failed",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });
        
      } catch (error: any) {
        functions.logger.error("analyzeUPI error:", error);
        res.status(error.code === "unauthenticated" ? 401 : 500).json({ 
          success: false, 
          error: error.message || "Internal server error" 
        });
      }
    });
  });

/**
 * Process the PDF analysis in background
 */
async function processAnalysis(
  analysisRef: admin.firestore.DocumentReference,
  fileContentBase64: string,
  apiKey: string
): Promise<void> {
  
  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  // Decode base64 PDF
  const pdfBuffer = Buffer.from(fileContentBase64, "base64");
  
  // Extract text from PDF
  let pdfText: string;
  try {
    const pdfData = await pdfParse(pdfBuffer);
    pdfText = pdfData.text;
    
    if (!pdfText || pdfText.trim().length < 50) {
      throw new Error("Could not extract text from PDF. The PDF may be scanned or image-based. OCR is not yet implemented.");
    }
  } catch (error: any) {
    if (error.message.includes("OCR")) {
      throw error;
    }
    throw new Error("Failed to parse PDF file. Please ensure it's a valid PDF document.");
  }

  // Store raw text for debugging
  await analysisRef.update({
    rawText: pdfText.substring(0, 10000) // Store first 10k chars for debugging
  });

  // Step 1: Extract transactions using Gemini
  functions.logger.info("Extracting transactions from PDF...");
  const extractionPrompt = buildExtractionPrompt(pdfText);
  
  const extractionResult = await model.generateContent(extractionPrompt);
  const extractionResponse = extractionResult.response.text();
  
  let transactions: Transaction[];
  try {
    transactions = parseGeminiJson(extractionResponse) as Transaction[];
    
    if (!Array.isArray(transactions)) {
      throw new Error("Expected array of transactions");
    }
    
    // Validate transaction structure
    transactions = transactions.filter(t => 
      t.date && 
      typeof t.amount === "number" && 
      (t.type === "debit" || t.type === "credit")
    );
    
  } catch (error: any) {
    functions.logger.error("Transaction extraction failed:", extractionResponse);
    throw new Error(`Failed to extract transactions: ${error.message}`);
  }

  if (transactions.length === 0) {
    throw new Error("No valid transactions found in the statement. Please check the PDF format.");
  }

  functions.logger.info(`Extracted ${transactions.length} transactions`);

  // Store transactions in subcollection
  const batch = db.batch();
  for (const transaction of transactions) {
    const txnRef = analysisRef.collection("transactions").doc();
    batch.set(txnRef, transaction);
  }
  await batch.commit();

  // Step 2: Analyze transactions using Gemini
  functions.logger.info("Analyzing transactions...");
  const analysisPrompt = buildAnalysisPrompt(JSON.stringify(transactions, null, 2));
  
  const analysisResult = await model.generateContent(analysisPrompt);
  const analysisResponse = analysisResult.response.text();
  
  let result: AnalysisResult;
  try {
    result = parseGeminiJson(analysisResponse) as AnalysisResult;
    
    // Validate result structure
    if (!result.summary || typeof result.summary.total_spent !== "number") {
      throw new Error("Invalid analysis result structure");
    }
    
  } catch (error: any) {
    functions.logger.error("Analysis parsing failed:", analysisResponse);
    throw new Error(`Failed to parse analysis: ${error.message}`);
  }

  functions.logger.info("Analysis complete!");

  // Update document with results
  await analysisRef.update({
    status: "done",
    transactionCount: transactions.length,
    result: result,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}

/**
 * Get a specific analysis by ID
 */
export const getAnalysis = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ success: false, error: "Method not allowed" });
        return;
      }

      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;
      
      const analysisId = req.query.id as string;
      if (!analysisId) {
        res.status(400).json({ success: false, error: "Missing analysis ID" });
        return;
      }

      const analysisDoc = await db.collection("analyses").doc(analysisId).get();
      
      if (!analysisDoc.exists) {
        res.status(404).json({ success: false, error: "Analysis not found" });
        return;
      }

      const data = analysisDoc.data() as AnalysisDocument;
      
      // Verify ownership
      if (data.userId !== userId) {
        res.status(403).json({ success: false, error: "Access denied" });
        return;
      }

      res.json({ 
        success: true, 
        analysis: { id: analysisDoc.id, ...data } 
      });
      
    } catch (error: any) {
      functions.logger.error("getAnalysis error:", error);
      res.status(error.code === "unauthenticated" ? 401 : 500).json({ 
        success: false, 
        error: error.message || "Internal server error" 
      });
    }
  });
});

/**
 * Get all analyses for the current user
 */
export const getAnalyses = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    try {
      if (req.method !== "GET") {
        res.status(405).json({ success: false, error: "Method not allowed" });
        return;
      }

      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;

      const snapshot = await db.collection("analyses")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(50)
        .get();

      const analyses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      res.json({ success: true, analyses });
      
    } catch (error: any) {
      functions.logger.error("getAnalyses error:", error);
      res.status(error.code === "unauthenticated" ? 401 : 500).json({ 
        success: false, 
        error: error.message || "Internal server error" 
      });
    }
  });
});
