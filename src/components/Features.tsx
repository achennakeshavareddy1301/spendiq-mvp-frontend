import {
  Wallet,
  Brain,
  Lightbulb,
  MessageCircle,
  Gauge,
  Target,
  ShieldCheck,
  FileText,
  PieChart
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Wallet,
      title: "UPI-native intelligence",
      description: "Built specifically for Indian UPI patterns with smart merchant recognition.",
    },
    {
      icon: Brain,
      title: "AI-driven categorization",
      description: "Auto-tags spends and income with high accuracy so you skip manual sorting.",
    },
    {
      icon: Gauge,
      title: "Money Health Score",
      description: "Instantly know if your finances are Healthy, Average, or Risky.",
    },
    {
      icon: Target,
      title: "FIRE planning",
      description: "Retirement corpus and SIP recommendations based on your real cash flow.",
    },
    {
      icon: MessageCircle,
      title: "AI financial mentor",
      description: "Ask anything about savings, SIPs, taxes, or investments and get answers.",
    },
    {
      icon: Lightbulb,
      title: "Actionable insights",
      description: "Specific, rupee-level recommendations instead of generic charts.",
    },
    {
      icon: PieChart,
      title: "Deep category analytics",
      description: "Visualize spends by category, vendor, and month with smart trends.",
    },
    {
      icon: FileText,
      title: "Statement-ready reports",
      description: "Download clean PDF reports to share or keep for your records.",
    },
    {
      icon: ShieldCheck,
      title: "Secure by design",
      description: "Your data is protected with modern encryption and privacy-first defaults.",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Why people choose SpendIQ
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for modern financial management.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl bg-card border border-border card-hover overflow-hidden"
            >
              {/* Hover Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Icon */}
              <div className="relative w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="relative text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="relative text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
