import Link from "next/link";
import { supabaseServer } from "@/lib/supabase/server";

export default async function NewsPage() {
  const supabase = await supabaseServer();
  const { data: papers } = await supabase.from("news_papers").select("*").eq("status", "published").order("published_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <h2 className="text-4xl font-black uppercase text-blue-900 dark:text-blue-100">News</h2>
      <p className="mt-2 text-blue-700 dark:text-blue-300">Past issues of the MRIS newsletter.</p>

      <div className="mt-10 grid gap-4">
        {papers?.map((p) => (
          <Link key={p.id} href={`/news/${p.id}`} className="card bar-left before:bg-blue-600 p-6 block hover:before:bg-blue-400">
            <h4 className="font-black">{p.title}</h4>
            <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">Published {p.published_at?.slice(0, 10)}</p>
          </Link>
        ))}
        {!papers?.length && <p className="text-blue-700/70 dark:text-blue-300/70">No issues published yet.</p>}
      </div>
    </div>
  );
}