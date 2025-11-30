// src/services/api.ts
// API service for calling Firebase Cloud Functions

import { getIdToken } from "./firebase";
import { UploadResponse, AnalysisResponse, AnalysesListResponse } from "@/types";

// Cloud Functions base URL
// In production, this will be your Firebase project's functions URL
// For local development with emulators, use: http://localhost:5001/port-9867d/us-central1
const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_URL || 
  "https://us-central1-port-9867d.cloudfunctions.net";

/**
 * Helper to make authenticated API calls
 */
async function authFetch(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const token = await getIdToken();
  
  if (!token) {
    throw new Error("Not authenticated. Please log in.");
  }
  
  const headers: HeadersInit = {
    "Authorization": `Bearer ${token}`,
    ...options.headers,
  };
  
  // Don't set Content-Type for FormData (browser will set it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  
  const response = await fetch(`${FUNCTIONS_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  return response;
}

/**
 * Upload a PDF file for analysis
 * Sends the file as base64 to avoid multipart complexity with Cloud Functions
 */
export async function uploadPDFForAnalysis(file: File): Promise<UploadResponse> {
  // Convert file to base64
  const base64 = await fileToBase64(file);
  
  const response = await authFetch("/analyzeUPI", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      fileContent: base64,
      mimeType: file.type,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || `Upload failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get a specific analysis by ID
 */
export async function fetchAnalysis(analysisId: string): Promise<AnalysisResponse> {
  const response = await authFetch(`/getAnalysis?id=${analysisId}`, {
    method: "GET",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch analysis" }));
    throw new Error(error.error || `Failed to fetch: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get all analyses for the current user
 */
export async function fetchUserAnalyses(): Promise<AnalysesListResponse> {
  const response = await authFetch("/getAnalyses", {
    method: "GET",
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to fetch analyses" }));
    throw new Error(error.error || `Failed to fetch: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Convert a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}
