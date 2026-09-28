"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function NewsPanel() {
  const supabase = supabaseBrowser();
  const [papers, setPapers] = useState<any[]>([]);
  const [newPaper, setNewPaper] = useState({ title: "", due_date: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [msg, setMsg] = useState("");

  const refresh = async () => {
    const { data } = await supabase.from("news_papers").select("*").order("due_date", { ascending: false });
    setPapers(data ?? []);
  };
  useEffect(() => { refresh(); }, []);

  const addDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("news_papers").insert({ title: newPaper.title, due_date: newPaper.due_date, created_by: user?.id });
    setNewPaper({ title: "", due_date: "" });
    refresh();
  };

  const openEditor = (p: any) => { setEditingId(p.id); setContent(p.content ?? ""); };

  const saveContent = async () => {
    await supabase.from("news_papers").update({ content }).eq("id", editingId);
    setMsg("Saved.");
    refresh();
  };

  const finalize = async (id: string) => {
    await supabase.from("news_papers").update({ status: "published", published_at: new Date().toISOString() }).eq("id", id);
    refresh();
  };

  const remove = async (id: string) => { await supabase.from("news_papers").delete().eq("id", id); refresh(); };

  const uploadFile = async (file: File) => {
    setExtracting(true);
    setMsg("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/news/extract", { method: "POST", body: form });
    const json = await res.json();
    setExtracting(false);
    if (json.error) { setMsg(json.error); return; }
    setContent(content ? content + "\n\n" + json.text : json.text); // appends so it doesn't wipe existing edits
  };

  const drafts = papers.filter((p) => p.status === "draft");
  const archives = papers.filter((p) => p.status === "published");

  return (
    <div className="space-y-8">
      <form onSubmit={addDraft} className="card p-6 space-y-3">
        <h3 className="font-black uppercase text-sm">Start a new draft</h3>
        <input placeholder="Issue title" value={newPaper.title} onChange={(e) => setNewPaper({ ...newPaper, title: e.target.value })} className="w-full border rounded-xl px-3 py-2 bg-transparent" />
        <input type="date" value={newPaper.due_date} onChange={(e) => setNewPaper({ ...newPaper, due_date: e.target.value })} className="w-full border rounded-xl px-3 py-2 bg-transparent" />
        <button className="bg-blue-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm">Create draft</button>
      </form>

      <div className="card p-6">
        <h3 className="font-black uppercase text-sm mb-4">Drafts</h3>
        <div className="divide-y">
          {drafts.map((p) => (
            <div key={p.id} className="py-3">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <div>
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs font-bold text-bad">Due {p.due_date} · Not finalized</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditor(p)} className="text-xs font-bold border rounded-lg px-3 py-1.5">Continue draft</button>
                  <button onClick={() => finalize(p.id)} className="text-xs font-bold bg-ok text-white rounded-lg px-3 py-1.5">Finalize & publish</button>
                  <button onClick={() => remove(p.id)} className="text-xs font-bold text-bad">Delete</button>
                </div>
              </div>

              {editingId === p.id && (
                <div className="mt-3 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-blue-700 dark:text-blue-300">
                    Upload a Word or PDF to pull text from
                  </label>
                  <input type="file" accept=".docx,.pdf" onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
                    className="block text-xs" />
                  {extracting && <p className="text-xs text-blue-700/70">Reading file...</p>}
                  <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12}
                    className="w-full border rounded-xl px-3 py-2 text-sm bg-transparent" placeholder="Paper content..." />
                  <button onClick={saveContent} className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Save draft</button>
                  {msg && <p className="text-xs text-blue-700 dark:text-blue-300">{msg}</p>}
                </div>
              )}
            </div>
          ))}
          {!drafts.length && <p className="text-sm text-blue-700/70">No drafts right now.</p>}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-black uppercase text-sm mb-4">Archives</h3>
        <div className="divide-y">
          {archives.map((p) => (
            <div key={p.id} className="py-3 flex justify-between items-center">
              <p className="font-bold">{p.title}</p>
              <p className="text-xs font-bold text-ok">Published {p.published_at?.slice(0, 10)}</p>
            </div>
          ))}
          {!archives.length && <p className="text-sm text-blue-700/70">Nothing published yet.</p>}
        </div>
      </div>
    </div>
  );
}