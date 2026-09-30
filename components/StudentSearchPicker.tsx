"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Student = { id: string; school_id: string; full_name: string; class_name: string | null };

export default function StudentSearchPicker({ onSelect }: { onSelect: (s: Student) => void }) {
  const supabase = supabaseBrowser();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [searched, setSearched] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ school_id: "", full_name: "", class_name: "" });

  const search = async (value: string) => {
    setQ(value);
    setShowAdd(false);
    if (value.trim().length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const term = value.trim();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .or(`full_name.ilike.%${term}%,school_id.ilike.%${term}%`)
      .limit(10);

    if (error) {
      console.error("Student search failed:", error);
      setResults([]);
      setSearched(true);
      return;
    }

    setResults((data ?? []) as Student[]);
    setSearched(true);
  };

  const pick = (s: Student) => {
    setQ(s.full_name);
    setResults([]);
    setSearched(false);
    onSelect(s);
  };

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from("students").insert({
      school_id: form.school_id.trim(), full_name: form.full_name.trim(),
      class_name: form.class_name.trim() || null,
    }).select().single();
    if (error) { alert(error.message); return; }
    pick(data as Student);
    setShowAdd(false);
  };

  return (
    <div className="relative">
      <input placeholder="Search student by name" value={q} onChange={(e) => search(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 bg-transparent text-blue-900 dark:text-blue-100 placeholder:text-blue-900/40 dark:placeholder:text-blue-100/40" />
      {searched && (
        <div className="mt-2 border rounded-xl divide-y">
          {results.map((s) => (
            <button key={s.id} type="button" onClick={() => pick(s)} className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30">
              <p className="font-bold text-sm">{s.full_name}</p>
              <p className="text-xs text-blue-700/70">{s.school_id}{s.class_name ? ` · ${s.class_name}` : ""}</p>
            </button>
          ))}
          {results.length === 0 && !showAdd && (
            <button type="button" onClick={() => { setShowAdd(true); setForm((f) => ({ ...f, full_name: q })); }}
              className="w-full text-left px-3 py-2 text-blue-600 font-bold text-sm">
              + No match — add "{q}"
            </button>
          )}
        </div>
      )}
      {showAdd && (
        <form onSubmit={addStudent} className="mt-2 card p-4 space-y-2">
          <input placeholder="School ID" required value={form.school_id} onChange={(e) => setForm({ ...form, school_id: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-transparent" />
          <input placeholder="Full name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-transparent" />
          <input placeholder="Class (optional)" value={form.class_name} onChange={(e) => setForm({ ...form, class_name: e.target.value })} className="w-full border rounded-lg px-3 py-2 bg-transparent" />
          <button className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-bold">Add student</button>
        </form>
      )}
    </div>
  );
}