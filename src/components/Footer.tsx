const Footer = () => {
  const footerLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <footer id="contact" className="py-12 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="text-center md:text-left">
            <span className="text-xl font-bold tracking-tight text-foreground">
              SPEND<span className="relative">I<span className="absolute -top-0.5 right-0 w-1.5 h-1.5 bg-primary rounded-full"></span></span>Q
            </span>
            <p className="text-sm text-muted-foreground mt-1">
              Every rupee, accounted for.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-sm text-muted-foreground">
            © SpendIQ 2025. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
