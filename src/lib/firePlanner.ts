export interface FirePlannerInput {
  age: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  targetRetirementAge: number;
}

export interface FirePlannerResult {
  retirementCorpus: number;
  monthlySipRequired: number;
  yearsToFinancialIndependence: number;
  targetRetirementAge: number;
  assumedAnnualReturn: number;
  assumedInflation: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getFutureValue = (payment: number, rate: number, periods: number) => {
  if (rate === 0) {
    return payment * periods;
  }
  return payment * ((Math.pow(1 + rate, periods) - 1) / rate);
};

const getPaymentForFutureValue = (futureValue: number, rate: number, periods: number) => {
  if (rate === 0) {
    return futureValue / periods;
  }
  return (futureValue * rate) / (Math.pow(1 + rate, periods) - 1);
};

export const calculateFirePlan = (input: FirePlannerInput): FirePlannerResult => {
  const age = clamp(Math.floor(input.age), 18, 100);
  const targetRetirementAge = clamp(Math.floor(input.targetRetirementAge), age + 1, 75);
  const yearsToRetirement = Math.max(1, targetRetirementAge - age);

  const monthlyIncome = Math.max(0, input.monthlyIncome);
  const monthlyExpenses = Math.max(0, input.monthlyExpenses);

  const annualReturn = 0.1;
  const inflation = 0.06;
  const realReturn = (1 + annualReturn) / (1 + inflation) - 1;

  const annualExpensesToday = monthlyExpenses * 12;
  const inflatedAnnualExpenses = annualExpensesToday * Math.pow(1 + inflation, yearsToRetirement);

  const retirementCorpus = inflatedAnnualExpenses * 25;

  const monthlyRate = realReturn / 12;
  const months = yearsToRetirement * 12;

  const monthlySipRequired = Math.max(
    0,
    getPaymentForFutureValue(retirementCorpus, monthlyRate, months)
  );

  const surplus = monthlyIncome - monthlyExpenses;
  const effectiveSip = Math.max(0, surplus);

  let yearsToFinancialIndependence = yearsToRetirement;

  if (effectiveSip > 0) {
    const requiredMonths = Math.log(1 + (retirementCorpus * monthlyRate) / effectiveSip) / Math.log(1 + monthlyRate);
    yearsToFinancialIndependence = Math.max(1, Math.ceil(requiredMonths / 12));
  }

  return {
    retirementCorpus: Math.round(retirementCorpus),
    monthlySipRequired: Math.round(monthlySipRequired),
    yearsToFinancialIndependence,
    targetRetirementAge,
    assumedAnnualReturn: annualReturn,
    assumedInflation: inflation,
  };
};
