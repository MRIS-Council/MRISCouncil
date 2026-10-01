import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";
import Reveal from "@/components/Reveal";

export default async function Home() {
  const supabase = await supabaseServer();

  const { data: latestNews } = await supabase
    .from("news_papers")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: upcoming } = await supabase
    .from("fixtures")
    .select("*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name), activities(id, title)")
    .eq("status", "scheduled")
    .order("match_date")
    .limit(3);

  const { data: results } = await supabase
    .from("fixtures")
    .select("*, home_team:teams!home_team_id(name), away_team:teams!away_team_id(name), activities(id, title)")
    .eq("status", "completed")
    .order("match_date", { ascending: false })
    .limit(3);

  return (
    <div>
      <section className="relative min-h-[calc(100vh-68px)] flex items-center justify-center text-center px-4 overflow-hidden">
        <div aria-hidden className="blob pointer-events-none absolute -top-20 -left-20 w-[420px] h-[420px] rounded-full bg-blue-400/20 blur-3xl" />
        <div aria-hidden className="blob pointer-events-none absolute -bottom-24 -right-10 w-[380px] h-[380px] rounded-full bg-blue-600/15 blur-3xl" style={{ animationDelay: "3s" }} />

        <div className="max-w-3xl relative">
          <h1 className="hero-in text-6xl md:text-8xl font-black uppercase tracking-tight text-blue-900 dark:text-blue-100 leading-[0.95]">
            MRIS Council
          </h1>
          <p className="hero-in mt-7 text-blue-700 dark:text-blue-300 text-lg max-w-xl mx-auto" style={{ animationDelay: "150ms" }}>
            The elected voice of every student on campus. We advocate, we organise, and we build the kind of school community you actually want to be part of.
          </p>
          <div className="hero-in mt-8 flex gap-3 justify-center flex-wrap" style={{ animationDelay: "300ms" }}>
            <Link href="/team" className="bg-blue-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-800 transition-colors">
              Meet your council
            </Link>
            <Link href="/volunteer" className="border-2 border-blue-900 dark:border-blue-100 text-blue-900 dark:text-blue-100 px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-900 hover:text-white dark:hover:bg-blue-100 dark:hover:text-blue-900 transition-colors">
              View opportunities
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-20">
        <Reveal>
          <p className="text-center text-xs font-bold tracking-[.24em] uppercase text-blue-600 mb-3">Our Mandate</p>
          <h2 className="text-center text-3xl font-black uppercase text-blue-900 dark:text-blue-100 mb-12">What We Do</h2>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-7">
          {[
            ["Student Advocacy", "We take your concerns straight to the administration, no filter, no delay."],
            ["Events & Activities", "Spirit weeks, cultural nights, sports days, charity drives — student designed and run."],
            ["Community Building", "We connect students across grades, clubs, and interests."],
          ].map(([title, body], i) => (
            <Reveal key={title} delay={i * 120}>
              <div className="card card-hover p-9 text-center h-full">
                <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/10 grid place-items-center">
                  <div className="w-[30px] h-[30px] rounded-full bg-blue-600" />
                </div>
                <h3 className="font-black uppercase text-blue-900 dark:text-blue-100 mb-2.5">{title}</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {(upcoming?.length || results?.length) ? (
        <section className="max-w-5xl mx-auto px-4 pb-20">
          <Reveal>
            <p className="text-center text-xs font-bold tracking-[.24em] uppercase text-blue-600 mb-3">On The Pitch</p>
            <h2 className="text-center text-3xl font-black uppercase text-blue-900 dark:text-blue-100 mb-12">Fixtures & Results</h2>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8">
            <Reveal delay={0}>
              <h3 className="font-black uppercase text-sm text-blue-700 dark:text-blue-300 tracking-widest mb-4">Upcoming</h3>
              <div className="space-y-3">
                {upcoming?.map((f: any) => (
                  <Link key={f.id} href={`/activities/${f.activities?.id}`} className="card card-hover bar-left before:bg-warn p-5 block">
                    <p className="font-bold text-sm">{f.home_team?.name} vs {f.away_team?.name}</p>
                    <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">
                      {new Date(f.match_date).toLocaleString()}{f.location ? ` · ${f.location}` : ""}
                    </p>
                    <p className="text-[.65rem] font-bold uppercase tracking-widest text-blue-600 mt-2">{f.activities?.title}</p>
                  </Link>
                ))}
                {!upcoming?.length && <p className="text-sm text-blue-700/70 dark:text-blue-300/70">Nothing scheduled right now.</p>}
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h3 className="font-black uppercase text-sm text-blue-700 dark:text-blue-300 tracking-widest mb-4">Recent Results</h3>
              <div className="space-y-3">
                {results?.map((f: any) => (
                  <Link key={f.id} href={`/activities/${f.activities?.id}`} className="card card-hover bar-left before:bg-blue-600 p-5 block">
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-sm">{f.home_team?.name} vs {f.away_team?.name}</p>
                      <p className="font-black text-blue-600">{f.home_score} – {f.away_score}</p>
                    </div>
                    <p className="text-[.65rem] font-bold uppercase tracking-widest text-blue-600 mt-2">{f.activities?.title}</p>
                  </Link>
                ))}
                {!results?.length && <p className="text-sm text-blue-700/70 dark:text-blue-300/70">No results yet.</p>}
              </div>
            </Reveal>
          </div>

          <div className="text-center mt-10">
            <Link href="/activities" className="text-sm font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800">
              View all activities →
            </Link>
          </div>
        </section>
      ) : null}

      {latestNews && (
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <Reveal>
            <p className="text-center text-xs font-bold tracking-[.24em] uppercase text-blue-600 mb-3">Latest Issue</p>
            <Link
              href={`/news/${latestNews.id}`}
              className="card card-hover bar-left before:bg-blue-600 p-8 block text-center hover:before:bg-blue-400"
            >
              <h3 className="font-black text-xl">{latestNews.title}</h3>
              <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mt-2">Read the latest newsletter →</p>
            </Link>
          </Reveal>
        </section>
      )}
    </div>
  );
}