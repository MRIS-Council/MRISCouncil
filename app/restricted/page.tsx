"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function RestrictedLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(user, pass);
    if (!ok) { setError("Wrong username or password."); return; }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      setError("Your login session could not be restored.");
      return;
    }

    const { data, error } = await supabase.from("department_members").select("department_slug").eq("user_id", authUser.id);

    if (error) {
      setError("Restricted access is currently blocked by database permissions. Please check the Supabase RLS policy for department_members.");
      return;
    }

    if (!data || data.length === 0) {
      setError("This account is not assigned to a department.");
      return;
    }

    const targetDepartment = data[0]?.department_slug;
    if (!targetDepartment) {
      setError("This account does not have a department assigned.");
      return;
    }

    router.push(`/restricted/${targetDepartment}`);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="card p-7 text-center">
        <h3 className="font-black uppercase text-blue-900 dark:text-blue-100 text-lg">Restricted Area</h3>
        <p className="text-sm text-blue-700/70 dark:text-blue-300/70 mt-1 mb-6">Enter your department's credentials.</p>
        <form onSubmit={submit} className="space-y-3 text-left">
          <input placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} className="w-full px-3.5 py-3 rounded-xl border-[1.5px] border-blue-100 dark:border-blue-900 bg-transparent text-blue-900 dark:text-blue-100 placeholder:text-blue-900/40 dark:placeholder:text-blue-100/40" />
          <input placeholder="Password" type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full px-3.5 py-3 rounded-xl border-[1.5px] border-blue-100 dark:border-blue-900 bg-transparent text-blue-900 dark:text-blue-100 placeholder:text-blue-900/40 dark:placeholder:text-blue-100/40" />
          {error && <p className="text-xs text-bad">{error}</p>}
          <button className="w-full bg-blue-900 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-blue-800">Log in</button>
        </form>
      </div>
    </div>
  );
}