import Link from "next/link";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/volunteer", label: "Volunteer" },
  { href: "/activities", label: "Activities" },
  { href: "/clubs", label: "Clubs" },
  { href: "/news", label: "News" },
  { href: "/media", label: "Media" },
  { href: "/team", label: "Team" },
];

const SOCIALS = [
  {
    href: "https://www.instagram.com/mris_council/?hl=en",
    label: "Instagram",
    path: "M12 2.2c2.7 0 3 .01 4.1.06 1.1.05 1.8.22 2.2.37.55.2.95.45 1.37.87.42.42.67.82.87 1.37.15.4.32 1.1.37 2.2.05 1.1.06 1.4.06 4.1s-.01 3-.06 4.1c-.05 1.1-.22 1.8-.37 2.2-.2.55-.45.95-.87 1.37-.42.42-.82.67-1.37.87-.4.15-1.1.32-2.2.37-1.1.05-1.4.06-4.1.06s-3-.01-4.1-.06c-1.1-.05-1.8-.22-2.2-.37a3.7 3.7 0 0 1-1.37-.87 3.7 3.7 0 0 1-.87-1.37c-.15-.4-.32-1.1-.37-2.2C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.1c.05-1.1.22-1.8.37-2.2.2-.55.45-.95.87-1.37.42-.42.82-.67 1.37-.87.4-.15 1.1-.32 2.2-.37C9 2.21 9.3 2.2 12 2.2Zm0 1.8c-2.66 0-2.97.01-4.02.06-.97.04-1.5.2-1.85.34-.46.18-.79.39-1.14.74-.35.35-.56.68-.74 1.14-.14.35-.3.88-.34 1.85C3.86 9.03 3.85 9.34 3.85 12s.01 2.97.06 4.02c.04.97.2 1.5.34 1.85.18.46.39.79.74 1.14.35.35.68.56 1.14.74.35.14.88.3 1.85.34 1.05.05 1.36.06 4.02.06s2.97-.01 4.02-.06c.97-.04 1.5-.2 1.85-.34.46-.18.79-.39 1.14-.74.35-.35.56-.68.74-1.14.14-.35.3-.88.34-1.85.05-1.05.06-1.36.06-4.02s-.01-2.97-.06-4.02c-.04-.97-.2-1.5-.34-1.85a3.1 3.1 0 0 0-.74-1.14 3.1 3.1 0 0 0-1.14-.74c-.35-.14-.88-.3-1.85-.34C14.97 4.01 14.66 4 12 4Zm0 3.78a4.22 4.22 0 1 1 0 8.44 4.22 4.22 0 0 1 0-8.44Zm0 1.8a2.42 2.42 0 1 0 0 4.84 2.42 2.42 0 0 0 0-4.84Zm4.4-1.99a.99.99 0 1 1 0 1.98.99.99 0 0 1 0-1.98Z",
  },
  {
    href: "https://github.com/MRIS-Council",
    label: "GitHub",
    path: "M12 2.2c-5.52 0-10 4.57-10 10.2 0 4.51 2.87 8.33 6.86 9.68.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.79.62-3.38-1.21-3.38-1.21-.46-1.19-1.12-1.5-1.12-1.5-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.9 1.57 2.36 1.12 2.93.85.09-.66.35-1.12.64-1.38-2.23-.26-4.57-1.14-4.57-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.72 1.03 1.63 1.03 2.75 0 3.93-2.35 4.8-4.58 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49C19.14 20.72 22 16.9 22 12.4c0-5.63-4.48-10.2-10-10.2Z",
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#020d1d] text-center">
      <div className="mx-auto max-w-5xl rounded-3xl bg-[#020d1d] px-6 py-10 text-center shadow-xl shadow-blue-950/20 sm:px-10">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#1e7bf2] text-sm font-black text-white">M</span>
          <span className="text-lg font-black uppercase tracking-[0.08em] text-[#dfeeff]">MRIS Council</span>
        </Link>

        <nav className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {NAV.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-blue-200/80 transition hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 flex items-center justify-center gap-4">
          {SOCIALS.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              aria-label={s.label}
              className="grid h-9 w-9 place-items-center rounded-full border border-blue-100/10 text-blue-200/80 transition hover:border-[#1e7bf2] hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d={s.path} />
              </svg>
            </a>
          ))}
        </div>

        <div className="mt-8 border-t border-blue-100/10 pt-5 text-xs text-blue-300/60">
          <p>
            Built by{" "}
            <a href="https://github.com/dudydady8" target="_blank" rel="noreferrer" className="font-semibold text-blue-200/80 hover:text-white">
              Abdulrehman Turkestani
            </a>
            ,{" "}
            <a href="https://github.com/Pilot-Mishari" target="_blank" rel="noreferrer" className="font-semibold text-blue-200/80 hover:text-white">
              Shayan Saeed
            </a>{" "}
            &{" "}
            <a href="https://github.com/rayandastas-dot" target="_blank" rel="noreferrer" className="font-semibold text-blue-200/80 hover:text-white">
              Rayan Dasta
            </a>
          </p>
          <p className="mt-1">© {new Date().getFullYear()} MRIS Council</p>
        </div>
      </div>
    </footer>
  );
}