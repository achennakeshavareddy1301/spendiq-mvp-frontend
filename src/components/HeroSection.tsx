import { Button } from "@/components/ui/button";
import { Upload, Play, TrendingUp, Utensils, Home, ShoppingBag, Tv } from "lucide-react";

const HeroSection = () => {
  const spendCategories = [
    { icon: Utensils, label: "Food", amount: "₹4,200", color: "bg-orange-500" },
    { icon: Home, label: "Rent", amount: "₹12,000", color: "bg-blue-500" },
    { icon: ShoppingBag, label: "Shopping", amount: "₹3,800", color: "bg-pink-500" },
    { icon: Tv, label: "Subscriptions", amount: "₹899", color: "bg-purple-500" },
  ];

  return (
    <section className="relative min-h-screen pt-24 md:pt-32 pb-16 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                AI Powered UPI Intelligence
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Turn UPI chaos into{" "}
              <span className="text-gradient">financial clarity.</span>
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
              AI-powered UPI statement analysis for smarter spending.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group">
                <Upload className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
                Upload UPI Statement
              </Button>
              <Button variant="hero-outline" size="lg" className="group">
                <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                View Demo
              </Button>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-muted-foreground">
              No spreadsheets. No manual tracking. Just upload your Paytm UPI statement.
            </p>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative bg-card rounded-2xl border border-border p-6 shadow-2xl">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Monthly Spend Overview</h3>
                <span className="text-xs text-muted-foreground">March 2025</span>
              </div>

              {/* Fake Chart */}
              <div className="h-32 mb-6 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((height, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-gradient-to-t from-primary/80 to-primary rounded-t transition-all duration-300 hover:from-primary hover:to-accent"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              {/* Spend Categories */}
              <div className="space-y-3">
                {spendCategories.map((category, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                        <category.icon className="w-4 h-4 text-foreground" />
                      </div>
                      <span className="text-sm text-foreground">{category.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{category.amount}</span>
                  </div>
                ))}
              </div>

              {/* AI Insight */}
              <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-foreground">
                    <span className="text-primary font-semibold">AI Insight:</span> Your UPI spending increased 27% this month
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-float" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-accent/20 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
