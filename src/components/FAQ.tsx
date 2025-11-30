import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Is my UPI data secure?",
      answer: "Absolutely. Your data is encrypted end-to-end using industry-standard AES-256 encryption. We never store your bank credentials, and your statement data is processed securely on our servers. You can delete your data at any time.",
    },
    {
      question: "Which UPI apps do you support?",
      answer: "SpendIQ currently supports Paytm UPI statement exports. We're actively working on adding support for Google Pay, PhonePe, and other popular UPI apps. Stay tuned for updates!",
    },
    {
      question: "Do you store bank passwords?",
      answer: "Never. SpendIQ only processes your exported statement files (CSV/PDF). We don't have access to your bank login credentials, and we never ask for them. Your financial security is our top priority.",
    },
    {
      question: "Can I export my data?",
      answer: "Yes! Pro users can export their categorized transactions, insights, and reports in multiple formats including CSV, PDF, and Excel. Free users have limited export options available.",
    },
  ];

  return (
    <section id="faq" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-2xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-xl px-6 bg-card data-[state=open]:border-primary/30 transition-colors"
              >
                <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
