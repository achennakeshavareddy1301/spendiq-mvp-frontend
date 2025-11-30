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
  LogOut,
  Trash2,
  BarChart3,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Calendar
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeToUserAnalyses, deleteAnalysis } from "@/services/firebase";
import { AnalysisDocument } from "@/types";
import AnalysisView from "@/components/AnalysisView";

export default function Dashboard(): JSX.Element {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [analyses, setAnalyses] = useState<AnalysisDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisDocument | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Handle delete analysis
  const handleDelete = async (e: React.MouseEvent, analysisId: string) => {
    e.stopPropagation(); // Prevent card click
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    
    try {
      setDeletingId(analysisId);
      await deleteAnalysis(analysisId);
      if (selectedAnalysis?.id === analysisId) {
        setSelectedAnalysis(null);
      }
    } catch (error) {
      console.error("Failed to delete analysis:", error);
      alert("Failed to delete analysis. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate summary stats
  const stats = analyses.reduce(
    (acc, analysis) => {
      if (analysis.status === "done" && analysis.result) {
        acc.totalSpent += analysis.result.summary.totalSpent;
        acc.totalReceived += analysis.result.summary.totalReceived;
        acc.totalTransactions += analysis.result.summary.transactionCount;
      }
      return acc;
    },
    { totalSpent: 0, totalReceived: 0, totalTransactions: 0 }
  );

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
      <div className="container mx-auto max-w-7xl pt-24 pb-12 px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              View and manage your UPI statement analyses
            </p>
          </div>
          <Link to="/upi">
            <Button variant="hero" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              New Analysis
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {!loading && analyses.length > 0 && !selectedAnalysis && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Analyses</p>
                    <p className="text-3xl font-bold text-foreground">{analyses.length}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(stats.totalSpent)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <ArrowDownRight className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Received</p>
                    <p className="text-2xl font-bold text-green-500">{formatCurrency(stats.totalReceived)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Transactions</p>
                    <p className="text-3xl font-bold text-blue-500">{stats.totalTransactions}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Wallet className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Selected Analysis View */}
        {selectedAnalysis && selectedAnalysis.result && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground">
                Analysis: {selectedAnalysis.fileName}
              </h2>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={(e) => handleDelete(e, selectedAnalysis.id)}
                  disabled={deletingId === selectedAnalysis.id}
                >
                  {deletingId === selectedAnalysis.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedAnalysis(null)}>
                  Close
                </Button>
              </div>
            </div>
            <AnalysisView result={selectedAnalysis.result} />
          </div>
        )}

        {/* Analyses Grid */}
        {!selectedAnalysis && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analyses.length === 0 ? (
              <Card className="bg-card/50 backdrop-blur-sm border-border">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <FileText className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground mb-2">
                    No analyses yet
                  </h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-md">
                    Upload your first UPI statement to get started with AI-powered financial insights
                  </p>
                  <Link to="/upi">
                    <Button variant="hero" size="lg">
                      <Plus className="h-5 w-5 mr-2" />
                      Upload Your First Statement
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyses.map((analysis) => (
                  <Card 
                    key={analysis.id} 
                    className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 cursor-pointer group"
                    onClick={() => analysis.status === "done" && setSelectedAnalysis(analysis)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <CardTitle className="text-sm font-medium truncate max-w-[120px]" title={analysis.fileName}>
                              {analysis.fileName}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1 text-xs">
                              <Calendar className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{formatDate(analysis.createdAt)}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant={getStatusVariant(analysis.status)} className="capitalize text-xs px-2 py-0.5">
                            {analysis.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => handleDelete(e, analysis.id)}
                            disabled={deletingId === analysis.id}
                          >
                            {deletingId === analysis.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {analysis.status === "done" && analysis.result && (
                        <div className="space-y-4">
                          {/* Financial Summary */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-red-500/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-red-500 mb-1">
                                <ArrowDownRight className="h-4 w-4" />
                                <span className="text-xs font-medium">Spent</span>
                              </div>
                              <p className="text-lg font-bold text-red-500">
                                {formatCurrency(analysis.result.summary.totalSpent)}
                              </p>
                            </div>
                            <div className="bg-green-500/10 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-green-500 mb-1">
                                <ArrowUpRight className="h-4 w-4" />
                                <span className="text-xs font-medium">Received</span>
                              </div>
                              <p className="text-lg font-bold text-green-500">
                                {formatCurrency(analysis.result.summary.totalReceived)}
                              </p>
                            </div>
                          </div>
                          
                          {/* Net Flow & Transactions */}
                          <div className="flex items-center justify-between text-sm border-t border-border/50 pt-3">
                            <span className={`font-semibold flex items-center gap-1 ${
                              analysis.result.summary.netFlow >= 0 
                                ? 'text-green-500' 
                                : 'text-red-500'
                            }`}>
                              {analysis.result.summary.netFlow >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              Net: {formatCurrency(analysis.result.summary.netFlow)}
                            </span>
                            <span className="text-muted-foreground">
                              {analysis.result.summary.transactionCount} transactions
                            </span>
                          </div>
                          
                          {/* View Details Button */}
                          <Button 
                            variant="outline" 
                            className="w-full group-hover:border-primary/50 group-hover:bg-primary/5 transition-colors"
                          >
                            View Full Analysis
                            <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      )}
                      
                      {analysis.status === "processing" && (
                        <div className="flex flex-col items-center justify-center py-6">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                          <p className="text-sm text-muted-foreground">Analyzing your statement...</p>
                        </div>
                      )}
                      
                      {analysis.status === "error" && (
                        <div className="bg-destructive/10 rounded-lg p-4">
                          <p className="text-sm text-destructive">
                            {analysis.error || "An error occurred during analysis"}
                          </p>
                        </div>
                      )}
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
