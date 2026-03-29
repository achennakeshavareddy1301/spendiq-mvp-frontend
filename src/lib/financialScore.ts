import { CategoryBreakdown } from "@/types";

export type MoneyHealthLabel = "Healthy" | "Average" | "Risky";

export interface MoneyHealthInput {
  monthlyIncome: number;
  totalExpenses: number;
  categoryBreakdown: CategoryBreakdown[];
  debt?: number;
  savings: number;
}

export interface MoneyHealthResult {
  score: number;
  label: MoneyHealthLabel;
  insights: string[];
}

const ESSENTIAL_CATEGORIES = new Set([
  "rent",
  "housing",
  "utilities",
  "groceries",
  "food",
  "transport",
  "medical",
  "health",
  "insurance",
  "education",
  "loan",
  "emi",
  "debt",
  "fuel",
  "electricity",
  "water",
  "phone",
  "internet",
]);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const getCategoryRatios = (categoryBreakdown: CategoryBreakdown[], totalExpenses: number) => {
  const normalizedTotal = totalExpenses > 0 ? totalExpenses : 1;
  let essential = 0;
  let discretionary = 0;

  for (const category of categoryBreakdown) {
    const key = category.category.toLowerCase();
    if (ESSENTIAL_CATEGORIES.has(key)) {
      essential += category.amount;
    } else {
      discretionary += category.amount;
    }
  }

  const essentialRatio = clamp(essential / normalizedTotal, 0, 1);
  const discretionaryRatio = clamp(discretionary / normalizedTotal, 0, 1);

  return { essentialRatio, discretionaryRatio };
};

const getConsistencyScore = (categoryBreakdown: CategoryBreakdown[], totalExpenses: number) => {
  const normalizedTotal = totalExpenses > 0 ? totalExpenses : 1;
  const shares = categoryBreakdown
    .map((category) => category.amount / normalizedTotal)
    .filter((share) => share > 0);

  if (shares.length <= 1) {
    return 0.7;
  }

  const entropy = shares.reduce((acc, share) => acc - share * Math.log(share), 0);
  const maxEntropy = Math.log(shares.length);

  return clamp(entropy / maxEntropy, 0, 1);
};

export const calculateMoneyHealthScore = (input: MoneyHealthInput): MoneyHealthResult => {
  const monthlyIncome = Math.max(0, input.monthlyIncome);
  const totalExpenses = Math.max(0, input.totalExpenses);
  const debt = Math.max(0, input.debt ?? 0);

  const savingsRatio = monthlyIncome > 0 ? (monthlyIncome - totalExpenses) / monthlyIncome : 0;
  const clampedSavingsRatio = clamp(savingsRatio, -0.5, 0.8);

  const { essentialRatio, discretionaryRatio } = getCategoryRatios(
    input.categoryBreakdown,
    totalExpenses
  );
  const consistencyScore = getConsistencyScore(input.categoryBreakdown, totalExpenses);

  const savingsScore = clamp((clampedSavingsRatio + 0.2) / 1.0, 0, 1) * 40;
  const discretionaryScore = clamp(1 - discretionaryRatio, 0, 1) * 25;
  const essentialScore = clamp(1 - Math.max(0, essentialRatio - 0.65) * 2, 0, 1) * 20;
  const consistencyWeighted = consistencyScore * 15;

  let totalScore = savingsScore + discretionaryScore + essentialScore + consistencyWeighted;

  if (debt > 0 && monthlyIncome > 0) {
    const debtRatio = clamp(debt / monthlyIncome, 0, 2);
    const debtPenalty = clamp(debtRatio, 0, 1) * 15;
    totalScore -= debtPenalty;
  }

  totalScore = clamp(Math.round(totalScore), 0, 100);

  const label: MoneyHealthLabel = totalScore >= 70 ? "Healthy" : totalScore >= 45 ? "Average" : "Risky";

  const insights: string[] = [];
  insights.push(
    savingsRatio >= 0
      ? `You are saving about ${formatPercent(savingsRatio)} of your income each month.`
      : `You are spending more than you earn by about ${formatPercent(Math.abs(savingsRatio))}.`
  );

  if (discretionaryRatio > 0.35) {
    insights.push(
      `Discretionary spends are high (${formatPercent(discretionaryRatio)}). Consider trimming non-essential categories.`
    );
  } else {
    insights.push(`Discretionary spends are controlled (${formatPercent(discretionaryRatio)}).`);
  }

  insights.push(
    `Essential expenses account for ${formatPercent(essentialRatio)} of total spends.`
  );

  if (debt > 0) {
    insights.push(
      `Monthly debt payments are around ${formatCurrency(debt)}. Prioritizing debt reduction can lift your score.`
    );
  }

  if (consistencyScore < 0.45) {
    insights.push("Your spending is uneven across categories. A steadier allocation can improve stability.");
  } else {
    insights.push("Your category spend distribution looks consistent month to month.");
  }

  if (input.savings > 0 && monthlyIncome > 0) {
    const targetSavings = monthlyIncome - totalExpenses;
    const gap = targetSavings - input.savings;

    if (gap > 0) {
      insights.push(
        `You can potentially increase savings by ${formatCurrency(gap)} based on current cash flow.`
      );
    }
  }

  return {
    score: totalScore,
    label,
    insights,
  };
};
