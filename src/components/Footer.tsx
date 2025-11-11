export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm py-4 z-40 no-print">
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
