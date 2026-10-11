import Link from "next/link";
import ShareIcon from "@/assets/icons/share.svg";
import MailIcon from "@/assets/icons/mail.svg";

const navLinks = [
  { label: "Contact Us", href: "/contact", active: true },
  { label: "Privacy Policy", href: "#", active: false },
  { label: "Accessibility Statement", href: "#", active: false },
];

export function Footer() {
  return (
    <footer
      className="border-t-2"
      style={{
        background: "#FBF9F8",
        borderTopColor: "#E5E5E5",
      }}
    >
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-6 px-6 py-8 text-center sm:gap-8 sm:py-10 md:flex-row md:items-center md:justify-between md:gap-6 md:px-10 md:py-10 md:text-left lg:px-16 lg:py-12">
        {/* Logo + description */}
        <div className="flex flex-col items-center gap-1 md:items-start">
          {/* <span className="text-2xl font-extrabold leading-snug tracking-[0.32px] text-[#1B1C1C] sm:text-[28px] lg:text-[32px] lg:leading-[44px]">
            ResearchBridge
          </span> */}

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
          <p className="text-sm font-normal leading-relaxed tracking-[0.36px] text-[#656464] sm:text-base lg:text-[18px] lg:leading-7">
            © 2024-2026 ResearchBridge. Designed for Clarity.
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 sm:gap-x-6 md:justify-start lg:gap-[24px]">
          {navLinks.map((link) =>
            link.active ? (
              <Link
                key={link.label}
                href={link.href}
                className="desc_18 text-sm text-muted-foreground transition-colors hover:text-primary sm:text-base"
              >
                {link.label}
              </Link>
            ) : (
              <span
                key={link.label}
                className="desc_18 cursor-default select-none text-sm text-muted-foreground/60 sm:text-base"
                title="Tez orada"
              >
                {link.label}
              </span>
            )
          )}
        </nav>

        {/* Social icons */}
        <div className="flex items-center gap-3">
          <span
            className="cursor-default text-muted-foreground/60"
            title="Tez orada"
            aria-label="Share"
          >
            <ShareIcon />
          </span>
          <Link
            href="mailto:info@researchbridge.uz"
            aria-label="Email"
            className="transition-opacity hover:opacity-80"
          >
            <MailIcon />
          </Link>
        </div>
      </div>
    </footer>
  );
}