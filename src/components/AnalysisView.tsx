// src/components/AnalysisView.tsx
// Component for displaying UPI analysis results

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  Calendar,
  CreditCard,
  Store,
  PieChart
} from "lucide-react";
import { AnalysisResult } from "@/types";

interface AnalysisViewProps {
  result: AnalysisResult;
}

export default function AnalysisView({ result }: AnalysisViewProps) {
  const { summary, categoryBreakdown, topVendors, monthlyTrend, suspiciousTransactions, suggestions } = result;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Spent */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(summary.totalSpent)}
            </div>
          </CardContent>
        </Card>

        {/* Total Received */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Received
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(summary.totalReceived)}
            </div>
          </CardContent>
        </Card>

        {/* Net Flow */}
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Net Flow
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netFlow >= 0 ? 'text-primary' : 'text-destructive'}`}>
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

      {/* Spending by Category */}
      {categoryBreakdown && categoryBreakdown.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <PieChart className="h-5 w-5" />
              Spending by Category
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Breakdown of your expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categoryBreakdown
                .sort((a, b) => b.amount - a.amount)
                .map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-foreground border-border">
                        {cat.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({cat.percentage}% • {cat.transactionCount} txns)
                      </span>
                    </div>
                    <span className="font-medium text-foreground">{formatCurrency(cat.amount)}</span>
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
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground">{vendor.name || "Unknown"}</span>
                    <span className="text-muted-foreground text-sm ml-2">
                      ({vendor.transactionCount} txns • {vendor.category})
                    </span>
                  </div>
                  <span className="font-medium text-foreground">{formatCurrency(vendor.totalSpent)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Breakdown */}
      {monthlyTrend && monthlyTrend.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Calendar className="h-5 w-5" />
              Monthly Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyTrend.map((month) => (
                <div key={month.month} className="p-3 bg-secondary/30 rounded-lg">
                  <div className="font-medium text-foreground mb-2">{month.month}</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Spent: </span>
                      <span className="text-destructive">{formatCurrency(month.spent)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Received: </span>
                      <span className="text-primary">{formatCurrency(month.received)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Net: </span>
                      <span className={month.net >= 0 ? 'text-primary' : 'text-destructive'}>
                        {month.net >= 0 ? '+' : ''}{formatCurrency(month.net)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspicious Transactions */}
      {suspiciousTransactions && suspiciousTransactions.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
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
                <div key={index} className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <span className="font-medium text-foreground">{txn.date}</span>
                      <span className="text-muted-foreground text-sm ml-2">- {txn.description}</span>
                    </div>
                    <span className="font-bold text-destructive">{formatCurrency(txn.amount)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{txn.reason}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Lightbulb className="h-5 w-5" />
              Financial Suggestions
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              AI-powered insights to improve your finances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
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
