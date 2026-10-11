import Link from "next/link";

export function AuthFooter() {
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
        <div>
          {/* <span className="text-sm font-bold text-primary">ResearchBridge</span>
          
          */}

          <Link
            href="/"
            className="flex origin-left items-center gap-2 whitespace-nowrap transition-transform duration-1500 ease-in-out hover:scale-110"
            style={{ textDecoration: "none" }}
          >
          <div
            style={{
              width: "6px",
              height: "28px",
              background: "linear-gradient(180deg, #BC000D 0%, #FF3B3B 100%)",
              borderRadius: "3px",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 800,
              fontSize: "22px",
              letterSpacing: "-0.5px",
            }}
          >
            <span style={{ color: "#000" }}>Research</span>
            <span style={{ color: "#BC000D" }}>Bridge</span>
          </span>
        </Link>
          <p className="mt-0.5 text-xs text-muted-foreground">
            © 2026 ResearchBridge. Barcha huquqlar himoyalangan.
          </p>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/contact"
            className="text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Aloqa
          </Link>
        </nav>
      </div>
    </footer>
  );
}