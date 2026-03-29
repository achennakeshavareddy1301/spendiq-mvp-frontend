import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Loader2, CheckCircle, XCircle, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { extractTextFromPDF, validatePDFFile } from "@/services/pdfParser";
import { analyzeMFPortfolio } from "@/services/api";
import type { MFPortfolioReport } from "@/types";
import MFXRayReport from "@/components/MFXRayReport";

interface AnalyzeMFResponse {
  success: boolean;
  report: MFPortfolioReport;
}

type XRayStatus = "idle" | "extracting" | "analyzing" | "done" | "error";

export default function MFXRayPage(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<XRayStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [report, setReport] = useState<MFPortfolioReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const isProcessing = status === "extracting" || status === "analyzing";

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0] || null;
    if (nextFile) {
      const validation = validatePDFFile(nextFile);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        return;
      }
    }

    setFile(nextFile);
    setReport(null);
    setStatus("idle");
    setStatusMessage("");
    setError(null);
  }

  async function onUpload() {
    if (!file || !user) return;

    try {
      setError(null);
      setStatus("extracting");
      setStatusMessage("Reading CAMS/KFintech statement...");
      const pdfText = await extractTextFromPDF(file);

      if (pdfText.length < 100) {
        throw new Error("PDF appears empty or unreadable. Please upload a valid statement.");
      }

      setStatus("analyzing");
      setStatusMessage("Building your MF portfolio X-Ray...");

      const response = (await analyzeMFPortfolio({
        fileName: file.name,
        extractedText: pdfText,
      })) as AnalyzeMFResponse;

      if (!response.success) {
        throw new Error("MF portfolio analysis failed");
      }

      setReport(response.report);
      setStatus("done");
      setStatusMessage("MF portfolio X-Ray complete!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      setStatus("error");
      setStatusMessage("");
    }
  }

  return (
    <div className="min-h-screen bg-background">
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

      <div className="container mx-auto max-w-5xl pt-24 pb-12 px-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Dashboard</span>
        </Link>

        <Card className="bg-card/50 backdrop-blur-sm border-border mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Sparkles className="h-6 w-6 text-primary" />
              MF Portfolio X-Ray
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Upload your CAMS/KFintech statement to get XIRR, overlap analysis, and rebalancing guidance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="mf-upload" className="text-foreground">
                Select PDF File
              </Label>
              <Input
                id="mf-upload"
                type="file"
                accept=".pdf,application/pdf"
                onChange={onFileChange}
                className="bg-secondary/50 border-border text-foreground file:bg-primary file:text-primary-foreground file:border-0 file:rounded-md file:px-3 file:py-1 file:mr-3 file:cursor-pointer"
                disabled={isProcessing}
              />
              {file && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                </div>
              )}
            </div>

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

            {status === "done" && (
              <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg border border-border text-green-500">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">{statusMessage}</span>
              </div>
            )}
            {status === "error" && error && (
              <div className="flex items-center gap-2 p-4 bg-secondary/50 rounded-lg border border-border text-destructive">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {report && <MFXRayReport report={report} />}
      </div>
    </div>
  );
}
