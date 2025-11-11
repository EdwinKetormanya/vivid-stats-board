export const Footer = () => {
  return (
    <footer className="mt-12 border-t border-border bg-muted/30 py-6">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-muted-foreground">
          Developer: <span className="font-semibold text-foreground">KEEP PREMIUM SOLUTIONS</span>
          {" - "}
          <a href="tel:0543932420" className="hover:text-primary transition-colors">
            0543932420
          </a>
          {" / "}
          <a href="tel:0240665162" className="hover:text-primary transition-colors">
            0240665162
          </a>
        </p>
      </div>
    </footer>
  );
};
