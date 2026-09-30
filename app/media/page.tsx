import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

type PhotoOfWeek = {
  id: string;
  image_url: string;
  caption: string;
  week_date: string;
};

export default async function MediaPage() {
  const supabase = supabaseBrowser();

  const { data: photos } = await supabase
    .from("photos_of_week")
    .select("*")
    .eq("published", true)
    .order("week_date", { ascending: false })
    .limit(1);

  const currentPhoto = (photos?.[0] ?? null) as PhotoOfWeek | null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-14">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="text-xs font-bold tracking-[.24em] uppercase text-blue-600">Campus stories</p>
          <h1 className="mt-2 text-4xl font-black uppercase text-blue-900 dark:text-blue-100">Media</h1>
          <p className="mt-3 text-blue-700 dark:text-blue-300">
            Photos, videos, and memories from MRIS events and activities throughout the year.
          </p>
        </div>

        <Link href="/restricted" className="text-sm font-bold text-blue-700">
          Staff login →
        </Link>
      </div>

      <div className="mt-12 grid gap-10">
        {currentPhoto ? (
          <article className="card overflow-hidden">
            <div className="relative w-full h-96 bg-blue-100 dark:bg-blue-900/30">
              <img
                src={currentPhoto.image_url}
                alt={currentPhoto.caption}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <p className="text-xs font-bold tracking-[.24em] uppercase text-blue-600 mb-2">
                Photo of the week
              </p>
              <h2 className="text-2xl font-black text-blue-900 dark:text-blue-100 mb-3">
                {currentPhoto.caption}
              </h2>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Week of {new Date(currentPhoto.week_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </article>
        ) : (
          <div className="card p-10 text-center">
            <h2 className="font-black uppercase text-blue-900 dark:text-blue-100">
              Photo of the week coming soon
            </h2>
            <p className="mt-2 text-sm text-blue-700 dark:text-blue-300">
              Check back next week for the latest campus photo.
            </p>
          </div>
        )}
      </div>

      <div className="mt-12 card p-8 text-center bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10">
        <p className="text-xs font-bold tracking-[.24em] uppercase text-blue-600 mb-3">
          Full archive
        </p>
        <h3 className="text-xl font-black text-blue-900 dark:text-blue-100 mb-4">
          View all school media
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-6 max-w-2xl mx-auto">
          Browse photos and videos from the entire school year, organized by month and event.
        </p>
        <a
          href="https://drive.google.com/YOUR_FOLDER_ID_HERE"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-900 text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-800"
        >
          Open Google Drive →
        </a>
      </div>
    </div>
  );
}
