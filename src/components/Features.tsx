import { Wallet, Brain, Lightbulb, MessageCircle } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Wallet,
      title: "UPI-native intelligence",
      description: "Built specifically for Indian UPI transaction patterns. We understand the nuances of your digital payments.",
    },
    {
      icon: Brain,
      title: "AI-driven categorization",
      description: "Automatically tags expenses and income with high accuracy. No manual sorting required.",
    },
    {
      icon: Lightbulb,
      title: "Actionable insights, not just charts",
      description: "Not just data visualization. Real money decisions backed by intelligent analysis.",
    },
    {
      icon: MessageCircle,
      title: "Chat with your money",
      description: "Ask questions and get answers from your transactions. Your personal finance assistant.",
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
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
