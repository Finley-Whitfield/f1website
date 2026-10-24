"use client";

import { AnimatePresence, motion, useAnimationControls, useScroll } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

const links = [
  ["Home", "/"],
  ["Drivers", "/drivers"],
  ["Teams", "/teams"],
  ["Calendar", "/calendar"],
  ["Standings", "/standings"],
  ["Circuits", "/circuits"],
  ["News", "/news"],
];

function RaceStartLights({ cycle }: { cycle: number }) {
  const controls = useAnimationControls();

  useEffect(() => {
    let cancelled = false;
    async function runSequence() {
      await controls.start("lit");
      await new Promise((resolve) => window.setTimeout(resolve, 220));
      if (!cancelled) await controls.start("out");
    }
    void runSequence();
    return () => { cancelled = true; };
  }, [controls, cycle]);

  return (
    <div className="race-lights">
      {[0, 1, 2, 3, 4].map((light) => (
        <motion.span
          key={`${cycle}-${light}`}
          custom={light}
          variants={{
            lit: (index: number) => ({ backgroundColor: "#e10600", transition: { duration: 0.13, delay: index * 0.11 } }),
            out: (index: number) => ({ backgroundColor: "#242529", transition: { duration: 0.15, delay: (4 - index) * 0.1 } }),
          }}
          initial={{ backgroundColor: "#242529" }}
          animate={controls}
        />
      ))}
    </div>
  );
}

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [transitioning, setTransitioning] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);
  const { scrollYProgress } = useScroll();

  const navigate = useCallback((href: string) => {
    if (transitioning) return;
    if (href === pathname) {
      setMenuOpen(false);
      return;
    }
    setMenuOpen(false);
    setTransitionKey((value) => value + 1);
    setTransitioning(true);
    const destination = new URL(href, window.location.href);
    if (!destination.searchParams.has("season")) destination.searchParams.set("season", String(season));
    window.setTimeout(() => router.push(`${destination.pathname}${destination.search}${destination.hash}`), 1450);
  }, [pathname, router, season, transitioning]);

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
    setTransitioning(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleInternalNavigation(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.hash) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;

      event.preventDefault();
      navigate(`${destination.pathname}${destination.search}${destination.hash}`);
    }

    document.addEventListener("click", handleInternalNavigation, true);
    return () => document.removeEventListener("click", handleInternalNavigation, true);
  }, [navigate]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = theme;
      window.localStorage.setItem("apex-theme", theme);
    }
  }, [theme]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = query.trim();
    if (value) navigate(`/search?q=${encodeURIComponent(value)}`);
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
              aria-current={pathname === href || (href !== "/" && pathname.startsWith(`${href}/`)) ? "page" : undefined}
            >
              {label}
              {(pathname === href || (href !== "/" && pathname.startsWith(`${href}/`))) && (
                <motion.span className="nav-active-indicator" layoutId="apex-nav-indicator" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
              )}
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
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          className="page-route"
          key={`${pathname}?${searchParams.toString()}`}
          initial={{ opacity: 0, y: 18, filter: "blur(12px)", scale: 0.992 }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, y: -10, filter: "blur(8px)", scale: 0.996 }}
          transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
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
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.48, ease: [0.76, 0, 0.24, 1] }}
            aria-label="Race start page transition"
          >
            <div className="race-start">
              <span>APEX RACING HUB <i>·</i> RACE START</span>
              <RaceStartLights cycle={transitionKey} />
              <motion.strong initial={{ opacity: 0, y: 8, letterSpacing: "0.8em" }} animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, -6], letterSpacing: ["0.8em", "0.28em", "0.28em", "0.5em"] }} transition={{ duration: 1.4, times: [0, 0.18, 0.72, 1], ease: "easeOut" }}>LIGHTS OUT</motion.strong>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
