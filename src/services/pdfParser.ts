// src/services/pdfParser.ts
// Client-side PDF text extraction using PDF.js

import * as pdfjsLib from "pdfjs-dist";

// Set the worker source - using local file from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Extract text content from a PDF file
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = "";
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items
      const pageText = textContent.items
        .map((item) => (item as { str: string }).str)
        .join(" ");
      
      fullText += pageText + "\n\n";
    }
    
    if (!fullText.trim()) {
      throw new Error("No text could be extracted from the PDF. The file might be image-based or protected.");
    }
    
    return fullText.trim();
  } catch (error) {
    console.error("PDF parsing error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to read PDF file. Please ensure it's a valid PDF document.");
  }
}

/**
 * Validate that the file is a PDF
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== "application/pdf") {
    return { valid: false, error: "Please upload a PDF file" };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" };
  }
  
  // Check file extension
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return { valid: false, error: "File must have .pdf extension" };
  }
  
  return { valid: true };
}
