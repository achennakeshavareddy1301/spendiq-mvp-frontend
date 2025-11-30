import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "/ month",
      description: "Get started with basic features",
      features: [
        "Upload single statements",
        "Basic analytics",
        "Limited AI queries",
        "7-day data retention",
      ],
      cta: "Get Started Free",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹199",
      period: "/ month",
      description: "Coming Soon",
      features: [
        "Unlimited statements",
        "Advanced AI insights",
        "Smart spending alerts",
        "Priority support",
        "Data export",
        "Unlimited history",
      ],
      cta: "Join Waitlist",
      popular: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 md:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/20 to-background pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple pricing. No BS.
          </h2>
          <p className="text-lg text-muted-foreground">
            Start free, upgrade when you need more.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border transition-all duration-300 ${
                plan.popular
                  ? "bg-card border-primary/50 shadow-lg shadow-primary/10"
                  : "bg-card border-border hover:border-border/80"
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold uppercase tracking-wide">
                    Coming Soon
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6">
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                variant={plan.popular ? "hero" : "hero-outline"}
                className="w-full"
              >
                {plan.cta}
              </Button>

              {/* Glow Effect for Popular */}
              {plan.popular && (
                <div className="absolute inset-0 -z-10 bg-primary/5 rounded-2xl blur-xl" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
