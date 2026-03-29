import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MFPortfolioReport } from "@/types";

interface MFXRayReportProps {
  report: MFPortfolioReport;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount));

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

export default function MFXRayReport({ report }: MFXRayReportProps) {
  const summary = report.portfolioSummary;

  return (
    <div className="space-y-6">
      <Card className="bg-card/60 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-foreground">
            Portfolio Summary
            <Badge variant="secondary" className="text-xs">
              Confidence: {report.dataQuality.confidence}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-xs uppercase text-muted-foreground">Total Invested</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(summary.totalInvested)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-xs uppercase text-muted-foreground">Current Value</p>
            <p className="text-xl font-semibold text-foreground">
              {formatCurrency(summary.currentValue)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-xs uppercase text-muted-foreground">Portfolio XIRR</p>
            <p className="text-xl font-semibold text-foreground">
              {formatPercent(summary.xirr)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-xs uppercase text-muted-foreground">Equity Allocation</p>
            <p className="text-xl font-semibold text-foreground">
              {formatPercent(summary.equityAllocation)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-xs uppercase text-muted-foreground">Debt Allocation</p>
            <p className="text-xl font-semibold text-foreground">
              {formatPercent(summary.debtAllocation)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-4">
            <p className="text-xs uppercase text-muted-foreground">Overlap Score</p>
            <p className="text-xl font-semibold text-foreground">
              {summary.overlapScore.toFixed(0)} / 100
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Holdings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.holdings.map((holding) => (
              <div key={holding.fundName} className="rounded-xl border border-border/60 bg-background/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{holding.fundName}</p>
                    <p className="text-xs text-muted-foreground">{holding.category}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatPercent(holding.xirr)} XIRR
                  </Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Invested</p>
                    <p className="font-semibold text-foreground">{formatCurrency(holding.invested)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Current Value</p>
                    <p className="font-semibold text-foreground">{formatCurrency(holding.currentValue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expense Ratio</p>
                    <p className="font-semibold text-foreground">{formatPercent(holding.expenseRatio)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Top Sectors</p>
                    <p className="font-semibold text-foreground">
                      {holding.topSectors.slice(0, 3).join(", ") || "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Overlap Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {report.overlapAnalysis.overlapPairs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No major overlap detected.</p>
              ) : (
                report.overlapAnalysis.overlapPairs.map((pair) => (
                  <div key={`${pair.fundA}-${pair.fundB}`} className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
                    {pair.fundA} vs {pair.fundB}: {pair.overlapPercent.toFixed(1)}% overlap
                  </div>
                ))
              )}
              {report.overlapAnalysis.duplicateHoldings.length > 0 && (
                <div className="rounded-lg border border-border/60 bg-background/60 p-3 text-sm">
                  Duplicate holdings: {report.overlapAnalysis.duplicateHoldings.join(", ")}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card/60 backdrop-blur-sm border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Benchmark Comparison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Benchmark</p>
                <p className="font-semibold text-foreground">{report.benchmarkComparison.benchmark}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Portfolio Return</p>
                  <p className="font-semibold text-foreground">
                    {formatPercent(report.benchmarkComparison.portfolioReturn)}
                  </p>
                </div>
                <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                  <p className="text-xs text-muted-foreground">Benchmark Return</p>
                  <p className="font-semibold text-foreground">
                    {formatPercent(report.benchmarkComparison.benchmarkReturn)}
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-xs text-muted-foreground">Alpha</p>
                <p className="font-semibold text-foreground">
                  {formatPercent(report.benchmarkComparison.alpha)} over {report.benchmarkComparison.period}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Risk Flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {report.riskFlags.length === 0 ? (
              <p className="text-muted-foreground">No critical risk flags detected.</p>
            ) : (
              report.riskFlags.map((flag) => (
                <div key={flag} className="rounded-lg border border-border/60 bg-background/60 p-3">
                  {flag}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Rebalancing Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {report.rebalancingPlan.map((item) => (
              <div key={item} className="rounded-lg border border-border/60 bg-background/60 p-3">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {report.dataQuality.notes.length > 0 && (
        <Card className="bg-card/60 backdrop-blur-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">Data Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {report.dataQuality.notes.map((note) => (
              <div key={note} className="rounded-lg border border-border/60 bg-background/60 p-3">
                {note}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
