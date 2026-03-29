// src/components/AnalysisView.tsx
// Component for displaying UPI analysis results with charts and PDF export

import { useEffect, useMemo, useRef, useState, lazy, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Calendar,
  CreditCard,
  Store,
  PieChart as PieChartIcon,
  Download,
  BarChart3,
  LineChart as LineChartIcon,
  Sparkles,
  ShieldCheck,
  PiggyBank
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { AnalysisResult } from "@/types";
import ScoreCard from "@/components/ScoreCard";
import AdvisorChat from "@/components/AdvisorChat";
import { calculateMoneyHealthScore } from "@/lib/financialScore";
import { calculateFirePlan } from "@/lib/firePlanner";
import { generateFinancialAdvice } from "@/services/aiAdvisor";
import type { AdvisorResponse } from "@/services/aiAdvisor";
import { useAuth } from "@/contexts/AuthContext";

const LazyFireChart = lazy(() => import("@/components/FireChart"));

interface AnalysisViewProps {
  result: AnalysisResult;
  analysisId?: string;
  advisorPlan?: AdvisorResponse | null;
}

// Color palette for charts
const CHART_COLORS = [
  "#22c55e", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
  "#06b6d4", // cyan
  "#a855f7", // purple
];

const CHART_TEXT_CLASSES = [
  "text-emerald-500",
  "text-blue-500",
  "text-amber-500",
  "text-red-500",
  "text-violet-500",
  "text-pink-500",
  "text-teal-500",
  "text-orange-500",
  "text-indigo-500",
  "text-lime-500",
  "text-cyan-500",
  "text-fuchsia-500",
];

const CHART_DOT_CLASSES = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-orange-500",
  "bg-indigo-500",
  "bg-lime-500",
  "bg-cyan-500",
  "bg-fuchsia-500",
];

