import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MoneyHealthResult } from "@/lib/financialScore";

interface ScoreCardProps {
  result: MoneyHealthResult;
  monthlyIncome: number;
  monthlyExpenses: number;
  savings: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, amount));

const getScoreTone = (label: MoneyHealthResult["label"]) => {
  switch (label) {
    case "Healthy":
      return "text-green-500 bg-green-500/10 border-green-500/30";
    case "Average":
      return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    default:
      return "text-red-500 bg-red-500/10 border-red-500/30";
  }
};

export default function ScoreCard({ result, monthlyIncome, monthlyExpenses, savings }: ScoreCardProps) {
  const savingsRate = monthlyIncome > 0 ? savings / monthlyIncome : 0;

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-foreground">
          Money Health Score
          <Badge className={`border ${getScoreTone(result.label)}`} variant="outline">
            {result.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-semibold text-foreground">{result.score}</p>
            <p className="text-xs text-muted-foreground">Out of 100</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-muted-foreground">Savings Rate</p>
            <p className="text-lg font-semibold text-foreground">
              {Math.max(0, Math.round(savingsRate * 100))}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <p className="text-xs text-muted-foreground">Monthly Income</p>
            <p className="font-semibold text-foreground">{formatCurrency(monthlyIncome)}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <p className="text-xs text-muted-foreground">Monthly Expenses</p>
            <p className="font-semibold text-foreground">{formatCurrency(monthlyExpenses)}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/60 p-3">
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
            <p className="font-semibold text-foreground">{formatCurrency(savings)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
