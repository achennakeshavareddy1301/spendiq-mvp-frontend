import { ArrowRight, CheckCircle2, Sparkles, Target, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MentorPlaybook = () => {
  const beforeStats = [
    { label: "Savings rate", value: "4%", icon: TrendingDown, tone: "text-red-500" },
    { label: "Impulse spend", value: "₹12,400", icon: TrendingDown, tone: "text-amber-500" },
    { label: "Unused subs", value: "5 active", icon: TrendingDown, tone: "text-rose-500" },
  ];

  const afterStats = [
    { label: "Savings rate", value: "18%", icon: TrendingUp, tone: "text-emerald-500" },
    { label: "SIP started", value: "₹8,000", icon: Target, tone: "text-blue-500" },
    { label: "Subscriptions", value: "2 active", icon: TrendingUp, tone: "text-emerald-500" },
  ];

  const playbookSteps = [
    {
      title: "Week 1: Stop the leak",
      detail: "Cut food delivery by ₹2,000 and cancel 2 unused subscriptions.",
    },
    {
      title: "Week 2: Lock essentials",
      detail: "Cap essentials at 55% and shift ₹3,500 into a SIP.",
    },
    {
      title: "Week 3: Grow safety",
      detail: "Build a 1-month emergency buffer with ₹6,000 auto-save.",
    },
    {
      title: "Week 4: Invest with clarity",
      detail: "Rebalance: 70% index, 20% debt, 10% gold for stability.",
    },
  ];

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />
      <div className="absolute -top-20 right-10 h-48 w-48 rounded-full bg-primary/20 blur-[80px]" />
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-4 w-4" />
              Mentor Playbook
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              A real-world before/after plan you can follow.
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              SpendIQ is not just analytics. It gives you a step-by-step playbook that
              turns statements into a clear 30-day action plan.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                <p className="text-xs uppercase text-muted-foreground">Before SpendIQ</p>
                <div className="mt-4 space-y-4">
                  {beforeStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <stat.icon className={`h-4 w-4 ${stat.tone}`} />
                        {stat.label}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-5">
                <p className="text-xs uppercase text-emerald-700">After 30 days</p>
                <div className="mt-4 space-y-4">
                  {afterStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <stat.icon className={`h-4 w-4 ${stat.tone}`} />
                        {stat.label}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth">
                <Button variant="hero" size="lg" className="group">
                  Start your playbook
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  View mentor dashboard
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Mentor Playbook</p>
                <h3 className="text-xl font-semibold text-foreground">Your 30-day sprint</h3>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Actionable
              </div>
            </div>

            <div className="space-y-4">
              {playbookSteps.map((step) => (
                <div key={step.title} className="rounded-2xl border border-border/60 bg-background/60 p-4">
                  <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MentorPlaybook;