export default function AnalysisView({ result, analysisId, advisorPlan }: AnalysisViewProps) {
  const { summary, categoryBreakdown, topVendors, monthlyTrend, suspiciousTransactions, suggestions } = result;
  const analysisRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const [advisorResponse, setAdvisorResponse] = useState<AdvisorResponse | null>(null);
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorError, setAdvisorError] = useState<string | null>(null);
  const [userAge, setUserAge] = useState(profile?.age ?? 28);
  const [targetAge, setTargetAge] = useState(50);

  const normalizeAge = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, Math.round(value)));

  const getChartTextClass = (color: string) => {
    const index = CHART_COLORS.indexOf(color);
    return CHART_TEXT_CLASSES[index] || "text-primary";
  };

  const getChartDotClass = (color: string) => {
    const index = CHART_COLORS.indexOf(color);
    return CHART_DOT_CLASSES[index] || "bg-primary";
  };

  useEffect(() => {
    if (profile?.age) {
      setUserAge(profile.age);
    }
  }, [profile?.age]);

  useEffect(() => {
    if (advisorPlan && !advisorResponse) {
      setAdvisorResponse(advisorPlan);
    }
  }, [advisorPlan, advisorResponse]);


  const monthsCount = Math.max(1, monthlyTrend?.length ?? 1);
  const monthlyIncomeFromData = summary.totalReceived / monthsCount;
  const monthlyIncome = profile?.monthlyIncome && profile.monthlyIncome > 0
    ? profile.monthlyIncome
    : monthlyIncomeFromData;
  const monthlyExpenses = summary.totalSpent / monthsCount;
  const savings = Math.max(0, monthlyIncome - monthlyExpenses);
  const debtEstimate = (categoryBreakdown || [])
    .filter((category) => /emi|loan|debt/i.test(category.category))
    .reduce((acc, category) => acc + category.amount, 0) / monthsCount;

  const moneyHealth = useMemo(
    () =>
      calculateMoneyHealthScore({
        monthlyIncome,
        totalExpenses: monthlyExpenses,
        categoryBreakdown: categoryBreakdown || [],
        debt: debtEstimate,
        savings,
      }),
    [monthlyIncome, monthlyExpenses, categoryBreakdown, debtEstimate, savings]
  );

  const firePlan = useMemo(
    () =>
      calculateFirePlan({
        age: userAge,
        monthlyIncome,
        monthlyExpenses,
        targetRetirementAge: targetAge,
      }),
    [userAge, targetAge, monthlyIncome, monthlyExpenses]
  );

  const advisorInput = useMemo(
    () => ({
      monthlyIncome,
      monthlyExpenses,
      savings,
      debt: debtEstimate,
      portfolioSnapshot: profile?.portfolioSnapshot ?? [],
      analysis: result,
      moneyHealth,
      firePlan,
    }),
    [monthlyIncome, monthlyExpenses, savings, debtEstimate, result, moneyHealth, firePlan, profile?.portfolioSnapshot]
  );

  useEffect(() => {
    let isMounted = true;

    if (advisorPlan || advisorResponse) {
      return () => {
        isMounted = false;
      };
    }

    if (monthlyIncome <= 0 || monthlyExpenses <= 0) {
      return;
    }

    setAdvisorLoading(true);
    setAdvisorError(null);

    generateFinancialAdvice(advisorInput, analysisId)
      .then((response) => {
        if (isMounted) {
          setAdvisorResponse(response);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setAdvisorError(error instanceof Error ? error.message : "Unable to generate advice");
        }
      })
      .finally(() => {
        if (isMounted) {
          setAdvisorLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [advisorInput, monthlyIncome, monthlyExpenses, analysisId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  const portfolioSnapshot = profile?.portfolioSnapshot ?? [];
  const portfolioTotal = portfolioSnapshot.reduce((acc, item) => acc + item.amount, 0);

  // Format currency for PDF (without symbol issues)
  const formatCurrencyPDF = (amount: number) => {
    return "Rs. " + new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  // Prepare pie chart data
  const pieChartData = categoryBreakdown
    ?.filter(cat => cat.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8) // Top 8 categories
    .map((cat, index) => ({
      name: cat.category,
      value: cat.amount,
      percentage: cat.percentage,
      color: CHART_COLORS[index % CHART_COLORS.length]
    })) || [];

  // Prepare bar chart data for monthly spending
  const barChartData = monthlyTrend?.map(month => ({
    month: month.month,
    Spent: month.spent,
    Received: month.received,
  })) || [];

  // Prepare line chart data for income vs expenses
  const lineChartData = monthlyTrend?.map(month => ({
    month: month.month,
    Income: month.received,
    Expenses: month.spent,
    NetFlow: month.net,
  })) || [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={`text-sm ${getChartTextClass(entry.color)}`}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Generate and download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text("SpendIQ", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("UPI Statement Analysis Report", 14, 30);
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-IN", { 
      year: "numeric", 
      month: "long", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}`, 14, 38);
    
    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Financial Summary", 14, 52);
    
    autoTable(doc, {
      startY: 56,
      head: [["Metric", "Amount"]],
      body: [
        ["Total Spent", formatCurrencyPDF(summary.totalSpent)],
        ["Total Received", formatCurrencyPDF(summary.totalReceived)],
        ["Net Flow", (summary.netFlow >= 0 ? "+" : "-") + formatCurrencyPDF(summary.netFlow)],
        ["Total Transactions", summary.transactionCount.toString()],
        ["Analysis Period", summary.dateRange || "N/A"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
      styles: { fontSize: 10 },
    });

    // Category Breakdown
    if (categoryBreakdown && categoryBreakdown.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 90;
      doc.setFontSize(14);
      doc.text("Spending by Category", 14, finalY + 15);
      
      autoTable(doc, {
        startY: finalY + 19,
        head: [["Category", "Amount", "Percentage", "Transactions"]],
        body: categoryBreakdown
          .sort((a, b) => b.amount - a.amount)
          .map(cat => [
            cat.category,
            formatCurrencyPDF(cat.amount),
            `${cat.percentage}%`,
            cat.transactionCount.toString()
          ]),
        theme: "striped",
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 },
      });
    }

    // Top Vendors
    if (topVendors && topVendors.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      
      // Check if we need a new page
      if (finalY > 220) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Top Vendors", 14, 20);
        autoTable(doc, {
          startY: 24,
          head: [["Vendor", "Total Spent", "Transactions", "Category"]],
          body: topVendors.map(vendor => [
            vendor.name || "Unknown",
            formatCurrencyPDF(vendor.totalSpent),
            vendor.transactionCount.toString(),
            vendor.category
          ]),
          theme: "striped",
          headStyles: { fillColor: [139, 92, 246] },
          styles: { fontSize: 9 },
        });
      } else {
        doc.setFontSize(14);
        doc.text("Top Vendors", 14, finalY + 15);
        autoTable(doc, {
          startY: finalY + 19,
          head: [["Vendor", "Total Spent", "Transactions", "Category"]],
          body: topVendors.map(vendor => [
            vendor.name || "Unknown",
            formatCurrencyPDF(vendor.totalSpent),
            vendor.transactionCount.toString(),
            vendor.category
          ]),
          theme: "striped",
          headStyles: { fillColor: [139, 92, 246] },
          styles: { fontSize: 9 },
        });
      }
    }

    // Monthly Trend
    if (monthlyTrend && monthlyTrend.length > 0) {
      const finalY = (doc as any).lastAutoTable.finalY || 200;
      
      if (finalY > 220) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text("Monthly Breakdown", 14, 20);
        autoTable(doc, {
          startY: 24,
          head: [["Month", "Spent", "Received", "Net Flow"]],
          body: monthlyTrend.map(month => [
            month.month,
            formatCurrencyPDF(month.spent),
            formatCurrencyPDF(month.received),
            (month.net >= 0 ? "+" : "-") + formatCurrencyPDF(month.net)
          ]),
          theme: "striped",
          headStyles: { fillColor: [245, 158, 11] },
          styles: { fontSize: 9 },
        });
      } else {
        doc.setFontSize(14);
        doc.text("Monthly Breakdown", 14, finalY + 15);
        autoTable(doc, {
          startY: finalY + 19,
          head: [["Month", "Spent", "Received", "Net Flow"]],
          body: monthlyTrend.map(month => [
            month.month,
            formatCurrencyPDF(month.spent),
            formatCurrencyPDF(month.received),
            (month.net >= 0 ? "+" : "-") + formatCurrencyPDF(month.net)
          ]),
          theme: "striped",
          headStyles: { fillColor: [245, 158, 11] },
          styles: { fontSize: 9 },
        });
      }
    }

    // Suspicious Transactions
    if (suspiciousTransactions && suspiciousTransactions.length > 0) {
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(239, 68, 68);
      doc.text("Suspicious Transactions", 14, 20);
      doc.setTextColor(0, 0, 0);
      
      autoTable(doc, {
        startY: 24,
        head: [["Date", "Description", "Amount", "Reason"]],
        body: suspiciousTransactions.map(txn => [
          txn.date,
          txn.description.substring(0, 30),
          formatCurrencyPDF(txn.amount),
          txn.reason
        ]),
        theme: "striped",
        headStyles: { fillColor: [239, 68, 68] },
        styles: { fontSize: 9 },
        columnStyles: {
          3: { cellWidth: 60 }
        }
      });
    }

    // Financial Suggestions
    if (suggestions && suggestions.length > 0) {
      const finalY = (doc as any).lastAutoTable?.finalY || 20;
      
      if (finalY > 180) {
        doc.addPage();
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.text("Financial Suggestions", 14, 20);
        doc.setTextColor(0, 0, 0);
        
        let yPos = 30;
        doc.setFontSize(10);
        suggestions.forEach((suggestion, index) => {
          const lines = doc.splitTextToSize(`${index + 1}. ${suggestion}`, pageWidth - 28);
          doc.text(lines, 14, yPos);
          yPos += lines.length * 6 + 4;
          
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
        });
      } else {
        doc.setFontSize(14);
        doc.setTextColor(34, 197, 94);
        doc.text("Financial Suggestions", 14, finalY + 15);
        doc.setTextColor(0, 0, 0);
        
        let yPos = finalY + 25;
        doc.setFontSize(10);
        suggestions.forEach((suggestion, index) => {
          const lines = doc.splitTextToSize(`${index + 1}. ${suggestion}`, pageWidth - 28);
          doc.text(lines, 14, yPos);
          yPos += lines.length * 6 + 4;
          
          if (yPos > 280) {
            doc.addPage();
            yPos = 20;
          }
        });
      }
    }

    // Footer on last page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | Generated by SpendIQ - Your AI Financial Advisor`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    // Save the PDF
    doc.save(`SpendIQ_Analysis_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div ref={analysisRef} className="space-y-6">
      {/* Export Button */}
      <div className="flex justify-end">
        <Button onClick={downloadPDF} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF Report
        </Button>
      </div>

      {/* Money Health and AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ScoreCard
          result={moneyHealth}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
          savings={savings}
        />

        <Card className="bg-card/60 backdrop-blur-sm border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
              <Badge variant="secondary" className="ml-auto text-xs">
                Actionable
              </Badge>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Personalized recommendations based on your real spending data.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {advisorLoading && (
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-full rounded bg-muted/40 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-muted/40 animate-pulse" />
              </div>
            )}

            {advisorError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {advisorError}
              </div>
            )}

            {advisorResponse && !advisorLoading && !advisorError && (
              <div className="grid gap-4">
                <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Recommended SIP</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {formatCurrency(advisorResponse.sipRecommendation.amount)} / month
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <PiggyBank className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {advisorResponse.sipRecommendation.rationale}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {advisorResponse.actionItems.slice(0, 4).map((item, index) => (
                    <div
                      key={item}
                      className="rounded-xl border border-border/60 bg-background/60 p-3 text-sm text-foreground"
                    >
                      <span className="mr-2 text-xs text-primary">{index + 1}.</span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* FIRE Planner and Portfolio Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-5 w-5 text-primary" />
              FIRE Planner
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Targeting financial independence by age {firePlan.targetRetirementAge}.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="advisor-age" className="text-xs text-muted-foreground">
                  Current Age
                </Label>
                <Input
                  id="advisor-age"
                  type="number"
                  min={18}
                  max={65}
                  value={userAge}
                  onChange={(event) => {
                    const nextAge = normalizeAge(Number(event.target.value) || 18, 18, 65);
                    setUserAge(nextAge);
                    if (targetAge <= nextAge) {
                      setTargetAge(nextAge + 1);
                    }
                  }}
                  className="bg-background/60"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="advisor-retire" className="text-xs text-muted-foreground">
                  Target Retirement Age
                </Label>
                <Input
                  id="advisor-retire"
                  type="number"
                  min={Math.max(22, userAge + 1)}
                  max={75}
                  value={targetAge}
                  onChange={(event) => {
                    const nextTarget = normalizeAge(
                      Number(event.target.value) || userAge + 1,
                      Math.max(22, userAge + 1),
                      75
                    );
                    setTargetAge(nextTarget);
                  }}
                  className="bg-background/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="text-xs uppercase text-muted-foreground">Retirement Corpus</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(firePlan.retirementCorpus)}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="text-xs uppercase text-muted-foreground">Monthly SIP Needed</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(firePlan.monthlySipRequired)}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="text-xs uppercase text-muted-foreground">Years to FI</p>
                <p className="text-xl font-semibold text-foreground">
                  {firePlan.yearsToFinancialIndependence} years
                </p>
              </div>
            </div>

            <div className="h-[260px]">
              <Suspense
                fallback={<div className="h-full w-full rounded-xl bg-muted/30 animate-pulse" />}
              >
                <LazyFireChart firePlan={firePlan} currentAge={userAge} />
              </Suspense>
            </div>

            <p className="text-xs text-muted-foreground">
              Assumptions: 10% annual return, 6% inflation, age {userAge}, target age {firePlan.targetRetirementAge}.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Lightbulb className="h-5 w-5 text-primary" />
              Portfolio Suggestions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Balanced allocation ideas based on your profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {advisorLoading && (
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-5/6 rounded bg-muted/40 animate-pulse" />
                <div className="h-3 w-3/4 rounded bg-muted/40 animate-pulse" />
              </div>
            )}

            {advisorResponse && !advisorLoading && (
              <div className="space-y-2 text-sm text-foreground">
                {advisorResponse.portfolioSuggestions.map((suggestion) => (
                  <div
                    key={suggestion}
                    className="rounded-lg border border-border/60 bg-background/60 p-3"
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}

            {!advisorLoading && !advisorResponse && !advisorError && (
              <div className="text-sm text-muted-foreground">
                Upload more statements to unlock personalized portfolio guidance.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Portfolio Overview
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Snapshot of your current mutual funds and stock holdings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {portfolioSnapshot.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
              Add your MF and stock holdings in the Portfolio Snapshot on the dashboard to see them here.
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-4">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Total Portfolio Value</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {formatCurrency(portfolioTotal)}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {portfolioSnapshot.length} holdings
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {portfolioSnapshot.map((item) => (
                  <div key={`${item.name}-${item.type}`} className="rounded-xl border border-border/60 bg-background/60 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{item.type}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Advisor Chat */}
      <AdvisorChat advisorInput={advisorInput} analysisId={analysisId} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spent */}
        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(summary.totalSpent)}
            </div>
          </CardContent>
        </Card>

        {/* Total Received */}
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(summary.totalReceived)}
            </div>
          </CardContent>
        </Card>

        {/* Net Flow */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Flow
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {summary.netFlow >= 0 ? '+' : '-'}{formatCurrency(summary.netFlow)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period and Transaction Count */}
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5" />
            Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div>
            <span className="text-muted-foreground text-sm">Period: </span>
            <span className="font-medium text-foreground">{summary.dateRange}</span>
          </div>
          <div>
            <span className="text-muted-foreground text-sm">Transactions: </span>
            <span className="font-medium text-foreground">{summary.transactionCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Spending by Category */}
        {pieChartData.length > 0 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Spending by Category
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Visual breakdown of your expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} (${percentage}%)`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {pieChartData.map((cat, index) => (
                  <div key={cat.name} className="flex items-center gap-1 text-xs">
                    <div className={`w-3 h-3 rounded-full ${getChartDotClass(cat.color)}`} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bar Chart - Monthly Spending */}
        {barChartData.length > 0 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <BarChart3 className="h-5 w-5 text-primary" />
                Monthly Spending Trends
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Compare spending and income month-by-month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                    />
                    <YAxis 
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                      axisLine={{ stroke: '#374151' }}
                      tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Received" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Line Chart - Income vs Expenses */}
      {lineChartData.length > 1 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <LineChartIcon className="h-5 w-5 text-primary" />
              Income vs Expenses Trend
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Track your financial flow over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Income" 
                    stroke="#22c55e" 
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Expenses" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="NetFlow" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown Table */}
      {categoryBreakdown && categoryBreakdown.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChartIcon className="h-5 w-5" />
              Category Details
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Detailed breakdown of your expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryBreakdown
                .sort((a, b) => b.amount - a.amount)
                .map((cat, index) => (
                  <div key={cat.category} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <div>
                        <Badge variant="outline" className="text-foreground border-border">
                          {cat.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-2">
                          {cat.transactionCount} transactions
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-foreground">{formatCurrency(cat.amount)}</span>
                      <span className="text-xs text-muted-foreground ml-2">({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Vendors */}
      {topVendors && topVendors.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Store className="h-5 w-5" />
              Top Vendors
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Where you spend the most
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topVendors.map((vendor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg">
                  <div>
                    <span className="font-medium text-foreground">{vendor.name || "Unknown"}</span>
                    <div className="text-muted-foreground text-sm">
                      {vendor.transactionCount} transactions • {vendor.category}
                    </div>
                  </div>
                  <span className="font-bold text-foreground">{formatCurrency(vendor.totalSpent)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspicious Transactions */}
      {suspiciousTransactions && suspiciousTransactions.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Suspicious Transactions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Transactions that may need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspiciousTransactions.map((txn, index) => (
                <div key={index} className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-foreground">{txn.date}</span>
                      <span className="text-muted-foreground text-sm ml-2">- {txn.description}</span>
                    </div>
                    <span className="font-bold text-red-500">{formatCurrency(txn.amount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground bg-red-500/5 p-2 rounded">{txn.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <Lightbulb className="h-5 w-5" />
              Financial Suggestions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-powered insights to improve your finances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
                  <span className="text-green-500 font-bold text-lg">{index + 1}.</span>
                  <span className="text-foreground">{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
