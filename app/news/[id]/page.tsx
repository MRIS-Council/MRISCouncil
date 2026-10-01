import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export default async function NewsDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await supabaseServer();
  const { data: paper } = await supabase.from("news_papers").select("*").eq("id", id).eq("status", "published").single();
  if (!paper) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 py-14">
      <h2 className="text-3xl font-black uppercase text-blue-900 dark:text-blue-100">{paper.title}</h2>
      <p className="text-xs text-blue-700/70 dark:text-blue-300/70 mt-1">Published {paper.published_at?.slice(0, 10)}</p>
      <div className="mt-8 text-blue-900 dark:text-blue-100 whitespace-pre-wrap leading-relaxed">{paper.content}</div>
    </div>
  );
}