export default function Footer() {
  return (
    <footer className="mt-10 bg-[#020d1d] px-4 py-6 text-blue-100">
      <div className="mx-auto max-w-5xl border-t border-[#1e7bf2] pt-5">
        <div className="grid grid-cols-1 items-start gap-4 text-center md:grid-cols-3 md:text-left">
          <div className="text-sm text-blue-200/90 md:text-left">
            <p className="text-base font-black uppercase tracking-[0.12em] text-[#dfeeff]">IT Team</p>
            <div className="mt-2 space-y-1">
              <a href="https://github.com/dudydady8" target="_blank" rel="noreferrer" className="block transition hover:text-white">
                Abdulrehman Turkestani
              </a>
              <a href="https://github.com/Pilot-Mishari" target="_blank" rel="noreferrer" className="block transition hover:text-white">
                Shayan Saeed
              </a>
              <a href="https://github.com/rayandastas-dot" target="_blank" rel="noreferrer" className="block transition hover:text-white">
                Rayan Dasta
              </a>
            </div>
          </div>

          <div className="text-center text-sm text-blue-200/90">
            <div className="text-lg font-black uppercase tracking-[0.12em] text-[#dfeeff]">MRIS Council</div>
            <div className="mt-1">Student Council</div>
          </div>

          <div className="text-sm text-blue-200/90 md:text-right">
            <a href="https://www.instagram.com/mris_council/?hl=en" target="_blank" rel="noreferrer" className="block transition hover:text-white">
              Instagram
            </a>
            <a href="https://github.com/MRIS-Council" target="_blank" rel="noreferrer" className="mt-1 block transition hover:text-white">
              GitHub Repository
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}