"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabaseBrowser } from "./supabase/client";

type AuthCtx = { department: string | null; loading: boolean; login: (u: string, p: string) => Promise<{ ok: boolean; department: string | null; error?: string }>; logout: () => void };
const Ctx = createContext<AuthCtx | null>(null);
const supabase = supabaseBrowser();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [department, setDepartment] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const resolve = async () => {
    setLoading(true);
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      setDepartment(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("department_members")
      .select("department_slug")
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to load department membership:", error);
      setDepartment(null);
      setLoading(false);
      return;
    }

    const dept = data?.[0]?.department_slug ?? null;
    setDepartment(dept);
    setLoading(false);
  };

  useEffect(() => {
    resolve();
    const { data: sub } = supabase.auth.onAuthStateChange(() => resolve());
    return () => sub.subscription.unsubscribe();
  }, []);

  const login = async (u: string, p: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email: `${u}@mris.internal`, password: p });
  if (error || !data.user) {
    return { ok: false, department: null, error: "Wrong username or password." };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("department_members")
    .select("department_slug")
    .eq("user_id", data.user.id);

  if (membershipError) {
    return { ok: false, department: null, error: "Restricted access is currently blocked by database permissions." };
  }

  const dept = membership?.[0]?.department_slug ?? null;
  if (!dept) {
    return { ok: false, department: null, error: "This account is not assigned to a department." };
  }

  setDepartment(dept);
  return { ok: true, department: dept };
};

  return <Ctx.Provider value={{ department, loading, login, logout: () => supabase.auth.signOut() }}>{children}</Ctx.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};