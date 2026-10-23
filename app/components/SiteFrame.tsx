"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const links = [
  ["Home", "/"],
  ["Drivers", "/drivers"],
  ["Teams", "/teams"],
  ["Calendar", "/calendar"],
  ["Standings", "/standings"],
  ["Circuits", "/circuits"],
  ["News", "/news"],
];

export default function SiteFrame({
  children,
  season,
  updatedAt,
}: {
  children: React.ReactNode;
  season: number;
  updatedAt?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    const savedTheme = window.localStorage.getItem("apex-theme");
    if (savedTheme === "light") setTheme("light");
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setQuery(new URLSearchParams(window.location.search).get("q") ?? "");
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      window.localStorage.setItem("apex-theme", theme);
    }
  }, [theme]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
  }

  function navigate(href: string) {
    if (href === pathname) {
      setMenuOpen(false);
      return;
    }
    setMenuOpen(false);
    setTransitioning(true);
    window.setTimeout(() => router.push(`${href}${href.includes("?") ? "&" : "?"}season=${season}`), 580);
  }

  const stamp = updatedAt
    ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(updatedAt))
    : null;

  return (
    <div className={`site ${theme === "light" ? "light" : ""}`}>
      <header className={`topbar ${scrolled ? "topbar-scrolled" : ""}`}>
        <Link href="/" className="brand" aria-label="Apex Racing Hub home">
          <span className="brand-mark"><span /></span>
          <span className="brand-copy">APEX<span>RACING HUB</span></span>
        </Link>
        <nav className={menuOpen ? "main-nav nav-open" : "main-nav"} aria-label="Main navigation">
          {links.map(([label, href]) => (
            <button
              key={href}
              type="button"
              onClick={() => navigate(href)}
              className={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "nav-link active" : "nav-link"}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <form className="search-box" onSubmit={submitSearch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
            <input aria-label="Search drivers, teams and races" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" />
            <kbd>↵</kbd>
          </form>
          <button className="icon-button theme-toggle" aria-label="Toggle light and dark theme" onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☼" : "☾"}
          </button>
          <button className="icon-button mobile-menu" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? "×" : "☰"}</button>
          <Link className="season-chip" href={`/standings?season=${season}`}><span className="live-dot" /> {season} SEASON</Link>
        </div>
      </header>
      {children}
      <footer className="footer">
        <div className="section-wrap">
          <div className="footer-top">
            <Link href="/" className="brand"><span className="brand-mark"><span /></span><span className="brand-copy">APEX<span>RACING HUB</span></span></Link>
            <p>For the love of the race.<br /><span>Independent. Unofficial. Unmatched.</span></p>
            <a className="back-top" href="#top">BACK TO TOP ↑</a>
          </div>
          <div className="footer-links">
            <div><span>EXPLORE</span>{links.slice(1, 5).map(([label, href]) => <Link href={href} key={href}>{label}</Link>)}</div>
            <div><span>RACE WEEKEND</span><Link href="/calendar">Race calendar</Link><Link href="/circuits">Circuit explorer</Link><Link href="/news">Latest briefings</Link><Link href={`/standings?season=${season}`}>{season} standings</Link></div>
            <div><span>THE DATA</span><a href="https://api.jolpi.ca/ergast/f1/" target="_blank" rel="noreferrer">Jolpica F1 API ↗</a><span className="footer-updated">{stamp ? `DATA REFRESHED ${stamp} UTC` : "LIVE SEASON DATA"}</span></div>
            <div className="footer-signoff"><span>BUILT FOR THE<br />MOMENT BEFORE<br /><em>LIGHTS OUT.</em></span></div>
          </div>
          <div className="footer-bottom"><span>© 2026 APEX RACING HUB · UNOFFICIAL F1 FAN EXPERIENCE</span><span>NOT AFFILIATED WITH FORMULA 1®</span><span>MADE FOR THE LOVE OF SPEED <b>✳</b></span></div>
        </div>
      </footer>
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="race-transition"
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => { if (transitioning) window.setTimeout(() => setTransitioning(false), 380); }}
            aria-label="Race start page transition"
          >
            <div className="race-start">
              <span>APEX RACING HUB <i>·</i> RACE START</span>
              <div className="race-lights">{[0, 1, 2, 3, 4].map((light) => <motion.span key={light} animate={{ backgroundColor: ["#242529", "#e10600", "#e10600", "#242529"] }} transition={{ duration: 0.95, delay: light * 0.06, repeat: 1, repeatDelay: 0.04 }} />)}</div>
              <strong>LIGHTS OUT</strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
