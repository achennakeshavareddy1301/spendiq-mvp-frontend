// src/pages/UPIAnalysis.tsx
// UPI Statement Upload and Analysis Page - Direct Gemini Integration

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { extractTextFromPDF, validatePDFFile } from "@/services/pdfParser";
import { processUPIStatement } from "@/services/gemini";
import { saveAnalysisToFirestore } from "@/services/firebase";
import { AnalysisResult, Transaction } from "@/types";
import AnalysisView from "@/components/AnalysisView";

type AnalysisStatus = "idle" | "extracting" | "analyzing" | "saving" | "done" | "error";

export default function UPIAnalysisPage(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    
    if (f) {
      const validation = validatePDFFile(f);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }
    }
    
    setFile(f);
    setAnalysis(null);
    setTransactions([]);
    setStatus("idle");
    setStatusMessage("");
    setError(null);
  }

  async function onUpload() {
    if (!file || !user) return;
    
    try {
      setError(null);
      
      // Step 1: Extract text from PDF
      setStatus("extracting");
      setStatusMessage("Reading PDF content...");
      const pdfText = await extractTextFromPDF(file);
      
      console.log("Extracted PDF text length:", pdfText.length);
      console.log("PDF text preview:", pdfText.substring(0, 1000));
      
      if (pdfText.length < 50) {
        throw new Error("PDF appears to be empty or contains very little text. Please ensure it's a valid UPI statement.");
      }
      
      // Step 2: Process with Gemini
      setStatus("analyzing");
      setStatusMessage("Analyzing transactions with AI...");
      const result = await processUPIStatement(pdfText);
      
      setTransactions(result.transactions);
      setAnalysis(result.analysis);
      
      // Step 3: Save to Firestore (optional - for history)
      setStatus("saving");
      setStatusMessage("Saving to your history...");
      try {
        await saveAnalysisToFirestore(user.uid, file.name, result.transactions, result.analysis);
      } catch (saveError) {
        // Non-critical error - analysis still succeeded
        console.warn("Could not save to history:", saveError);
      }
      
      setStatus("done");
      setStatusMessage("Analysis complete!");
      
    } catch (err: unknown) {
      console.error("Analysis error:", err);
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setStatus("error");
      setStatusMessage("");
    }
  }

  function resetForm() {
    setFile(null);
    setStatus("idle");
    setStatusMessage("");
    setAnalysis(null);
    setTransactions([]);
    setError(null);
  }

  // Render status indicator
  const renderStatus = () => {
    if (status === "idle") return null;

    const statusConfig: Record<AnalysisStatus, { icon: React.ReactNode; color: string }> = {
      idle: { icon: null, color: "" },
      extracting: {
        icon: <Loader2 className="h-5 w-5 animate-spin" />,
        color: "text-muted-foreground"
      },
      analyzing: {
        icon: <Loader2 className="h-5 w-5 animate-spin" />,
        color: "text-primary"
      },
      saving: {
        icon: <Loader2 className="h-5 w-5 animate-spin" />,
        color: "text-muted-foreground"
      },
      done: {
        icon: <CheckCircle className="h-5 w-5" />,
        color: "text-green-500"
      },
      error: {
        icon: <XCircle className="h-5 w-5" />,
        color: "text-destructive"
      }
    };

    const config = statusConfig[status];
    if (!config.icon) return null;

    return (
      <div className={`flex items-center gap-2 p-4 bg-secondary/50 rounded-lg border border-border ${config.color}`}>
        {config.icon}
        <span className="font-medium">{statusMessage}</span>
      </div>
    );
  };

  const isProcessing = status === "extracting" || status === "analyzing" || status === "saving";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link to="/" className="flex items-center">
              <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                SPEND<span className="relative">I<span className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-primary rounded-full"></span></span>Q
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  Dashboard
                </Button>
              </Link>
              <span className="text-sm text-muted-foreground hidden md:block">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto max-w-4xl pt-24 pb-12 px-4">
        {/* Back link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        {/* Upload Card */}
        {!analysis && (
          <Card className="bg-card/50 backdrop-blur-sm border-border mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <Upload className="h-6 w-6 text-primary" />
                UPI Statement Analysis
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Upload your UPI or bank statement PDF to get AI-powered financial insights,
                spending breakdown, and personalized suggestions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Input */}
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-foreground">
                  Select PDF File
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={onFileChange}
                      className="bg-secondary/50 border-border text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
                {file && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{file.name}</span>
                    <span className="text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={onUpload}
                disabled={!file || isProcessing}
                variant="hero"
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Analyze
                  </>
                )}
              </Button>

              {/* Status Display */}
              {renderStatus()}

              {/* Error Display */}
              {error && (
                <div className="p-4 bg-destructive/10 rounded-lg border border-destructive">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <h4 className="text-sm font-medium text-foreground mb-2">Supported Statements</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Paytm UPI Statement</li>
                  <li>• Google Pay Transaction History</li>
                  <li>• PhonePe Statement</li>
                  <li>• Bank UPI Transaction PDF</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-foreground">Analysis Results</h2>
              <Button variant="outline" onClick={resetForm}>
                Analyze Another Statement
              </Button>
            </div>
            
            {/* Transaction count */}
            <div className="text-sm text-muted-foreground">
              Found {transactions.length} transactions
            </div>
            
            <AnalysisView result={analysis} />
          </div>
        )}
      </div>
    </div>
  );
}