import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { FirePlannerResult } from "@/lib/firePlanner";

interface FireChartProps {
  firePlan: FirePlannerResult;
  currentAge: number;
}

const formatAxis = (value: number) => `Rs. ${(value / 100000).toFixed(1)}L`;

const buildProjection = (firePlan: FirePlannerResult, currentAge: number) => {
  const yearsToRetirement = Math.max(1, firePlan.targetRetirementAge - currentAge);
  const monthlyRate = ((1 + firePlan.assumedAnnualReturn) / (1 + firePlan.assumedInflation) - 1) / 12;

  const data = [] as Array<{ year: number; corpus: number; target: number }>;
  for (let year = 0; year <= yearsToRetirement; year += 1) {
    const months = year * 12;
    const corpus = months === 0
      ? 0
      : firePlan.monthlySipRequired * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

    data.push({
      year: currentAge + year,
      corpus: Math.round(corpus),
      target: firePlan.retirementCorpus,
    });
  }

  return data;
};

export default function FireChart({ firePlan, currentAge }: FireChartProps) {
  const data = buildProjection(firePlan, currentAge);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#374151" }}
        />
        <YAxis
          tick={{ fill: "#9ca3af", fontSize: 12 }}
          axisLine={{ stroke: "#374151" }}
          tickFormatter={formatAxis}
        />
        <Tooltip
          formatter={(value: number) => formatAxis(value)}
          labelFormatter={(label) => `Age ${label}`}
          contentStyle={{
            backgroundColor: "#0f172a",
            borderRadius: "12px",
            border: "1px solid #334155",
          }}
        />
        <Line type="monotone" dataKey="corpus" stroke="#22c55e" strokeWidth={3} dot={false} />
        <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="4 4" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
