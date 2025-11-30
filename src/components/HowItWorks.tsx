import { Upload, Sparkles, Tags, BarChart3, MessageSquare, TrendingUp } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Upload,
      title: "Upload your Paytm UPI statement",
      description: "Simply drag and drop your CSV or PDF statement file.",
    },
    {
      icon: Sparkles,
      title: "We clean and organize every transaction",
      description: "Our system processes and structures your raw data automatically.",
    },
    {
      icon: Tags,
      title: "AI auto-categorizes your spending",
      description: "Smart algorithms tag each transaction to the right category.",
    },
    {
      icon: BarChart3,
      title: "Get a clear interactive dashboard",
      description: "Visualize your spending patterns with intuitive charts.",
    },
    {
      icon: MessageSquare,
      title: "Ask questions using the SpendIQ AI chat",
      description: "Chat with your financial data to get instant answers.",
    },
    {
      icon: TrendingUp,
      title: "Get smart spending insights and trends",
      description: "Receive actionable recommendations to optimize your finances.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            How SpendIQ Works
          </h2>
          <p className="text-lg text-muted-foreground">
            From raw UPI statements to financial insights in minutes.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-2xl bg-card border border-border card-hover"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-lg">
                {index + 1}
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
