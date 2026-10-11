import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="border-b border-border/80 bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        {/* <Link href="/" className="text-2xl font-extrabold tracking-tight text-primary">
          ResearchBridge
        </Link> */}

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

        <nav className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/courses"
            className="text-sm sm:text-base font-medium text-foreground underline-offset-8 hover:underline hover:decoration-primary hover:decoration-2"
          >
            Kurslar
          </Link>
          <Link
            href="/contact"
            className="text-sm sm:text-base font-medium text-foreground underline-offset-8 hover:underline hover:decoration-primary hover:decoration-2"
          >
            Aloqa
          </Link>
        </nav>
      </div>
    </header>
  );
}