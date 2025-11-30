// src/pages/Dashboard.tsx
// Dashboard page showing all past analyses for the logged-in user

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Loader2,
  ChevronRight,
  LogOut
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToUserAnalyses } from "@/services/firebase";
import { AnalysisDocument } from "@/types";
import AnalysisView from "@/components/AnalysisView";

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [analyses, setAnalyses] = useState<AnalysisDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisDocument | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  // Subscribe to user's analyses
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToUserAnalyses(user.uid, (data) => {
      setAnalyses(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge variant
  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "done":
        return "default";
      case "processing":
      case "pending":
        return "secondary";
      case "error":
        return "destructive";
      default:
        return "outline";
    }
  };

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
              <span className="text-sm text-muted-foreground hidden md:block">
                {user?.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl pt-24 pb-12 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your UPI statement analyses
            </p>
          </div>
          <Link to="/upi">
            <Button variant="hero">
              <Plus className="h-4 w-4 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Selected Analysis View */}
        {selectedAnalysis && selectedAnalysis.result && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Analysis: {selectedAnalysis.fileName}
              </h2>
              <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
                Close
              </Button>
            </div>
            <AnalysisView result={selectedAnalysis.result} />
          </div>
        )}

        {/* Analyses List */}
        {!selectedAnalysis && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analyses.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-muted-foreground mb-4 text-center">
                    Upload your first UPI statement to get started with financial insights
                  </p>
                  <Link to="/upi">
                    <Button variant="hero">
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Statement
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {analyses.map((analysis) => (
                  <Card 
                    key={analysis.id} 
                    className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/30 transition-colors cursor-pointer"
                    onClick={() => analysis.status === "done" && setSelectedAnalysis(analysis)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-foreground">
                              {analysis.fileName}
                            </h3>
                            <Badge variant={getStatusVariant(analysis.status)}>
                              {analysis.status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDate(analysis.createdAt)}
                            </span>
                            
                            {analysis.status === "done" && analysis.result && (
                              <>
                                <span className="flex items-center gap-1 text-destructive">
                                  <TrendingDown className="h-4 w-4" />
                                  {formatCurrency(analysis.result.summary.totalSpent)}
                                </span>
                                <span className={`flex items-center gap-1 ${
                                  analysis.result.summary.netFlow >= 0 
                                    ? 'text-primary' 
                                    : 'text-destructive'
                                }`}>
                                  <TrendingUp className="h-4 w-4" />
                                  Net: {formatCurrency(analysis.result.summary.netFlow)}
                                </span>
                                <span className="text-foreground">
                                  {analysis.result.summary.transactionCount} transactions
                                </span>
                              </>
                            )}
                            
                            {analysis.status === "processing" && (
                              <span className="flex items-center gap-1">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                              </span>
                            )}
                            
                            {analysis.status === "error" && analysis.error && (
                              <span className="text-destructive">
                                {analysis.error}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {analysis.status === "done" && (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
