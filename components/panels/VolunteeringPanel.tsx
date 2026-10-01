"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth";
import StudentSearchPicker from "@/components/StudentSearchPicker";

export default function VolunteeringPanel() {
  const supabase = supabaseBrowser();
  const { department } = useAuth();
  const [allDepartments, setAllDepartments] = useState<{ slug: string; name: string }[]>([]);
  const [opps, setOpps] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", description: "", event_date: "", location: "", slots: "", hours_awarded: "", department_slug: department ?? "" });
  const [log, setLog] = useState<{ student: any; hours: string; event: string }>({ student: null, hours: "", event: "" });
  const [msg, setMsg] = useState("");

  const [openApplicants, setOpenApplicants] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<Record<string, any[]>>({});
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  const [lookupResults, setLookupResults] = useState<any[]>([]);
  const [lookupSelected, setLookupSelected] = useState<any | null>(null);
  const [lookupHistory, setLookupHistory] = useState<any[]>([]);

  const [copyOppId, setCopyOppId] = useState("");
  const [copied, setCopied] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);

  const normalizedDepartment = department === "volunteer" ? "volunteering" : department;

  const refresh = async () => {
    setAccessError(null);

    let query = supabase.from("opportunities").select("*").order("event_date", { ascending: false });
    if (normalizedDepartment && normalizedDepartment !== "council") {
      query = query.in("department_slug", [normalizedDepartment, "volunteer"]);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to load volunteering opportunities:", error);
      setAccessError("Volunteer data is blocked by Supabase permissions. Grant access to opportunities and related volunteer tables.");
      setOpps([]);
      return;
    }

    setOpps(data ?? []);
    if (department === "council") {
      const { data: d } = await supabase.from("departments").select("*");
      setAllDepartments(d ?? []);
    }
  };
  useEffect(() => { refresh(); }, [department]);

  const addOpportunity = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = department === "council" ? form.department_slug : (department === "volunteer" ? "volunteer" : department);
    const { error } = await supabase.from("opportunities").insert({
      title: form.title, description: form.description, event_date: form.event_date,
      location: form.location, slots: form.slots ? Number(form.slots) : null,
      hours_awarded: form.hours_awarded !== "" ? Number(form.hours_awarded) : 0,
      department_slug: target,
    });
    setMsg(error ? error.message : "Opportunity added.");
    if (!error) { setForm({ title: "", description: "", event_date: "", location: "", slots: "", hours_awarded: "", department_slug: department ?? "" }); refresh(); }
  };

  const toggleOpen = async (o: any) => {
    await supabase.from("opportunities").update({ applications_open: !o.applications_open }).eq("id", o.id);
    refresh();
  };

  const remove = async (id: string) => { await supabase.from("opportunities").delete().eq("id", id); refresh(); };

  const logHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!log.student) { setMsg("Pick a student from search results first."); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("volunteer_hours").insert({
      student_id: log.student.id, hours: Number(log.hours), event: log.event,
      department_slug: department, logged_by: user?.id,
    });
    setMsg(error ? error.message : "Hours logged.");
    if (!error) setLog({ student: null, hours: "", event: "" });
  };

  const fetchApplicants = async (oppId: string) => {
    const { data: apps, error: appsError } = await supabase
      .from("applications")
      .select("id, created_at, selected, student_id, opportunity_id")
      .eq("opportunity_id", oppId);

    if (appsError) {
      console.error("Failed to load applicants:", appsError);
      return [];
    }

    const studentIds = (apps ?? []).map((a: any) => a.student_id).filter(Boolean);
    const studentMap: Record<string, any> = {};

    if (studentIds.length) {
      const { data: students, error: studentError } = await supabase.from("students").select("*").in("id", studentIds);
      if (!studentError) {
        (students ?? []).forEach((s: any) => {
          studentMap[s.id] = s;
        });
      }
    }

    const { data: hours, error: hoursError } = studentIds.length
      ? await supabase.from("volunteer_hours").select("student_id, hours, event").in("student_id", studentIds)
      : { data: [], error: null };

    if (hoursError) {
      console.error("Failed to load volunteer hours:", hoursError);
    }

    const totals: Record<string, number> = {};
    const thisEvent: Record<string, number> = {};
    const oppTitle = opps.find((o) => o.id === oppId)?.title;
    (hours ?? []).forEach((h: any) => {
      totals[h.student_id] = (totals[h.student_id] ?? 0) + Number(h.hours);
      if (h.event === oppTitle) thisEvent[h.student_id] = (thisEvent[h.student_id] ?? 0) + Number(h.hours);
    });

    return (apps ?? []).map((a: any) => {
      const student = studentMap[a.student_id];
      return {
        appId: a.id,
        id: a.student_id,
        name: student?.full_name ?? "Unknown",
        school_id: student?.school_id ?? "—",
        class_name: student?.class_name ?? "—",
        applied_at: a.created_at,
        selected: a.selected,
        total_hours: totals[a.student_id] ?? 0,
        event_hours: thisEvent[a.student_id] ?? 0,
      };
    });
  };

  const viewApplicants = async (oppId: string) => {
    if (openApplicants === oppId) { setOpenApplicants(null); return; }
    setOpenApplicants(oppId);
    if (applicants[oppId]) return;
    setLoadingApplicants(true);
    const rows = await fetchApplicants(oppId);
    setApplicants({ ...applicants, [oppId]: rows });
    setLoadingApplicants(false);
  };

  const toggleSelected = async (oppId: string, appId: string, current: boolean) => {
    const opp = opps.find((o) => o.id === oppId);
    const nextSelected = !current;

    await supabase.from("applications").update({ selected: nextSelected }).eq("id", appId);

    if (nextSelected) {
      const app = applicants[oppId]?.find((a) => a.appId === appId);
      if (app && opp) {
        const { data: userData } = await supabase.auth.getUser();
        const hoursAwarded = Number(opp.hours_awarded ?? 0);

        const { data: existing } = await supabase
          .from("volunteer_hours")
          .select("id")
          .eq("student_id", app.id)
          .eq("opportunity_id", oppId)
          .limit(1);

        if (!existing || existing.length === 0) {
          const { error: hoursError } = await supabase.from("volunteer_hours").insert({
            student_id: app.id,
            opportunity_id: oppId,
            department_slug: opp.department_slug,
            event: opp.title,
            hours: hoursAwarded,
            served_on: opp.event_date,
            logged_by: userData?.user?.id ?? null,
          });

          if (hoursError) {
            console.error("Failed to award hours:", hoursError);
          } else {
            setMsg(`${app.name} was awarded ${hoursAwarded} volunteer hour${hoursAwarded === 1 ? "" : "s"}.`);
          }
        }
      }
    }

    setApplicants({
      ...applicants,
      [oppId]: applicants[oppId].map((a) => a.appId === appId ? { ...a, selected: nextSelected } : a),
    });
  };

  const lookupSearch = async (q: string) => {
    setLookupSelected(null);
    if (q.trim().length < 2) { setLookupResults([]); return; }

    const term = q.trim();
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .or(`full_name.ilike.%${term}%,school_id.ilike.%${term}%`)
      .limit(10);

    if (error) {
      console.error("Failed to search students:", error);
      setLookupResults([]);
      return;
    }

    setLookupResults(data ?? []);
  };

  const lookupSelect = async (student: any) => {
    setLookupSelected(student);
    setLookupResults([]);
    const { data, error } = await supabase.from("volunteer_hours").select("event, hours, served_on, department_slug").eq("student_id", student.id).order("served_on", { ascending: false });
    if (error) {
      console.error("Failed to load student history:", error);
      setLookupHistory([]);
      return;
    }
    setLookupHistory(data ?? []);
  };

  const copySelectedList = async () => {
    if (!copyOppId) return;
    setCopied(false);
    const rows = applicants[copyOppId] ?? await fetchApplicants(copyOppId);
    if (!applicants[copyOppId]) setApplicants({ ...applicants, [copyOppId]: rows });

    const opp = opps.find((o) => o.id === copyOppId);
    const selectedRows = rows.filter((a) => a.selected);
    const text = selectedRows.length
      ? `✅ Selected volunteers — ${opp?.title}\n\n` + selectedRows.map((a, i) => `${i + 1}. ${a.name}`).join("\n")
      : `No one has been marked as Selected for "${opp?.title}" yet.`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setMsg("Couldn't copy automatically — long-press the text below to copy manually.");
      setMsg(text);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-6">
        <form onSubmit={addOpportunity} className="card p-6 space-y-3">
          <h3 className="font-black uppercase text-sm">Add opportunity</h3>
          {department === "council" && (
            <select value={form.department_slug} onChange={(e) => setForm({ ...form, department_slug: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent">
              <option value="">Post as which department?</option>
              {allDepartments.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
            </select>
          )}
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <input type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <input type="number" placeholder="Slots (optional)" value={form.slots} onChange={(e) => setForm({ ...form, slots: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <input type="number" min="0" step="0.5" placeholder="Hours awarded if accepted" value={form.hours_awarded} onChange={(e) => setForm({ ...form, hours_awarded: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <button className="w-full sm:w-auto bg-blue-900 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-sm">Add</button>
        </form>

        <form onSubmit={logHours} className="card p-6 space-y-3">
          <h3 className="font-black uppercase text-sm">Log hours</h3>
          <StudentSearchPicker onSelect={(s) => setLog({ ...log, student: s })} />
          <input placeholder="Event" value={log.event} onChange={(e) => setLog({ ...log, event: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <input type="number" step="0.5" placeholder="Hours" value={log.hours} onChange={(e) => setLog({ ...log, hours: e.target.value })} className="w-full border rounded-xl px-3 py-2.5 bg-transparent" />
          <button className="w-full sm:w-auto bg-blue-900 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-sm">Log</button>
        </form>
      </div>

      {msg && <p className="text-sm text-blue-900 dark:text-blue-100 break-words whitespace-pre-wrap">{msg}</p>}
      {accessError && (
        <div className="card p-6 text-sm text-blue-700 dark:text-blue-300">
          <p className="font-black uppercase text-xs tracking-widest">Volunteer access issue</p>
          <p className="mt-2">{accessError}</p>
        </div>
      )}

      {/* copy selected volunteers to send on WhatsApp */}
      <div className="card p-6">
        <h3 className="font-black uppercase text-sm mb-4">Copy selected volunteers</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={copyOppId} onChange={(e) => setCopyOppId(e.target.value)} className="flex-1 border rounded-xl px-3 py-2.5 bg-transparent text-sm">
            <option value="">Choose an opportunity...</option>
            {opps.map((o) => <option key={o.id} value={o.id}>{o.title} — {o.event_date}</option>)}
          </select>
          <button onClick={copySelectedList} disabled={!copyOppId}
            className="bg-blue-900 text-white px-5 py-3 sm:py-2.5 rounded-xl font-bold text-sm disabled:opacity-40 whitespace-nowrap">
            {copied ? "Copied ✓" : "Copy list"}
          </button>
        </div>
        <p className="text-xs text-blue-700/60 dark:text-blue-300/60 mt-2">
          Copies a numbered list of everyone marked "Selected" for that event — paste straight into WhatsApp.
        </p>
      </div>

      <div className="card p-6">
        <h3 className="font-black uppercase text-sm mb-4">Your opportunities</h3>
        <div className="divide-y">
          {opps.map((o) => {
            const applicationCount = Array.isArray(o.applications) ? (o.applications[0]?.count ?? 0) : 0;

            return (
            <div key={o.id} className="py-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div>
                  <p className="font-bold">{o.title}</p>
                  <p className="text-xs text-blue-700/70">{o.event_date} · {o.location}</p>
                  <p className="text-xs mt-1">
                    <span className="font-bold text-blue-600">{applicationCount}</span> applied{o.slots ? ` / ${o.slots}` : ""}
                    {" · "}<span className={o.applications_open ? "text-ok" : "text-bad"}>{o.applications_open ? "Open" : "Closed"}</span>
                    {" · "}<span className="font-bold text-blue-600">{Number(o.hours_awarded ?? 0)}h</span> award
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => viewApplicants(o.id)} className="text-xs font-bold border rounded-lg px-3 py-2">
                    {openApplicants === o.id ? "Hide applicants" : "View applicants"}
                  </button>
                  <button onClick={() => toggleOpen(o)} className="text-xs font-bold border rounded-lg px-3 py-2">
                    {o.applications_open ? "Close applications" : "Reopen"}
                  </button>
                  <button onClick={() => remove(o.id)} className="text-xs font-bold text-bad px-3 py-2">Delete</button>
                </div>
              </div>

              {openApplicants === o.id && (
                <div className="mt-3 bg-blue-50/60 dark:bg-blue-900/20 rounded-xl p-4">
                  {loadingApplicants && !applicants[o.id] ? (
                    <p className="text-xs text-blue-700/70">Loading...</p>
                  ) : applicants[o.id]?.length ? (
                    <>
                      {o.slots != null && (
                        <p className="text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">
                          {applicants[o.id].filter((a) => a.selected).length} / {o.slots} selected
                        </p>
                      )}
                      <div className="overflow-x-auto -mx-4 px-4">
                        <table className="w-full text-xs min-w-[520px]">
                          <thead>
                            <tr className="text-left text-blue-700/60 dark:text-blue-300/60 uppercase tracking-widest">
                              <th className="py-1.5">Name</th><th>School ID</th><th>Class</th><th>This event</th><th>Total hours</th><th>Selected</th>
                            </tr>
                          </thead>
                          <tbody>
                            {applicants[o.id].map((a) => (
                              <tr key={a.appId} className={`border-t border-blue-100 dark:border-blue-900 ${a.selected ? "bg-ok/10 text-blue-900 dark:text-blue-100" : "text-blue-900 dark:text-blue-100"}`}>
                                <td className="py-2 font-bold text-blue-900 dark:text-blue-100">{a.name}</td>
                                <td className="text-blue-800 dark:text-blue-100">{a.school_id}</td>
                                <td className="text-blue-800 dark:text-blue-100">{a.class_name ?? "—"}</td>
                                <td className="text-blue-800 dark:text-blue-100">{a.event_hours || "—"}</td>
                                <td className="font-black text-blue-700 dark:text-blue-200">{a.total_hours}</td>
                                <td>
                                  <button onClick={() => toggleSelected(o.id, a.appId, a.selected)}
                                    className={`text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap ${a.selected ? "bg-ok text-white" : "border"}`}>
                                    {a.selected ? "✓ Selected" : "Select"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-blue-700/70">No applicants yet.</p>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-black uppercase text-sm mb-4">Look up a student</h3>
        <input placeholder="Search by name or school ID" onChange={(e) => lookupSearch(e.target.value)}
          className="w-full border rounded-xl px-3 py-2.5 bg-transparent text-blue-900 dark:text-blue-100 placeholder:text-blue-900/40 dark:placeholder:text-blue-100/40" />

        {lookupResults.length > 0 && (
          <div className="mt-2 border rounded-xl divide-y">
            {lookupResults.map((s) => (
              <button key={s.id} type="button" onClick={() => lookupSelect(s)} className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/30">
                <p className="font-bold text-sm">{s.full_name}</p>
                <p className="text-xs text-blue-700/70">{s.school_id}{s.class_name ? ` · ${s.class_name}` : ""}</p>
              </button>
            ))}
          </div>
        )}

        {lookupSelected && (
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1 mb-3">
              <div>
                <p className="font-black text-lg">{lookupSelected.full_name}</p>
                <p className="text-xs text-blue-700/70">{lookupSelected.school_id}{lookupSelected.class_name ? ` · ${lookupSelected.class_name}` : ""}</p>
              </div>
              <p className="text-sm font-bold">
                <span className="text-blue-600 text-xl">{lookupHistory.reduce((sum, h) => sum + Number(h.hours), 0)}</span> total hours
              </p>
            </div>

            {lookupHistory.length ? (
              <div className="overflow-x-auto -mx-4 px-4">
                <table className="w-full text-xs min-w-[420px]">
                  <thead>
                    <tr className="text-left text-blue-700/60 dark:text-blue-300/60 uppercase tracking-widest border-t border-blue-100 dark:border-blue-900">
                      <th className="py-1.5">Event</th><th>Date</th><th>Department</th><th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lookupHistory.map((h, i) => (
                      <tr key={i} className="border-t border-blue-100 dark:border-blue-900">
                        <td className="py-2">{h.event}</td><td className="text-blue-700/80">{h.served_on}</td>
                        <td className="text-blue-700/80">{h.department_slug}</td><td className="font-black text-blue-600">{h.hours}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-blue-700/70">No hours logged yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}